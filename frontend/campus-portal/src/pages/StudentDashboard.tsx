import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaHome, FaTachometerAlt, FaBook,
  FaBars, FaEllipsisV, FaChevronDown, FaFilePdf,
  FaUsers, FaSpinner, FaClipboardList, FaSignOutAlt,
  FaUserCircle, FaUpload, FaCheckCircle, FaStar, FaFileAlt
} from "react-icons/fa";
import { useAuthGuard, logout } from "../hooks/useAuthGuard";

interface Course {
  id: number;
  code: string;
  name: string;
  department: string;
  semester: number;
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
  submitted: boolean;
  submission_id: number | null;
  submission_file_url: string | null;
  submitted_at: string | null;
  marks_awarded: number | null;
  feedback: string | null;
}

interface CourseDetail extends Course {
  materials: Material[];
  assignments: Assignment[];
}

interface StudentProfile {
  full_name: string;
  enrollment_no: string;
  department: string;
  current_semester: number;
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

// file.type is unreliable across browsers/OS — derive MIME from extension so
// it matches exactly what the presigned URL was signed with (S3 requirement).
function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    zip: "application/zip",
    txt: "text/plain",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };
  return map[ext] ?? "application/octet-stream";
}

// Cycle through these gradients for course cards for cource cards
const CARD_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-blue-400 to-indigo-500",
  "from-rose-400 to-red-500",
  "from-cyan-400 to-blue-500",
];

export default function StudentDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuthGuard("student");

  useEffect(() => {
    if (!loading && user) {
      apiFetch<StudentProfile>("/student/profile")
        .then(setProfile)
        .catch(() => {}); // non-fatal — falls back to email initial
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
    : user?.email?.[0]?.toUpperCase() ?? "S";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top nav */}
      <div className="bg-slate-900 text-white flex justify-between items-center px-6 py-3 shadow-md z-20">
        <div className="flex items-center space-x-4">
          <FaBars className="text-slate-300 hover:text-white cursor-pointer" size={20} />
          <h1 className="text-xl font-bold tracking-tight">
            {selectedCourse ? selectedCourse.code : "Campus Portal"}
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex space-x-5 text-slate-300">
            <div className="relative cursor-pointer hover:text-white transition-colors">
              <FaBell size={18} />
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-full">3</span>
            </div>
          </div>

          {/* Profile dropdown — clicking here no longer logs out */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <span className="text-sm font-medium tracking-wide hidden sm:block text-slate-200 group-hover:text-white transition-colors">
                {profile?.full_name ?? "Student"}
              </span>
              <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                {initials}
              </div>
              <FaChevronDown size={12} className="text-slate-400 group-hover:text-white" />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800">{profile?.full_name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  {profile && (
                    <p className="text-xs text-indigo-600 font-mono mt-1">{profile.enrollment_no}</p>
                  )}
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setProfileOpen(false); }}
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

      {/* Sub nav */}
      <div className="bg-white border-b border-slate-200 flex justify-between items-center px-6 py-0 shadow-sm text-sm font-semibold text-slate-600 overflow-x-auto z-10">
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
            <FaBook size={16} /> <span>My Courses</span>
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
    apiFetch<Course[]>("/student/courses")
      .then((data) => { setCourses(data); setFiltered(data); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Client-side search (no debounce needed — already local data)
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
        <FaSpinner className="animate-spin" /> Loading courses...
      </div>
    );
  }

  if (error) {
    return <p className="p-8 text-red-500 text-sm">Failed to load courses: {error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none flex-1 md:w-64 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700"
        />
        <p className="text-xs text-slate-400 font-medium">
          {filtered.length} course{filtered.length !== 1 ? "s" : ""} enrolled
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FaBook size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">
            {courses.length === 0 ? "No courses enrolled yet." : "No courses match your search."}
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
              <div className={`h-36 bg-linear-to-r ${CARD_COLORS[index % CARD_COLORS.length]} relative overflow-hidden`}>
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{
                    backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 mb-1 block">{course.code}</span>
                  <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{course.department} · Sem {course.semester}</p>
                </div>
                <div className="mt-4 flex justify-between items-center text-xs text-slate-400 font-medium">
                  <span>Tap to open</span>
                  <button
                    className="text-slate-400 hover:text-slate-800 p-1"
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

type DetailTab = "materials" | "assignments" | "grades";

function CourseDetailView({ course, onBack }: { course: Course; onBack: () => void }) {
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("materials");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<CourseDetail>(`/student/courses/${course.id}`);
      setDetail(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [course.id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "materials",   label: "Course Materials" },
    { id: "assignments", label: "Assignments" },
    { id: "grades",      label: "Grades" },
  ];

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 text-sm flex items-center gap-2 text-slate-500 font-medium">
        <button onClick={onBack} className="hover:text-indigo-700 hover:bg-slate-200 p-1.5 rounded transition-colors">
          <FaHome size={14} />
        </button>
        <span>/</span>
        <span className="cursor-pointer hover:text-indigo-700 transition-colors" onClick={onBack}>My courses</span>
        <span>/</span>
        <span className="text-slate-800 font-bold">{course.code}</span>
      </div>

      <div className="px-6 md:px-10 mt-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">{course.name}</h2>
        <p className="text-sm text-slate-400 mb-6">{course.department} · Semester {course.semester}</p>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200 text-sm font-bold text-slate-500 overflow-x-auto mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
            {activeTab === "materials"   && <MaterialsTab materials={detail?.materials ?? []} />}
            {activeTab === "assignments" && <AssignmentsTab assignments={detail?.assignments ?? []} onSubmitted={fetchDetail} />}
            {activeTab === "grades"      && <GradesTab courseId={course.id} />}
          </div>
        )}
      </div>
    </div>
  );
}

function MaterialsTab({ materials }: { materials: Material[] }) {
  if (materials.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No materials uploaded yet.</p>;
  }
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 p-4 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-700">Course Materials</h3>
      </div>
      <div className="bg-white divide-y divide-slate-100">
        {materials.map((item) => (
          <a
            key={item.id}
            href={item.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 md:p-5 flex items-center space-x-5 hover:bg-slate-50 pl-6 md:pl-10 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-rose-50">
              <FaFilePdf size={20} className="text-rose-500" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-slate-700 hover:text-indigo-700 transition-colors">
                {item.title}
              </span>
              {item.uploaded_at && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(item.uploaded_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function AssignmentsTab({
  assignments,
  onSubmitted,
}: {
  assignments: Assignment[];
  onSubmitted: () => void;
}) {
  if (assignments.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No assignments yet.</p>;
  }
  return (
    <div className="space-y-3">
      {assignments.map((a) => (
        <AssignmentCard key={a.id} assignment={a} onSubmitted={onSubmitted} />
      ))}
    </div>
  );
}

function AssignmentCard({
  assignment: a,
  onSubmitted,
}: {
  assignment: Assignment;
  onSubmitted: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const due = new Date(a.due_date);
  const isPast = due < new Date();
  const graded = a.marks_awarded !== null;
  const busy = status !== "idle";

  const handleSubmit = async () => {
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setError("");
    try {
      // Step 1: presign
      setStatus("uploading");
      const { presigned_url, object_key } = await apiFetch<{
        presigned_url: string;
        object_key: string;
      }>(`/student/assignments/${a.id}/submit/presign`, {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          content_type: getMimeType(file.name),
        }),
      });

      // Step 2: PUT directly to S3 (raw fetch — no auth header/JSON content type)
      const s3Res = await fetch(presigned_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": getMimeType(file.name) },
      });
      if (!s3Res.ok) throw new Error(`S3 upload failed: ${s3Res.status}`);

      // Step 3: confirm
      setStatus("saving");
      await apiFetch(`/student/assignments/${a.id}/submit/confirm`, {
        method: "POST",
        body: JSON.stringify({ object_key }),
      });

      setFile(null);
      setExpanded(false);
      onSubmitted(); // refresh parent so the status badge updates
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <FaClipboardList size={16} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{a.title}</p>
            {a.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
            )}
          </div>
        </div>

        {/* Status badge: graded > submitted > past due > due date */}
        {graded ? (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 bg-indigo-100 text-indigo-700 flex items-center gap-1">
            <FaStar size={10} /> {a.marks_awarded}
          </span>
        ) : a.submitted ? (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700 flex items-center gap-1">
            <FaCheckCircle size={10} /> Submitted
          </span>
        ) : (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
            isPast ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"
          }`}>
            {isPast ? "Past due" : `Due ${due.toLocaleDateString()}`}
          </span>
        )}
      </div>

      {/* Submission area */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        {a.submitted && (
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
            {a.submission_file_url && (
              <a
                href={a.submission_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-indigo-600 hover:underline font-medium"
              >
                <FaFileAlt size={11} /> View my submission
              </a>
            )}
            {a.submitted_at && (
              <span className="text-slate-400">
                Submitted {new Date(a.submitted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Feedback if graded */}
        {graded && a.feedback && (
          <div className="mb-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <p className="text-xs font-bold text-slate-600 mb-0.5">Faculty feedback:</p>
            <p className="text-xs text-slate-500">{a.feedback}</p>
          </div>
        )}

        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

        {/* Don't allow re-submission once graded — the grade is final */}
        {graded ? (
          <p className="text-xs text-slate-400 italic">This submission has been graded.</p>
        ) : !expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FaUpload size={11} /> {a.submitted ? "Re-submit" : "Submit assignment"}
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              id={`sub-file-${a.id}`}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor={`sub-file-${a.id}`}
              className="flex-1 flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <FaFileAlt className="text-slate-400" size={12} />
              {file ? <span className="text-slate-700 font-medium truncate">{file.name}</span> : "Choose file"}
            </label>
            <button
              onClick={handleSubmit}
              disabled={busy}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60 shrink-0"
            >
              {busy ? <FaSpinner className="animate-spin" size={11} /> : <FaUpload size={11} />}
              {status === "uploading" ? "Uploading..." : status === "saving" ? "Saving..." : "Submit"}
            </button>
            <button
              onClick={() => { setExpanded(false); setFile(null); setError(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 px-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GradesTab({ courseId }: { courseId: number }) {
  const [grades, setGrades] = useState<import("../pages/StudentDashboard").GradeOut[]>([]);
  const [loading, setLoading] = useState(true);

  // Grades are fetched per-course by matching the semester
  useEffect(() => {
    apiFetch<{ id: number; subject: string; marks_obtained: number; total_marks: number; semester: number; percentage: number }[]>("/student/grades")
      .then(setGrades)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <FaSpinner className="animate-spin" /> Loading grades...
      </div>
    );
  }

  if (grades.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No grades recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
          <tr>
            <th className="p-4">Subject</th>
            <th className="p-4">Marks</th>
            <th className="p-4">Semester</th>
            <th className="p-4">Percentage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {grades.map((g) => (
            <tr key={g.id} className="hover:bg-slate-50">
              <td className="p-4 font-medium">{g.subject}</td>
              <td className="p-4">{g.marks_obtained} / {g.total_marks}</td>
              <td className="p-4">Sem {g.semester}</td>
              <td className="p-4">
                <span className={`font-bold ${
                  g.percentage >= 75 ? "text-emerald-600"
                  : g.percentage >= 50 ? "text-amber-600"
                  : "text-rose-600"
                }`}>
                  {g.percentage}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Export the GradeOut type so GradesTab can import it
export type GradeOut = {
  id: number;
  subject: string;
  marks_obtained: number;
  total_marks: number;
  semester: number;
  percentage: number;
};