import { Landmark, Plus } from "lucide-react";

import SearchFilter from "../../../../components/common/SearchFilter/SearchFilter";
import DataTable from "../../../../components/common/DataTable/Datatable";
import Pagination from "../../../../components/common/DataTable/TablePagination";

import { getTopicColumns } from "../columns";
import type { Topic } from "../types";
import { getFields } from "../constants";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { useEffect, useState } from "react";
import { getCurriculums } from "../../ManageCurriculum/curriculumService";
import { useAppSelector } from "../../../../redux/hooks";

type Props = {
  topics: Topic[];

  searchValue: string;
  filterValues: Record<string, any>;

  openAdd: () => void;
  openImport: () => void;
  openInstituteTopics: () => void;
  openexpToBranch: () => void;
  onEdit: (topic: Topic) => void;
  onDelete: (id: number) => void;

  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;

  setCurrentPage: (page: string) => void;
  setSelectedTopic: (topic: string) => void;

  currentTablePage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;

  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  courseOptions: {
    label: string;
    value: string | number;
  }[];

  subjectOptions: {
    label: string;
    value: string | number;
  }[];
  curriculumOptions: {
    label: string;
    value: string | number;
  }[];
  onValueChange: (key: string, value: any) => void;
  sortBy: string | null;
  sortDirection: "asc" | "desc" | null;

  onSortChange: (
    sortBy: string | null,
    sortDirection: "asc" | "desc" | null,
  ) => void;
};

const TopicList = ({
  topics,
  searchValue,
  filterValues,

  courseOptions,
  subjectOptions,
  curriculumOptions,
  onValueChange,

  openAdd,
  openImport,
  openInstituteTopics,
  openexpToBranch,

  onEdit,
  onDelete,
  onSearchChange,
  onSearch,
  onClear,
  setCurrentPage,
  setSelectedTopic,
  currentTablePage,
  pageSize,
  totalCount,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDirection,
  onSortChange,
}: Props) => {
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  const columns = getTopicColumns({
    onEdit,
    onDelete,
  });

  return (
    <div>
      <SearchFilter
        searchValue={searchValue}
        searchPlaceholder="Search topics by name..."
        onSearchChange={onSearchChange}
        fields={getFields(curriculumOptions, courseOptions, subjectOptions)}
        values={filterValues}
        onValueChange={onValueChange}
        onSearch={onSearch}
        onClear={onClear}
      />
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Topic</span>
          </button>
          <button
            onClick={openImport}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Import Topics Data from Excel</span>
          </button>
          {branchId !== 0 && (
            <button
              onClick={openInstituteTopics}
              className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Import Topics From Institute</span>
            </button>
          )}
          {branchId == 0 && (
            <button
              onClick={openexpToBranch}
              className="flex items-center justify-center gap-1.5 px-3 py-2 border border-[#0F4C81] text-[#0F4C81] rounded-lg hover:bg-[#0F4C81] hover:text-white transition-colors text-xs font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Export Topics to Branches</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={topics}
            rowKey="topicID"
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            onRowClick={(topic) => {
              setSelectedTopic(topic.topicName);
              setCurrentPage("manageTopics");
            }}
            emptyMessage="No topics found."
          />

          {totalCount > 0 && (
            <Pagination
              currentPage={currentTablePage}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </div>
        {branchId !== 0 && (
          <div className="flex items-center gap-2 pl-4">
            <div className="w-6 h-6 rounded-full bg-[#e0eef5] flex items-center justify-center flex-shrink-0">
              <Landmark className="w-3.5 h-3.5 text-[#0F4C81]" />
            </div>

            <span className="text-sm text-gray-600">
              - Topics imported from institute.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicList;
