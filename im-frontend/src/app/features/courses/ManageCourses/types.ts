export type CourseList = {
  courseId: number;
  crclmId: number; // ADD THIS
  curriculum_Name: string;
  course_Name: string;
  description: string;
  duration: string;
  status: string;
  refCourseId: number;
  branchId: number;
  curriculumName: string;
  courseFees: number;
  cTaxable: boolean;
  cIncluding_Tax: boolean;
  taxType: string;
  courseType: string;
  hsncode: string;
  isImported: boolean;
};

export type CourseListResponse = {
  items: CourseList[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

export interface CreateCourseRequest {
  courseId?: number;
  courseName: string;
  description: string;
  duration: number;
  durationType: number;
  crclmId: number;
  isCourseLvl: boolean;
  courseFee: number;
  taxable: boolean;
  includingTax: boolean;
  allowInstallment: boolean;
  maxInstallment: number;
  type: string;
  hsncode: string;
  adhocCourse: number;
  courseFeeWise: number;
  paymentTemplateId: number;
  isCreateTemplate: boolean;
  templateStatus: boolean;
  templateType: number;
  noofDays: number;
  templateDetails: string[];
  trainerIds: number[];
  branchId: number;
  status: number;
}

export interface UpdateCourseRequest {
  curriculumId: number;
  curriculumName: string;
  description: string;
}
export type InstituteCourses = {
  courseId: number;
  course_Name: string;
  curriculum_Name: string;
  courseDesc: string;
  duration: number;
  refCourseId: number;
  isImported: boolean;
};

export type InstituteCourseResponse = {
  items: InstituteCourses[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export interface InstituteSubjectApi {
  subId: number;
  sub_Name: string;
  course_Name: string;
  durationFull: string;
  actualFees: number;
  subjectType: string;
  branchName: string;
  curriculum_Name: string;
}

export interface InstituteSubjectResponse {
  items: InstituteSubjectApi[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
