"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { registerStudent, type ApiSport } from "@/lib/api";
import { Loader2, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters."),
    email: z.string().email("Invalid email address."),
    mobile: z.string().length(10, { message: "Mobile number must be 10 digits." }),
    isWhatsappSame: z.boolean().default(false).optional(),
    whatsapp: z.string().optional().or(z.literal('')),
    
    collegeName: z.string().min(3, "College name must be at least 3 characters."),
    cityState: z.string().min(2, "City/State is required."),
    
    selected_sport_ids: z.array(z.string()).min(1, "Please select at least one sport."),
    teamName: z.string().optional(),

    isPd: z.boolean().default(false),
    pdName: z.string().optional(),
    pdWhatsapp: z.string().optional(),
    collegeEmail: z.string().optional(),
    collegeContact: z.string().optional(),
}).refine(data => {
    if (data.isPd) {
        return !!data.pdName && !!data.pdWhatsapp && !!data.collegeEmail && !!data.collegeContact;
    }
    return true;
}, {
    message: "Please fill all Physical Director details.",
    path: ["collegeEmail"],
});

type FormSchema = z.infer<typeof formSchema>;

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
        },
    },
};

export function RegisterForm({ sports: apiSports }: { sports: ApiSport[] }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['Boys', 'Girls']);
    const [filteredSports, setFilteredSports] = useState<ApiSport[]>([]);

    const cityStateInputRef = useRef<HTMLInputElement | null>(null);
    const autocompleteRef = useRef<any>(null);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isWhatsappSame: false,
            fullName: "",
            email: "",
            mobile: "",
            whatsapp: "",
            collegeName: "",
            cityState: "",
            selected_sport_ids: [],
            teamName: "",
            isPd: false,
        }
    });

    const { watch, setValue, getValues, control, formState: { isSubmitting } } = form;

    const selectedSportIds = watch('selected_sport_ids');
    const collegeName = watch('collegeName');
    const isWhatsappSame = watch('isWhatsappSame');
    const mobile = watch('mobile');
    const isPd = watch('isPd');
    const fullName = watch('fullName');
    const whatsapp = watch('whatsapp');

    // Filter sports based on selected categories
    useEffect(() => {
        const filtered = apiSports.filter(sport => selectedCategories.includes(sport.category));
        setFilteredSports(filtered);

        // Also deselect any sports that are no longer visible
        const currentSelected = getValues('selected_sport_ids');
        const filteredSportIds = new Set(filtered.map(s => s.id.toString()));
        const newSelected = currentSelected.filter(id => filteredSportIds.has(id));

        if (newSelected.length !== currentSelected.length) {
            setValue('selected_sport_ids', newSelected, { shouldValidate: true });
        }
    }, [selectedCategories, apiSports, setValue, getValues]);
    
    const sportsByCategory = useMemo(() => {
        return filteredSports.reduce((acc, sport) => {
            const category = sport.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(sport);
            return acc;
        }, {} as Record<string, ApiSport[]>);
    }, [filteredSports]);
    
    // Auto-fill WhatsApp number
    useEffect(() => {
        if (isWhatsappSame) {
            setValue('whatsapp', mobile);
        } else {
            setValue('whatsapp', '');
        }
    }, [isWhatsappSame, mobile, setValue]);
    
    // Auto-fill PD details
    useEffect(() => {
        if (isPd) {
            setValue('pdName', fullName);
            const whatsappNumber = isWhatsappSame ? mobile : whatsapp;
            setValue('pdWhatsapp', whatsappNumber);
        }
    }, [isPd, fullName, mobile, isWhatsappSame, whatsapp, setValue]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Google Places Autocomplete
    useEffect(() => {
        if (!isClient || !cityStateInputRef.current) return;

        const initAutocomplete = () => {
            if (autocompleteRef.current || !(window as any).google?.maps?.places) {
                setTimeout(initAutocomplete, 100);
                return;
            }

            autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(
                cityStateInputRef.current!,
                { types: ["(cities)"], componentRestrictions: { country: "in" } }
            );
            autocompleteRef.current.setFields(["address_components", "formatted_address"]);
            
            autocompleteRef.current.addListener("place_changed", () => {
                const place = autocompleteRef.current.getPlace();
                if (place?.formatted_address) {
                    setValue('cityState', place.formatted_address, { shouldValidate: true });
                }
            });
        }
        
        initAutocomplete();

        return () => {
            if (autocompleteRef.current && (window as any).google?.maps?.event) {
                (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [isClient, setValue]);

    // Auto-generate team name
    useEffect(() => {
        const firstTeamSport = selectedSportIds
            .map(id => apiSports.find(s => s.id.toString() === id))
            .find(sport => sport?.type === 'Team');

        if (firstTeamSport && collegeName) {
            const sportNameSuffixes: Record<string, string> = {
                'Cricket': 'Strikers',
                'Football': 'Kickers',
                'Basketball': 'Hoopers',
                'Volleyball': 'Spikers',
                'Kabaddi': 'Raiders',
                'Badminton': 'Shuttlers',
                'Chess': 'Masters',
                'Table Tennis': 'Paddlers',
            };
            
            const collegePrefix = collegeName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
            const suffix = sportNameSuffixes[firstTeamSport.name] || firstTeamSport.name;
            const newTeamName = `${collegePrefix} ${suffix}`;

            setValue('teamName', newTeamName);
        } else {
            setValue('teamName', '');
        }
    }, [selectedSportIds, collegeName, apiSports, setValue]);


    const onSubmit = async (data: FormSchema) => {
        const formData = new FormData();
        
        formData.append('name', data.fullName);
        formData.append('email', data.email);
        formData.append('mobile', data.mobile);
        formData.append('whatsapp', data.isWhatsappSame ? data.mobile : data.whatsapp || '');
        
        const cityStateParts = data.cityState.split(',').map(s => s.trim());
        const city = cityStateParts[0];
        const state = cityStateParts[1] || city;
        
        if (city) {
            formData.append('city', city);
            formData.append('state', state);
        }

        formData.append('other_college', data.collegeName);
        formData.append('selected_sport_ids', data.selected_sport_ids.join(','));
        
        const hasTeamSport = data.selected_sport_ids.some(id => apiSports.find(s => s.id.toString() === id)?.type === 'Team');
        if (hasTeamSport && data.teamName) {
             formData.append('create_team', 'true');
             formData.append('team_name', data.teamName);
        }

        if (data.isPd) {
            if(data.pdName) formData.append('pd_name', data.pdName);
            if(data.pdWhatsapp) formData.append('pd_whatsapp', data.pdWhatsapp);
            if(data.collegeEmail) formData.append('college_email', data.collegeEmail);
            if(data.collegeContact) formData.append('college_contact', data.collegeContact);
        }

        formData.append('accommodation_needed', 'false');

        try {
            const result = await registerStudent(formData);
            
            const registrationId = result.data?.registration_id || result.registration_id;
            const registrationCode = result.data?.registration_code || result.registration_code;

            if (!registrationId) {
                console.error("No registration ID returned:", result);
                throw new Error("Registration succeeded but no ID was returned from server.");
            }

            toast({
                title: "Registration Submitted!",
                description: `We're finalizing your registration. One moment...`,
            });
            
            router.push(`/energy/2026/registration/success?id=${registrationId}${registrationCode ? `&code=${registrationCode}` : ''}`);
        } catch (error: any) {
            console.error("Form submission error:", error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || "An unknown error occurred. Please try again.";
            router.push(`/energy/2026/registration/failure?error=${encodeURIComponent(errorMessage)}`);
        }
    };

    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl my-8">
                <CardHeader className="text-center bg-primary/5 p-6 rounded-t-lg">
                    <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary">Chevalier Dr.G.S.Pillay Memorial Tournament</h1>
                    <h2 className="font-headline text-xl md:text-2xl font-semibold">ENERGY - 2026</h2>
                    <p className="text-muted-foreground">AN INTER-COLLEGE SPORTS MEET</p>
                    <p className="text-sm mt-2">Organized by the Department of Physical Education, E.G.S. Pillay Group of Institutions, Nagapattinam.</p>
                </CardHeader>
                <CardContent className="p-4 md:p-8">
                    <Form {...form}>
                        <motion.form 
                            onSubmit={form.handleSubmit(onSubmit)} 
                            className="space-y-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            
                            <FormSection title="Personal Details">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Login Information</AlertTitle>
                                    <AlertDescription>
                                        Please note: Your <strong>Email Address</strong> and <strong>WhatsApp Number</strong> will be used to log into the student portal.
                                    </AlertDescription>
                                </Alert>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormField name="fullName" control={control} render={({ field }) => (
                                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField name="email" control={control} render={({ field }) => (
                                        <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="student@college.edu" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField control={control} name="mobile" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mobile Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-muted-foreground">+91</span></div>
                                                    <Input placeholder="Enter 10-digit number" type="tel" maxLength={10} {...field} onChange={e => /^\d*$/.test(e.target.value) && field.onChange(e.target.value)} className="pl-12" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField name="whatsapp" control={control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WhatsApp Number</FormLabel>
                                             <FormControl>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-muted-foreground">+91</span></div>
                                                    <Input type="tel" maxLength={10} disabled={isWhatsappSame} {...field} onChange={e => /^\d*$/.test(e.target.value) && field.onChange(e.target.value)} className="pl-12" />
                                                </div>
                                            </FormControl>
                                            <div className="flex items-center space-x-2 pt-2">
                                                <Checkbox id="isWhatsappSame" checked={isWhatsappSame} onCheckedChange={(checked) => setValue('isWhatsappSame', !!checked)} />
                                                <label htmlFor="isWhatsappSame" className="text-sm font-medium leading-none">Same as mobile number as a whatsapp number</label>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </FormSection>

                            <FormSection title="Academic Details">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="collegeName" control={control} render={({ field }) => (
                                        <FormItem><FormLabel>College Name</FormLabel><FormControl><Input placeholder="Enter your college name" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField name="cityState" control={control} render={({ field }) => (
                                        <FormItem><FormLabel>City/State</FormLabel>
                                            <FormControl><Input placeholder="e.g. Chennai, Tamil Nadu" {...field} ref={(el) => { field.ref(el); cityStateInputRef.current = el; }} /></FormControl>
                                            <FormDescription>Please select your city from the suggestions for accuracy.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </FormSection>
                            
                            <FormSection title="Sport Selection">
                                <div className="space-y-3">
                                    <Label>Category Preference</Label>
                                    <div className="flex gap-4 items-center">
                                        {['Boys', 'Girls'].map(category => (
                                            <FormItem key={category} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={selectedCategories.includes(category)}
                                                        onCheckedChange={(checked) => {
                                                            setSelectedCategories(prev => 
                                                                checked ? [...prev, category] : prev.filter(c => c !== category)
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <Label className="font-normal">{category} Category</Label>
                                            </FormItem>
                                        ))}
                                    </div>
                                </div>
                                
                                <FormField control={control} name="selected_sport_ids" render={({ field }) => (
                                    <FormItem>
                                        <div className="space-y-6">
                                            {Object.keys(sportsByCategory).sort().map(category => (
                                                <div key={category}>
                                                    <h4 className="text-md font-semibold text-muted-foreground pb-2">{category} Sports</h4>
                                                    {sportsByCategory[category].length > 0 ? (
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                            {sportsByCategory[category].map((sport) => (
                                                                <FormItem key={sport.id} className="rounded-lg">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(sport.id.toString())}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                ? field.onChange([...(field.value || []), sport.id.toString()])
                                                                                : field.onChange(field.value?.filter((value) => value !== sport.id.toString()))
                                                                            }}
                                                                            className="sr-only"
                                                                            id={`sport-${sport.id}`}
                                                                        />
                                                                    </FormControl>
                                                                    <Label htmlFor={`sport-${sport.id}`} className="relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/10">
                                                                        {field.value?.includes(sport.id.toString()) && (
                                                                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                                                                <Check className="h-3 w-3" />
                                                                            </div>
                                                                        )}
                                                                        <p className="font-semibold text-center">{sport.name}</p>
                                                                        <p className="text-sm text-muted-foreground">₹{sport.amount}</p>
                                                                    </Label>
                                                                </FormItem>
                                                            ))}
                                                        </div>
                                                    ) : <p className="text-muted-foreground col-span-full text-center">No sports available for this category.</p>}
                                                </div>
                                            ))}
                                        </div>
                                        <FormMessage className="pt-2"/>
                                    </FormItem>
                                )}/>
                            </FormSection>

                             <FormSection title="Physical Director (PD) Information">
                                <FormField control={control} name="isPd" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>I am a Physical Director / managing a college-wide entry.</FormLabel>
                                            <FormDescription>Select this to provide your contact details for event coordination.</FormDescription>
                                        </div>
                                    </FormItem>
                                )} />
                                {isPd && (
                                    <div className="space-y-4 pt-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField name="pdName" control={control} render={({ field }) => (<FormItem><FormLabel>PD Name</FormLabel><FormControl><Input placeholder="Name of the Physical Director" {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField name="pdWhatsapp" control={control} render={({ field }) => (<FormItem><FormLabel>PD WhatsApp</FormLabel><FormControl><Input type="tel" placeholder="WhatsApp number for coordination" {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                         <div className="grid md:grid-cols-2 gap-4">
                                            <FormField name="collegeEmail" control={control} render={({ field }) => (<FormItem><FormLabel>College Office Email</FormLabel><FormControl><Input type="email" placeholder="Official college email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField name="collegeContact" control={control} render={({ field }) => (<FormItem><FormLabel>College Contact No.</FormLabel><FormControl><Input type="tel" placeholder="Landline or official contact" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    </div>
                                )}
                             </FormSection>

                             <motion.div variants={itemVariants}>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? "Processing..." : 'Register Now'}
                                </Button>
                             </motion.div>
                        </motion.form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

function FormSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <motion.div className="space-y-4" variants={itemVariants}>
            <h3 className="text-xl font-semibold font-headline border-b pb-2">{title}</h3>
            <div className="space-y-4 pt-4">{children}</div>
        </motion.div>
    );
}
