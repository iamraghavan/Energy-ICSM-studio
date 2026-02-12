import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Schedule',
  description: 'Find the full event schedule for ENERGY 2026. Dates, times, prize money, and coordinator details for all matches.',
};

const scheduleData = [
  { event: "Badminton (M/W)", winnerPrize: "₹2000", runnerUpPrize: "₹1000", coordinator: "Dr. S. Sivamani", phone: "9994200058", date: "2026-03-12" },
  { event: "Table Tennis (M/W)", winnerPrize: "₹2000", runnerUpPrize: "₹1000", coordinator: "Ms. S. Sasikala", phone: "8428284829", date: "2026-03-12" },
  { event: "Chess (M/W)", winnerPrize: "₹2000", runnerUpPrize: "₹1000", coordinator: "Mr. D. Velavan", phone: "9942997667", date: "2026-03-12" },
  { event: "Cricket (M)", winnerPrize: "₹5000", runnerUpPrize: "₹3000", coordinator: "Mr. S. Rajkumar", phone: "9715997578", date: "2026-03-12" },
  { event: "Football (M)", winnerPrize: "₹5000", runnerUpPrize: "₹3000", coordinator: "Mr. S. Senthilkumar", phone: "9965185721", date: "2026-03-12" },
  { event: "Kabaddi (M)", winnerPrize: "₹5000", runnerUpPrize: "₹3000", coordinator: "Mr. K. Nelson", phone: "9655260429", date: "2026-03-13" },
  { event: "Volleyball (M)", winnerPrize: "₹5000", runnerUpPrize: "₹3000", coordinator: "Mr. D. Velavan", phone: "9942997667", date: "2026-03-13" },
  { event: "Volleyball (W)", winnerPrize: "₹5000", runnerUpPrize: "₹3000", coordinator: "Mr. D. Velavan", phone: "9942997667", date: "2026-03-14" },
  { event: "Basketball (M)", winnerPrize: "₹5000", runnerUpPrize: "₹3000", coordinator: "Mr. S. Senthilkumar", phone: "9965185721", date: "2026-03-14" },
];

const generateGoogleCalendarLink = (item: typeof scheduleData[0]) => {
  const eventDate = new Date(item.date);
  const startDate = eventDate.toISOString().replace(/-|:|\.\d+/g, '');
  
  const nextDay = new Date(eventDate);
  nextDay.setDate(eventDate.getDate() + 1);
  const endDate = nextDay.toISOString().replace(/-|:|\.\d+/g, '');

  const text = encodeURIComponent(`${item.event} - ENERGY 2026`);
  const details = encodeURIComponent(`Event Coordinator: ${item.coordinator} (${item.phone})`);
  
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDate}/${endDate}&details=${details}`;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = day === 11 || day === 12 || day === 13 ? 'th' : ['st', 'nd', 'rd'][((day + 90) % 100 - 10) % 10 - 1] || 'th';
    return `${day}${suffix} March ${date.getFullYear()}`;
};

export default function SchedulePage() {
    return (
        <div className="container py-8 md:py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Event Schedule</CardTitle>
                    <CardDescription>Details of Events, Prizes & Coordinators for ENERGY 2026.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Events (Men/Women)</TableHead>
                                    <TableHead>Winner Prize</TableHead>
                                    <TableHead>Runner Up Prize</TableHead>
                                    <TableHead>Co-ordinator</TableHead>
                                    <TableHead>Event Date</TableHead>
                                    <TableHead className="text-right">Reminder</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scheduleData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.event}</TableCell>
                                        <TableCell>{item.winnerPrize}</TableCell>
                                        <TableCell>{item.runnerUpPrize}</TableCell>
                                        <TableCell>
                                            {item.coordinator}
                                            <br />
                                            <a href={`tel:${item.phone}`} className="text-sm text-primary hover:underline">{item.phone}</a>
                                        </TableCell>
                                        <TableCell>{formatDate(item.date)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="icon">
                                                <Link href={generateGoogleCalendarLink(item)} target="_blank" rel="noopener noreferrer" title="Add to Google Calendar">
                                                    <CalendarPlus className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
