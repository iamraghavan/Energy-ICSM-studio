import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MedalTallyPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Medal Tally</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Live medal tally will be displayed here. This page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
