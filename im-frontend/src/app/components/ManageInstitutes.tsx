import { useState, useEffect } from "react";
import { Calendar, Upload, X, Save, RotateCcw } from "lucide-react";

interface ManageInstitutesProps {
  setCurrentPage: (page: string) => void;
}

export function ManageInstitutes({ setCurrentPage }: ManageInstitutesProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    registrationDate: "",
    shortCode: "",
    parentCompany: "",
    instituteName: "",
    address: "",
    country: "",
    state: "",
    district: "",
    pinCode: "",
    phone: "",
    email: "",
    numberOfStudents: "",
    coachingFor: "",
    salesPerson: "",
    internalUse: "no",
    type: "premium",
    status: "active",
    expiryDate: "",
    allowStudentModule: false,
    androidAppParents: false,
    onlineTestEngine: false,
    subscriptionType: "select-plan",
    startDate: "",
    endDate: "",
    numDays: 0,
    numRegisteredStudents: "",
    numEnquiryStudents: "",
    numBranches: "",
    contactPerson: "",
    sameAsAbove: false,
    contactMobile: "",
    contactEmail: "",
  });

  // Calculate days between start and end date
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0) {
        setFormData((prev) => ({ ...prev, numDays: diffDays }));
      } else {
        setFormData((prev) => ({ ...prev, numDays: 0 }));
      }
    } else {
      setFormData((prev) => ({ ...prev, numDays: 0 }));
    }
  }, [formData.startDate, formData.endDate]);

  // Handle "Same as Above" checkbox
  useEffect(() => {
    if (formData.sameAsAbove) {
      setFormData((prev) => ({
        ...prev,
        contactPerson: prev.instituteName,
        contactMobile: prev.phone,
        contactEmail: prev.email,
      }));
    }
  }, [formData.sameAsAbove]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      // Handle "Same as Above" checkbox
      if (name === "sameAsAbove" && !checked) {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
          contactPerson: "",
          contactMobile: "",
          contactEmail: "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    const fileInput = document.getElementById(
      "logo-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your submission logic here
  };

  const handleReset = () => {
    setFormData({
      registrationDate: "",
      shortCode: "",
      parentCompany: "",
      instituteName: "",
      address: "",
      country: "",
      state: "",
      district: "",
      pinCode: "",
      phone: "",
      email: "",
      numberOfStudents: "",
      coachingFor: "",
      salesPerson: "",
      internalUse: "no",
      type: "premium",
      status: "active",
      expiryDate: "",
      allowStudentModule: false,
      androidAppParents: false,
      onlineTestEngine: false,
      subscriptionType: "select-plan",
      startDate: "",
      endDate: "",
      numDays: 0,
      numRegisteredStudents: "",
      numEnquiryStudents: "",
      numBranches: "",
      contactPerson: "",
      sameAsAbove: false,
      contactMobile: "",
      contactEmail: "",
    });
    setLogoPreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Institutes
          </h1>
          <p className="text-gray-600 mt-2">Institute Details & Settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Institute Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Institute Details
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
              {/* Date of Registration */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Date of Registration
                </label>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Institute Short Code */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Institute Short Code
                </label>
                <input
                  type="text"
                  name="shortCode"
                  value={formData.shortCode}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="e.g., INST001"
                />
              </div>

              {/* Parent Company Name */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Parent Company Name
                </label>
                <input
                  type="text"
                  name="parentCompany"
                  value={formData.parentCompany}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="Enter parent company name"
                />
              </div>

              {/* Name of Institute */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Name of Institute <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="instituteName"
                  value={formData.instituteName}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="Enter institute name"
                />
              </div>

              {/* Address - Full Width */}
              <div className="flex items-start lg:col-span-2">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent resize-none"
                  placeholder="Enter complete address"
                />
              </div>

              {/* Country */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  <option value="india">India</option>
                  <option value="usa">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="canada">Canada</option>
                  <option value="australia">Australia</option>
                </select>
              </div>

              {/* State */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                >
                  <option value="">Select State</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="delhi">Delhi</option>
                  <option value="tamil-nadu">Tamil Nadu</option>
                  <option value="gujarat">Gujarat</option>
                  <option value="rajasthan">Rajasthan</option>
                </select>
              </div>

              {/* District */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  District
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                >
                  <option value="">Select District</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="pune">Pune</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="chennai">Chennai</option>
                </select>
              </div>

              {/* Pin Code */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Pin Code
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  maxLength={6}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="e.g., 400001"
                />
              </div>

              {/* Phone */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="e.g., +91 9876543210"
                />
              </div>

              {/* Email ID */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="institute@example.com"
                />
              </div>

              {/* Number of Students */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Number of Students
                </label>
                <input
                  type="text"
                  name="numberOfStudents"
                  value={formData.numberOfStudents}
                  onChange={handleInputChange}
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="e.g., 500"
                />
              </div>

              {/* We Provide Coaching For */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  We Provide Coaching For
                </label>
                <input
                  type="text"
                  name="coachingFor"
                  value={formData.coachingFor}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="e.g., JEE, NEET, UPSC"
                />
              </div>

              {/* Sales Person Name */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Sales Person Name
                </label>
                <input
                  type="text"
                  name="salesPerson"
                  value={formData.salesPerson}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="Enter sales person name"
                />
              </div>

              {/* Internal Use */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Internal Use
                </label>
                <div className="flex-1 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="internalUse"
                      value="yes"
                      checked={formData.internalUse === "yes"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="internalUse"
                      value="no"
                      checked={formData.internalUse === "no"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Logo Upload - Full Width */}
              <div className="flex items-start lg:col-span-2">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Logo
                </label>
                <div className="flex-1 flex gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="logo-upload"
                        className="flex items-center gap-2 px-4 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Choose File</span>
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Maximum file size: 2MB | Recommended dimensions: 200x200px
                      | Format: PNG, JPG
                    </p>
                  </div>

                  {/* Logo Preview */}
                  {logoPreview && (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-32 h-32 object-contain border border-gray-200 rounded-lg bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Institute Settings Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Institute Settings
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
              {/* Type */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Type
                </label>
                <div className="flex-1 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="premium"
                      checked={formData.type === "premium"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Premium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="trial"
                      checked={formData.type === "trial"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Trial</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Status
                </label>
                <div className="flex-1 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Expiry Date
                </label>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Checkboxes - Full Width */}
              <div className="flex items-start lg:col-span-2">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Module Access
                </label>
                <div className="flex-1 space-y-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="allowStudentModule"
                      checked={formData.allowStudentModule}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">
                      Allow Student Module
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="androidAppParents"
                      checked={formData.androidAppParents}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">
                      Android App for Parents
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="onlineTestEngine"
                      checked={formData.onlineTestEngine}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">
                      Online Test Engine
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Subscription Details
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
              {/* Subscription Type - Full Width */}
              <div className="flex items-start lg:col-span-2">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Subscription Type
                </label>
                <div className="flex-1 flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="subscriptionType"
                      value="select-plan"
                      checked={formData.subscriptionType === "select-plan"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Select Plan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="subscriptionType"
                      value="branch-wise"
                      checked={formData.subscriptionType === "branch-wise"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Branch Wise</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="subscriptionType"
                      value="student-wise"
                      checked={formData.subscriptionType === "student-wise"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0F4C81] border-gray-300 focus:ring-[#0F4C81]"
                    />
                    <span className="text-sm text-gray-700">Student Wise</span>
                  </label>
                </div>
              </div>

              {/* Start Date */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Start Date
                </label>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  End Date
                </label>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* No. of Days */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  No. of Days
                </label>
                <input
                  type="text"
                  name="numDays"
                  value={formData.numDays}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                  placeholder="e.g., 365"
                />
              </div>

              {/* No. of Registered Students */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  No. of Registered Students
                </label>
                <input
                  type="text"
                  name="numRegisteredStudents"
                  value={formData.numRegisteredStudents}
                  onChange={handleInputChange}
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="e.g., 100"
                />
              </div>

              {/* No. of Enquiry Students */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  No. of Enquiry Students
                </label>
                <input
                  type="text"
                  name="numEnquiryStudents"
                  value={formData.numEnquiryStudents}
                  onChange={handleInputChange}
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="e.g., 50"
                />
              </div>

              {/* No. of Branches */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  No. of Branches
                </label>
                <input
                  type="text"
                  name="numBranches"
                  value={formData.numBranches}
                  onChange={handleInputChange}
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="e.g., 5"
                />
              </div>
            </div>
          </div>

          {/* Contact Person Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Contact Person Details
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
              {/* Contact Person */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                    placeholder="Enter contact person name"
                  />
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                    <input
                      type="checkbox"
                      name="sameAsAbove"
                      checked={formData.sameAsAbove}
                      onChange={handleInputChange}
                      className="w-3.5 h-3.5 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81]"
                    />
                    <span>Same as above</span>
                  </label>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactMobile"
                  value={formData.contactMobile}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="e.g., +91 9876543210"
                />
              </div>

              {/* Email ID */}
              <div className="flex items-start">
                <label className="w-48 pt-2 text-sm font-medium text-gray-700 flex-shrink-0">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-2.5 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d6a] transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Save Institute</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
