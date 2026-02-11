import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MedalsPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Medals</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Live medal standings will be displayed here. This page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
