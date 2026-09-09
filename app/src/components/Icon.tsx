import type { CSSProperties } from 'react';

const P: Record<string, string> = {
  flame: 'M12 22c4.4 0 7-2.8 7-6.6 0-3.2-2-5.2-3.2-6.6-.3 1.4-1 2.4-2 2.9.2-2.8-.9-6.4-3.9-8.7.2 3-1.2 4.4-2.6 6C6 10.4 5 12.4 5 15.4 5 19.2 7.6 22 12 22z',
  eye: 'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  noshot: 'M3 3l18 18M9 5h6l1.5 2H20a1 1 0 0 1 1 1v9.5M5.5 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12.5M9.6 9.6a3.5 3.5 0 0 0 4.8 4.8',
  incognito: 'M4 11h16M6.5 11l1.6-5.2A1 1 0 0 1 9.1 5h5.8a1 1 0 0 1 1 .8L17.5 11M8.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM15.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM11 16.5h2',
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  foryou: 'M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM11 9.5l4 2.5-4 2.5z',
  list: 'M6 4h12v17l-6-4-6 4z',
  gift: 'M3 8h18v4H3zM5 12v8h14v-8M12 8v12M12 8c-2-3-6-3-6-1s3 2 6 1zM12 8c2-3 6-3 6-1s-3 2-6 1z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
  back: 'M15 5l-7 7 7 7',
  chevron: 'M9 5l7 7-7 7',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12l5 5 9-10',
  close: 'M6 6l12 12M18 6L6 18',
  heart: 'M12 20.5s-7.5-4.6-9.4-8.9C1.2 8.2 3.6 5 6.9 5c1.9 0 3.5 1.1 5.1 2.8C13.6 6.1 15.2 5 17.1 5c3.3 0 5.7 3.2 4.3 6.6-1.9 4.3-9.4 8.9-9.4 8.9z',
  share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3M8 7l4-4 4 4',
  lock: 'M5 10h14v10H5zM8 10V7a4 4 0 0 1 8 0v3',
  unlock: 'M5 10h14v10H5zM8 10V7a4 4 0 0 1 7.5-2',
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  sliders: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM9 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5M12 17h.01',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  clock: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 8v4l3 2',
  star: 'M12 2.5l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.7 5.9 21.1l1.4-6.8L2.2 9.6l6.9-.8z',
  mic: 'M9 3h6v12H9zM5 11a7 7 0 0 0 14 0M12 18v3',
  crown: 'M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z',
  speaker: 'M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6',
  mute: 'M4 10v4h4l5 4V6L8 10zM16 9l4 6M20 9l-4 6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  refresh: 'M4 12a8 8 0 1 0 3-6.2M4 4v5h5',
  edit: 'M4 20h4l10-10-4-4L4 16zM12.5 7.5l4 4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 8h.01',
  ad: 'M3 5h18v14H3zM10 9l5 3-5 3z',
  episodes: 'M4 7h16M4 12h16M4 17h10',
  film: 'M4 4h16v16H4zM4 9h16M4 15h16M9 4v16M15 4v16',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  logout: 'M10 17l5-5-5-5M15 12H3M13 3h6v18h-6',
  copy: 'M9 9h10v12H9zM5 15V3h10',
  history: 'M4 12a8 8 0 1 0 3-6.2M4 4v5h5M12 8v4l3 2',
  swipeUp: 'M6 15l6-6 6 6',
  cast: 'M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6M2 12a9 9 0 0 1 8 8M2 16a5 5 0 0 1 4 4M2 20h.01',
  data: 'M4 6h16v4H4zM4 14h16v4H4zM8 8h.01M8 16h.01',
  hd: 'M3 6h18v12H3zM7 9v6M7 12h3M10 9v6M14 9h2.5a2.5 2.5 0 0 1 0 6H14z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  invite: 'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M18 8v6M15 11h6',
  time: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 8v4l2.5 1.5',
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 24, stroke = 1.8, fill = false, grad = false, style, className }: { name: IconName; size?: number; stroke?: number; fill?: boolean; grad?: boolean; style?: CSSProperties; className?: string }) {
  const paint = grad ? 'url(#sb-grad)' : 'currentColor';
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill ? paint : 'none'} stroke={fill ? 'none' : paint} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', ...style }} aria-hidden="true">
      <path d={P[name]} />
    </svg>
  );
}

export function Coin({ size = 16, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="12" cy="12" r="9" fill={dark ? '#1a1030' : 'var(--coin)'} />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke={dark ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.35)'} strokeWidth="2" />
    </svg>
  );
}
