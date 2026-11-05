import type { ChangeEvent, ComponentType } from "react";
import { BriefcaseBusiness, UserRound } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { TextBox } from "../../../../components/common/TextBox";
import { Dropdown } from "../../../../components/common/Select";

type Props = {
  activeStep: number;
  sectionClass: string;
  SectionHeading: ComponentType<any>;
  FieldGroup: ComponentType<any>;
  FieldError: ComponentType<any>;
};

export default function FamilyWork(props: Props) {
  const {
    watch,
    formState: { errors },
  } = useFormContext<any>();
  const { activeStep, sectionClass, SectionHeading, FieldGroup, FieldError } =
    props;
  const workStatus = watch("workStatus");

  return (
    <>
      {/* STEP 3 — FAMILY & WORK */}
      {activeStep === 2 && (
        <>
          <section className={sectionClass}>
            <SectionHeading icon={UserRound}>Family Details</SectionHeading>

            <FieldGroup title="Father / Guardian">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <TextBox
                    name="fatherFirstName"
                    label="First Name"
                    placeholder="First name"
                    required={false}
                  />
                  {/* <FieldError
                    message={
                      errors.fatherFirstName?.message as string | undefined
                    }
                  /> */}
                </div>

                <TextBox
                  name="fatherMiddleName"
                  label="Middle Name"
                  placeholder="Middle name"
                  required={false}
                />

                <TextBox
                  name="fatherLastName"
                  label="Last Name"
                  placeholder="Last name"
                  required={false}
                />

                <TextBox
                  name="mobile1"
                  label="Contact Number"
                  placeholder="10-digit mobile number"
                  required={false}
                  allowOnly="numeric"
                  maxLength={10}
                />
              </div>
            </FieldGroup>

            <FieldGroup title="Mother">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <TextBox
                    name="motherFirstName"
                    label="First Name"
                    placeholder="First name"
                    required={false}
                  />
                  {/* <FieldError
                    message={
                      errors.motherFirstName?.message as string | undefined
                    }
                  /> */}
                </div>

                <TextBox
                  name="motherMiddleName"
                  label="Middle Name"
                  placeholder="Middle name"
                  required={false}
                />

                <TextBox
                  name="motherLastName"
                  label="Last Name"
                  placeholder="Last name"
                  required={false}
                />
                <TextBox
                  name="mobile2"
                  label="Contact Number"
                  placeholder="10-digit mobile number"
                  required={false}
                  allowOnly="numeric"
                  maxLength={10}
                />
              </div>
            </FieldGroup>

            <FieldGroup title="Parent's Employer Details">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextBox
                  name="parentCompanyName"
                  label="Parent Company Name"
                  placeholder="Parent company / employer"
                  required={false}
                />

                <TextBox
                  name="parentGSTNo"
                  label="GST Number"
                  placeholder="GST number"
                  required={false}
                />
              </div>
            </FieldGroup>
          </section>

          <section className={sectionClass}>
            <SectionHeading icon={BriefcaseBusiness}>
              Working Details
            </SectionHeading>

            <div className="max-w-md">
              <Dropdown
                name="workStatus"
                label="Currently Working?"
                options={[
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ]}
              />
            </div>

            {workStatus === "Yes" && (
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextBox
                  name="occupation"
                  label="Occupation"
                  placeholder="Occupation"
                  required={false}
                />
                <TextBox
                  name="organization"
                  label="Organization"
                  placeholder="Organization"
                  required={false}
                />
                <TextBox
                  name="salary"
                  label="Salary"
                  placeholder="Salary"
                  required={false}
                  allowOnly="numeric"
                />
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
