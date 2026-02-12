import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllRegistrations } from "./admin/AllRegistrations";
import { UserManagement } from "./admin/UserManagement";
import { MatchScheduler } from "./admin/MatchScheduler";
import { Users, ListChecks, CalendarCog } from 'lucide-react';

export function SuperAdminDashboard() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
                <p className="text-muted-foreground">Full administrative access to manage the event.</p>
            </div>
            <Tabs defaultValue="registrations" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="registrations">
                        <ListChecks className="mr-2 h-4 w-4" />
                        Registrations
                    </TabsTrigger>
                    <TabsTrigger value="users">
                        <Users className="mr-2 h-4 w-4" />
                        User Management
                    </TabsTrigger>
                    <TabsTrigger value="matches">
                        <CalendarCog className="mr-2 h-4 w-4" />
                        Match Scheduler
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="registrations" className="mt-4">
                    <AllRegistrations />
                </TabsContent>
                <TabsContent value="users">
                    <UserManagement />
                </TabsContent>
                <TabsContent value="matches">
                    <MatchScheduler />
                </TabsContent>
            </Tabs>
        </div>
    );
}
