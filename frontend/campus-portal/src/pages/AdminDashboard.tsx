import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers, FaChalkboardTeacher, FaGraduationCap,
  FaPlus, FaBuilding, FaSearch, FaSignOutAlt, FaTachometerAlt,
  FaToggleOn, FaToggleOff, FaSpinner, FaTimes, FaUserShield,
  FaTrash, FaArrowLeft
} from "react-icons/fa";
import { useAuthGuard, logout } from "../hooks/useAuthGuard";
import { adminService } from "../services/adminService";
import type {
  Stats, AdminUser, ClassOut, ClassDetail, Role,
} from "../services/types";

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type UserRole = Role;


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { user, loading } = useAuthGuard("admin");

  const handleLogout = () => logout(navigate);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <FaBuilding className="text-emerald-400 mr-3" size={24} />
          <span className="text-lg font-bold tracking-tight">Admin Console</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "overview", label: "Dashboard", icon: <FaTachometerAlt size={18} /> },
            { id: "users",    label: "User Management", icon: <FaUsers size={18} /> },
            { id: "classes",  label: "Class Management", icon: <FaChalkboardTeacher size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="mr-3">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center mb-4 px-2 text-slate-300">
            <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="text-sm overflow-hidden">
              <p className="font-bold text-white">System Admin</p>
              {/* Real admin email from the session, not hardcoded */}
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-slate-800 text-rose-400 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-rose-300 transition-colors"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab.replace("-", " ")}
          </h1>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            System Online
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "users"    && <UsersTab />}
          {activeTab === "classes"  && <ClassesTab />}
        </main>
      </div>
    </div>
  );
}


function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService.getStats()
      .then(setStats)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-red-500 text-sm">Failed to load stats: {error}</p>;
  }

  const cards = stats
    ? [
        { label: "Total Students", value: stats.total_students,  icon: <FaGraduationCap size={28} />, color: "bg-indigo-100 text-indigo-600" },
        { label: "Total Faculty",  value: stats.total_faculty,   icon: <FaChalkboardTeacher size={24} />, color: "bg-emerald-100 text-emerald-600" },
        { label: "Total Admins",   value: stats.total_admins,    icon: <FaUserShield size={24} />, color: "bg-purple-100 text-purple-600" },
        { label: "Active Users",   value: stats.active_users,    icon: <FaToggleOn size={24} />, color: "bg-teal-100 text-teal-600" },
        { label: "Inactive Users", value: stats.inactive_users,  icon: <FaToggleOff size={24} />, color: "bg-rose-100 text-rose-600" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {!stats ? (
        <div className="flex items-center text-slate-400 text-sm gap-2">
          <FaSpinner className="animate-spin" /> Loading stats...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center"
            >
              <div className={`h-14 w-14 ${card.color} rounded-lg flex items-center justify-center mr-4 shrink-0`}>
                {card.icon}
              </div>
              <div>
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</h3>
                <p className="text-3xl font-bold text-slate-800 mt-1">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



function UsersTab() {
  const [role, setRole] = useState<UserRole>("student");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); // local input before debounce
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Build and call the list endpoint whenever role or search changes
  const fetchUsers = useCallback(async () => {
    setFetching(true);
    setError("");
    try {
      const data = await adminService.listUsers({ role: role as Role, search });
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setFetching(false);
    }
  }, [role, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search: only fire the API call 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleToggleActive = async (userId: string) => {
    setTogglingId(userId);
    try {
      const res = await adminService.toggleUserActive(userId);
      // Update in-place so the whole list doesn't re-fetch
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.is_active } : u))
      );
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to toggle user");
    } finally {
      setTogglingId(null);
    }
  };

  const roleTabs: { id: UserRole; label: string }[] = [
    { id: "student", label: "Students" },
    { id: "faculty", label: "Faculty" },
    { id: "admin",   label: "Admins" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Role tabs */}
      <div className="flex border-b border-slate-200">
        {roleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setRole(tab.id); setSearchInput(""); setSearch(""); }}
            className={`px-6 py-4 text-sm font-semibold transition-colors ${
              role === tab.id
                ? "border-b-2 border-indigo-600 text-indigo-700"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            placeholder={`Search ${role}s...`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <FaPlus className="mr-2" /> Add New User
        </button>
      </div>

      {/* Table */}
      {error ? (
        <p className="p-6 text-red-500 text-sm">{error}</p>
      ) : fetching ? (
        <div className="p-10 flex justify-center text-slate-400 text-sm gap-2">
          <FaSpinner className="animate-spin" /> Loading...
        </div>
      ) : users.length === 0 ? (
        <p className="p-10 text-center text-slate-400 text-sm">No {role}s found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="p-4">Name / Email</th>
                <th className="p-4">
                  {role === "student" ? "Enrollment No" : role === "faculty" ? "Employee ID" : "Role"}
                </th>
                {role !== "admin" && <th className="p-4">Department</th>}
                {role === "student" && <th className="p-4">Semester</th>}
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className={`text-sm text-slate-700 hover:bg-slate-50 transition-colors ${!user.is_active ? "opacity-50" : ""}`}>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{user.profile?.full_name ?? "-"}</p>
                    <p className="text-slate-500 text-xs">{user.email}</p>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    {role === "student" ? user.profile?.enrollment_no
                    : role === "faculty" ? user.profile?.employee_id
                    : <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-sans font-bold">Admin</span>}
                  </td>
                  {role !== "admin" && (
                    <td className="p-4 text-slate-600">{user.profile?.department ?? "-"}</td>
                  )}
                  {role === "student" && (
                    <td className="p-4 text-slate-600">Sem {user.profile?.current_semester ?? "-"}</td>
                  )}
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      user.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      disabled={togglingId === user.id}
                      title={user.is_active ? "Deactivate user" : "Reactivate user"}
                      className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                        user.is_active
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {togglingId === user.id
                        ? <FaSpinner className="animate-spin inline" />
                        : user.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create user modal */}
      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}




function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student" as UserRole,
    full_name: "",
    enrollment_no: "",
    employee_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.full_name) {
      setError("Email, password, and full name are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await adminService.createUser({
        email: form.email,
        password: form.password,
        role: form.role,
        full_name: form.full_name,
        // Send only if filled; server auto-generates if empty
        enrollment_no: form.enrollment_no || undefined,
        employee_id: form.employee_id || undefined,
      });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Add New User</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {field("Full Name", "full_name", "text", "e.g. John Doe")}
          {field("Email", "email", "email", "e.g. john@college.edu")}
          {field("Password", "password", "password", "Min 8 characters")}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

         
          {form.role === "student" && field("Enrollment No (optional)", "enrollment_no", "text", "Auto-generated if blank")}
          {form.role === "faculty" && field("Employee ID (optional)", "employee_id", "text", "Auto-generated if blank")}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {submitting && <FaSpinner className="animate-spin" size={13} />}
            {submitting ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ClassesTab - list + create + manage

function ClassesTab() {
  const [classes, setClasses] = useState<ClassOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassOut | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminService.listClasses();
      setClasses(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleDelete = async (classId: number) => {
    if (!confirm("Delete this class? This will unenroll all students and remove all faculty assignments.")) return;
    try {
      await adminService.deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  if (selectedClass) {
    return (
      <ClassManagePanel
        classInfo={selectedClass}
        onBack={() => { setSelectedClass(null); fetchClasses(); }}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Class Groups</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <FaPlus className="mr-2" /> Create Class
        </button>
      </div>

      {loading ? (
        <div className="p-10 flex justify-center text-slate-400 text-sm gap-2">
          <FaSpinner className="animate-spin" /> Loading...
        </div>
      ) : error ? (
        <p className="p-6 text-red-500 text-sm">{error}</p>
      ) : classes.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <FaChalkboardTeacher size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No classes yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="flex flex-col border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-indigo-600 font-mono">{cls.code}</span>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors"
                    title="Delete class"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 mb-3 leading-tight text-sm">{cls.name}</h3>
                <div className="space-y-1 mb-4">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Dept:</span> {cls.department}
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Semester:</span> {cls.semester}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div className="flex gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><FaUsers size={11} /> {cls.student_count}</span>
                  <span className="flex items-center gap-1"><FaChalkboardTeacher size={11} /> {cls.faculty_count}</span>
                </div>
                <button
                  onClick={() => setSelectedClass(cls)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Manage →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateClassModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchClasses(); }}
        />
      )}
    </div>
  );
}

// Create class 
function CreateClassModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ code: "", name: "", department: "", semester: "1" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.department) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await adminService.createClass({
        code: form.code,
        name: form.name,
        department: form.department,
        semester: parseInt(form.semester),
      });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create class");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Create New Class</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FaTimes size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-lg">{error}</p>}
          {[
            { label: "Class Code", key: "code", placeholder: "e.g. CSC801" },
            { label: "Class Name", key: "name", placeholder: "e.g. Advanced AI Div-B" },
            { label: "Department",  key: "department", placeholder: "e.g. Computer Science" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
            <select
              value={form.semester}
              onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[1,2,3,4,5,6,7,8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
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
            {submitting ? "Creating..." : "Create Class"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Class manage panel - assign faculty, enroll students

type ManageTab = "faculty" | "students";

function ClassManagePanel({ classInfo, onBack }: { classInfo: ClassOut; onBack: () => void }) {
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [activeTab, setActiveTab] = useState<ManageTab>("faculty");
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await adminService.getClass(classInfo.id);
      setDetail(data);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [classInfo.id]);

  // Fetch available users when tab changes or search changes
  useEffect(() => {
    const role: Role = activeTab === "faculty" ? "faculty" : "student";
    adminService.listUsers({ role, search })
      .then(setAllUsers)
      .catch(() => {});
  }, [activeTab, search]);

  const assignedIds = new Set(
    (activeTab === "faculty" ? detail?.faculty : detail?.students)?.map((p) => p.user_id) ?? []
  );

  const handleAssign = async (userId: string) => {
    setActing(userId);
    try {
      if (activeTab === "faculty") {
        await adminService.assignFaculty(classInfo.id, userId);
      } else {
        await adminService.enrollStudent(classInfo.id, userId);
      }
      await fetchDetail();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setActing(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setActing(userId);
    try {
      if (activeTab === "faculty") {
        await adminService.removeFaculty(classInfo.id, userId);
      } else {
        await adminService.unenrollStudent(classInfo.id, userId);
      }
      await fetchDetail();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setActing(null);
    }
  };

  const assigned = (activeTab === "faculty" ? detail?.faculty : detail?.students) ?? [];
  const unassigned = allUsers.filter((u) => !assignedIds.has(String(u.id)));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
     
      <div className="p-5 border-b border-slate-200 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <FaArrowLeft size={13} /> Back
        </button>
        <div>
          <span className="text-xs font-bold text-indigo-600 font-mono">{classInfo.code}</span>
          <h2 className="text-base font-bold text-slate-800 leading-tight">{classInfo.name}</h2>
        </div>
      </div>


      <div className="flex border-b border-slate-200">
        {(["faculty", "students"] as ManageTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch(""); }}
            className={`px-6 py-4 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-700"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "faculty" ? "Assigned Faculty" : "Enrolled Students"}
          </button>
        ))}
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {activeTab === "faculty" ? "Currently Assigned" : "Currently Enrolled"} ({assigned.length})
          </h3>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <FaSpinner className="animate-spin" /> Loading...
            </div>
          ) : assigned.length === 0 ? (
            <p className="text-xs text-slate-400 italic">None yet.</p>
          ) : (
            <div className="space-y-2">
              {assigned.map((person) => (
                <div
                  key={person.user_id}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{person.full_name}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      {person.employee_id ?? person.enrollment_no}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(person.user_id)}
                    disabled={acting === person.user_id}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                  >
                    {acting === person.user_id ? <FaSpinner className="animate-spin" size={12} /> : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Add {activeTab === "faculty" ? "Faculty" : "Student"}
          </h3>
          <input
            type="text"
            placeholder={`Search ${activeTab === "faculty" ? "faculty" : "students"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {unassigned.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                {search ? "No results found." : "All available users are already assigned."}
              </p>
            ) : (
              unassigned.map((u) => (
                <div
                  key={String(u.id)}
                  className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-indigo-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{u.profile?.full_name ?? u.email}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      {u.profile?.employee_id ?? u.profile?.enrollment_no ?? u.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAssign(String(u.id))}
                    disabled={acting === String(u.id)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                  >
                    {acting === String(u.id) ? <FaSpinner className="animate-spin" size={12} /> : "+ Add"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}