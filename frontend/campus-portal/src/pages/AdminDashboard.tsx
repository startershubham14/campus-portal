import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers, FaChalkboardTeacher, FaGraduationCap,
  FaPlus, FaBuilding, FaSearch, FaSignOutAlt, FaTachometerAlt,
  FaToggleOn, FaToggleOff, FaSpinner, FaTimes, FaUserShield
} from "react-icons/fa";
import { useAuthGuard, logout } from "../hooks/useAuthGuard"

interface Stats {
  total_students: number;
  total_faculty: number;
  total_admins: number;
  active_users: number;
  inactive_users: number;
}

interface UserProfile {
  full_name: string;
  enrollment_no?: string;  // students
  employee_id?: string;    // faculty
  department: string;
  current_semester?: number;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  profile: UserProfile | null;
}


interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type UserRole = "student" | "faculty" | "admin";


const API = import.meta.env.VITE_API_URL;

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}


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
    apiFetch("/admin/stats")
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
      const params = new URLSearchParams({ role });
      if (search) params.set("search", search);
      const data = await apiFetch(`/admin/users?${params}`);
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
      const res = await apiFetch(`/admin/users/${userId}/toggle-active`, { method: "PATCH" });
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
                    <p className="font-bold text-slate-900">{user.profile?.full_name ?? "—"}</p>
                    <p className="text-slate-500 text-xs">{user.email}</p>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    {role === "student" ? user.profile?.enrollment_no
                    : role === "faculty" ? user.profile?.employee_id
                    : <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-sans font-bold">Admin</span>}
                  </td>
                  {role !== "admin" && (
                    <td className="p-4 text-slate-600">{user.profile?.department ?? "—"}</td>
                  )}
                  {role === "student" && (
                    <td className="p-4 text-slate-600">Sem {user.profile?.current_semester ?? "—"}</td>
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
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: form.role,
          full_name: form.full_name,
          // Send only if filled; server auto-generates if empty
          enrollment_no: form.enrollment_no || undefined,
          employee_id: form.employee_id || undefined,
        }),
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

          {/* Conditional ID fields — shown but optional (server auto-generates) */}
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


const MOCK_CLASSES = [
  { id: 1, name: "Advanced Artificial Intelligence Div-B", department: "Computer Science", semester: 8, studentsCount: 65 },
  { id: 2, name: "Data Structures & Algorithms", department: "Computer Science", semester: 3, studentsCount: 120 },
  { id: 3, name: "Engineering Mechanics", department: "Mechanical", semester: 1, studentsCount: 80 },
];

function ClassesTab() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Class Groups</h2>
        <button className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <FaPlus className="mr-2" /> Create Class
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CLASSES.map((cls) => (
          <div key={cls.id} className="flex flex-col border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow h-full">
            <div className="grow">
              <h3 className="font-bold text-slate-800 mb-2 leading-tight">{cls.name}</h3>
              <div className="space-y-1 mb-4">
                <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Dept:</span> {cls.department}</p>
                <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Semester:</span> {cls.semester}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 shrink-0">
              <div className="flex items-center text-xs text-slate-500 font-medium">
                <FaUsers className="mr-1.5" /> {cls.studentsCount} Enrolled
              </div>
              <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}