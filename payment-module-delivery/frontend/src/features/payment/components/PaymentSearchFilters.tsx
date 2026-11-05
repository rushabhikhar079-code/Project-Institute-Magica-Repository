import React, { useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import type { PaymentSearchRequest } from "../paymentTypes";
import { SCHEDULE_STATUS } from "../paymentConstants";

interface PaymentSearchFiltersProps {
  onSearch: (request: PaymentSearchRequest) => void;
  onReset: () => void;
  branchId: number;
}

export const PaymentSearchFilters: React.FC<PaymentSearchFiltersProps> = ({
  onSearch,
  onReset,
  branchId,
}) => {
  const [studentName, setStudentName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [status, setStatus] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");

  const handleSearch = () => {
    onSearch({
      studentName,
      regNo,
      contactNo,
      curriculum,
      course,
      subject,
      paymentType: "",
      status: status as PaymentSearchRequest["status"],
      branchId,
      pageNumber: 1,
      pageSize: 10,
      sortBy: null,
      sortDirection: null,
    });
  };

  const handleReset = () => {
    setStudentName("");
    setRegNo("");
    setContactNo("");
    setStatus("");
    setCurriculum("");
    setCourse("");
    setSubject("");
    onReset();
  };

  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSearch();
  };

  return (
    <section className="pm-card pm-search-filters">
      <div className="pm-search-filters__title">SEARCH</div>
      <div className="pm-search-filters__grid">
        <div className="pm-form-group">
          <label className="pm-label">Student name</label>
          <input className="pm-input" placeholder="e.g .Rushabh" value={studentName} onChange={(event) => setStudentName(event.target.value)} onKeyDown={onEnter} />
        </div>
        <div className="pm-form-group">
          <label className="pm-label">Registration number</label>
          <input className="pm-input" placeholder="e.g.62736672636" value={regNo} onChange={(event) => setRegNo(event.target.value)} onKeyDown={onEnter} />
        </div>
        <div className="pm-form-group">
          <label className="pm-label">Contact No.</label>
          <input className="pm-input" placeholder="e.g. 7348737736" value={contactNo} onChange={(event) => setContactNo(event.target.value)} onKeyDown={onEnter} />
        </div>
        <div className="pm-form-group">
          <label className="pm-label">Status</label>
          <select className="pm-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Select Status</option>
            {SCHEDULE_STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="pm-form-group">
          <label className="pm-label">Curriculum</label>
          <select className="pm-select" value={curriculum} onChange={(event) => setCurriculum(event.target.value)}>
            <option value="">Search Curriculum</option>
            <option value="IIT-JEE">IIT-JEE</option>
            <option value="NEET">NEET</option>
          </select>
        </div>
        <div className="pm-form-group">
          <label className="pm-label">Course</label>
          <select className="pm-select" value={course} onChange={(event) => setCourse(event.target.value)}>
            <option value="">Select Course</option>
            <option value="Foundation">IIT-JEE Foundation</option>
            <option value="Advanced">IIT-JEE Advanced</option>
          </select>
        </div>
        <div className="pm-form-group">
          <label className="pm-label">Subject</label>
          <select className="pm-select" value={subject} onChange={(event) => setSubject(event.target.value)}>
            <option value="">Select Subject</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
        </div>
        <div className="pm-search-filters__actions">
          <button type="button" className="pm-btn pm-btn--secondary" onClick={handleReset}><RefreshCw className="w-4 h-4" />Reset</button>
          <button type="button" className="pm-btn pm-btn--primary" onClick={handleSearch}><Search className="w-4 h-4" />Search</button>
        </div>
      </div>
    </section>
  );
};
