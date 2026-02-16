

'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { bulkAddTeamMembers, type ApiSport } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

const memberSchema = z.object({
  name: z.string().min(3, "Name is required."),
  email: z.string().email("Invalid email.").optional().or(z.literal('')),
  mobile: z.string().length(10, "Must be 10 digits.").optional().or(z.literal('')),
});

const formSchema = z.object({
  members: z.array(memberSchema).min(1, "You must add at least one member."),
});

type FormValues = z.infer<typeof formSchema>;

interface AddMemberDialogProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    sport: ApiSport;
    onSuccess: () => void;
}

export function AddMemberDialog({ isOpen, onClose, teamId, sport, onSuccess }: AddMemberDialogProps) {
    const { toast } = useToast();
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            members: [{ name: '', email: '', mobile: '' }]
        },
    });

    const { control, handleSubmit, formState: { isSubmitting } } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "members"
    });

    const onSubmit = async (data: FormValues) => {
        try {
            await bulkAddTeamMembers(teamId, data.members);
            toast({ title: 'Success', description: `${data.members.length} member(s) added.` });
            onSuccess();
            onClose();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Failed to add members', description: error.response?.data?.message || 'An error occurred.' });
        }
    };
    
     useEffect(() => {
        if (!isOpen) {
            form.reset({ members: [{ name: '', email: '', mobile: '' }] });
        }
    }, [isOpen, form]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Bulk Add Members to {sport.name} Team</DialogTitle>
                    <DialogDescription>Add player details below. At least a name is required for each player.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ScrollArea className="h-72 my-4">
                            <div className="space-y-6 pr-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-lg relative">
                                        <div className="space-y-4">
                                            <FormField control={control} name={`members.${index}.name`} render={({ field }) => (
                                                <FormItem><FormLabel>Player {index + 1} Name</FormLabel><FormControl><Input placeholder="Full Name" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <div className="grid grid-cols-2 gap-4">
                                                 <FormField control={control} name={`members.${index}.email`} render={({ field }) => (
                                                    <FormItem><FormLabel>Email (Optional)</FormLabel><FormControl><Input type="email" placeholder="player@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                 <FormField control={control} name={`members.${index}.mobile`} render={({ field }) => (
                                                    <FormItem><FormLabel>Mobile (Optional)</FormLabel><FormControl><Input type="tel" maxLength={10} placeholder="10-digit number" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                        </div>
                                        {index > 0 && (
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => append({ name: '', email: '', mobile: '' })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Player
                                </Button>
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add {fields.length} Member(s)
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

