import { Edit, Printer, X } from "lucide-react";

import type { TableColumn } from "../../../components/common/DataTable";
import type { StudentList } from "./enquiryListTypes";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
type ColumnProps = {
  onEdit: (student: StudentList) => void;

  selectedRegNos: StudentList["RegNo"][];

  onStudentSelection: (regNo: StudentList["RegNo"], checked: boolean) => void;

  onSelectAll: (checked: boolean) => void;

  allSelected: boolean;
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

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        const popup = document.getElementById("expandable-list-popup");

        if (popup && !popup.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    const handlePositionUpdate = () => {
      updatePopupPosition();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handlePositionUpdate, true);
    window.addEventListener("resize", handlePositionUpdate);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handlePositionUpdate, true);
      window.removeEventListener("resize", handlePositionUpdate);
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
            id="expandable-list-popup"
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
  selectedRegNos,
  onStudentSelection,
  onSelectAll,
  allSelected,
}: ColumnProps): TableColumn<StudentList>[] => [
  {
    key: "select",
    header: (
      <div className="flex items-center justify-center gap-2">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelectAll(e.target.checked);
          }}
          className="w-4 h-4 accent-[#0F4C81] cursor-pointer"
        />{" "}
        <span>Select All</span>
      </div>
    ),
    align: "center",
    width: "50px",
    sortable: false,
    render: (student: StudentList) => (
      <input
        type="checkbox"
        checked={selectedRegNos.includes(student.RegNo)}
        onChange={(e) => {
          e.stopPropagation();

          onStudentSelection(student.RegNo, e.target.checked);
        }}
        className="w-4 h-4 accent-[#0F4C81] cursor-pointer"
      />
    ),
  },

  {
    key: "actions",
    header: "Actions",
    align: "center",
    width: "110px",
    sortable: false,
    render: (student: StudentList) => (
      <div className="flex items-center justify-center gap-2">
        {/* Edit */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(student);
          }}
          className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
          title="Edit Student"
        >
          <Edit className="w-5 h-5" />
        </button>

        {/* Print */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Print Student:", student);
          }}
          className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
          title="Print Student"
        >
          <Printer className="w-5 h-5" />
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
    key: "course",
    header: "Courses",
    sortable: false,
    render: (student: StudentList) => (
      <ExpandableListCell value={student.courseNames} title="Courses" />
    ),
  },

  {
    key: "subject",
    header: "Subjects",
    sortable: false,
    render: (student: StudentList) => (
      <ExpandableListCell value={student.subjectNames} title="Subjects" />
    ),
  },

  {
    key: "batch",
    header: "Batches",
    sortable: false,
    render: (student: StudentList) => (
      <ExpandableListCell value={student.batchNames} title="Batches" />
    ),
  },
  {
    key: "EnquiryDate",
    header: "Enquiry Date",
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
    key: "email",
    header: "Email",

    sortable: false,
    render: (student: StudentList) => student.EmailId || "-",
  },

  {
    key: "register",
    header: "Register",
    align: "center",
    sortable: false,
    render: (student: StudentList) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Send Login Details:", student);
        }}
        className="px-3 py-1.5 border border-[#0F4C81] text-[#0F4C81] rounded-lg text-sm hover:bg-[#e0eef5] transition-colors"
      >
        Register
      </button>
    ),
  },
  {
    key: "enqStatus",
    header: "Enquiry Status",

    sortable: false,
    render: (student: StudentList) => student.EnqStatus || "-",
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
];
