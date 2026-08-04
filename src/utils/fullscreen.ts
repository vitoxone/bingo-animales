/** Enter fullscreen on the document element. */
export async function enterFullscreen(): Promise<void> {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    await el.requestFullscreen();
  } else if ((el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
    await (el as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
  }
}

/** Exit fullscreen. */
export async function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
  } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
    await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
  }
}

/** Whether the browser is currently in fullscreen. */
export function isFullscreen(): boolean {
  return Boolean(
    document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
  );
}

/** Toggle fullscreen. */
export async function toggleFullscreen(): Promise<void> {
  if (isFullscreen()) {
    await exitFullscreen();
  } else {
    await enterFullscreen();
  }
}
