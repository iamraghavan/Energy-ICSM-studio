import {
    Goal, Dribbble, Volleyball, PersonStanding, Waves, Swords, Disc, Trophy, HelpCircle, Users
} from 'lucide-react';
import type { ElementType } from 'react';

// A mapping of sport names to their corresponding lucide-react icons.
export const sportIconMap: { [key: string]: ElementType } = {
    'Cricket': Trophy,
    'Football': Goal,
    'Basketball': Dribbble,
    'Volleyball': Volleyball,
    '100m Dash': PersonStanding,
    'Athletics (100m)': PersonStanding,
    'Swimming': Waves,
    'Fencing': Swords,
    'Discus Throw': Disc,
    'Badminton': Trophy,
    'Chess': Users, 
    'Kabaddi': Users,
    'Table Tennis': Disc,
};

// A helper function to safely get an icon for a sport name.
export const getSportIcon = (sportName: string): ElementType => {
    return sportIconMap[sportName] || HelpCircle;
};
