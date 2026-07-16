import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { HiOutlineMailOpen, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";

const QUICK_LINKS = [
  { to: "/about", label: "About Us" },
  { to: "/admissions", label: "Admissions" },
  { to: "/campus-life", label: "Campus Life" },
  { to: "/placements", label: "Placements" },
  { to: "/contact", label: "Contact Us" },
];

const SOCIALS = [
  { Icon: FaFacebook, label: "Facebook" },
  { Icon: FaInstagram, label: "Instagram" },
  { Icon: FaTwitter, label: "Twitter" },
  { Icon: FaLinkedin, label: "LinkedIn" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-indigo-950 text-indigo-200">
      <div className="m-auto grid w-7/10 grid-cols-1 gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="mb-4 w-fit rounded bg-white p-1">
            <img src={logo} alt="" className="h-12 w-12 object-contain" />
          </div>
          <p className="text-sm">
            Greenfield Institute of Technology has been empowering students with
            quality education and industry-ready skills since 1998.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors duration-200 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <HiOutlineLocationMarker className="shrink-0 text-lg" />
              123 University Road, Greenfield, IN 411001
            </li>
            <li className="flex items-center gap-2">
              <HiOutlinePhone className="shrink-0 text-lg" />
              +91 98XXX XXXXX
            </li>
            <li className="flex items-center gap-2">
              <HiOutlineMailOpen className="shrink-0 text-lg" />
              info@greenfieldtech.edu
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Follow Us</h3>
          <div className="flex gap-4 text-2xl">
            {SOCIALS.map(({ Icon, label }) => (
              <a
                key={label}
                href="/"
                aria-label={label}
                onClick={(e) => e.preventDefault()}
                className="cursor-default opacity-70"
                title="Demo site — social links are not active"
              >
                <Icon />
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-indigo-400">
            Greenfield is a fictional college built to demo the Campus Portal system.
          </p>
        </div>
      </div>

      <div className="border-t border-indigo-900 py-4 text-center text-xs">
        © {new Date().getFullYear()} Greenfield Institute of Technology. All rights reserved.
      </div>
    </footer>
  );
}