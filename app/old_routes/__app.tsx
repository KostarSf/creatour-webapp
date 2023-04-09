import { Outlet } from "@remix-run/react";
import AppLayout from "~/components/AppLayout";

export default function AppLayoutRoot() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
