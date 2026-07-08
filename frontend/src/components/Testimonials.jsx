import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Volunteer, Delhi",
    quote: "Volunteering with HopeBridge changed how I see impact. Every weekend spent teaching feels like the most meaningful part of my week.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwcGVyc29uJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzgzNTMwODgxfDA&ixlib=rb-4.1.0&q=85",
  },
  {
    name: "Rohit Verma",
    role: "Beneficiary, Bihar",
    quote: "My daughter got her first laptop through the digital literacy program. Today, she's the first in our family to attend college.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1662850886700-4ec19bd30d11?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxzbWlsaW5nJTIwcGVyc29uJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzgzNTMwODgxfDA&ixlib=rb-4.1.0&q=85",
  },
  {
    name: "Anita Desai",
    role: "Volunteer, Mumbai",
    quote: "The team is transparent, driven and deeply rooted in the communities they serve. I trust every rupee I donate goes to real change.",
    rating: 5,
    img: "https://images.pexels.com/photos/3228887/pexels-photo-3228887.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    name: "Karan Iyer",
    role: "Donor & Partner",
    quote: "HopeBridge's programs are among the best-run I've seen. The impact reports are detailed and the change on ground is visible.",
    rating: 5,
    img: "https://images.unsplash.com/photo-1611695434369-a8f5d76ceb7b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHw0fHxzbWlsaW5nJTIwcGVyc29uJTIwcG9ydHJhaXR8ZW58MHx8fHwxNzgzNTMwODgxfDA&ixlib=rb-4.1.0&q=85",
  },
];

export default function Testimonials() {
  const { t } = useTranslation();
  return (
    <section id="testimonials" data-testid="testimonials-section" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-14">
          <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">{t("testimonials.eyebrow")}</p>
          <h2 className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            {t("testimonials.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={t.name}
              data-testid={`testimonial-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-10 hover:-translate-y-1 transition-transform duration-300 hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)]"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-100" />
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-green-500 text-green-500" />
                ))}
              </div>
              <p className="font-inter text-slate-700 leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-4">
                <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                <div>
                  <p className="font-poppins font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs font-inter text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
