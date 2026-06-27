import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBell, FaComment, FaExpand, FaHome, FaTachometerAlt, 
  FaBook, FaBars, FaEllipsisV, FaChevronDown, FaFilePdf, 
  FaUsers, FaPlus, FaUpload, FaCheckCircle, FaClipboardList
} from "react-icons/fa";
import { useAuthGuard, logout } from "../hooks/useAuthGuard";

interface Course {
  id: number;
  code: string;
  title: string;
  color: string;
  students: number ;
}

//
//  MOCK DATA
const MOCK_COURSES = [
  { id: 1, code: "CSC801", title: "Advanced Artificial Intelligence Div-B", color: "from-indigo-500 to-purple-600", students: 65 },
  { id: 2, code: "CSD08011", title: "Data Structures & Algorithms - Sem 3", color: "from-emerald-400 to-teal-600", students: 120 },
  { id: 3, code: "CSP701", title: "Major Project-1 AIML", color: "from-rose-400 to-red-500", students: 45 },
];

const MOCK_COURSE_CONTENT = [
  { id: 1, type: "attendance", title: "Class Attendance & Participation" },
  { id: 2, type: "pdf", title: "1_Vision & Mission Statements" },
  { id: 3, type: "pdf", title: "Chapter 1: Introduction to Neural Networks" },
];

const MOCK_ASSIGNMENTS = [
  { id: 1, title: "Implement Backpropagation", dueDate: "Oct 20, 2023", submissions: 45, total: 65 },
  { id: 2, title: "Mid-Term Project Proposal", dueDate: "Oct 25, 2023", submissions: 12, total: 65 },
];

export default function FacultyDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const navigate = useNavigate();

  const { loading } = useAuthGuard("faculty");

  const handleLogout = () => logout(navigate);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar (Navy) */}
      <div className="bg-slate-900 text-white flex justify-between items-center px-6 py-3 shadow-md z-20">
        <div className="flex items-center space-x-4">
          <FaBars className="text-slate-300 hover:text-white cursor-pointer" size={20} />
          <h1 className="text-xl font-bold tracking-tight">
            {selectedCourse ? selectedCourse.code : "Faculty Portal"}
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex space-x-5 text-slate-300">
            <div className="relative cursor-pointer hover:text-white transition-colors">
              <FaBell size={18} />
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 rounded-full">5</span>
            </div>
            <FaComment size={18} className="cursor-pointer hover:text-white transition-colors" />
          </div>
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleLogout}>
            <span className="text-sm font-medium tracking-wide hidden sm:block text-slate-200 group-hover:text-white transition-colors">
              Dr. Jane Smith
            </span>
            <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
              JS
            </div>
            <FaChevronDown size={12} className="text-slate-400 group-hover:text-white" />
          </div>
        </div>
      </div>

      {/* Secondary Navbar (White) */}
      <div className="bg-white border-b border-slate-200 flex justify-between items-center px-6 py-0 shadow-sm text-sm font-semibold text-slate-600 overflow-x-auto z-10">
        <div className="flex space-x-1 min-w-max">
          <button onClick={() => setSelectedCourse(null)} className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-50 hover:text-indigo-700 transition-colors">
            <FaHome size={16} /> <span>Home</span>
          </button>
          <button onClick={() => setSelectedCourse(null)} className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-50 hover:text-indigo-700 transition-colors">
            <FaTachometerAlt size={16} /> <span>Dashboard</span>
          </button>
          <button onClick={() => setSelectedCourse(null)} className={`flex items-center space-x-2 px-4 py-4 transition-colors ${!selectedCourse ? 'text-indigo-700 border-b-2 border-indigo-700' : 'hover:bg-slate-50 hover:text-indigo-700'}`}>
            <FaBook size={16} /> <span>My Classes</span>
          </button>
        </div>
        <button className="flex items-center space-x-2 text-slate-400 hover:text-slate-700 hidden md:flex transition-colors">
          <FaExpand size={14} /> <span>Full screen</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {!selectedCourse ? (
          <CourseOverview onSelectCourse={setSelectedCourse} />
        ) : (
          <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function CourseOverview({ onSelectCourse }: { onSelectCourse: (course: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex gap-4 w-full md:w-auto">
          <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700">
            <option>All classes</option>
            <option>Current Semester</option>
            <option>Past</option>
          </select>
          <input 
            type="text" 
            placeholder="Search my classes..." 
            className="border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none flex-1 md:w-64 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_COURSES.map((course) => (
          <div 
            key={course.id} 
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-[280px] group" 
            onClick={() => onSelectCourse(course)}
          >
            <div className={`h-36 bg-gradient-to-r ${course.color} relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                <FaUsers className="inline mr-1" /> {course.students}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 mb-1 block">{course.code}</span>
                <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                  {course.title}
                </h3>
              </div>
              <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500 font-medium">Manage Course</span>
                <button className="text-indigo-600 hover:text-indigo-800 p-1" onClick={(e) => e.stopPropagation()}>
                  <FaEllipsisV />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseDetail({ course, onBack }: { course: Course, onBack: () => void }) {
  const [courseTab, setCourseTab] = useState("content"); // 'content', 'assignments', 'grading'

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl min-h-[600px] overflow-hidden">
      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 text-sm flex items-center gap-2 overflow-x-auto whitespace-nowrap text-slate-500 font-medium">
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
          <h2 className="text-2xl font-bold text-slate-800">{course.title}</h2>
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1 rounded-full flex items-center">
            <FaUsers className="mr-1.5" /> {course.students} Students
          </span>
        </div>
        
        {/* Course Level Tabs */}
        <div className="flex gap-8 border-b border-slate-200 text-sm font-bold text-slate-500 overflow-x-auto mb-8">
          <button 
            onClick={() => setCourseTab("content")}
            className={`pb-3 whitespace-nowrap transition-colors ${courseTab === "content" ? "border-b-2 border-indigo-600 text-indigo-700" : "hover:text-slate-800"}`}
          >
            Course Content
          </button>
          <button 
            onClick={() => setCourseTab("assignments")}
            className={`pb-3 whitespace-nowrap transition-colors ${courseTab === "assignments" ? "border-b-2 border-indigo-600 text-indigo-700" : "hover:text-slate-800"}`}
          >
            Assignments
          </button>
          <button 
            onClick={() => setCourseTab("grading")}
            className={`pb-3 whitespace-nowrap transition-colors ${courseTab === "grading" ? "border-b-2 border-indigo-600 text-indigo-700" : "hover:text-slate-800"}`}
          >
            Grading
          </button>
        </div>

        {/* --- CONTENT TAB --- */}
        {courseTab === "content" && (
          <div className="space-y-6">
            {/* Inline Upload Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center"><FaUpload className="mr-2 text-indigo-600"/> Upload New Material</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Material Title (e.g., Week 1 Notes)" className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-100 transition-colors">
                  Choose File...
                </button>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Upload
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <FaChevronDown size={14} className="text-indigo-600" />
                  <h3 className="font-bold text-slate-800">General Information</h3>
                </div>
              </div>
              <div className="bg-white">
                {MOCK_COURSE_CONTENT.map((item, index) => (
                  <div key={item.id} className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors pl-10 ${index !== MOCK_COURSE_CONTENT.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                        {item.type === 'attendance' ? <FaUsers size={16} className="text-indigo-600" /> : <FaFilePdf size={16} className="text-rose-500" />}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700 hover:text-indigo-700 cursor-pointer">{item.title}</span>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-rose-600 hover:text-rose-800">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- ASSIGNMENTS TAB --- */}
        {courseTab === "assignments" && (
          <div className="space-y-6">
            {/* Inline Create Form */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center"><FaPlus className="mr-2 text-indigo-600"/> Create New Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input type="text" placeholder="Assignment Title" className="col-span-2 border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" />
                <input type="date" className="col-span-1 border border-slate-300 rounded px-3 py-2 text-sm text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none" />
                <button className="col-span-1 bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Create
                </button>
              </div>
            </div>

            {/* Assignments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_ASSIGNMENTS.map((assignment) => (
                <div key={assignment.id} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-all bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-800 text-md">{assignment.title}</h3>
                    <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2 py-1 rounded border border-rose-100">
                      Due: {assignment.dueDate}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 font-bold mb-1.5">
                      <span>Submissions</span>
                      <span>{assignment.submissions} / {assignment.total}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(assignment.submissions / assignment.total) * 100}%` }}></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setCourseTab("grading")}
                    className="w-full bg-indigo-50 text-indigo-700 py-2 rounded text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle /> Go to Grading
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- GRADING TAB --- */}
        {courseTab === "grading" && (
          <div className="border border-slate-200 rounded-xl p-10 text-center text-slate-500 bg-slate-50">
            <FaClipboardList className="mx-auto text-4xl mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">Student Submissions</h3>
            <p className="text-sm">The grading grid for <strong>{course.code}</strong> will appear here when connected to the backend.</p>
          </div>
        )}
      </div>
    </div>
  );
}