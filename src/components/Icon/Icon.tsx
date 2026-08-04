import React from 'react';

/**
 * Set de iconos de línea, dibujados en una grilla de 24×24 con
 * `currentColor` y `stroke-width` constante.
 *
 * Sustituyen a los emojis en los controles: los emojis cambian de forma,
 * peso y alineación según la plataforma (y en los navegadores de Smart TV
 * a veces ni existen). Los emojis se conservan solo como decoración.
 */
export type IconName =
  | 'play'
  | 'pause'
  | 'next'
  | 'prev'
  | 'skip'
  | 'refresh'
  | 'expand'
  | 'collapse'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'printer'
  | 'game'
  | 'list'
  | 'settings'
  | 'check'
  | 'download'
  | 'clock'
  | 'sparkle'
  | 'chevronDown';

interface IconProps {
  name: IconName;
  /** Tamaño en px (por defecto 1.25em, escala con la tipografía) */
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

const PATHS: Record<IconName, React.ReactNode> = {
  play: <path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6" y="4.5" width="4.2" height="15" rx="1.6" fill="currentColor" stroke="none" />
      <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  next: (
    <>
      <path d="M5 4.5v15l11-7.5L5 4.5Z" fill="currentColor" stroke="none" />
      <rect x="17.6" y="4.5" width="3.4" height="15" rx="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  prev: (
    <>
      <path d="M19 4.5v15L8 12l11-7.5Z" fill="currentColor" stroke="none" />
      <rect x="3" y="4.5" width="3.4" height="15" rx="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  skip: (
    <>
      <path d="M3 5v14l9-7-9-7Z" fill="currentColor" stroke="none" />
      <path d="M12 5v14l9-7-9-7Z" fill="currentColor" stroke="none" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.5 4v5h-5" />
    </>
  ),
  expand: <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />,
  collapse: <path d="M3 9h6V3M21 9h-6V3M3 15h6v6M21 15h-6v6" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </>
  ),
  moon: <path d="M20 14.2A8.4 8.4 0 0 1 9.8 4 8.6 8.6 0 1 0 20 14.2Z" />,
  monitor: (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="2.5" />
      <path d="M8.5 21h7M12 17v4" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V3.5h10V9" />
      <rect x="3" y="9" width="18" height="8" rx="2.5" />
      <path d="M7 14h10v6.5H7V14Z" />
    </>
  ),
  game: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="4.5" />
      <path d="M7.5 10v4M5.5 12h4M15.5 11.2h.01M18 13.4h.01" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.87 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3 15a1.7 1.7 0 0 0-1.56-1H1.3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 7 4.6h.08A1.7 1.7 0 0 0 8.6 3V2.9a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 1.56 1.56A1.7 1.7 0 0 0 16 4.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 18.6 9v.08A1.7 1.7 0 0 0 20.4 10.6h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.56 1.56Z" />
    </>
  ),
  check: <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />,
  download: <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.8V12l3.4 2" />
    </>
  ),
  sparkle: (
    <path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5L3.5 11 10 9l2-6.5Z" />
  ),
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
};

export function Icon({ name, size = '1.25em', className, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      {PATHS[name]}
    </svg>
  );
}
