import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
