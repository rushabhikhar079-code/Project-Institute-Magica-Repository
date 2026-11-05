import {
  UserRound,
  BookOpen,
  UsersRound,
  GraduationCap,
  FileText,
  Check,
} from "lucide-react";

interface EnquiryStepperProps {
  steps: string[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

const stepIcons = [UserRound, BookOpen, UsersRound, GraduationCap, FileText];

export default function EnquiryStepper({
  steps,
  currentStep,
  onStepChange,
}: EnquiryStepperProps) {
  return (
    <div className="w-full bg-white px-10 py-3">
      <div className="mx-auto flex max-w-4xl items-start">
        {steps.map((step, index) => {
          const Icon = stepIcons[index];

          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex flex-1 items-start">
              {/* Step */}
              <div className="flex min-w-[80px] flex-col items-center">
                {/* Clickable icon */}
                <button
                  type="button"
                  onClick={() => onStepChange(index)}
                  className="cursor-pointer rounded-full focus:outline-none"
                  aria-label={`Go to ${step.replace("\n", " ")}`}
                >
                  <div
                    className={`
      flex h-10 w-10 items-center justify-center rounded-full
      ${isActive ? "bg-[#dbe9f4]" : ""}
    `}
                  >
                    <div
                      className={`
        flex h-8 w-8 items-center justify-center rounded-full
        border
        ${
          isActive || isCompleted
            ? "border-[#0F4C81] bg-[#0F4C81] text-white"
            : "border-gray-200 bg-gray-100 text-gray-400"
        }
      `}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                      ) : (
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                      )}
                    </div>
                  </div>
                </button>

                {/* Clickable label too */}
                <button
                  type="button"
                  onClick={() => onStepChange(index)}
                  className={`
                    mt-1.5 max-w-[85px] cursor-pointer
                    whitespace-pre-line text-center
                    text-[11px] leading-[14px]
                    ${
                      isActive
                        ? "font-medium text-[#0F4C81]"
                        : isCompleted
                          ? "text-[#0F4C81]"
                          : "text-gray-300"
                    }
                  `}
                >
                  {step}
                </button>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`
                    mt-5 h-px flex-1
                    ${index < currentStep ? "bg-[#0F4C81]" : "bg-gray-200"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
