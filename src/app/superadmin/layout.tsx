import { SuperAdminLayout } from "@/components/dashboard/superadmin-layout";

export default function SuperAdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
