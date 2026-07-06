import LandingSection from '../LandingSection';
import { NoteScopesMockup } from '../mockups';

const NotesSection = () => {
  return (
    <LandingSection
      id="notes"
      eyebrow="Notes"
      title="Notes that live where they belong"
      description="Attach a note to a single occurrence, or step back and write one for the whole day, week, or month. Your reflections stay next to the thing they're about."
    >
      <NoteScopesMockup />
    </LandingSection>
  );
};

export default NotesSection;
