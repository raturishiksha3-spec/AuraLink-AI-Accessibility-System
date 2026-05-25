import React, { useState } from "react";
import { motion } from "framer-motion";
import AccessibleButton from "./common/AccessibleButton.jsx";

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.includes("@")) {
      setError("Enter your name and a valid email address.");
      return;
    }
    onLogin({ name: name.trim(), email: email.trim() });
  };

  return (
    <section className="aurora-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24" aria-labelledby="login-title">
      <div className="absolute left-[-7rem] top-20 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
      <div className="absolute bottom-8 right-[-6rem] h-96 w-96 rounded-full bg-coral/20 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/70 to-transparent" />
      <motion.form
        onSubmit={submit}
        className="glass-panel relative w-full max-w-md rounded-2xl p-8"
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <span className="brand-mark" aria-hidden="true">AL</span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal">AuraLink</p>
            <p className="text-xs font-bold text-slate-500">Accessibility Bridge</p>
          </div>
        </div>
        <h1 id="login-title" className="mt-3 text-4xl font-black tracking-normal text-ink">
          Multimodal Accessibility Bridge
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-700">
          Sign in to open sign-to-speech, scene description, and safe-space communication tools.
        </p>

        <div className="mt-8 space-y-4">
          <label className="block" htmlFor="name">
            <span className="text-sm font-bold text-slate-800">Name</span>
            <input
              id="name"
              name="name"
              aria-label="Your name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="focus-ring soft-input mt-2 w-full rounded-lg px-4 py-3 text-base text-ink outline-none"
              placeholder="Your name"
            />
          </label>
          <label className="block" htmlFor="email">
            <span className="text-sm font-bold text-slate-800">Email</span>
            <input
              id="email"
              name="email"
              type="email"
              aria-label="Email address"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring soft-input mt-2 w-full rounded-lg px-4 py-3 text-base text-ink outline-none"
              placeholder="name@example.com"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">
            {error}
          </p>
        )}

        <AccessibleButton className="gradient-button mt-6 w-full justify-center" ariaLabel="Continue to disability selection">
          Continue
        </AccessibleButton>
      </motion.form>
    </section>
  );
}
