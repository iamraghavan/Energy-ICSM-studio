import RoleDashboardLayout from "@/components/layout/RoleDashboardLayout";

export default function ScorerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleDashboardLayout allowedRoles={['scorer']} title="Scorer Dashboard">
      {children}
    </RoleDashboardLayout>
  );
}
