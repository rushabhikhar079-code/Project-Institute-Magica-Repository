import { useState } from "react";
import { ArrowLeft, Save, X, RefreshCw } from "lucide-react";

interface InstituteRegistrationProps {
  setCurrentPage: (page: string) => void;
}

export function InstituteRegistration({
  setCurrentPage,
}: InstituteRegistrationProps) {
  const [formData, setFormData] = useState({
    username: "",
    instituteName: "",
    emailId: "",
    mobileNumber: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pinCode: "",
    contactPerson: "",
    numberOfStudents: "",
    coachingFor: "",
    remarks: "",
    planSelect: "",
    captcha: "",
  });

  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());

  function generateCaptcha() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRefreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setFormData((prev) => ({ ...prev, captcha: "" }));
  };

  const handleSave = () => {
    // Validation
    if (
      !formData.username ||
      !formData.instituteName ||
      !formData.emailId ||
      !formData.mobileNumber
    ) {
      alert("Please fill all mandatory fields");
      return;
    }

    if (formData.captcha !== captchaCode) {
      alert("Invalid captcha code. Captcha is case sensitive.");
      return;
    }

    console.log("Saving institute registration:", formData);
    alert("Institute registered successfully!");
    setCurrentPage("dashboard");
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? All changes will be lost.")) {
      setCurrentPage("dashboard");
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all data?")) {
      setFormData({
        username: "",
        instituteName: "",
        emailId: "",
        mobileNumber: "",
        address: "",
        country: "",
        state: "",
        city: "",
        pinCode: "",
        contactPerson: "",
        numberOfStudents: "",
        coachingFor: "",
        remarks: "",
        planSelect: "",
        captcha: "",
      });
      handleRefreshCaptcha();
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Institute Registration
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Register a new institute
            </p>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Institute Information
        </h2>

        {/* Basic Information Section */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institute Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.instituteName}
                onChange={(e) =>
                  handleInputChange("instituteName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                placeholder="Enter institute name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Id <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.emailId}
                onChange={(e) => handleInputChange("emailId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) =>
                  handleInputChange("mobileNumber", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                placeholder="+91 1234567890"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) =>
                  handleInputChange("contactPerson", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                placeholder="Enter contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Students <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.numberOfStudents}
                onChange={(e) =>
                  handleInputChange("numberOfStudents", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                placeholder="Enter number of students"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                We Provide Coaching For <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.coachingFor}
                onChange={(e) =>
                  handleInputChange("coachingFor", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                placeholder="e.g., Engineering, Medical, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Select <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.planSelect}
                onChange={(e) =>
                  handleInputChange("planSelect", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
              >
                <option value="">Select Plan</option>
                <option value="basic">Basic Plan</option>
                <option value="standard">Standard Plan</option>
                <option value="premium">Premium Plan</option>
                <option value="enterprise">Enterprise Plan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information Section */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm resize-none"
                placeholder="Enter complete address"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
              >
                <option value="">Select Country</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
              >
                <option value="">Select State</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Delhi">Delhi</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Rajasthan">Rajasthan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
              >
                <option value="">Select City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Pune">Pune</option>
                <option value="Ahmedabad">Ahmedabad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pin Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) => handleInputChange("pinCode", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                placeholder="Enter pin code"
                maxLength={6}
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm resize-none"
                placeholder="Enter any additional remarks"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Captcha Section */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Verification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Captcha Code <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">
                  (Case Sensitive)
                </span>
              </label>
              <div className="flex items-center gap-3">
                <div className="px-6 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-800 font-bold text-xl tracking-widest select-none">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="p-2.5 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors"
                  title="Refresh Captcha"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.captcha}
                onChange={(e) => handleInputChange("captcha", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent text-sm"
                placeholder="Enter captcha code"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-6 py-2.5 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-2.5 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3f6b] transition-colors font-medium text-sm"
          >
            <Save className="w-4 h-4" />
            Register Institute
          </button>
        </div>
      </div>
    </div>
  );
}
