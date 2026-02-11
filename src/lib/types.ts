import type { LucideIcon } from 'lucide-react';

export type Sport = {
    id: string;
    name: string;
    type: 'Team' | 'Individual';
    slots: number;
    slotsLeft: number;
    icon: LucideIcon;
};

export type Player = {
    id: string;
    name: string;
    photoUrl: string;
    imageHint: string;
    college: string;
    sportId: string;
    matchesPlayed: number;
    wins: number;
    losses: number;
};

export type Team = {
    id: string;
    name: string;
    sportId: string;
    college: string;
    players: Player[];
};

export type Fixture = {
    id: string;
    sportId: string;
    teamAId: string;
    teamBId: string;
    dateTime: Date;
    venue: string;
    status: 'Upcoming' | 'Live' | 'Completed';
    scoreA?: number;
    scoreB?: number;
};

export type College = {
    id: string;
    name: string;
    city: string;
    state: string;
};
