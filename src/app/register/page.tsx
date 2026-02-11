"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import { createWorker } from 'tesseract.js';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { getColleges, getSports, registerStudent, type ApiSport } from "@/lib/api";
import { CheckCircle, CalendarIcon, Loader2, Trophy, Goal, Dribbble, Volleyball, PersonStanding, Waves, Swords, Disc, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sport, College } from "@/lib/types";
import { Logo } from "@/components/shared/logo";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const sportIconMap: { [key: string]: React.ElementType } = {
    'Cricket': Trophy,
    'Football': Goal,
    'Basketball': Dribbble,
    'Volleyball': Volleyball,
    'Athletics (100m)': PersonStanding,
    'Swimming': Waves,
    'Fencing': Swords,
    'Discus Throw': Disc,
};

const getSportIcon = (iconName: string) => {
    return sportIconMap[iconName] || HelpCircle;
};

const formSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters."),
    dob: z.date({ required_error: "Date of birth is required." }),
    gender: z.enum(['male', 'female', 'other'], { required_error: "Please select a gender." }),
    email: z.string().email("Invalid email address."),
    mobile: z.string().refine(isValidPhoneNumber, { message: "Invalid phone number." }),
    isWhatsappSame: z.boolean().default(false).optional(),
    whatsapp: z.string().optional(),
    
    collegeId: z.string({ required_error: "Please select your college."}),
    otherCollegeName: z.string().optional(),
    department: z.string().min(2, "Department is required."),
    year: z.enum(['I', 'II', 'III', 'IV', 'PG-I', 'PG-II'], { required_error: "Please select your year of study." }),
    cityState: z.string().min(2, "City/State is required."),
    
    sportType: z.enum(['Individual', 'Team'], { required_error: "Please select an event type." }),
    sportId: z.string({ required_error: "Please select a sport." }),
    teamName: z.string().optional(),

    needsAccommodation: z.boolean().default(false),
    transactionId: z.string().min(1, "Transaction ID is required."),
    paymentScreenshot: z.any()
        .refine((files) => files?.length == 1, "Payment screenshot is required.")
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
        .refine(
            (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
            "Only .jpg, .jpeg and .png formats are supported."
        ),
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
});

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
    const { toast } = useToast();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [colleges, setColleges] = useState<College[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [filteredSports, setFilteredSports] = useState<Sport[]>([]);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isOcrLoading, setIsOcrLoading] = useState(false);

    const form = useForm<FormData>({
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [collegesData, sportsData] = await Promise.all([getColleges(), getSports()]);
                setColleges(collegesData);
                const sportsWithIcons = sportsData.map((s: ApiSport) => ({...s, icon: getSportIcon(s.icon)}));
                setSports(sportsWithIcons);
            } catch (error) {
                console.error('Failed to fetch initial data', error);
                toast({
                    variant: 'destructive',
                    title: 'Failed to load data',
                    description: 'Could not fetch colleges and sports. Please try refreshing the page.'
                })
            }
        }
        fetchData();
    }, [toast]);

    const { watch, setValue } = form;
    const sportType = watch('sportType');
    const collegeId = watch('collegeId');
    const isWhatsappSame = watch('isWhatsappSame');
    const mobile = watch('mobile');
    const paymentScreenshot = watch('paymentScreenshot');

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

    const onSubmit = async (data: FormData) => {
        const apiFormData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'dob' && value instanceof Date) {
                apiFormData.append(key, value.toISOString());
            } else if (key === 'paymentScreenshot') {
                apiFormData.append(key, value[0]);
            } else if (value !== null && value !== undefined) {
                apiFormData.append(key, String(value));
            }
        });

        try {
            const result = await registerStudent(apiFormData);
            console.log("Form submission successful:", result);
            setFormData(data);
            setSubmitted(true);
            toast({
                title: "Registration Successful!",
                description: `Your Registration ID is ${result.registrationId}. A confirmation has been sent to your email.`,
            });
        } catch (error: any) {
            console.error("Form submission error:", error);
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.response?.data?.error || "An unknown error occurred. Please try again.",
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
                            <p className="text-muted-foreground">Your Registration ID: <span className="font-mono text-primary">REG{Date.now()}</span></p>
                            <p className="text-muted-foreground text-sm">A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>.</p>
                            <Button asChild><a href="/">Back to Home</a></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { formState: { isSubmitting } } = form;

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
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1950-01-01")} initialFocus />
                                                </PopoverContent>
                                            </Popover>
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
                                            <PhoneInput
                                                placeholder="Enter phone number"
                                                defaultCountry="IN"
                                                international
                                                withCountryCallingCode
                                                {...field}
                                            />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField name="whatsapp" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>WhatsApp Number</FormLabel>
                                            <FormControl><Input type="tel" disabled={isWhatsappSame} {...field} /></FormControl>
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
                                                    {filteredSports.map(s => <SelectItem key={s.id} value={s.id} disabled={s.slotsLeft === 0}>{s.name} - {s.slotsLeft > 0 ? `${s.slotsLeft} slots left`: 'Slots Full'}</SelectItem>)}
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
                                        <p className="font-bold text-lg text-primary">₹150</p>
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
