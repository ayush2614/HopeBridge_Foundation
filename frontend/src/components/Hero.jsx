import { motion } from "framer-motion";
import { HandHeart, ArrowRight, Sparkles } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwzfHx2b2x1bnRlZXJzJTIwaGVscGluZyUyMGNoaWxkcmVufGVufDB8fHx8MTc4MzUzMDg4MXww&ixlib=rb-4.1.0&q=85";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function Hero() {
  return (
    <section id="home" data-testid="hero-section" className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="Volunteers with children" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        <div className="lg:col-span-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-green-300" />
            <span className="text-xs md:text-sm font-inter uppercase tracking-[0.2em] text-green-200">
              A brighter tomorrow, together
            </span>
          </motion.div>

          <motion.h1
            data-testid="hero-headline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
          >
            Empowering Communities,{" "}
            <span className="bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">Transforming Lives</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-2xl font-inter text-base md:text-lg text-slate-200/90 leading-relaxed"
          >
            Together we create opportunities through education, healthcare, environmental sustainability, and community development.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button
              data-testid="hero-volunteer-cta"
              onClick={() => scrollTo("volunteer")}
              className="group rounded-full bg-green-600 hover:bg-green-700 text-white px-7 py-4 font-poppins font-medium inline-flex items-center gap-2 shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <HandHeart className="w-5 h-5" /> Become a Volunteer
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              data-testid="hero-donate-cta"
              onClick={() => scrollTo("donate")}
              className="rounded-full bg-white text-slate-900 hover:bg-slate-100 px-7 py-4 font-poppins font-medium shadow-lg inline-flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
            >
              Donate Now <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 flex flex-wrap gap-8 text-white/85"
          >
            {[
              ["50K+", "Lives Impacted"],
              ["500+", "Volunteers"],
              ["50+", "Villages"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-poppins text-3xl font-bold text-green-300">{n}</div>
                <div className="text-sm font-inter text-white/70">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
