import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Mail, X, Loader2, CheckCircle2, BellRing } from "lucide-react";
import { rtdb } from "@/lib/firebase";
import { ref, push, serverTimestamp, query, orderByChild, equalTo, get, update } from "firebase/database";

interface SubscribeAlertsProps {
  isDark?: boolean;
  t: Record<string, string>;
}

const SubscribeAlerts = ({ isDark = true, t }: SubscribeAlertsProps) => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"subscribe" | "unsubscribe">("subscribe");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Lock scroll when modal is active
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const handleSubmit = async () => {
    if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError(t.validEmailError);
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      if (mode === "subscribe") {
        // 1. Check if the email is already subscribed
        const q = query(ref(rtdb, "subscribers"), orderByChild("email"), equalTo(email.trim()));
        const snapshot = await get(q);
        
        if (snapshot.exists()) {
          throw new Error(t.emailAlreadySubscribed);
        }
        
        // 2. If not subscribed, add them to the database
        await push(ref(rtdb, "subscribers"), {
          email: email.trim(),
          timestamp: serverTimestamp()
        });
      } else {
        // Unsubscribe Logic: Find the email and remove it
        const q = query(ref(rtdb, "subscribers"), orderByChild("email"), equalTo(email.trim()));
        const snapshot = await get(q);
        
        if (snapshot.exists()) {
          const updatePromises: Promise<void>[] = [];
          snapshot.forEach((child) => {
            // Instead of removing, we update it with an unsubscribe request flag.
            // The Python backend will see this, send the email, and then delete the record.
            updatePromises.push(update(child.ref, { unsubscribe_request: true }));
          });
          await Promise.all(updatePromises);
        } else {
          throw new Error(t.emailNotFound);
        }
      }
      setSuccess(true);
      setEmail("");
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-all text-xs font-bold uppercase tracking-widest shadow-lg ${
          isDark
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-emerald-100/80 border-emerald-400/50 text-emerald-800 hover:bg-emerald-200"
        }`}
      >
        <BellRing size={16} className="animate-pulse" />
        <span className="hidden sm:inline">{t.subscribeToAlerts}</span>
      </button>

      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
            <div
              className={`w-full max-w-md p-6 sm:p-8 rounded-2xl border shadow-2xl animate-in zoom-in-95 duration-200 ${
                isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-black/10 text-emerald-950"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Mail size={18} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                  <h3 className="font-black uppercase tracking-widest text-sm">
                    {mode === "subscribe" ? t.alertSubscription : t.unsubscribe}
                  </h3>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSuccess(false); setError(""); setMode("subscribe"); }}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X size={20} />
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                  <p className="font-bold text-sm">
                    {mode === "subscribe" ? t.successfullySubscribed : t.successfullyUnsubscribed}
                  </p>
                  <p className="text-xs opacity-70">
                    {mode === "subscribe" 
                      ? t.receiveAlertsDesc
                      : t.noLongerReceiveAlertsDesc}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs opacity-80 leading-relaxed mb-4">
                    {mode === "subscribe" 
                      ? t.subscribeDesc
                      : t.unsubscribeDesc}
                  </p>
                  <div>
                    <label htmlFor="email-input" className="block text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1.5">
                      {t.emailAddress}
                    </label>
                    <input type="email" id="email-input" placeholder="farmer@lohiafarm.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isDark ? "bg-slate-950 border-white/10" : "bg-slate-50 border-black/10"}`} />
                    {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
                  </div>
                  <button onClick={handleSubmit} disabled={loading} className={`w-full mt-2 py-3 rounded-lg text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isDark ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:bg-emerald-500/50" : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-600/50"} ${mode === "unsubscribe" && "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30"}`}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
                    {mode === "subscribe" ? t.subscribeNow : t.confirmUnsubscribe}
                  </button>
                  
                  <div className="text-center pt-2">
                    <button onClick={() => { setMode(mode === "subscribe" ? "unsubscribe" : "subscribe"); setError(""); }} className="text-[11px] underline opacity-60 hover:opacity-100 transition-opacity">
                      {mode === "subscribe" ? t.wantToUnsubscribe : t.wantToSubscribe}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
export default SubscribeAlerts;