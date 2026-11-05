import { Mail, Phone, MapPin, User, Edit2, Camera } from 'lucide-react';

interface UserProfileProps {
  setCurrentPage: (page: string) => void;
}

export function UserProfile({ setCurrentPage }: UserProfileProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F4C81]">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        <button 
          onClick={() => setCurrentPage('editProfile')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d3d6b] transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-[#0F4C81] to-[#1e5a8e]"></div>
        
        {/* Profile Picture Section */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#0F4C81] rounded-full flex items-center justify-center text-white hover:bg-[#0d3d6b] transition-colors shadow-lg">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 md:mt-0">
              <h2 className="text-2xl font-bold text-gray-900">Neelamm</h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                <span>neelamm@example.com</span>
              </p>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Corresponding Address Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <MapPin className="w-5 h-5 text-[#0F4C81]" />
                <h3 className="text-lg font-semibold text-gray-900">Corresponding Address</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Address</label>
                  <p className="text-gray-900">302 RJA</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Country</label>
                    <p className="text-gray-900">India</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">State</label>
                    <p className="text-gray-900">Maharashtra</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">City</label>
                    <p className="text-gray-900">Nagpur</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Pincode</label>
                    <p className="text-gray-900">440016</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permanent Address Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <MapPin className="w-5 h-5 text-[#0F4C81]" />
                <h3 className="text-lg font-semibold text-gray-900">Permanent Address</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Address</label>
                  <p className="text-gray-900">302 RJA</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Country</label>
                    <p className="text-gray-900">India</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">State</label>
                    <p className="text-gray-900">Maharashtra</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">City</label>
                    <p className="text-gray-900">Nagpur</p>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500 mb-1">Pincode</label>
                    <p className="text-gray-900">440016</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <Phone className="w-5 h-5 text-[#0F4C81]" />
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900">9890637086</p>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Mobile</label>
                  <p className="text-gray-900">9890637086</p>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-500 mb-1">Email ID</label>
                  <p className="text-gray-900">neelamm@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setCurrentPage('changePassword')}
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#0F4C81] hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-[#0F4C81]">Change Password</h4>
              <p className="text-sm text-gray-600 mt-1">Update your password</p>
            </div>
            <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-[#0F4C81]" />
          </div>
        </button>
        
        <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#0F4C81] hover:shadow-md transition-all text-left group">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-[#0F4C81]">Notification Settings</h4>
              <p className="text-sm text-gray-600 mt-1">Manage notifications</p>
            </div>
            <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-[#0F4C81]" />
          </div>
        </button>
        
        <button className="p-4 bg-white rounded-lg border border-gray-200 hover:border-[#0F4C81] hover:shadow-md transition-all text-left group">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-[#0F4C81]">Privacy Settings</h4>
              <p className="text-sm text-gray-600 mt-1">Control your privacy</p>
            </div>
            <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-[#0F4C81]" />
          </div>
        </button>
      </div>
    </div>
  );
}