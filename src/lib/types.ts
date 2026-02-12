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

export type College = {
    id: string;
    name: string;
    city: string;
    state: string;
};
