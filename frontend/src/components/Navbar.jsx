import { useState, useEffect } from "react";
import { Menu, X, Heart } from "lucide-react";

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "mission", label: "Mission" },
  { id: "programs", label: "Programs" },
  { id: "impact", label: "Impact" },
  { id: "gallery", label: "Gallery" },
  { id: "volunteer", label: "Volunteer" },
  { id: "donate", label: "Donate" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
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
          <span className="font-poppins font-semibold text-lg text-slate-900">
            HopeBridge<span className="text-green-600"> .</span>
          </span>
        </button>

        <nav className="hidden xl:flex items-center gap-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              data-testid={`nav-${n.id}`}
              onClick={() => go(n.id)}
              className="px-3 py-2 rounded-full text-sm font-inter text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-3">
          <button
            data-testid="nav-donate-cta"
            onClick={() => go("donate")}
            className="rounded-full bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 text-sm font-poppins font-medium transition-colors shadow-sm"
          >
            Donate Now
          </button>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen(!open)}
          className="xl:hidden w-10 h-10 grid place-items-center rounded-full bg-white/80 border border-slate-200"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4">
          <div className="grid grid-cols-2 gap-2">
            {NAV.map((n) => (
              <button
                key={n.id}
                data-testid={`mnav-${n.id}`}
                onClick={() => go(n.id)}
                className="text-left px-3 py-3 rounded-xl text-sm font-inter text-slate-700 hover:bg-blue-50"
              >
                {n.label}
              </button>
            ))}
          </div>
          <button
            data-testid="mnav-donate-cta"
            onClick={() => go("donate")}
            className="mt-4 w-full rounded-full bg-blue-700 text-white py-3 font-poppins font-medium"
          >
            Donate Now
          </button>
        </div>
      )}
    </header>
  );
}
