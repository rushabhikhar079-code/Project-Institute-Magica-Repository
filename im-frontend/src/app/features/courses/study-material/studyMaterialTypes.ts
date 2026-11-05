export interface StudyMaterialSearchDto {
  branchId: number;
  crclmId?: number | null;
  courseId?: number | null;
  subjectId?: number | null;
  topicId?: number | null;
  studyMaterialHeading?: string | null;
  status: number; // 2 = All, 1 = Active, 0 = Inactive
  pageNumber: number;
  pageSize: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}
export interface StudyMaterialDto {
  studymaterialId: number;
  instituteId: number;
  branchId: number;
  crclmId: number;
  courseId: number;
  subjectId: number;
  topicId: number;
  heading: string;
  isActive: number;
  courseName?: string;
  subjectName?: string;
  curriculumName: string;
  topicName?: string;
  activeStatus: string;
  attachmentOriginalName?: string;
}
export interface StudyMaterialOutletContext {
  instituteStudyMaterials: any[];

  instituteCurriculumOptions: any[];
  instituteCourseOptions: any[];
  instituteSubjectOptions: any[];
  instituteTopicOptions: any[];

  onInstituteCurriculumChange: (curriculumId: number) => void;
  onInstituteCourseChange: (courseId: number) => void;
  onInstituteSubjectChange: (subjectId: number) => void;
  onInstituteTopicChange: (topicId: number) => void;

  instituteCurrentTablePage: number;
  institutePageSize: number;
  instituteTotalCount: number;
  instituteTotalPages: number;
  instituteHasPrevious: boolean;
  instituteHasNext: boolean;

  onInstitutePageChange: (page: number) => void;
  onInstitutePageSizeChange: (size: number) => void;

  instituteSortBy: string;
  instituteSortDirection: "asc" | "desc";
  onInstituteSortChange: (
    sortKey: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => void;
}
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
export interface SaveStudyMaterialFormData {
  StudymaterialId: number; // 0 for Create, > 0 for Update
  BranchId: number;
  CrclmId: number;

  CourseId: number;
  SubjectId: number;
  TopicId: number;
  Heading: string;
  StudymaterialHtml?: string;
  IsActive: number;
  Attachment?: File | null;
  AttachmentRemoved?: boolean;
}
export interface StudyMaterialDetailDto extends StudyMaterialDto {
  studyMaterialHtml?: string;
  attachmentOriginalName?: string;
  attachmentStoredName?: string;
  attachmentPath?: string;
  attachmentExtension?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
}
