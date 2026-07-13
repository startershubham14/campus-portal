import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome, FaBook,
  FaEllipsisV, FaFilePdf, FaUsers,
  FaPlus, FaUpload, FaCheckCircle, FaClipboardList,
  FaSpinner, FaTrash, FaSignOutAlt, FaStar,
FaLink, FaExternalLinkAlt, FaCalendarAlt, FaCheck, FaTimes as FaX, FaSave,
  FaExclamationTriangle, FaChartBar, FaGraduationCap, FaAward
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuthGuard, logout } from "../hooks/useAuthGuard";
import { facultyService } from "../services/facultyService";
import type {
  FacultyProfile,
  FacultyCourse as Course,
  FacultyMaterial as Material,
  FacultyAssignment as Assignment,
  FacultyCourseDetail as CourseDetail,
  FacultySubmission as Submission,
  AttendanceRosterItem as RosterItem,
} from "../services/types";

const CARD_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-400 to-teal-600",
  "from-rose-400 to-red-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-blue-500",
  "from-blue-400 to-indigo-500",
];


export default function FacultyDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuthGuard("faculty");

  useEffect(() => {
    if (!loading && user) {
      facultyService.getProfile()
        .then(setProfile)
        .catch(() => {});
    }
  }, [loading, user]);

  const handleLogout = () => logout(navigate);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Verifying session...</p>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "F";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
  
      <div className="bg-slate-900 text-white flex justify-between items-center px-6 py-3 shadow-md z-20">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedCourse(null)}
            className="text-xl font-bold tracking-tight hover:text-indigo-300 transition-colors"
          >
            {selectedCourse ? selectedCourse.code : "Faculty Portal"}
          </button>
        </div>
        <div className="flex items-center space-x-4">
          {/* Static profile - shows who's logged in (not a dropdown) */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-100 leading-tight">
                {profile?.full_name ?? "Faculty"}
              </p>
              {profile && (
                <p className="text-xs text-slate-400 font-mono leading-tight">{profile.employee_id}</p>
              )}
            </div>
            <div className="h-9 w-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
              {initials}
            </div>
          </div>

          {/* Direct logout - one click, always visible */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            title="Log out"
          >
            <FaSignOutAlt size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

     
      <div className="bg-white border-b border-slate-200 flex items-center px-6 py-0 shadow-sm text-sm font-semibold text-slate-600 overflow-x-auto z-10">
        <div className="flex space-x-1 min-w-max">
          <button
            onClick={() => setSelectedCourse(null)}
            className={`flex items-center space-x-2 px-4 py-4 transition-colors ${
              !selectedCourse
                ? "text-indigo-700 border-b-2 border-indigo-700"
                : "hover:bg-slate-50 hover:text-indigo-700"
            }`}
          >
            <FaBook size={16} /> <span>My Classes</span>
          </button>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {!selectedCourse ? (
          <CourseOverview onSelectCourse={setSelectedCourse} />
        ) : (
          <CourseDetailView
            course={selectedCourse}
            onBack={() => setSelectedCourse(null)}
          />
        )}
      </main>
    </div>
  );
}


function CourseOverview({ onSelectCourse }: { onSelectCourse: (course: Course) => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    facultyService.listCourses()
      .then((data) => { setCourses(data); setFiltered(data); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      courses.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      )
    );
  }, [search, courses]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm p-8">
        <FaSpinner className="animate-spin" /> Loading classes...
      </div>
    );
  }

  if (error) {
    return <p className="p-8 text-red-500 text-sm">Failed to load classes: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <input
          type="text"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none flex-1 md:w-64 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-700"
        />
        <p className="text-xs text-slate-400 font-medium">
          {filtered.length} class{filtered.length !== 1 ? "es" : ""} assigned
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FaBook size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">
            {courses.length === 0 ? "No classes assigned yet." : "No classes match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, index) => (
            <div
              key={course.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group"
              onClick={() => onSelectCourse(course)}
            >
              <div className={`h-36 bg-gradient-to-r ${CARD_COLORS[index % CARD_COLORS.length]} relative overflow-hidden`}>
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{
                    backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                  }}
                />
       
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <FaUsers size={11} /> {course.student_count}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 mb-1 block">{course.code}</span>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{course.department} · Sem {course.semester}</p>
                </div>
                <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500 font-medium">Manage Class</span>
                  <button
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaEllipsisV />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type DetailTab = "content" | "assignments" | "grading" | "attendance" | "exams";

function CourseDetailView({ course, onBack }: { course: Course; onBack: () => void }) {
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("content");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gradingAssignmentId, setGradingAssignmentId] = useState<number | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await facultyService.getCourseDetail(course.id);
      setDetail(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load class");
    } finally {
      setLoading(false);
    }
  }, [course.id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "content",     label: "Course Content" },
    { id: "assignments", label: "Assignments" },
    { id: "grading",     label: "Grading" },
    { id: "attendance",  label: "Attendance" },
    { id: "exams",       label: "Exams" },
  ];

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
    
      <div className="bg-slate-50 border-b border-slate-200 p-4 text-sm flex items-center gap-2 text-slate-500 font-medium">
        <button onClick={onBack} className="hover:text-indigo-700 hover:bg-slate-200 p-1.5 rounded transition-colors">
          <FaHome size={14} />
        </button>
        <span>/</span>
        <span className="cursor-pointer hover:text-indigo-700 transition-colors" onClick={onBack}>My Classes</span>
        <span>/</span>
        <span className="text-slate-800 font-bold">{course.code}</span>
      </div>

      <div className="px-6 md:px-10 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{course.name}</h2>
            <p className="text-sm text-slate-400 mt-1">{course.department} · Semester {course.semester}</p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
            <FaUsers size={11} /> {course.student_count} Students
          </span>
        </div>


        <div className="flex gap-6 border-b border-slate-200 text-sm font-bold text-slate-500 overflow-x-auto mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setGradingAssignmentId(null); }}
              className={`pb-3 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-indigo-600 text-indigo-700"
                  : "hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm pb-10">
            <FaSpinner className="animate-spin" /> Loading...
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm pb-10">{error}</p>
        ) : (
          <div className="mb-10">
            {activeTab === "content" && (
               <ContentTab
                courseId={course.id}
                courseCode={course.code}
                materials={detail?.materials ?? []}
                onMutate={fetchDetail}
              />
            )}
            {activeTab === "assignments" && (
              <AssignmentsTab
                courseId={course.id}
                assignments={detail?.assignments ?? []}
                onMutate={fetchDetail}
                onGrade={(id) => { setGradingAssignmentId(id); setActiveTab("grading"); }}
              />
            )}
            {activeTab === "grading" && (
              <GradingTab
                assignmentId={gradingAssignmentId}
                assignments={detail?.assignments ?? []}
                onSelectAssignment={setGradingAssignmentId}
              />
            )}
            {activeTab === "attendance" && (
              <AttendanceTab courseId={course.id} />
            )}
            {activeTab === "exams" && (
              <ExamsTab courseId={course.id} courseCode={course.code} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Upload state type for tracking multi-step progress
type UploadStatus = "idle" | "uploading_to_s3" | "saving" | "done";

function ContentTab({
  courseId,
  courseCode,
  materials,
  onMutate,
}: {
  courseId: number;
  courseCode?: string;
  materials: Material[];
  onMutate: () => void;
}) {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [addingLink, setAddingLink] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleAddLink = async () => {
    if (!title.trim() || !linkUrl.trim()) {
      setError("Both title and a URL are required.");
      return;
    }
    // Light validation - must look like a URL
    if (!/^https?:\/\//i.test(linkUrl)) {
      setError("URL must start with http:// or https://");
      return;
    }
    setAddingLink(true);
    setError("");
    try {
      await facultyService.addLinkMaterial(courseId, title, linkUrl);
      setTitle("");
      setLinkUrl("");
      onMutate();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add link");
    } finally {
      setAddingLink(false);
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !file) {
      setError("Both title and a file are required.");
      return;
    }
    setError("");
    setUploadProgress(0);

    try {
      // The service encapsulates the full 3-step flow: presign → S3 PUT → confirm.
      // We drive the status labels around it and pass a progress callback.
      setUploadStatus("uploading_to_s3");
      await facultyService.uploadMaterial(
        courseId,
        courseCode,
        title,
        file,
        (percent) => {
          setUploadProgress(percent);
          if (percent >= 100) setUploadStatus("saving");
        }
      );

      setTitle("");
      setFile(null);
      setUploadStatus("done");
      onMutate();
      setTimeout(() => setUploadStatus("idle"), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setUploadStatus("idle");
    }
  };

  const handleDelete = async (materialId: number) => {
    setDeletingId(materialId);
    try {
      await facultyService.deleteMaterial(materialId);
      onMutate();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const uploading = uploadStatus === "uploading_to_s3" || uploadStatus === "saving";

  const statusLabel = {
    idle: "Upload",
    uploading_to_s3: "Uploading to S3...",
    saving: "Saving...",
    done: " Uploaded!",
  }[uploadStatus];

  return (
    <div className="space-y-6">
      {/* Add-material form with mode toggle */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FaPlus className="text-indigo-600" /> Add New Material
        </h3>

        {/* Mode toggle: Upload File vs Add Link */}
        <div className="flex gap-1 bg-slate-200/60 p-1 rounded-lg w-fit mb-4">
          <button
            onClick={() => { setMode("upload"); setError(""); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              mode === "upload" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FaUpload size={11} /> Upload File
          </button>
          <button
            onClick={() => { setMode("link"); setError(""); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              mode === "link" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FaLink size={11} /> Add Link
          </button>
        </div>

        {error && <p className="text-red-500 text-xs mb-3 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Material title (e.g. Week 1 Notes)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />

          {mode === "upload" ? (
            <>
              <div className="flex gap-3 items-center">
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <label
                  htmlFor="file-input"
                  className="flex-1 flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  <FaFilePdf className="text-slate-400" size={14} />
                  {file ? (
                    <span className="text-slate-700 font-medium truncate">{file.name}</span>
                  ) : (
                    <span>Choose file (PDF, DOC, PPT, ZIP...)</span>
                  )}
                </label>
                <button
                  onClick={handleUpload}
                  disabled={uploading || uploadStatus === "done"}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 shrink-0 ${
                    uploadStatus === "done" ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {uploading ? <FaSpinner className="animate-spin" size={13} /> : uploadStatus === "done" ? null : <FaUpload size={13} />}
                  {statusLabel}
                </button>
              </div>
              {uploadStatus === "uploading_to_s3" && (
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-3 items-center">
              <div className="flex-1 flex items-center gap-2 border border-slate-300 rounded-lg px-3 focus-within:ring-1 focus-within:ring-indigo-500">
                <FaLink className="text-slate-400 shrink-0" size={13} />
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or any URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1 py-2 text-sm outline-none bg-transparent"
                />
              </div>
              <button
                onClick={handleAddLink}
                disabled={addingLink}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 shrink-0"
              >
                {addingLink ? <FaSpinner className="animate-spin" size={13} /> : <FaLink size={13} />}
                {addingLink ? "Adding..." : "Add Link"}
              </button>
            </div>
          )}
        </div>
      </div>

      {materials.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">No materials uploaded yet.</p>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-700">Uploaded Materials ({materials.length})</h3>
          </div>
          <div className="bg-white divide-y divide-slate-100">
            {materials.map((item) => {
              const isLink = item.source_type === "link";
              return (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors pl-8"
                >
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 flex-1 min-w-0 group"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isLink ? "bg-blue-50" : "bg-rose-50"
                    }`}>
                      {isLink
                        ? <FaLink size={15} className="text-blue-500" />
                        : <FaFilePdf size={16} className="text-rose-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-indigo-700 transition-colors flex items-center gap-1.5">
                        {item.title}
                        {isLink && <FaExternalLinkAlt size={9} className="text-slate-400" />}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isLink ? "External link" : "Uploaded file"}
                        {item.uploaded_at && ` · ${new Date(item.uploaded_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="ml-4 text-rose-500 hover:text-rose-700 transition-colors shrink-0"
                    title="Delete material"
                  >
                    {deletingId === item.id
                      ? <FaSpinner className="animate-spin" size={14} />
                      : <FaTrash size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentsTab({
  courseId,
  assignments,
  onMutate,
  onGrade,
}: {
  courseId: number;
  assignments: Assignment[];
  onMutate: () => void;
  onGrade: (assignmentId: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !dueDate) {
      setError("Title and due date are required.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await facultyService.createAssignment(courseId, {
        title,
        description: description || null,
        due_date: dueDate,
      });
      setTitle(""); setDescription(""); setDueDate("");
      onMutate();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FaPlus className="text-indigo-600" /> Create New Assignment
        </h3>
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Assignment title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="col-span-1 md:col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="col-span-1 md:col-span-2 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {creating ? <FaSpinner className="animate-spin" size={13} /> : <FaPlus size={13} />}
            {creating ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </div>

   
      {assignments.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">No assignments yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => {
            const due = new Date(a.due_date);
            const isPast = due < new Date();
            const pct = a.submission_count > 0 ? Math.min(100, a.submission_count) : 0;

            return (
              <div key={a.id} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-all bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 text-sm leading-snug pr-2">{a.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${
                    isPast
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}>
                    {isPast ? "Past due" : due.toLocaleDateString()}
                  </span>
                </div>
                {a.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{a.description}</p>
                )}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 font-bold mb-1.5">
                    <span>Submissions</span>
                    <span>{a.submission_count} received</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => onGrade(a.id)}
                  className="w-full bg-indigo-50 text-indigo-700 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> Grade Submissions
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GradingTab({
  assignmentId,
  assignments,
  onSelectAssignment,
}: {
  assignmentId: number | null;
  assignments: Assignment[];
  onSelectAssignment: (id: number) => void;
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeForm, setGradeForm] = useState<{ marks: string; feedback: string }>({ marks: "", feedback: "" });

  useEffect(() => {
    if (!assignmentId) return;
    setLoading(true);
    setError("");
    facultyService.listSubmissions(assignmentId)
      .then(setSubmissions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  const handleGrade = async (submissionId: number) => {
    const marks = parseFloat(gradeForm.marks);
    if (isNaN(marks)) { alert("Enter a valid marks number."); return; }
    try {
      await facultyService.gradeSubmission(submissionId, marks, gradeForm.feedback || null);
      // Update in-place
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, marks_awarded: marks, feedback: gradeForm.feedback || null }
            : s
        )
      );
      setGradingId(null);
      setGradeForm({ marks: "", feedback: "" });
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Grading failed");
    }
  };

  // No assignment selected yet - show a picker
  if (!assignmentId) {
    if (assignments.length === 0) {
      return (
        <div className="text-center py-16 text-slate-400">
          <FaClipboardList className="mx-auto mb-4 opacity-30" size={40} />
          <p className="text-sm">Create an assignment first to start grading.</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500 font-medium mb-4">Select an assignment to grade:</p>
        {assignments.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelectAssignment(a.id)}
            className="w-full text-left border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-between"
          >
            <span className="text-sm font-bold text-slate-800">{a.title}</span>
            <span className="text-xs text-slate-400">{a.submission_count} submissions</span>
          </button>
        ))}
      </div>
    );
  }

  const selectedAssignment = assignments.find((a) => a.id === assignmentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-700">
          {selectedAssignment?.title} - Submissions
        </h3>
        <button
          onClick={() => onSelectAssignment(0)}
          className="text-xs text-indigo-600 hover:underline"
        >
          ← Change assignment
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <FaSpinner className="animate-spin" /> Loading submissions...
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FaClipboardList className="mx-auto mb-3 opacity-30" size={32} />
          <p className="text-sm">No submissions yet.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">File</th>
                <th className="p-4">Marks</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {submissions.map((s) => (
                <>
                  <tr key={s.id} className="hover:bg-slate-50 text-slate-700">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{s.student_name}</p>
                      <p className="text-xs text-slate-400 font-mono">{s.enrollment_no}</p>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-4">
                      <a
                        href={s.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline text-xs font-medium"
                      >
                        View File
                      </a>
                    </td>
                    <td className="p-4">
                      {s.marks_awarded !== null ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <FaStar size={11} /> {s.marks_awarded}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Not graded</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setGradingId(gradingId === s.id ? null : s.id);
                          setGradeForm({ marks: String(s.marks_awarded ?? ""), feedback: s.feedback ?? "" });
                        }}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        {s.marks_awarded !== null ? "Re-grade" : "Grade"}
                      </button>
                    </td>
                  </tr>

              
                  {gradingId === s.id && (
                    <tr key={`grade-${s.id}`} className="bg-indigo-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Marks</label>
                            <input
                              type="number"
                              placeholder="e.g. 85"
                              value={gradeForm.marks}
                              onChange={(e) => setGradeForm((f) => ({ ...f, marks: e.target.value }))}
                              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-28 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Feedback (optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Good work, improve X"
                              value={gradeForm.feedback}
                              onChange={(e) => setGradeForm((f) => ({ ...f, feedback: e.target.value }))}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleGrade(s.id)}
                              className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                            >
                              <FaCheckCircle size={11} /> Save
                            </button>
                            <button
                              onClick={() => setGradingId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// Attendance tab - pick a date, mark the roster present/absent, bulk save


function AttendanceMarkPanel({ courseId }: { courseId: number }) {
  // Default to today in YYYY-MM-DD (local)
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    setError("");
    setSavedMsg("");
    try {
      const data = await facultyService.getAttendanceRoster(courseId, date);
      setRoster(data.roster);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load roster");
    } finally {
      setLoading(false);
    }
  }, [courseId, date]);

  useEffect(() => { fetchRoster(); }, [fetchRoster]);

  const setPresence = (studentId: string, present: boolean) => {
    setRoster((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, is_present: present } : r))
    );
  };

  const markAll = (present: boolean) => {
    setRoster((prev) => prev.map((r) => ({ ...r, is_present: present })));
  };

  const handleSave = async () => {
    // Only send students that have an explicit present/absent value
    const marks = roster
      .filter((r) => r.is_present !== null)
      .map((r) => ({ student_id: r.student_id, is_present: r.is_present as boolean }));

    if (marks.length === 0) {
      setError("Mark at least one student before saving.");
      return;
    }
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      await facultyService.saveAttendance(courseId, date, marks);
      setSavedMsg(`Attendance saved for ${new Date(date).toLocaleDateString()}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = roster.filter((r) => r.is_present === true).length;
  const absentCount = roster.filter((r) => r.is_present === false).length;
  const unmarkedCount = roster.filter((r) => r.is_present === null).length;

  return (
    <div className="space-y-5">
      {/* Date picker + summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-indigo-600" />
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Attendance date</label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="flex gap-4 text-xs font-bold">
          <span className="text-emerald-600">{presentCount} Present</span>
          <span className="text-rose-600">{absentCount} Absent</span>
          <span className="text-slate-400">{unmarkedCount} Unmarked</span>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
      {savedMsg && <p className="text-emerald-600 text-xs bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-2"><FaCheckCircle size={12} /> {savedMsg}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
          <FaSpinner className="animate-spin" /> Loading roster...
        </div>
      ) : roster.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FaUsers size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No students enrolled in this class.</p>
        </div>
      ) : (
        <>
          {/* Bulk actions */}
          <div className="flex gap-2">
            <button
              onClick={() => markAll(true)}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Mark all present
            </button>
            <button
              onClick={() => markAll(false)}
              className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Mark all absent
            </button>
          </div>

          {/* Roster */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
            {roster.map((r) => (
              <div key={r.student_id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800">{r.full_name}</p>
                  <p className="text-xs text-slate-400 font-mono">{r.enrollment_no}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPresence(r.student_id, true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      r.is_present === true
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-500 border-slate-200 hover:border-emerald-400"
                    }`}
                  >
                    <FaCheck size={10} /> Present
                  </button>
                  <button
                    onClick={() => setPresence(r.student_id, false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      r.is_present === false
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-slate-500 border-slate-200 hover:border-rose-400"
                    }`}
                  >
                    <FaX size={10} /> Absent
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {saving ? <FaSpinner className="animate-spin" size={13} /> : <FaSave size={13} />}
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Attendance tab wrapper - toggle between marking and the summary dashboard

function AttendanceTab({ courseId }: { courseId: number }) {
  const [mode, setMode] = useState<"mark" | "summary">("mark");

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex gap-1 bg-slate-200/60 p-1 rounded-lg w-fit">
        <button
          onClick={() => setMode("mark")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
            mode === "mark" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FaCalendarAlt size={11} /> Mark Attendance
        </button>
        <button
          onClick={() => setMode("summary")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
            mode === "summary" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FaChartBar size={11} /> Summary
        </button>
      </div>

      {mode === "mark" ? <AttendanceMarkPanel courseId={courseId} /> : <AttendanceSummaryPanel courseId={courseId} />}
    </div>
  );
}

// Attendance summary - class average + worst-first per-student bars

interface StudentStat {
  student_id: string;
  full_name: string;
  enrollment_no: string;
  present: number;
  total: number;
  percentage: number;
  status: "safe" | "warning" | "critical";
}

interface ClassSummary {
  class_id: number;
  total_sessions: number;
  class_average: number;
  at_risk_count: number;
  students: StudentStat[];
}

// Same color language as the student dashboard for consistency
const F_STATUS = {
  safe:     { color: "#10b981", text: "text-emerald-600", bg: "bg-emerald-50" },
  warning:  { color: "#f59e0b", text: "text-amber-600",   bg: "bg-amber-50" },
  critical: { color: "#f43f5e", text: "text-rose-600",    bg: "bg-rose-50" },
};

function AttendanceSummaryPanel({ courseId }: { courseId: number }) {
  const [data, setData] = useState<ClassSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    facultyService.getAttendanceSummary(courseId)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
        <FaSpinner className="animate-spin" /> Loading summary...
      </div>
    );
  }
  if (error) return <p className="text-red-500 text-sm py-4">{error}</p>;
  if (!data) return null;

  if (data.total_sessions === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FaChartBar size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">No attendance recorded yet. Mark some classes first.</p>
      </div>
    );
  }

  // Chart data - already sorted worst-first by the backend
  const chartData = data.students.map((s) => ({
    name: s.enrollment_no,
    percentage: s.percentage,
    status: s.status,
  }));

  return (
    <div className="space-y-6">
      {/* Header stats - three big numbers anyone can read */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
          <p className="text-3xl font-extrabold text-slate-800">{data.class_average}%</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Class Average</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
          <p className="text-3xl font-extrabold text-slate-800">{data.total_sessions}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Classes Held</p>
        </div>
        <div className={`rounded-xl p-5 text-center border ${data.at_risk_count > 0 ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
          <p className={`text-3xl font-extrabold ${data.at_risk_count > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {data.at_risk_count}
          </p>
          <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${data.at_risk_count > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            Below 75%
          </p>
        </div>
      </div>

      {/* At-risk callout */}
      {data.at_risk_count > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-rose-700">
          <FaExclamationTriangle size={13} />
          <span>
            <span className="font-bold">{data.at_risk_count} student{data.at_risk_count !== 1 ? "s" : ""}</span> below the 75% threshold - highlighted in red below.
          </span>
        </div>
      )}

      {/* Bar chart - worst first, color-coded */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-1">Attendance by Student</h3>
        <p className="text-xs text-slate-400 mb-4">Sorted lowest first. Red bars are below 75%.</p>
        <ResponsiveContainer width="100%" height={Math.max(200, data.students.length * 38)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v: number) => [`${v}%`, "Attendance"]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={F_STATUS[entry.status].color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed list - worst first */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {data.students.map((s) => {
          const c = F_STATUS[s.status];
          return (
            <div key={s.student_id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-800">{s.full_name}</p>
                <p className="text-xs text-slate-400 font-mono">{s.enrollment_no}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{s.present}/{s.total} present</span>
                <span className={`text-sm font-extrabold ${c.text} w-14 text-right`}>{s.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ---------------------------------------------------------------------------
// Exams tab - create exams, enter marks, view class analytics
// ---------------------------------------------------------------------------

interface ExamListItem {
  id: number;
  title: string;
  exam_type: string;
  max_marks: number;
  exam_date: string;
  results_entered: number;
  total_students: number;
}

interface ResultRosterItem {
  student_id: string;
  full_name: string;
  enrollment_no: string;
  marks_obtained: number | null;
  remarks: string | null;
}

interface ExamAnalyticsData {
  exam_id: number;
  title: string;
  max_marks: number;
  total_students: number;
  results_entered: number;
  average: number | null;
  highest: number | null;
  lowest: number | null;
  pass_count: number;
  fail_count: number;
  distribution: { bucket: string; count: number }[];
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  quiz: "Quiz",
  midterm: "Midterm",
  final: "Final",
  assignment: "Assignment",
};

function ExamsTab({ courseId, courseCode }: { courseId: number; courseCode: string }) {
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  // Which exam is open for entering marks / viewing analytics
  const [activeExam, setActiveExam] = useState<ExamListItem | null>(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await facultyService.listExams(courseId);
      setExams(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const handleDelete = async (examId: number) => {
    if (!confirm("Delete this exam and all its results?")) return;
    try {
      await facultyService.deleteExam(examId);
      setExams((prev) => prev.filter((e) => e.id !== examId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  // If an exam is open, show its detail panel instead of the list
  if (activeExam) {
    return (
      <ExamDetailPanel
        exam={activeExam}
        onBack={() => { setActiveExam(null); fetchExams(); }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Exams & Tests</h3>
          <p className="text-xs text-slate-400">Create exams, enter marks, and view class performance.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <FaPlus size={12} /> New Exam
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
          <FaSpinner className="animate-spin" /> Loading exams...
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FaGraduationCap size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No exams yet. Create one to start entering marks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const done = exam.results_entered >= exam.total_students && exam.total_students > 0;
            return (
              <div key={exam.id} className="border border-slate-200 rounded-xl p-5 bg-white hover:border-indigo-300 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                        {EXAM_TYPE_LABELS[exam.exam_type] ?? exam.exam_type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{exam.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Max marks: {exam.max_marks}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors"
                    title="Delete exam"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>

                {/* Progress of marks entered */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 font-medium mb-1">
                    <span>Marks entered</span>
                    <span>{exam.results_entered} / {exam.total_students}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${done ? "bg-emerald-500" : "bg-indigo-500"}`}
                      style={{ width: `${exam.total_students ? (exam.results_entered / exam.total_students) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setActiveExam(exam)}
                  className="w-full bg-indigo-50 text-indigo-700 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                >
                  {done ? "View / Edit Results" : "Enter Marks"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateExamModal
          courseId={courseId}
          courseCode={courseCode}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchExams(); }}
        />
      )}
    </div>
  );
}

// --- Create exam modal ------------------------------------------------------

function CreateExamModal({
  courseId,
  courseCode,
  onClose,
  onSuccess,
}: {
  courseId: number;
  courseCode: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "",
    exam_type: "quiz",
    max_marks: "100",
    exam_date: today,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    const max = parseFloat(form.max_marks);
    if (isNaN(max) || max <= 0) { setError("Max marks must be a positive number."); return; }

    setSubmitting(true);
    setError("");
    try {
      await facultyService.createExam(courseId, {
        title: form.title,
        exam_type: form.exam_type,
        max_marks: max,
        exam_date: form.exam_date,
      });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create exam");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">New Exam</h2>
            <p className="text-xs text-slate-400">{courseCode}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FaX size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Title</label>
            <input
              type="text"
              placeholder="e.g. Unit Test 1"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
              <select
                value={form.exam_type}
                onChange={(e) => setForm((f) => ({ ...f, exam_type: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Max Marks</label>
              <input
                type="number"
                value={form.max_marks}
                onChange={(e) => setForm((f) => ({ ...f, max_marks: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Date</label>
            <input
              type="date"
              value={form.exam_date}
              onChange={(e) => setForm((f) => ({ ...f, exam_date: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting && <FaSpinner className="animate-spin" size={13} />}
            {submitting ? "Creating..." : "Create Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Exam detail: enter marks + analytics -----------------------------------

function ExamDetailPanel({ exam, onBack }: { exam: ExamListItem; onBack: () => void }) {
  const [mode, setMode] = useState<"marks" | "analytics">("marks");
  const [roster, setRoster] = useState<ResultRosterItem[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    setError("");
    setSavedMsg("");
    try {
      const data = await facultyService.getExamRoster(exam.id);
      setRoster(data.roster);
      // Pre-fill inputs with existing marks
      const initial: Record<string, string> = {};
      data.roster.forEach((r) => {
        initial[r.student_id] = r.marks_obtained !== null ? String(r.marks_obtained) : "";
      });
      setMarks(initial);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load roster");
    } finally {
      setLoading(false);
    }
  }, [exam.id]);

  useEffect(() => { fetchRoster(); }, [fetchRoster]);

  const handleSave = async () => {
    // Build the results payload from filled-in marks only
    const results = Object.entries(marks)
      .filter(([, v]) => v.trim() !== "")
      .map(([student_id, v]) => ({ student_id, marks_obtained: parseFloat(v) }));

    // Client-side range check for a friendlier error than the server's 400
    for (const r of results) {
      if (isNaN(r.marks_obtained) || r.marks_obtained < 0 || r.marks_obtained > exam.max_marks) {
        setError(`Marks must be between 0 and ${exam.max_marks}.`);
        return;
      }
    }
    if (results.length === 0) { setError("Enter at least one mark before saving."); return; }

    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      await facultyService.saveExamResults(exam.id, results);
      setSavedMsg("Marks saved.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1.5">
          <FaHome size={13} /> Back to exams
        </button>
        <div className="border-l border-slate-200 pl-4">
          <h3 className="text-base font-bold text-slate-800">{exam.title}</h3>
          <p className="text-xs text-slate-400">Max marks: {exam.max_marks}</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-slate-200/60 p-1 rounded-lg w-fit">
        <button
          onClick={() => setMode("marks")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
            mode === "marks" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FaClipboardList size={11} /> Enter Marks
        </button>
        <button
          onClick={() => setMode("analytics")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
            mode === "analytics" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FaChartBar size={11} /> Analytics
        </button>
      </div>

      {mode === "marks" ? (
        loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
            <FaSpinner className="animate-spin" /> Loading roster...
          </div>
        ) : (
          <>
            {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
            {savedMsg && <p className="text-emerald-600 text-xs bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-2"><FaCheckCircle size={12} /> {savedMsg}</p>}

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {roster.map((s) => (
                <div key={s.student_id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{s.full_name}</p>
                    <p className="text-xs text-slate-400 font-mono">{s.enrollment_no}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="-"
                      value={marks[s.student_id] ?? ""}
                      onChange={(e) => setMarks((m) => ({ ...m, [s.student_id]: e.target.value }))}
                      className="w-20 border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-400">/ {exam.max_marks}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? <FaSpinner className="animate-spin" size={13} /> : <FaSave size={13} />}
                {saving ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </>
        )
      ) : (
        <ExamAnalyticsPanel examId={exam.id} maxMarks={exam.max_marks} />
      )}
    </div>
  );
}

// --- Analytics panel --------------------------------------------------------

function ExamAnalyticsPanel({ examId, maxMarks }: { examId: number; maxMarks: number }) {
  const [data, setData] = useState<ExamAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    facultyService.getExamAnalytics(examId)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-8">
        <FaSpinner className="animate-spin" /> Loading analytics...
      </div>
    );
  }
  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!data) return null;

  if (data.results_entered === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FaChartBar size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">No marks entered yet. Enter marks to see analytics.</p>
      </div>
    );
  }

  const avgPct = data.average !== null ? Math.round((data.average / maxMarks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-800">{data.average ?? "-"}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Average ({avgPct}%)</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-emerald-600">{data.highest ?? "-"}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Highest</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-rose-500">{data.lowest ?? "-"}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Lowest</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-slate-800">
            {data.pass_count}<span className="text-slate-300">/</span>{data.pass_count + data.fail_count}
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Passed (≥40%)</p>
        </div>
      </div>

      {/* Distribution histogram */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-1">Score Distribution</h3>
        <p className="text-xs text-slate-400 mb-4">How many students scored in each range.</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) => [`${v} students`, "Count"]}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pass/fail summary */}
      <div className="flex gap-4">
        <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <FaAward className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-emerald-700">{data.pass_count}</p>
            <p className="text-xs text-emerald-600 font-medium">Passed</p>
          </div>
        </div>
        <div className="flex-1 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
            <FaExclamationTriangle className="text-rose-600" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-rose-700">{data.fail_count}</p>
            <p className="text-xs text-rose-600 font-medium">Failed</p>
          </div>
        </div>
      </div>
    </div>
  );
}