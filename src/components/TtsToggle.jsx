import React from "react";
import { useTts } from "../context/TtsContext.jsx";

export default function TtsToggle() {
  const { enabled, setEnabled, rate, setRate } = useTts();

  const toggle = () => setEnabled((value) => !value);
  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <aside className="glass-panel fixed right-4 top-4 z-50 rounded-2xl p-3" aria-label="Global text to speech controls">
      <button
        type="button"
        onClick={toggle}
        onKeyDown={onKeyDown}
        aria-pressed={enabled}
        aria-label={`Turn text to speech ${enabled ? "off" : "on"}`}
        className="focus-ring gradient-button flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
      >
        <span aria-hidden="true" className="rounded bg-white/16 px-2 py-1 text-[0.65rem] font-black tracking-wide">
          {enabled ? "ON" : "OFF"}
        </span>
        TTS
      </button>
      <label className="mt-2 block text-xs font-semibold text-slate-700" htmlFor="tts-rate">
        Voice speed
      </label>
      <input
        id="tts-rate"
        aria-label="Text to speech voice speed"
        type="range"
        min="0.6"
        max="1.3"
        step="0.05"
        value={rate}
        onChange={(event) => setRate(Number(event.target.value))}
        className="w-32 accent-teal"
      />
    </aside>
  );
}
