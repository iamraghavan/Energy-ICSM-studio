import RoleDashboardLayout from "@/components/layout/RoleDashboardLayout";

export default function CommitteeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleDashboardLayout allowedRoles={['committee']} title="Committee Dashboard">
      {children}
    </RoleDashboardLayout>
  );
}
