import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Users, MessageSquare, Mail, IndianRupee, LogOut, Heart, RefreshCcw, Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const TABS = ["stats", "volunteers", "contacts", "newsletter", "donations"];

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch { return iso; }
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, logout, authAxios } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("stats");
  const [data, setData] = useState({ stats: null, volunteers: [], contacts: [], newsletter: [], donations: [] });
  const [loading, setLoading] = useState(false);

  const client = useMemo(() => authAxios(), [authAxios]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, v, c, n, d] = await Promise.all([
        client.get("/admin/stats"),
        client.get("/admin/volunteers"),
        client.get("/admin/contacts"),
        client.get("/admin/newsletter"),
        client.get("/admin/donations"),
      ]);
      setData({ stats: s.data, volunteers: v.data, contacts: c.data, newsletter: n.data, donations: d.data });
    } catch (e) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, []);

  const doLogout = () => { logout(); navigate("/admin/login"); };

  const stat = (label, value, Icon, color) => (
    <div data-testid={`stat-${label}`} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
      <div className={`w-11 h-11 rounded-xl grid place-items-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs font-inter uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-poppins text-3xl font-bold text-slate-900 mt-1 tabular-nums">{value}</p>
    </div>
  );

  return (
    <div data-testid="admin-dashboard-page" className="min-h-screen bg-slate-50 font-inter">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-green-600 grid place-items-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </span>
            <div>
              <p className="font-poppins font-semibold text-slate-900">HopeBridge {t("admin.title")}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <button
              data-testid="admin-refresh"
              onClick={loadAll}
              disabled={loading}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors text-sm disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              Refresh
            </button>
            <button
              data-testid="admin-logout"
              onClick={doLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm"
            >
              <LogOut className="w-4 h-4" /> {t("admin.logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab nav */}
        <nav className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tk) => (
            <button
              key={tk}
              data-testid={`tab-${tk}`}
              onClick={() => setTab(tk)}
              className={`px-4 py-2 rounded-full text-sm font-poppins font-medium transition-colors ${
                tab === tk ? "bg-blue-700 text-white" : "bg-white border border-slate-200 text-slate-700 hover:border-blue-400"
              }`}
            >
              {t(`admin.${tk}`)}
            </button>
          ))}
        </nav>

        {tab === "stats" && data.stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stat(t("admin.volunteers"), data.stats.volunteers, Users, "bg-blue-50 text-blue-700")}
            {stat(t("admin.contacts"), data.stats.contacts, MessageSquare, "bg-green-50 text-green-700")}
            {stat(t("admin.newsletter"), data.stats.newsletter, Mail, "bg-purple-50 text-purple-700")}
            {stat(t("admin.totalCollected"), `₹${data.stats.total_amount_paid?.toLocaleString?.() || 0}`, IndianRupee, "bg-amber-50 text-amber-700")}
            {stat(t("admin.donations"), data.stats.donations_paid, IndianRupee, "bg-emerald-50 text-emerald-700")}
            {stat(t("admin.initiated"), data.stats.donations_initiated, RefreshCcw, "bg-slate-100 text-slate-700")}
          </div>
        )}

        {tab === "volunteers" && (
          <Table data-testid="table-volunteers" rows={data.volunteers} empty={t("admin.empty")}
            cols={[
              { k: "created_at", label: t("admin.columns.date"), r: (r) => fmtDate(r.created_at) },
              { k: "full_name", label: t("admin.columns.name") },
              { k: "email", label: t("admin.columns.email") },
              { k: "phone", label: t("admin.columns.phone") },
              { k: "city", label: t("admin.columns.city") },
              { k: "area_of_interest", label: t("admin.columns.interest") },
              { k: "message", label: t("admin.columns.message"), r: (r) => (r.message || "").slice(0, 80) },
            ]} />
        )}
        {tab === "contacts" && (
          <Table data-testid="table-contacts" rows={data.contacts} empty={t("admin.empty")}
            cols={[
              { k: "created_at", label: t("admin.columns.date"), r: (r) => fmtDate(r.created_at) },
              { k: "name", label: t("admin.columns.name") },
              { k: "email", label: t("admin.columns.email") },
              { k: "subject", label: t("admin.columns.subject") },
              { k: "message", label: t("admin.columns.message"), r: (r) => (r.message || "").slice(0, 120) },
            ]} />
        )}
        {tab === "newsletter" && (
          <Table data-testid="table-newsletter" rows={data.newsletter} empty={t("admin.empty")}
            cols={[
              { k: "created_at", label: t("admin.columns.date"), r: (r) => fmtDate(r.created_at) },
              { k: "email", label: t("admin.columns.email") },
            ]} />
        )}
        {tab === "donations" && (
          <Table data-testid="table-donations" rows={data.donations} empty={t("admin.empty")}
            cols={[
              { k: "created_at", label: t("admin.columns.date"), r: (r) => fmtDate(r.created_at) },
              { k: "donor_name", label: t("admin.columns.name"), r: (r) => r.donor_name || "—" },
              { k: "donor_email", label: t("admin.columns.email"), r: (r) => r.donor_email || "—" },
              { k: "package_id", label: t("admin.columns.pkg") },
              { k: "amount", label: t("admin.columns.amount"), r: (r) => `₹${(r.amount_total ?? r.amount ?? 0).toLocaleString()}` },
              { k: "payment_status", label: t("admin.columns.status"), r: (r) => (
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  r.payment_status === "paid" ? "bg-green-100 text-green-800" :
                  r.payment_status === "pending" ? "bg-amber-100 text-amber-800" :
                  "bg-slate-100 text-slate-700"
                }`}>{r.payment_status}</span>
              )},
              { k: "receipt_number", label: t("admin.columns.receipt"), r: (r) => r.receipt_number || "—" },
            ]} />
        )}
      </div>
    </div>
  );
}

function Table({ rows, cols, empty, ...rest }) {
  return (
    <div {...rest} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {cols.map((c) => (
                <th key={c.k} className="text-left px-4 py-3 font-poppins font-semibold text-slate-700">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={cols.length} className="px-4 py-10 text-center text-slate-400">{empty}</td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                {cols.map((c) => (
                  <td key={c.k} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                    {c.r ? c.r(r) : (r[c.k] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
