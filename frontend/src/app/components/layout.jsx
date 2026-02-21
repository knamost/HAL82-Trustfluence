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
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import logoSvg from "./figma/logo_KEC-01.svg";
import { listMyApplications } from "../../api/application.api";
import { listRequirements } from "../../api/requirement.api";
import { getReviews } from "../../api/feedback.api";

/* ── Nav items by role ──────────────────────────────────────────── */
function getNavItems(role) {
  const common = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/creators", icon: Search, label: "Discover" },
  ];

  if (role === "creator") {
    return [
      ...common,
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/requirements", icon: FileText, label: "Opportunities" },
      { to: "/messages", icon: MessageSquare, label: "Messages" },
      { to: "/reviews", icon: Star, label: "Reviews" },
    ];
  }

  if (role === "brand") {
    return [
      ...common,
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/requirements", icon: FileText, label: "Requirements" },
      { to: "/messages", icon: MessageSquare, label: "Messages" },
      { to: "/reviews", icon: Star, label: "Reviews" },
    ];
  }

  if (role === "admin") {
    return [
      { to: "/", icon: Home, label: "Home" },
      { to: "/dashboard", icon: Shield, label: "Admin Panel" },
      { to: "/creators", icon: Users, label: "Creators" },
      { to: "/requirements", icon: FileText, label: "Requirements" },
      { to: "/messages", icon: MessageSquare, label: "Messages" },
      { to: "/reviews", icon: Star, label: "Reviews" },
    ];
  }

  // Not logged in
  return common;
}

/* ── Sidebar ──────────────────────────────────────────── */
function Sidebar({ open, onClose }) {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = getNavItems(user?.role);

  const isActive = (path) =>
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
          <Link to="/" className="flex items-center gap-2.5">
                    <img src={logoSvg} alt="Trustfluence" className="w-9 h-9 rounded-xl" />
                    <span className="text-lg font-semibold text-foreground">Trustfluence</span>
                  </Link>
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
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.firstName || "User"}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
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
function TopBar({ onMenuClick }) {
  const { user, isAuthenticated } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("tf_read_notifs") || "[]")); }
    catch { return new Set(); }
  });
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setNotifLoading(true);
    try {
      const items = [];

      if (user.role === "creator") {
        // For creators: show application status updates
        const apps = await listMyApplications();
        for (const app of apps.slice(0, 10)) {
          if (app.status === "accepted") {
            items.push({
              id: `app-${app.id}`,
              type: "accepted",
              icon: CheckCircle2,
              iconColor: "text-green-500",
              iconBg: "bg-green-50",
              title: "Application Accepted",
              description: `Your application for "${app.requirementTitle}" by ${app.brandName || "a brand"} was accepted!`,
              time: app.updatedAt || app.createdAt,
              link: "/dashboard",
            });
          } else if (app.status === "rejected") {
            items.push({
              id: `app-${app.id}`,
              type: "rejected",
              icon: XCircle,
              iconColor: "text-red-400",
              iconBg: "bg-red-50",
              title: "Application Rejected",
              description: `Your application for "${app.requirementTitle}" was not selected.`,
              time: app.updatedAt || app.createdAt,
              link: "/dashboard",
            });
          } else if (app.status === "pending") {
            items.push({
              id: `app-${app.id}`,
              type: "pending",
              icon: Clock,
              iconColor: "text-amber-500",
              iconBg: "bg-amber-50",
              title: "Application Pending",
              description: `Awaiting response for "${app.requirementTitle}" from ${app.brandName || "brand"}.`,
              time: app.createdAt,
              link: "/dashboard",
            });
          }
        }
      }

      if (user.role === "brand") {
        // For brands: show new applications on their requirements
        const reqs = await listRequirements();
        const myReqs = reqs.filter(r => r.brandId === user.id);
        for (const req of myReqs.slice(0, 5)) {
          items.push({
            id: `req-${req.id}`,
            type: "campaign",
            icon: FileText,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-50",
            title: "Campaign Active",
            description: `"${req.title}" is ${req.status || "open"}.`,
            time: req.createdAt,
            link: "/requirements",
          });
        }
      }

      // For all: show recent reviews received
      if (user.id) {
        try {
          const reviews = await getReviews(user.id);
          for (const rev of (reviews || []).slice(0, 5)) {
            items.push({
              id: `rev-${rev.id}`,
              type: "review",
              icon: Star,
              iconColor: "text-yellow-500",
              iconBg: "bg-yellow-50",
              title: "New Review",
              description: `${rev.reviewerName || "Someone"} left a review${rev.rating ? ` (${rev.rating}★)` : ""}: "${rev.content?.slice(0, 60)}${rev.content?.length > 60 ? "…" : ""}"`,
              time: rev.createdAt,
              link: "/reviews",
            });
          }
        } catch {}
      }

      // Sort by time, newest first
      items.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(items.slice(0, 15));
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }, [user]);

  // Fetch on open
  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen, fetchNotifications]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => {
    const newRead = new Set([...readIds, ...notifications.map(n => n.id)]);
    setReadIds(newRead);
    localStorage.setItem("tf_read_notifs", JSON.stringify([...newRead]));
  };

  const markRead = (id) => {
    const newRead = new Set([...readIds, id]);
    setReadIds(newRead);
    localStorage.setItem("tf_read_notifs", JSON.stringify([...newRead]));
  };

  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-border">
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
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <Bell size={18} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-white rounded-full" style={{ fontSize: '0.625rem', fontWeight: 700, padding: '0 4px' }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 max-h-[480px] bg-white rounded-2xl border border-border shadow-xl overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                  <h3 style={{ fontWeight: 600, fontSize: '0.9375rem' }} className="text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-primary hover:underline"
                      style={{ fontSize: '0.75rem', fontWeight: 500 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[400px]">
                  {notifLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-10 px-4">
                      <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>No notifications yet</p>
                      <p className="text-muted-foreground/60" style={{ fontSize: '0.75rem' }}>We'll notify you about applications, reviews, and more.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const Icon = notif.icon;
                      const isRead = readIds.has(notif.id);
                      return (
                        <Link
                          key={notif.id}
                          to={notif.link}
                          onClick={() => { markRead(notif.id); setNotifOpen(false); }}
                          className={`flex items-start gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${!isRead ? "bg-primary/[0.03]" : ""}`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                            <Icon size={16} className={notif.iconColor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground truncate" style={{ fontWeight: isRead ? 400 : 600, fontSize: '0.8125rem' }}>
                                {notif.title}
                              </span>
                              {!isRead && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                            </div>
                            <p className="text-muted-foreground mt-0.5 line-clamp-2" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                              {notif.description}
                            </p>
                            <span className="text-muted-foreground/60 mt-1 block" style={{ fontSize: '0.6875rem' }}>
                              {timeAgo(notif.time)}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

/* ── Layout ──────────────────────────────────────────── */
export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect authenticated users away from /auth
  useEffect(() => {
    if (!loading && isAuthenticated && location.pathname === "/auth") {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, isAuthenticated, location.pathname, navigate]);

  // Public pages without sidebar (landing, auth) for guests
  const isPublicPage = location.pathname === "/" || location.pathname === "/auth";

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

      <div className="flex-1 flex flex-col min-w-0 overflow-visible">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
