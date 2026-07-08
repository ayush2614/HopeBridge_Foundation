import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { HeartHandshake, GraduationCap, Users, Sprout, MapPin } from "lucide-react";

const STATS = [
  { key: "s1", icon: HeartHandshake, end: 50000, suffix: "+" },
  { key: "s2", icon: GraduationCap, end: 10000, suffix: "+" },
  { key: "s3", icon: Users, end: 500, suffix: "+" },
  { key: "s4", icon: Sprout, end: 200, suffix: "+" },
  { key: "s5", icon: MapPin, end: 50, suffix: "+" },
];

export default function Impact() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="impact" data-testid="impact-section" ref={ref} className="relative py-24 md:py-32 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-300 font-semibold mb-4">{t("impact.eyebrow")}</p>
          <h2 className="font-poppins text-3xl md:text-5xl font-bold tracking-tight">{t("impact.title")}</h2>
          <p className="mt-4 text-white/70 font-inter">{t("impact.subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.key}
                data-testid={`impact-stat-${s.key}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 text-center hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-300 grid place-items-center mx-auto mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-poppins text-3xl md:text-4xl font-bold text-green-300 tabular-nums">
                  {inView ? <CountUp end={s.end} duration={2.2} separator="," suffix={s.suffix} /> : `0${s.suffix}`}
                </div>
                <div className="mt-2 text-sm font-inter text-white/70">{t(`impact.${s.key}`)}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
