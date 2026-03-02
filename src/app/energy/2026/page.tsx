import { Hero } from '@/components/sections/hero';
import { QuickAccess } from '@/components/sections/quick-access';
import { SportsGridPreview } from '@/components/sections/sports-grid-preview';
import { StoriesStrip } from '@/components/sections/stories-strip';
import { getSports } from '@/lib/api';

export default async function Home() {
  const sports = await getSports().catch(() => []);
  
  return (
    <>
      <Hero />
      <StoriesStrip />
      <QuickAccess />
      <div className="container py-16 space-y-16">
        <SportsGridPreview sports={sports} />
      </div>
    </>
  );
}
