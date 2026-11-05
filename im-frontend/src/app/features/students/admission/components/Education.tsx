import type { ChangeEvent, ComponentType } from "react";
import { GraduationCap } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "../../../../components/common/Button";

type Props = {
  activeStep: number;
  inputClass: string;
  sectionClass: string;
  SectionHeading: ComponentType<any>;
  addEducation: () => void;
  removeEducation: (index: number) => void;
};

export default function Education(props: Props) {
  const { register, watch } = useFormContext<any>();
  const {
    activeStep,
    inputClass,
    sectionClass,
    SectionHeading,
    addEducation,
    removeEducation,
  } = props;
  const education = watch("education") ?? [];

  return (
    <>
      {/* STEP 4 — EDUCATION */}
      {activeStep === 3 && (
        <section className={sectionClass}>
          <SectionHeading icon={GraduationCap}>
            Educational Qualifications
          </SectionHeading>

          <div className="space-y-4">
            {education.map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    {index === 0
                      ? "Primary Qualification"
                      : `Additional Qualification ${index}`}
                  </h3>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Class / Year / Degree
                    </label>
                    <input
                      {...register(`education.${index}.qualification`)}
                      placeholder="e.g. Class 12 / B.Sc."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      School / College
                    </label>
                    <input
                      {...register(`education.${index}.school`)}
                      placeholder="Institution name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Stream
                    </label>
                    <input
                      {...register(`education.${index}.stream`)}
                      placeholder="e.g. Science / Commerce"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Percentage / CGPA
                      </label>
                      <input
                        {...register(`education.${index}.percentage`)}
                        placeholder="e.g. 85%"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Year
                      </label>
                      <input
                        {...register(`education.${index}.year`)}
                        placeholder="Year"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button
              type="button"
              preset="add"
              variant="outline"
              onClick={addEducation}
            >
              Add Another Qualification
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
