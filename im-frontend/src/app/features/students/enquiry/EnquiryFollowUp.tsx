import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import DataTable from "../../../components/common/DataTable/Datatable";
import type { RootState } from "../../../redux/store";
import {
  deleteFollowUpRemark,
  getCoursesWithSubjects,
  getFollowupStatuses,
  getLastRemarks,
  saveFollowUpRemark,
  searchEnquiryFollowUp,
} from "./enquiryService";
import { exportStudentsToExcel } from "./enquiryExcel";
import type {
  EnquiryFollowUpFilters,
  EnquiryFollowUpRow,
  EnquiryFollowUpSearchRequest,
} from "./types/followUpTypes";

const DEFAULT_FILTERS: EnquiryFollowUpFilters = {
  category: 0,
  studentName: "",
  courseIds: "",
  subjectIds: "",
  enqStatus: 0,
  fromDate: "",
  toDate: "",
  filterOn: 1,
  callbackFromDate: "",
  callbackToDate: "",
  allBranches: false,
};

const PAGE_SIZE = 10;
const FIRST_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type SearchMode = "firstName" | "lastName";

type FollowUpStatusOption = {
  label: string;
  value: string | number;
};

type FollowUpHistoryItem = {
  callId: number;
  callDate: string;
  remarks: string;
  called_By: string;
  callbackDate?: string | null;
  callbackTime?: string | null;
};

const formatDateForApi = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
};

const toCommaSeparatedIds = (ids: number[]) =>
  ids.filter((id) => Number.isFinite(id) && id > 0).join(",");

const parseCommaSeparatedIds = (value: string) =>
  value
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isFinite(entry) && entry > 0);

const countActiveFilters = (nextFilters: EnquiryFollowUpFilters) => {
  const values = [
    nextFilters.studentName,
    nextFilters.category > 0 ? "category" : "",
    nextFilters.enqStatus > 0 ? "status" : "",
    nextFilters.fromDate,
    nextFilters.toDate,
    nextFilters.callbackFromDate,
    nextFilters.callbackToDate,
    nextFilters.courseIds,
    nextFilters.subjectIds,
    nextFilters.filterOn !== 1 ? "filterOn" : "",
  ];

  return values.filter((value) => value && value !== "0").length;
};

const toDisplayDate = (value: string | null | undefined) => {
  if (!value || value === "null" || value === "undefined" || value === "-") {
    return "—";
  }

  const trimmed = String(value).trim();
  if (!trimmed) return "—";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed.split("-").reverse().join("/");
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
};

const toDisplayTime = (value: string | null | undefined) => {
  if (!value || value === "null" || value === "undefined") return "—";

  const text = String(value).trim();
  if (!text) return "—";
  if (text.length <= 5) return text;

  return text.slice(0, 5);
};

const getNamePart = (row: EnquiryFollowUpRow, mode: SearchMode) => {
  const fullName = (row.name || "").trim();
  const parts = fullName.split(/\s+/).filter(Boolean);

  if (!parts.length) return "";

  if (mode === "firstName") {
    return parts[0] || "";
  }

  return parts[parts.length - 1] || "";
};

const getMappedRow = (row: any): EnquiryFollowUpRow => ({
  regNo: Number(row?.regNo ?? row?.RegNo ?? 0),
  enquiryDate: row?.enquiryDate ?? row?.EnquiryDate ?? "",
  name: row?.name ?? row?.Name ?? "",
  pContact: row?.pContact ?? row?.PContact ?? "",
  subjects: row?.subjects ?? row?.Subjects ?? "",
  callBackDate: row?.callBackDate ?? row?.CallBackDate ?? "",
  callbackTime: row?.callbackTime ?? row?.CallbackTime ?? "",
  followDate: row?.followDate ?? row?.FollowDate ?? "",
  remark: row?.remark ?? row?.Remark ?? "",
  regNoManual: row?.regNoManual ?? row?.RegNoManual ?? "",
  enquiryStatus: row?.enquiryStatus ?? row?.EnquiryStatus ?? null,
  enqStatusText: row?.enqStatusText ?? row?.EnqStatusText ?? "",
  registered: row?.registered ?? row?.Registered ?? "",
  eDate: row?.eDate ?? row?.EDate ?? "",
  isInterested: row?.isInterested ?? row?.IsInterested ?? false,
});

export default function EnquiryFollowUp() {
  const navigate = useNavigate();
  const branchId = useSelector((state: RootState) => state.branch.branchId);
  const instituteId = useSelector((state: RootState) => state.auth.instituteId);
  const effectiveBranchId = Number(branchId || Number(localStorage.getItem("branchId") || 0));
  const effectiveInstituteId = Number(instituteId || Number(localStorage.getItem("instituteId") || 0));

  const [filters, setFilters] = useState<EnquiryFollowUpFilters>(DEFAULT_FILTERS);
  const [rows, setRows] = useState<EnquiryFollowUpRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string | null>("CallBackDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("firstName");
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [followUpStatusOptions, setFollowUpStatusOptions] = useState<FollowUpStatusOption[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedFollowUpRow, setSelectedFollowUpRow] = useState<EnquiryFollowUpRow | null>(null);
  const [followUpForm, setFollowUpForm] = useState({
    statusId: "",
    callbackDate: "",
    callbackTime: "",
    interested: true,
    remarks: "",
  });
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [courseOptions, setCourseOptions] = useState<
    { courseId: number; courseName: string; subjects: { subId: number; subName: string }[] }[]
  >([]);
  const [subjectOptions, setSubjectOptions] = useState<{ id: number; name: string }[]>([]);
  const [historyState, setHistoryState] = useState<{
    isOpen: boolean;
    student: EnquiryFollowUpRow | null;
    items: FollowUpHistoryItem[];
    isLoading: boolean;
    deletingCallId: number | null;
  }>({
    isOpen: false,
    student: null,
    items: [],
    isLoading: false,
    deletingCallId: null,
  });
  const requestIdRef = useRef(0);
  const [serverTotalRecords, setServerTotalRecords] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadRows = async (
    nextFilters: EnquiryFollowUpFilters,
    nextPage = 1,
    nextSortBy: string | null = sortBy,
    nextSortDirection: "asc" | "desc" | null = sortDirection,
    nextPageSize = pageSize,
  ) => {
    if (!effectiveBranchId) {
      setRows([]);
      setCurrentPage(1);
      setTotalRecords(0);
      setTotalPages(1);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const payload: EnquiryFollowUpSearchRequest = {
        category: nextFilters.category,
        studentName: nextFilters.studentName?.trim() || "",
        courseIds: nextFilters.courseIds,
        subjectIds: nextFilters.subjectIds,
        enqStatus: nextFilters.enqStatus || undefined,
        fromDate: formatDateForApi(nextFilters.fromDate),
        toDate: formatDateForApi(nextFilters.toDate),
        filterOn: nextFilters.filterOn,
        callbackFromDate: formatDateForApi(nextFilters.callbackFromDate),
        callbackToDate: formatDateForApi(nextFilters.callbackToDate),
        branchId: effectiveBranchId,
        pageNumber: nextPage,
        pageSize: nextPageSize,
        sortBy: nextSortBy ?? "CallBackDate",
        sortDirection: nextSortDirection ?? "asc",
      };

      const response = await searchEnquiryFollowUp(payload);
      const envelope = response?.data ?? response ?? {};
      const pagedData = envelope?.data ?? envelope;
      const items = Array.isArray(pagedData?.items)
        ? pagedData.items
        : Array.isArray(pagedData)
          ? pagedData
          : [];

      if (requestId !== requestIdRef.current) {
        return;
      }

      const mappedItems = items.map((item: any) => getMappedRow(item));
      const serverPageNumber = Number(pagedData?.pageNumber ?? nextPage);
      const serverPageSize = Number(pagedData?.pageSize ?? nextPageSize);
      const serverTotalCount = Number(pagedData?.totalCount ?? mappedItems.length);
      const serverTotalPagesCount = Number(
        pagedData?.totalPages ?? Math.max(1, Math.ceil(serverTotalCount / (serverPageSize || nextPageSize) || 1)),
      );

      setRows(mappedItems);
      setCurrentPage(serverPageNumber);
      setPageSize(serverPageSize);
      setTotalRecords(serverTotalCount);
      setTotalPages(serverTotalPagesCount);
      setServerTotalRecords(serverTotalCount);
      setServerTotalPages(serverTotalPagesCount);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("Failed to load enquiry follow-up rows", loadError);
      setRows([]);
      setTotalRecords(0);
      setTotalPages(1);
      setError("Unable to load enquiry follow-up records.");
      toast.error("Unable to load enquiry follow-up records.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!effectiveBranchId) {
      setRows([]);
      return;
    }

    loadRows(filters, currentPage, sortBy, sortDirection, pageSize);
  }, [effectiveBranchId]);

  useEffect(() => {
    if (!effectiveBranchId) {
      setFollowUpStatusOptions([]);
      return;
    }

    const fetchStatusOptions = async () => {
      try {
        const response = await getFollowupStatuses(effectiveInstituteId, effectiveBranchId);
        const payload = response?.data ?? response ?? [];
        const options = (Array.isArray(payload) ? payload : []).map((item: any) => ({
          label: item.sName ?? item.statusName ?? item.StatusName ?? "Follow-up",
          value: String(item.statusId ?? item.StatusId ?? ""),
        }));
        setFollowUpStatusOptions(options);
      } catch (fetchError) {
        console.error("Failed to fetch follow-up status options", fetchError);
        setFollowUpStatusOptions([]);
      }
    };

    fetchStatusOptions();
  }, [effectiveBranchId, effectiveInstituteId]);

  useEffect(() => {
    if (!effectiveBranchId) {
      setCourseOptions([]);
      setSubjectOptions([]);
      return;
    }

    const fetchCourseOptions = async () => {
      try {
        const courses = await getCoursesWithSubjects(effectiveBranchId);
        setCourseOptions(courses ?? []);

        const flattenedSubjects = (courses ?? []).flatMap((course) =>
          (course.subjects ?? []).map((subject) => ({
            id: Number(subject.subId),
            name: subject.subName,
          })),
        );

        setSubjectOptions(flattenedSubjects);
      } catch (fetchError) {
        console.error("Failed to fetch course and subject filters", fetchError);
        setCourseOptions([]);
        setSubjectOptions([]);
      }
    };

    fetchCourseOptions();
  }, [effectiveBranchId]);

  useEffect(() => {
    setActiveFilterCount(countActiveFilters(filters));
  }, [filters]);

  const toggleCourseSelection = (courseId: number) => {
    const selectedIds = parseCommaSeparatedIds(filters.courseIds);
    const updatedIds = selectedIds.includes(courseId)
      ? selectedIds.filter((id) => id !== courseId)
      : [...selectedIds, courseId];

    setFilters((prev) => ({
      ...prev,
      courseIds: toCommaSeparatedIds(updatedIds),
    }));
  };

  const toggleSubjectSelection = (subjectId: number) => {
    const selectedIds = parseCommaSeparatedIds(filters.subjectIds);
    const updatedIds = selectedIds.includes(subjectId)
      ? selectedIds.filter((id) => id !== subjectId)
      : [...selectedIds, subjectId];

    setFilters((prev) => ({
      ...prev,
      subjectIds: toCommaSeparatedIds(updatedIds),
    }));
  };

  const filteredRows = useMemo(() => {
    let list = [...rows];

    const trimmedSearch = filters.studentName.trim().toLowerCase();
    if (trimmedSearch) {
      list = list.filter((row) => {
        const name = row.name || "";
        const searchTarget = name.toLowerCase();
        if (searchMode === "firstName") {
          return getNamePart(row, "firstName").toLowerCase().includes(trimmedSearch);
        }
        return getNamePart(row, "lastName").toLowerCase().includes(trimmedSearch) || searchTarget.includes(trimmedSearch);
      });
    }

    if (selectedLetter) {
      list = list.filter((row) => {
        const selector = searchMode === "firstName" ? getNamePart(row, "firstName") : getNamePart(row, "lastName");
        return selector.toUpperCase().startsWith(selectedLetter);
      });
    }

    return list;
  }, [rows, filters.studentName, searchMode, selectedLetter]);

  const visibleRows = filteredRows;
  const computedTotalRecords = serverTotalRecords || visibleRows.length;
  const computedTotalPages = Math.max(1, serverTotalPages || Math.ceil(computedTotalRecords / pageSize));

  useEffect(() => {
    setTotalRecords(computedTotalRecords);
    setTotalPages(computedTotalPages);
  }, [computedTotalRecords, computedTotalPages]);

  useEffect(() => {
    if (currentPage > computedTotalPages) {
      setCurrentPage(computedTotalPages);
    }
  }, [currentPage, computedTotalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return visibleRows.slice(start, start + pageSize);
  }, [visibleRows, currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadRows({ ...filters, studentName: filters.studentName.trim() }, 1, sortBy, sortDirection, pageSize);
  };

  const handleClear = () => {
    const reset = { ...DEFAULT_FILTERS };
    setFilters(reset);
    setSelectedLetter("");
    setSearchMode("firstName");
    setShowFilters(false);
    setCurrentPage(1);
    loadRows(reset, 1, "CallBackDate", "asc", pageSize);
  };

  const handleSortChange = (
    nextSortBy: string | null,
    nextSortDirection: "asc" | "desc" | null,
  ) => {
    setSortBy(nextSortBy);
    setSortDirection(nextSortDirection);
    setCurrentPage(1);
    loadRows(filters, 1, nextSortBy, nextSortDirection, pageSize);
  };

  const onPageSizeChange = async (nextSize: number) => {
    setPageSize(nextSize);
    setCurrentPage(1);
    await loadRows(filters, 1, sortBy, sortDirection, nextSize);
  };

  const onPageChange = async (page: number) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    await loadRows(filters, page, sortBy, sortDirection, pageSize);
  };

  const toggleSelectRow = (regNo: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [regNo]: !prev[regNo],
    }));
  };

  const selectAllVisibleRows = () => {
    const nextMap: Record<number, boolean> = {};
    paginatedRows.forEach((row) => {
      nextMap[row.regNo] = true;
    });

    setSelectedRows((prev) => ({ ...prev, ...nextMap }));
  };

  const clearSelectedRows = () => {
    setSelectedRows({});
  };

  const columnSelectAllChecked = paginatedRows.length > 0 && paginatedRows.every((row) => selectedRows[row.regNo]);

  const openFollowUpModal = (row: EnquiryFollowUpRow) => {
    setSelectedFollowUpRow(row);
    setFollowUpForm({
      statusId: "",
      callbackDate: "",
      callbackTime: "",
      interested: true,
      remarks: "",
    });
    setShowFollowUpModal(true);
  };

  const exportCurrentRows = () => {
    if (!rows.length) {
      toast.info("No records available to export.");
      return;
    }

    const exportRows = rows.map((row) => ({
      Name: row.name || "",
      "Contact No": row.pContact || "",
      FMobile: "",
      MMobile: "",
      EmailId: "",
      Status: row.enqStatusText || row.enquiryStatus || "",
      Registered: row.registered || row.eDate || "",
      RegNo_Manual: row.regNoManual || "",
      RegDate: row.enquiryDate || row.eDate || row.registered || "",
      EnqStatus: row.enqStatusText || row.enquiryStatus || "",
      Username: "",
    }));

    exportStudentsToExcel(exportRows as any);
  };

  const openHistoryModal = async (row: EnquiryFollowUpRow) => {
    if (!effectiveBranchId) {
      toast.error("Branch context is required to view follow-up history.");
      return;
    }

    setHistoryState({
      isOpen: true,
      student: row,
      items: [],
      isLoading: true,
      deletingCallId: null,
    });

    try {
      const response = await getLastRemarks(Number(row.regNo), effectiveBranchId);
      const payload = response?.data ?? response ?? [];
      const items = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      setHistoryState({
        isOpen: true,
        student: row,
        items: items.map((item: any) => ({
          callId: Number(item.callId ?? item.CallId ?? 0),
          callDate: item.callDate ?? item.CallDate ?? "",
          remarks: item.remarks ?? item.Remarks ?? "",
          called_By: item.called_By ?? item.Called_By ?? "",
          callbackDate: item.callbackDate ?? item.CallbackDate ?? null,
          callbackTime: item.callbackTime ?? item.CallbackTime ?? null,
        })),
        isLoading: false,
        deletingCallId: null,
      });
    } catch (historyError) {
      console.error("Failed to load follow-up history", historyError);
      setHistoryState((prev) => ({
        ...prev,
        items: [],
        isLoading: false,
      }));
      toast.error("Unable to load follow-up history.");
    }
  };

  const handleDeleteHistoryItem = async (callId: number) => {
    if (!callId) return;

    const confirmed = window.confirm("Delete this follow-up record?");
    if (!confirmed) return;

    setHistoryState((prev) => ({ ...prev, deletingCallId: callId }));

    try {
      const response = await deleteFollowUpRemark(callId);
      const message = response?.message || response?.data?.message || "Follow-up record deleted.";
      toast.success(message);

      if (historyState.student) {
        await openHistoryModal(historyState.student);
      }
    } catch (deleteError) {
      console.error("Failed to delete follow-up record", deleteError);
      toast.error("Failed to delete the follow-up record.");
    } finally {
      setHistoryState((prev) => ({ ...prev, deletingCallId: null }));
    }
  };

  const submitFollowUp = async () => {
    if (!selectedFollowUpRow) return;
    if (!followUpForm.statusId) {
      toast.error("Please select a follow-up status.");
      return;
    }
    if (!followUpForm.remarks.trim()) {
      toast.error("Please enter a follow-up remark.");
      return;
    }

    if (!branchId) {
      toast.error("Branch context is required to save the follow-up.");
      return;
    }

    setIsSubmittingFollowUp(true);

    try {
      const payload = {
        StudentId: Number(selectedFollowUpRow.regNo),
        EnquiryStatus: Number(selectedFollowUpRow.enquiryStatus ?? 0),
        StatusId: Number(followUpForm.statusId),
        CallbackDate: followUpForm.callbackDate || null,
        CallbackTime: followUpForm.callbackTime || null,
        Interested: followUpForm.interested,
        Remarks: followUpForm.remarks.trim(),
        BranchId: branchId,
      };

      const response = await saveFollowUpRemark(payload);
      const message = response?.message || response?.data?.message || "Follow-up saved successfully.";
      toast.success(message);
      setShowFollowUpModal(false);
      setSelectedFollowUpRow(null);
      setFollowUpForm({
        statusId: "",
        callbackDate: "",
        callbackTime: "",
        interested: true,
        remarks: "",
      });
      await loadRows(filters, currentPage, sortBy, sortDirection, pageSize);
    } catch (saveError) {
      console.error("Failed to save follow-up", saveError);
      toast.error("Failed to save the follow-up remark.");
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const columns = [
    {
      key: "select",
      header: "",
      width: 46,
      render: (row: EnquiryFollowUpRow) => (
        <input
          type="checkbox"
          checked={Boolean(selectedRows[row.regNo])}
          onChange={() => toggleSelectRow(row.regNo)}
          className="h-4 w-4 rounded border-[#dfe7ef] text-[#0F4C81] focus:ring-[#0F4C81]"
          aria-label={`Select enquiry ${row.regNo || row.name}`}
        />
      ),
    },
    {
      key: "enquiryDate",
      header: "Reg/Enq Date",
      width: 130,
      sortable: true,
      sortKey: "EnquiryDate",
      render: (row: EnquiryFollowUpRow) => toDisplayDate(row.enquiryDate || row.eDate || row.registered),
    },
    {
      key: "enquiryStatus",
      header: "Enquiry Status",
      width: 150,
      sortable: true,
      sortKey: "EnquiryStatus",
      render: (row: EnquiryFollowUpRow) => (
        <span className="inline-flex rounded-full border border-[#dfe7ef] bg-[#eef4fa] px-2 py-0.5 text-xs font-medium text-[#0f172a]">
          {row.enqStatusText || row.enquiryStatus || "—"}
        </span>
      ),
    },
    {
      key: "name",
      header: "Student Name",
      width: 200,
      sortable: true,
      sortKey: "Name",
      render: (row: EnquiryFollowUpRow) => row.name || "—",
    },
    {
      key: "pContact",
      header: "Phone",
      width: 150,
      sortable: true,
      sortKey: "PContact",
      render: (row: EnquiryFollowUpRow) => row.pContact || "—",
    },
    {
      key: "callBackDate",
      header: "Call Back Date",
      width: 140,
      sortable: true,
      sortKey: "CallBackDate",
      render: (row: EnquiryFollowUpRow) => toDisplayDate(row.callBackDate),
    },
    {
      key: "lastCalledDate",
      header: "Last Called Date",
      width: 150,
      sortable: true,
      sortKey: "FollowDate",
      render: (row: EnquiryFollowUpRow) => toDisplayDate(row.followDate),
    },
    {
      key: "callbackTime",
      header: "Call Back Time",
      width: 140,
      sortable: true,
      sortKey: "callbackTime",
      render: (row: EnquiryFollowUpRow) => toDisplayTime(row.callbackTime),
    },
    {
      key: "remark",
      header: "Remark",
      width: 220,
      render: (row: EnquiryFollowUpRow) => row.remark || "—",
    },
    {
      key: "action",
      header: "Action",
      width: 200,
      render: (row: EnquiryFollowUpRow) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded bg-[#0F4C81] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0b3c66]"
            onClick={() => openFollowUpModal(row)}
          >
            Add Follow Up
          </button>
          <button
            type="button"
            className="rounded border border-[#dfe7ef] bg-white px-3 py-1.5 text-xs font-medium text-[#0F4C81] hover:bg-slate-50"
            onClick={() => openHistoryModal(row)}
          >
            History
          </button>
        </div>
      ),
    },
  ];

  const startEntry = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="space-y-5 bg-[#f2f6fb] px-1 py-3">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <button type="button" onClick={() => navigate("/dashboard")} className="hover:text-[#0F4C81]">
          Dashboard
        </button>
        <span>/</span>
        <button type="button" onClick={() => navigate("/enquiry/list")} className="hover:text-[#0F4C81]">
          Enquiry Management
        </button>
        <span>/</span>
        <span className="font-medium text-[#0F4C81]">Enquiry Follow Up</span>
      </div>

      <div className="rounded-xl border border-[#dfe7ef] bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#102a43]">
              Enquiry Follow Up
            </h1>
            <p className="mt-1 text-base text-slate-500">
              Track, manage and follow up with student enquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/enquiry/add")}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F4C81] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0b3c66]"
            >
              <Plus className="h-4 w-4" />
              Add Enquiry
            </button>
            <button
              type="button"
              onClick={exportCurrentRows}
              className="inline-flex items-center gap-2 rounded-lg border border-[#dfe7ef] bg-white px-4 py-2.5 text-sm font-medium text-[#0F4C81] shadow-sm transition hover:bg-slate-50"
            >
              <CalendarDays className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#dfe7ef] bg-white p-4">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.studentName}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, studentName: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Search by first name, middle name or last name..."
                className="w-full rounded-md border border-[#dfe7ef] bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-[#0F4C81]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex items-center gap-2 rounded-md bg-[#0F4C81] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0b3c66]"
              >
                <Search className="h-4 w-4" />
                Search
              </button>

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-md border border-[#dfe7ef] bg-white px-4 py-2.5 text-sm font-medium text-[#0F4C81] hover:bg-slate-50"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="rounded-md border border-[#dfe7ef] bg-white px-4 py-2.5 text-sm font-medium text-[#0F4C81] hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Search by</span>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={searchMode === "firstName"}
                onChange={() => setSearchMode("firstName")}
                className="h-4 w-4 border-slate-300 text-[#0F4C81] focus:ring-[#0F4C81]"
              />
              First Name
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={searchMode === "lastName"}
                onChange={() => setSearchMode("lastName")}
                className="h-4 w-4 border-slate-300 text-[#0F4C81] focus:ring-[#0F4C81]"
              />
              Last Name
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Search by first letter</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FIRST_LETTERS.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setSelectedLetter((prev) => (prev === letter ? "" : letter))}
                  className={`h-8 w-8 rounded-md border text-xs font-medium transition ${
                    selectedLetter === letter
                      ? "border-[#0F4C81] bg-[#0F4C81] text-white"
                      : "border-[#dfe7ef] bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {showFilters && (
            <div className="mt-5 rounded-2xl border border-[#dfe7ef] bg-white p-4 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Category</label>
                  <select
                    value={filters.category}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, category: Number(event.target.value) }))
                    }
                    className="w-full rounded-lg border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                  >
                    <option value={0}>All</option>
                    <option value={1}>Enquiry</option>
                    <option value={2}>Registration</option>
                    <option value={3}>Pending Callback</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Enquiry status</label>
                  <select
                    value={filters.enqStatus}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, enqStatus: Number(event.target.value) }))
                    }
                    className="w-full rounded-lg border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                  >
                    <option value={0}>All</option>
                    {followUpStatusOptions.map((status) => (
                      <option key={status.value} value={Number(status.value)}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Enquiry from</label>
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, fromDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Enquiry to</label>
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, toDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Callback from</label>
                  <input
                    type="date"
                    value={filters.callbackFromDate}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, callbackFromDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Callback to</label>
                  <input
                    type="date"
                    value={filters.callbackToDate}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, callbackToDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Filter on</label>
                  <select
                    value={filters.filterOn}
                    onChange={(event) =>
                      setFilters((prev) => ({ ...prev, filterOn: Number(event.target.value) }))
                    }
                    className="w-full rounded-lg border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                  >
                    <option value={1}>Callback Date</option>
                    <option value={2}>Follow Date</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Course</label>
                  <div className="max-h-28 overflow-y-auto rounded-lg border border-[#dfe7ef] bg-white p-2">
                    {courseOptions.length === 0 ? (
                      <div className="text-xs text-slate-400">No course options</div>
                    ) : (
                      courseOptions.map((course) => {
                        const selectedCourseIds = parseCommaSeparatedIds(filters.courseIds);
                        const checked = selectedCourseIds.includes(course.courseId);

                        return (
                          <label key={course.courseId} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCourseSelection(course.courseId)}
                              className="h-4 w-4 rounded border-slate-300 text-[#0F4C81] focus:ring-[#0F4C81]"
                            />
                            {course.courseName}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Subject</label>
                  <div className="max-h-28 overflow-y-auto rounded-lg border border-[#dfe7ef] bg-white p-2">
                    {subjectOptions.length === 0 ? (
                      <div className="text-xs text-slate-400">No subject options</div>
                    ) : (
                      subjectOptions.map((subject) => {
                        const selectedSubjectIds = parseCommaSeparatedIds(filters.subjectIds);
                        const checked = selectedSubjectIds.includes(subject.id);

                        return (
                          <label key={subject.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSubjectSelection(subject.id)}
                              className="h-4 w-4 rounded border-slate-300 text-[#0F4C81] focus:ring-[#0F4C81]"
                            />
                            {subject.name}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-end">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFilters(false);
                        setCurrentPage(1);
                        loadRows(filters, 1, sortBy, sortDirection, pageSize);
                      }}
                      className="rounded-lg bg-[#0F4C81] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0b3c66]"
                    >
                      Apply filters
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="rounded-lg border border-[#dfe7ef] bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#dfe7ef] bg-white p-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#dfe7ef] bg-white px-4 py-4">
          <h2 className="text-2xl font-semibold text-[#102a43]">Enquiry Follow Ups</h2>
          <span className="text-sm text-slate-500">
            Showing {totalRecords === 0 ? 0 : startEntry}–{endEntry} of {totalRecords}
          </span>
        </div>

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            Loading enquiry follow-ups...
          </div>
        ) : (
          <>
            <DataTable
              columns={columns as any}
              data={paginatedRows}
              rowKey="regNo"
              emptyMessage="No enquiry follow-up records found."
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />

            <div className="flex flex-col gap-3 border-t border-[#dfe7ef] bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-600">Page {Math.min(currentPage, totalPages)} of {totalPages}</div>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  className={`rounded-md border px-2 py-1.5 text-sm ${
                    currentPage === 1
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-[#dfe7ef] bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center rounded-md border px-2 py-1.5 text-sm ${
                    currentPage === 1
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-[#dfe7ef] bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>

                <span className="min-w-9 rounded-md bg-[#0F4C81] px-2 py-1.5 text-center text-sm font-medium text-white">
                  {Math.min(currentPage, totalPages)}
                </span>

                <button
                  type="button"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`inline-flex items-center rounded-md border px-2 py-1.5 text-sm ${
                    currentPage >= totalPages
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-[#dfe7ef] bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage >= totalPages}
                  className={`rounded-md border px-2 py-1.5 text-sm ${
                    currentPage >= totalPages
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-[#dfe7ef] bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Last
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Page size</span>
                <select
                  value={pageSize}
                  onChange={(event) => onPageSizeChange(Number(event.target.value))}
                  className="rounded-md border border-[#dfe7ef] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#0F4C81]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {showFollowUpModal && selectedFollowUpRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#dfe7ef] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dfe7ef] px-5 py-4">
              <div>
                <h3 className="text-xl font-semibold text-[#102a43]">Add Follow Up</h3>
                <p className="text-sm text-slate-500">{selectedFollowUpRow.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFollowUpModal(false)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Follow-up status</label>
                <select
                  value={followUpForm.statusId}
                  onChange={(event) =>
                    setFollowUpForm((prev) => ({ ...prev, statusId: event.target.value }))
                  }
                  className="w-full rounded-md border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                >
                  <option value="">Select status</option>
                  {followUpStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Callback date</label>
                  <input
                    type="date"
                    value={followUpForm.callbackDate}
                    onChange={(event) =>
                      setFollowUpForm((prev) => ({ ...prev, callbackDate: event.target.value }))
                    }
                    className="w-full rounded-md border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Callback time</label>
                  <input
                    type="time"
                    value={followUpForm.callbackTime}
                    onChange={(event) =>
                      setFollowUpForm((prev) => ({ ...prev, callbackTime: event.target.value }))
                    }
                    className="w-full rounded-md border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={followUpForm.interested}
                  onChange={(event) =>
                    setFollowUpForm((prev) => ({ ...prev, interested: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#0F4C81] focus:ring-[#0F4C81]"
                />
                Interested
              </label>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Remark</label>
                <textarea
                  value={followUpForm.remarks}
                  onChange={(event) =>
                    setFollowUpForm((prev) => ({ ...prev, remarks: event.target.value }))
                  }
                  rows={5}
                  placeholder="Enter follow-up remarks"
                  className="w-full rounded-md border border-[#dfe7ef] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F4C81]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#dfe7ef] bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowFollowUpModal(false)}
                className="rounded-md border border-[#dfe7ef] bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFollowUp}
                disabled={isSubmittingFollowUp}
                className="rounded-md bg-[#0F4C81] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b3c66] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmittingFollowUp ? "Saving..." : "Save Follow Up"}
              </button>
            </div>
          </div>
        </div>
      )}

      {historyState.isOpen && historyState.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#dfe7ef] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dfe7ef] px-5 py-4">
              <div>
                <h3 className="text-xl font-semibold text-[#102a43]">Follow-up History</h3>
                <p className="text-sm text-slate-500">{historyState.student.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryState((prev) => ({ ...prev, isOpen: false, student: null, items: [] }))}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              {historyState.isLoading ? (
                <div className="py-6 text-center text-sm text-slate-500">Loading follow-up history...</div>
              ) : historyState.items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#dfe7ef] bg-slate-50 py-8 text-center text-sm text-slate-500">
                  No previous follow-up remarks found for this student.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyState.items.map((item) => (
                    <div key={item.callId} className="rounded-xl border border-[#dfe7ef] bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#102a43]">{item.callDate || "—"}</div>
                          <div className="text-xs text-slate-500">{item.called_By || "System"}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteHistoryItem(item.callId)}
                          disabled={historyState.deletingCallId === item.callId}
                          className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {historyState.deletingCallId === item.callId ? "Deleting..." : "Delete"}
                        </button>
                      </div>

                      {(item.callbackDate || item.callbackTime) && (
                        <div className="mb-2 text-xs text-slate-500">
                          {item.callbackDate ? toDisplayDate(item.callbackDate) : "—"} / {item.callbackTime ? toDisplayTime(item.callbackTime) : "—"}
                        </div>
                      )}

                      <p className="text-sm leading-6 text-slate-700">{item.remarks || "No remarks provided."}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
