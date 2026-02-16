
'use client';
import { useEffect, useState, useMemo } from 'react';
import { getSportsHeadStudents, type SportStudent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Search, X, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function SportsHeadPlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<SportStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getSportsHeadStudents();
      setPlayers(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch player data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPlayers = useMemo(() => {
    return (players || []).filter(player => {
      if (!player || !player.name) return false;

      const lowerSearchTerm = searchTerm.toLowerCase();
      
      const searchMatch = lowerSearchTerm === '' ||
        (player.name || '').toLowerCase().includes(lowerSearchTerm) ||
        (player.college || '').toLowerCase().includes(lowerSearchTerm) ||
        (player.team_name || '').toLowerCase().includes(lowerSearchTerm) ||
        player.registration_id?.toLowerCase().includes(lowerSearchTerm);

      return searchMatch;
    });
  }, [players, searchTerm]);

  const handleViewDetailsClick = (registrationId: string) => {
    router.push(`/console/admin/registrations/details?id=${registrationId}`);
  };

  const renderTable = () => {
      if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        )
      }
      if (error) {
        return <p className="text-destructive text-center py-10">{error}</p>;
      }
      if (filteredPlayers.length === 0) {
        return <p className="text-muted-foreground text-center py-16">No players match your filters.</p>;
      }
      
      return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredPlayers.map((player) => (
                    <TableRow key={player.registration_id}>
                        <TableCell>
                            <div className="font-medium">{player.name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground font-mono">{player.registration_id}</div>
                        </TableCell>
                        <TableCell>{player.college || 'N/A'}</TableCell>
                        <TableCell>
                           {player.team_name ? (
                               <Badge variant="secondary">{player.team_name}</Badge>
                           ) : (
                               <span className="text-muted-foreground">Unassigned</span>
                           )}
                        </TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleViewDetailsClick(player.registration_id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      )
  }

  const hasActiveFilters = !!searchTerm;
  
  const renderFilterBar = () => {
       if (isLoading) {
           return <Skeleton className="h-10 flex-1" />;
       }
       return (
             <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, college, team, code..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {hasActiveFilters && <Button variant="ghost" onClick={() => setSearchTerm('')}><X className="h-4 w-4 mr-2" />Clear</Button>}
            </div>
       )
  }

  return (
    <div className="container py-8 space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Player Management</CardTitle>
            <CardDescription>View all approved players registered for your assigned sport.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {renderFilterBar()}
                {renderTable()}
            </div>
        </CardContent>
      </Card>
      </div>
  );
}
