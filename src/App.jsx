import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./components/LoginPage.jsx";
import DisabilitySelection from "./components/DisabilitySelection.jsx";
import Dashboard from "./components/Dashboard.jsx";
import TtsToggle from "./components/TtsToggle.jsx";
import { TtsProvider } from "./context/TtsContext.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const appState = useMemo(() => {
    if (!user) return "login";
    if (!profile) return "selection";
    return "dashboard";
  }, [user, profile]);

  return (
    <TtsProvider>
      <div className="min-h-screen bg-mist text-ink">
        <TtsToggle />
        <AnimatePresence mode="wait">
          {appState === "login" && (
            <motion.main
              key="login"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28 }}
            >
              <LoginPage onLogin={setUser} />
            </motion.main>
          )}
          {appState === "selection" && (
            <motion.main
              key="selection"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28 }}
            >
              <DisabilitySelection user={user} onSelect={setProfile} />
            </motion.main>
          )}
          {appState === "dashboard" && (
            <motion.main
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <Dashboard user={user} profile={profile} onSwitchProfile={() => setProfile(null)} />
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </TtsProvider>
  );
}
