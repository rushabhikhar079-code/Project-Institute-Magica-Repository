import {
  Building2,
  ChartNetwork,
  Edit,
  Network,
  School,
  Trash2,
} from "lucide-react";
import { TableColumn } from "../../components/common/DataTable";
import type { BranchList } from "../branches/branchTypes";
import { Icon } from "@iconify/react";

<Icon icon="flowbite:school-flag-alt-outline" width={32} height={32} />;
type ColumnProps = {
  selectedBranchIds: number[];
  branches: BranchList[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
};

export const getBranchColumns = ({
  selectedBranchIds,
  branches,
  onSelect,
  onSelectAll,
}: ColumnProps): TableColumn<BranchList>[] => [
  {
    key: "select",
    header: (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={
            branches.length > 0 &&
            branches.every((branch) =>
              selectedBranchIds.includes(branch.branchId),
            )
          }
          onChange={onSelectAll}
          className="w-4 h-4 accent-[#0F4C81] cursor-pointer"
        />
        <span>Select All</span>
      </div>
    ),
    align: "center",

    width: "120px",
    render: (branch) => (
      <input
        type="checkbox"
        checked={selectedBranchIds.includes(branch.branchId)}
        onChange={() => onSelect(branch.branchId)}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 accent-[#0F4C81] cursor-pointer"
      />
    ),
  },
  {
    key: "branchName",
    header: "Branch Name",
    clickable: true,
    render: (branch) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#e0eef5] flex items-center justify-center">
          {branch.franchiseeFlag === 1 ? (
            <Building2 className="w-5 h-5 text-[#0F4C81]" />
          ) : (
            <School className="w-5 h-5 text-[#0F4C81]" />
          )}
        </div>

        <div>
          <p className="font-medium text-gray-900 text-sm">
            {branch.branchName}
          </p>
          <p className="text-xs text-gray-400">{branch.contactPerson}</p>
        </div>
      </div>
    ),
  },

  {
    key: "branchStatus",
    header: "Status",
    align: "center",
    render: (branch) => (
      <span
        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
          branch.branchStatus === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {branch.branchStatus}
      </span>
    ),
  },
];
