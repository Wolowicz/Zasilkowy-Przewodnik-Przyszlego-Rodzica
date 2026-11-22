// Logo „otula+”: różany kwiat z żółtym środkiem + szeryfowy znak słowny (DM Serif Text, SIL OFL).
export function Flower({ size = 34, className = '' }) {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      {petals.map((a) => (
        <ellipse key={a} cx="20" cy="9.2" rx="5.6" ry="8" fill="#B5616F" transform={`rotate(${a} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="7.4" fill="#F2C766" />
      <circle cx="20" cy="20" r="7.4" fill="none" stroke="#E3AE45" strokeWidth="0.8" />
    </svg>
  );
}

export default function Logo({ size = 'md', tagline = false }) {
  const s = { sm: { f: 26, t: 'text-[26px]' }, md: { f: 34, t: 'text-[34px]' } }[size];
  return (
    <span className="inline-flex items-center gap-2 select-none" aria-label="otula+">
      <Flower size={s.f} />
      <span className="flex flex-col">
        <span className={`${s.t} leading-none text-[#4A2633] tracking-tight`} style={{ fontFamily: "'DM Serif Text', Georgia, serif" }}>
          otula<span className="text-[#B5616F]">+</span>
        </span>
        {tagline && <span className="font-caption text-caption text-on-surface-variant mt-1">Twój plan rodzicielstwa</span>}
      </span>
    </span>
  );
}
