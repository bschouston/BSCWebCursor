import { AdminLayout } from "@/components/dashboard/admin-layout";

export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
