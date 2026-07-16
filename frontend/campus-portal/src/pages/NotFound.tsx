import { Link } from "react-router-dom";
import PageLayout, { Section } from "../components/PageLayout";

const LINKS = [
  { to: "/about", label: "About Greenfield" },
  { to: "/admissions", label: "Admissions" },
  { to: "/campus-life", label: "Campus Life" },
  { to: "/placements", label: "Placements" },
  { to: "/contact", label: "Contact Us" },
  { to: "/login", label: "Portal Login" },
];

export default function NotFound() {
  return (
    <PageLayout
      title="Page not found"
      subtitle="That address doesn't exist on this site."
    >
      <Section>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-6xl font-bold text-indigo-200">404</p>
          <p className="mt-4 text-gray-600">
            The link may be out of date, or the address may have been mistyped.
            Here's everywhere you can go from here.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-950 transition-colors hover:bg-indigo-50"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <Link
            to="/"
            className="mt-8 inline-block rounded-md bg-indigo-950 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
          >
            Back to the homepage
          </Link>
        </div>
      </Section>
    </PageLayout>
  );
}