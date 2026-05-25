import React from "react";
import { motion } from "framer-motion";
import AccessibleButton from "./common/AccessibleButton.jsx";

const options = [
  {
    id: "hearing",
    title: "Hearing",
    symbol: "SIGN",
    text: "Prioritize sign-to-speech, captions, clear status labels, and visible alerts.",
    className: "from-teal to-ink"
  },
  {
    id: "visual",
    title: "Visual",
    symbol: "VIEW",
    text: "Prioritize spoken scene descriptions, high contrast, and large readable controls.",
    className: "from-ink to-teal"
  },
  {
    id: "neurodivergent",
    title: "Neurodivergent",
    symbol: "TEXT",
    text: "Prioritize literal language, tone detection, simpler wording, and calm layouts.",
    className: "from-coral to-ink"
  }
];

export default function DisabilitySelection({ user, onSelect }) {
  return (
    <section className="aurora-bg min-h-screen px-4 py-24" aria-labelledby="selection-title">
      <div className="mx-auto max-w-6xl">
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal">Welcome, {user.name}</p>
          <h1 id="selection-title" className="mt-3 max-w-3xl text-4xl font-black tracking-normal sm:text-5xl">
            Choose your first accessibility focus.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
            Every AuraLink module stays available. This choice simply opens the dashboard in the mode that fits you best.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3" role="list" aria-label="Disability focus choices">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              role="listitem"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group relative min-h-[23rem] overflow-hidden rounded-2xl border border-white/70 bg-white p-1 shadow-glass"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${option.className} opacity-95`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.28),transparent_28%)]" />
              <div className="relative flex h-full flex-col rounded-[0.9rem] p-6 text-white">
                <div className="grid h-16 w-16 place-items-center rounded-xl border border-white/30 bg-white/18 text-xs font-black tracking-[0.18em]">
                  {option.symbol}
                </div>
                <h2 className="mt-7 text-3xl font-black tracking-normal">{option.title}</h2>
                <p className="mt-4 flex-1 text-lg leading-8 text-white/92">{option.text}</p>
                <AccessibleButton
                  type="button"
                  onClick={() => onSelect(option)}
                  className="mt-8 w-full justify-center bg-white text-ink shadow-lg"
                  ariaLabel={`Select ${option.title} accessibility focus`}
                >
                  Select {option.title}
                </AccessibleButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
