'use client';

import { getSports, type ApiSport } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};


export default function SportsPage() {
    const [sports, setSports] = useState<ApiSport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        getSports()
            .then(setSports)
            .catch(() => setSports([]))
            .finally(() => setIsLoading(false));
    }, []);

    const sportsByCategory = useMemo(() => {
        return sports.reduce((acc, sport) => {
            const category = sport.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(sport);
            return acc;
        }, {} as Record<string, ApiSport[]>);
    }, [sports]);

    const defaultTab = useMemo(() => Object.keys(sportsByCategory).sort()[0] || "Boys", [sportsByCategory]);

    return (
        <motion.div 
            className="container py-8 md:py-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div className="mb-8 text-center" variants={itemVariants}>
                <h1 className="text-4xl font-bold font-headline">All Sports</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Browse all available sports and register for the events. Click on any card to start the registration process.</p>
            </motion.div>
            
            {isLoading ? (
                <div className="space-y-8">
                    <Skeleton className="h-10 w-full max-w-sm mx-auto" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48" />)}
                    </div>
                </div>
            ) : sports.length > 0 ? (
                 <motion.div variants={itemVariants}>
                    <Tabs defaultValue={defaultTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
                            {Object.keys(sportsByCategory).sort().map(category => (
                                <TabsTrigger key={category} value={category}>{category} Sports</TabsTrigger>
                            ))}
                        </TabsList>
                        {Object.keys(sportsByCategory).sort().map(category => (
                            <TabsContent key={category} value={category} className="mt-8">
                                <div className="mb-8">
                                    <h2 className={`text-3xl font-bold font-headline text-center ${category === 'Boys' ? 'text-primary' : 'text-destructive'}`}>{category} Sports</h2>
                                </div>
                                <motion.div 
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    variants={containerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.2 }}
                                >
                                    {sportsByCategory[category].map((sport) => (
                                        <motion.div key={sport.id} variants={itemVariants}>
                                            <Card className="group relative flex flex-col overflow-hidden text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
                                                <CardHeader className="pt-6">
                                                    <CardTitle className="font-headline text-2xl min-h-[3rem] flex items-center justify-center">{sport.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex flex-1 flex-col justify-center p-6 pt-0">
                                                    <div className="w-full space-y-3 text-sm">
                                                        <div className="flex justify-between border-t pt-3">
                                                            <span className="text-muted-foreground">Type</span>
                                                            <span className="font-semibold">{sport.type}</span>
                                                        </div>
                                                        <div className="flex justify-between border-t pt-3">
                                                            <span className="text-muted-foreground">Max Players</span>
                                                            <span className="font-semibold">{sport.max_players}</span>
                                                        </div>
                                                        <div className="flex justify-between border-t pt-3">
                                                            <span className="text-muted-foreground">Fee</span>
                                                            <span className="font-semibold">₹{sport.amount}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <Button asChild size="lg">
                                                        <Link href={`/energy/2026/registration?sport=${sport.id}`}>
                                                            Register Now
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </TabsContent>
                        ))}
                    </Tabs>
                 </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="text-center py-16 text-muted-foreground border rounded-lg">
                    <p>No sports are available for registration at the moment.</p>
                </motion.div>
            )}
        </motion.div>
    );
}