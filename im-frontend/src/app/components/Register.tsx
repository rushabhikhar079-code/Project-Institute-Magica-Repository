import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface CaptchaChar {
  ch: string;
  rotate: number;
  color: string;
}

const CAPTCHA_COLORS = ['#0f4c81', '#101828', '#2563eb', '#059669', '#d97706', '#dc2626'];

function generateRandomCaptcha(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const captchaList: CaptchaChar[] = [];

  for (let i = 0; i < length; i++) {
    const ch = chars.charAt(Math.floor(Math.random() * chars.length));
    const rotate = Math.floor(Math.random() * 30) - 15;
    const color = CAPTCHA_COLORS[Math.floor(Math.random() * CAPTCHA_COLORS.length)];
    captchaList.push({ ch, rotate, color });
  }

  return captchaList;
}

function Field({ label, placeholder, required = true }: { label: string; placeholder: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-[#364153]">
        {label} {required && <span className="text-[#ee613e]">*</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-[46px] px-4 border border-[#d1d5dc] rounded-[10px] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent"
      />
    </div>
  );
}

function SelectField({ label, placeholder, required = true }: { label: string; placeholder: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-[#364153]">
        {label} {required && <span className="text-[#ee613e]">*</span>}
      </label>
      <div className="relative">
        <select className="w-full h-[46px] px-4 pr-10 border border-[#d1d5dc] rounded-[10px] text-sm text-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent bg-white">
          <option value="">{placeholder}</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [captchaChars, setCaptchaChars] = useState<CaptchaChar[]>([]);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptchaChars(generateRandomCaptcha(6));
    setCaptchaInput('');
    setCaptchaError(false);
  }, []);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const handleReset = () => {
    refreshCaptcha();
    setTermsAccepted(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const expectedCode = captchaChars.map((c) => c.ch).join('');
    if (captchaInput.trim().toLowerCase() !== expectedCode.toLowerCase()) {
      setCaptchaError(true);
      return;
    }

    setCaptchaError(false);
    alert('Form submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#0f4c81] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-[#101828] text-lg">Institute Magica</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm text-[#364153] font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Page Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleRegister}>
          {/* Single Combined Card Container */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-8">
            {/* Title */}
            <h2 className="text-xl font-semibold text-[#101828]">Institute Details</h2>

            {/* Input Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <Field label="Username" placeholder="Enter your username" />
              <Field label="Institute Name" placeholder="Enter your institute name" />
              <Field label="Email Id" placeholder="Enter your email id" />
              <Field label="Mobile Number" placeholder="Enter your mobile number" />
              <Field label="Address" placeholder="Enter your address" />
              <SelectField label="Country" placeholder="Select your Country" />
              <SelectField label="State" placeholder="Select your state" />
              <SelectField label="City" placeholder="Select your City" />
              <Field label="Pincode" placeholder="Enter your pincode" />
              <Field label="Contact Person" placeholder="Enter your contact person" />
              <Field label="Number Of Students" placeholder="Enter number of students" />
              <Field label="We Provide Coaching For" placeholder="Enter your requirement" />
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm text-[#364153]">
                  Remarks <span className="text-[#ee613e]">*</span>
                </label>
                <textarea
                  placeholder="Enter remarks"
                  rows={3}
                  className="w-full px-4 py-3 border border-[#d1d5dc] rounded-[10px] text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Downside Section: Terms, Captcha, Buttons */}
            <div className="space-y-5 pt-2">
              {/* Terms and Conditions Link */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0f4c81] focus:ring-[#0f4c81] cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-[#364153] cursor-pointer">
                  I agree to the{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0f4c81] font-medium underline hover:text-[#0a3a63] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>

              {/* Captcha Block */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Captcha</label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5 rounded-lg px-3 py-2 select-none flex-shrink-0 bg-[#dfe0e0]">
                    {captchaChars.map(({ ch, rotate, color }, i) => (
                      <span
                        key={i}
                        className="font-mono text-base font-bold inline-block"
                        style={{
                          transform: `rotate(${rotate}deg)`,
                          color,
                          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                          letterSpacing: '1px',
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    title="Refresh captcha"
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-[#0f4c81] transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>

                  <input
                    type="text"
                    placeholder="Type captcha"
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value);
                      setCaptchaError(false);
                    }}
                    className={`w-full sm:w-auto sm:max-w-[200px] px-3 py-2.5 rounded-xl border text-sm placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      captchaError
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-gray-200 focus:ring-[#0f4c81]/30 focus:border-[#0f4c81]'
                    }`}
                  />
                </div>
                {captchaError && (
                  <p className="text-xs text-red-500 mt-1">Incorrect captcha. Please try again.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                <button
                  type="submit"
                  className="flex-1 h-12 bg-[#0f4c81] text-white text-base rounded-[10px] font-medium hover:bg-[#0a3a63] transition-colors shadow"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 h-12 bg-white text-[#364153] text-base rounded-[10px] font-medium border border-[#d1d5dc] hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}