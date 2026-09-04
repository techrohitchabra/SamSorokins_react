let audioEl: HTMLAudioElement | null = null;
let keepAliveEnabled = false;
let visibilityHandler: (() => void) | null = null;

const silentWAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

export const enableKeepAlive = () => {
  if (typeof document === "undefined") return;

  keepAliveEnabled = true;

  if (!audioEl) {
    audioEl = document.createElement("audio");
    audioEl.src = silentWAV;
    audioEl.loop = true;
    audioEl.setAttribute("playsinline", "true");

    // Auto-restart if browser pauses it — only when keep-alive is active
    audioEl.onpause = () => {
      if (keepAliveEnabled) {
        console.warn("[KeepAlive] Audio paused, restarting...");
        audioEl?.play().catch(() => {});
      }
    };

    audioEl.onended = () => {
      if (keepAliveEnabled) {
        console.warn("[KeepAlive] Audio ended, restarting...");
        audioEl?.play().catch(() => {});
      }
    };
  }

  // Register visibilitychange listener (only once)
  if (!visibilityHandler) {
    visibilityHandler = () => {
      if (!document.hidden && audioEl && keepAliveEnabled) {
        console.log("[KeepAlive] Tab active again, resuming audio");
        audioEl.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);
  }

  audioEl
    .play()
    .catch((e) => console.warn("[KeepAlive] Background audio play failed:", e));

  console.log("[KeepAlive] Silent audio loop started.");
};

export const disableKeepAlive = () => {
  keepAliveEnabled = false;

  if (audioEl) {
    audioEl.pause();
    console.log("[KeepAlive] Silent audio loop stopped.");
  }

  // Clean up the visibilitychange listener
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
};
