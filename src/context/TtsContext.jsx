import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const TtsContext = createContext(null);

export function TtsProvider({ children }) {
  const [enabled, setEnabled] = useState(true);
  const [rate, setRate] = useState(0.95);

  const speak = useCallback(
    (text, options = {}) => {
      if (!enabled || !text || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? rate;
      utterance.pitch = options.pitch ?? (text.includes("Happy Tone") ? 1.18 : 1);
      utterance.volume = options.volume ?? 1;
      window.speechSynthesis.speak(utterance);
    },
    [enabled, rate]
  );

  const value = useMemo(() => ({ enabled, setEnabled, speak, rate, setRate }), [enabled, speak, rate]);
  return <TtsContext.Provider value={value}>{children}</TtsContext.Provider>;
}

export function useTts() {
  const value = useContext(TtsContext);
  if (!value) throw new Error("useTts must be used inside TtsProvider");
  return value;
}
