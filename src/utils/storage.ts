import type { Settings } from '../types';

const SETTINGS_KEY = 'bingo_animales_settings';

export const defaultSettings: Settings = {
  countdownSeconds: 3,
  showingSeconds: 5,
  mode: 'manual',
  showName: true,
  soundEnabled: true,
  autoFullscreen: false,
  theme: 'system',
};

/** Load settings from localStorage, falling back to defaults. */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return { ...defaultSettings };
  }
}

/** Persist settings to localStorage. */
export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may be unavailable (e.g. private mode on some TVs)
    console.warn('Could not save settings to localStorage');
  }
}
