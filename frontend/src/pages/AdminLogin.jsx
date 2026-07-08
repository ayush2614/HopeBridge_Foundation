import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Heart, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const { t } = useTranslation();
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@hopebridge.org");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err) {
      const msg = err?.response?.data?.detail || t("admin.invalidCreds");
      toast.error(typeof msg === "string" ? msg : t("admin.invalidCreds"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen grid place-items-center bg-slate-50 p-6 font-inter">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-green-600 grid place-items-center shadow-lg">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="mt-4 font-poppins text-2xl font-semibold text-slate-900">HopeBridge Admin</h1>
          <p className="text-slate-500 text-sm">{t("admin.loginTitle")}</p>
        </div>

        <form onSubmit={submit} data-testid="admin-login-form" className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-slate-100 space-y-5">
          <div>
            <label className="text-xs font-inter font-semibold uppercase tracking-wider text-slate-600">{t("admin.email")}</label>
            <input
              data-testid="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 font-inter text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <div>
            <label className="text-xs font-inter font-semibold uppercase tracking-wider text-slate-600">{t("admin.password")}</label>
            <input
              data-testid="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 font-inter text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <button
            type="submit"
            data-testid="admin-signin-btn"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-4 font-poppins font-medium shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            {t("admin.signin")}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          <a href="/" className="hover:text-blue-700">← Back to site</a>
        </p>
      </div>
    </div>
  );
}
