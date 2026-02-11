import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export function SuperAdminDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Super Admin Dashboard</CardTitle>
                <CardDescription>Full administrative access</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Components to render here:</p>
                <ul className="list-disc pl-5 mt-2 text-muted-foreground">
                    <li>&lt;UserManagement /&gt;</li>
                    <li>&lt;AllRegistrations /&gt;</li>
                    <li>&lt;VerifyPaymentModal /&gt;</li>
                    <li>&lt;MatchScheduler /&gt;</li>
                </ul>
            </CardContent>
        </Card>
    );
}
