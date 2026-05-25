import React, { useEffect, useMemo, useState } from "react";
import SignToSpeech from "./SignToSpeech.jsx";
import SceneDescriber from "./SceneDescriber.jsx";
import SafeSpace from "./SafeSpace.jsx";
import AccessibleButton from "./common/AccessibleButton.jsx";

const modules = [
  { id: "sign", label: "Sign to Speech", symbol: "SIGN", caption: "Hand landmarks to voice" },
  { id: "scene", label: "Scene Describer", symbol: "VIEW", caption: "Objects and actions" },
  { id: "safe", label: "Safe Space", symbol: "TEXT", caption: "Tone and simplification" }
];

export default function Dashboard({ user, profile, onSwitchProfile }) {
  const initialModule = profile.id === "visual" ? "scene" : profile.id === "neurodivergent" ? "safe" : "sign";
  const [activeModule, setActiveModule] = useState(initialModule);

  const title = useMemo(() => modules.find((module) => module.id === activeModule)?.label ?? "Dashboard", [activeModule]);

  useEffect(() => {
    setActiveModule(initialModule);
  }, [initialModule]);

  return (
    <section className="mesh-bg min-h-screen" aria-labelledby="dashboard-title">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="dark-panel border-b border-white/10 px-4 py-5 text-white lg:w-80 lg:border-b-0 lg:border-r" aria-label="AuraLink dashboard navigation">
          <div className="pr-28 lg:pr-0">
            <div className="flex items-center gap-3">
              <span className="brand-mark" aria-hidden="true">AL</span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-100">AuraLink</p>
                <p className="text-xs font-bold text-white/60">Live accessibility bridge</p>
              </div>
            </div>
            <h1 id="dashboard-title" className="mt-6 text-3xl font-black tracking-normal text-white">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/68">
              {user.name} / {profile.title} focus
            </p>
          </div>
          <nav className="mt-6 grid gap-2" aria-label="Module switcher">
            {modules.map((module) => (
              <AccessibleButton
                key={module.id}
                type="button"
                onClick={() => setActiveModule(module.id)}
                ariaLabel={`Open ${module.label} module`}
                className={`w-full justify-start gap-3 ${
                  activeModule === module.id ? "bg-white text-ink shadow-xl" : "bg-white/10 text-white hover:bg-white/16"
                }`}
              >
                <span aria-hidden="true" className={`grid h-10 min-w-12 place-items-center rounded-md text-[0.65rem] font-black uppercase tracking-wide ${
                  activeModule === module.id ? "bg-teal/12 text-teal" : "bg-white/12 text-white"
                }`}>
                  {module.symbol}
                </span>
                <span className="text-left">
                  <span className="block">{module.label}</span>
                  <span className={`block text-xs font-bold ${activeModule === module.id ? "text-slate-500" : "text-white/55"}`}>{module.caption}</span>
                </span>
              </AccessibleButton>
            ))}
          </nav>
          <AccessibleButton
            type="button"
            onClick={onSwitchProfile}
            ariaLabel="Return to disability selection"
            className="mt-6 w-full justify-center border border-white/20 bg-white/10 text-white hover:bg-white/16"
          >
            Change Focus
          </AccessibleButton>
        </aside>

        <div className="flex-1 p-4 pt-28 sm:p-6 sm:pt-28 lg:p-8 lg:pt-8">
          {activeModule === "sign" && <SignToSpeech />}
          {activeModule === "scene" && <SceneDescriber />}
          {activeModule === "safe" && <SafeSpace />}
        </div>
      </div>
    </section>
  );
}
