"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { X, Share, Plus } from "lucide-react";

const DISMISS_KEY = "truenorth_install_dismissed_at";
const DISMISS_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type EnvMode = "hidden" | "ios" | "native";

function noopSubscribe() {
  return () => {};
}

// Reads browser-only environment state (display mode, user agent, prior
// dismissal) synchronously and without a hydration mismatch —
// useSyncExternalStore's getServerSnapshot fallback keeps SSR output
// consistent by hiding the prompt until the client settles this.
function getSnapshot(): EnvMode {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;
  if (standalone) return "hidden";

  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
  if (dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
    return "hidden";
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) ? "ios" : "native";
}

function getServerSnapshot(): EnvMode {
  return "hidden";
}

export function InstallPrompt() {
  const envMode = useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [manuallyDismissed, setManuallyDismissed] = useState(false);

  useEffect(() => {
    // Chrome only fires beforeinstallprompt once a service worker with a
    // fetch handler is registered — without this, the button below would
    // never appear on Android/desktop.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (envMode !== "native") return;
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, [envMode]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setManuallyDismissed(true);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (manuallyDismissed || envMode === "hidden") return null;
  if (envMode === "native" && !deferredPrompt) return null;

  const showIosHint = envMode === "ios";

  return (
    <div className="mx-auto w-full max-w-lg px-5 mt-3">
      <div className="rise-in flex items-center gap-3 rounded-xl border border-gold/25 bg-gold/10 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy">Install TrueNorth</p>
          {showIosHint ? (
            <p className="text-xs text-navy/55 mt-0.5 flex items-center gap-1 flex-wrap">
              Tap <Share size={13} className="inline shrink-0" /> then{" "}
              <span className="inline-flex items-center gap-0.5">
                <Plus size={13} className="shrink-0" />
                Add to Home Screen
              </span>
            </p>
          ) : (
            <p className="text-xs text-navy/55 mt-0.5">One tap, and it opens like an app — no browser bar.</p>
          )}
        </div>
        {!showIosHint && (
          <button
            onClick={install}
            className="shrink-0 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-navy-deep"
          >
            Install
          </button>
        )}
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-navy/40 p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
