const tipIds = [4, 8, 12, 16, 20];
const pipIds = [3, 6, 10, 14, 18];
const mcpIds = [2, 5, 9, 13, 17];
const fingerNames = ["thumb", "index", "middle", "ring", "pinky"];

function distance(a, b) {
  if (!a || !b) return 1;
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

function palmSize(hand) {
  if (!hand?.length) return 0;
  return Math.max(0.001, (distance(hand[0], hand[5]) + distance(hand[0], hand[17]) + distance(hand[5], hand[17])) / 3);
}

function handSpan(hand) {
  if (!hand?.length) return 0;
  const xs = hand.map((point) => point.x);
  const ys = hand.map((point) => point.y);
  return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
}

function chooseHand(results) {
  const hands = [results?.rightHandLandmarks, results?.leftHandLandmarks].filter((hand) => hand?.length);
  if (!hands.length) return null;
  return hands.sort((a, b) => handSpan(b) - handSpan(a))[0];
}

function isFingerExtended(hand, fingerIndex) {
  const tip = hand?.[tipIds[fingerIndex]];
  const pip = hand?.[pipIds[fingerIndex]];
  const mcp = hand?.[mcpIds[fingerIndex]];
  const wrist = hand?.[0];
  const palm = palmSize(hand);
  if (!tip || !pip || !mcp || !wrist) return false;

  if (fingerIndex === 0) {
    const thumbOut = distance(tip, hand[9]) > distance(hand[3], hand[9]) * 1.18;
    const thumbLong = distance(tip, wrist) > distance(hand[2], wrist) * 1.15;
    return thumbOut && thumbLong;
  }

  const verticalOpen = tip.y < pip.y - palm * 0.08;
  const lengthOpen = distance(tip, wrist) > distance(pip, wrist) * 1.14;
  const jointOpen = distance(tip, mcp) > distance(pip, mcp) * 1.08;
  return (verticalOpen && jointOpen) || (lengthOpen && jointOpen);
}

function fingerPattern(hand) {
  return [0, 1, 2, 3, 4].map((index) => isFingerExtended(hand, index));
}

function countExtended(pattern) {
  return pattern.filter(Boolean).length;
}

function allBent(pattern) {
  return pattern.slice(1).every((value) => !value);
}

function only(pattern, names) {
  return fingerNames.every((name, index) => pattern[index] === names.includes(name));
}

function detectSmile(faceLandmarks) {
  if (!faceLandmarks?.[61] || !faceLandmarks?.[291] || !faceLandmarks?.[13] || !faceLandmarks?.[14]) return false;
  const mouthWidth = distance(faceLandmarks[61], faceLandmarks[291]);
  const mouthOpen = distance(faceLandmarks[13], faceLandmarks[14]);
  const leftCorner = faceLandmarks[61];
  const rightCorner = faceLandmarks[291];
  const upperLip = faceLandmarks[13];
  return mouthWidth > 0.07 && mouthOpen < 0.04 && leftCorner.y < upperLip.y + 0.035 && rightCorner.y < upperLip.y + 0.035;
}

function addCandidate(candidates, label, confidence, reason = "") {
  if (!label || confidence < 0.45) return;
  candidates.push({ label, confidence: Math.min(0.99, confidence), reason });
}

function classifyStaticLetter(hand, pattern) {
  const candidates = [];
  const palm = palmSize(hand);
  const thumbTip = hand[4];
  const indexTip = hand[8];
  const middleTip = hand[12];
  const ringTip = hand[16];
  const pinkyTip = hand[20];
  const wrist = hand[0];
  const indexMiddleGap = distance(indexTip, middleTip) / palm;
  const thumbIndexGap = distance(thumbTip, indexTip) / palm;
  const thumbMiddleGap = distance(thumbTip, middleTip) / palm;
  const pinkyWrist = distance(pinkyTip, wrist) / palm;
  const indexCurl = distance(indexTip, hand[6]) / palm;
  const horizontalIndex = Math.abs(indexTip.x - wrist.x) / palm;
  const indexLower = indexTip.y > wrist.y - palm * 0.2;

  if (allBent(pattern) && thumbIndexGap > 0.9) addCandidate(candidates, "C", 0.72, "curved hand");
  if (allBent(pattern) && pattern[0]) addCandidate(candidates, "A", 0.72, "closed fist with thumb visible");
  if (only(pattern, ["index", "middle", "ring", "pinky"])) addCandidate(candidates, "B", 0.78, "four fingers extended");
  if (only(pattern, ["index"]) && horizontalIndex > 0.9) addCandidate(candidates, "Z", 0.58, "index extended sideways");
  if (only(pattern, ["index"]) && indexCurl > 0.55) addCandidate(candidates, "D", 0.68, "index finger extended");
  if (!pattern[0] && allBent(pattern)) addCandidate(candidates, "E", 0.67, "closed hand");
  if (thumbIndexGap < 0.42 && only(pattern, ["middle", "ring", "pinky"])) addCandidate(candidates, "F", 0.82, "thumb and index touch");
  if (only(pattern, ["thumb", "index"]) && Math.abs(indexTip.y - thumbTip.y) < palm * 0.45) addCandidate(candidates, "G", 0.62, "thumb and index extended");
  if (only(pattern, ["index", "middle"]) && indexMiddleGap < 0.6) addCandidate(candidates, "H", 0.58, "two close fingers");
  if (only(pattern, ["pinky"]) && pinkyWrist > 1.85) addCandidate(candidates, "I", 0.78, "pinky extended");
  if (only(pattern, ["thumb", "index", "middle"])) addCandidate(candidates, "K", 0.58, "thumb with two fingers");
  if (only(pattern, ["thumb", "index"]) && thumbIndexGap > 1.15) addCandidate(candidates, "L", 0.75, "L shape");
  if (allBent(pattern) && thumbMiddleGap < 0.65) addCandidate(candidates, "M", 0.55, "thumb tucked near middle");
  if (allBent(pattern) && thumbIndexGap < 0.65) addCandidate(candidates, "N", 0.55, "thumb tucked near index");
  if (allBent(pattern) && thumbIndexGap < 0.95 && distance(indexTip, middleTip) / palm < 0.7) addCandidate(candidates, "O", 0.7, "rounded hand");
  if (only(pattern, ["thumb", "index", "middle"]) && indexLower) addCandidate(candidates, "P", 0.55, "downward two-finger shape");
  if (only(pattern, ["thumb", "index"]) && indexLower) addCandidate(candidates, "Q", 0.55, "downward index shape");
  if (only(pattern, ["index", "middle"]) && indexMiddleGap < 0.35) addCandidate(candidates, "R", 0.65, "crossed or close fingers");
  if (!pattern[0] && allBent(pattern)) addCandidate(candidates, "S", 0.6, "closed fist");
  if (allBent(pattern) && thumbIndexGap < 0.45) addCandidate(candidates, "T", 0.56, "thumb tucked");
  if (only(pattern, ["index", "middle"]) && indexMiddleGap < 0.5) addCandidate(candidates, "U", 0.68, "two fingers together");
  if (only(pattern, ["index", "middle"]) && indexMiddleGap >= 0.5) addCandidate(candidates, "V", 0.76, "two fingers apart");
  if (only(pattern, ["index", "middle", "ring"])) addCandidate(candidates, "W", 0.78, "three fingers extended");
  if (only(pattern, ["index"]) && indexCurl < 0.52) addCandidate(candidates, "X", 0.62, "curled index");
  if (only(pattern, ["thumb", "pinky"])) addCandidate(candidates, "Y", 0.8, "thumb and pinky extended");

  return candidates;
}

function classifyPhrase(hand, pattern, results) {
  const candidates = [];
  const palm = palmSize(hand);
  const extended = countExtended(pattern);
  const indexMiddleGap = distance(hand[8], hand[12]) / palm;
  const wrist = hand[0];
  const face = results?.faceLandmarks ?? [];
  const mouth = face[13] && face[14] ? { x: (face[13].x + face[14].x) / 2, y: (face[13].y + face[14].y) / 2, z: 0 } : null;
  const handNearMouth = mouth && [hand[0], hand[8], hand[12]].some((point) => distance(point, mouth) < palm * 1.15);

  if (extended >= 4 && handSpan(hand) > palm * 1.6) addCandidate(candidates, "Hello", 0.78, "open hand");
  if (only(pattern, ["index", "middle"]) && handNearMouth) addCandidate(candidates, "Thank You", 0.82, "two fingers near mouth");
  if (only(pattern, ["thumb"])) addCandidate(candidates, "Yes", 0.72, "thumb-only fist");
  if (only(pattern, ["index", "middle", "ring", "pinky"]) && indexMiddleGap > 0.75) addCandidate(candidates, "No", 0.62, "open fingers spread");
  if (only(pattern, ["index"]) && distance(hand[8], wrist) / palm < 1.65) addCandidate(candidates, "I/Me", 0.6, "index points inward");
  if (only(pattern, ["thumb", "pinky"])) addCandidate(candidates, "Family", 0.58, "thumb and pinky extended");

  return candidates;
}

export function classifyGesture(results, mode = "words") {
  const hand = chooseHand(results);
  if (!hand) return { text: "", rawText: "", confidence: 0, happy: false, reason: "No hand detected" };

  const pattern = fingerPattern(hand);
  const happy = detectSmile(results?.faceLandmarks);
  const phraseCandidates = mode !== "alphabet" ? classifyPhrase(hand, pattern, results) : [];
  const letterCandidates = mode !== "words" ? classifyStaticLetter(hand, pattern) : [];
  const candidates = [...phraseCandidates, ...letterCandidates];
  const best = candidates.sort((a, b) => b.confidence - a.confidence)[0];

  if (!best) {
    return { text: "", rawText: "", confidence: 0, happy, reason: `Hand seen, unclear shape: ${pattern.map(Number).join("")}` };
  }

  const text = `${best.label}${happy ? " (Happy Tone)" : ""}`;
  return {
    text,
    rawText: best.label,
    confidence: best.confidence,
    happy,
    pattern,
    reason: best.reason
  };
}
