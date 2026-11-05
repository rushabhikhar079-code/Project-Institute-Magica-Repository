import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  X,
  ClipboardList,
  Upload,
  Trash2,
  Camera,
  Plus,
  User,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  DollarSign,
  Briefcase,
} from "lucide-react";

interface StudentRegistrationProps {
  setCurrentPage: (page: string) => void;
  branchName: string;
  mode?: "registration" | "enquiry";
}

const inp =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/25 focus:border-[#0F4C81] text-sm bg-white transition-all placeholder:text-gray-400";
const lbl =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

const STEPS = [
  { id: 0, label: "Registration & Personal", icon: User },
  { id: 1, label: "Academic", icon: BookOpen },
  { id: 2, label: "Family & Work", icon: Users },
  { id: 3, label: "Education", icon: GraduationCap },
  { id: 4, label: "Remarks", icon: FileText },
];

const COURSES = [
  { id: "c_neet", name: "NEET", description: "Medical Entrance" },
  {
    id: "c_jee",
    name: "JEE Main & Advanced",
    description: "Engineering Entrance",
  },
  { id: "c_foundation", name: "Foundation", description: "Class 8–10" },
  { id: "c_boards", name: "Board Preparation", description: "Class 11–12" },
  { id: "c_mba", name: "MBA", description: "Management Studies" },
  { id: "c_bba", name: "BBA", description: "Bachelor of Business" },
];

const SUBJECTS_BY_COURSE: Record<
  string,
  Array<{ id: string; name: string; fees: string }>
> = {
  c_neet: [
    { id: "s_physics", name: "Physics", fees: "Excl. Tax ₹10,000" },
    { id: "s_chemistry", name: "Chemistry", fees: "Excl. Tax ₹8,000" },
    { id: "s_biology", name: "Biology", fees: "Excl. Tax ₹9,000" },
  ],
  c_jee: [
    { id: "s_math", name: "Mathematics", fees: "Excl. Tax ₹10,000" },
    { id: "s_phy", name: "Physics", fees: "Excl. Tax ₹8,500" },
    { id: "s_chem", name: "Chemistry", fees: "Excl. Tax ₹8,000" },
  ],
  c_foundation: [
    { id: "s_sci", name: "Science", fees: "Excl. Tax ₹6,000" },
    { id: "s_maths", name: "Mathematics", fees: "Excl. Tax ₹6,000" },
    { id: "s_eng", name: "English", fees: "Excl. Tax ₹4,000" },
  ],
  c_boards: [
    { id: "s_pcm", name: "PCM Group", fees: "Excl. Tax ₹12,000" },
    { id: "s_pcb", name: "PCB Group", fees: "Excl. Tax ₹12,000" },
    { id: "s_comm", name: "Commerce", fees: "Excl. Tax ₹10,000" },
  ],
  c_mba: [
    { id: "s_qant", name: "Quantitative Aptitude", fees: "Excl. Tax ₹7,000" },
    { id: "s_verbal", name: "Verbal Ability", fees: "Excl. Tax ₹5,000" },
    { id: "s_gk", name: "General Knowledge", fees: "Excl. Tax ₹3,000" },
  ],
  c_bba: [
    { id: "s_acc", name: "Accountancy", fees: "Excl. Tax ₹7,000" },
    { id: "s_econ", name: "Economics", fees: "Excl. Tax ₹6,000" },
    { id: "s_biz", name: "Business Studies", fees: "Excl. Tax ₹5,000" },
  ],
};

const BATCHES_BY_COURSE: Record<
  string,
  Array<{ id: string; name: string; timing: string; seats: string }>
> = {
  c_neet: [
    {
      id: "b1",
      name: "NEET Morning Batch",
      timing: "7:00 AM – 10:00 AM",
      seats: "12 left",
    },
    {
      id: "b2",
      name: "NEET Afternoon Batch",
      timing: "12:00 PM – 3:00 PM",
      seats: "5 left",
    },
    {
      id: "b3",
      name: "NEET Weekend Batch",
      timing: "Sat–Sun 9:00 AM – 1:00 PM",
      seats: "20 left",
    },
  ],
  c_jee: [
    {
      id: "b4",
      name: "JEE Morning Batch",
      timing: "6:30 AM – 9:30 AM",
      seats: "8 left",
    },
    {
      id: "b5",
      name: "JEE Evening Batch",
      timing: "4:00 PM – 7:00 PM",
      seats: "15 left",
    },
  ],
  c_foundation: [
    {
      id: "b6",
      name: "Foundation Batch A",
      timing: "8:00 AM – 11:00 AM",
      seats: "18 left",
    },
    {
      id: "b7",
      name: "Foundation Batch B",
      timing: "3:00 PM – 6:00 PM",
      seats: "10 left",
    },
  ],
  c_boards: [
    {
      id: "b8",
      name: "Board Morning Batch",
      timing: "7:30 AM – 10:30 AM",
      seats: "14 left",
    },
    {
      id: "b9",
      name: "Board Evening Batch",
      timing: "5:00 PM – 8:00 PM",
      seats: "6 left",
    },
  ],
  c_mba: [
    {
      id: "b10",
      name: "MBA Weekend Batch",
      timing: "Sat–Sun 10:00 AM – 2:00 PM",
      seats: "22 left",
    },
  ],
  c_bba: [
    {
      id: "b11",
      name: "BBA Regular Batch",
      timing: "Mon–Fri 11:00 AM – 1:00 PM",
      seats: "16 left",
    },
  ],
};

export function StudentRegistration({
  setCurrentPage,
  branchName,
  mode = "registration",
}: StudentRegistrationProps) {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const lastUsedRegNumber = "REG005";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [studentImage, setStudentImage] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [showBatchTiming, setShowBatchTiming] = useState(false);

  // Academic - Combined Course and Subject Selection
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState<
    Record<string, string[]>
  >({});
  const [courseLevelFees, setCourseLevelFees] = useState<
    Record<string, boolean>
  >({});
  const [subjectLevelFees, setSubjectLevelFees] = useState<
    Record<string, boolean>
  >({});
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

  // Other Fees Assignment
  const [otherFees, setOtherFees] = useState<
    Array<{ id: string; name: string; amount: string }>
  >([]);

  // Education qualifications
  const [additionalQualifications, setAdditionalQualifications] = useState<
    Array<{
      id: string;
      classYearDegree: string;
      schoolCollege: string;
      stream: string;
      percentage: string;
    }>
  >([]);

  // Enquiry
  const [enquiryWalkIn, setEnquiryWalkIn] = useState(false);
  const [enquiryWalkInDate, setEnquiryWalkInDate] = useState("");
  const [enquiryFollowUp, setEnquiryFollowUp] = useState(false);
  const [enquiryFollowUpDate, setEnquiryFollowUpDate] = useState("");
  const [enquiryRemark, setEnquiryRemark] = useState("");
  const [enquiryInterested, setEnquiryInterested] = useState<
    "interested" | "notInterested" | ""
  >("");

  const [formData, setFormData] = useState({
    // Registration
    registrationDate: todayISO,
    registrationNumber: "",
    lastUsedRegNumber: lastUsedRegNumber,
    rollNo: "",
    enquiryStatus: "converted",
    status: "active",
    // Personal
    salutation: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    age: "",
    gender: "",
    category: "",
    email: "",
    contact: "",
    biometricId: "",
    howHeard: "",
    correspondenceAddress: "",
    country: "",
    state: "",
    city: "",
    otherCity: "",
    pinCode: "",
    permanentAddress: "",
    permanentCountry: "",
    permanentState: "",
    permanentCity: "",
    permanentOtherCity: "",
    permanentPinCode: "",
    // Family
    fatherFirstName: "",
    fatherMiddleName: "",
    fatherLastName: "",
    fatherContact: "",
    motherFirstName: "",
    motherMiddleName: "",
    motherLastName: "",
    motherContact: "",
    parentCompanyName: "",
    gstNumber: "",
    // Working Details
    isWorking: "no",
    companyName: "",
    designation: "",
    experienceYears: "",
    // Education
    classYearDegree: "",
    schoolCollege: "",
    stream: "",
    percentage: "",
    // Academic
    batch: "",
    // Remarks
    remarks: "",
  });

  const set = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Auto-calculate age from DOB
  useEffect(() => {
    if (formData.dob) {
      const birth = new Date(formData.dob);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      set("age", String(age >= 0 ? age : ""));
    }
  }, [formData.dob]);

  const handleSameAsPermanent = (checked: boolean) => {
    setSameAsPermanent(checked);
    if (checked)
      setFormData((prev) => ({
        ...prev,
        permanentAddress: prev.correspondenceAddress,
        permanentCountry: prev.country,
        permanentState: prev.state,
        permanentCity: prev.city,
        permanentOtherCity: prev.otherCity,
        permanentPinCode: prev.pinCode,
      }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setStudentImage(r.result as string);
      r.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setStudentImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    stopWebcam();
    setShowWebcam(false);
  };

  const handleWebcamCapture = async () => {
    if (showWebcam) {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);
          setStudentImage(canvasRef.current.toDataURL("image/png"));
          stopWebcam();
          setShowWebcam(false);
        }
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setShowWebcam(true);
      } catch {
        alert("Unable to access webcam.");
      }
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Toggle selection of a course and its subjects together
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseSubjects((prev) => {
      const next = { ...prev };
      if (next[courseId]) {
        delete next[courseId];
      } else {
        const defaultSubjects = (SUBJECTS_BY_COURSE[courseId] || []).map(
          (s) => s.id,
        );
        next[courseId] = defaultSubjects;
      }
      return next;
    });
  };

  const toggleSubjectForCourse = (courseId: string, subjectId: string) => {
    setSelectedCourseSubjects((prev) => {
      const current = prev[courseId] || [];
      const updated = current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId];
      return { ...prev, [courseId]: updated };
    });
  };

  const toggleBatch = (id: string) =>
    setSelectedBatches((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleAddOtherFee = () =>
    setOtherFees((prev) => [
      ...prev,
      { id: `fee-${Date.now()}`, name: "", amount: "" },
    ]);
  const handleRemoveOtherFee = (id: string) =>
    setOtherFees((prev) => prev.filter((f) => f.id !== id));
  const handleOtherFeeChange = (
    id: string,
    field: "name" | "amount",
    value: string,
  ) =>
    setOtherFees((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );

  const handleAddQualification = () =>
    setAdditionalQualifications((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        classYearDegree: "",
        schoolCollege: "",
        stream: "",
        percentage: "",
      },
    ]);
  const handleRemoveQualification = (id: string) =>
    setAdditionalQualifications((prev) => prev.filter((q) => q.id !== id));
  const handleQualChange = (id: string, field: string, value: string) =>
    setAdditionalQualifications((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );

  // Active courses based on selection
  const selectedCourseIds = Object.keys(selectedCourseSubjects);

  // ─── STEP 0: Registration + Personal ────────────────────────────────────

  const StepRegistrationPersonal = () => (
    <div className="space-y-5">
      {/* Registration Details Card */}
      <Card>
        <CardHeader icon={FileText} title="Registration Details" />

        {mode === "registration" && (
          /* Re-ordered fields: First registration date, then registration no, then last used registration no */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <F label="Registration Date *">
              <input
                type="date"
                value={formData.registrationDate}
                onChange={(e) => set("registrationDate", e.target.value)}
                className={inp}
              />
            </F>
            <F label="Registration Number *">
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => set("registrationNumber", e.target.value)}
                className={inp}
                placeholder="e.g. REG006"
              />
            </F>
            <F label="Last Used Reg. No.">
              <input
                type="text"
                value={formData.lastUsedRegNumber}
                onChange={(e) => set("lastUsedRegNumber", e.target.value)}
                className={inp}
                placeholder="e.g. REG005"
              />
            </F>
            <F label="Roll Number">
              <input
                type="text"
                value={formData.rollNo}
                onChange={(e) => set("rollNo", e.target.value)}
                className={inp}
                placeholder="Roll number"
              />
            </F>
            <F label="Student Status">
              <select
                value={formData.status}
                onChange={(e) => set("status", e.target.value)}
                className={inp}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </F>
          </div>
        )}

        {mode === "enquiry" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <F label="Registration Date *">
                <input
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => set("registrationDate", e.target.value)}
                  className={inp}
                />
              </F>
              <F label="Enquiry Status">
                <select
                  value={formData.enquiryStatus}
                  onChange={(e) => set("enquiryStatus", e.target.value)}
                  className={inp}
                >
                  <option value="converted">Converted</option>
                  <option value="interested">Interested</option>
                  <option value="notInterested">Not Interested</option>
                  <option value="pending">Pending</option>
                </select>
              </F>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wide mb-3">
                Enquiry Tracking
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div>
                  <CB
                    label="Walk-in"
                    checked={enquiryWalkIn}
                    onChange={setEnquiryWalkIn}
                  />
                  {enquiryWalkIn && (
                    <input
                      type="date"
                      value={enquiryWalkInDate}
                      onChange={(e) => setEnquiryWalkInDate(e.target.value)}
                      className={`${inp} mt-2`}
                    />
                  )}
                </div>
                <div>
                  <CB
                    label="Follow Up"
                    checked={enquiryFollowUp}
                    onChange={setEnquiryFollowUp}
                  />
                  {enquiryFollowUp && (
                    <input
                      type="date"
                      value={enquiryFollowUpDate}
                      onChange={(e) => setEnquiryFollowUpDate(e.target.value)}
                      className={`${inp} mt-2`}
                    />
                  )}
                </div>
                <div>
                  <p className={lbl}>Interest Status</p>
                  <div className="flex flex-col gap-1.5">
                    <CB
                      label="Interested"
                      checked={enquiryInterested === "interested"}
                      onChange={(v) =>
                        setEnquiryInterested(v ? "interested" : "")
                      }
                    />
                    <CB
                      label="Not Interested"
                      checked={enquiryInterested === "notInterested"}
                      onChange={(v) =>
                        setEnquiryInterested(v ? "notInterested" : "")
                      }
                    />
                  </div>
                </div>
              </div>
              <F label="Enquiry Remark">
                <textarea
                  value={enquiryRemark}
                  onChange={(e) => setEnquiryRemark(e.target.value)}
                  rows={2}
                  className={`${inp} resize-none`}
                  placeholder="Remarks…"
                />
              </F>
            </div>
          </>
        )}
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader icon={User} title="Personal Information" />

        {/* Photo + basic identity row */}
        <div className="flex flex-col sm:flex-row gap-5 items-start mb-6 pb-6 border-b border-gray-100">
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
            {studentImage ? (
              <img
                src={studentImage}
                alt="Student"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-gray-300">
                <Upload className="w-7 h-7 mx-auto mb-1" />
                <span className="text-[10px]">No photo</span>
              </div>
            )}
            {studentImage && (
              <button
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-start pt-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <ABtn
              icon={<Upload className="w-3.5 h-3.5" />}
              label="Browse"
              onClick={() => fileInputRef.current?.click()}
            />
            <ABtn
              icon={<Camera className="w-3.5 h-3.5" />}
              label={showWebcam ? "Capture" : "Webcam"}
              onClick={handleWebcamCapture}
            />
            {showWebcam && (
              <div className="w-48 h-36 rounded-xl overflow-hidden border border-gray-200 bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Contact details positioned ABOVE Identity section */}
        <GroupLabel label="Contact Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <F label="Contact Number *">
            <input
              type="tel"
              value={formData.contact}
              onChange={(e) => set("contact", e.target.value)}
              className={inp}
              placeholder="+91 9876543210"
            />
          </F>
          <F label="Email">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => set("email", e.target.value)}
              className={inp}
              placeholder="email@example.com"
            />
          </F>
        </div>

        {/* Salutation + Gender on one line (Salutation optional); First, Middle, Last Name on one line (Last Name optional) */}
        <GroupLabel label="Name & Salutation" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <F label="Salutation">
            <select
              value={formData.salutation}
              onChange={(e) => set("salutation", e.target.value)}
              className={inp}
            >
              <option value="">Select (Optional)</option>
              <option value="Mr">Mr.</option>
              <option value="Mrs">Mrs.</option>
              <option value="Ms">Ms.</option>
              <option value="Dr">Dr.</option>
              <option value="Prof">Prof.</option>
            </select>
          </F>
          <F label="Gender *">
            <select
              value={formData.gender}
              onChange={(e) => set("gender", e.target.value)}
              className={inp}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </F>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <F label="First Name *">
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className={inp}
              placeholder="First name"
            />
          </F>
          <F label="Middle Name">
            <input
              type="text"
              value={formData.middleName}
              onChange={(e) => set("middleName", e.target.value)}
              className={inp}
              placeholder="Middle name"
            />
          </F>
          <F label="Last Name">
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className={inp}
              placeholder="Last name (Optional)"
            />
          </F>
        </div>

        {/* Identity Section: DOB and Category not compulsory */}
        <GroupLabel label="Identity" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <F label="Date of Birth">
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => set("dob", e.target.value)}
              className={inp}
            />
          </F>
          <F label="Age">
            <input
              type="number"
              value={formData.age}
              onChange={(e) => set("age", e.target.value)}
              className={inp}
              placeholder="Auto-calculated"
              min={0}
              max={100}
            />
          </F>
          <F label="Category">
            <select
              value={formData.category}
              onChange={(e) => set("category", e.target.value)}
              className={inp}
            >
              <option value="">Select Category (Optional)</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </F>
          <F label="Biometric ID">
            <input
              type="text"
              value={formData.biometricId}
              onChange={(e) => set("biometricId", e.target.value)}
              className={inp}
              placeholder="Biometric ID"
            />
          </F>
        </div>

        {/* Addresses */}
        <div className="mt-2 pt-5 border-t border-gray-100">
          <Divider label="Correspondence Address" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div className="sm:col-span-2">
              <F label="Street / Locality">
                <input
                  type="text"
                  value={formData.correspondenceAddress}
                  onChange={(e) => set("correspondenceAddress", e.target.value)}
                  className={inp}
                  placeholder="Street, area, locality"
                />
              </F>
            </div>
            <F label="Country">
              <input
                type="text"
                value={formData.country}
                onChange={(e) => set("country", e.target.value)}
                className={inp}
                placeholder="Country"
              />
            </F>
            <F label="State">
              <input
                type="text"
                value={formData.state}
                onChange={(e) => set("state", e.target.value)}
                className={inp}
                placeholder="State"
              />
            </F>
            <F label="City">
              <select
                value={formData.city}
                onChange={(e) => set("city", e.target.value)}
                className={inp}
              >
                <option value="">Select City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Other">Other</option>
              </select>
            </F>
            {formData.city === "Other" && (
              <F label="Specify Other City">
                <input
                  type="text"
                  value={formData.otherCity}
                  onChange={(e) => set("otherCity", e.target.value)}
                  className={inp}
                  placeholder="Enter city name"
                />
              </F>
            )}
            <F label="Pin Code">
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) => set("pinCode", e.target.value)}
                className={inp}
                placeholder="Pin code"
              />
            </F>
          </div>

          <label className="flex items-center gap-2 cursor-pointer my-4">
            <input
              type="checkbox"
              checked={sameAsPermanent}
              onChange={(e) => handleSameAsPermanent(e.target.checked)}
              className="w-4 h-4 accent-[#0F4C81] rounded"
            />
            <span className="text-sm text-gray-600">
              Permanent address same as correspondence address
            </span>
          </label>

          <Divider label="Permanent Address" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <F label="Street / Locality">
                <input
                  type="text"
                  value={formData.permanentAddress}
                  onChange={(e) => set("permanentAddress", e.target.value)}
                  className={inp}
                  placeholder="Street, area, locality"
                />
              </F>
            </div>
            <F label="Country">
              <input
                type="text"
                value={formData.permanentCountry}
                onChange={(e) => set("permanentCountry", e.target.value)}
                className={inp}
                placeholder="Country"
              />
            </F>
            <F label="State">
              <input
                type="text"
                value={formData.permanentState}
                onChange={(e) => set("permanentState", e.target.value)}
                className={inp}
                placeholder="State"
              />
            </F>
            <F label="City">
              <select
                value={formData.permanentCity}
                onChange={(e) => set("permanentCity", e.target.value)}
                className={inp}
              >
                <option value="">Select City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Other">Other</option>
              </select>
            </F>
            {formData.permanentCity === "Other" && (
              <F label="Specify Other City">
                <input
                  type="text"
                  value={formData.permanentOtherCity}
                  onChange={(e) => set("permanentOtherCity", e.target.value)}
                  className={inp}
                  placeholder="Enter city name"
                />
              </F>
            )}
            <F label="Pin Code">
              <input
                type="text"
                value={formData.permanentPinCode}
                onChange={(e) => set("permanentPinCode", e.target.value)}
                className={inp}
                placeholder="Pin code"
              />
            </F>
          </div>
        </div>
      </Card>
    </div>
  );

  // ─── STEP 1: Academic ────────────────────────────────────────────────────

  const StepAcademic = () => (
    <div className="space-y-5">
      {/* Integrated Course and Subject Selection with Scroller */}
      <Card>
        <CardHeader icon={BookOpen} title="Course & Subject Selection" />
        <p className="text-xs text-gray-400 mb-4">
          Select course(s) and their associated subjects directly below.
        </p>

        {/* Scrollable Container for N courses */}
        <div className="max-h-[420px] overflow-y-auto pr-2 space-y-4 border border-gray-100 rounded-xl p-3 bg-gray-50/50">
          {COURSES.map((course) => {
            const isCourseSelected = !!selectedCourseSubjects[course.id];
            const activeSubjects = selectedCourseSubjects[course.id] || [];
            const courseSubjects = SUBJECTS_BY_COURSE[course.id] || [];

            return (
              <div
                key={course.id}
                className={`rounded-xl border-2 transition-all p-4 bg-white ${
                  isCourseSelected
                    ? "border-[#0F4C81] shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCourseSelected}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="w-5 h-5 accent-[#0F4C81] rounded"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {course.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {course.description}
                      </p>
                    </div>
                  </label>

                  {/* Course Level Fee Option */}
                  {isCourseSelected && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#0F4C81]">
                      <input
                        type="checkbox"
                        checked={!!courseLevelFees[course.id]}
                        onChange={(e) =>
                          setCourseLevelFees((prev) => ({
                            ...prev,
                            [course.id]: e.target.checked,
                          }))
                        }
                        className="w-3.5 h-3.5 accent-[#0F4C81] rounded"
                      />
                      Course Flat Fee
                    </label>
                  )}
                </div>

                {/* Inline Subjects List for Selected Course */}
                {isCourseSelected && courseSubjects.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 pl-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {courseSubjects.map((sub) => {
                      const isSubSelected = activeSubjects.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
                            isSubSelected
                              ? "border-[#0F4C81]/40 bg-[#0F4C81]/5"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={isSubSelected}
                              onChange={() =>
                                toggleSubjectForCourse(course.id, sub.id)
                              }
                              className="w-4 h-4 accent-[#0F4C81] rounded"
                            />
                            <span className="text-xs font-medium text-gray-800">
                              {sub.name}
                            </span>
                          </label>
                          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/50">
                            <span>{sub.fees}</span>
                            <label className="flex items-center gap-1 cursor-pointer text-[10px]">
                              <input
                                type="checkbox"
                                checked={!!subjectLevelFees[sub.id]}
                                onChange={(e) =>
                                  setSubjectLevelFees((prev) => ({
                                    ...prev,
                                    [sub.id]: e.target.checked,
                                  }))
                                }
                                disabled={!isSubSelected}
                                className="w-3 h-3 accent-[#0F4C81] rounded"
                              />
                              Fee
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Batch Section with Show Batch Timing Link */}
      {selectedCourseIds.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardHeader icon={BookOpen} title="Batch Selection" />
            <button
              type="button"
              onClick={() => setShowBatchTiming((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-semibold text-[#0F4C81] hover:underline"
            >
              <Clock className="w-3.5 h-3.5" />
              {showBatchTiming ? "Hide Batch Timing" : "Show Batch Timing"}
            </button>
          </div>

          <div className="space-y-3">
            {selectedCourseIds.map((cId) => {
              const courseBatches = BATCHES_BY_COURSE[cId] || [];
              const courseName = COURSES.find((c) => c.id === cId)?.name;
              return (
                <div
                  key={cId}
                  className="border border-gray-100 rounded-xl p-3 bg-gray-50"
                >
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    {courseName} Batches
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {courseBatches.map((batch) => {
                      const picked = selectedBatches.includes(batch.id);
                      return (
                        <label
                          key={batch.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            picked
                              ? "border-[#0F4C81] bg-white shadow-sm"
                              : "border-gray-200 bg-white hover:border-[#0F4C81]/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={picked}
                            onChange={() => toggleBatch(batch.id)}
                            className="w-4 h-4 mt-0.5 accent-[#0F4C81] rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800">
                              {batch.name}
                            </p>
                            {showBatchTiming && (
                              <p className="text-xs font-medium text-[#0F4C81] mt-0.5">
                                Timing: {batch.timing}
                              </p>
                            )}
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {batch.seats}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Provision to Show and Assign Other Fees */}
      <Card>
        <CardHeader icon={DollarSign} title="Assign Other Fees" />
        <p className="text-xs text-gray-400 mb-4">
          Add and assign additional fees (e.g., Admission Fee, Library Fee,
          Uniform Fee) to this registration.
        </p>

        {otherFees.map((fee, index) => (
          <div key={fee.id} className="flex items-center gap-3 mb-3">
            <input
              type="text"
              value={fee.name}
              onChange={(e) =>
                handleOtherFeeChange(fee.id, "name", e.target.value)
              }
              className={inp}
              placeholder={`Fee Name e.g. Library Fee #${index + 1}`}
            />
            <input
              type="number"
              value={fee.amount}
              onChange={(e) =>
                handleOtherFeeChange(fee.id, "amount", e.target.value)
              }
              className={inp}
              placeholder="Amount (₹)"
            />
            <button
              type="button"
              onClick={() => handleRemoveOtherFee(fee.id)}
              className="p-2 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddOtherFee}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0F4C81] border border-[#0F4C81]/40 rounded-lg hover:bg-[#0F4C81]/5 transition-colors mt-2"
        >
          <Plus className="w-3.5 h-3.5" /> Add Other Fee
        </button>
      </Card>
    </div>
  );

  // ─── STEP 2: Family & Work Details ───────────────────────────────────────

  const StepFamily = () => (
    <div className="space-y-5">
      <Card>
        <CardHeader icon={Users} title="Family Details" />

        <GroupBadge color="blue" label="Father" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <F label="First Name">
            <input
              type="text"
              value={formData.fatherFirstName}
              onChange={(e) => set("fatherFirstName", e.target.value)}
              className={inp}
              placeholder="First name"
            />
          </F>
          <F label="Middle Name">
            <input
              type="text"
              value={formData.fatherMiddleName}
              onChange={(e) => set("fatherMiddleName", e.target.value)}
              className={inp}
              placeholder="Middle name"
            />
          </F>
          <F label="Last Name">
            <input
              type="text"
              value={formData.fatherLastName}
              onChange={(e) => set("fatherLastName", e.target.value)}
              className={inp}
              placeholder="Last name"
            />
          </F>
          <F label="Contact Number">
            <input
              type="tel"
              value={formData.fatherContact}
              onChange={(e) => set("fatherContact", e.target.value)}
              className={inp}
              placeholder="+91 9876543210"
            />
          </F>
        </div>

        <DotSep />

        <GroupBadge color="rose" label="Mother" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <F label="First Name">
            <input
              type="text"
              value={formData.motherFirstName}
              onChange={(e) => set("motherFirstName", e.target.value)}
              className={inp}
              placeholder="First name"
            />
          </F>
          <F label="Middle Name">
            <input
              type="text"
              value={formData.motherMiddleName}
              onChange={(e) => set("motherMiddleName", e.target.value)}
              className={inp}
              placeholder="Middle name"
            />
          </F>
          <F label="Last Name">
            <input
              type="text"
              value={formData.motherLastName}
              onChange={(e) => set("motherLastName", e.target.value)}
              className={inp}
              placeholder="Last name"
            />
          </F>
          <F label="Contact Number">
            <input
              type="tel"
              value={formData.motherContact}
              onChange={(e) => set("motherContact", e.target.value)}
              className={inp}
              placeholder="+91 9876543210"
            />
          </F>
        </div>

        {/* Parent Company Name added */}
        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Parent Company Name">
              <input
                type="text"
                value={formData.parentCompanyName}
                onChange={(e) => set("parentCompanyName", e.target.value)}
                className={inp}
                placeholder="Parent company / Employer name"
              />
            </F>
            <F label="GST Number (if applicable)">
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => set("gstNumber", e.target.value)}
                className={inp}
                placeholder="Enter GST number"
              />
            </F>
          </div>
        </div>
      </Card>

      {/* Working Details Section added */}
      <Card>
        <CardHeader icon={Briefcase} title="Working Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <F label="Currently Working?">
            <select
              value={formData.isWorking}
              onChange={(e) => set("isWorking", e.target.value)}
              className={inp}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </F>
          {formData.isWorking === "yes" && (
            <>
              <F label="Company Name">
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  className={inp}
                  placeholder="Current Organization"
                />
              </F>
              <F label="Designation">
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => set("designation", e.target.value)}
                  className={inp}
                  placeholder="Job Title / Role"
                />
              </F>
              <F label="Experience (in Years)">
                <input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => set("experienceYears", e.target.value)}
                  className={inp}
                  placeholder="e.g. 2"
                />
              </F>
            </>
          )}
        </div>
      </Card>
    </div>
  );

  // ─── STEP 3: Education ───────────────────────────────────────────────────

  const StepEducation = () => (
    <Card>
      <CardHeader icon={GraduationCap} title="Educational Qualifications" />

      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Primary Qualification
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <F label="Class / Year / Degree">
            <input
              type="text"
              value={formData.classYearDegree}
              onChange={(e) => set("classYearDegree", e.target.value)}
              className={inp}
              placeholder="e.g. Class 12 / B.Sc."
            />
          </F>
          <F label="School / College">
            <input
              type="text"
              value={formData.schoolCollege}
              onChange={(e) => set("schoolCollege", e.target.value)}
              className={inp}
              placeholder="Institution name"
            />
          </F>
          <F label="Stream">
            <input
              type="text"
              value={formData.stream}
              onChange={(e) => set("stream", e.target.value)}
              className={inp}
              placeholder="e.g. Science / Commerce"
            />
          </F>
          <F label="Percentage / CGPA">
            <input
              type="text"
              value={formData.percentage}
              onChange={(e) => set("percentage", e.target.value)}
              className={inp}
              placeholder="e.g. 85% / 8.5"
            />
          </F>
        </div>
      </div>

      {additionalQualifications.map((q, i) => (
        <div
          key={q.id}
          className="p-4 rounded-xl border border-gray-100 bg-gray-50 mb-3 relative"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Additional Qualification {i + 1}
            </p>
            <button
              onClick={() => handleRemoveQualification(q.id)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Class / Year / Degree">
              <input
                type="text"
                value={q.classYearDegree}
                onChange={(e) =>
                  handleQualChange(q.id, "classYearDegree", e.target.value)
                }
                className={inp}
                placeholder="e.g. B.Sc."
              />
            </F>
            <F label="School / College">
              <input
                type="text"
                value={q.schoolCollege}
                onChange={(e) =>
                  handleQualChange(q.id, "schoolCollege", e.target.value)
                }
                className={inp}
                placeholder="Institution name"
              />
            </F>
            <F label="Stream">
              <input
                type="text"
                value={q.stream}
                onChange={(e) =>
                  handleQualChange(q.id, "stream", e.target.value)
                }
                className={inp}
                placeholder="Stream"
              />
            </F>
            <F label="Percentage / CGPA">
              <input
                type="text"
                value={q.percentage}
                onChange={(e) =>
                  handleQualChange(q.id, "percentage", e.target.value)
                }
                className={inp}
                placeholder="Score"
              />
            </F>
          </div>
        </div>
      ))}

      <button
        onClick={handleAddQualification}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0F4C81] border border-[#0F4C81]/40 rounded-lg hover:bg-[#0F4C81]/5 transition-colors mt-1"
      >
        <Plus className="w-4 h-4" /> Add Another Qualification
      </button>
    </Card>
  );

  // ─── STEP 4: Remarks ─────────────────────────────────────────────────────

  const StepRemarks = () => (
    <Card>
      <CardHeader icon={FileText} title="Additional Remarks" />
      <div className="max-w-lg space-y-4">
        {/* How did you hear about institute moved here */}
        <F label="How did you hear about the institute?">
          <select
            value={formData.howHeard}
            onChange={(e) => set("howHeard", e.target.value)}
            className={inp}
          >
            <option value="">Select source</option>
            <option value="social_media">Social Media</option>
            <option value="friend_referral">Friend / Referral</option>
            <option value="newspaper">Newspaper / Print Ad</option>
            <option value="hoardings">Hoardings / Banners</option>
            <option value="online_search">Online Search</option>
            <option value="tv_radio">TV / Radio</option>
            <option value="exhibition">Exhibition / Fair</option>
            <option value="walk_in">Direct Walk-in</option>
            <option value="other">Other</option>
          </select>
        </F>
        <F label="Notes / Remarks">
          <textarea
            value={formData.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            rows={5}
            className={`${inp} resize-none`}
            placeholder="Any additional notes about this student…"
          />
        </F>
      </div>
    </Card>
  );

  const stepComponents = [
    StepRegistrationPersonal,
    StepAcademic,
    StepFamily,
    StepEducation,
    StepRemarks,
  ];
  const CurrentPanel = stepComponents[currentStep];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Top Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage("manageStudents")}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {mode === "enquiry" ? "Student Enquiry" : "Student Registration"}
            </h1>
            <p className="text-[11px] text-gray-400 leading-tight">
              {branchName} · Step {currentStep + 1}/{STEPS.length} —{" "}
              {STEPS[currentStep].label}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81]/10 text-[#0F4C81] rounded-lg hover:bg-[#0F4C81]/15 transition-colors text-sm font-medium">
          <ClipboardList className="w-4 h-4" />
          {mode === "enquiry" ? "Import Enquiry" : "Update from Enquiry"}
        </button>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-center">
        <div className="flex items-center justify-center w-full max-w-3xl mx-auto">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div
                key={step.id}
                className="flex items-center flex-1 last:flex-none justify-center"
              >
                <button
                  onClick={() => setCurrentStep(i)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all font-medium text-sm
                    ${done ? "bg-[#0F4C81] text-white" : active ? "bg-[#0F4C81] text-white ring-4 ring-[#0F4C81]/20" : "bg-gray-100 text-gray-400"}`}
                  >
                    {done ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold hidden sm:block leading-tight text-center max-w-[60px] ${active ? "text-[#0F4C81]" : done ? "text-gray-500" : "text-gray-300"}`}
                  >
                    {step.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${i < currentStep ? "bg-[#0F4C81]" : "bg-gray-200"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl mx-auto">
        <CurrentPanel />

        {/* Footer Nav */}
        <div className="flex items-center justify-between pt-4 mt-2">
          <button
            onClick={() => currentStep > 0 && setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage("manageStudents")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] transition-all shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage("manageStudents")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0c3d6a] transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />{" "}
                {mode === "enquiry" ? "Save Enquiry" : "Save & Pay"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {children}
    </div>
  );
}

function CardHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#0F4C81]" />
      </div>
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function GroupBadge({
  label,
  color,
}: {
  label: string;
  color: "blue" | "rose";
}) {
  const cls =
    color === "blue" ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-600";
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest ${cls}`}
      >
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function DotSep() {
  return (
    <div className="flex items-center gap-2 my-5">
      <div className="flex-1 h-px bg-gray-100" />
      {[0.2, 0.45, 1, 0.45, 0.2].map((o, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#0F4C81]"
          style={{ opacity: o }}
        />
      ))}
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function CB({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#0F4C81] rounded"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[11px] font-bold text-[#0F4C81] uppercase tracking-widest">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#0F4C81]/15" />
    </div>
  );
}

function ABtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-medium shadow-sm"
    >
      {icon} {label}
    </button>
  );
}
