import React, { useMemo, useState } from "react";
import { analyzeTone, simplifyText } from "../utils/toneAnalysis.js";
import { useTts } from "../context/TtsContext.jsx";
import AccessibleButton from "./common/AccessibleButton.jsx";

function Meter({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200" aria-label={`${label} score ${value} percent`} role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
        <div className={`h-full ${value > 55 ? "bg-coral" : value > 30 ? "bg-amber" : "bg-teal"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function SafeSpace() {
  const [input, setInput] = useState("");
  const [simple, setSimple] = useState("");
  const { speak } = useTts();
  const analysis = useMemo(() => analyzeTone(input), [input]);

  const simplify = () => {
    const next = simplifyText(input);
    setSimple(next);
    speak(next);
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]" aria-labelledby="safe-title">
      <div className="surface-panel rounded-2xl p-5">
        <h2 id="safe-title" className="text-2xl font-black tracking-normal">Safe Space Tone Filter</h2>
        <p className="mt-1 text-sm text-slate-600">Analyze toxicity and sarcasm, then convert text into literal wording.</p>
        <label className="mt-5 block text-sm font-black text-slate-800" htmlFor="safe-input">
          Text to check
        </label>
        <textarea
          id="safe-input"
          aria-label="Safe Space text area"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="focus-ring soft-input mt-2 min-h-72 w-full resize-y rounded-xl p-4 text-lg leading-8 outline-none"
          placeholder="Paste or type a message here."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <AccessibleButton type="button" onClick={simplify} ariaLabel="Simplify text into literal easy to understand language" className="bg-teal text-white">
            Simplify
          </AccessibleButton>
          <AccessibleButton type="button" onClick={() => speak(input)} ariaLabel="Speak original text" className="bg-slate-100 text-ink">
            Speak Original
          </AccessibleButton>
          <AccessibleButton type="button" onClick={() => { setInput(""); setSimple(""); }} ariaLabel="Clear Safe Space text" className="bg-slate-100 text-ink">
            Clear
          </AccessibleButton>
        </div>
        <div className="mt-5 min-h-36 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-lg leading-8" aria-live="polite">
          {simple || "Simplified text will appear here."}
        </div>
      </div>

      <aside className="surface-panel rounded-2xl p-5" aria-label="Tone analysis results">
        <h3 className="text-xl font-black tracking-normal">Tone Analysis</h3>
        <p className="status-pill mt-3 rounded-md p-3 text-base font-bold" role="status" aria-live="polite">
          {analysis.label}
        </p>
        <div className="mt-5 space-y-5">
          <Meter label="Toxicity" value={analysis.toxicity} />
          <Meter label="Sarcasm" value={analysis.sarcasm} />
        </div>
        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <p><strong>Risk areas:</strong> {analysis.categories.join(", ") || "None detected"}</p>
          <p><strong>Harm signals:</strong> {analysis.toxicityHits.join(", ") || "None detected"}</p>
          <p><strong>Sarcasm signals:</strong> {analysis.sarcasmHits.join(", ") || "None detected"}</p>
          {analysis.highRisk && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 font-bold text-red-800" role="alert">
              This message includes high-risk harm language. Consider pausing and getting immediate support if anyone may be unsafe.
            </p>
          )}
        </div>
      </aside>
    </section>
  );
}
