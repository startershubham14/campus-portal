import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, FaChalkboardTeacher, FaGraduationCap, 
  FaPlus, FaBuilding, FaSearch, FaSignOutAlt, FaTachometerAlt
} from "react-icons/fa";

// --- MOCK DATA ---
const MOCK_STATS = { totalStudents: 1240, totalFaculty: 85, activeClasses: 42 };

const MOCK_USERS = [
  { id: 1, name: "Alice Johnson", email: "student@college.edu", role: "Student", identifier: "STU-2026-001", dept: "Computer Science" },
  { id: 2, name: "Dr. Jane Smith", email: "faculty@college.edu", role: "Faculty", identifier: "FAC-2026-001", dept: "Computer Science" },
  { id: 3, name: "Bob Wilson", email: "bob@college.edu", role: "Student", identifier: "STU-2026-002", dept: "Mechanical" },
];

const MOCK_CLASSES = [
  { id: 1, name: "Advanced Artificial Intelligence Div-B", department: "Computer Science", semester: 8, studentsCount: 65 },
  { id: 2, name: "Data Structures & Algorithms", department: "Computer Science", semester: 3, studentsCount: 120 },
  { id: 3, name: "Engineering Mechanics", department: "Mechanical", semester: 1, studentsCount: 80 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    // Ensure only admins can access this page
    if (!token || role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <FaBuilding className="text-emerald-400 mr-3" size={24} />
          <span className="text-lg font-bold tracking-tight">Admin Console</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "overview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <FaTachometerAlt className="mr-3" size={18} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "users" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <FaUsers className="mr-3" size={18} /> User Management
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "classes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <FaChalkboardTeacher className="mr-3" size={18} /> Class Management
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center mb-4 px-2 text-slate-300">
            <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
              A
            </div>
            <div className="text-sm">
              <p className="font-bold text-white">System Admin</p>
              <p className="text-xs text-slate-400">admin@college.edu</p>
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
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab.replace("-", " ")}
          </h1>
          <div className="flex items-center">
             <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
               System Online
             </span>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "classes" && <ClassesTab />}
        </main>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-4">
            <FaGraduationCap size={28} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Students</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{MOCK_STATS.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mr-4">
            <FaChalkboardTeacher size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Faculty</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{MOCK_STATS.totalFaculty}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mr-4">
            <FaBuilding size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Classes</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{MOCK_STATS.activeClasses}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
          />
        </div>
        <button className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <FaPlus className="mr-2" /> Add New User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="p-4">Name / Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Identifier ID</th>
              <th className="p-4">Department</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-900">{user.name}</p>
                  <p className="text-slate-500 text-xs">{user.email}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    user.role === 'Student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 font-mono text-xs">{user.identifier}</td>
                <td className="p-4">{user.dept}</td>
                <td className="p-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
    /* 1. Added 'flex' and 'flex-col' to make the card a vertical flex container */
    <div key={cls.id} className="flex flex-col border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow h-full">
      
      {      /* 2. Wrapped the top content and added 'flex-grow' to push the footer down */}
      <div className="grow">
        <h3 className="font-bold text-slate-800 mb-2 leading-tight">{cls.name}</h3>
        <div className="space-y-1 mb-4">
          <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Dept:</span> {cls.department}</p>
          <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Semester:</span> {cls.semester}</p>
        </div>
      </div>

      {/* 3. Added 'flex-shrink-0' so this action bar keeps its exact height */}
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