/**
 * AdminDashboard — clean DocApp-style admin panel.
 * Shows platform stats, user management, search/filter.
 */
import { useState, useEffect } from "react";
import {
  Users, Building2, Star, FileText, Loader2,
  Search, Trash2, ChevronLeft, ChevronRight, Shield, TrendingUp,
} from "lucide-react";
import {
  getAdminStats,
  listUsers,
  deleteUser,
} from "../../api/admin.api";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 10;

  /* Fetch stats once */
  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setStats({
        totalUsers: 0,
        totalCreators: 0,
        totalBrands: 0,
        totalRequirements: 0,
        totalRatings: 0,
        totalReviews: 0,
      }));
  }, []);

  /* Fetch users on filter/page change */
  useEffect(() => {
    setLoading(true);
    listUsers({ role: roleFilter || undefined, search: search || undefined, page, limit })
      .then((res) => {
        setUsers(res.users);
        setTotal(res.total);
      })
      .catch(() => {
        setUsers([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [roleFilter, search, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleDelete(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotal((t) => t - 1);
      if (stats) {
        setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
      }
    } catch {
      alert("Failed to delete user");
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="blue" />
        <StatCard label="Creators" value={stats?.totalCreators} icon={Users} color="indigo" />
        <StatCard label="Brands" value={stats?.totalBrands} icon={Building2} color="emerald" />
        <StatCard label="Campaigns" value={stats?.totalRequirements} icon={FileText} color="amber" />
        <StatCard label="Ratings" value={stats?.totalRatings} icon={Star} color="yellow" />
        <StatCard label="Reviews" value={stats?.totalReviews} icon={TrendingUp} color="rose" />
      </div>

      {/* User Management */}
      <div className="bg-white rounded-2xl border border-border shadow-sm">
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h3 className="text-lg font-semibold text-foreground">User Management</h3>

            <div className="flex flex-wrap gap-2">
              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All roles</option>
                <option value="creator">Creators</option>
                <option value="brand">Brands</option>
                <option value="admin">Admins</option>
              </select>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-xl border border-border bg-muted/50 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No users found
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Joined</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-xs font-semibold">
                            {u.firstName?.[0] || u.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">
                          {u.firstName ? `${u.firstName} ${u.lastName || ""}` : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ── */

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-600" },
  rose: { bg: "bg-rose-50", text: "text-rose-600" },
};

function StatCard({ label, value, icon: Icon, color }) {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={16} className={c.text} />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {value != null ? value.toLocaleString() : "—"}
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    creator: "bg-blue-50 text-blue-600",
    brand: "bg-emerald-50 text-emerald-600",
    admin: "bg-purple-50 text-purple-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[role] || "bg-gray-100 text-gray-600"}`}>
      {role === "admin" && <Shield size={12} />}
      {role}
    </span>
  );
}
