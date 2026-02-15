import RoleDashboardLayout from "@/components/layout/RoleDashboardLayout";

export default function SportsHeadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleDashboardLayout allowedRoles={['sports_head']} title="Sports Head Dashboard">
      {children}
    </RoleDashboardLayout>
  );
}
