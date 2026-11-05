import type { ReactNode } from "react";

export interface StepItem {
  title: ReactNode;
  description?: string;
  content?: ReactNode;
}

interface StepsSectionProps {
  steps: StepItem[];
}

const StepsSection = ({ steps }: StepsSectionProps) => {
  return (
    <div className="w-full">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`flex gap-5 px-10 py-7 ${
            index !== steps.length - 1
              ? "border-b border-dashed border-gray-200"
              : ""
          }`}
        >
          {/* Step Number */}
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F4C81] text-sm font-semibold text-white">
              {index + 1}
            </div>
          </div>

          {/* Step */}
          <div className="flex-1">
            <div className="grid grid-cols-[1fr_1.2fr] items-center gap-10">
              {/* Step Information */}
              <div>
                <h3 className="text-base font-semibold text-[#111827]">
                  {step.title}
                </h3>

                {step.description && (
                  <p className="mt-2 text-sm text-[#64748B]">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Step Content */}
              <div>{step.content}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepsSection;
