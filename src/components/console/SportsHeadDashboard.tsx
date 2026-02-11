import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export function SportsHeadDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sports Head Dashboard</CardTitle>
                 <CardDescription>Manage your designated sport</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Components to render here:</p>
                 <ul className="list-disc pl-5 mt-2 text-muted-foreground">
                    <li>&lt;MySportRegistrations /&gt; (filtered for your sport)</li>
                    <li>&lt;VerifyPaymentModal /&gt; (for your sport only)</li>
                    <li>&lt;MatchScheduler /&gt;</li>
                </ul>
            </CardContent>
        </Card>
    );
}
