import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Dropdown } from "../../../../../components/common/Select";
import type { EnquiryFormData } from "../../addEnquiryTypes";
import { getSources } from "../../enquiryService";

interface SourceOption {
  label: string;
  value: string;
}

export default function Remarks() {
  const { register } = useFormContext<EnquiryFormData>();

  const [sourceOptions, setSourceOptions] = useState<SourceOption[]>([]);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const sources = await getSources();

        const options = sources.map((source) => ({
          label: source.name,
          value: String(source.id),
        }));

        setSourceOptions(options);
      } catch (error) {
        console.error("Failed to fetch sources:", error);
        setSourceOptions([]);
      }
    };

    fetchSources();
  }, []);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-[#0F4C81]" />
        </div>

        <h2 className="text-base font-semibold text-gray-800">Remarks</h2>
      </div>

      <div className="max-w-lg space-y-4">
        <Dropdown
          name="Source"
          label="How did you hear about the institute?"
          options={sourceOptions}
          required={false}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Comments
          </label>

          <textarea
            {...register("Comments")}
            placeholder="Any additional notes/comments…"
            rows={5}
            className="w-full px-3 py-2.5 border border-[#d1d5dc] rounded-[10px] text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all resize-none"
          />
        </div>
      </div>
    </section>
  );
}
