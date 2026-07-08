import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Send, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Message sent! We'll reply soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not send message.");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full rounded-2xl bg-white border border-slate-200 px-5 py-4 font-inter text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition";

  return (
    <section id="contact" data-testid="contact-section" className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">Contact</p>
            <h2 className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              Let's build the bridge — together.
            </h2>
            <p className="mt-4 font-inter text-slate-600">Have a question, partnership idea or just want to say hi? We'd love to hear from you.</p>

            <ul className="mt-8 space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 grid place-items-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-poppins font-semibold text-slate-900">Address</p>
                  <p className="text-sm font-inter text-slate-600">42 Hope Street, Andheri West, Mumbai 400058, Maharashtra</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-700 grid place-items-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-poppins font-semibold text-slate-900">Phone</p>
                  <p className="text-sm font-inter text-slate-600">+91 98765 43210</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 grid place-items-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-poppins font-semibold text-slate-900">Email</p>
                  <p className="text-sm font-inter text-slate-600">hello@hopebridge.org</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex items-center gap-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  data-testid={`social-${label.toLowerCase()}`}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-700 hover:text-white grid place-items-center text-slate-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <div className="mt-8 rounded-3xl overflow-hidden border border-slate-200 h-56">
              <iframe
                title="HopeBridge Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=72.82%2C19.10%2C72.88%2C19.14&layer=mapnik&marker=19.12%2C72.85"
                className="w-full h-full"
                loading="lazy"
              />
            </div>
          </div>

          <form onSubmit={submit} data-testid="contact-form" className="lg:col-span-7 bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100 self-start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input data-testid="contact-name" name="name" value={form.name} onChange={onChange} placeholder="Your name *" className={input} required />
              <input data-testid="contact-email" type="email" name="email" value={form.email} onChange={onChange} placeholder="Your email *" className={input} required />
              <input data-testid="contact-subject" name="subject" value={form.subject} onChange={onChange} placeholder="Subject" className={`md:col-span-2 ${input}`} />
              <textarea data-testid="contact-message" name="message" value={form.message} onChange={onChange} rows={6} placeholder="Your message *" className={`md:col-span-2 ${input} resize-none`} required />
            </div>
            <button
              type="submit"
              data-testid="contact-submit"
              disabled={loading}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 font-poppins font-medium shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
