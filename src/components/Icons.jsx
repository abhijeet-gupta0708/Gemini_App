import { useId } from "react";

/* ---------------------------------------------------------
   Base
--------------------------------------------------------- */

function Svg({ size = 18, strokeWidth = 1.7, children, ...props }) {
  return (
    <svg
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
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------
   Brand
--------------------------------------------------------- */

export function Sparkle({ size = 18, opacity = 1, ...props }) {
  const rawId = useId();
  const id = `spark-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      opacity={opacity}
      {...props}
    >
      <defs>
        <linearGradient id={id} x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f8cff" />
          <stop offset="0.48" stopColor="#9b72cb" />
          <stop offset="1" stopColor="#e879a9" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.9c.62 5.32 4.16 8.86 9.48 9.48-5.32.62-8.86 4.16-9.48 9.48-.62-5.32-4.16-8.86-9.48-9.48C7.84 10.76 11.38 7.22 12 1.9Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}

/* ---------------------------------------------------------
   Navigation + actions
--------------------------------------------------------- */

export const Menu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
  </Svg>
);

export const PanelClose = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M9 3v18" />
    <path d="m16 9-3 3 3 3" />
  </Svg>
);

export const PanelOpen = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M9 3v18" />
    <path d="m13 9 3 3-3 3" />
  </Svg>
);

export const Plus = (p) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);

export const Search = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.4-3.4" />
  </Svg>
);

export const Message = (p) => (
  <Svg {...p}>
    <path d="M20.5 15.2a2.6 2.6 0 0 1-2.6 2.6H9.2L4 21.2V6.6A2.6 2.6 0 0 1 6.6 4h11.3a2.6 2.6 0 0 1 2.6 2.6Z" />
  </Svg>
);

export const Trash = (p) => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M10 4h4" />
    <path d="M6 7l1 12.2A1.8 1.8 0 0 0 8.8 21h6.4a1.8 1.8 0 0 0 1.8-1.8L18 7" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </Svg>
);

export const Settings = (p) => (
  <Svg {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const Keyboard = (p) => (
  <Svg {...p}>
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
  </Svg>
);

export const Sun = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export const Moon = (p) => (
  <Svg {...p}>
    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
  </Svg>
);

export const Monitor = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="4" width="19" height="13" rx="2.5" />
    <path d="M8.5 21h7" />
    <path d="M12 17v4" />
  </Svg>
);

export const ArrowUp = (p) => (
  <Svg {...p}>
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </Svg>
);

export const ArrowDown = (p) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="m5 12 7 7 7-7" />
  </Svg>
);

export const ArrowUpRight = (p) => (
  <Svg {...p}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </Svg>
);

export const Stop = (p) => (
  <Svg {...p}>
    <rect x="7" y="7" width="10" height="10" rx="2.5" fill="currentColor" stroke="none" />
  </Svg>
);

export const Copy = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9" />
  </Svg>
);

export const Check = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.2 4.2L19 6.8" />
  </Svg>
);

export const Refresh = (p) => (
  <Svg {...p}>
    <path d="M20.5 12a8.5 8.5 0 1 1-2.49-6.01" />
    <path d="M20.5 4v5h-5" />
  </Svg>
);

export const X = (p) => (
  <Svg {...p}>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </Svg>
);

export const ChevronDown = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const Alert = (p) => (
  <Svg {...p}>
    <path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Svg>
);

export const Info = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </Svg>
);

export const Compass = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.6 8.4-2 5.2-5.2 2 2-5.2Z" />
  </Svg>
);

export const Bulb = (p) => (
  <Svg {...p}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5.9 1.2.9 1.9V17h5.4v-1.3c0-.7.3-1.4.9-1.9A6 6 0 0 0 12 3Z" />
  </Svg>
);

export const Code = (p) => (
  <Svg {...p}>
    <path d="m15.5 17.5 5.5-5.5-5.5-5.5" />
    <path d="M8.5 6.5 3 12l5.5 5.5" />
  </Svg>
);

export const Sparkles = (p) => (
  <Svg {...p}>
    <path d="M11 3c.35 3 2.35 5 5.35 5.35-3 .35-5 2.35-5.35 5.35C10.65 10.7 8.65 8.7 5.65 8.35 8.65 8 10.65 6 11 3Z" />
    <path d="M17.5 14.5c.2 1.7 1.3 2.8 3 3-1.7.2-2.8 1.3-3 3-.2-1.7-1.3-2.8-3-3 1.7-.2 2.8-1.3 3-3Z" />
  </Svg>
);

export const Loader = (p) => (
  <Svg {...p}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </Svg>
);
