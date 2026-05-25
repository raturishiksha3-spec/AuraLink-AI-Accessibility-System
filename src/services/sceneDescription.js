const PROMPT = "Describe this scene in 3-4 descriptive lines focusing on human actions like drinking, sitting, or studying.";
let objectDetectorPromise = null;

function dataUrlToBase64(dataUrl) {
  return dataUrl.split(",")[1] ?? "";
}

function distance(a, b) {
  if (!a || !b) return 1;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function average(points) {
  const visible = points.filter(Boolean);
  if (!visible.length) return null;
  return {
    x: visible.reduce((sum, point) => sum + point.x, 0) / visible.length,
    y: visible.reduce((sum, point) => sum + point.y, 0) / visible.length
  };
}

function angle(a, b, c) {
  if (!a || !b || !c) return 180;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const abLength = Math.hypot(ab.x, ab.y);
  const cbLength = Math.hypot(cb.x, cb.y);
  if (!abLength || !cbLength) return 180;
  return Math.acos(Math.max(-1, Math.min(1, dot / (abLength * cbLength)))) * (180 / Math.PI);
}

function objectLocation(box) {
  if (!box) return "in view";
  const centerX = (box.xmin + box.xmax) / 2;
  const centerY = (box.ymin + box.ymax) / 2;
  const horizontal = centerX < 0.33 ? "left" : centerX > 0.67 ? "right" : "center";
  const vertical = centerY < 0.33 ? "upper" : centerY > 0.67 ? "lower" : "middle";
  return `${vertical} ${horizontal}`;
}

function pluralize(label, count) {
  if (count === 1) return label;
  if (label.endsWith("s")) return label;
  return `${label}s`;
}

function summarizeObjects(detections) {
  if (!detections.length) return "No common objects were confidently detected in the frame.";
  const counts = detections.reduce((map, item) => {
    map[item.label] = (map[item.label] ?? 0) + 1;
    return map;
  }, {});
  const countText = Object.entries(counts)
    .slice(0, 8)
    .map(([label, count]) => `${count} ${pluralize(label, count)}`)
    .join(", ");
  const located = detections
    .slice(0, 5)
    .map((item) => `${item.label} at the ${objectLocation(item.box)}`)
    .join("; ");
  return `Detected objects include ${countText}. Main positions: ${located}.`;
}

function inferActions(results, detections) {
  const pose = results?.poseLandmarks ?? [];
  const face = results?.faceLandmarks ?? [];
  const leftHand = results?.leftHandLandmarks ?? [];
  const rightHand = results?.rightHandLandmarks ?? [];
  const labels = detections.map((item) => item.label);

  const shoulders = average([pose[11], pose[12]]);
  const hips = average([pose[23], pose[24]]);
  const knees = average([pose[25], pose[26]]);
  const ankles = average([pose[27], pose[28]]);
  const wrists = [pose[15], pose[16], leftHand[0], rightHand[0]].filter(Boolean);
  const mouth = average([face[13], face[14], pose[0]]);
  const personVisible = labels.includes("person") || pose.length > 12 || face.length > 100 || leftHand.length || rightHand.length;
  const actions = [];

  if (!personVisible) return ["No clear person is visible, so the description focuses on detected objects."];

  const handNearMouth = wrists.some((wrist) => distance(wrist, mouth) < 0.13);
  const raisedHand = shoulders && wrists.some((wrist) => wrist.y < shoulders.y - 0.08);
  const handsTogether = wrists.length >= 2 && distance(wrists[0], wrists[1]) < 0.13;
  const leftKneeAngle = angle(pose[23], pose[25], pose[27]);
  const rightKneeAngle = angle(pose[24], pose[26], pose[28]);
  const bentKnees = Math.min(leftKneeAngle, rightKneeAngle) < 145;
  const tallPosture = shoulders && ankles && Math.abs(ankles.y - shoulders.y) > 0.48;
  const headLowered = shoulders && pose[0] && pose[0].y > shoulders.y - 0.13;
  const handsLow = shoulders && wrists.some((wrist) => wrist.y > shoulders.y + 0.18);
  const drinkNearby = labels.some((label) => ["cup", "bottle", "wine glass"].includes(label));
  const workNearby = labels.some((label) => ["laptop", "keyboard", "mouse", "cell phone", "book"].includes(label));
  const chairNearby = labels.includes("chair") || labels.includes("couch");

  if (handNearMouth && drinkNearby) actions.push("The person may be drinking because a hand is near the mouth and a cup or bottle is visible.");
  else if (handNearMouth) actions.push("A hand is close to the mouth, which may indicate eating, drinking, or speaking.");
  if (workNearby && (headLowered || handsLow)) actions.push("The person may be studying or working because a device or book is visible and the posture is focused downward.");
  if (raisedHand) actions.push("A hand is raised above shoulder level, which can look like waving or asking for attention.");
  if (bentKnees && hips && knees) actions.push(`The body posture suggests the person may be sitting${chairNearby ? " near a chair or seat" : " or crouching"}.`);
  if (!bentKnees && tallPosture) actions.push("The person appears upright, likely standing.");
  if (handsTogether) actions.push("The hands are close together, suggesting typing, holding an object, or focused hand activity.");

  return actions.length ? actions : ["A person is visible, but no strong action cue is detected."];
}

async function analyzeFrameLight(frameDataUrl) {
  if (!frameDataUrl) return "unknown";
  const image = new Image();
  image.src = frameDataUrl;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 24;
  canvas.height = 24;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let brightness = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    brightness += (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
  }
  brightness = Math.round(brightness / (pixels.length / 4));
  if (brightness > 170) return "bright";
  if (brightness > 80) return "moderately lit";
  return "dim";
}

async function detectObjects(frameDataUrl) {
  if (!objectDetectorPromise) {
    const { pipeline, env } = await import("@xenova/transformers");
    env.allowLocalModels = false;
    objectDetectorPromise = pipeline("object-detection", "Xenova/detr-resnet-50");
  }
  const detector = await objectDetectorPromise;
  const rawDetections = await detector(frameDataUrl, { threshold: 0.62, percentage: true });
  return rawDetections
    .map((item) => ({
      label: item.label,
      score: Math.round(item.score * 100),
      box: item.box
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

export async function describeWithGemini(frameDataUrl, apiKey) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType: "image/jpeg", data: dataUrlToBase64(frameDataUrl) } }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 220
      }
    })
  });

  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
  const data = await response.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n").trim() || "No description returned.",
    detections: []
  };
}

export async function describeLocally(frameDataUrl, results) {
  const [light, detections] = await Promise.all([analyzeFrameLight(frameDataUrl), detectObjects(frameDataUrl)]);
  const actions = inferActions(results, detections);
  const objectSummary = summarizeObjects(detections);
  const personDetected = detections.some((item) => item.label === "person") || (results?.poseLandmarks?.length ?? 0) > 12;

  return {
    detections,
    text: [
      `${personDetected ? "A person is visible" : "The scene is visible"} in a ${light} frame.`,
      objectSummary,
      actions[0],
      actions[1] ?? "The main visible elements appear steady in the camera view."
    ].join("\n")
  };
}

export async function describeScene(frameDataUrl, { apiKey = "", results = null } = {}) {
  if (!frameDataUrl) throw new Error("Capture a camera frame before requesting a description.");
  if (apiKey.trim()) return describeWithGemini(frameDataUrl, apiKey.trim());
  return describeLocally(frameDataUrl, results);
}

export { PROMPT as SCENE_PROMPT };
