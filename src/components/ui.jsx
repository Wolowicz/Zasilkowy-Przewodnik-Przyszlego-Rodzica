import { useEffect } from 'react';

export const Icon = ({ name, className = '', fill = false, size }) => (
  <span aria-hidden="true" className={`material-symbols-outlined ${fill ? 'icon-fill' : ''} ${className}`} style={size ? { fontSize: size } : undefined}>
    {name}
  </span>
);

const tones = {
  sage: 'bg-[#E6EEDC] text-[#4C6944]',
  gold: 'bg-[#F8EBC7] text-[#80611F]',
  rose: 'bg-[#F4E0E7] text-[#91526C]',
  sky: 'bg-[#E1EEF8] text-[#3D6488]',
  lilac: 'bg-[#ECE4F6] text-[#6B4F8F]',
  peach: 'bg-[#FBE4D7] text-[#934E3F]',
  ok: 'bg-tertiary-fixed text-on-tertiary-fixed',
  warning: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  danger: 'bg-error-container text-on-error-container',
  neutral: 'bg-surface-container text-on-surface',
  primary: 'bg-primary-container text-on-primary',
};
const dots = { sage: 'bg-[#4C6944]', gold: 'bg-[#80611F]', rose: 'bg-[#91526C]', sky: 'bg-[#3D6488]', lilac: 'bg-[#6B4F8F]', peach: 'bg-[#934E3F]', ok: 'bg-tertiary', warning: 'bg-secondary', danger: 'bg-error', neutral: 'bg-primary-container', primary: 'bg-on-primary' };

export function Chip({ tone = 'sage', children, dot = true, upper = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full whitespace-nowrap ${upper ? 'font-label-uppercase text-[12px] tracking-[0.08em] font-extrabold uppercase' : 'text-caption font-bold'} ${tones[tone]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  );
}

export const IconBox = ({ icon, tone = 'peach', size = 'w-10 h-10', iconSize = 'text-[22px]' }) => (
  <div className={`${size} rounded-2xl flex items-center justify-center shrink-0 ${tones[tone].split(' ')[0]}`}>
    <Icon name={icon} className={`${iconSize} ${tones[tone].split(' ')[1]}`} />
  </div>
);

export function SectionHead({ icon, tone = 'peach', kicker, title, right, sub }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm mb-space-md">
      <div className="flex items-center gap-space-xs">
        {icon && <IconBox icon={icon} tone={tone} />}
        <div>
          {kicker && <span className="font-label-uppercase text-label-uppercase text-on-surface-variant block">{kicker}</span>}
          <h2 className="font-headline-md text-headline-md text-primary">{title}</h2>
          {sub && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Modal({ open, onClose, title, icon = 'description', children, footer, wide }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-inverse-surface/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`bg-surface w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-xl'} max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-[24px] p-space-lg shadow-xl flex flex-col gap-space-md`}>
        <div className="flex items-start justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <IconBox icon={icon} tone="peach" size="w-12 h-12" />
            <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full bg-surface-container-high/80 flex items-center justify-center hover:bg-surface-container-highest" aria-label="Zamknij">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        {children}
        {footer && <div className="flex flex-wrap justify-end gap-space-xs pt-1">{footer}</div>}
      </div>
    </div>
  );
}

export const Btn = ({ kind = 'primary', icon, children, className = '', ...p }) => {
  const k = {
    primary: 'bg-primary-container text-on-primary hover:bg-primary shadow-sm',
    dark: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm',
    ghost: 'bg-surface-container-lowest text-primary hover:bg-surface-container shadow-[0_2px_8px_-1px_rgba(69,46,53,0.06)]',
    soft: 'bg-surface-container hover:bg-surface-container-high text-on-surface',
    peach: 'bg-secondary-fixed text-on-secondary-container hover:bg-secondary-container',
  }[kind];
  return (
    <button type="button" className={`inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-full font-button-text text-button-text transition-all disabled:opacity-50 ${k} ${className}`} {...p}>
      {icon && <Icon name={icon} className="text-[18px]" />}
      {children}
    </button>
  );
};

export function Field({ label, hint, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={htmlFor} className="font-body-md-medium text-[14px] text-on-surface font-semibold">{label}</label>}
      {children}
      {hint && <span className="font-caption text-[12px] text-on-surface-variant">{hint}</span>}
    </div>
  );
}

export const inputCls = 'w-full h-12 px-4 bg-surface-container-low rounded-2xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40 focus:bg-surface-container-lowest';

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${checked ? 'bg-primary-container' : 'bg-outline-variant'}`}>
      <span className={`block w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export function Segmented({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex p-1.5 bg-surface-container rounded-full shadow-inner flex-wrap ${className}`}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={`px-space-md py-space-xs rounded-full font-button-text text-[14px] transition-all flex items-center gap-1.5 ${value === o.value ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>
          {o.icon && value === o.value && <Icon name={o.icon} className="text-[18px]" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const AIBadge = ({ children = 'AI' }) => (
  <span title="Funkcja wspierana mechanizmami sztucznej inteligencji" className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#ECE4F6] text-[#6B4F8F] text-[11px] font-extrabold uppercase tracking-wide">
    <Icon name="auto_awesome" className="text-[12px]" />
    {children}
  </span>
);
