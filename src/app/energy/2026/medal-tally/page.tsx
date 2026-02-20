
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medal Tally',
  description: 'View the college leaderboard and medal tally for the ENERGY 2026 sports meet.',
};

const tallyData = [
  { rank: '01', name: 'Golden Team', city: 'Los Angeles', logoColor: 'text-yellow-500', w: 22, l: 5, d: 1, pts: 67, strk: '5W' },
  { rank: '02', name: 'Emerald Team', city: 'Boston', logoColor: 'text-emerald-500', w: 22, l: 5, d: 1, pts: 67, strk: '3L' },
  { rank: '03', name: 'Crimson Team', city: 'Chicago', logoColor: 'text-red-500', w: 22, l: 5, d: 1, pts: 67, strk: '3L' },
  { rank: '04', name: 'Blue Team', city: 'Texas', logoColor: 'text-blue-500', w: 22, l: 5, d: 1, pts: 67, strk: '5W' },
  { rank: '05', name: 'Purple Team', city: 'New York', logoColor: 'text-purple-500', w: 22, l: 5, d: 1, pts: 67, strk: '3L' },
  { rank: '06', name: 'Green Team', city: 'Portland', logoColor: 'text-green-500', w: 22, l: 5, d: 1, pts: 67, strk: '5W' },
  { rank: '07', name: 'Aqua Team', city: 'Washington', logoColor: 'text-cyan-500', w: 22, l: 5, d: 1, pts: 67, strk: '5W' },
  { rank: '08', name: 'Silver Team', city: 'Florida', logoColor: 'text-gray-400', w: 22, l: 5, d: 1, pts: 67, strk: '3L' },
];


export default function MedalTallyPage() {
    return (
        <div className="container py-8 md:py-12">
            <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                    <CardTitle className="font-headline text-2xl">College Leaderboard</CardTitle>
                    <CardDescription>Overall standings for the ENERGY 2026 Sports Meet.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/20 hover:bg-muted/20">
                                    <TableHead className="w-[350px] pl-8"># / Team</TableHead>
                                    <TableHead>W</TableHead>
                                    <TableHead>L</TableHead>
                                    <TableHead>D</TableHead>
                                    <TableHead>PTS</TableHead>
                                    <TableHead>STRK</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tallyData.map((team) => (
                                    <TableRow key={team.rank} className="hover:bg-muted/50">
                                        <TableCell className="pl-8">
                                            <div className="flex items-center gap-6">
                                                <span className="font-mono text-muted-foreground w-4 text-center">{team.rank}</span>
                                                <div className="flex items-center gap-3">
                                                    <Shield className={cn("h-8 w-8", team.logoColor)} fill="currentColor" />
                                                    <div>
                                                        <p className="font-semibold">{team.name}</p>
                                                        <p className="text-xs text-muted-foreground">{team.city}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{team.w}</TableCell>
                                        <TableCell className="font-medium">{team.l}</TableCell>
                                        <TableCell className="font-medium">{team.d}</TableCell>
                                        <TableCell className="font-bold text-primary">{team.pts}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "font-bold w-12 justify-center",
                                                    team.strk.includes('W') && "text-green-600 border-green-600/50 bg-green-500/10",
                                                    team.strk.includes('L') && "text-red-600 border-red-600/50 bg-red-500/10"
                                                )}
                                            >
                                                {team.strk}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
