import { useState } from "react";
import PageLayout, { Section, SectionTitle } from "../components/PageLayout";
import {
  HiOutlineMailOpen,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineClock,
} from "react-icons/hi";
import { FaInfoCircle } from "react-icons/fa";

const OFFICES = [
  { name: "Admissions Office", phone: "+91 98XXX XXXXX", email: "admissions@greenfieldtech.edu", hours: "Mon–Sat, 09:30–17:30" },
  { name: "Examination Section", phone: "+91 98XXX XXXXX", email: "exams@greenfieldtech.edu", hours: "Mon–Fri, 10:00–17:00" },
  { name: "Training & Placement", phone: "+91 98XXX XXXXX", email: "placements@greenfieldtech.edu", hours: "Mon–Fri, 09:30–18:00" },
  { name: "Hostel Office", phone: "+91 98XXX XXXXX", email: "hostel@greenfieldtech.edu", hours: "Mon–Sat, 09:00–19:00" },
  { name: "Accounts", phone: "+91 98XXX XXXXX", email: "accounts@greenfieldtech.edu", hours: "Mon–Fri, 10:00–16:30" },
  { name: "Student Grievances", phone: "+91 98XXX XXXXX", email: "grievance@greenfieldtech.edu", hours: "Mon–Fri, 11:00–16:00" },
];

const SUBJECTS = [
  "Admissions enquiry",
  "Fees and scholarships",
  "Hostel and transport",
  "Placements",
  "Examination and results",
  "Something else",
];

export default function Contact() {
  return (
    <PageLayout
      title="Contact Us"
      subtitle="Who to ask, and when they'll be at their desk."
    >
      {/* Primary contact + form */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionTitle title="Reach the campus" />

            <div className="mt-6 space-y-5">
              <div className="flex gap-4">
                <HiOutlineLocationMarker className="mt-0.5 shrink-0 text-xl text-indigo-600" />
                <div>
                  <div className="font-semibold text-indigo-950">Address</div>
                  <p className="mt-1 text-sm text-gray-600">
                    Greenfield Institute of Technology
                    <br />
                    123 University Road
                    <br />
                    Greenfield, Maharashtra 411001
                    <br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <HiOutlinePhone className="mt-0.5 shrink-0 text-xl text-indigo-600" />
                <div>
                  <div className="font-semibold text-indigo-950">Main line</div>
                  <p className="mt-1 text-sm text-gray-600">
                    +91 98XXX XXXXX
                    <br />
                    <span className="text-gray-400">Reception routes to the right office.</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <HiOutlineMailOpen className="mt-0.5 shrink-0 text-xl text-indigo-600" />
                <div>
                  <div className="font-semibold text-indigo-950">Email</div>
                  <p className="mt-1 text-sm text-gray-600">info@greenfieldtech.edu</p>
                </div>
              </div>

              <div className="flex gap-4">
                <HiOutlineClock className="mt-0.5 shrink-0 text-xl text-indigo-600" />
                <div>
                  <div className="font-semibold text-indigo-950">Campus hours</div>
                  <p className="mt-1 text-sm text-gray-600">
                    Monday to Saturday, 08:00–20:00
                    <br />
                    <span className="text-gray-400">Offices close at 17:30 and on Sundays.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Map stand-in — honest about being a placeholder */}
            <div className="mt-8 flex h-56 flex-col items-center justify-center rounded-lg border border-dashed border-indigo-200 bg-indigo-50 text-center">
              <HiOutlineLocationMarker className="text-3xl text-indigo-300" />
              <p className="mt-2 text-sm font-medium text-indigo-950">
                123 University Road, Greenfield 411001
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Greenfield is a fictional campus, so there's no map to embed.
              </p>
            </div>
          </div>

          <EnquiryForm />
        </div>
      </Section>

      {/* Offices */}
      <Section tinted>
        <SectionTitle
          title="Office directory"
          subtitle="Going direct is faster than the main line."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {OFFICES.map((o) => (
            <div key={o.name} className="rounded-lg bg-white p-5 shadow-md">
              <h3 className="font-bold text-indigo-950">{o.name}</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <HiOutlinePhone className="shrink-0 text-indigo-400" />
                  {o.phone}
                </li>
                <li className="flex items-center gap-2">
                  <HiOutlineMailOpen className="shrink-0 text-indigo-400" />
                  <span className="break-all">{o.email}</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <HiOutlineClock className="shrink-0" />
                  {o.hours}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </PageLayout>
  );
}

function EnquiryForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Name, email and message are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("That email address doesn't look right.");
      return;
    }
    setError("");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex h-full flex-col justify-center rounded-lg border border-indigo-100 bg-indigo-50 p-8 text-center">
        <h3 className="text-xl font-bold text-indigo-950">Nothing was sent</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm text-gray-600">
          Greenfield is a fictional college built to demonstrate the Campus Portal
          system, so this form deliberately has nowhere to post to. Your details
          were validated and then discarded — nothing left the browser.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setForm({ name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
          }}
          className="mx-auto mt-6 rounded-md bg-indigo-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
        >
          Back to the form
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-8">
      <SectionTitle title="Send an enquiry" />

      <div className="mt-4 flex gap-2.5 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
        <FaInfoCircle className="mt-0.5 shrink-0" />
        <span>
          This is a demo site. The form validates your input but doesn't send
          anything anywhere.
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <Field label="Full name" required>
          <input
            type="text"
            value={form.name}
            onChange={set("name")}
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" required>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              maxLength={120}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              maxLength={20}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </Field>
        </div>

        <Field label="What is this about?">
          <select
            value={form.subject}
            onChange={set("subject")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Message" required>
          <textarea
            rows={5}
            value={form.message}
            onChange={set("message")}
            maxLength={2000}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </Field>

        <button
          onClick={handleSubmit}
          className="w-full rounded-md bg-indigo-950 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
        >
          Send enquiry
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}