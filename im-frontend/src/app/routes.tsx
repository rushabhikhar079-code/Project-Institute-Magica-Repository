import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { AppLayout, useAppContext, PAGE_PATHS } from "./components/AppLayout";
import { Dashboard } from "./components/Dashboard";
import { ManageBranches } from "./components/ManageBranches";
import { ManageBranchess } from "./features/branches/pages/managebranches";
import { ManageCurriculum } from "./features/courses/ManageCurriculum/pages/ManageCurriculum";
import AddBranch from "./features/branches/pages/AddBranch";
import { ManageStudents } from "./components/ManageStudents";
import { StudentRegistration } from "./components/StudentRegistration";
import { ActivePayment } from "./components/ActivePayment";
import { PaymentProcessing } from "./components/PaymentProcessing";
import { LiveClasses } from "./components/LiveClasses";
import { Attendance } from "./components/Attendance";
import { UserProfile } from "./components/UserProfile";
import { EditProfile } from "./components/EditProfile";
import { ChangePassword } from "./components/ChangePassword";
import { AcademicReports } from "./components/AcademicReports";
import { PaymentReports } from "./components/PaymentReports";
import { BranchTestManagement } from "./components/BranchTestManagement";
import { TestCreation } from "./components/TestCreation";
import { TestCalendar } from "./components/TestCalendar";
import { TestMarksSheet } from "./components/TestMarksSheet";
import { TestOmrUpload } from "./components/TestOmrUpload";
import { TestOnline } from "./components/TestOnline";
import { TestResults } from "./components/TestResults";
import { TestSchedule } from "./components/TestSchedule";
import { InstituteRegistration } from "./components/InstituteRegistration";
import { ManageInstitutes } from "./components/ManageInstitutes";
import { ClockTable } from "./components/ClockTable";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { FranchiseOrderManagement } from "./components/Franchiseordermanagement";
import { FranchisePayment } from "./components/FranchisePayment";
import Login from "../app/features/auth/pages/Login";
import ResetPassword from "./features/auth/pages/ResetPassword";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import Register from "./components/Register";
import InstituteRegister from "./features/auth/pages/institute-register";
import ManageInstitutePageV2 from "./features/institutes/pages/manage-institutes";
import AddCurriculum from "./features/courses/ManageCurriculum/pages/AddCurriculum";
import InstCurriculums from "./features/courses/ManageCurriculum/pages/InstCurriculums";
import { ManageCourses } from "./features/courses/ManageCourses/pages/ManageCourses";
import InstCourses from "./features/courses/ManageCourses/pages/InstCourses";
import AddInstitute from "./features/institutes/pages/AddInstitute";
import AddCourses from "./features/courses/ManageCourses/pages/AddCourses";
import AddSubjects from "./features/courses/ManageSubjects/pages/AddSubject";
import { ManageSubjects } from "./features/courses/ManageSubjects/pages/ManageSubject";
import { InstSubjects } from "./features/courses/ManageSubjects/pages/InstSubject";
import { ManageTopics } from "./features/courses/ManageTopics/pages/ManageTopics";
import AddTopic from "./features/courses/ManageTopics/pages/AddTopics";
import ImportTopic from "./features/courses/ManageTopics/pages/ImportTopics";
import { InstTopics } from "./features/courses/ManageTopics/pages/InstTopics";
import AddEditStudyMaterial from "./features/courses/study-material/pages/AddEditStudyMaterial";
import ManageStudyMaterialPage from "./features/courses/study-material/pages/ManageStudyMaterials";
import ProtectedRoute from "./ProtectedRoutes";
import Unauthorized from "./components/common/Unauthorized";
import { ROLES } from "./constants/Roles";
import ExpCurriculums from "./features/courses/ManageCurriculum/pages/ExportCurriculum";
import ExpCourses from "./features/courses/ManageCourses/pages/ExportCourses";
import ExpSubjects from "./features/courses/ManageSubjects/pages/ExportSubject";
import ExpTopics from "./features/courses/ManageTopics/pages/ExportTopics";
import ExpStudyMaterial from "./features/courses/study-material/pages/ExportStudyMaterial";
import { InstStudyMaterial } from "./features/courses/study-material/pages/InstStudyMaterial";
import PaymentPreview from "./components/PaymentPreview";
// import { InstStudyMaterial } from "./features/courses/study-material/pages/InstStudyMaterial";
// ─── Page wrappers ────────────────────────────────────────────────────────────
// Each wrapper pulls selectedBranch + navigate from context and passes them
// to existing components as setCurrentPage / branchName props.
import Admission from "./features/students/admission/Admission";
import AddAdmission from "./features/students/admission/AddAdmission";
import AdmissionList from "./features/students/admission/AdmissionList";
import ImportAdmission from "./features/students/admission/ImportAdmission";
import Announcements from "./features/students/admission/Announcements";
import ManageDocument from "./features/students/admission/ManageDocument";
import Enquiry from "./features/students/enquiry/Enquiry";
import AddEnquiry from "./features/students/enquiry/AddEnquiry";
import EnquiryList from "./features/students/enquiry/EnquiryList";
function ManageBranchesPage() {
  const { navigate, setSelectedBranch } = useAppContext();
  return <ManageBranches />;
}
function ManageBranchessPage() {
  const { navigate, setSelectedBranch } = useAppContext();
  return (
    <ManageBranchess
      setCurrentPage={navigate}
      setSelectedBranch={setSelectedBranch}
    />
  );
}
function AddBranchPage() {
  return <AddBranch mode="add" />;
}

function EditBranchPage() {
  return <AddBranch mode="edit" />;
}
function ManageCurriculumPage() {
  const { navigate, setSelectedBranch } = useAppContext();
  return (
    <ManageCurriculum
      setCurrentPage={navigate}
      setSelectedCurriculum={setSelectedBranch}
    />
  );
}
function AddCurriculumPage() {
  return <AddCurriculum mode="add" />;
}

function EditCurriculumPage() {
  return <AddCurriculum mode="edit" />;
}
function InstCurriculumPage() {
  return <InstCurriculums />;
}
function ExpCurriculumPage() {
  return <ExpCurriculums />;
}

function ManageCoursePage() {
  const { navigate, setSelectedBranch } = useAppContext();
  return (
    <ManageCourses
      setCurrentPage={navigate}
      setSelectedCourse={setSelectedBranch}
    />
  );
}
function AddCoursePage() {
  return <AddCourses mode="add" />;
}

function EditCoursePage() {
  return <AddCourses mode="edit" />;
}
function InstCoursePage() {
  return <InstCourses />;
}
function ExpCoursePage() {
  return <ExpCourses />;
}
function ManageSubjectPage() {
  const { navigate, setSelectedBranch } = useAppContext();
  return (
    <ManageSubjects
      setCurrentPage={navigate}
      setSelectedSubject={setSelectedBranch}
    />
  );
}
function AddSubjectPage() {
  return <AddSubjects mode="add" />;
}
function EditSubjectPage() {
  return <AddSubjects mode="edit" />;
}
function InstSubjectPage() {
  return <InstSubjects />;
}
function ExpSubjectPage() {
  return <ExpSubjects />;
}
function ManageTopicPage() {
  const { navigate, setSelectedBranch } = useAppContext();

  return (
    <ManageTopics
      setCurrentPage={navigate}
      setSelectedTopic={setSelectedBranch}
    />
  );
}
function AddTopicPage() {
  return <AddTopic mode="add" />;
}
function EditTopicPage() {
  return <AddTopic mode="edit" />;
}
function ImportTopicPage() {
  return <ImportTopic />;
}
function ExportTopicPage() {
  return <ExpTopics />;
}
function ManageStudentsPage() {
  const { selectedBranch, navigate } = useAppContext();
  return (
    <ManageStudents
      branchName={selectedBranch}
      setCurrentPage={navigate}
      onNavigateToRegistration={() => navigate("studentRegistration")}
    />
  );
}

function StudentRegistrationPage() {
  const { selectedBranch, navigate } = useAppContext();
  return (
    <StudentRegistration
      branchName={selectedBranch}
      setCurrentPage={navigate}
      mode="registration"
    />
  );
}

function StudentEnquiryPage() {
  const { selectedBranch, navigate } = useAppContext();
  return (
    <StudentRegistration
      branchName={selectedBranch}
      setCurrentPage={navigate}
      mode="enquiry"
    />
  );
}

function ActivePaymentPage() {
  const { selectedBranch, navigate } = useAppContext();
  return (
    <ActivePayment branchName={selectedBranch} setCurrentPage={navigate} />
  );
}

function PaymentProcessingPage() {
  const { selectedBranch, navigate } = useAppContext();
  return (
    <PaymentProcessing branchName={selectedBranch} setCurrentPage={navigate} />
  );
}

function FranchisePaymentPage() {
  const { selectedBranch, navigate } = useAppContext();
  return (
    <FranchisePayment branchName={selectedBranch} setCurrentPage={navigate} />
  );
}

function LiveClassesPage() {
  const { selectedBranch, navigate } = useAppContext();
  return <LiveClasses branchName={selectedBranch} setCurrentPage={navigate} />;
}

function AttendancePage() {
  const { selectedBranch, navigate } = useAppContext();
  return <Attendance branchName={selectedBranch} setCurrentPage={navigate} />;
}

function UserProfilePage() {
  const { navigate } = useAppContext();
  return <UserProfile setCurrentPage={navigate} />;
}

function EditProfilePage() {
  const { navigate } = useAppContext();
  return <EditProfile setCurrentPage={navigate} />;
}

function ChangePasswordPage() {
  const { navigate } = useAppContext();
  return <ChangePassword setCurrentPage={navigate} />;
}

function BranchTestManagementPage() {
  const { selectedBranch, navigate } = useAppContext();
  return (
    <BranchTestManagement
      branchName={selectedBranch}
      setCurrentPage={navigate}
    />
  );
}

function TestCreationPage() {
  const { selectedBranch, navigate } = useAppContext();
  return <TestCreation branchName={selectedBranch} setCurrentPage={navigate} />;
}

function TestCalendarPage() {
  const { selectedBranch, navigate } = useAppContext();
  return <TestCalendar branchName={selectedBranch} setCurrentPage={navigate} />;
}

function TestMarksSheetPage() {
  const { selectedBranch, navigate } = useAppContext();
  return (
    <TestMarksSheet branchName={selectedBranch} setCurrentPage={navigate} />
  );
}

function TestOmrUploadPage() {
  const { selectedBranch, navigate } = useAppContext();
  return (
    <TestOmrUpload branchName={selectedBranch} setCurrentPage={navigate} />
  );
}

function TestOnlinePage() {
  const { selectedBranch, navigate } = useAppContext();
  return <TestOnline branchName={selectedBranch} setCurrentPage={navigate} />;
}

function TestResultsPage() {
  const { selectedBranch, navigate } = useAppContext();
  return <TestResults branchName={selectedBranch} setCurrentPage={navigate} />;
}

function TestSchedulePage() {
  const { selectedBranch, navigate } = useAppContext();
  return <TestSchedule branchName={selectedBranch} setCurrentPage={navigate} />;
}

function InstituteRegistrationPage() {
  const { navigate } = useAppContext();
  return <InstituteRegistration setCurrentPage={navigate} />;
}

function ManageInstitutesPage() {
  const { navigate } = useAppContext();
  return <ManageInstitutes setCurrentPage={navigate} />;
}

// function LoginPage() {
//   const rnav = useNavigate();
//   const nav = (page: string) =>
//     rnav(PAGE_PATHS[page] ?? `/${page}`);
//   return (
//     <Login
//       onForgotPassword={() => nav("resetPassword")}
//       onRequestDemo={() => nav("register")}
//     />
//   );
// }
function LoginPage() {
  const rnav = useNavigate();
  const nav = (page: string) => rnav(PAGE_PATHS[page] ?? `/${page}`);
  return (
    <Login
      onForgotPassword={() => nav("forgotPassword")}
      onRequestDemo={() => nav("institute-register")}
    />
  );
}

function ResetPasswordPage() {
  const rnav = useNavigate();
  const nav = (page: string) => rnav(PAGE_PATHS[page] ?? `/${page}`);
  return <ResetPassword setCurrentPage={nav} />;
}
function ForgotPasswordPage() {
  const rnav = useNavigate();
  const nav = (page: string) => rnav(PAGE_PATHS[page] ?? `/${page}`);
  return <ForgotPassword setCurrentPage={nav} />;
}

function AddInstitutePage() {
  return <AddInstitute mode="add" />;
}

function EditInstitutePage() {
  return <AddInstitute mode="edit" />;
}
function AddStudyMaterialPage() {
  return <AddEditStudyMaterial mode="add" />;
}

function EditStudyMaterialPage() {
  return <AddEditStudyMaterial mode="edit" />;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    { path: "/login", element: <LoginPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/register", element: <Register /> },
    { path: "/institute-register", element: <InstituteRegister /> },
    { path: "/payment-preview", element: <PaymentPreview /> },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "branches", element: <ManageBranchesPage /> },
            {
              path: "unauthorized",
              element: <Unauthorized />,
            },
            {
              path: "managebranches",
              element: <ManageBranchessPage />,
              children: [
                {
                  path: "add",
                  element: <AddBranchPage />,
                },
                {
                  path: "edit/:id",
                  element: <EditBranchPage />,
                },
              ],
            },
            {
              path: "managecurriculums",
              element: <ManageCurriculumPage />,
              children: [
                {
                  path: "add",
                  element: <AddCurriculumPage />,
                },
                {
                  path: "edit/:id",
                  element: <EditCurriculumPage />,
                },
                {
                  path: "instcurriculums",
                  element: <ProtectedRoute allowedLevel="branch" />,
                  children: [
                    {
                      index: true,
                      element: <InstCurriculumPage />,
                    },
                  ],
                },
                {
                  path: "expcurriculums",
                  element: <ProtectedRoute allowedLevel="institute" />,
                  children: [
                    {
                      index: true,
                      element: <ExpCurriculumPage />,
                    },
                  ],
                },
              ],
            },
            {
              path: "managecourses",
              element: <ManageCoursePage />,
              children: [
                {
                  path: "add",
                  element: <AddCoursePage />,
                },
                {
                  path: "edit/:id",
                  element: <EditCoursePage />,
                },
                {
                  path: "instcourses",
                  element: <ProtectedRoute allowedLevel="branch" />,
                  children: [
                    {
                      index: true,
                      element: <InstCoursePage />,
                    },
                  ],
                },
                {
                  path: "expcourse",
                  element: <ProtectedRoute allowedLevel="institute" />,
                  children: [
                    {
                      index: true,
                      element: <ExpCoursePage />,
                    },
                  ],
                },
              ],
            },
            {
              path: "managesubjects",
              element: <ManageSubjectPage />,
              children: [
                {
                  path: "add",
                  element: <AddSubjectPage />,
                },
                {
                  path: "edit/:id",
                  element: <EditSubjectPage />,
                },
                {
                  path: "instsubjects",
                  element: (
                    <ProtectedRoute
                      allowedLevel="branch"
                      allowedRoles={[ROLES.ADMIN]}
                    />
                  ),
                  children: [
                    {
                      index: true,
                      element: <InstSubjectPage />,
                    },
                  ],
                },
                {
                  path: "expsubjects",
                  element: <ProtectedRoute allowedLevel="institute" />,
                  children: [
                    {
                      index: true,
                      element: <ExpSubjectPage />,
                    },
                  ],
                },
              ],
            },
            {
              path: "managetopics",
              element: <ManageTopicPage />,
              children: [
                {
                  path: "add",
                  element: <AddTopicPage />,
                },
                {
                  path: "edit/:id",
                  element: <EditTopicPage />,
                },
                {
                  path: "import",
                  element: <ImportTopicPage />,
                },
                {
                  path: "insttopics",
                  element: <ProtectedRoute allowedLevel="branch" />,
                  children: [
                    {
                      index: true,
                      element: <InstTopics />,
                    },
                  ],
                },
                {
                  path: "exptopics",
                  element: <ProtectedRoute allowedLevel="institute" />,
                  children: [
                    {
                      index: true,
                      element: <ExpTopics />,
                    },
                  ],
                },
              ],
            },
            {
              path: "managestudymaterial",
              element: <ManageStudyMaterialPage />,
              children: [
                {
                  path: "add",
                  element: <AddStudyMaterialPage />,
                },
                {
                  path: "edit/:id",
                  element: <EditStudyMaterialPage />,
                },
                {
                  path: "expstudymaterial",
                  element: <ProtectedRoute allowedLevel="institute" />,
                  children: [
                    {
                      index: true,
                      element: <ExpStudyMaterial />,
                    },
                  ],
                },
                {
                  path: "inststudymaterial",
                  element: <ProtectedRoute allowedLevel="branch" />,
                  children: [
                    {
                      index: true,
                      element: <InstStudyMaterial />,
                    },
                  ],
                },
              ],
            },

            { path: "students", element: <ManageStudentsPage /> },
            {
              path: "admission",
              element: <Admission />,
              children: [
                {
                  index: true,
                  element: <Navigate to="list" replace />,
                },
                {
                  path: "add",
                  element: <AddAdmission />,
                },
                {
                  path: "list",
                  element: <AdmissionList />,
                },
                {
                  path: "import",
                  element: <ImportAdmission />,
                },
                {
                  path: "announcements",
                  element: <Announcements />,
                },
                {
                  path: "documents",
                  element: <ManageDocument />,
                },
              ],
            },
            {
              path: "enquiry",
              element: <Enquiry />,
              children: [
                {
                  index: true,
                  element: <Navigate to="list" replace />,
                },
                {
                  path: "add",
                  element: <AddEnquiry />,
                },
                {
                  path: "edit/:studentId",
                  element: <AddEnquiry />,
                },
                {
                  path: "list",
                  element: <EnquiryList />,
                },
              ],
            },
            {
              path: "students/registration",
              element: <StudentRegistrationPage />,
            },
            {
              path: "students/enquiry",
              element: <StudentEnquiryPage />,
            },
            {
              path: "payment/active",
              element: <ActivePaymentPage />,
            },
            {
              path: "payment/processing",
              element: <PaymentProcessingPage />,
            },
            {
              path: "franchisePayment",
              element: <FranchisePaymentPage />,
            },
            {
              path: "FranchiseOrderManagement",
              element: <FranchiseOrderManagement />,
            },
            { path: "classes/live", element: <LiveClassesPage /> },
            { path: "attendance", element: <AttendancePage /> },
            { path: "profile", element: <UserProfilePage /> },
            { path: "profile/edit", element: <EditProfilePage /> },
            {
              path: "profile/change-password",
              element: <ChangePasswordPage />,
            },
            {
              path: "reports/academic",
              element: <AcademicReports />,
            },
            { path: "reports/payment", element: <PaymentReports /> },
            { path: "tests", element: <BranchTestManagementPage /> },
            { path: "tests/create", element: <TestCreationPage /> },
            { path: "tests/calendar", element: <TestCalendarPage /> },
            { path: "tests/marks", element: <TestMarksSheetPage /> },
            { path: "tests/omr", element: <TestOmrUploadPage /> },
            { path: "tests/online", element: <TestOnlinePage /> },
            { path: "tests/results", element: <TestResultsPage /> },
            { path: "tests/schedule", element: <TestSchedulePage /> },
            { path: "institutes", element: <ManageInstitutesPage /> },
            {
              path: "institutes/registration",
              element: <InstituteRegistrationPage />,
            },
            { path: "clock", element: <ClockTable /> },
            {
              path: "*",
              element: <PlaceholderPage pageName="not-found" />,
            },
            {
              path: "/subscription/manage-institutes",
              element: <ManageInstitutePageV2></ManageInstitutePageV2>,
            },
            {
              path: "subscription/manage-institutes",
              element: <ManageInstitutePageV2 />,
            },
            {
              path: "subscription/manage-institutes/add",
              element: <AddInstitutePage />,
            },
            {
              path: "subscription/manage-institutes/edit/:id",
              element: <EditInstitutePage />,
            },
          ],
        },
      ],
    },
  ],
  {
    basename: "/institute-magica",
  },
);
