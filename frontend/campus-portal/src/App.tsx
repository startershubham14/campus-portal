import Landing from './pages/landing'
import Login from './pages/login'
import About from './pages/About'
import Admissions from './pages/Admissions'
import CampusLife from './pages/CampusLife'
import Placements from './pages/Placements'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import StudentDashboard from './pages/StudentDashboard'
import FacultyDashboard from './pages/FacultyDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      {/* Router keeps scroll position between pages by default; reset it. */}
      <ScrollToTop />
      <Routes>
        {/* Public site */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/admissions" element={<Admissions />} />
        <Route path="/campus-life" element={<CampusLife />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />

        {/* Portal */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}