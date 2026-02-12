import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, MapPin } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the organizers of ENERGY 2026 for any inquiries about registration or the event.',
};

const contactDetails = [
    {
        name: "D. Velavan",
        title: "Senior Physical Director",
        phone: "9942997667"
    },
    {
        name: "K. Nelson",
        title: "Physical Director",
        phone: "9655260429"
    },
    {
        name: "S. Senthil Kumar",
        title: "Physical Director",
        phone: "9965185721"
    }
]

export default function ContactPage() {
    return (
        <div className="container py-8 md:py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Contact Us</CardTitle>
                    <CardDescription>For registration or other details, please get in touch with our coordinators.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold font-headline text-foreground mb-4">Event Coordinators</h3>
                            <div className="space-y-4">
                                {contactDetails.map(contact => (
                                    <div key={contact.name} className="flex items-center gap-4">
                                        <Phone className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-semibold">{contact.name}</p>
                                            <p className="text-sm text-muted-foreground">{contact.title}</p>
                                            <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline">{contact.phone}</a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-xl font-semibold font-headline text-foreground mb-4">Venue</h3>
                             <div className="flex items-start gap-4">
                                <MapPin className="h-5 w-5 text-primary mt-1" />
                                <div>
                                    <p className="font-semibold">E.G.S. Pillay Engineering College (Autonomous)</p>
                                    <p className="text-sm text-muted-foreground">
                                        Old Nagore Road, Thethi, Nagapattinam – 611 002.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg overflow-hidden border">
                         <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3921.83751717387!2d79.8456889152679!3d10.7686889924376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5524e4d7681f39%3A0x8c792a7ed8f8a25c!2sE.G.S.+Pillay+Engineering+College!5e0!3m2!1sen!2sin!4v1512117182531"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
