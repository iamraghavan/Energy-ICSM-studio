'use client';
import { type ApiSport } from "@/lib/api";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};


export function SportsGridPreview({ sports }: { sports: ApiSport[] }) {
    const uniqueSports = Array.from(new Map(sports.map(item => [item.name, item])).values());
    const featuredSports = uniqueSports.slice(0, 4);

    return (
        <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline">Featured Sports</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Explore some of the exciting sports you can participate in. Click "View All Sports" to see the full list.</p>
            </motion.div>
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
            >
                {featuredSports.map((sport) => {
                    return (
                       <motion.div key={sport.id} variants={itemVariants}>
                            <Link href="/energy/2026/sports">
                                <Card className="group relative overflow-hidden text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                                    <CardContent className="flex flex-col items-center justify-center p-6 min-h-[150px]">
                                        <CardTitle className="mb-2 font-headline text-2xl">{sport.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{sport.type}</p>
                                    </CardContent>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                                        <p className="text-white font-semibold flex items-center">Explore <ArrowRight className="ml-2 h-4 w-4" /></p>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    )
                })}
            </motion.div>
            <motion.div variants={itemVariants} className="text-center mt-12">
                <Button asChild size="lg">
                    <Link href="/energy/2026/sports">View All Sports</Link>
                </Button>
            </motion.div>
        </motion.section>
    );
}
