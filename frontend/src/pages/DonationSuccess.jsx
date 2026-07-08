import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2, Home } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const MAX_ATTEMPTS = 8;
const INTERVAL_MS = 2000;

export default function DonationSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState({ status: "checking", data: null });

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error", data: "Missing session id" });
      return;
    }
    let attempts = 0;
    let stopped = false;

    const poll = async () => {
      if (stopped) return;
      try {
        const res = await axios.get(`${API}/donations/status/${sessionId}`);
        const d = res.data;
        if (d.payment_status === "paid") {
          setState({ status: "paid", data: d });
          return;
        }
        if (d.status === "expired") {
          setState({ status: "expired", data: d });
          return;
        }
        attempts += 1;
        if (attempts >= MAX_ATTEMPTS) {
          setState({ status: "timeout", data: d });
          return;
        }
        setState({ status: "pending", data: d });
        setTimeout(poll, INTERVAL_MS);
      } catch (e) {
        setState({ status: "error", data: e?.response?.data?.detail || e.message });
      }
    };
    poll();
    return () => {
      stopped = true;
    };
  }, [sessionId]);

  const { status, data } = state;

  return (
    <div data-testid="donation-success-page" className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-16 font-inter">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center">
        {status === "checking" || status === "pending" ? (
          <>
            <Loader2 className="w-14 h-14 text-blue-700 mx-auto animate-spin" />
            <h1 data-testid="donation-status-title" className="font-poppins text-2xl md:text-3xl font-semibold mt-6 text-slate-900">
              Confirming your donation…
            </h1>
            <p className="text-slate-500 mt-3">Please don't close this window. This usually takes a few seconds.</p>
          </>
        ) : status === "paid" ? (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
            <h1 data-testid="donation-status-title" className="font-poppins text-3xl font-semibold mt-6 text-slate-900">
              Thank you for your kindness!
            </h1>
            <p className="text-slate-600 mt-3">
              Your donation of <span className="font-semibold text-slate-900">₹{(data?.amount_total || 0).toFixed(2)}</span> has been received. Together, we're building brighter tomorrows.
            </p>
          </>
        ) : status === "expired" ? (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 data-testid="donation-status-title" className="font-poppins text-3xl font-semibold mt-6 text-slate-900">Session expired</h1>
            <p className="text-slate-600 mt-3">Your checkout session expired. Please try again.</p>
          </>
        ) : status === "timeout" ? (
          <>
            <Loader2 className="w-14 h-14 text-amber-500 mx-auto" />
            <h1 data-testid="donation-status-title" className="font-poppins text-2xl font-semibold mt-6 text-slate-900">Still processing</h1>
            <p className="text-slate-600 mt-3">Payment is taking longer than expected. Please check back later or contact support.</p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 data-testid="donation-status-title" className="font-poppins text-3xl font-semibold mt-6 text-slate-900">Something went wrong</h1>
            <p className="text-slate-600 mt-3">{typeof data === "string" ? data : "Unable to verify donation."}</p>
          </>
        )}

        <Link
          to="/"
          data-testid="back-home-btn"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-700 text-white px-6 py-3 font-poppins font-medium hover:bg-blue-800 transition-colors"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
