import { Building2, Edit, Network, School, Trash2 } from "lucide-react";
import { TableColumn } from "../../components/common/DataTable";
import type { BranchList } from "./branchTypes";

type ColumnProps = {
  onEdit: (branch: BranchList) => void;
  onDelete: (id: number) => void;
};

export const getBranchColumns = ({
  onEdit,
  onDelete,
}: ColumnProps): TableColumn<BranchList>[] => [
  {
    key: "actions",
    header: "Actions",
    align: "center",
    render: (branch) => (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(branch);
          }}
          className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
          title="Edit Branch"
        >
          <Edit className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(branch.branchId);
          }}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Branch"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    ),
  },
  {
    key: "branchName",
    header: "Branch Name",
    clickable: true,
    sortable: true,
    sortKey: "BranchName",
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
    key: "cpMobile",
    header: "Mobile",
    render: (branch) => branch.cpMobile ?? "-",
  },
  {
    key: "cpEmail",
    header: "Email",
    render: (branch) => branch.cpEmail ?? "-",
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
