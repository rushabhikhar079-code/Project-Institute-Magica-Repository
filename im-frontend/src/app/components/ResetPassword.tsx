import { useState } from "react";

interface ResetPasswordProps {
  setCurrentPage?: (page: string) => void;
}

function LockIcon() {
  return (
    <svg className="w-8 h-8 text-[#0f4c81]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path strokeLinecap="round" d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

export default function ResetPassword({ setCurrentPage }: ResetPasswordProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center p-4">
      {/* Logo bar */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 bg-[#0f4c81] rounded-xl flex items-center justify-center shadow">
          <span className="text-white font-black text-base">E</span>
        </div>
        <span className="text-gray-900 font-bold text-lg tracking-tight">Institute Magica</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/80 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#0f4c81] via-[#1e6fba] to-[#fdc700]" />

        <div className="px-8 py-10">
          {!submitted ? (
            <>
              {/* Icon + Heading */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-[#0f4c81]/10 rounded-2xl flex items-center justify-center mb-4">
                  <LockIcon />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                  Enter your username and registered email. We'll send you instructions to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <UserIcon />
                    </span>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email ID</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MailIcon />
                    </span>
                    <input
                      type="email"
                      placeholder="XYZ@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0f4c81] hover:bg-[#0a3a63] active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#0f4c81]/25 transition-all duration-200 text-sm mt-2"
                >
                  Send Reset Instructions
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                We've sent password reset instructions to <strong className="text-gray-700">{email}</strong>.
              </p>
              <p className="text-xs text-gray-400 mb-4">Didn't receive the email? Check spam or</p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-[#0f4c81] font-medium hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
            <button
              type="button"
              onClick={() => setCurrentPage?.("login")}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0f4c81] font-medium transition-colors"
            >
              <ArrowLeftIcon />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">Version 10.0.0</p>
    </div>
  );
}
