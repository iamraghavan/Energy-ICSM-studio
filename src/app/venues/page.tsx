import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VenuesPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Event Venues</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Details about the event venues. This page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
