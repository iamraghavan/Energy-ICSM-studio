import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GalleryPage() {
    return (
        <div className="container py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Event Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">A gallery of photos from the event. This page is under construction.</p>
                </CardContent>
            </Card>
        </div>
    );
}
