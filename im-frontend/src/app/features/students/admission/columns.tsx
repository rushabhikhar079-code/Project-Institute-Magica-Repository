import { Edit, Printer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TableColumn } from "../../../components/common/DataTable";
import type { StudentList } from "./types";
import { createPortal } from "react-dom";

type ColumnProps = {
  onEdit: (student: StudentList) => void;

  selectedIds: (string | number)[];
  onSelect: (student: StudentList, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;

  allSelected: boolean;
  someSelected: boolean;
};
type ExpandableListCellProps = {
  value?: string;
  title: string;
};

const ExpandableListCell = ({ value, title }: ExpandableListCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const items =
    value && value !== "-"
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const updatePopupPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setPopupPosition({
      top: rect.bottom + 8,
      left: rect.left,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePopupPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        containerRef.current?.contains(target) ||
        popupRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleScroll = () => {
      updatePopupPosition();
    };

    const handleResize = () => {
      updatePopupPosition();
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Capture scroll events from the DataTable's scroll container
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      window.removeEventListener("scroll", handleScroll, true);

      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  if (items.length === 0) {
    return <span>-</span>;
  }

  const visibleItems = items.slice(0, 2);
  const remainingCount = items.length - visibleItems.length;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-1 min-w-0"
    >
      <span className="truncate" title={visibleItems.join(", ")}>
        {visibleItems.join(", ")}
      </span>

      {remainingCount > 0 && (
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();

            if (!isOpen) {
              updatePopupPosition();
            }

            setIsOpen((prev) => !prev);
          }}
          className="shrink-0 text-[#0F4C81] hover:text-[#083b65] font-medium text-xs whitespace-nowrap hover:underline"
        >
          +{remainingCount} more
        </button>
      )}

      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            className="fixed z-[999999] w-72 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
            style={{
              top: popupPosition.top,
              left: popupPosition.left,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">
                {title}
              </span>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 space-y-1">
              {items.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="px-2 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-50"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
export const getAdmissionColumns = ({
  onEdit,
  selectedIds,
  onSelect,
  onSelectAll,
  allSelected,
  someSelected,
}: ColumnProps): TableColumn<StudentList>[] => [
  {
    key: "select",
    header: (
      <div className="flex items-center justify-center gap-2">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) {
              el.indeterminate = someSelected && !allSelected;
            }
          }}
          onChange={(e) => onSelectAll(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 cursor-pointer"
          title="Select All"
        />
        <span>Select All</span>
      </div>
    ),
    width: "50px",
    align: "center",
    sortable: false,
    render: (student: StudentList) => {
      const studentId = student.RegNo ?? student.RegNo_Manual;

      const isSelected = selectedIds.includes(studentId);

      return (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(student, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 cursor-pointer"
        />
      );
    },
  },

  {
    key: "actions",
    header: "Actions",
    width: "100px",
    align: "center",
    sortable: false,
    render: (student: StudentList) => (
      <div className="flex items-center justify-center gap-1">
        {/* Edit */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(student);
          }}
          className="p-1.5 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
          title="Edit Student"
        >
          <Edit className="w-4 h-4" />
        </button>

        {/* Print */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Print Student:", student);
          }}
          className="p-1.5 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
          title="Print"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>
    ),
  },

  {
    key: "username",
    header: "User Name",
    sortable: false,
    render: (student: StudentList) => student.Username || "-",
  },

  {
    key: "Name",
    header: "Student Name",
    sortable: true,
    sortKey: "Name",
    render: (student: StudentList) => student.Name || "-",
  },

  {
    key: "RegNo",
    header: "Reg. No.",
    sortable: true,
    sortKey: "RegNo_Manual",
    render: (student: StudentList) =>
      student.RegNo_Manual || student.RegNo || "-",
  },

  {
    key: "RegDate",
    header: "Reg Date",
    sortable: true,
    sortKey: "RDate",
    render: (student: StudentList) => student.RegDate || "-",
  },

  {
    key: "PContact",
    header: "Phone",
    sortable: false,
    render: (student: StudentList) => student.PContact || "-",
  },
  {
    key: "EmailId",
    header: "Email Id",
    sortable: false,
    render: (student: StudentList) => student.EmailId || "-",
  },
  {
    key: "CourseNames",
    header: "Courses",
    sortable: false,
    render: (student: StudentList) => (
      <ExpandableListCell value={student.CourseNames} title="Courses" />
    ),
  },

  {
    key: "SubjectNames",
    header: "Subjects",
    sortable: false,
    render: (student: StudentList) => (
      <ExpandableListCell value={student.SubjectNames} title="Subjects" />
    ),
  },

  {
    key: "BatchNames",
    header: "Batches",
    sortable: false,
    render: (student: StudentList) => (
      <ExpandableListCell value={student.BatchNames} title="Batches" />
    ),
  },

  {
    key: "Registered",
    header: "Registered",
    sortable: false,
    align: "center",
    render: (student: StudentList) => {
      const registered = String(student.Registered).toLowerCase() === "yes";

      return (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            registered
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {registered ? "Yes" : "No"}
        </span>
      );
    },
  },

  {
    key: "Status",
    header: "Status",
    align: "center",
    sortable: false,
    render: (student: StudentList) => {
      const rawStatus = (student as any).Status ?? student.Status ?? "";

      const statusStr = String(rawStatus).trim();

      const isActive =
        statusStr.toLowerCase() === "active" ||
        statusStr === "1" ||
        statusStr.toLowerCase() === "true";

      return (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },

  {
    key: "resetPassword",
    header: "Reset Password",
    sortable: false,
    align: "center",
    render: (student: StudentList) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Reset Password:", student);
        }}
        className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
      >
        Set
      </button>
    ),
  },

  {
    key: "sendLoginDetails",
    header: "Send Login Details",
    sortable: false,
    align: "center",
    render: (student: StudentList) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Send Login Details:", student);
        }}
        className="px-3 py-1.5 text-xs font-medium text-[#0F4C81] border border-[#0F4C81] rounded-md hover:bg-[#e0eef5] transition-colors"
      >
        Send
      </button>
    ),
  },

  {
    key: "branchTransfer",
    header: "Branch Transfer",
    sortable: false,
    align: "center",
    render: (student: StudentList) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Branch Transfer:", student);
        }}
        className="px-3 py-1.5 text-xs font-medium text-purple-600 border border-purple-300 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
      >
        Transfer
      </button>
    ),
  },
];
