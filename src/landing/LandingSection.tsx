import type { ReactNode } from 'react';

type LandingSectionProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  id?: string;
  muted?: boolean;
  title: string;
};

const LandingSection = ({
  children,
  description,
  eyebrow,
  id,
  muted,
  title,
}: LandingSectionProps) => {
  return (
    <section
      id={id}
      className={`scroll-mt-20 py-8 sm:py-20 ${muted ? 'bg-(--surface-secondary)/60' : ''}`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-extrabold tracking-[0.2em] text-(--accent) uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl leading-tight font-extrabold sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-(--muted) sm:text-lg">
          {description}
        </p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
};

export default LandingSection;
