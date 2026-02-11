"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import { createWorker } from 'tesseract.js';
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { registerStudent, type ApiSport } from "@/lib/api";
import { CheckCircle, Loader2, Trophy, Goal, Dribbble, Volleyball, PersonStanding, Waves, Swords, Disc, HelpCircle } from "lucide-react";
import type { College } from "@/lib/types";
import { Logo } from "@/components/shared/logo";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const sportIconMap: { [key: string]: React.ElementType } = {
    'Cricket': Trophy,
    'Football': Goal,
    'Basketball': Dribbble,
    'Volleyball': Volleyball,
    '100m Dash': PersonStanding,
    'Swimming': Waves,
    'Fencing': Swords,
    'Discus Throw': Disc,
};

const getSportIcon = (iconName: string) => {
    return sportIconMap[iconName] || HelpCircle;
};

const formSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters."),
    dob: z.date({ required_error: "Date of birth is required." }).refine((date) => {
        const sixteenYearsAgo = new Date();
        sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
        return date <= sixteenYearsAgo;
    }, { message: "You must be at least 16 years old." }),
    gender: z.enum(['male', 'female', 'other'], { required_error: "Please select a gender." }),
    email: z.string().email("Invalid email address."),
    mobile: z.string().length(10, { message: "Mobile number must be 10 digits." }),
    isWhatsappSame: z.boolean().default(false).optional(),
    whatsapp: z.string().optional().or(z.literal('')),
    
    collegeId: z.string({ required_error: "Please select your college."}),
    otherCollegeName: z.string().optional(),
    department: z.string().min(2, "Department is required."),
    year: z.enum(['I', 'II', 'III', 'IV', 'PG-I', 'PG-II'], { required_error: "Please select your year of study." }),
    cityState: z.string().min(2, "City/State is required."),
    
    sportType: z.enum(['Individual', 'Team'], { required_error: "Please select an event type." }),
    sportId: z.string({ required_error: "Please select a sport." }),
    teamName: z.string().optional(),

    needsAccommodation: z.boolean().default(false),
    paymentScreenshot: z.any()
        .refine((files) => files?.length == 1, "Payment screenshot is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            "Only .jpg, .jpeg and .png formats are supported."
        ),
    transactionId: z.string().min(1, "Transaction ID is required."),
}).refine(data => {
    if (data.collegeId === 'other') {
        return !!data.otherCollegeName && data.otherCollegeName.length > 2;
    }
    return true;
}, {
    message: "Please enter your college name.",
    path: ["otherCollegeName"],
}).refine(data => {
    if (data.sportType === 'Team') {
        return !!data.teamName && data.teamName.length > 2;
    }
    return true;
}, {
    message: "Team name is required for team events.",
    path: ["teamName"],
}).refine(data => {
    if (!data.isWhatsappSame && data.whatsapp) {
        return data.whatsapp.length === 10;
    }
    return true;
}, {
    message: "WhatsApp number must be 10 digits.",
    path: ["whatsapp"],
});

type FormSchema = z.infer<typeof formSchema>;

type FormSport = {
    id: string;
    name: string;
    type: "Team" | "Individual";
    icon: React.ElementType;
    amount: string;
};

export function RegisterForm({ colleges, sports: apiSports }: { colleges: College[], sports: ApiSport[] }) {
    const { toast } = useToast();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<FormSchema | null>(null);
    const [registrationId, setRegistrationId] = useState<string>('');
    const [filteredSports, setFilteredSports] = useState<FormSport[]>([]);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [registrationFee, setRegistrationFee] = useState("0.00");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const sports = useMemo(() => {
        if (!apiSports) return [];
        return apiSports.map((s) => ({
            ...s, 
            id: String(s.id),
            icon: getSportIcon(s.name)
        }));
    }, [apiSports]);

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isWhatsappSame: false,
            needsAccommodation: false,
            fullName: "",
            email: "",
            mobile: "",
            whatsapp: "",
            collegeId: "",
            otherCollegeName: "",
            department: "",
            cityState: "",
            sportId: "",
            teamName: "",
            transactionId: "",
        }
    });

    const { watch, setValue } = form;
    const sportType = watch('sportType');
    const collegeId = watch('collegeId');
    const isWhatsappSame = watch('isWhatsappSame');
    const mobile = watch('mobile');
    const paymentScreenshot = watch('paymentScreenshot');
    const sportId = watch('sportId');

    useEffect(() => {
        if (sportId) {
            const selectedSport = sports.find(s => s.id === sportId);
            if (selectedSport) {
                setRegistrationFee(parseFloat(selectedSport.amount).toFixed(2));
            }
        } else {
            setRegistrationFee("0.00");
        }
    }, [sportId, sports]);

    useEffect(() => {
        if (sportType) {
            setFilteredSports(sports.filter(s => s.type === sportType));
            setValue('sportId', ''); // Reset sport selection
        }
    }, [sportType, setValue, sports]);
    
    useEffect(() => {
        if (isWhatsappSame) {
            setValue('whatsapp', watch('mobile'));
        } else {
            setValue('whatsapp', '');
        }
    }, [isWhatsappSame, mobile, setValue, watch]);

    useEffect(() => {
        if (paymentScreenshot && paymentScreenshot.length > 0) {
            const file = paymentScreenshot[0];
            if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setScreenshotPreview(reader.result as string);
                };
                reader.readAsDataURL(file);

                const runOcr = async () => {
                    setIsOcrLoading(true);
                    toast({
                        title: 'Analyzing Screenshot...',
                        description: 'Extracting transaction ID. Please wait.',
                    });
                    try {
                        const worker = await createWorker('eng');
                        const { data: { text } } = await worker.recognize(file);
                        
                        const patterns = [
                            /(?:Transaction|Ref|Reference|ID|No|Utr)\.?:?\s*([a-zA-Z0-9]{12,})/i,
                            /(\b\d{12,}\b)/, 
                        ];

                        let transactionId: string | null = null;
                        for (const pattern of patterns) {
                            const match = text.match(pattern);
                            if (match && match[1]) {
                                transactionId = match[1];
                                break;
                            }
                        }

                        if (!transactionId) {
                            const genericMatch = text.match(/\b([a-zA-Z0-9]{12,})\b/);
                             if (genericMatch && genericMatch[0]) {
                                transactionId = genericMatch[0];
                            }
                        }

                        if (transactionId) {
                            setValue('transactionId', transactionId, { shouldValidate: true });
                            toast({
                                title: "Transaction ID Found!",
                                description: `We've auto-filled the ID: ${transactionId}`,
                            });
                        } else {
                            toast({
                                variant: "destructive",
                                title: "Could not find Transaction ID",
                                description: "Please enter the Transaction ID manually.",
                            });
                        }

                        await worker.terminate();
                    } catch (error) {
                        console.error('OCR Error:', error);
                        toast({
                            variant: "destructive",
                            title: "OCR Failed",
                            description: "Could not read the screenshot. Please enter the ID manually.",
                        });
                    } finally {
                        setIsOcrLoading(false);
                    }
                };
                runOcr();

            } else {
                 setScreenshotPreview(null);
            }
        } else {
            setScreenshotPreview(null);
        }
    }, [paymentScreenshot, setValue, toast]);

    useEffect(() => {
        if (collegeId && collegeId !== 'other') {
            const selectedCollege = colleges.find(c => c.id === collegeId);
            if (selectedCollege) {
                setValue('cityState', `${selectedCollege.city}, ${selectedCollege.state}`);
            }
        }
    }, [collegeId, colleges, setValue]);

    const onSubmit = async (data: FormSchema) => {
        const apiFormData = new FormData();
        
        const snakeCaseData: { [key: string]: any } = {
            name: data.fullName,
            dob: format(data.dob, 'yyyy-MM-dd'),
            gender: data.gender,
            email: data.email,
            mobile: data.mobile,
            department: data.department,
            year_of_study: data.year,
            sport_id: data.sportId,
            txn_id: data.transactionId,
        };

        if (data.isWhatsappSame) {
            snakeCaseData.whatsapp = data.mobile;
        } else if (data.whatsapp) {
            snakeCaseData.whatsapp = data.whatsapp;
        }

        if (data.collegeId === 'other') {
            snakeCaseData.other_college = data.otherCollegeName;
        } else {
            snakeCaseData.college_id = data.collegeId;
        }

        const [city, state] = data.cityState.split(',').map(s => s.trim());
        if(city) snakeCaseData.city = city;
        if(state) snakeCaseData.state = state;

        if (data.sportType === 'Team' && data.teamName) {
            snakeCaseData.create_team = 'true';
            snakeCaseData.team_name = data.teamName;
        }

        for (const key in snakeCaseData) {
            if (snakeCaseData[key] !== undefined && snakeCaseData[key] !== null) {
                apiFormData.append(key, snakeCaseData[key]);
            }
        }

        if (data.paymentScreenshot && data.paymentScreenshot.length > 0) {
            apiFormData.append('screenshot', data.paymentScreenshot[0]);
        }

        try {
            const result = await registerStudent(apiFormData);
            console.log("Form submission successful:", result);
            setFormData(data);
            setSubmitted(true);
            setRegistrationId(result.registrationId);
            toast({
                title: "Registration Successful!",
                description: `Your Registration ID is ${result.registrationId}. A confirmation has been sent to your email.`,
            });
        } catch (error: any) {
            console.error("Form submission error:", error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || "An unknown error occurred. Please try again.";
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: errorMessage,
            });
        }
    };

    if (submitted && formData) {
        return (
            <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4 py-8">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                            <h2 className="text-2xl font-bold font-headline">Registration Successful!</h2>
                            <p className="text-muted-foreground">Your Registration ID: <span className="font-mono text-primary">{registrationId}</span></p>
                            <p className="text-muted-foreground text-sm">A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>.</p>
                            <Button asChild><a href="/">Back to Home</a></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { formState: { isSubmitting } } = form;

    const sixteenYearsAgo = new Date();
    sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);

    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl my-8">
                <CardHeader className="text-center">
                    <div className="mx-auto">
                        <Logo />
                    </div>
                    <CardTitle className="font-headline text-3xl mt-4">Energy Sports Meet 2026 Registration</CardTitle>
                    <CardDescription>Join the ultimate inter-college showdown!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Personal Information */}
                            <FormSection title="Personal Details">
                                <FormField name="fullName" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField name="dob" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    className="w-full"
                                                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            const date = new Date(e.target.value);
                                                            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                                                            field.onChange(new Date(date.getTime() + userTimezoneOffset));
                                                        } else {
                                                            field.onChange(undefined);
                                                        }
                                                    }}
                                                    max={isClient ? sixteenYearsAgo.toISOString().split("T")[0] : undefined}
                                                    min="1950-01-01"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="gender" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField name="email" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="student@college.edu" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="mobile"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mobile Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span className="text-muted-foreground">+91</span>
                                                    </div>
                                                    <Input
                                                        placeholder="Enter 10-digit number"
                                                        type="tel"
                                                        maxLength={10}
                                                        {...field}
                                                        onChange={e => {
                                                            const { value } = e.target;
                                                            if (/^\d*$/.test(value)) {
                                                                field.onChange(value);
                                                            }
                                                        }}
                                                        className="pl-12"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField name="whatsapp" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WhatsApp Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span className="text-muted-foreground">+91</span>
                                                    </div>
                                                    <Input 
                                                        type="tel" 
                                                        maxLength={10}
                                                        disabled={isWhatsappSame} 
                                                        {...field} 
                                                        onChange={e => {
                                                            const { value } = e.target;
                                                            if (/^\d*$/.test(value)) {
                                                                field.onChange(value);
                                                            }
                                                        }}
                                                        className="pl-12"
                                                    />
                                                </div>
                                            </FormControl>
                                            <div className="flex items-center space-x-2 pt-2">
                                                <Checkbox id="isWhatsappSame" checked={isWhatsappSame} onCheckedChange={(checked) => setValue('isWhatsappSame', !!checked)} />
                                                <label htmlFor="isWhatsappSame" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Same as mobile</label>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </FormSection>

                            {/* Academic Details */}
                            <FormSection title="Academic Details">
                                <FormField name="collegeId" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>College Name</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Search and select your college" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                {collegeId === 'other' && (
                                     <FormField name="otherCollegeName" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Enter Your College Name</FormLabel><FormControl><Input placeholder="Your college name" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField name="department" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="e.g. CSE" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField name="year" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year of Study</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {['I', 'II', 'III', 'IV', 'PG-I', 'PG-II'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="cityState" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>City/State</FormLabel><FormControl><Input placeholder="e.g. Chennai, Tamil Nadu" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </FormSection>
                            
                             {/* Sport Selection */}
                             <FormSection title="Sport Selection">
                                <FormField name="sportType" control={form.control} render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Event Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="Individual" /></FormControl>
                                                    <FormLabel className="font-normal">Individual Event</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl><RadioGroupItem value="Team" /></FormControl>
                                                    <FormLabel className="font-normal">Team Event</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                {sportType && (
                                     <FormField name="sportId" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sport</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder={`Select a ${sportType.toLowerCase()} sport`} /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {filteredSports.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                                {sportType === 'Team' && (
                                    <FormField name="teamName" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Team Name</FormLabel><FormControl><Input placeholder="Enter your team name" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                )}
                             </FormSection>

                             {/* Accommodation & Payment */}
                             <FormSection title="Accommodation & Payment">
                                <FormField control={form.control} name="needsAccommodation" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>I require accommodation during the event.</FormLabel>
                                            <FormDescription>Note: Accommodation charges may apply separately.</FormDescription>
                                        </div>
                                    </FormItem>
                                )} />
                                
                                <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium">Registration Fee:</p>
                                        <p className="font-bold text-lg text-primary">₹{registrationFee}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Please pay using the QR code below, upload the screenshot, and we will attempt to find the transaction ID for you.</p>
                                    <div className="flex justify-center">
                                        <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=example@upi" alt="Payment QR Code" width={150} height={150} />
                                    </div>
                                     <FormField control={form.control} name="paymentScreenshot" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Upload Payment Screenshot</FormLabel>
                                            <FormControl>
                                                <Input type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={(e) => field.onChange(e.target.files)} />
                                            </FormControl>
                                            <FormDescription>File must be a JPG, or PNG under 5MB.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                     )} />
                                     {screenshotPreview && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2">Screenshot Preview:</p>
                                            <Image src={screenshotPreview} alt="Screenshot preview" width={200} height={400} className="rounded-md border object-contain" />
                                        </div>
                                     )}
                                     <FormField name="transactionId" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                Transaction ID
                                                {isOcrLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder={isOcrLoading ? "Reading from screenshot..." : "Enter the UPI Transaction ID"} 
                                                    {...field} 
                                                    disabled={isOcrLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                             </FormSection>

                            <Button type="submit" className="w-full" disabled={isSubmitting || isOcrLoading}>
                                {(isSubmitting || isOcrLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Processing..." : (isOcrLoading ? 'Analyzing...' : 'Complete Registration')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

function FormSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline border-b pb-2">{title}</h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
}
