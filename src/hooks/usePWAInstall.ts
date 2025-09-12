import { useEffect, useState } from "react";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect when app is installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
    });

    // Save the install prompt event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const showInstallPrompt = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      console.log("✅ App installed");
    } else {
      console.log("❌ Install dismissed");
    }
    setDeferredPrompt(null);
  };

  return { isInstalled, showInstallPrompt };
}
