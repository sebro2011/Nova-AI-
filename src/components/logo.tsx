/**
 * Nova AI logo mark + wordmark (custom cosmic orbit design).
 */

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="nova-grad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      {/* Orbit ring */}
      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="8"
        stroke="url(#nova-grad)"
        strokeWidth="2"
        opacity="0.55"
        transform="rotate(-24 24 24)"
      />
      {/* Core star */}
      <path
        d="M24 8c1.2 6.2 3.6 10 9.8 12-6.2 1.2-8.6 5.8-9.8 12-1.2-6.2-3.6-10.8-9.8-12 6.2-2 8.6-5.8 9.8-12Z"
        fill="url(#nova-grad)"
      />
      {/* Sparkle */}
      <circle cx="38" cy="12" r="2" fill="#c4b5fd" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <LogoMark size={30} />
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-[1.05rem] font-semibold tracking-wide text-gradient-nova">
            Nova AI
          </span>
          <span className="text-[0.62rem] uppercase tracking-[0.22em] text-mist-dim">
            Cosmic Assistant
          </span>
        </span>
      )}
    </span>
  );
}
