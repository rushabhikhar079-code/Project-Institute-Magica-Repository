// // src/app/features/institutes/columns.tsx

// import { School, Edit, Trash2 } from "lucide-react";
// import { TableColumn } from "../../components/common/DataTable";
// import type { InstituteListType } from "./institutetypes";

// type ColumnProps = {
//   onEdit: (institute: InstituteListType) => void;
//   onDelete: (id: number) => void;
//   onSelectInstitute?: (institute: InstituteListType) => void; // 👈 Added optional callback
// };

// export const getInstituteColumns = ({
//   onEdit,
//   onDelete,
//   onSelectInstitute,
// }: ColumnProps): TableColumn<InstituteListType>[] => [
//   {
//     key: "actions",
//     header: "Actions",
//     align: "center",
//     render: (institute) => (
//       <div className="flex items-center justify-center gap-2">
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onEdit(institute);
//           }}
//           className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
//           title="Edit Institute"
//         >
//           <Edit className="w-5 h-5" />
//         </button>

//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onDelete(institute.instituteId);
//           }}
//           className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//           title="Delete Institute"
//         >
//           <Trash2 className="w-5 h-5" />
//         </button>
//       </div>
//     ),
//   },
//   {
//     key: "instituteName",
//     header: "Institute Name",
//     render: (institute) => (
//       <div
//         onClick={(e) => {
//           e.stopPropagation();
//           console.log("Cell clicked! Handler defined:", !!onSelectInstitute); // 👈 Add this log
//           if (onSelectInstitute) {
//             onSelectInstitute(institute);
//           } else {
//             console.warn("onSelectInstitute is undefined!");
//           }
//         }}
//         className="flex items-center gap-3 cursor-pointer group"
//       >
//         <div className="w-10 h-10 rounded-full bg-[#e0eef5] flex items-center justify-center">
//           <School className="w-5 h-5 text-[#0F4C81]" />
//         </div>

//         <div>
//           <p className="font-medium text-gray-900 text-sm">
//             {institute.instituteName}
//           </p>
//           <p className="text-xs text-gray-400">
//             {institute.contactPerson ?? "-"}
//           </p>
//         </div>
//       </div>
//     ),
//   },
//   {
//     key: "cpMobile",
//     header: "Mobile",
//     // 🎯 Checks both cpMobile (backend API response) and phone
//     render: (institute) =>
//       (institute as any).cpMobile ?? institute.phone ?? "-",
//   },
//   {
//     key: "cpEmail",
//     header: "Email",
//     // 🎯 Checks both cpEmail (backend API response) and email
//     render: (institute) => (institute as any).cpEmail ?? institute.email ?? "-",
//   },
//   {
//     key: "city",
//     header: "City",
//     render: (institute) =>
//       institute.city && institute.city.trim() !== "" ? institute.city : "-",
//   },
//   {
//     key: "institutePlan",
//     header: "Plan",
//     render: (institute) => (
//       <span className="font-medium text-xs text-gray-700">
//         {institute.institutePlan ?? "-"}
//       </span>
//     ),
//   },
//   {
//     key: "status",
//     header: "Status",
//     // 🎯 Corrected: Using 'key' and 'render' (matching TableColumn interface)
//     render: (institute: InstituteListType) => {
//       // Read instituteStatus (from C# DTO) or fallback to status
//       const rawStatus =
//         (institute as any).instituteStatus ?? institute.status ?? "";

//       // Convert to string and check if active
//       const statusStr = String(rawStatus).trim();
//       const isActive =
//         statusStr.toLowerCase() === "active" ||
//         statusStr === "1" ||
//         statusStr.toLowerCase() === "true";

//       return (
//         <span
//           className={`px-2.5 py-1 rounded-full text-xs font-medium ${
//             isActive
//               ? "bg-green-100 text-green-800 border border-green-200"
//               : "bg-red-100 text-red-800 border border-red-200"
//           }`}
//         >
//           {isActive ? "Active" : "Inactive"}
//         </span>
//       );
//     },
//   },
// ];
// src/app/features/institutes/columns.tsx

// import { School, Edit, Trash2 } from "lucide-react";
// import { TableColumn } from "../../components/common/DataTable";
// import type { InstituteListType } from "./institutetypes";

// type ColumnProps = {
//   onEdit: (institute: InstituteListType) => void;
//   onDelete: (id: number) => void;
//   onSelectInstitute?: (institute: InstituteListType) => void;
// };

// export const getInstituteColumns = ({
//   onEdit,
//   onDelete,
//   onSelectInstitute,
// }: ColumnProps): TableColumn<InstituteListType>[] => [
//   {
//     key: "actions",
//     header: "Actions",
//     align: "center",
//     render: (institute) => (
//       <div className="flex items-center justify-center gap-2">
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onEdit(institute);
//           }}
//           className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
//           title="Edit Institute"
//         >
//           <Edit className="w-5 h-5" />
//         </button>

//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onDelete(institute.instituteId);
//           }}
//           className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//           title="Delete Institute"
//         >
//           <Trash2 className="w-5 h-5" />
//         </button>
//       </div>
//     ),
//   },
//   {
//     key: "instituteName",
//     header: "Institute Name",
//     render: (institute) => (
//       <div
//         onClick={(e) => {
//           e.stopPropagation();
//           if (onSelectInstitute) {
//             onSelectInstitute(institute);
//           }
//         }}
//         className="flex items-center gap-3 cursor-pointer group"
//       >
//         <div className="w-10 h-10 rounded-full bg-[#e0eef5] flex items-center justify-center">
//           <School className="w-5 h-5 text-[#0F4C81]" />
//         </div>

//         <div>
//           <p className="font-medium text-gray-900 text-sm">
//             {institute.instituteName}
//           </p>
//           <p className="text-xs text-gray-400">
//             {institute.contactPerson ?? "-"}
//           </p>
//         </div>
//       </div>
//     ),
//     sortable: true,
//     sortKey: "InstituteName",
//   },
//   {
//     key: "cpMobile",
//     header: "Mobile",
//     render: (institute) =>
//       (institute as any).cpMobile ?? institute.phone ?? "-",
//   },
//   {
//     key: "cpEmail",
//     header: "Email",
//     render: (institute) => (institute as any).cpEmail ?? institute.email ?? "-",
//   },
//   {
//     key: "city",
//     header: "City",
//     render: (institute) =>
//       institute.city && institute.city.trim() !== "" ? institute.city : "-",
//   },
//   {
//     key: "institutePlan",
//     header: "Plan",
//     render: (institute) => (
//       <span className="font-medium text-xs text-gray-700">
//         {(institute as any).institutePlan ??
//           (institute as any).planName ??
//           (institute as any).plan ??
//           "-"}
//       </span>
//     ),
//   },
//   {
//     key: "instituteStatus", // Fixed: Matches C# DTO property 'instituteStatus'
//     header: "Status",
//     render: (institute: InstituteListType) => {
//       const rawStatus =
//         (institute as any).instituteStatus ?? institute.status ?? "";

//       const statusStr = String(rawStatus).trim();
//       const isActive =
//         statusStr.toLowerCase() === "active" ||
//         statusStr === "1" ||
//         statusStr.toLowerCase() === "true";

//       return (
//         <span
//           className={`px-2.5 py-1 rounded-full text-xs font-medium ${
//             isActive
//               ? "bg-green-100 text-green-800 border border-green-200"
//               : "bg-red-100 text-red-800 border border-red-200"
//           }`}
//         >
//           {isActive ? "Active" : "Inactive"}
//         </span>
//       );
//     },
//   },
// ];
// src/app/features/institutes/columns.tsx

import { School, Edit, Trash2, Loader2 } from "lucide-react";
import { TableColumn } from "../../components/common/DataTable";
import type { InstituteListType } from "./institutetypes";

type ColumnProps = {
  onEdit: (institute: InstituteListType) => void;
  onDelete: (id: number) => void;
  onSelectInstitute?: (institute: InstituteListType) => void;
  deletingInstituteId?: number | null;
};

export const getInstituteColumns = ({
  onEdit,
  onDelete,
  onSelectInstitute,
  deletingInstituteId,
}: ColumnProps): TableColumn<InstituteListType>[] => [
  {
    key: "actions",
    header: "Actions",
    align: "center",
    sortable: false,
    render: (institute) => (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Stops row select on action buttons
            onEdit(institute);
          }}
          className="p-2 text-[#0F4C81] hover:bg-[#e0eef5] rounded-lg transition-colors"
          title="Edit Institute"
        >
          <Edit className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation(); // Stops row select on action buttons
            onDelete(institute.instituteId);
          }}
          disabled={deletingInstituteId === institute.instituteId}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title={
            deletingInstituteId === institute.instituteId
              ? "Deleting Institute..."
              : "Delete Institute"
          }
        >
          {deletingInstituteId === institute.instituteId ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    ),
  },
  {
    key: "instituteName",
    header: "Institute Name",
    sortable: true,
    sortKey: "InstituteName", // Match PascalCase key expected by C# backend
    render: (institute) => (
      <div
        onClick={() => {
          if (onSelectInstitute) {
            onSelectInstitute(institute);
          }
        }}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-full bg-[#e0eef5] flex items-center justify-center">
          <School className="w-5 h-5 text-[#0F4C81]" />
        </div>

        <div>
          <p className="font-medium text-gray-900 text-sm">
            {institute.instituteName}
          </p>
          <p className="text-xs text-gray-400">
            {institute.contactPerson ?? "-"}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "cpMobile",
    header: "Mobile",
    sortKey: "CpMobile",
    render: (institute) =>
      (institute as any).cpMobile ?? institute.phone ?? "-",
  },
  {
    key: "cpEmail",
    header: "Email",
    sortKey: "CpEmail",
    sortable: true,
    render: (institute) => (institute as any).cpEmail ?? institute.email ?? "-",
  },
  {
    key: "city",
    header: "City",
    sortKey: "City",
    render: (institute) =>
      institute.city && institute.city.trim() !== "" ? institute.city : "-",
  },
  {
    key: "institutePlan",
    header: "Plan",
    sortKey: "PlanName",
    render: (institute) => (
      <span className="font-medium text-xs text-gray-700">
        {(institute as any).institutePlan ??
          (institute as any).planName ??
          (institute as any).plan ??
          "-"}
      </span>
    ),
  },
  {
    key: "instituteStatus",
    header: "Status",
    sortKey: "InstituteStatus",
    render: (institute: InstituteListType) => {
      const rawStatus =
        (institute as any).instituteStatus ?? institute.status ?? "";

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
