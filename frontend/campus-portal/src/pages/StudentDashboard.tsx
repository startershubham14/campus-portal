import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBell, FaComment, FaExpand, FaHome, FaTachometerAlt, 
  FaBook, FaCalendarAlt, FaProjectDiagram, FaBars, 
  FaEllipsisV, FaChevronDown, FaFilePdf, FaUsers 
} from "react-icons/fa";

const MOCK_COURSES = [
  { id: 1, code: "CSC801", title: "Advanced Artificial Intelligence Div-B", color: "from-indigo-500 to-purple-600" },
  { id: 2, code: "CSD08011", title: "AI for Financial & Banking Application", color: "from-emerald-400 to-teal-600" },
  { id: 3, code: "CSD08022", title: "Recommendation Systems AIML SEM VIII", color: "from-amber-400 to-orange-500" },
  { id: 4, code: "CSL8011", title: "Advanced AI Lab Div-B", color: "from-blue-400 to-indigo-500" },
  { id: 5, code: "CSP701", title: "Major Project-1 DIV-B AIML", color: "from-rose-400 to-red-500" },
  { id: 6, code: "LO8021", title: "Project Management Div-B AIML", color: "from-cyan-400 to-blue-500" },
];

const MOCK_COURSE_CONTENT = [
  { id: 1, type: "attendance", title: "Class Attendance & Participation" },
  { id: 2, type: "pdf", title: "1_Vision & Mission Statements (Institute & Department)" },
  { id: 3, type: "pdf", title: "2_Program Outcomes (PO) & Objectives" },
  { id: 4, type: "pdf", title: "3_PEO_PSO Mapping" },
  { id: 5, type: "pdf", title: "4_Institute Academic Calendar 2025-26" },
  { id: 6, type: "pdf", title: "5_Department Academic Calendar" },
];

export default function StudentDashboard() {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (!token || role !== "student") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
            <FaComment size={18} className="cursor-pointer hover:text-white transition-colors" />
          </div>
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleLogout}>
            <span className="text-sm font-medium tracking-wide hidden sm:block text-slate-200 group-hover:text-white transition-colors">
              Student Profile
            </span>
            <div className="h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
              SP
            </div>
            <FaChevronDown size={12} className="text-slate-400 group-hover:text-white" />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 flex justify-between items-center px-6 py-0 shadow-sm text-sm font-semibold text-slate-600 overflow-x-auto z-10">
        <div className="flex space-x-1 min-w-max">
          <button onClick={() => setSelectedCourse(null)} className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-50 hover:text-indigo-700 transition-colors">
            <FaHome size={16} /> <span>Home</span>
          </button>
          <button onClick={() => setSelectedCourse(null)} className="flex items-center space-x-2 px-4 py-4 hover:bg-slate-50 hover:text-indigo-700 transition-colors">
            <FaTachometerAlt size={16} /> <span>Dashboard</span>
          </button>
          <button onClick={() => setSelectedCourse(null)} className={`flex items-center space-x-2 px-4 py-4 transition-colors ${!selectedCourse ? 'text-indigo-700 border-b-2 border-indigo-700' : 'hover:bg-slate-50 hover:text-indigo-700'}`}>
            <FaBook size={16} /> <span>My Courses</span>
          </button>
        </div>
        <button className="flex items-center space-x-2 text-slate-400 hover:text-slate-700  md:flex transition-colors">
          <FaExpand size={14} /> <span>Full screen</span>
        </button>
      </div>

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

function CourseOverview({ onSelectCourse }: { onSelectCourse: (course: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex gap-4 w-full md:w-auto">
          <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700">
            <option>All courses</option>
            <option>In progress</option>
            <option>Past</option>
          </select>
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none flex-1 md:w-64 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700"
          />
        </div>
        <div className="hidden sm:flex gap-4">
          <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm bg-white outline-none focus:border-indigo-500 text-slate-700">
            <option>Sort by course name</option>
            <option>Sort by last accessed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_COURSES.map((course) => (
          <div 
            key={course.id} 
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-70 group" 
            onClick={() => onSelectCourse(course)}
          >
            <div className={`h-36 bg-linear-to-r ${course.color} relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 mb-1 block">{course.code}</span>
                <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                  {course.title}
                </h3>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>25% complete</span>
                  <button className="text-slate-400 hover:text-slate-800 p-1" onClick={(e) => e.stopPropagation()}>
                    <FaEllipsisV />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseDetail({ course, onBack }: { course: any, onBack: () => void }) {
  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl min-h-150 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 text-sm flex items-center gap-2 overflow-x-auto whitespace-nowrap text-slate-500 font-medium">
        <button onClick={onBack} className="hover:text-indigo-700 hover:bg-slate-200 p-1.5 rounded transition-colors">
          <FaHome size={14} />
        </button>
        <span>/</span>
        <span className="cursor-pointer hover:text-indigo-700 transition-colors" onClick={onBack}>My courses</span> 
        <span>/</span>
        <span className="text-slate-800 font-bold">{course.code}</span>
      </div>

      <div className="px-6 md:px-10 mt-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{course.title}</h2>
        
        <div className="flex gap-8 border-b border-slate-200 text-sm font-bold text-slate-500 overflow-x-auto mb-8">
          <button className="pb-3 border-b-2 border-indigo-600 text-indigo-700 whitespace-nowrap">Course Content</button>
          <button className="pb-3 hover:text-slate-800 transition-colors whitespace-nowrap">Participants</button>
          <button className="pb-3 hover:text-slate-800 transition-colors whitespace-nowrap">Grades</button>
          <button className="pb-3 hover:text-slate-800 transition-colors whitespace-nowrap">Announcements</button>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden mb-10 shadow-sm">
          <div className="bg-slate-50 p-5 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-full border border-slate-300 shadow-sm">
                <FaChevronDown size={14} className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">General Information</h3>
            </div>
            <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">Collapse</span>
          </div>
          
          <div className="bg-white">
            {MOCK_COURSE_CONTENT.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-4 md:p-5 flex items-center space-x-5 hover:bg-slate-50 cursor-pointer pl-6 md:pl-12 transition-colors ${index !== MOCK_COURSE_CONTENT.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-100">
                  {item.type === 'attendance' ? (
                    <FaUsers size={20} className="text-indigo-600" />
                  ) : (
                    <FaFilePdf size={20} className="text-rose-500" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-700 hover:text-indigo-700 transition-colors">{item.title}</span>
                  {item.type === 'pdf' && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">PDF</span>
                      <span className="text-xs text-slate-400">1.2 MB</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}