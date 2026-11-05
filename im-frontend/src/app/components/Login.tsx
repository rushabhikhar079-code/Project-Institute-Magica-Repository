// import { useState, useCallback, useMemo } from "react";
// import { createBrowserRouter, useNavigate } from 'react-router-dom';

// interface LoginProps {
//   onForgotPassword?: () => void;
//   onRequestDemo?: () => void;
// }

// function EyeIcon({ off }: { off?: boolean }) {
//   return off ? (
//     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
//       <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
//     </svg>
//   ) : (
//     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
//       <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//       <circle cx="12" cy="12" r="3" />
//     </svg>
//   );
// }

// function LeftPanel() {
//   const features = [
//     { icon: "🏫", text: "Manage multiple branches with a single login" },
//     { icon: "📊", text: "Fees, attendance, marks, payroll & more — all in one place" },
//     { icon: "📋", text: "One-click reports: outstanding fees, absenteeism, payments" },
//     { icon: "🎥", text: "Live virtual classes & online tests built right in" },
//   ];

//   return (
//     <div className="relative overflow-hidden flex flex-col justify-between p-10 lg:p-14 bg-[#0f4c81] min-h-[480px] lg:min-h-0">
//       {/* Background geometry */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
//         <div className="absolute top-1/3 -left-16 w-64 h-64 rounded-full bg-white/5" />
//         <div className="absolute -bottom-16 right-10 w-48 h-48 rounded-full bg-[#fdc700]/10" />
//         <div className="absolute top-20 right-1/4 w-3 h-3 rounded-full bg-[#fdc700]" />
//         <div className="absolute top-40 right-10 w-2 h-2 rounded-full bg-white/40" />
//         <div className="absolute bottom-32 left-1/3 w-2.5 h-2.5 rounded-full bg-[#fdc700]/60" />
//         {/* Grid lines */}
//         <div className="absolute inset-0 opacity-[0.03]"
//           style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
//       </div>

//       {/* Logo */}
//       <div className="relative z-10">
//         <div className="flex items-center gap-3 mb-2">
//           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
//             <span className="text-[#0f4c81] font-black text-lg">E</span>
//           </div>
//           <span className="text-white font-bold text-xl tracking-tight">Institute Magica</span>
//         </div>
//       </div>

//       {/* Hero text */}
//       <div className="relative z-10 my-8">
//         <p className="text-[#fdc700] text-sm font-semibold tracking-widest uppercase mb-3">Institute Management</p>
//         <h1 className="text-white text-3xl xl:text-4xl font-bold leading-snug">
//           Run your institute<br />
//           <span className="text-[#fdc700]">smarter, faster.</span>
//         </h1>
//         <p className="text-white/60 text-sm mt-4 leading-relaxed max-w-xs">
//           Everything you need to manage students, staff, fees, and academics — in one platform.
//         </p>
//       </div>

//       {/* Features */}
//       <div className="relative z-10 space-y-3">
//         {features.map((f, i) => (
//           <div key={i} className="flex items-start gap-3 bg-white/8 rounded-xl px-4 py-3 backdrop-blur-sm">
//             <span className="text-base mt-0.5">{f.icon}</span>
//             <p className="text-white/80 text-sm leading-snug">{f.text}</p>
//           </div>
//         ))}
//       </div>

//       {/* Version */}
//       <p className="relative z-10 text-white/30 text-xs mt-8">Version 10.0.0</p>
//     </div>
//   );
// }

// function generateCaptcha() {
//   const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
//   return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
// }

// export default function Login({ onForgotPassword, onRequestDemo }: LoginProps) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [captchaText, setCaptchaText] = useState(() => generateCaptcha());
//   const [captchaInput, setCaptchaInput] = useState("");
//   const [captchaError, setCaptchaError] = useState(false);
//   const navigate = useNavigate();

//   const refreshCaptcha = () => {
//     setCaptchaText(generateCaptcha());
//     setCaptchaInput("");
//     setCaptchaError(false);
//   };

//   // Scramble angles for each character to look hand-drawn
//   const captchaChars = useMemo(() =>
//     captchaText.split("").map((ch, i) => ({
//       ch,
//       rotate: (i % 2 === 0 ? 1 : -1) * (5 + (i * 7) % 12),
//       color: ["#0f4c81", "#1e6fba", "#374151", "#0a3a63", "#1d4ed8", "#374151"][i % 6],
//     })), [captchaText]);

//   const handleSubmit = useCallback((e: React.FormEvent) => {
//     e.preventDefault();
//     if (captchaInput.trim() !== captchaText) {
//       setCaptchaError(true);
//       setCaptchaInput("");
//       setCaptchaText(generateCaptcha());
//       return;
//     }
//     navigate("/dashboard")
//     setCaptchaError(false);
//   }, [captchaInput, captchaText]);

//   return (
//     <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 lg:p-8">
//       <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-[1.1fr_1fr]">
//         <LeftPanel />

//         {/* Right: Form */}
//         <div className="flex flex-col justify-center px-8 py-12 sm:px-12 bg-white">
//           <div className="w-full max-w-sm mx-auto">
//             {/* Heading */}
//             <div className="mb-8">
//               <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
//               <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* Username */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
//                 <input
//                   type="text"
//                   placeholder="Enter your username"
//                   value={username}
//                   onChange={e => setUsername(e.target.value)}
//                   autoComplete="username"
//                   className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-all"
//                 />
//               </div>

//               {/* Password */}
//               <div>
//                 <div className="flex items-center justify-between mb-1.5">
//                   <label className="block text-sm font-medium text-gray-700">Password</label>
//                   <button
//                     type="button"
//                     onClick={onForgotPassword}
//                     className="text-xs text-[#0f4c81] hover:text-[#0a3a63] font-medium hover:underline transition-colors"
//                   >
//                     Forgot password?
//                   </button>
//                 </div>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={e => setPassword(e.target.value)}
//                     autoComplete="current-password"
//                     className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81] transition-all"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(v => !v)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                   >
//                     <EyeIcon off={showPassword} />
//                   </button>
//                 </div>
//               </div>

//               {/* Remember me + Forgot */}
//               <label className="flex items-center gap-2.5 cursor-pointer select-none">
//                 <input
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={e => setRememberMe(e.target.checked)}
//                   className="w-4 h-4 rounded border-gray-300 accent-[#0f4c81]"
//                 />
//                 <span className="text-sm text-gray-600">Do Not Show Popup Reminder</span>
//               </label>

//               {/* Captcha */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Captcha</label>
//                 <div className="flex items-center gap-2 mb-2">
//                   {/* Captcha display */}
//                   <div className="flex items-center gap-0.5 rounded-lg px-3 py-2 select-none flex-shrink-0 bg-[#dfe0e0]">
//                     {captchaChars.map(({ ch, rotate, color }, i) => (
//                       <span
//                         key={i}
//                         className="font-mono text-base font-bold inline-block"
//                         style={{ transform: `rotate(${rotate}deg)`, color, textShadow: "0 1px 2px rgba(0,0,0,0.4)", letterSpacing: "1px" }}
//                       >
//                         {ch}
//                       </span>
//                     ))}
//                   </div>
//                   {/* Refresh */}
//                   <button
//                     type="button"
//                     onClick={refreshCaptcha}
//                     title="Refresh captcha"
//                     className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-[#0f4c81] transition-colors flex-shrink-0"
//                   >
//                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                   </button>
//                   {/* Input */}
//                   <input
//                     type="text"
//                     placeholder="Type captcha"
//                     value={captchaInput}
//                     onChange={e => { setCaptchaInput(e.target.value); setCaptchaError(false); }}
//                     className={`flex-1 px-3 py-2.5 rounded-xl border text-sm placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${captchaError ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81]"}`}
//                   />
//                 </div>
//                 {captchaError && (
//                   <p className="text-xs text-red-500 mt-1">Incorrect captcha. Please try again.</p>
//                 )}
//               </div>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 className="w-full bg-[#0f4c81] hover:bg-[#0a3a63] active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#0f4c81]/25 transition-all duration-200 text-sm mt-2"
//               >
//                 Sign in
//               </button>
//             </form>

//             {/* Divider */}
//             <div className="flex items-center gap-3 my-6">
//               <div className="flex-1 h-px bg-gray-200" />
//               <span className="text-xs text-gray-400">or</span>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>

//             {/* Register */}
//             <button
//               type="button"
//               onClick={onRequestDemo}
//               className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-all text-sm"
//             >
//               Register Your Institute
//             </button>

//             <p className="text-center text-xs text-gray-400 mt-6">
//               By signing in you agree to our{" "}
//               <a href="#" className="text-[#0f4c81] hover:underline">Terms</a> &{" "}
//               <a href="#" className="text-[#0f4c81] hover:underline">Privacy Policy</a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
