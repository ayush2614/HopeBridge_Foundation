import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { QrCode, ShieldCheck, Loader2, IndianRupee } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PACKAGES = [
  { id: "supporter", amount: 500, label: "Supporter", desc: "Provides 1 week of meals for a child." },
  { id: "friend", amount: 1000, label: "Friend", desc: "Sponsors a month of tuition and books." },
  { id: "champion", amount: 2500, label: "Champion", desc: "Funds a village health camp." },
];

export default function Donate() {
  const [selected, setSelected] = useState("friend");
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isCustom = selected === "custom";

  const handleDonate = async () => {
    let payload = { origin_url: window.location.origin, donor_name: name, donor_email: email };
    if (isCustom) {
      const amt = parseFloat(custom);
      if (!amt || amt < 100) {
        toast.error("Please enter an amount of at least ₹100");
        return;
      }
      payload.custom_amount = amt;
    } else {
      payload.package_id = selected;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/donations/checkout`, payload);
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to start payment session");
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Payment could not be initiated");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="donate" data-testid="donate-section" className="relative py-24 md:py-32 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="font-inter text-xs uppercase tracking-[0.25em] text-green-600 font-semibold mb-4">Donate</p>
          <h2 className="font-poppins text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Every rupee builds a bridge to hope.
          </h2>
          <p className="mt-4 font-inter text-slate-600">
            100% of your donation goes directly to programs. Secure payments powered by Stripe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: donation packages */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PACKAGES.map((p) => (
                <button
                  key={p.id}
                  data-testid={`donate-pkg-${p.id}`}
                  onClick={() => setSelected(p.id)}
                  className={`text-left rounded-3xl p-6 border transition-all duration-300 ${
                    selected === p.id
                      ? "border-blue-700 bg-blue-50 shadow-lg -translate-y-1"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-poppins font-semibold text-slate-900">{p.label}</span>
                    {selected === p.id && <span className="text-xs font-inter uppercase tracking-wider text-blue-700 font-semibold">Selected</span>}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <IndianRupee className={`w-5 h-5 ${selected === p.id ? "text-blue-700" : "text-slate-700"}`} />
                    <span className={`font-poppins text-3xl font-bold ${selected === p.id ? "text-blue-700" : "text-slate-900"}`}>{p.amount}</span>
                  </div>
                  <p className="mt-3 text-xs font-inter text-slate-600">{p.desc}</p>
                </button>
              ))}

              <button
                data-testid="donate-pkg-custom"
                onClick={() => setSelected("custom")}
                className={`text-left md:col-span-3 rounded-3xl p-6 border transition-all duration-300 ${
                  isCustom ? "border-green-600 bg-green-50 shadow-lg" : "border-slate-200 bg-white hover:border-green-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-poppins font-semibold text-slate-900">Custom donation</span>
                  {isCustom && <span className="text-xs font-inter uppercase tracking-wider text-green-700 font-semibold">Selected</span>}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-slate-500" />
                  <input
                    data-testid="donate-custom-input"
                    type="number"
                    min="100"
                    placeholder="Enter amount (min ₹100)"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    onFocus={() => setSelected("custom")}
                    className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:border-green-600 py-2 font-poppins text-xl font-semibold text-slate-900"
                  />
                </div>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                data-testid="donate-name"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl bg-white border border-slate-200 px-5 py-4 font-inter text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                data-testid="donate-email"
                type="email"
                placeholder="Your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl bg-white border border-slate-200 px-5 py-4 font-inter text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              data-testid="donate-securely-btn"
              onClick={handleDonate}
              disabled={loading}
              className="mt-6 w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 font-poppins font-medium shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {loading ? "Redirecting…" : "Donate Securely"}
            </button>
            <p className="mt-3 text-xs font-inter text-slate-500">Powered by Stripe · Test mode</p>
          </div>

          {/* Right: QR */}
          <aside className="lg:col-span-5">
            <div className="rounded-3xl bg-white p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
              <p className="font-inter uppercase text-xs tracking-[0.2em] text-blue-700 font-semibold">UPI / Wallet</p>
              <h3 className="mt-3 font-poppins text-2xl font-semibold text-slate-900">Scan to donate instantly</h3>
              <p className="mt-2 text-sm font-inter text-slate-600">Any UPI app works — GPay, PhonePe, Paytm.</p>

              <div className="mt-6 relative rounded-2xl border border-dashed border-slate-300 bg-slate-50 aspect-square grid place-items-center overflow-hidden">
                <QrCode className="w-32 h-32 text-slate-400" />
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/90 backdrop-blur border border-slate-200 px-3 py-2 text-center">
                  <p className="text-xs font-poppins font-semibold text-slate-900">hopebridge@upi</p>
                  <p className="text-[10px] font-inter text-slate-500">QR code placeholder</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-inter text-slate-500">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                80G tax-exemption certificate available on request.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
