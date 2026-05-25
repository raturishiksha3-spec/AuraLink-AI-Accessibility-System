import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMediaPipeHolistic } from "../hooks/useMediaPipeHolistic.js";
import { classifyGesture } from "../utils/gestureClassifier.js";
import { useTts } from "../context/TtsContext.jsx";
import AccessibleButton from "./common/AccessibleButton.jsx";

export default function SignToSpeech() {
  const { videoRef, canvasRef, results, status, error } = useMediaPipeHolistic({ enabled: true });
  const { speak } = useTts();
  const [phrase, setPhrase] = useState("");
  const [history, setHistory] = useState([]);
  const [recognitionMode, setRecognitionMode] = useState("words");
  const [stableSign, setStableSign] = useState({ text: "", confidence: 0, reason: "Waiting for hand" });
  const lastSpoken = useRef("");
  const lastTime = useRef(0);
  const frameBuffer = useRef([]);

  const detected = useMemo(() => classifyGesture(results, recognitionMode), [results, recognitionMode]);

  useEffect(() => {
    frameBuffer.current = [];
    setStableSign({ text: "", confidence: 0, reason: "Hold one sign steady" });
  }, [recognitionMode]);

  useEffect(() => {
    const buffer = frameBuffer.current;
    buffer.push(detected);
    if (buffer.length > 14) buffer.shift();

    const usable = buffer.filter((item) => item.rawText && item.confidence >= 0.58);
    if (!usable.length) {
      setStableSign({ text: "", confidence: 0, reason: detected.reason || "Hold your hand inside the frame" });
      return;
    }

    const counts = usable.reduce((map, item) => {
      const current = map.get(item.rawText) ?? { count: 0, confidence: 0, latest: item };
      current.count += 1;
      current.confidence += item.confidence;
      current.latest = item;
      map.set(item.rawText, current);
      return map;
    }, new Map());

    const [rawText, winner] = [...counts.entries()].sort((a, b) => b[1].count - a[1].count || b[1].confidence - a[1].confidence)[0];
    const averageConfidence = winner.confidence / winner.count;
    const isStable = winner.count >= 7 && averageConfidence >= 0.62;
    const text = winner.latest.happy ? `${rawText} (Happy Tone)` : rawText;
    setStableSign({ text, confidence: Math.round(averageConfidence * 100), reason: winner.latest.reason });

    if (!isStable) return;
    const now = Date.now();
    if (text === lastSpoken.current && now - lastTime.current < 2400) return;
    lastSpoken.current = text;
    lastTime.current = now;
    setPhrase((value) => `${value}${value ? " " : ""}${text}`);
    setHistory((items) => [text, ...items].slice(0, 8));
    speak(text);
  }, [detected, speak]);

  return (
    <section aria-labelledby="sign-title">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="surface-panel rounded-2xl p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="sign-title" className="text-2xl font-black tracking-normal">Sign-to-Speech Engine</h2>
              <p className="mt-1 text-sm text-slate-600">Camera tracking uses MediaPipe Holistic hand and face landmarks.</p>
            </div>
            <span className="status-pill rounded-md px-3 py-2 text-sm font-bold" role="status" aria-live="polite">
              {status}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Recognition mode">
            <AccessibleButton
              type="button"
              onClick={() => setRecognitionMode("words")}
              ariaLabel="Recognize common sign words"
              className={recognitionMode === "words" ? "bg-ink text-white" : "bg-slate-100 text-ink"}
            >
              Words
            </AccessibleButton>
            <AccessibleButton
              type="button"
              onClick={() => setRecognitionMode("alphabet")}
              ariaLabel="Recognize alphabet letters"
              className={recognitionMode === "alphabet" ? "bg-ink text-white" : "bg-slate-100 text-ink"}
            >
              Alphabet
            </AccessibleButton>
            <AccessibleButton
              type="button"
              onClick={() => setRecognitionMode("mixed")}
              ariaLabel="Recognize both words and alphabet letters"
              className={recognitionMode === "mixed" ? "bg-ink text-white" : "bg-slate-100 text-ink"}
            >
              Mixed
            </AccessibleButton>
          </div>
          {error && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-bold text-red-800" role="alert">{error}</p>}
          <div className="camera-frame mt-4 aspect-video overflow-hidden rounded-xl">
            <video ref={videoRef} className="hidden" playsInline muted aria-label="Camera input for sign recognition" />
            <canvas ref={canvasRef} className="h-full w-full object-cover" aria-label="Camera preview with tracked landmarks" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="Current sign recognition status">
            <div className="metric-card rounded-xl p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Current</p>
              <p className="mt-1 text-lg font-black text-ink" aria-live="polite">{stableSign.text || "Unclear"}</p>
            </div>
            <div className="metric-card rounded-xl p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Confidence</p>
              <p className="mt-1 text-lg font-black text-ink">{stableSign.confidence}%</p>
            </div>
            <div className="metric-card rounded-xl p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Tip</p>
              <p className="mt-1 text-sm font-bold text-slate-700">{stableSign.reason}</p>
            </div>
          </div>
        </div>

        <aside className="surface-panel rounded-2xl p-5" aria-label="Recognized speech output">
          <h3 className="text-xl font-black tracking-normal">Recognized Output</h3>
          <div className="mt-4 min-h-32 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-xl font-bold leading-9" aria-live="polite">
            {phrase || "Waiting for a clear sign..."}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AccessibleButton type="button" onClick={() => speak(phrase)} ariaLabel="Speak recognized phrase" className="bg-teal text-white">
              Speak
            </AccessibleButton>
            <AccessibleButton type="button" onClick={() => setPhrase("")} ariaLabel="Clear recognized phrase" className="bg-slate-100 text-ink">
              Clear
            </AccessibleButton>
          </div>
          <h4 className="mt-6 text-sm font-black uppercase tracking-[0.14em] text-slate-500">Recent signs</h4>
          <ul className="mt-3 space-y-2" aria-label="Recent recognized signs">
            {history.map((item, index) => (
              <li key={`${item}-${index}`} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
