type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
type FsDocument = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element;
  webkitFullscreenEnabled?: boolean;
};

/**
 * Si el navegador puede poner el documento a pantalla completa.
 *
 * Safari en iPhone no implementa la Fullscreen API fuera de <video>: sin esta
 * comprobación el botón existía pero no hacía absolutamente nada.
 */
export function isFullscreenSupported(): boolean {
  try {
    const el = document.documentElement as FsElement;
    const doc = document as FsDocument;
    const enabled = document.fullscreenEnabled ?? doc.webkitFullscreenEnabled ?? false;
    return Boolean(enabled && (el.requestFullscreen || el.webkitRequestFullscreen));
  } catch {
    return false;
  }
}

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
