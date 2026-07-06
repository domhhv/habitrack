import type { ReactNode } from 'react';

type CtaLinkProps = {
  children: ReactNode;
  hidden?: boolean;
  href: string;
  id?: string;
  variant?: 'ghost' | 'primary' | 'secondary';
};

const VARIANT_CLASSES = {
  ghost: 'text-(--foreground) hover:bg-(--surface-secondary)',
  primary:
    'bg-(--accent) text-(--accent-foreground) shadow-sm hover:opacity-90',
  secondary:
    'border border-(--border) bg-(--surface) text-(--foreground) hover:bg-(--surface-secondary)',
};

const CtaLink = ({
  children,
  hidden,
  href,
  id,
  variant = 'primary',
}: CtaLinkProps) => {
  return (
    <a
      id={id}
      href={href}
      hidden={hidden}
      className={`inline-flex items-center justify-center gap-2 rounded-(--field-radius) px-5 py-2.5 text-sm font-bold whitespace-nowrap outline-offset-2 transition-opacity focus-visible:outline-2 focus-visible:outline-(--focus) ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </a>
  );
};

export default CtaLink;
