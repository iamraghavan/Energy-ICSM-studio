"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { colleges, sports } from "@/lib/data";
import { CheckCircle } from "lucide-react";

const personalDetailsSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
});

const collegeInfoSchema = z.object({
    collegeId: z.string().min(1, "Please select your college"),
    studentId: z.string().min(3, "Student ID is required"),
});

const sportSelectionSchema = z.object({
    sportId: z.string().min(1, "Please select a sport"),
});

type PersonalDetails = z.infer<typeof personalDetailsSchema>;
type CollegeInfo = z.infer<typeof collegeInfoSchema>;
type SportSelection = z.infer<typeof sportSelectionSchema>;

const steps = [
  { id: 1, name: "Personal Details" },
  { id: 2, name: "College Information" },
  { id: 3, name: "Sport Selection" },
  { id: 4, name: "Confirmation" },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const searchParams = useSearchParams();
  const initialSportId = searchParams.get('sport');

  const goNext = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    if (currentStep < steps.length) {
      setCurrentStep(step => step + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };
  
  const progress = ((currentStep) / (steps.length -1)) * 100;
  
  const defaultValues = { ...formData, sportId: initialSportId || undefined };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline">Energy Sports Meet Registration</CardTitle>
          {currentStep < steps.length - 1 && (
            <>
              <CardDescription>Step {currentStep + 1} of {steps.length - 1}: {steps[currentStep].name}</CardDescription>
              <Progress value={progress} className="mt-4" />
            </>
          )}
        </CardHeader>
        <CardContent>
            {currentStep === 0 && <PersonalDetailsForm goNext={goNext} defaultValues={defaultValues} />}
            {currentStep === 1 && <CollegeInfoForm goNext={goNext} goPrev={goPrev} defaultValues={defaultValues} />}
            {currentStep === 2 && <SportSelectionForm goNext={goNext} goPrev={goPrev} defaultValues={defaultValues} />}
            {currentStep === 3 && <ConfirmationStep data={formData} goPrev={goPrev} />}
        </CardContent>
      </Card>
    </div>
  );
}

function PersonalDetailsForm({ goNext, defaultValues }: { goNext: (data: PersonalDetails) => void, defaultValues: any }) {
  const form = useForm<PersonalDetails>({ resolver: zodResolver(personalDetailsSchema), defaultValues });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(goNext)} className="space-y-6">
        <FormField name="fullName" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="email" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="phone" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} type="tel" /></FormControl><FormMessage /></FormItem>
        )} />
        <CardFooter className="p-0 pt-6"><Button type="submit" className="w-full">Next</Button></CardFooter>
      </form>
    </Form>
  );
}

function CollegeInfoForm({ goNext, goPrev, defaultValues }: { goNext: (data: CollegeInfo) => void, goPrev: () => void, defaultValues: any }) {
    const form = useForm<CollegeInfo>({ resolver: zodResolver(collegeInfoSchema), defaultValues });
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(goNext)} className="space-y-6">
            <FormField name="collegeId" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>College</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select your college" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="studentId" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Student ID Card Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <CardFooter className="p-0 pt-6 flex justify-between"><Button type="button" variant="outline" onClick={goPrev}>Back</Button><Button type="submit">Next</Button></CardFooter>
        </form>
      </Form>
    );
}

function SportSelectionForm({ goNext, goPrev, defaultValues }: { goNext: (data: SportSelection) => void, goPrev: () => void, defaultValues: any }) {
    const form = useForm<SportSelection>({ resolver: zodResolver(sportSelectionSchema), defaultValues });
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(goNext)} className="space-y-6">
          <FormField name="sportId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Sport</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a sport to participate in" /></SelectTrigger></FormControl>
                  <SelectContent>
                      {sports.map(s => <SelectItem key={s.id} value={s.id} disabled={s.slotsLeft === 0}>{s.name} ({s.type}) - {s.slotsLeft} slots left</SelectItem>)}
                  </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <CardFooter className="p-0 pt-6 flex justify-between"><Button type="button" variant="outline" onClick={goPrev}>Back</Button><Button type="submit">Review</Button></CardFooter>
        </form>
      </Form>
    );
}
  
function ConfirmationStep({ data, goPrev }: { data: any, goPrev: () => void }) {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        console.log("Form data submitted:", data);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="text-center space-y-4 py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold font-headline">Registration Successful!</h2>
                <p className="text-muted-foreground">Thank you for registering. We've sent a confirmation to your email.</p>
                <Button asChild><a href="/">Back to Home</a></Button>
            </div>
        )
    }

    const selectedCollege = colleges.find(c => c.id === data.collegeId)?.name;
    const selectedSport = sports.find(s => s.id === data.sportId)?.name;

    return (
      <div className="space-y-6">
        <div className="space-y-2">
            <h3 className="font-semibold font-headline">Confirm Your Details</h3>
            <p className="text-sm text-muted-foreground">Please review your information carefully before submitting.</p>
        </div>
        <div className="space-y-4 rounded-md border p-4 bg-muted/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><p className="font-medium">Full Name:</p><p>{data.fullName}</p></div>
                <div><p className="font-medium">Email:</p><p>{data.email}</p></div>
                <div><p className="font-medium">Phone:</p><p>{data.phone}</p></div>
                <div><p className="font-medium">College:</p><p>{selectedCollege}</p></div>
                <div><p className="font-medium">Student ID:</p><p>{data.studentId}</p></div>
                <div><p className="font-medium">Selected Sport:</p><p>{selectedSport}</p></div>
            </div>
        </div>
        <CardFooter className="p-0 pt-6 flex justify-between"><Button type="button" variant="outline" onClick={goPrev}>Back</Button><Button onClick={handleSubmit}>Confirm & Register</Button></CardFooter>
      </div>
    );
}
