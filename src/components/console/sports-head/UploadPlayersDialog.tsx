'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sportsHeadBulkAddPlayers } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, FileCheck2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

interface UploadPlayersDialogProps {
    teamId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const requiredHeaders = ['name', 'mobile', 'email', 'role', 'sport_role', 'batting_style', 'bowling_style', 'is_wicket_keeper'];

export function UploadPlayersDialog({ teamId, isOpen, onClose, onSuccess }: UploadPlayersDialogProps) {
    const { toast } = useToast();
    const [players, setPlayers] = useState<any[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 2) {
                    throw new Error("Spreadsheet is empty or has no data rows.");
                }

                const headers = (jsonData[0] as string[]).map(h => h.toString().toLowerCase().trim().replace(/ /g, '_'));
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h) && h === 'name'); // Only 'name' is truly essential
                 if (missingHeaders.length > 0 && !headers.includes('name')) {
                    throw new Error(`Missing required column header: "name".`);
                }

                const parsedPlayers = jsonData.slice(1).map((row: any) => {
                    const player: any = {};
                    headers.forEach((header, index) => {
                        // Sanitize boolean values
                        if(header === 'is_wicket_keeper') {
                            const val = row[index];
                            player[header] = val === 'TRUE' || val === true || val === 1 || val === '1';
                        } else {
                           player[header] = row[index] !== undefined ? row[index] : '';
                        }
                    });
                    return player;
                }).filter(p => p.name); // Filter out rows without a name

                setPlayers(parsedPlayers);
                toast({ title: 'File Processed', description: `${parsedPlayers.length} players found in the file.` });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'File Read Error', description: error.message || 'Could not process the spreadsheet.' });
                setPlayers([]);
                setFileName(null);
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not read the file.' });
            setIsLoading(false);
        }
        reader.readAsArrayBuffer(file);
    };
    
    const handleUpload = async () => {
        if(players.length === 0) {
            toast({ variant: 'destructive', title: 'No players to upload' });
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await sportsHeadBulkAddPlayers(teamId, players);
            const { added = 0, updated = 0, errors = [] } = result.stats || {};
            toast({ 
                title: 'Import Complete', 
                description: `${added} players added, ${updated} updated. ${errors.length > 0 ? `${errors.length} errors.` : ''}` 
            });
            if(errors.length > 0) {
                console.error("Import errors:", errors);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Upload Failed', description: error.response?.data?.error || 'An error occurred during upload.' });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    // Reset state when dialog closes
    useEffect(() => {
        if(!isOpen) {
            setPlayers([]);
            setFileName(null);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl">
                 <DialogHeader>
                    <DialogTitle>Upload Players via Excel</DialogTitle>
                    <DialogDescription>Select an Excel or CSV file with player data to bulk import.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                     <Alert>
                        <UploadCloud className="h-4 w-4"/>
                        <AlertTitle>File Format</AlertTitle>
                        <AlertDescription>
                            Your file should have headers in the first row. The 'name' column is required. Other supported columns are: `mobile`, `email`, `role`, `sport_role`, `batting_style`, `bowling_style`, `is_wicket_keeper`.
                        </AlertDescription>
                    </Alert>

                     <Input 
                        id="excel-upload" 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileChange} 
                        disabled={isLoading || isSubmitting}
                    />

                    {isLoading && <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>}
                    
                    {players.length > 0 && (
                        <div>
                             <p className="font-medium text-sm mb-2">Preview Data ({players.length} players):</p>
                            <div className="border rounded-lg h-64 overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Mobile</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Sport Role</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {players.map((player, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{player.name}</TableCell>
                                                <TableCell>{player.mobile || 'N/A'}</TableCell>
                                                <TableCell>{player.role || 'Player'}</TableCell>
                                                <TableCell>{player.sport_role || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                     {fileName && players.length === 0 && !isLoading && <div className="text-destructive text-center p-4">No valid player data found in "{fileName}". Please check the file format.</div>}
                </div>

                 <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleUpload} disabled={isSubmitting || isLoading || players.length === 0}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck2 className="mr-2 h-4 w-4"/>}
                        Confirm & Add {players.length > 0 ? players.length : ''} Players
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
