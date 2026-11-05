import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BookOpen, Clock } from "lucide-react";

import { RootState } from "../../../../../redux/store";
import { Dropdown } from "../../../../../components/common/Select";

import {
  Batch,
  CourseWithSubjects,
  getBatchesBySubjects,
  getCoursesWithSubjects,
} from "../../enquiryService";
import { getCurriculums } from "../../../../courses/ManageCurriculum/curriculumService";
import { getCourses } from "../../../../courses/ManageCourses/courseService";
import { useFormContext } from "react-hook-form";
import { EnquiryFormData } from "../../validations/enquirySchema";
import { MultiSelectDropdown } from "../../../../../components/common/MultiSelectDropdown";

interface CurriculumOption {
  value: number;
  label: string;
}

interface CourseSearchItem {
  courseId: number;
  course_Name: string;
}

export default function Academic() {
  const [courses, setCourses] = useState<CourseWithSubjects[]>([]);

  const [allCourses, setAllCourses] = useState<CourseWithSubjects[]>([]);

  const [curriculumCourses, setCurriculumCourses] = useState<
    CourseWithSubjects[]
  >([]);
  const [curriculums, setCurriculums] = useState<CurriculumOption[]>([]);
  const [selectedCurriculumIds, setSelectedCurriculumIds] = useState<number[]>(
    [],
  );

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

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<number[]>([]);
  const [showBatchTiming, setShowBatchTiming] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const branchId = useSelector((state: RootState) => state.branch.branchId);

  const instituteId = useSelector((state: RootState) => state.auth.instituteId);
  const { setValue, getValues, watch } = useFormContext<EnquiryFormData>();
  const enquiryDate = watch("EnquiryDate");
  const [courseSubjectSearch, setCourseSubjectSearch] = useState("");
  const [batchSearch, setBatchSearch] = useState("");
  // ---------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------
  useEffect(() => {
    const savedCourseSubjects = getValues("selectedCourseSubjects");
    const savedBatchIds = getValues("selectedBatchIds");

    if (savedCourseSubjects) {
      const restored: Record<number, number[]> = {};

      Object.entries(savedCourseSubjects).forEach(([courseId, subjectIds]) => {
        restored[Number(courseId)] = subjectIds;
      });

      setSelectedCourseSubjects(restored);
    }

    if (savedBatchIds) {
      setSelectedBatches(savedBatchIds);
    }
  }, [getValues]);
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

    // Curriculum filter changed → reset only Course filter
    setSelectedCourseIds([]);

    // IMPORTANT:
    // Do NOT clear selectedCourseSubjects
    // Do NOT clear courseLevelFees
    // Do NOT clear subjectLevelFees

    // No curriculum selected
    // → show all courses
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

      // Combine course IDs from all selected curricula
      const courseIds = new Set<number>();

      responses.forEach((response) => {
        response.items.forEach((item: CourseSearchItem) => {
          courseIds.add(item.courseId);
        });
      });

      // Filter from already-loaded course data
      const filteredCourses = allCourses.filter((course) =>
        courseIds.has(course.courseId),
      );

      setCurriculumCourses(filteredCourses);

      // If courses were previously selected through the Course filter,
      // keep only those that belong to the newly filtered curriculum list.
      setSelectedCourseIds((previousCourseIds) => {
        const validCourseIds = previousCourseIds.filter((courseId) =>
          filteredCourses.some((course) => course.courseId === courseId),
        );

        const filteredSelectedCourses = filteredCourses.filter((course) =>
          validCourseIds.includes(course.courseId),
        );

        setCourses(
          validCourseIds.length > 0 ? filteredSelectedCourses : filteredCourses,
        );

        return validCourseIds;
      });
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCurriculumCourses([]);
      setCourses([]);
    }
  };

  const handleCourseChange = (values: (string | number | boolean)[]) => {
    const courseIds = values.map(Number).filter(Boolean);

    setSelectedCourseIds(courseIds);

    // IMPORTANT:
    // Do NOT clear selectedCourseSubjects
    // Do NOT clear courseLevelFees
    // Do NOT clear subjectLevelFees

    // No course filter selected
    // → show all courses under the selected curriculum(s)
    if (courseIds.length === 0) {
      setCourses(curriculumCourses);
      return;
    }

    // Show only selected courses
    const selectedCourses = curriculumCourses.filter((course) =>
      courseIds.includes(course.courseId),
    );

    setCourses(selectedCourses);
  };
  // ---------------------------------------------------------
  // Existing course selection logic - unchanged
  // ---------------------------------------------------------
  const toggleCourseSelection = (course: CourseWithSubjects) => {
    setSelectedCourseSubjects((prev) => {
      const updated = { ...prev };

      const isCurrentlySelected = updated[course.courseId] !== undefined;

      if (isCurrentlySelected) {
        delete updated[course.courseId];
      } else {
        updated[course.courseId] = course.subjects.map(
          (subject) => subject.subId,
        );
      }

      setValue("selectedCourseSubjects", updated, {
        shouldDirty: true,
      });

      return updated;
    });
  };

  const toggleSubjectForCourse = (
    course: CourseWithSubjects,
    subjectId: number,
  ) => {
    if (course.isCourseLvl === 1 || course.subjects.length === 1) {
      return;
    }

    setSelectedCourseSubjects((prev) => {
      const currentSubjects = prev[course.courseId] || [];

      const updatedSubjects = currentSubjects.includes(subjectId)
        ? currentSubjects.filter((id) => id !== subjectId)
        : [...currentSubjects, subjectId];

      const updated = {
        ...prev,
        [course.courseId]: updatedSubjects,
      };

      setValue("selectedCourseSubjects", updated, {
        shouldDirty: true,
      });

      return updated;
    });
  };

  const toggleSelectAllCourses = () => {
    if (allCoursesSelected) {
      setSelectedCourseSubjects((prev) => {
        const updated = { ...prev };

        filteredCourses.forEach((course) => {
          delete updated[course.courseId];
        });

        setValue("selectedCourseSubjects", updated, {
          shouldDirty: true,
        });

        return updated;
      });

      return;
    }

    setSelectedCourseSubjects((prev) => {
      const updated = { ...prev };

      filteredCourses.forEach((course) => {
        updated[course.courseId] = course.subjects.map(
          (subject) => subject.subId,
        );
      });

      setValue("selectedCourseSubjects", updated, {
        shouldDirty: true,
      });

      return updated;
    });
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
        if (course.isCourseLvl === 1 || course.subjects.length === 1) {
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
      return;
    }

    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);

        console.log("Fetching batches for subject IDs:", subjectIds);

        const response = await getBatchesBySubjects(
          instituteId,
          branchId,
          subjectIds,
        );

        console.log("Batches API response:", response);

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
  const toggleBatch = (batchId: number) => {
    setSelectedBatches((prev) => {
      const updated = prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId];

      setValue("selectedBatchIds", updated, {
        shouldDirty: true,
      });

      return updated;
    });
  };
  const getSelectedCoursePayload = () => {
    return Object.keys(selectedCourseSubjects).map(Number).join(",");
  };
  const getSelectedSubjectPayload = () => {
    if (!enquiryDate) {
      return "";
    }

    const [year, month, day] = enquiryDate.split("-");
    const formattedDate = `${day}-${month}-${year}`;

    const selectedSubjects: string[] = [];

    Object.entries(selectedCourseSubjects).forEach(
      ([courseIdString, selectedSubjectIds]) => {
        const courseId = Number(courseIdString);

        const course = allCourses.find((item) => item.courseId === courseId);

        if (!course) return;

        course.subjects.forEach((subject) => {
          const isSelected =
            course.isCourseLvl === 1
              ? true
              : selectedSubjectIds.includes(subject.subId);

          if (!isSelected) return;

          selectedSubjects.push(
            `${subject.subId}#${subject.feesType}#${formattedDate}#1#${courseId}`,
          );
        });
      },
    );

    return selectedSubjects.join(",");
  };
  useEffect(() => {
    const selectedSubjects = getSelectedSubjectPayload();

    setValue("selectedSubjects", selectedSubjects, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [selectedCourseSubjects, allCourses, enquiryDate, setValue]);
  useEffect(() => {
    setValue("batchIds", selectedBatches, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [selectedBatches, setValue]);

  useEffect(() => {
    const selectedCourses = getSelectedCoursePayload();

    setValue("selectedCourses", selectedCourses, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [selectedCourseSubjects, setValue]);
  console.log("Academic mapping:", {
    selectedCourses: getSelectedCoursePayload(),
    selectedSubjects: getSelectedSubjectPayload(),
    batchIds: selectedBatches,
  });
  const filteredCourses = courses.filter((course) => {
    const search = courseSubjectSearch.trim().toLowerCase();

    if (!search) return true;

    return (
      course.courseName.toLowerCase().includes(search) ||
      course.subjects.some((subject) =>
        subject.subName.toLowerCase().includes(search),
      )
    );
  });
  const allCoursesSelected =
    filteredCourses.length > 0 &&
    filteredCourses.every(
      (course) => selectedCourseSubjects[course.courseId] !== undefined,
    );
  const filteredBatches = batches.filter((batch) => {
    const search = batchSearch.trim().toLowerCase();

    if (!search) return true;

    return batch.name.toLowerCase().includes(search);
  });
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
          <MultiSelectDropdown
            label="Curriculums"
            options={curriculums}
            value={selectedCurriculumIds}
            onChange={handleCurriculumChange}
          />

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
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <label className="text-sm font-medium text-gray-700">
            Courses & Subjects
          </label>

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
      </section>
      {/* Batch Selection */}
      {Object.keys(selectedCourseSubjects).length > 0 && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-[#0F4C81]" />
              </div>

              <h2 className="text-base font-semibold text-gray-800">Batches</h2>
            </div>

            <button
              type="button"
              onClick={() => setShowBatchTiming((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-semibold text-[#0F4C81] hover:underline"
            >
              <Clock className="w-3.5 h-3.5" />
              {showBatchTiming ? "Hide Batch Timing" : "Show Batch Timing"}
            </button>
          </div>

          {loadingBatches ? (
            <div className="py-6 text-center text-xs text-gray-500">
              Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">
              No batches available.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Batches
                </label>

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
            </div>
          )}
        </section>
      )}
    </div>
  );
}
