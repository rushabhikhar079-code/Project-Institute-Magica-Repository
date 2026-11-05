import { useEffect, useState, type ComponentType } from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { BookOpen, Clock, ReceiptText } from "lucide-react";

import { RootState } from "../../../../redux/store";
import { Dropdown } from "../../../../components/common/Select";

import {
  CourseWithSubjects,
  getCoursesWithSubjects,
  getBatchesBySubjects,
  Batch,
} from "../../enquiry/enquiryService";
// import { getCurriculums } from "../../../../courses/ManageCurriculum/curriculumService";
import { getCurriculums } from "../../../courses/ManageCurriculum/curriculumService";
import { getCourses } from "../../../courses/ManageCourses/courseService";
import { MultiSelectDropdown } from "../../../../components/common/MultiSelectDropdown";
import { getOtherFees } from "../admissionService";
import { OtherFee } from "../types";

interface CurriculumOption {
  value: number;
  label: string;
}

interface CourseSearchItem {
  courseId: number;
  course_Name: string;
}

type AdmissionAcademicValues = {
  selectedCourses: number[];
  selectedSubjects: number[];
  batchIds: number[];
  selectedSubjectsPayload: string;
  regDate: string;
  otherFeesIds: number[];
};

type Props = {
  activeStep: number;
  sectionClass: string;
  SectionHeading: ComponentType<any>;
  FieldError: ComponentType<any>;
};

export default function Academic({ activeStep }: Props) {
  const {
    setValue,
    watch,
    register,
    formState: { errors },
  } = useFormContext<AdmissionAcademicValues>();
  const [courses, setCourses] = useState<CourseWithSubjects[]>([]);
  const regDate = watch("regDate");
  const [allCourses, setAllCourses] = useState<CourseWithSubjects[]>([]);
  const instituteId = useSelector((state: RootState) => state.auth.instituteId);
  const [curriculumCourses, setCurriculumCourses] = useState<
    CourseWithSubjects[]
  >([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);

  // const [selectedCurriculumId, setSelectedCurriculumId] = useState<number>(0);
  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<number[]>(
    [],
  );
  // const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState<
    Record<number, number[]>
  >({});

  const [courseLevelFees, setCourseLevelFees] = useState<
    Record<number, boolean>
  >({});

  const [subjectLevelFees, setSubjectLevelFees] = useState<
    Record<number, boolean>
  >({});
  // interface Batch {
  //   batchId: number;
  //   batchName: string;
  //   batchTiming?: string;
  //   availableSeats?: number;
  //   subjectId: number;
  //   courseId: number;
  // }

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<number[]>([]);
  const [showBatchTiming, setShowBatchTiming] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  const [courseSubjectSearch, setCourseSubjectSearch] = useState("");
  const [batchSearch, setBatchSearch] = useState("");
  const [otherFees, setOtherFees] = useState<OtherFee[]>([]);
  const [selectedOtherFees, setSelectedOtherFees] = useState<number[]>([]);
  const [otherFeesSearch, setOtherFeesSearch] = useState("");
  const [loadingOtherFees, setLoadingOtherFees] = useState(false);
  // ---------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------
  useEffect(() => {
    register("selectedCourses");
    register("selectedSubjects");
    register("otherFeesIds");
  }, [register]);
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [courseData, curriculumData] = await Promise.all([
          getCoursesWithSubjects(branchId),

          getCurriculums({
            curriculumName: "",
            status: 1,
            pageNumber: 1,
            pageSize: 1000,
            branchId,
            sortBy: null,
            sortDirection: null,
          }),
        ]);

        setAllCourses(courseData);
        setCurriculumCourses(courseData);
        setCourses(courseData);

        // Curriculum dropdown
        setCurriculums(
          curriculumData.items.map(
            (item: { CurriculumId: number; CurriculumName: string }) => ({
              value: item.CurriculumId,
              label: item.CurriculumName,
            }),
          ),
        );
      } catch (error) {
        console.error("Failed to fetch academic data:", error);
      }
    };

    fetchInitialData();
  }, [branchId]);

  // ---------------------------------------------------------
  // Curriculum change
  // ---------------------------------------------------------

  const handleCurriculumChange = async (
    values: (string | number | boolean)[],
  ) => {
    const curriculumIds = values.map(Number).filter(Boolean);

    setSelectedCurriculumIds(curriculumIds);

    // Curriculum changed → reset Course filter
    setSelectedCourseIds([]);

    // Clear course/subject selections because
    // the available course list has changed
    setSelectedCourseSubjects({});
    setCourseLevelFees({});
    setSubjectLevelFees({});

    // No curriculum selected → show all courses
    if (curriculumIds.length === 0) {
      setCurriculumCourses(allCourses);
      setCourses(allCourses);
      return;
    }

    try {
      const responses = await Promise.all(
        curriculumIds.map((curriculumId) =>
          getCourses({
            courseName: "",
            status: 1,
            pageNumber: 1,
            pageSize: 1000,
            branchId,
            curriculumId,
            sortBy: null,
            sortDirection: null,
          }),
        ),
      );

      const courseIds = new Set<number>();

      responses.forEach((response) => {
        response.items.forEach((item: CourseSearchItem) => {
          courseIds.add(item.courseId);
        });
      });

      const filteredCourses = allCourses.filter((course) =>
        courseIds.has(course.courseId),
      );

      setCurriculumCourses(filteredCourses);
      setCourses(filteredCourses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCurriculumCourses([]);
      setCourses([]);
    }
  };
  const handleCourseChange = (values: (string | number | boolean)[]) => {
    const courseIds = values.map(Number).filter(Boolean);

    // This is ONLY the filter selection
    setSelectedCourseIds(courseIds);

    // Do NOT clear actual checkbox selections here

    if (courseIds.length === 0) {
      setCourses(curriculumCourses);
      return;
    }

    const filteredCourses = curriculumCourses.filter((course) =>
      courseIds.includes(course.courseId),
    );

    setCourses(filteredCourses);
  };

  // ---------------------------------------------------------
  // Existing course selection logic - unchanged
  // ---------------------------------------------------------

  const toggleCourseSelection = (course: CourseWithSubjects) => {
    setSelectedCourseSubjects((prev) => {
      const updated = { ...prev };

      const isCurrentlySelected = updated[course.courseId] !== undefined;

      if (isCurrentlySelected) {
        // Unselect course + all subjects
        delete updated[course.courseId];
      } else {
        // Select course + all subjects
        updated[course.courseId] = course.subjects.map(
          (subject) => subject.subId,
        );
      }

      return updated;
    });
  };

  const toggleSubjectForCourse = (
    course: CourseWithSubjects,
    subjectId: number,
  ) => {
    // Course-level subjects cannot be independently changed
    if (course.isCourseLvl === 1) {
      return;
    }

    setSelectedCourseSubjects((prev) => {
      const currentSubjects = prev[course.courseId] || [];

      const updatedSubjects = currentSubjects.includes(subjectId)
        ? currentSubjects.filter((id) => id !== subjectId)
        : [...currentSubjects, subjectId];

      return {
        ...prev,
        [course.courseId]: updatedSubjects,
      };
    });
  };

  // ---------------------------------------------------------
  // Course / Subject Search
  // ---------------------------------------------------------

  const filteredCourses = courses.filter((course: CourseWithSubjects) => {
    const search = courseSubjectSearch.trim().toLowerCase();

    if (!search) return true;

    return (
      course.courseName.toLowerCase().includes(search) ||
      course.subjects.some((subject) =>
        subject.subName.toLowerCase().includes(search),
      )
    );
  });

  // ---------------------------------------------------------
  // Select All
  // ---------------------------------------------------------

  const allCoursesSelected =
    filteredCourses.length > 0 &&
    filteredCourses.every(
      (course: CourseWithSubjects) =>
        selectedCourseSubjects[course.courseId] !== undefined,
    );

  // ---------------------------------------------------------
  // Batch Search
  // ---------------------------------------------------------

  const filteredBatches = batches.filter((batch) => {
    const search = batchSearch.trim().toLowerCase();

    if (!search) return true;

    return batch.name.toLowerCase().includes(search);
  });
  const toggleSelectAllCourses = () => {
    if (allCoursesSelected) {
      setSelectedCourseSubjects({});
      setCourseLevelFees({});
      setSubjectLevelFees({});
      return;
    }

    const selected: Record<number, number[]> = {};

    courses.forEach((course) => {
      selected[course.courseId] = course.subjects.map(
        (subject) => subject.subId,
      );
    });

    setSelectedCourseSubjects(selected);
  };
  const getSelectedSubjectIds = () => {
    const subjectIds = Object.entries(selectedCourseSubjects).flatMap(
      ([courseId, selectedSubjects]) => {
        const course = allCourses.find(
          (item) => item.courseId === Number(courseId),
        );

        if (!course) {
          return [];
        }

        // Course selected:
        // use all subjects belonging to that course
        if (course.isCourseLvl === 1) {
          return course.subjects.map((subject) => subject.subId);
        }

        // Subject-level course:
        // use only selected subjects
        return selectedSubjects;
      },
    );

    return [...new Set(subjectIds)];
  };
  useEffect(() => {
    const subjectIds = getSelectedSubjectIds();

    if (subjectIds.length === 0) {
      setBatches([]);
      setSelectedBatches([]);
      return;
    }

    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);

        const response = await getBatchesBySubjects(
          instituteId,
          branchId,
          subjectIds,
        );

        setBatches(response);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
        setBatches([]);
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, [selectedCourseSubjects, allCourses, instituteId, branchId]);
  // Keep the Admission form values in sync with the selections.
  useEffect(() => {
    const selectedCourseIds = Object.keys(selectedCourseSubjects).map(Number);
    const selectedSubjectIds = getSelectedSubjectIds();

    setValue("selectedCourses", selectedCourseIds, {
      shouldDirty: true,
    });

    setValue("selectedSubjects", selectedSubjectIds, {
      shouldDirty: true,
    });
  }, [selectedCourseSubjects, allCourses, setValue]);

  useEffect(() => {
    setValue("batchIds", selectedBatches, { shouldDirty: true });
  }, [selectedBatches]);

  const toggleBatch = (batchId: number) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId],
    );
  };
  useEffect(() => {
    // Convert yyyy-MM-dd to dd-MM-yyyy
    const formatDate = (value: string) => {
      if (!value) return "";

      const [year, month, day] = value.split("-");

      if (!year || !month || !day) return value;

      return `${day}-${month}-${year}`;
    };

    const formattedDate = formatDate(regDate || "");

    const subjectRecords = Object.entries(selectedCourseSubjects).flatMap(
      ([courseId, selectedSubjectIds]) => {
        const course = allCourses.find(
          (item) => item.courseId === Number(courseId),
        );

        if (!course) return [];

        // Course-level selection includes all subjects in that course.
        const subjectIds =
          course.isCourseLvl === 1
            ? course.subjects.map((subject) => subject.subId)
            : selectedSubjectIds;

        return subjectIds.flatMap((subjectId) => {
          const subject = course.subjects.find(
            (item) => item.subId === subjectId,
          );

          if (!subject) return [];

          return [
            [
              subject.subId,
              subject.feesType,
              formattedDate,
              course.isCourseLvl,
              course.courseId,
            ].join("#"),
          ];
        });
      },
    );

    setValue("selectedSubjectsPayload", subjectRecords.join(","), {
      shouldDirty: true,
    });
  }, [selectedCourseSubjects, allCourses, regDate, setValue]);
  useEffect(() => {
    const fetchOtherFees = async () => {
      if (!instituteId || !branchId) {
        setOtherFees([]);
        return;
      }

      try {
        setLoadingOtherFees(true);

        const response = await getOtherFees(instituteId, branchId);

        setOtherFees(response);
      } catch (error) {
        console.error("Failed to fetch other fees:", error);

        setOtherFees([]);
      } finally {
        setLoadingOtherFees(false);
      }
    };

    fetchOtherFees();
  }, [instituteId, branchId]);
  const filteredOtherFees = otherFees.filter((fee) => {
    const search = otherFeesSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      fee.of_name.toLowerCase().includes(search) ||
      fee.of_FrequencyName.toLowerCase().includes(search)
    );
  });
  const toggleOtherFee = (feeId: number) => {
    setSelectedOtherFees((prev) => {
      const updated = prev.includes(feeId)
        ? prev.filter((id) => id !== feeId)
        : [...prev, feeId];

      setValue("otherFeesIds", updated, {
        shouldDirty: true,
      });

      return updated;
    });
  };
  const allOtherFeesSelected =
    filteredOtherFees.length > 0 &&
    filteredOtherFees.every((fee) => selectedOtherFees.includes(fee.of_code));
  const toggleSelectAllOtherFees = () => {
    if (allOtherFeesSelected) {
      const filteredIds = new Set(filteredOtherFees.map((fee) => fee.of_code));

      const updated = selectedOtherFees.filter((id) => !filteredIds.has(id));

      setSelectedOtherFees(updated);

      setValue("otherFeesIds", updated, {
        shouldDirty: true,
      });

      return;
    }

    const filteredIds = filteredOtherFees.map((fee) => fee.of_code);

    const updated = Array.from(new Set([...selectedOtherFees, ...filteredIds]));

    setSelectedOtherFees(updated);

    setValue("otherFeesIds", updated, {
      shouldDirty: true,
    });
  };
  if (activeStep !== 1) return null;

  return (
    <div className="space-y-5">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-[#0F4C81]" />
          </div>

          <h2 className="text-base font-semibold text-gray-800">
            Course & Subject
          </h2>
        </div>

        {/* NEW: Curriculum + Course filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* <Dropdown
            label="Curriculum"
            options={curriculums}
            value={selectedCurriculumId}
            onChange={handleCurriculumChange}
          /> */}
          <MultiSelectDropdown
            label="Curriculums"
            options={curriculums}
            value={selectedCurriculumIds}
            onChange={handleCurriculumChange}
          />
          {/* <Dropdown
            label="Course"
            options={curriculumCourses.map((course) => ({
              value: course.courseId,
              label: course.courseName,
            }))}
            value={selectedCourseId}
            onChange={handleCourseChange}
          /> */}
          <MultiSelectDropdown
            label="Courses"
            options={curriculumCourses.map((course) => ({
              value: course.courseId,
              label: course.courseName,
            }))}
            value={selectedCourseIds}
            onChange={handleCourseChange}
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Courses & Subjects
          </h2>

          <input
            type="text"
            value={courseSubjectSearch}
            onChange={(e) => setCourseSubjectSearch(e.target.value)}
            placeholder="Search course or subject..."
            className="w-56 h-9 px-3 text-xs border border-gray-300 rounded-lg
      focus:outline-none focus:ring-1 focus:ring-[#0F4C81]
      focus:border-[#0F4C81]"
          />
        </div>
        {/* Existing Select All logic */}
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#0F4C81]">
          <input
            type="checkbox"
            checked={allCoursesSelected}
            onChange={toggleSelectAllCourses}
            className="w-4 h-4 accent-[#0F4C81] rounded"
          />
          Select All
        </label>

        {/* Existing course/subject UI - unchanged */}
        <div className="max-h-[420px] overflow-y-auto pr-2 space-y-4 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
          {filteredCourses.map((course) => {
            const isCourseSelected =
              selectedCourseSubjects[course.courseId] !== undefined;

            const activeSubjects =
              selectedCourseSubjects[course.courseId] || [];

            return (
              <div
                key={course.courseId}
                className={`rounded-xl border-2 transition-all p-4 bg-white ${
                  isCourseSelected
                    ? "border-[#0F4C81] shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Course */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCourseSelected}
                      onChange={() => toggleCourseSelection(course)}
                      className="w-5 h-5 accent-[#0F4C81] rounded"
                    />

                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {course.courseName}
                      </p>

                      <p className="text-xs text-gray-400">
                        {course.isCourseLvl === 1
                          ? "Course Level"
                          : "Subject Level"}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Subjects */}
                {isCourseSelected && course.subjects.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 pl-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {course.subjects.map((subject) => {
                      const isSubSelected = activeSubjects.includes(
                        subject.subId,
                      );

                      const isSubjectLocked =
                        course.isCourseLvl === 1 ||
                        course.subjects.length === 1;

                      return (
                        <div
                          key={subject.subId}
                          className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
                            isSubSelected
                              ? "border-[#0F4C81]/40 bg-[#0F4C81]/5"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <label
                            className={`flex items-center gap-2 mb-2 ${
                              isSubjectLocked
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSubSelected}
                              disabled={isSubjectLocked}
                              onChange={() =>
                                toggleSubjectForCourse(course, subject.subId)
                              }
                              className="w-4 h-4 accent-[#0F4C81] rounded"
                            />

                            <span className="text-xs font-medium text-gray-800">
                              {subject.subName}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {errors.selectedCourses?.message && (
          <p className="mt-2 text-sm text-red-600">
            {errors.selectedCourses.message}
          </p>
        )}

        {errors.selectedSubjects?.message && (
          <p className="mt-1 text-sm text-red-600">
            {errors.selectedSubjects.message}
          </p>
        )}
      </section>
      {/* Batch Selection */}
      {Object.keys(selectedCourseSubjects).length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-[#0F4C81]" />
              </div>

              <h2 className="text-base font-semibold text-gray-800">Batches</h2>
            </div>

            <input
              type="text"
              value={batchSearch}
              onChange={(e) => setBatchSearch(e.target.value)}
              placeholder="Search batch..."
              className="w-56 h-9 px-3 text-xs border border-gray-300 rounded-lg
      focus:outline-none focus:ring-1 focus:ring-[#0F4C81]
      focus:border-[#0F4C81]"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowBatchTiming((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-semibold text-[#0F4C81] hover:underline"
          >
            <Clock className="w-3.5 h-3.5" />

            {showBatchTiming ? "Hide Batch Timing" : "Show Batch Timing"}
          </button>

          {loadingBatches ? (
            <div className="py-6 text-center text-xs text-gray-500">
              Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">
              No batches available.
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto pr-2 space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredBatches.map((batch) => {
                  const picked = selectedBatches.includes(batch.id);

                  return (
                    <label
                      key={batch.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        picked
                          ? "border-[#0F4C81] bg-white shadow-sm"
                          : "border-gray-200 bg-white hover:border-[#0F4C81]/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={picked}
                        onChange={() => toggleBatch(batch.id)}
                        className="w-4 h-4 mt-0.5 accent-[#0F4C81] rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">
                          {batch.name}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F4C81]/10 flex items-center justify-center">
              <ReceiptText className="w-5 h-5 text-[#0F4C81]" />
            </div>

            <h2 className="text-base font-semibold text-gray-800">
              Applicable Other Fees
            </h2>
          </div>

          <input
            type="text"
            value={otherFeesSearch}
            onChange={(e) => setOtherFeesSearch(e.target.value)}
            placeholder="Search other fees..."
            className="w-56 h-9 px-3 text-xs border border-gray-300 rounded-lg
        focus:outline-none focus:ring-1 focus:ring-[#0F4C81]
        focus:border-[#0F4C81]"
          />
        </div>
        {/* Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Scrollable body */}
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#0F4C81] text-white text-xs font-semibold">
                  <th className="w-12 px-3 py-2.5 text-center">
                    <input
                      type="checkbox"
                      checked={allOtherFeesSelected}
                      onChange={toggleSelectAllOtherFees}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>

                  <th className="px-3 py-2.5 text-left">Other Fees Name</th>

                  <th className="w-[25%] px-3 py-2.5 text-left">Frequency</th>

                  <th className="w-[18%] px-3 py-2.5 text-right">Fees</th>
                </tr>
              </thead>

              <tbody>
                {loadingOtherFees ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      Loading other fees...
                    </td>
                  </tr>
                ) : filteredOtherFees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      No other fees found.
                    </td>
                  </tr>
                ) : (
                  filteredOtherFees.map((fee, index) => {
                    const isSelected = selectedOtherFees.includes(fee.of_code);

                    return (
                      <tr
                        key={fee.of_code}
                        className={`
                  border-t border-gray-100
                  transition-colors
                  ${
                    isSelected
                      ? "bg-blue-50/60"
                      : index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50/40"
                  }
                  hover:bg-blue-50
                `}
                      >
                        {/* Checkbox */}
                        <td className="w-12 px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOtherFee(fee.of_code)}
                            className="w-4 h-4 cursor-pointer accent-[#0F4C81]"
                          />
                        </td>

                        {/* Name */}
                        <td className="px-3 py-2.5 font-medium text-gray-700">
                          {fee.of_name}
                        </td>

                        {/* Frequency */}
                        <td className="px-3 py-2.5">
                          <span
                            className="
                      inline-flex
                      items-center
                      rounded-full
                      bg-blue-50
                      px-2.5
                      py-1
                      text-[11px]
                      font-medium
                      text-[#0F4C81]
                    "
                          >
                            {fee.of_FrequencyName}
                          </span>
                        </td>

                        {/* Fees */}
                        <td className="px-3 py-2.5 text-right font-semibold text-gray-800">
                          ₹
                          {Number(fee.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
