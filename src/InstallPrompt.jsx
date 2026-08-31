import { useState, useEffect } from "react";

const T = {
  bg: "#0A0C10",
  surface: "#111318",
  card: "#161A22",
  border: "#1E2330",
  teal: "#00E5C8",
  textPrimary: "#F0F4FF",
  textSecondary: "#6B7A99",
  textMuted: "#3A4259"
};

const DISMISS_KEY = "nv_install_dismissed_until";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports as Mac but has touch
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function snoozed() {
  try {
    const until = localStorage.getItem(DISMISS_KEY);
    return until && Date.now() < Number(until);
  } catch {
    return false;
  }
}

function snooze(days = 14) {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + days * 864e5));
  } catch {
    /* storage unavailable — prompt reappears next session, acceptable */
  }
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (isStandalone() || snoozed()) return;

    // Chrome, Edge, Samsung Internet, Android
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };

    // Safari never fires beforeinstallprompt, so surface manual instructions.
    if (isIOS()) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => setVisible(false));

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = async () => {
    if (!deferred) {
      setShowIOSHelp(true);
      return;
    }
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    } else {
      snooze(7);
      setVisible(false);
    }
    setDeferred(null);
  };

  const dismiss = () => {
    snooze(14);
    setVisible(false);
    setShowIOSHelp(false);
  };

  if (!visible) return null;

  if (showIOSHelp || (isIOS() && !deferred)) {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && dismiss()}>
        <div style={sheet}>
          <div style={handle} />
          <div style={{ padding: "8px 22px 28px" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📲</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, marginBottom: 6 }}>
              Add to Home Screen
            </div>
            <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, margin: "0 0 20px" }}>
              Install NutriVision for full-screen use and faster access.
            </p>

            {[
              ["1", "Tap the Share button at the bottom of Safari", "⬆️"],
              ["2", "Scroll and choose “Add to Home Screen”", "➕"],
              ["3", "Tap “Add” in the top right", "✓"]
            ].map(([n, text, icon]) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 8
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: `${T.teal}20`,
                    color: T.teal,
                    fontSize: 12,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  {n}
                </div>
                <span style={{ flex: 1, fontSize: 13, color: T.textPrimary, lineHeight: 1.4 }}>
                  {text}
                </span>
                <span style={{ fontSize: 16 }}>{icon}</span>
              </div>
            ))}

            <button onClick={dismiss} style={ghostBtn}>
              Maybe later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={banner}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src="/icon-192.png"
          alt=""
          width={44}
          height={44}
          style={{ borderRadius: 11, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: T.textPrimary }}>
            Install NutriVision
          </div>
          <div style={{ fontSize: 11.5, color: T.textSecondary, marginTop: 1 }}>
            Home screen access, full screen, works offline
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={dismiss} style={{ ...ghostBtn, flex: 1, marginTop: 0 }}>
          Not now
        </button>
        <button onClick={install} style={primaryBtn}>
          Install
        </button>
      </div>
    </div>
  );
}

/** Banner shown when a new service worker is waiting. */
export function UpdateBanner() {
  const [waiting, setWaiting] = useState(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) setWaiting(reg.waiting);

      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(nw);
          }
        });
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  if (!waiting) return null;

  return (
    <div style={{ ...banner, bottom: "auto", top: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>
        A new version is available
      </div>
      <button
        onClick={() => waiting.postMessage("SKIP_WAITING")}
        style={{ ...primaryBtn, width: "100%", marginTop: 10 }}
      >
        Reload to update
      </button>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.82)",
  zIndex: 400,
  display: "flex",
  alignItems: "flex-end",
  backdropFilter: "blur(4px)"
};

const sheet = {
  background: T.surface,
  borderRadius: "22px 22px 0 0",
  width: "100%",
  maxWidth: 430,
  margin: "0 auto",
  border: `1px solid ${T.border}`,
  borderBottom: "none"
};

const handle = {
  width: 36,
  height: 4,
  borderRadius: 2,
  background: T.border,
  margin: "12px auto 6px"
};

const banner = {
  position: "fixed",
  bottom: 12,
  left: 12,
  right: 12,
  maxWidth: 406,
  margin: "0 auto",
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 16,
  padding: "14px 16px",
  zIndex: 300,
  boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
};

const primaryBtn = {
  flex: 1,
  background: T.teal,
  border: "none",
  borderRadius: 10,
  color: T.bg,
  fontSize: 13,
  fontWeight: 800,
  padding: "11px 18px",
  cursor: "pointer"
};

const ghostBtn = {
  width: "100%",
  marginTop: 14,
  background: "none",
  border: `1px solid ${T.border}`,
  borderRadius: 10,
  color: T.textSecondary,
  fontSize: 13,
  fontWeight: 700,
  padding: "11px 18px",
  cursor: "pointer"
};
