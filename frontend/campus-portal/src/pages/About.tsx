import PageLayout, { Section, SectionTitle } from "../components/PageLayout";
import {
  FaAward,
  FaBullseye,
  FaEye,
  FaFlask,
  FaBookOpen,
  FaHandshake,
} from "react-icons/fa";

const MILESTONES = [
  { year: "1998", text: "Founded with three engineering branches and an intake of 180 students." },
  { year: "2004", text: "First postgraduate programmes introduced; Central Library opens." },
  { year: "2009", text: "Programmes accredited by the National Board of Accreditation." },
  { year: "2014", text: "School of Management established; MBA and MCA begin." },
  { year: "2019", text: "Centre for Advanced Computing and the Innovation Lab open." },
  { year: "2024", text: "Re-accredited A+ by NAAC; enrolment passes 8,500." },
];

const VALUES = [
  {
    Icon: FaBullseye,
    title: "Our Mission",
    body: "To give every student the technical depth, practical exposure and integrity to do useful work — and to make that education accessible regardless of background.",
  },
  {
    Icon: FaEye,
    title: "Our Vision",
    body: "To be the institute Western India turns to for engineers who can think rigorously, build carefully, and take responsibility for what they ship.",
  },
];

const PILLARS = [
  {
    Icon: FaFlask,
    title: "Learning by building",
    body: "Every programme carries a mandatory project each year, assessed on working software or hardware rather than a report alone.",
  },
  {
    Icon: FaBookOpen,
    title: "Teaching first",
    body: "A 1:24 faculty-to-student ratio, and every faculty member holds regular open office hours. Nobody's question waits a week.",
  },
  {
    Icon: FaHandshake,
    title: "Industry in the room",
    body: "Practitioners co-teach eleven electives. Our curriculum committee includes six alumni working in industry.",
  },
];

const LEADERSHIP = [
  { name: "Dr. Vikram Deshpande", role: "Principal", note: "Ph.D., IIT Bombay · Structural Engineering · 27 years in academia" },
  { name: "Dr. Sunita Rao", role: "Dean, Academics", note: "Ph.D., Pune University · Computer Science · Curriculum reform lead since 2016" },
  { name: "Prof. Imran Qureshi", role: "Dean, Student Affairs", note: "M.Tech., NIT Surathkal · Oversees hostels, clubs and student welfare" },
  { name: "Dr. Leena Kulkarni", role: "Head, Training & Placement", note: "Ph.D., Symbiosis · Built the placement cell from 12 to 140 recruiters" },
];

const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Artificial Intelligence & Data Science",
  "Instrumentation Engineering",
  "Applied Sciences & Humanities",
  "School of Management",
  "Computer Applications",
  "Research & Development Cell",
];

const ACCREDITATIONS = [
  { body: "NAAC", detail: "Accredited A+ (CGPA 3.51), valid to 2029" },
  { body: "NBA", detail: "Eight UG programmes accredited" },
  { body: "AICTE", detail: "Approved, All India Council for Technical Education" },
  { body: "University", detail: "Affiliated to Savitribai Phule Pune University" },
];

export default function About() {
  return (
    <PageLayout
      title="About Greenfield"
      subtitle="Twenty-seven years of teaching engineers to build things that work."
    >
      {/* Story */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionTitle title="Our story" />
            <div className="mt-5 space-y-4 text-gray-600">
              <p>
                Greenfield Institute of Technology opened in 1998 in a single block
                on University Road with three branches, eleven faculty members and
                180 students. The founding idea was unglamorous and has not changed:
                that an engineering graduate should be able to do the job on the
                first day, not the first year.
              </p>
              <p>
                That has meant resisting some fashions. We kept laboratory hours
                when others cut them. We made a year-long project compulsory in
                every programme, assessed on something that runs. We ask industry
                practitioners to co-teach rather than deliver one guest lecture and
                leave.
              </p>
              <p>
                Today Greenfield educates more than 8,500 students across twelve
                departments, with 350 faculty. The campus has grown to 42 acres. The
                first-day standard has not moved.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-6">
            <h3 className="font-semibold text-indigo-950">At a glance</h3>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Established", "1998"],
                ["Campus", "42 acres, Greenfield"],
                ["Students", "8,500+"],
                ["Faculty", "350+"],
                ["Departments", "12"],
                ["Faculty ratio", "1:24"],
                ["Placement rate", "92% (2025 batch)"],
                ["Alumni", "31,000+ worldwide"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-indigo-100 pb-2">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-semibold text-indigo-950">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      {/* Mission / Vision */}
      <Section tinted>
        <div className="grid gap-6 md:grid-cols-2">
          {VALUES.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-lg bg-white p-8 shadow-md">
              <Icon className="text-3xl text-indigo-600" />
              <h3 className="mt-4 text-xl font-bold text-indigo-950">{title}</h3>
              <p className="mt-2 text-gray-600">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Pillars */}
      <Section>
        <SectionTitle
          title="How we teach"
          subtitle="Three commitments that shape the timetable, not just the prospectus."
          center
        />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {PILLARS.map(({ Icon, title, body }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                <Icon className="text-xl text-indigo-600" />
              </div>
              <h3 className="mt-4 font-bold text-indigo-950">{title}</h3>
              <p className="mt-2 text-sm text-gray-600">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Milestones */}
      <Section tinted>
        <SectionTitle title="Milestones" subtitle="How the institute grew, in the order it happened." />
        <ol className="mt-10 border-l-2 border-indigo-200">
          {MILESTONES.map((m) => (
            <li key={m.year} className="relative ml-6 pb-8 last:pb-0">
              <span className="absolute -left-7.75 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
              <div className="font-bold text-indigo-950">{m.year}</div>
              <p className="mt-1 text-sm text-gray-600">{m.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Leadership */}
      <Section>
        <SectionTitle title="Leadership" subtitle="The people accountable for how the institute is run." />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {LEADERSHIP.map((p) => (
            <div key={p.name} className="flex gap-4 rounded-lg border border-gray-200 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                {p.name.split(" ").slice(-2).map((w) => w[0]).join("")}
              </div>
              <div>
                <div className="font-bold text-indigo-950">{p.name}</div>
                <div className="text-sm font-semibold text-indigo-600">{p.role}</div>
                <p className="mt-1 text-xs text-gray-500">{p.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Accreditation + departments */}
      <Section tinted>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionTitle title="Accreditation" subtitle="Independently assessed, and current." />
            <div className="mt-6 space-y-3">
              {ACCREDITATIONS.map((a) => (
                <div key={a.body} className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                  <FaAward className="mt-1 shrink-0 text-indigo-600" />
                  <div>
                    <div className="font-semibold text-indigo-950">{a.body}</div>
                    <div className="text-sm text-gray-500">{a.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle title="Departments" subtitle="Twelve, across engineering, management and sciences." />
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEPARTMENTS.map((d) => (
                <li key={d} className="rounded border border-indigo-100 bg-white px-3 py-2 text-sm text-gray-700">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}