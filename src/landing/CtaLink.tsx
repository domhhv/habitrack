import type { ReactNode } from 'react';

type CtaLinkProps = {
  children: ReactNode;
  hidden?: boolean;
  href: string;
  id?: string;
  size?: 'lg' | 'md' | 'sm';
  variant?: 'ghost' | 'primary' | 'secondary';
};

const VARIANT_CLASSES = {
  ghost: 'text-(--foreground) hover:bg-(--surface-secondary)',
  primary:
    'bg-(--accent) text-(--accent-foreground) shadow-sm hover:opacity-90',
  secondary:
    'border border-(--border) bg-(--surface) text-(--foreground) hover:bg-(--surface-secondary)',
};

const SIZE_CLASSES = {
  lg: 'h-11 px-5 text-base md:h-10',
  md: 'h-10 px-5 text-sm md:h-9',
  sm: 'h-9 px-3 text-sm md:h-8',
};

const CtaLink = ({
  children,
  hidden,
  href,
  id,
  size = 'md',
  variant = 'primary',
}: CtaLinkProps) => {
  return (
    <a
      id={id}
      href={href}
      hidden={hidden}
      className={`inline-flex items-center justify-center gap-2 rounded-(--field-radius) font-bold whitespace-nowrap outline-offset-2 transition-opacity focus-visible:outline-2 focus-visible:outline-(--focus) ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </a>
  );
};

export default CtaLink;
