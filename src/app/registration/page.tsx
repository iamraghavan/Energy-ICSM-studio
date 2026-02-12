import { getSports } from "@/lib/api";
import { RegisterForm } from "./register-form";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default async function RegisterPage() {
    let sports;
    
    try {
        sports = await getSports();
    } catch (error) {
        console.error("Failed to load registration data:", error);
    }
    
    if (!sports || sports.length === 0) {
         return (
            <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                        <CardTitle className="text-destructive mt-4">Could Not Load Form</CardTitle>
                        <CardDescription>
                            We were unable to load the necessary data for the registration form. The backend service may be temporarily unavailable. Please try refreshing the page in a few moments.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return <RegisterForm sports={sports} />;
}
