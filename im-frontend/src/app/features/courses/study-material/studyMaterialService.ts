import api from "../../../services/api";
import {
  StudyMaterialSearchDto,
  StudyMaterialDto,
  PagedResponse,
  SaveStudyMaterialFormData,
  StudyMaterialDetailDto,
} from "../study-material/studyMaterialTypes";

// export const getStudyMaterials = async (
//   params: StudyMaterialSearchDto,
// ): Promise<PagedResponse<StudyMaterialDto>> => {
//   const response = await api.get<PagedResponse<StudyMaterialDto>>(
//     "/StudyMaterial/study-materials",
//     { params },
//   );
//   return response.data;
// };
export const getStudyMaterials = async (payload: StudyMaterialSearchDto) => {
  const response = await api.get("/StudyMaterial/study-materials", {
    params: payload,
    showLoader: false,
  });
  return response.data;
};
export const getStudyMaterialById = async (
  id: string | number,
): Promise<any> => {
  // Option A: If baseURL in Axios instance lacks the /api prefix or requires absolute API route
  const response = await api.get(`/StudyMaterial/study-materials/${id}`);
  return response.data;
};
export const saveStudyMaterial = async (
  formData: SaveStudyMaterialFormData,
): Promise<{ success: boolean; message: string }> => {
  const data = new FormData();
  // console.log("formdata", formData.IsActive);
  data.append("StudymaterialId", (formData.StudymaterialId || 0).toString());
  data.append("BranchId", (formData.BranchId || 0).toString());
  data.append("CourseId", (formData.CourseId || 0).toString());
  data.append("CrclmId", (formData.CrclmId || 0).toString());
  data.append("SubjectId", (formData.SubjectId || 0).toString());
  data.append("TopicId", (formData.TopicId || 0).toString());
  data.append("Heading", formData.Heading ? formData.Heading.trim() : "");
  data.append("StudymaterialHtml", formData.StudymaterialHtml || "");
  data.append("IsActive", (formData.IsActive || 0).toString());
  data.append("AttachmentRemoved", String(formData.AttachmentRemoved ?? false));

  // Only append if file exists and is a valid File instance
  if (formData.Attachment && formData.Attachment instanceof File) {
    data.append("Attachment", formData.Attachment, formData.Attachment.name);
  }
  console.log("data :", data);
  // Pass multipart headers to prevent Axios from converting payload to JSON
  const response = await api.post("/StudyMaterial/save", data);
  return response.data;
};
export interface DropdownItemDto {
  value: number; // or string based on your DTO
  label: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  isSuccess: boolean;
}
// 1. Get Courses API Call
// export const getCoursesApi = async (
//   instituteId: number,
//   branchId: number,
// ): Promise<ApiResponse<DropdownItemDto[]>> => {
//   const response = await api.get(
//     `/Common/courses/${instituteId}/${branchId}`, // Adjust base path (e.g., /api/common) if controller has a route prefix
//   );
//   return response.data;
// };
export const getCoursesApi = async (instituteId: number, branchId: number) => {
  const response = await api.get(`/Common/courses/${instituteId}/${branchId}`, {
    // showLoader: true,
  });
  return response.data;
};

// 2. Get Subjects by Course API Call
// export const getSubjectsByCourseIdApi = async (
//   courseId: number,
// ): Promise<ApiResponse<DropdownItemDto[]>> => {
//   const response = await api.get(`/Common/subjects/${courseId}`);
//   return response.data;
// };

export const getSubjectsByCourseIdApi = async (courseId: number) => {
  const response = await api.get(`/Common/subjects/${courseId}`, {
    // showLoader: true,
  });
  return response.data;
};

export const getTopicsBySubjectIdApi = async (
  courseId: number,
  subjectId: number,
) => {
  const response = await api.get(`/Common/topics/${courseId}/${subjectId}`, {
    // showLoader: true,
  });
  return response.data;
};
export const deleteStudyMaterialApi = async (id: number): Promise<any> => {
  const response = await api.delete(
    `StudyMaterial/delete-study-material/${id}`,
  );
  return response.data;
};
export interface ExportStudyMaterialRequest {
  studyMaterialIds: number[];
  branchIds: number[];
}

export const exportStudyMaterial = async (
  payload: ExportStudyMaterialRequest,
) => {
  const response = await api.post(
    "/study-material/export-study-material",
    payload,
    {
      showLoader: true,
    },
  );

  return response.data;
};
export const addStudyMaterialsFromInstitute = async (payload: {
  curriculumId: number;
  courseId: number;
  subjectId: number;
  topicId: number;
  studyMaterialIds: number[];
  branchId: number;
}) => {
  const response = await api.post(
    "/StudyMaterial/add-study-materials-from-institute",
    payload,
  );

  return response.data;
};
