/**
 * Renders the correct dashboard based on the user's role.
 * - creator → CreatorDashboard
 * - brand   → BrandDashboard
 * - admin   → AdminDashboard
 */
import { useAuth } from "../context/auth-context";
import { CreatorDashboard } from "./creator-dashboard";
import { BrandDashboard } from "./brand-dashboard";
import { AdminDashboard } from "./admin-dashboard";

export function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "brand") return <BrandDashboard />;
  return <CreatorDashboard />;
}
