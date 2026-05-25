import React, { useState } from "react";
import { useMediaPipeHolistic } from "../hooks/useMediaPipeHolistic.js";
import { describeScene, SCENE_PROMPT } from "../services/sceneDescription.js";
import { useTts } from "../context/TtsContext.jsx";
import AccessibleButton from "./common/AccessibleButton.jsx";

export default function SceneDescriber() {
  const { videoRef, canvasRef, captureFrame, results, status, error } = useMediaPipeHolistic({ enabled: true });
  const { speak } = useTts();
  const [apiKey, setApiKey] = useState("");
  const [description, setDescription] = useState("");
  const [detections, setDetections] = useState([]);
  const [busy, setBusy] = useState(false);
  const [sceneError, setSceneError] = useState("");

  const handleDescribe = async () => {
    setBusy(true);
    setSceneError("");
    try {
      const scene = await describeScene(captureFrame(), { apiKey, results });
      setDescription(scene.text);
      setDetections(scene.detections ?? []);
      speak(scene.text);
    } catch (caughtError) {
      setSceneError(caughtError instanceof Error ? caughtError.message : "Unable to describe the scene.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]" aria-labelledby="scene-title">
      <div className="surface-panel rounded-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="scene-title" className="text-2xl font-black tracking-normal">Scene Describer</h2>
            <p className="mt-1 text-sm text-slate-600">Detect people, objects, and actions locally without needing a Gemini key.</p>
          </div>
          <span className="status-pill rounded-md px-3 py-2 text-sm font-bold" role="status" aria-live="polite">
            {status}
          </span>
        </div>
        {(error || sceneError) && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-800" role="alert">{error || sceneError}</p>}
        <div className="camera-frame mt-4 aspect-video overflow-hidden rounded-xl">
          <video ref={videoRef} className="hidden" playsInline muted aria-label="Camera input for scene description" />
          <canvas ref={canvasRef} className="h-full w-full object-cover" aria-label="Camera preview for scene description" />
        </div>
      </div>

      <aside className="surface-panel rounded-2xl p-5">
        <label className="block text-sm font-black text-slate-800" htmlFor="gemini-key">
          Gemini API key, optional
        </label>
        <input
          id="gemini-key"
          type="password"
          aria-label="Optional Gemini API key for richer scene description"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          className="focus-ring soft-input mt-2 w-full rounded-lg px-3 py-3 outline-none"
          placeholder="Leave empty for local mode"
        />
        <p className="mt-3 rounded-md border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          Local mode uses object detection plus body, hand, and face landmarks. Prompt target: {SCENE_PROMPT}
        </p>
        <AccessibleButton
          type="button"
          onClick={handleDescribe}
          disabled={busy}
          ariaLabel="Describe the current camera scene"
          className="mt-4 w-full justify-center bg-teal text-white"
        >
          {busy ? "Loading local model..." : "Describe Scene"}
        </AccessibleButton>
        <div className="mt-5 min-h-44 whitespace-pre-line rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-base leading-7" aria-live="polite">
          {description || "A description will appear here after capture."}
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-3" aria-label="Detected object list">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Objects</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {detections.length ? (
              detections.map((item, index) => (
                <li key={`${item.label}-${index}`} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                  {item.label} {item.score}%
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-600">No object scan yet.</li>
            )}
          </ul>
        </div>
      </aside>
    </section>
  );
}
