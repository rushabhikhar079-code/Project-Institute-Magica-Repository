import React, { useState } from "react";
import { FileSpreadsheet, Upload, X, Download } from "lucide-react";

// Helper styling classes matching consistent design system
const selectInp =
  "w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81] text-sm bg-white transition-all font-sans";

export function ManageBranches() {
  const [course, setCourse] = useState<string>("Select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (course === "Select") {
      alert("Please select a Course.");
      return;
    }
    if (!selectedFile) {
      alert("Please choose a FaceBook Excel file to upload.");
      return;
    }
    alert(
      `Importing FaceBook data for ${course}... File ${selectedFile.name} uploaded successfully!`,
    );
  };

  const handleCancel = () => {
    setCourse("Select");
    setSelectedFile(null);
    alert("Import process cancelled.");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Page Header */}

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Main Section Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-[#0F4C81] uppercase tracking-wide flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#0F4C81]" />
              Import FaceBook Data
            </h2>
          </div>

          {/* Step-by-Step Instructions & Input Layout */}
          <div className="space-y-5 bg-slate-50/60 border border-gray-200 p-5 rounded-xl">
            {/* Step 1 (Optional) */}
            <div className="flex items-center text-xs font-medium text-gray-700">
              <span className="font-bold text-[#0F4C81] w-32 shrink-0">
                Step 1(Optional):
              </span>
              <div className="flex-1 flex flex-wrap items-center gap-1">
                <span>Click</span>
                <button
                  type="button"
                  onClick={() =>
                    alert("Downloading FaceBook Excel template...")
                  }
                  className="font-bold text-[#0F4C81] hover:underline inline-flex items-center gap-0.5"
                >
                  here
                  <Download className="w-3.5 h-3.5 text-[#0F4C81]" />
                </button>
                <span>to download format of FaceBook excel file</span>
              </div>
            </div>

            {/* Step 2 (Optional) */}
            <div className="flex items-center text-xs font-medium text-gray-700">
              <span className="font-bold text-[#0F4C81] w-32 shrink-0">
                Step 2(Optional):
              </span>
              <div className="flex-1">
                Enter data or cut and paste into downloaded excel file
              </div>
            </div>

            {/* Step 3: Select Course */}
            <div className="flex items-start text-xs text-gray-700">
              <span className="font-bold text-[#0F4C81] w-32 shrink-0 pt-2">
                Step 3:
              </span>
              <div className="flex-1 space-y-2">
                <span className="font-bold text-[#0F4C81] block pt-2">
                  Select Course
                </span>
                <div>
                  <select
                    className={selectInp}
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="Select">Select</option>
                    <option value="IIT JEE Main & Advanced">
                      IIT JEE Main & Advanced
                    </option>
                    <option value="NEET Medical Entrance">
                      NEET Medical Entrance
                    </option>
                    <option value="Foundation Science & Math">
                      Foundation Science & Math
                    </option>
                    <option value="Crash Course 2026">Crash Course 2026</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Select the FaceBook excel file */}
            <div className="flex items-start text-xs text-gray-700">
              <span className="font-bold text-[#0F4C81] w-32 shrink-0 pt-0.5">
                Step 4:
              </span>
              <div className="flex-1 space-y-2">
                <span className="font-bold text-[#0F4C81] block">
                  Select the FaceBook excel file
                </span>

                {/* File Upload Controls */}
                <div className="max-w-md pt-1">
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-white border border-gray-200 hover:border-[#0F4C81] hover:text-[#0F4C81] text-gray-700 font-medium text-xs rounded-lg cursor-pointer transition-all shadow-sm shrink-0 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      Choose File
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-500 truncate font-sans">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium text-xs hover:bg-gray-100 transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleImport}
              className="px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white font-semibold text-xs hover:bg-[#0c3d6a] transition-all shadow-sm flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ManageBranches;
