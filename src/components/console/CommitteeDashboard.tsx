import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { QrCode } from "lucide-react";

export function CommitteeDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Committee Dashboard</CardTitle>
                <CardDescription>Participant Check-in</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                    <QrCode className="w-24 h-24 text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">The &lt;QRCodeScanner /&gt; component for check-ins will be displayed here.</p>
                </div>
            </CardContent>
        </Card>
    );
}
