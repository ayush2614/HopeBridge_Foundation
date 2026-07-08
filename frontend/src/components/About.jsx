import { motion } from "framer-motion";
import { GraduationCap, Stethoscope, Users, Leaf } from "lucide-react";

const FEATURES = [
  {
    icon: GraduationCap,
    title: "Education",
    desc: "Free classes, digital literacy and scholarships for underprivileged children.",
    img: "https://images.pexels.com/photos/18506736/pexels-photo-18506736.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    desc: "Mobile clinics and community health camps in rural and urban slum areas.",
    img: "https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwyfHxtZWRpY2FsJTIwY2FtcCUyMGRvY3RvcnxlbnwwfHx8fDE3ODM1MzA4ODF8MA&ixlib=rb-4.1.0&q=85",
    color: "text-green-700",
    bg: "bg-green-50",
  },
  {
    icon: Users,
    title: "Women Empowerment",
    desc: "Vocational training, self-help groups and micro-enterprise mentoring.",
    img: "https://images.unsplash.com/photo-1774504798113-a03e2aa24789?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwyfHx3b21lbiUyMGNvbW11bml0eSUyMHdvcmtpbmd8ZW58MHx8fHwxNzgzNTMwODgxfDA&ixlib=rb-4.1.0&q=85",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    icon: Leaf,
    title: "Environment",
    desc: "Tree plantation drives, clean-water initiatives and climate education.",
    img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwxfHxwbGFudGluZyUyMHRyZWUlMjBoYW5kc3xlbnwwfHx8fDE3ODM1MzA4ODF8MA&ixlib=rb-4.1.0&q=85",
    color: "text-green-700",
    bg: "bg-green-50",
  },
];

export default function About() {
  return (
    <section id="about" data-testid="about-section" className="relative py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-5">
            <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">
              About HopeBridge
            </p>
            <h2 data-testid="about-title" className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Bridging hope where it's needed the most.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-4">
            <p className="font-inter text-base md:text-lg text-slate-600 leading-relaxed">
              HopeBridge Foundation is a nonprofit organization dedicated to improving lives through <span className="text-slate-900 font-semibold">education, healthcare, women's empowerment, environmental conservation and skill development</span>. Since 2015, we've worked hand-in-hand with local communities across India to design programs that create long-term, measurable social impact — one village, one classroom, one family at a time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.article
                key={f.title}
                data-testid={`about-card-${f.title.toLowerCase().replace(/\s/g, "-")}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className={`w-11 h-11 rounded-2xl ${f.bg} grid place-items-center mb-4`}>
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-poppins text-lg font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm font-inter text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
