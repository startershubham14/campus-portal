import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useState } from "react";
import carousol_image1 from "../assets/carousol_image1.jpeg";
import carousol_image2 from "../assets/carousol_image2.jpeg";
import carousol_image3 from "../assets/carousol_image3.jpeg";
import carousol_image4 from "../assets/carousol_image4.jpeg";
import { GoChevronLeft } from "react-icons/go";
import { GoChevronRight } from "react-icons/go";

export default function Landing() {
  return (
    <>
      <header>
        <TopBar />
        <NavBar />
        <HeroSection />
        <StatBar />
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
    <div className="bg-blue-100 h-auto">
      <div className="w-7/10 m-auto py-11">
        <Carousel slides={slides} />
      </div>
    </div>
  );
}

function Carousel({ slides }) {
  let [current, setCurrent] = useState(0);

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
        {slides.map((s, i) => (
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

const StatBar = () => {
  return <div className="w-full bg-white h-40"></div>;
};

const Footer = () => {
  return <footer className="bg-indigo-950 h-80" />;
};