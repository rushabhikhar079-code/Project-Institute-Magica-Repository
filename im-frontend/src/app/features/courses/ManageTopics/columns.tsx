import { Edit, Landmark, Trash2 } from "lucide-react";
import { TableColumn } from "../../../components/common/DataTable";
import type { InstituteTopics, Topic } from "./types";

type TopicColumnProps = {
  onEdit: (topic: Topic) => void;
  onDelete: (id: number) => void;
};

export const getTopicColumns = ({
  onEdit,
  onDelete,
}: TopicColumnProps): TableColumn<Topic>[] => [
  {
    key: "actions",
    header: "Actions",
    align: "center",
    width: "120px",
    render: (topic) => (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(topic);
          }}
          className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
          title="Edit Topic"
        >
          <Edit className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(topic.topicID);
          }}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Topic"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    ),
  },
  {
    key: "curriculum_Name",
    header: "Curriculum Name",
    render: (topic) => <p>{topic.curriculumName || "-"}</p>,
  },
  {
    key: "courseName",
    header: "Course Name",
    render: (topic) => <span>{topic.courseName || "-"}</span>,
  },

  {
    key: "subName",
    header: "Subject Name",
    render: (topic) => <span>{topic.subName || "-"} </span>,
  },

  {
    key: "topicSeqNum",
    header: "Topic Sequence No.",

    render: (topic) => <span>{topic.topicSeqNum ?? "-"}</span>,
  },

  {
    key: "topicName",
    header: "Topic Name",
    sortable: true,
    sortKey: "TopicName",
    render: (topic) => (
      <span className="flex items-center gap-2">
        <span>{topic.topicName || "-"}</span>

        {topic.refTopicID != 0 && (
          <span className="w-5 h-5 rounded-full bg-[#e0eef5] flex items-center justify-center">
            <Landmark className="w-3.5 h-3.5 text-[#0F4C81]" />
          </span>
        )}
      </span>
    ),
  },

  {
    key: "topicDuration",
    header: "Duration",
    render: (topic) => <span>{topic.topicDuration || "-"}</span>,
  },

  {
    key: "isActive",
    header: "Status",
    align: "center",
    render: (topic) => (
      <span
        className={`inline-flex px-3 py-1 text-xs rounded-full ${
          topic.isActive === 1
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {topic.isActive === 1 ? "Active" : "Inactive"}
      </span>
    ),
  },
];
type InstituteTopicColumnProps = {
  selectedTopicIds: number[];
  topics: InstituteTopics[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getInstituteTopicColumns = ({
  selectedTopicIds,
  topics,
  onSelect,
  onSelectAll,
}: InstituteTopicColumnProps): TableColumn<InstituteTopics>[] => {
  const topicIds = topics.map((topic) => Number(topic.topicId));

  const allSelected =
    topicIds.length > 0 &&
    topicIds.every((id) => selectedTopicIds.includes(id));

  return [
    {
      key: "select",
      header: (
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="h-4 w-4 cursor-pointer accent-[#0F4C81]"
          />

          <span>Select All</span>
        </div>
      ),
      align: "center",
      width: "120px",
      render: (topic) => {
        const topicId = Number(topic.topicId);

        console.log("ROW:", topic.topicName, "ID:", topicId);

        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedTopicIds.includes(topicId)}
              onChange={() => onSelect(topicId)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 cursor-pointer accent-[#0F4C81]"
            />
          </div>
        );
      },
    },

    {
      key: "courseName",
      header: "Course Name",
      render: (topic) => <span>{topic.courseName || "-"}</span>,
    },

    {
      key: "subName",
      header: "Subject Name",
      render: (topic) => <span>{topic.subName || "-"}</span>,
    },

    {
      key: "topicName",
      header: "Topic Name",
      sortable: true,
      sortKey: "TopicName",
      render: (topic) => <span>{topic.topicName || "-"}</span>,
    },

    {
      key: "topicDuration",
      header: "Duration",
      render: (topic) => <span>{topic.topicDuration || "-"}</span>,
    },
  ];
};
type ExportTopicColumnProps = {
  selectedTopicIds: number[];
  topics: Topic[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getExportTopicColumns = ({
  selectedTopicIds,
  topics,
  onSelect,
  onSelectAll,
}: ExportTopicColumnProps): TableColumn<Topic>[] => [
  {
    key: "select",
    header: (() => {
      const allSelected =
        topics.length > 0 &&
        topics.every((topic) => selectedTopicIds.includes(topic.topicID));

      return (
        <div className="flex items-center justify-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="w-4 h-4 accent-[#0F4C81] cursor-pointer"
          />
          <span>Select All</span>
        </div>
      );
    })(),
    align: "center",
    width: "120px",
    render: (topic) => (
      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={selectedTopicIds.includes(topic.topicID)}
          onChange={() => onSelect(topic.topicID)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 accent-[#0F4C81] cursor-pointer"
        />
      </div>
    ),
  },

  {
    key: "curriculum_Name",
    header: "Curriculum Name",
    render: (topic) => <p>{topic.curriculumName || "-"}</p>,
  },

  {
    key: "courseName",
    header: "Course Name",
    render: (topic) => <span>{topic.courseName || "-"}</span>,
  },

  {
    key: "subName",
    header: "Subject Name",
    render: (topic) => <span>{topic.subName || "-"}</span>,
  },

  {
    key: "topicSeqNum",
    header: "Topic Sequence No.",
    render: (topic) => <span>{topic.topicSeqNum ?? "-"}</span>,
  },

  {
    key: "topicName",
    header: "Topic Name",
    sortable: true,
    sortKey: "TopicName",
    render: (topic) => (
      <span className="flex items-center gap-2">
        <span>{topic.topicName || "-"}</span>
      </span>
    ),
  },

  {
    key: "topicDuration",
    header: "Duration",
    render: (topic) => <span>{topic.topicDuration || "-"}</span>,
  },
];
