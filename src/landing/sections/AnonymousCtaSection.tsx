import CtaLink from '../CtaLink';

const AnonymousCtaSection = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-(--accent)/30 bg-(--accent)/10 px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl leading-tight font-extrabold sm:text-4xl">
            Look around first. Commit later, or never.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-semibold text-(--muted)">
            Anonymous login creates a private account in one click — no email,
            no password. Log a few things, and register whenever you want to
            keep them.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <CtaLink href="/anonymous-login">Continue anonymously</CtaLink>
            <CtaLink href="/calendar" variant="secondary">
              Preview the calendar
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnonymousCtaSection;
