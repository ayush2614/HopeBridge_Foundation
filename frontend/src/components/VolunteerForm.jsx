import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { HandHeart, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const INTERESTS = ["Education", "Healthcare", "Women Empowerment", "Environment", "Food Distribution", "Skill Development", "Fundraising", "Other"];

export default function VolunteerForm() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    area_of_interest: "Education",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone || !form.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/volunteers`, form);
      toast.success("Thank you! We'll be in touch soon.");
      setForm({ full_name: "", email: "", phone: "", city: "", area_of_interest: "Education", message: "" });
    } catch (err) {
      toast.error(err?.response?.data?.detail?.[0]?.msg || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 font-inter text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition";

  return (
    <section id="volunteer" data-testid="volunteer-section" className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">Join Us</p>
          <h2 className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Give a few hours. Change a lifetime.
          </h2>
          <p className="mt-6 font-inter text-slate-600 leading-relaxed">
            Volunteers are the heartbeat of HopeBridge. Whether you have skills to share, hours to spare, or just a big heart — there's a role waiting for you.
          </p>

          <div className="mt-8 rounded-3xl bg-blue-50 border border-blue-100 p-6">
            <p className="font-poppins font-semibold text-slate-900">Why volunteer with us?</p>
            <ul className="mt-3 space-y-2 text-sm font-inter text-slate-700">
              <li>• Flexible time commitments — from 2 hours a week to full-time</li>
              <li>• Field, remote and skill-based opportunities</li>
              <li>• Official certification and recommendation letters</li>
              <li>• Join a community of 500+ change-makers</li>
            </ul>
          </div>
        </div>

        <form
          onSubmit={submit}
          data-testid="volunteer-form"
          className="lg:col-span-7 bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-inter font-semibold text-slate-600 uppercase tracking-wider">Full Name *</label>
              <input
                data-testid="vol-full-name"
                name="full_name"
                value={form.full_name}
                onChange={onChange}
                placeholder="Jane Doe"
                className={`mt-2 ${input}`}
                required
              />
            </div>
            <div>
              <label className="text-xs font-inter font-semibold text-slate-600 uppercase tracking-wider">Email *</label>
              <input
                data-testid="vol-email"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="jane@example.com"
                className={`mt-2 ${input}`}
                required
              />
            </div>
            <div>
              <label className="text-xs font-inter font-semibold text-slate-600 uppercase tracking-wider">Phone *</label>
              <input
                data-testid="vol-phone"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="+91 98765 43210"
                className={`mt-2 ${input}`}
                required
              />
            </div>
            <div>
              <label className="text-xs font-inter font-semibold text-slate-600 uppercase tracking-wider">City *</label>
              <input
                data-testid="vol-city"
                name="city"
                value={form.city}
                onChange={onChange}
                placeholder="Mumbai"
                className={`mt-2 ${input}`}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-inter font-semibold text-slate-600 uppercase tracking-wider">Area of Interest</label>
              <select
                data-testid="vol-interest"
                name="area_of_interest"
                value={form.area_of_interest}
                onChange={onChange}
                className={`mt-2 ${input}`}
              >
                {INTERESTS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-inter font-semibold text-slate-600 uppercase tracking-wider">Message</label>
              <textarea
                data-testid="vol-message"
                name="message"
                value={form.message}
                onChange={onChange}
                placeholder="Tell us why you'd like to volunteer…"
                rows={4}
                className={`mt-2 ${input} resize-none`}
              />
            </div>
          </div>

          <button
            type="submit"
            data-testid="vol-submit"
            disabled={loading}
            className="mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 font-poppins font-medium shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <HandHeart className="w-5 h-5" />}
            {loading ? "Submitting…" : "Volunteer Now"}
          </button>
        </form>
      </div>
    </section>
  );
}
