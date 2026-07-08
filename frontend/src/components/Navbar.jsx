import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Heart } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const NAV_IDS = ["home", "about", "mission", "programs", "impact", "gallery", "volunteer", "donate", "testimonials", "faq", "contact"];

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-white/85 border-b border-slate-200 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        <button onClick={() => go("home")} data-testid="brand-logo" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-green-600 grid place-items-center shadow-md">
            <Heart className="w-4 h-4 text-white fill-white" />
          </span>
          <span className={`font-poppins font-semibold text-lg ${scrolled ? "text-slate-900" : "text-white"}`}>
            HopeBridge<span className="text-green-500"> .</span>
          </span>
        </button>

        <nav className="hidden xl:flex items-center gap-1">
          {NAV_IDS.map((id) => (
            <button
              key={id}
              data-testid={`nav-${id}`}
              onClick={() => go(id)}
              className={`px-3 py-2 rounded-full text-sm font-inter transition-colors ${
                scrolled ? "text-slate-700 hover:text-blue-700 hover:bg-blue-50" : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              {t(`nav.${id}`)}
            </button>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-3">
          <LanguageSwitcher compact />
          <button
            data-testid="nav-donate-cta"
            onClick={() => go("donate")}
            className="rounded-full bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 text-sm font-poppins font-medium transition-colors shadow-sm"
          >
            {t("nav.donateCta")}
          </button>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen(!open)}
          className={`xl:hidden w-10 h-10 grid place-items-center rounded-full border ${
            scrolled ? "bg-white/80 border-slate-200 text-slate-900" : "bg-white/10 border-white/20 text-white"
          }`}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4">
          <div className="grid grid-cols-2 gap-2">
            {NAV_IDS.map((id) => (
              <button
                key={id}
                data-testid={`mnav-${id}`}
                onClick={() => go(id)}
                className="text-left px-3 py-3 rounded-xl text-sm font-inter text-slate-700 hover:bg-blue-50"
              >
                {t(`nav.${id}`)}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <LanguageSwitcher compact />
            <button
              data-testid="mnav-donate-cta"
              onClick={() => go("donate")}
              className="flex-1 rounded-full bg-blue-700 text-white py-3 font-poppins font-medium"
            >
              {t("nav.donateCta")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
