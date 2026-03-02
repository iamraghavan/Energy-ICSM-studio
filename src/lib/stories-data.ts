export interface StoryMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  color: string;
}

export const STORIES: StoryMetadata[] = [
  {
    id: 'intro',
    title: 'Tournament Kickoff',
    description: 'Get ready for the biggest sports event of 2026.',
    thumbnail: 'https://images.unsplash.com/photo-1762341582157-20d9e1430f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    color: 'bg-blue-600'
  },
  {
    id: 'cricket-highlights',
    title: 'Cricket Fever',
    description: 'Relive the best moments from the pitch.',
    thumbnail: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    color: 'bg-emerald-600'
  }
];
