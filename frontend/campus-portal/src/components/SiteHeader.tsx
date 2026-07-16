import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

/**
 * Shared public-site chrome. Lives in one place so a nav change doesn't mean
 * editing six pages. The active link is derived from the current route.
 */

const NAV_LINKS = [
  { to: "/about", label: "About" },
  { to: "/admissions", label: "Admissions" },
  { to: "/campus-life", label: "Campus Life" },
  { to: "/placements", label: "Placements" },
  { to: "/contact", label: "Contact Us" },
];

function TopBar() {
  return (
    <div className="flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-2 text-xs font-medium text-green-600">
      <Link to="/admissions" className="transition-colors duration-200 hover:text-green-800">
        Admissions Open — 2026&ndash;27
      </Link>
      <div className="flex items-center space-x-6">
        <a href="tel:+919876543210" className="transition-colors duration-200 hover:text-green-800">
          Helpline: +91 98XXX XXXXX
        </a>
      </div>
    </div>
  );
}

function NavBar() {
  const { pathname } = useLocation();

  return (
    <div
      id="nav"
      className="flex w-full items-center justify-between border-b border-indigo-900 bg-indigo-950 px-9 py-4"
    >
      <Link to="/">
        <div className="w-fit rounded bg-white p-1">
          <img src={logo} alt="Greenfield Institute of Technology" className="h-12 w-12 object-contain" />
        </div>
      </Link>

      <nav className="flex flex-wrap items-center gap-x-8 gap-y-2 text-base font-medium text-white lg:text-lg">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`whitespace-nowrap transition-colors duration-200 hover:text-indigo-300 ${
              pathname === link.to ? "text-indigo-300 underline underline-offset-8" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          to="/login"
          className="whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-black transition-colors duration-200 hover:bg-blue-300"
        >
          Portal Login
        </Link>
      </nav>
    </div>
  );
}

export default function SiteHeader() {
  return (
    <header>
      <TopBar />
      <NavBar />
    </header>
  );
}