import React from "react";
import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <ShieldX className="h-10 w-10 text-red-500" strokeWidth={1.8} />
        </div>

        {/* Status */}
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#0F4C81]">
          Access Denied
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Unauthorized Access
        </h1>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-gray-500">
          You do not have permission to access this page. Please contact your
          administrator if you believe you should have access.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
