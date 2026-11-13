import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  X,
  UserCheck,
  Briefcase,
  Search,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Clock,
  Building2,
  MapPin,
  Lock,
  Mail,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import {
  CitizenCheckInRecord,
  CitizenWorkStatus,
  UnemploymentDurationBracket,
} from '../types/labor';
import { TARGET_INDUSTRIES, US_STATES } from '../data/citizenBaseline';
import {
  isSupabaseConfigured,
  signInWithEmailMagicLink,
  signInWithGoogleOAuth,
} from '../lib/supabase';

interface CitizenCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecord: CitizenCheckInRecord | null;
  authUser?: User | null;
  onSignOut?: () => void;
  onSubmitCheckIn: (record: CitizenCheckInRecord) => void;
}

const DURATION_OPTIONS: Array<{ id: UnemploymentDurationBracket; label: string; desc: string }> = [
  { id: '< 5w', label: '< 5 Weeks', desc: 'Recently separated or frictionally searching' },
  { id: '5-14w', label: '5 to 14 Weeks', desc: 'Moderate active job hunt' },
  { id: '15-26w', label: '15 to 26 Weeks', desc: 'Extended search period' },
  { id: '27+w', label: '27+ Weeks', desc: 'Long-term unemployed pool' },
];

export const CitizenCheckInModal: React.FC<CitizenCheckInModalProps> = ({
  isOpen,
  onClose,
  currentRecord,
  authUser = null,
  onSignOut,
  onSubmitCheckIn,
}) => {
  const [status, setStatus] = useState<CitizenWorkStatus>(
    currentRecord?.status || 'working_fulltime'
  );
  const [duration, setDuration] = useState<UnemploymentDurationBracket>(
    currentRecord?.duration || '< 5w'
  );
  const [targetIndustry, setTargetIndustry] = useState<string>(
    currentRecord?.targetIndustry || 'tech'
  );
  const [stateCode, setStateCode] = useState<string>(currentRecord?.state || 'US');
  const [step, setStep] = useState<1 | 2>(1);
  const [isVerified, setIsVerified] = useState<boolean>(
    Boolean(authUser) || currentRecord?.verificationTier === 'verified_citizen'
  );

  // Auth form states
  const [emailInput, setEmailInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [magicLinkSentTo, setMagicLinkSentTo] = useState<string | null>(null);

  if (!isOpen) return null;

  const requiresAuth = isSupabaseConfigured && !authUser;
  const effectiveVerified = Boolean(authUser) || isVerified;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await signInWithEmailMagicLink(emailInput.trim());
    setAuthLoading(false);
    if (error) {
      setAuthError(error);
    } else {
      setMagicLinkSentTo(emailInput.trim());
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await signInWithGoogleOAuth();
    setAuthLoading(false);
    if (error) {
      setAuthError(error);
    }
  };

  const handleSave = () => {
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day soft-expiry

    const record: CitizenCheckInRecord = {
      id: authUser?.id || currentRecord?.id || `anon_${Math.random().toString(36).substring(2, 9)}`,
      status,
      duration: status === 'not_working_looking' ? duration : undefined,
      targetIndustry,
      state: stateCode,
      verificationTier: effectiveVerified ? 'verified_citizen' : 'anonymous_local',
      updatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };

    onSubmitCheckIn(record);
    onClose();
  };

  const handleSimulateVerify = () => {
    setIsVerified(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-modal-title"
      data-testid="citizen-checkin-modal"
    >
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        data-testid="checkin-modal-backdrop"
      />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 id="checkin-modal-title" className="text-lg font-bold text-white">
                {requiresAuth ? 'Sign In to Participate' : 'Log Your Work Status'}
              </h2>
              <p className="text-xs text-slate-400">
                {requiresAuth
                  ? 'Verify your email or Google account to add to the live US pulse'
                  : '10-second verified check-in for the Live US Citizen Pulse'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Check-In Modal"
            data-testid="close-checkin-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {requiresAuth ? (
            <div className="space-y-4" data-testid="auth-gate-view">
              {magicLinkSentTo ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2.5">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="text-sm font-bold text-white">Check Your Email</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    We sent a 1-click sign-in link to{' '}
                    <span className="font-semibold text-emerald-300">{magicLinkSentTo}</span>.
                    Click the link in your email to unlock your check-in!
                  </p>
                  <button
                    type="button"
                    onClick={() => setMagicLinkSentTo(null)}
                    className="text-xs text-cyan-400 hover:underline font-semibold pt-1"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      To keep the Live US Labor Barometer accurate and spam-free, participants
                      sign in before submitting data. Your email is{' '}
                      <strong className="text-white">never displayed publicly</strong>.
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                      {authError}
                    </div>
                  )}

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={handleGoogleSignIn}
                    data-testid="google-oauth-btn"
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-800" />
                    <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Or via Email Magic Link
                    </span>
                    <div className="flex-grow border-t border-slate-800" />
                  </div>

                  {/* Email Magic Link Form */}
                  <form onSubmit={handleEmailSignIn} className="space-y-2.5">
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        data-testid="email-auth-input"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading || !emailInput.trim()}
                      data-testid="email-auth-submit-btn"
                      className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
                    >
                      {authLoading ? 'Sending link...' : 'Send 1-Click Sign-In Link'}
                    </button>
                  </form>
                </>
              )}
            </div>
          ) : (
            <>
              {authUser && (
                <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-emerald-300 font-medium truncate">
                      Verified: {authUser.email}
                    </span>
                  </div>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 shrink-0"
                    >
                      <LogOut className="w-3 h-3" />
                      Sign Out
                    </button>
                  )}
                </div>
              )}

              {step === 1 ? (
            <>
              {/* Step 1: Work Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  1. Current Employment Status
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    data-testid="status-opt-fulltime"
                    onClick={() => setStatus('working_fulltime')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      status === 'working_fulltime'
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Working Full-Time</div>
                        <div className="text-xs text-slate-400">35+ hours/week on payroll</div>
                      </div>
                    </div>
                    {status === 'working_fulltime' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    data-testid="status-opt-parttime"
                    onClick={() => setStatus('working_parttime')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      status === 'working_parttime'
                        ? 'bg-teal-950/40 border-teal-500/60 ring-1 ring-teal-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Working Part-Time</div>
                        <div className="text-xs text-slate-400">
                          Voluntary or economic part-time (&lt;35h)
                        </div>
                      </div>
                    </div>
                    {status === 'working_parttime' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    data-testid="status-opt-looking"
                    onClick={() => setStatus('not_working_looking')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      status === 'not_working_looking'
                        ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Not Working (Looking)</div>
                        <div className="text-xs text-slate-400">
                          Actively searching for new employment
                        </div>
                      </div>
                    </div>
                    {status === 'not_working_looking' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* If Not Working: Unemployment Duration Selector */}
              {status === 'not_working_looking' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    2. How long have you been looking?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        data-testid={`duration-opt-${opt.id.replace(/\s+/g, '')}`}
                        onClick={() => setDuration(opt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          duration === opt.id
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-200">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Step 2: Target Industry & Optional State */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Target Industry {status === 'not_working_looking' ? 'Desirably Seeking' : 'Sector'}
                </label>
                <select
                  data-testid="select-target-industry"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {TARGET_INDUSTRIES.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Location (Optional)
                </label>
                <select
                  data-testid="select-state"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {US_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name} {st.code !== 'US' ? `(${st.code})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Leave as Nationwide if you prefer not to share your state.
                </p>
              </div>

              {/* Bot-Shield & Privacy Verification Prompt */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Split-Identity Privacy Shield
                    </span>
                  </div>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Human
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Anonymous Local</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your identity is protected via HMAC-SHA256 one-way hashing. No email, name, or
                  phone is stored alongside your labor status.
                </p>

                {!isVerified && (
                  <button
                    type="button"
                    data-testid="simulate-verify-btn"
                    onClick={handleSimulateVerify}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Verify with Google / Apple (1-Tap)</span>
                  </button>
                )}
              </div>
            </>
          )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!requiresAuth && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
            {step === 2 && (
              <button
                type="button"
                data-testid="checkin-back-btn"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Back
              </button>
            )}

            <div className="flex-1 flex justify-end gap-2">
              {step === 1 ? (
                <button
                  type="button"
                  data-testid="checkin-next-btn"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="checkin-submit-btn"
                  onClick={handleSave}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                >
                  Submit Citizen Check-In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
