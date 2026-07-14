import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useState } from "react";
import carousol_image1 from "../assets/carousol_image1.jpeg";
import carousol_image2 from "../assets/carousol_image2.jpeg";
import carousol_image3 from "../assets/carousol_image3.jpeg";
import carousol_image4 from "../assets/carousol_image4.jpeg";
import { GoChevronLeft } from "react-icons/go";
import { GoChevronRight } from "react-icons/go";
import { FaUserGraduate, FaChalkboardTeacher, FaBuilding, FaBriefcase } from "react-icons/fa";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { HiOutlineMailOpen, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { FaQuoteLeft } from "react-icons/fa";

export default function Landing() {
  return (
    <>
      <header>
        <TopBar />
        <NavBar />
        <HeroSection />
        <StatBar />
        <Testimonials />
        <Footer/>
      </header>
    </>
  );
}
//<NavBar/>
function TopBar() {
  return (
    <>
      <div
        id="top-bar"
        className="flex justify-between items-center w-full px-6 py-2 bg-gray-50 
        border-b border-gray-200 text-xs font-medium text-green-600"
      >
        <div>
          <a
            href="#"
            className="hover:text-green-800 transition-colors duration-200"
          >
            Admissions Open
          </a>
        </div>

        <div className="flex items-center space-x-6">
          <a
            href="#"
            className="hover:text-green-800 transition-colors duration-200"
          >
            Helpline
          </a>
          
        </div>
      </div>
    </>
  );
}

function NavBar() {
  return (
    <div
      id="nav"
      className="flex justify-between items-center w-full px-9 py-4 bg-indigo-950 border-b border-indigo-900"
    >
      <Link to="/">
        <div id="logo-on-NavBar" className="bg-white p-1 rounded">
          <img src={logo} alt="logo" className="w-12 h-12 object-contain" />
        </div>
      </Link>
      
      <nav className="flex items-center gap-8 text-white text-lg font-medium">
        <Link
          to="/about"
          className="hover:text-indigo-300 transition-colors duration-200"
        >
          About
        </Link>
        <Link
          to="/admissions"
          className="hover:text-indigo-300 transition-colors duration-200"
        >
          Admissions
        </Link>
        <Link
          to="/campus-life"
          className="hover:text-indigo-300 transition-colors duration-200"
        >
          Campus Life
        </Link>
        <Link
          to="/placements"
          className="hover:text-indigo-300 transition-colors duration-200"
        >
          Placements
        </Link>
        <Link
          to="/contact"
          className="whitespace-nowrap hover:text-indigo-300 transition-colors duration-200"
        >
          Contact Us
        </Link>
        <Link
            to="/login"
            className="bg-white text-black px-3 py-1.5 rounded-md hover:bg-blue-300
            transition-colors duration-200"
          >
            Portal Login
          </Link>
      </nav>
    </div>
  );
}


function HeroSection() {
  const slides = [
    carousol_image1,
    carousol_image2,
    carousol_image3,
    carousol_image4,
  ];

  return (
    <div className="bg-linear-to-b from-indigo-50 to-blue-100 h-auto">
      <div className="w-7/10 m-auto py-11 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-3">
            Welcome to Greenfield Institute of Technology
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-indigo-950 leading-tight mb-4">
            Shaping Tomorrow's Innovators, Today
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            A community of learners, educators, and creators building careers
            through hands-on education, research, and industry partnerships.
          </p>
          <div className="flex gap-4">
            <Link
              to="/admissions"
              className="bg-indigo-950 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-800 transition-colors duration-200"
            >
              Apply Now
            </Link>
            <Link
              to="/about"
              className="border border-indigo-950 text-indigo-950 px-6 py-3 rounded-md font-medium hover:bg-indigo-50 transition-colors duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
        <Carousel slides={slides} />
      </div>
    </div>
  );
}

function Carousel({ slides }: { slides: string[] }) {
  const [current, setCurrent] = useState(0);

  const previousSlide = () => {
    if (current === 0) setCurrent(slides.length - 1);
    else setCurrent(current - 1);
  };

  const nextSlide = () => {
    if (current === slides.length - 1) setCurrent(0);
    else setCurrent(current + 1);
  };

  return (
    <div className="overflow-hidden relative rounded-lg shadow-lg">
      <div
        className="flex transition-transform ease-out duration-500"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {slides.map((s, index) => (
          <img key={index} className="min-w-full object-cover" src={s} alt={`Slide ${index + 1}`} />
        ))}
      </div>

      <div className="absolute top-0 h-full w-full justify-between items-center flex text-white px-6 text-5xl">
        <button onClick={previousSlide} className="hover:scale-110 transition-transform">
          <GoChevronLeft />
        </button>
        <button onClick={nextSlide} className="hover:scale-110 transition-transform">
          <GoChevronRight />
        </button>
      </div>

      <div className="absolute bottom-0 py-4 flex justify-center gap-3 w-full bg-linear-to-t from-black/40 to-transparent">
        {slides.map((_, i) => (
          <div
            onClick={() => setCurrent(i)}
            key={"circle" + i}
            className={`rounded-full w-3 h-3 cursor-pointer transition-all ${
              i === current ? "bg-white scale-125" : "bg-gray-400"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}

const stats = [
  { icon: FaUserGraduate, value: "8,500+", label: "Students Enrolled" },
  { icon: FaChalkboardTeacher, value: "350+", label: "Faculty Members" },
  { icon: FaBuilding, value: "12", label: "Departments" },
  { icon: FaBriefcase, value: "92%", label: "Placement Rate" },
];

const StatBar = () => {
  return (
    <div className="w-full bg-white py-12">
      <div className="w-7/10 m-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center text-center">
            <Icon className="text-indigo-950 text-4xl mb-3" />
            <div className="text-3xl font-bold text-indigo-950">{value}</div>
            <div className="text-gray-500 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "B.Tech CSE, Final Year",
    initials: "AS",
    color: "bg-indigo-600",
    quote:
      "The hands-on project work and supportive faculty here pushed me to build things I never thought I could as a student. My internship at a fintech startup came directly through a campus placement drive.",
  },
  {
    name: "Rohan Mehta",
    role: "B.Tech Mechanical, Alumnus",
    initials: "RM",
    color: "bg-emerald-600",
    quote:
      "Great labs, an active student community, and professors who genuinely care about your growth. Three years after graduating, I still reach out to my mentors here for advice.",
  },
  {
    name: "Priya Nair",
    role: "MBA, Second Year",
    initials: "PN",
    color: "bg-rose-600",
    quote:
      "From case competitions to industry guest lectures, the campus keeps you engaged beyond the classroom. It's the kind of environment that shapes how you think, not just what you know.",
  },
];

const Testimonials = () => {
  return (
    <div className="w-full bg-indigo-50 py-16">
      <div className="w-7/10 m-auto">
        <h2 className="text-3xl font-bold text-indigo-950 text-center mb-2">
          What Our Students Say
        </h2>
        <p className="text-gray-500 text-center mb-10">
          Real experiences from our students and alumni
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(({ name, role, initials, color, quote }) => (
            <div
              key={name}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col"
            >
              <FaQuoteLeft className="text-indigo-200 text-3xl mb-4" />
              <p className="text-gray-600 text-sm flex-1 mb-6">{quote}</p>
              <div className="flex items-center gap-3">
                <div
                  className={`${color} text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0`}
                >
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-indigo-950 text-sm">{name}</div>
                  <div className="text-gray-500 text-xs">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-indigo-950 text-indigo-200">
      <div className="w-7/10 m-auto py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="bg-white p-1 rounded w-fit mb-4">
            <img src={logo} alt="logo" className="w-12 h-12 object-contain" />
          </div>
          <p className="text-sm">
            Greenfield Institute of Technology has been empowering students
            with quality education and industry-ready skills since 1998.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-white transition-colors duration-200">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/admissions" className="hover:text-white transition-colors duration-200">
                Admissions
              </Link>
            </li>
            <li>
              <Link to="/campus-life" className="hover:text-white transition-colors duration-200">
                Campus Life
              </Link>
            </li>
            <li>
              <Link to="/placements" className="hover:text-white transition-colors duration-200">
                Placements
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <HiOutlineLocationMarker className="text-lg shrink-0" />
              123 University Road, Greenfield, IN 411001
            </li>
            <li className="flex items-center gap-2">
              <HiOutlinePhone className="text-lg shrink-0" />
              +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <HiOutlineMailOpen className="text-lg shrink-0" />
              info@greenfieldtech.edu
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Follow Us</h3>
          <div className="flex gap-4 text-2xl">
            <a href="#" className="hover:text-white transition-colors duration-200">
              <FaFacebook />
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-indigo-900 py-4 text-center text-xs">
        © {new Date().getFullYear()} Greenfield Institute of Technology. All rights reserved.
      </div>
    </footer>
  );
};