import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Portal Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800">Attendance Tracker</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">85%</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h3 className="text-lg font-semibold text-green-800">Current SGPA</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">8.4</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800">Pending Assignments</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">3</p>
          </div>
        </div>
      </div>
    </div>
  );
}