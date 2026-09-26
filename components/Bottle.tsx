export function Bottle({ label }: { label: string }) {
  return (
    <div className="relative grid h-full min-h-52 place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.2),transparent_62%)] text-[var(--accent,#d4af37)]">
      <svg viewBox="0 0 160 220" className="h-44 w-36" aria-hidden>
        <circle cx="80" cy="96" r="46" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.75" />
        <path
          d="M80 28v18M80 146v22M28 96h16M116 96h16M42 58l12 12M106 122l12 12M118 58l-12 12M54 122l-12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.65"
        />
        <path
          d="M92 40h12v14c0 4-3 7-8 7h-6v96c0 12-8 20-24 20h-6c-16 0-24-8-24-20V61h-6c-5 0-8-3-8-7V40h12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M62 86c8 8 20 8 28 0M60 112c10 10 24 10 34 0M64 138c8 8 18 8 24 0" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.75" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
