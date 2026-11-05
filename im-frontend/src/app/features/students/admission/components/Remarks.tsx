import type { ChangeEvent, ComponentType } from "react";
import { FileText } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Dropdown } from "../../../../components/common/Select";

type Props = {
  activeStep: number;
  inputClass: string;
  sectionClass: string;
  SectionHeading: ComponentType<any>;
  SOURCE_OPTIONS: { label: string; value: string }[];
};

export default function Remarks(props: Props) {
  const { register } = useFormContext<any>();
  const {
    activeStep,
    inputClass,
    sectionClass,
    SectionHeading,
    SOURCE_OPTIONS,
  } = props;

  return (
    <>
      {/* STEP 5 — REMARKS */}
      {activeStep === 4 && (
        <section className={sectionClass}>
          <SectionHeading icon={FileText}>Additional Remarks</SectionHeading>

          <div className="w-full space-y-5">
            {/* Dropdown and Notes / Comments in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Dropdown
                  name="source"
                  label="How did you hear about the institute?"
                  options={SOURCE_OPTIONS}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Notes / Comments
                </label>
                <textarea
                  {...register("comments")}
                  rows={4}
                  placeholder="Any additional notes about this student..."
                  className={inputClass}
                />
              </div>
            </div>

            {/* Remarks below */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <textarea
                {...register("remarks")}
                rows={4}
                placeholder="Enter remarks"
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
