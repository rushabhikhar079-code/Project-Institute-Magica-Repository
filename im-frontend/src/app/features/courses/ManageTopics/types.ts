export interface Topic {
  topicID: number;
  subjectID: number;
  curriculumName: string;
  courseName: string;
  subName: string;
  topicSeqNum: number;
  topicName: string;
  topicDuration: string;
  isActive: number;
  refTopicID: number;
  modifiedDt?: string;
}

export interface TopicSearchRequest {
  pageNumber: number;
  pageSize: number;
  topicName: string;
  courseId: number;
  subjectId: number;
  status: number;
  branchId: number;
}

export interface TopicSearchData {
  items: Topic[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface TopicSearchResponse {
  status: string;
  statusCode: number;
  message: string;
  timeStamp: string;
  data: TopicSearchData;
}

/* ============================================================
   GET TOPIC BY ID
============================================================ */

export interface TopicDetails {
  refTopicID: number;
  courseId: number;
  subjectId: number;
  topicSeqNum: number;
  topicName: string;
  topicDurId: number;
  topicDuration: string;
  remark: string;
  isActive: number;
  isReflect: boolean;
  branchId: number;
}

export interface GetTopicByIdResponse {
  status: string;
  statusCode: number;
  message: string;
  timeStamp: string;
  data: TopicDetails;
}
export interface CreateTopicRequest {
  refTopicID: number;
  courseId: number;
  subjectId: number;
  topicSeqNum: number;
  topicName: string;
  topicDurId: number;
  topicDuration: string;
  remark: string;
  isActive: number;
  isReflect: boolean;
  branchId: number;
}
export interface InstituteTopics {
  topicId: number;
  subjectID: number;
  courseName: string;
  subName: string;
  curriculumName: string;
  topicSeqNum: number;
  topicName: string;
  topicDuration: string;
  isActive: number;
  refTopicID: number;
  modifiedDt?: string;
}
