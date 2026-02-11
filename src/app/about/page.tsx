import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">About Energy Sports Meet</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Information about the event. This page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
