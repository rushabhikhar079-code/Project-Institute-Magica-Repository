import api from "../../../services/api";

import type { Topic, CreateTopicRequest } from "./types";

/* ============================================================
   MANAGE TOPIC
============================================================ */

export type TopicListResponse = {
  items: Topic[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

/* ============================================================
   GET TOPICS - BRANCH LEVEL
============================================================ */

export interface TopicSearchRequest {
  pageNumber: number;
  pageSize: number;
  topicName: string;
  crclmId: number;
  courseId: number;
  subjectId: number;
  status: number;
  branchId?: number;

  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export const getTopics = async (
  payload: TopicSearchRequest,
): Promise<TopicListResponse> => {
  const requestBody = {
    pageNumber: payload.pageNumber,
    pageSize: payload.pageSize,
    topicName: payload.topicName,
    crclmId: payload.crclmId,
    courseId: payload.courseId,
    subjectId: payload.subjectId,
    status: payload.status,
    branchId: payload.branchId,

    sortBy: payload.sortBy,
    sortDirection: payload.sortDirection,
  };

  console.log("TOPIC SEARCH REQUEST:", requestBody);

  const response = await api.post("/topic/topic-search", requestBody, {
    showLoader: false,
  });

  console.log("GET TOPIC RESPONSE:", response.data);

  return response.data.data;
};

/* ============================================================
   GET TOPIC BY ID
============================================================ */

export const getTopicById = async (topicId: number) => {
  const response = await api.get(`/topic/get-topic/${topicId}`);

  return response.data;
};

/* ============================================================
   CREATE TOPIC
============================================================ */

export const createTopic = async (payload: CreateTopicRequest) => {
  const response = await api.post("/topic/add-topic", payload, {
    showLoader: true,
  });

  return response.data;
};

/* ============================================================
   UPDATE TOPIC
============================================================ */

export const updateTopic = async (
  topicId: number,
  payload: CreateTopicRequest,
) => {
  const response = await api.put("/topic/update-topic", payload, {
    params: {
      topicId,
    },
    showLoader: true,
  });

  return response.data;
};
/* ============================================================
   DELETE TOPIC
============================================================ */

export const deleteTopic = async (
  topicId: number,
  deleteStatus: boolean = true,
) => {
  const response = await api.delete(`/topic/delete-topic/${topicId}`, {
    params: {
      deleteStatus,
    },
    showLoader: true,
  });

  return response.data;
};

export const importTopicsFromExcel = async (formData: FormData) => {
  const response = await api.post(
    "/Topic/import-topics-from-excel-file",
    formData,
    {
      showLoader: true,
    },
  );

  return response.data;
};
export interface GetInstituteTopicsRequest {
  courseId: number;
  crclmId: number;
  subjectId: number;
  branchId: number;
  pageNumber: number;
  pageSize: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export const getInstituteTopics = async (
  request: GetInstituteTopicsRequest,
) => {
  const response = await api.post("/Topic/institute-topics", request, {
    showLoader: false,
  });

  return response.data;
};
export interface AddTopicsFromInstituteRequest {
  topicIds: number[];
  branchId: number;
}

export const addTopicsFromInstitute = async (
  payload: AddTopicsFromInstituteRequest,
) => {
  const response = await api.post("/topic/add-institute-topics", payload, {
    showLoader: true,
  });

  return response.data;
};
export interface NextTopicSequenceResponse {
  status: string;
  statusCode: number;
  message: string;
  timeStamp: string;
  data: {
    nextSequence: number;
  };
}
export const getNextTopicSequence = async (
  subjectId: number,
): Promise<NextTopicSequenceResponse> => {
  const response = await api.get<NextTopicSequenceResponse>(
    `/Topic/get-next-topic-sequence?SubjectID=${subjectId}`,
  );

  return response.data;
};
export interface ExportTopicRequest {
  topicIds: number[];
  branchIds: number[];
}

export const exportTopic = async (payload: ExportTopicRequest) => {
  const response = await api.post("/topic/export-topic", payload, {
    showLoader: true,
  });

  return response.data;
};
export interface ExportTopicSearchRequest {
  pageNumber: number;
  pageSize: number;
  topicName: string;
  crclmIds: number[];
  courseIds: number[];
  subjectIds: number[];
  status: number;
  branchId: number;
  sortBy: string | null;
  sortDirection: string | null;
}
export const getExportTopics = async (
  request: ExportTopicSearchRequest,
): Promise<TopicListResponse> => {
  const response = await api.post(
    "/Topic/get-institute-topics-by-course-crclm-subject",
    request,
    {
      showLoader: false,
    },
  );

  console.log("GET EXPORT TOPICS RESPONSE:", response.data);

  return response.data.data;
};
