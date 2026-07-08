import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
];

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const active = i18n.resolvedLanguage || "en";

  return (
    <div
      data-testid="language-switcher"
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 backdrop-blur ${
        compact ? "p-0.5" : "p-1"
      }`}
    >
      <Languages className="w-3.5 h-3.5 text-slate-500 mx-2" />
      {LANGS.map((l) => (
        <button
          key={l.code}
          data-testid={`lang-${l.code}`}
          onClick={() => i18n.changeLanguage(l.code)}
          className={`px-3 py-1 text-xs font-poppins font-semibold rounded-full transition-colors ${
            active === l.code ? "bg-blue-700 text-white" : "text-slate-600 hover:text-blue-700"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
