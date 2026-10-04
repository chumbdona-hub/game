export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // Silent fail: app still works without SW
      });
  });
}
