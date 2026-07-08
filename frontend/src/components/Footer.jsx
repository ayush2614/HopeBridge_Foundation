import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, Facebook, Twitter, Instagram, Linkedin, Loader2, ArrowRight, Lock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NAV_LINKS = ["about", "mission", "programs", "impact", "gallery", "volunteer", "donate", "contact"];
const PROGRAM_KEYS = ["p1", "p2", "p3", "p4", "p5", "p6"];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API}/newsletter`, { email });
      toast.success(t("footer.subscribed"));
      setEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer data-testid="site-footer" className="bg-slate-900 text-slate-300 pt-20 pb-8 mt-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-green-500 grid place-items-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </span>
              <span className="font-poppins font-semibold text-lg text-white">HopeBridge<span className="text-green-400">.</span></span>
            </div>
            <p className="mt-5 text-sm font-inter text-slate-400 max-w-sm">{t("footer.tagline")}</p>
            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 grid place-items-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="font-poppins font-semibold text-white mb-4">{t("footer.quickLinks")}</p>
            <ul className="space-y-2 text-sm font-inter">
              {NAV_LINKS.map((l) => (
                <li key={l}>
                  <button data-testid={`footer-link-${l}`} onClick={() => scrollTo(l)} className="hover:text-green-400 transition-colors capitalize">{t(`nav.${l}`)}</button>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/admin/login" data-testid="footer-admin-link" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-green-400 transition-colors">
                  <Lock className="w-3 h-3" /> {t("nav.admin")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="font-poppins font-semibold text-white mb-4">{t("footer.programs")}</p>
            <ul className="space-y-2 text-sm font-inter">
              {PROGRAM_KEYS.map((p) => (
                <li key={p}><span className="hover:text-green-400 cursor-default">{t(`programs.${p}`)}</span></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="font-poppins font-semibold text-white mb-4">{t("footer.newsletter")}</p>
            <p className="text-sm font-inter text-slate-400 mb-4">{t("footer.newsletterBody")}</p>
            <form onSubmit={subscribe} data-testid="newsletter-form" className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-4 pr-1 py-1">
              <input
                data-testid="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.newsletterPh")}
                className="flex-1 bg-transparent text-sm py-2 focus:outline-none placeholder-slate-500 text-white"
              />
              <button
                type="submit"
                data-testid="newsletter-submit"
                disabled={loading}
                className="rounded-full bg-green-600 hover:bg-green-700 text-white p-2 transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
            <div className="mt-4 text-xs font-inter text-slate-500">
              <p>hello@hopebridge.org</p>
              <p>+91 98765 43210</p>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-inter text-slate-500">
          <p>© {new Date().getFullYear()} HopeBridge Foundation. {t("footer.rights")}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-green-400">{t("footer.privacy")}</a>
            <a href="#" className="hover:text-green-400">{t("footer.terms")}</a>
            <a href="#" className="hover:text-green-400">{t("footer.transparency")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
