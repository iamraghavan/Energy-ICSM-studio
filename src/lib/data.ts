import type { Sport, Team, Player, Fixture, College } from './types';
import { Goal as Football, Dribbble as Basketball, Volleyball, PersonStanding, Waves, Swords, Disc, Trophy } from 'lucide-react';

export const sports: Sport[] = [
    { id: '1', name: 'Cricket', type: 'Team', slots: 16, slotsLeft: 5, icon: Trophy },
    { id: '2', name: 'Football', type: 'Team', slots: 16, slotsLeft: 3, icon: Football },
    { id: '3', name: 'Basketball', type: 'Team', slots: 12, slotsLeft: 1, icon: Basketball },
    { id: '4', name: 'Volleyball', type: 'Team', slots: 12, slotsLeft: 6, icon: Volleyball },
    { id: '5', name: 'Athletics (100m)', type: 'Individual', slots: 50, slotsLeft: 10, icon: PersonStanding },
    { id: '6', name: 'Swimming', type: 'Individual', slots: 30, slotsLeft: 12, icon: Waves },
    { id: '7', name: 'Fencing', type: 'Individual', slots: 20, slotsLeft: 8, icon: Swords },
    { id: '8', name: 'Discus Throw', type: 'Individual', slots: 25, slotsLeft: 15, icon: Disc },
];

export const colleges: College[] = [
    { id: 'C1', name: 'IIT Madras' },
    { id: 'C2', name: 'Anna University' },
    { id: 'C3', name: 'SRM Institute of Science and Technology' },
    { id: 'C4', name: 'Vellore Institute of Technology' },
    { id: 'C5', name: 'Loyola College' },
    { id: 'C6', name: 'Madras Christian College' },
];

export const players: Player[] = [
    { id: 'P1', name: 'Arun Kumar', photoUrl: 'https://picsum.photos/seed/p1/200/200', imageHint: "male athlete", college: 'IIT Madras', sportId: '1', matchesPlayed: 5, wins: 3, losses: 2 },
    { id: 'P2', name: 'Bhavani Singh', photoUrl: 'https://picsum.photos/seed/p2/200/200', imageHint: "female athlete", college: 'Anna University', sportId: '1', matchesPlayed: 5, wins: 4, losses: 1 },
    { id: 'P3', name: 'Chris David', photoUrl: 'https://picsum.photos/seed/p3/200/200', imageHint: "male football", college: 'SRM Institute of Science and Technology', sportId: '2', matchesPlayed: 3, wins: 3, losses: 0 },
];

export const teams: Team[] = [
    { id: 'T1', name: 'IITM Strikers', sportId: '1', college: 'IIT Madras', players: players.slice(0, 1) },
    { id: 'T2', name: 'Anna University Lions', sportId: '1', college: 'Anna University', players: players.slice(1, 2) },
    { id: 'T3', name: 'SRM Blazers', sportId: '2', college: 'SRM Institute of Science and Technology', players: players.slice(2, 3) },
    { id: 'T4', name: 'VIT Spartans', sportId: '2', college: 'Vellore Institute of Technology', players: [] },
    { id: 'T5', name: 'Loyola Hoopers', sportId: '3', college: 'Loyola College', players: [] },
    { id: 'T6', name: 'MCC Volleyers', sportId: '4', college: 'Madras Christian College', players: [] },
];


export const fixtures: Fixture[] = [
    { id: 'F1', sportId: '1', teamAId: 'T1', teamBId: 'T2', dateTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), venue: 'Main Cricket Ground', status: 'Upcoming' },
    { id: 'F2', sportId: '2', teamAId: 'T3', teamBId: 'T4', dateTime: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), venue: 'Football Stadium', status: 'Upcoming' },
    { id: 'F3', sportId: '1', teamAId: 'T1', teamBId: 'T2', dateTime: new Date(), venue: 'Main Cricket Ground', status: 'Live', scoreA: 89, scoreB: 72 },
    { id: 'F4', sportId: '3', teamAId: 'T5', teamBId: 'T6', dateTime: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), venue: 'Indoor Arena', status: 'Completed', scoreA: 102, scoreB: 95 },
];
