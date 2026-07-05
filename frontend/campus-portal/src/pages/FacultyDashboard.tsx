import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaHome, FaTachometerAlt, FaBook, FaBars,
  FaEllipsisV, FaChevronDown, FaFilePdf, FaUsers,
  FaPlus, FaUpload, FaCheckCircle, FaClipboardList,
  FaSpinner, FaTrash, FaSignOutAlt, FaUserCircle, FaStar
} from "react-icons/fa";
import { useAuthGuard, logout } from "../hooks/useAuthGuard";

// Types matching faculty API schemas

interface FacultyProfile {
  id: string;
  full_name: string;
  employee_id: string;
  department: string;
}

interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  semester: number;
  student_count: number;
}

interface Material {
  id: number;
  title: string;
  file_url: string;
  uploaded_at: string | null;
}

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  submission_count: number;
}

interface CourseDetail extends Course {
  materials: Material[];
  assignments: Assignment[];
}

interface Submission {
  id: number;
  student_name: string;
  enrollment_no: string;
  file_url: string;
  submitted_at: string | null;
  marks_awarded: number | null;
  feedback: string | null;
}



const API = import.meta.env.VITE_API_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

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
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuthGuard("faculty");

  useEffect(() => {
    if (!loading && user) {
      apiFetch<FacultyProfile>("/faculty/profile")
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
          <FaBars className="text-slate-300 hover:text-white cursor-pointer" size={20} />
          <h1 className="text-xl font-bold tracking-tight">
            {selectedCourse ? selectedCourse.code : "Faculty Portal"}
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative cursor-pointer hover:text-white text-slate-300 transition-colors">
            <FaBell size={18} />
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-full">5</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <span className="text-sm font-medium hidden sm:block text-slate-200 group-hover:text-white transition-colors">
                {profile?.full_name ?? "Faculty"}
              </span>
              <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                {initials}
              </div>
              <FaChevronDown size={12} className="text-slate-400 group-hover:text-white" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800">{profile?.full_name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  {profile && (
                    <p className="text-xs text-indigo-600 font-mono mt-1">{profile.employee_id}</p>
                  )}
                </div>
                <div className="py-1">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <FaUserCircle className="mr-3 text-slate-400" /> My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <FaSignOutAlt className="mr-3" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

     
      <div className="bg-white border-b border-slate-200 flex items-center px-6 py-0 shadow-sm text-sm font-semibold text-slate-600 overflow-x-auto z-10">
        <div className="flex space-x-1 min-w-max">
          <button
            onClick={() => setSelectedCourse(null)}
            className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-50 hover:text-indigo-700 transition-colors"
          >
            <FaHome size={16} /> <span>Home</span>
          </button>
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

// ---------------------------------------------------------------------------
// Course overview — real data from GET /faculty/courses
// ---------------------------------------------------------------------------

function CourseOverview({ onSelectCourse }: { onSelectCourse: (course: Course) => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Course[]>("/faculty/courses")
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

// ---------------------------------------------------------------------------
// Course detail view
// ---------------------------------------------------------------------------

type DetailTab = "content" | "assignments" | "grading";

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
      const data = await apiFetch<CourseDetail>(`/faculty/courses/${course.id}`);
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
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content tab — materials list + upload form
// ---------------------------------------------------------------------------

function ContentTab({
  courseId,
  materials,
  onMutate,
}: {
  courseId: number;
  materials: Material[];
  onMutate: () => void;
}) {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!title.trim() || !fileUrl.trim()) {
      setError("Both title and file URL are required.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      await apiFetch(`/faculty/courses/${courseId}/materials`, {
        method: "POST",
        body: JSON.stringify({ title, file_url: fileUrl }),
      });
      setTitle("");
      setFileUrl("");
      onMutate(); // re-fetch course detail to show new material
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId: number) => {
    setDeletingId(materialId);
    try {
      await apiFetch(`/faculty/materials/${materialId}`, { method: "DELETE" });
      onMutate();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FaUpload className="text-indigo-600" /> Upload New Material
        </h3>
        {error && (
          <p className="text-red-500 text-xs mb-3">{error}</p>
        )}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Material title (e.g. Week 1 Notes)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="File URL (e.g. https://drive.google.com/...)"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 shrink-0"
            >
              {uploading ? <FaSpinner className="animate-spin" size={13} /> : <FaUpload size={13} />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Paste a Google Drive, OneDrive, or direct download link.
            {/* S3 direct upload integration goes here when available */}
          </p>
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
            {materials.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors pl-8"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <FaFilePdf size={16} className="text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{item.title}</p>
                    {item.uploaded_at && (
                      <p className="text-xs text-slate-400">
                        {new Date(item.uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assignments tab — list + create form
// ---------------------------------------------------------------------------

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
      await apiFetch(`/faculty/courses/${courseId}/assignments`, {
        method: "POST",
        body: JSON.stringify({ title, description: description || null, due_date: dueDate }),
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

// ---------------------------------------------------------------------------
// Grading tab — real submissions + inline grade form
// ---------------------------------------------------------------------------

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
    apiFetch<Submission[]>(`/faculty/assignments/${assignmentId}/submissions`)
      .then(setSubmissions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  const handleGrade = async (submissionId: number) => {
    const marks = parseFloat(gradeForm.marks);
    if (isNaN(marks)) { alert("Enter a valid marks number."); return; }
    try {
      await apiFetch(`/faculty/submissions/${submissionId}/grade`, {
        method: "PATCH",
        body: JSON.stringify({ marks_awarded: marks, feedback: gradeForm.feedback || null }),
      });
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

  // No assignment selected yet — show a picker
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
          {selectedAssignment?.title} — Submissions
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
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "—"}
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