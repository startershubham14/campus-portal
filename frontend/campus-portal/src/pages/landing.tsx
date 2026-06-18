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
        className="flex justify-between items-center w-full px-6 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-green-600"
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
          <a
            href="#"
            className="bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors duration-200"
          >
            Apply Now
          </a>
        </div>
      </div>
    </>
  );
}
function NavBar() {
  return (
    <>
      {/*logo on home page   */}
      <div
        id="nav"
        className="flex justify-between items-center w-full px-9 py-4 bg-blue-300 border-b-blue-900"
      >
        <Link to="/">
          <div id="logo-on-NavBar" className="bg-white">
            <img src={logo} alt="logo" className="w-12 h-12" />
          </div>
        </Link>
        <div className="flex items-center gap-8">
          <div
            id="Programs"
            className="text-black text-lg font-medium hover:text-blue-800 transition-colors duration-200"
          >
            About
          </div>
          <div
            id="Admissions"
            className="text-black text-lg font-medium  hover:text-blue-800 transition-colors duration-200"
          >
            Admissions
          </div>
          <div
            id="Campus Life"
            className="text-black text-lg font-medium  hover:text-blue-800 transition-colors duration-200"
          >
            Campus Life
          </div>
          <div
            id="Placements"
            className="text-black text-lg font-medium  hover:text-blue-800 transition-colors duration-200"
          >
            Placements
          </div>
          <div
            id=" Contact"
            className="text-black text-lg align-middle font-medium whitespace-nowrap  hover:text-blue-800 transition-colors duration-200"
          >
            Contact Us
          </div>
        </div>
      </div>
    </>
  );
}

function HeroSection() {
  const slides = [carousol_image1, carousol_image2, carousol_image3,carousol_image4];

  return (
    <>
      <div className="bg-blue-100 h-">
        <div className="w-7/10 m-auto py-11 ">
          <Carousel slides={slides} />
        </div>
      </div>
    </>
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
    <div className="overflow-hidden relative">
      <div
        className={`flex transition ease-out duration-40`}
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {slides.map((s) => {
          return <img className='min-w-full' src={s} />;
        })}
      </div>

      <div className="absolute top-0 h-full w-full justify-between items-center flex text-white px-10 text-9xl">
        <button onClick={previousSlide}>
          <GoChevronLeft />
        </button>
        <button onClick={nextSlide}>
          <GoChevronRight />
        </button>
      </div>

      <div className="absolute bottom-0 py-4 flex justify-center gap-3 w-full">
        {slides.map((s, i) => {
          return (
            <div
              onClick={() => {
                setCurrent(i);
              }}
              key={"circle" + i}
              className={`rounded-full w-5 h-5 cursor-pointer  ${
                i == current ? "bg-white" : "bg-gray-500"
              }`}
            ></div>
          );
        })}
      </div>
    </div>
  );
}
