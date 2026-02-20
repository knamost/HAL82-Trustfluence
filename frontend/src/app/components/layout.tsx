/**
 * Layout — DocApp-inspired, sidebar-based shell.
 * Public pages (landing, auth) render without sidebar.
 * Authenticated pages get sidebar navigation + top bar.
 */
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/auth-context";
import {
  Home,
  Search,
  LayoutDashboard,
  FileText,
  Star,
  LogOut,
  Menu,
  X,
  Users,
  Shield,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useState } from "react";

/* ── Nav items by role ──────────────────────────────────────────── */
function getNavItems(role: string | undefined) {
  const common = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/creators", icon: Search, label: "Discover Creators" },
  ];

  if (role === "creator") {
    return [
      ...common,
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/requirements", icon: FileText, label: "Opportunities" },
      { to: "/reviews", icon: Star, label: "Reviews" },
    ];
  }

  if (role === "brand") {
    return [
      ...common,
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/requirements", icon: FileText, label: "Requirements" },
      { to: "/reviews", icon: Star, label: "Reviews" },
    ];
  }

  if (role === "admin") {
    return [
      { to: "/", icon: Home, label: "Home" },
      { to: "/dashboard", icon: Shield, label: "Admin Panel" },
      { to: "/creators", icon: Users, label: "Creators" },
      { to: "/requirements", icon: FileText, label: "Requirements" },
      { to: "/reviews", icon: Star, label: "Reviews" },
    ];
  }

  // Not logged in
  return common;
}

/* ── Sidebar ──────────────────────────────────────────── */
function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = getNavItems(user?.role);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border
          flex flex-col transition-transform duration-200
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          <span className="text-lg font-semibold text-foreground">Trustfluence</span>
          <button className="ml-auto lg:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User / Auth */}
        <div className="border-t border-border p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.firstName
                      ? `${user.firstName} ${user.lastName || ""}`
                      : user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                  onClose();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

/* ── Top bar ──────────────────────────────────────────── */
function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-border">
      <button className="lg:hidden p-2 hover:bg-muted rounded-xl" onClick={onMenuClick}>
        <Menu size={20} />
      </button>

      <div className="hidden lg:block">
        {isAuthenticated && (
          <h2 className="text-lg font-semibold text-foreground">
            Welcome back, {user?.firstName || "there"} 👋
          </h2>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <button className="relative p-2 hover:bg-muted rounded-xl transition-colors">
            <Bell size={18} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
        )}
      </div>
    </header>
  );
}

/* ── Layout ──────────────────────────────────────────── */
export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Public pages without sidebar
  const isPublicPage = ["/", "/auth"].includes(location.pathname);

  if (isPublicPage && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
