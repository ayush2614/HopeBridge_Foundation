import { motion } from "framer-motion";
import { Laptop, BookOpen, HeartPulse, UtensilsCrossed, TreePine, Wrench } from "lucide-react";

const PROGRAMS = [
  { icon: Laptop, title: "Digital Literacy", desc: "Free computer & smartphone training for youth and elders.", accent: "blue" },
  { icon: BookOpen, title: "Free Education Support", desc: "After-school tuition, learning kits and scholarships.", accent: "green" },
  { icon: HeartPulse, title: "Health Camps", desc: "Free check-ups, medicines and specialist consultations.", accent: "blue" },
  { icon: UtensilsCrossed, title: "Food Distribution", desc: "Weekly meal drives serving families in need.", accent: "green" },
  { icon: TreePine, title: "Tree Plantation", desc: "Community-led plantation and reforestation drives.", accent: "green" },
  { icon: Wrench, title: "Skill Development Workshops", desc: "Trade skills, entrepreneurship and job placement.", accent: "blue" },
];

const accentClass = {
  blue: "bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white",
  green: "bg-green-50 text-green-700 group-hover:bg-green-600 group-hover:text-white",
};

export default function Programs() {
  return (
    <section id="programs" data-testid="programs-section" className="relative py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-6">
            <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">What We Do</p>
            <h2 className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              Programs designed for lasting change.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:pt-4">
            <p className="font-inter text-base md:text-lg text-slate-600 leading-relaxed">
              Every program we run is built on the same principle: sustainable, community-owned impact. We work with local leaders, teachers, medical professionals and volunteers to make sure our efforts outlast us.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROGRAMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.article
                key={p.title}
                data-testid={`program-card-${p.title.toLowerCase().replace(/\s/g, "-")}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group bg-slate-50 hover:bg-white rounded-3xl p-8 border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)]"
              >
                <div className={`w-14 h-14 rounded-2xl grid place-items-center transition-colors duration-300 ${accentClass[p.accent]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-6 font-poppins text-xl font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-3 text-sm font-inter text-slate-600 leading-relaxed">{p.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
