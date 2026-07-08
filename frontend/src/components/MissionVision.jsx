import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Target, Eye } from "lucide-react";

export default function MissionVision() {
  const { t } = useTranslation();
  return (
    <section id="mission" data-testid="mission-section" className="relative py-24 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">{t("mission.eyebrow")}</p>
          <h2 className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">{t("mission.title")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <motion.div
            data-testid="mission-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-3xl p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-100/70 blur-2xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white grid place-items-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <p className="font-inter uppercase text-xs tracking-[0.2em] text-blue-700 font-semibold">{t("mission.missionLabel")}</p>
              <h3 className="mt-3 font-poppins text-2xl md:text-3xl font-semibold text-slate-900 leading-snug">{t("mission.missionText")}</h3>
              <p className="mt-4 font-inter text-slate-600 leading-relaxed">{t("mission.missionSub")}</p>
            </div>
          </motion.div>

          <motion.div
            data-testid="vision-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-white rounded-3xl p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-green-100/70 blur-2xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-green-600 text-white grid place-items-center mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <p className="font-inter uppercase text-xs tracking-[0.2em] text-green-700 font-semibold">{t("mission.visionLabel")}</p>
              <h3 className="mt-3 font-poppins text-2xl md:text-3xl font-semibold text-slate-900 leading-snug">{t("mission.visionText")}</h3>
              <p className="mt-4 font-inter text-slate-600 leading-relaxed">{t("mission.visionSub")}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
