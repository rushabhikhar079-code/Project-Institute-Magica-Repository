import { useState } from 'react';
import { Mail, Phone, MapPin, User, Save, X, Camera, ArrowLeft } from 'lucide-react';

interface EditProfileProps {
  setCurrentPage: (page: string) => void;
}

export function EditProfile({ setCurrentPage }: EditProfileProps) {
  const [formData, setFormData] = useState({
    name: 'Neelamm',
    correspondingAddress: '302 RJA',
    correspondingCountry: 'India',
    correspondingState: 'Maharashtra',
    correspondingCity: 'Nagpur',
    correspondingPincode: '440016',
    permanentAddress: '302 RJA',
    permanentCountry: 'India',
    permanentState: 'Maharashtra',
    permanentCity: 'Nagpur',
    permanentPincode: '440016',
    phone: '9890637086',
    mobile: '9890637086',
    email: 'neelamm@example.com'
  });

  const [sameAsCorresponding, setSameAsCorresponding] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setSameAsCorresponding(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permanentAddress: prev.correspondingAddress,
        permanentCountry: prev.correspondingCountry,
        permanentState: prev.correspondingState,
        permanentCity: prev.correspondingCity,
        permanentPincode: prev.correspondingPincode
      }));
    }
  };

  const handleSave = () => {
    // Here you would typically save to backend/database
    alert('Profile updated successfully!');
    setCurrentPage('userProfile');
  };

  const handleCancel = () => {
    setCurrentPage('userProfile');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F4C81]">Edit Profile</h1>
            <p className="text-gray-600 mt-1">Update your personal information</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-[#0F4C81] to-[#1e5a8e]"></div>
        
        {/* Profile Picture Section */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-6 -mt-16 mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#0F4C81] rounded-full flex items-center justify-center text-white hover:bg-[#0d3d6b] transition-colors shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <form className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Corresponding Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <MapPin className="w-5 h-5 text-[#0F4C81]" />
                <h3 className="text-lg font-semibold text-gray-900">Corresponding Address</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="correspondingAddress"
                    value={formData.correspondingAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="correspondingCountry"
                      value={formData.correspondingCountry}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors"
                      required
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="correspondingState"
                      value={formData.correspondingState}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="correspondingCity"
                      value={formData.correspondingCity}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="correspondingPincode"
                      value={formData.correspondingPincode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Permanent Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#0F4C81]" />
                  <h3 className="text-lg font-semibold text-gray-900">Permanent Address</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsCorresponding}
                    onChange={(e) => handleSameAddressToggle(e.target.checked)}
                    className="w-4 h-4 text-[#0F4C81] border-gray-300 rounded focus:ring-[#0F4C81]"
                  />
                  <span className="text-sm text-gray-700">Same as Corresponding Address</span>
                </label>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    disabled={sameAsCorresponding}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="permanentCountry"
                      value={formData.permanentCountry}
                      onChange={handleChange}
                      disabled={sameAsCorresponding}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                      required
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="permanentState"
                      value={formData.permanentState}
                      onChange={handleChange}
                      disabled={sameAsCorresponding}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="permanentCity"
                      value={formData.permanentCity}
                      onChange={handleChange}
                      disabled={sameAsCorresponding}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="permanentPincode"
                      value={formData.permanentPincode}
                      onChange={handleChange}
                      disabled={sameAsCorresponding}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <Phone className="w-5 h-5 text-[#0F4C81]" />
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81] outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Action Buttons - Mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCancel}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3d6b] transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}