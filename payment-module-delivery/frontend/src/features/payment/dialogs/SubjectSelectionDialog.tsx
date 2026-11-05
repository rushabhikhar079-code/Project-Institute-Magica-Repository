// ─── Subject Selection Dialog ──────────────────────────────────────────────────
// Modal wrapper for searching and selecting a student during schedule creation.
import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import type { StudentSearchResult, StudentSearchRequest, StudentSearchResponse } from "../paymentTypes";
import { searchStudentsMock } from "../paymentService";

interface SubjectSelectionDialogProps {
  open: boolean;
  branchId: number;
  onClose: () => void;
  onSelect: (student: StudentSearchResult) => void;
}

export const SubjectSelectionDialog: React.FC<SubjectSelectionDialogProps> = ({
  open,
  branchId,
  onClose,
  onSelect,
}) => {
  const [searchName, setSearchName] = useState("");
  const [searchReg, setSearchReg] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (open) {
      handleSearch();
    }
  }, [open]);

  if (!open) return null;

  const handleSearch = async (pageNum: number = 1) => {
    setLoading(true);
    setPage(pageNum);
    try {
      const request: StudentSearchRequest = {
        listType: "Registration",
        studentName: searchName,
        reg: searchReg,
        phone: searchPhone,
        regFrDate: "",
        regToDate: "",
        status: 2,
        branchId,
        pageNumber: pageNum,
        pageSize: 10,
        sortBy: null,
        sortDirection: null,
      };
      const response: StudentSearchResponse = await searchStudentsMock(request);
      setStudents(response.items);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-dialog-overlay" onClick={onClose}>
      <div className="pm-dialog pm-dialog--wide" onClick={(e) => e.stopPropagation()}>
        <div className="pm-dialog__header">
          <h3 className="pm-dialog__title">Select Student</h3>
          <button type="button" className="pm-dialog__close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pm-dialog__body">
          <div className="pm-dialog__search-row">
            <input
              type="text"
              className="pm-input"
              placeholder="Student name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <input
              type="text"
              className="pm-input"
              placeholder="Reg. No."
              value={searchReg}
              onChange={(e) => setSearchReg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <input
              type="text"
              className="pm-input"
              placeholder="Phone"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button type="button" className="pm-btn pm-btn--primary" onClick={() => handleSearch()}>
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {loading ? (
            <div className="pm-loading">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="pm-empty-state">
              <p className="pm-empty-state__text">No students found.</p>
            </div>
          ) : (
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Reg. No.</th>
                  <th>Phone</th>
                  <th>Courses</th>
                  <th style={{ width: "80px" }}></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.RegNo}
                    className="pm-table__selectable-row"
                    onClick={() => {
                      onSelect(student);
                      onClose();
                    }}
                  >
                    <td className="pm-text-semibold">{student.Name}</td>
                    <td>{student.RegNo_Manual || student.RegNo}</td>
                    <td>{student.PContact}</td>
                    <td>{student.CourseNames}</td>
                    <td className="pm-text-center">
                      <button
                        type="button"
                        className="pm-btn pm-btn--ghost pm-btn--sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(student);
                          onClose();
                        }}
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pm-pagination">
              <button
                type="button"
                className="pm-btn pm-btn--ghost pm-btn--sm"
                disabled={page <= 1}
                onClick={() => handleSearch(page - 1)}
              >
                Previous
              </button>
              <span className="pm-pagination__info">
                Page {page} of {totalPages} ({totalCount} results)
              </span>
              <button
                type="button"
                className="pm-btn pm-btn--ghost pm-btn--sm"
                disabled={page >= totalPages}
                onClick={() => handleSearch(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
