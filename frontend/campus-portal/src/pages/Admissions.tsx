import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout, { Section, SectionTitle } from "../components/PageLayout";
import { FaChevronDown } from "react-icons/fa";

const PROGRAMMES = [
  {
    level: "Undergraduate — B.Tech (4 years)",
    entrance: "MHT-CET or JEE Main",
    eligibility: "10+2 with Physics, Mathematics and one of Chemistry / Biology / Technical Vocational; minimum 50% aggregate (45% for reserved categories).",
    branches: [
      ["Computer Engineering", "180"],
      ["Information Technology", "120"],
      ["Artificial Intelligence & Data Science", "120"],
      ["Electronics & Telecommunication", "120"],
      ["Mechanical Engineering", "120"],
      ["Civil Engineering", "60"],
      ["Electrical Engineering", "60"],
      ["Instrumentation Engineering", "60"],
    ],
  },
  {
    level: "Postgraduate — M.Tech (2 years)",
    entrance: "GATE, or institute entrance for sponsored candidates",
    eligibility: "B.E. / B.Tech in a relevant discipline with minimum 50% aggregate.",
    branches: [
      ["Computer Engineering", "24"],
      ["Structural Engineering", "18"],
      ["VLSI & Embedded Systems", "18"],
      ["Design Engineering", "18"],
    ],
  },
  {
    level: "Management & Applications",
    entrance: "MAH-CET / CAT / CMAT for MBA · MAH-CET for MCA",
    eligibility: "Any bachelor's degree with minimum 50% aggregate (45% for reserved categories).",
    branches: [
      ["MBA (2 years)", "120"],
      ["MCA (2 years)", "60"],
    ],
  },
];

const STEPS = [
  { n: "01", t: "Appear for the entrance", d: "Sit MHT-CET or JEE Main for B.Tech, GATE for M.Tech, or MAH-CET/CAT/CMAT for MBA. Greenfield does not run a separate entrance exam." },
  { n: "02", t: "Register with the CET Cell", d: "Complete Maharashtra CET Cell registration and document verification. Greenfield's admission code is GFT-411." },
  { n: "03", t: "Fill your preferences", d: "List Greenfield and your preferred branch in the centralised admission process (CAP) option form." },
  { n: "04", t: "Receive your allotment", d: "Seats are allotted by merit and category across three CAP rounds. Watch the CET Cell portal for your round result." },
  { n: "05", t: "Report and confirm", d: "Bring originals to the admission office, pay the first-year fee, and collect your enrolment number." },
  { n: "06", t: "Get your portal login", d: "Your Campus Portal account is created by the admissions office once the fee is confirmed. Credentials reach you by email." },
];

const DATES = [
  ["MHT-CET 2026 result", "12 June 2026"],
  ["CAP registration opens", "18 June 2026"],
  ["Document verification", "18–28 June 2026"],
  ["CAP Round I allotment", "8 July 2026"],
  ["CAP Round II allotment", "22 July 2026"],
  ["CAP Round III allotment", "3 August 2026"],
  ["Institute-level round", "8–14 August 2026"],
  ["Term begins", "24 August 2026"],
];

const FEES = [
  ["B.Tech (all branches)", "₹1,45,000", "₹18,000"],
  ["M.Tech", "₹1,10,000", "₹18,000"],
  ["MBA", "₹1,65,000", "₹18,000"],
  ["MCA", "₹95,000", "₹18,000"],
];

const SCHOLARSHIPS = [
  { name: "Merit Scholarship", who: "Top 5% by entrance percentile", value: "50% tuition waiver, renewable on a CGPA of 8.5+" },
  { name: "Greenfield Need Grant", who: "Family income under ₹4 lakh p.a.", value: "Up to 75% tuition, assessed annually" },
  { name: "Government Schemes", who: "SC / ST / OBC / EWS / minority candidates", value: "As per Government of Maharashtra norms; the office files on your behalf" },
  { name: "Sports & Culture", who: "State or national representation", value: "25–100% tuition, reviewed by the sports board" },
];

const FAQS = [
  {
    q: "Does Greenfield conduct its own entrance exam?",
    a: "No. Admission is through the state CAP process on the basis of MHT-CET or JEE Main for B.Tech, GATE for M.Tech, and MAH-CET/CAT/CMAT for MBA. Anyone asking you to sit a private 'Greenfield entrance' is not associated with us.",
  },
  {
    q: "Can I change my branch after the first year?",
    a: "A limited number of branch transfers are permitted at the end of the first year, on the basis of first-year CGPA and seat availability in the receiving branch. Applications open in June.",
  },
  {
    q: "Is hostel accommodation guaranteed?",
    a: "Guaranteed for all first-year students and for every out-of-state student. Later years are allotted by distance from home and CGPA, and roughly 70% of applicants are accommodated.",
  },
  {
    q: "What is the refund policy if I withdraw?",
    a: "Refunds follow AICTE norms. A withdrawal before the term begins is refunded in full less ₹1,000 in processing. After that the refund reduces on a published sliding scale.",
  },
  {
    q: "Are there management-quota seats?",
    a: "Institute-level seats are filled after the CAP rounds, strictly by entrance merit, and the list is published. Greenfield does not accept capitation fees in any form.",
  },
  {
    q: "When do I get my Campus Portal login?",
    a: "Within 48 hours of your fee being confirmed. Accounts are created by the admissions office — there is no public sign-up — and your enrolment number is generated automatically.",
  },
];

export default function Admissions() {
  return (
    <PageLayout
      title="Admissions 2026–27"
      subtitle="Everything you need to apply, in the order you'll need it."
    >
      {/* Programmes */}
      <Section>
        <SectionTitle
          title="Programmes and intake"
          subtitle="Sanctioned intake for the 2026–27 session, as approved by AICTE."
        />
        <div className="mt-10 space-y-8">
          {PROGRAMMES.map((p) => (
            <div key={p.level} className="rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-indigo-950">{p.level}</h3>
              <p className="mt-1 text-sm font-semibold text-indigo-600">
                Entrance: {p.entrance}
              </p>
              <p className="mt-2 text-sm text-gray-600">{p.eligibility}</p>

              <table className="mt-5 w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="pb-2 font-medium">Branch</th>
                    <th className="pb-2 text-right font-medium">Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {p.branches.map(([b, seats]) => (
                    <tr key={b} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 text-gray-700">{b}</td>
                      <td className="py-2 text-right font-semibold text-indigo-950">{seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section tinted>
        <SectionTitle title="How admission works" subtitle="Six steps, in sequence. Nothing happens out of order." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-lg bg-white p-6 shadow-md">
              <span className="text-2xl font-bold text-indigo-200">{s.n}</span>
              <h3 className="mt-2 font-bold text-indigo-950">{s.t}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Dates + fees */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionTitle title="Key dates" subtitle="Indicative, and subject to the CET Cell calendar." />
            <table className="mt-6 w-full text-sm">
              <tbody>
                {DATES.map(([e, d]) => (
                  <tr key={e} className="border-b border-gray-100">
                    <td className="py-3 text-gray-600">{e}</td>
                    <td className="py-3 text-right font-semibold text-indigo-950">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <SectionTitle title="Fees" subtitle="Per year, for the 2026–27 session." />
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="pb-2 font-medium">Programme</th>
                  <th className="pb-2 text-right font-medium">Tuition</th>
                  <th className="pb-2 text-right font-medium">Other</th>
                </tr>
              </thead>
              <tbody>
                {FEES.map(([p, t, o]) => (
                  <tr key={p} className="border-b border-gray-100">
                    <td className="py-3 text-gray-600">{p}</td>
                    <td className="py-3 text-right font-semibold text-indigo-950">{t}</td>
                    <td className="py-3 text-right text-gray-500">{o}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-gray-400">
              Hostel and mess are billed separately at ₹78,000 per year. Fees are as
              approved by the Fee Regulating Authority.
            </p>
          </div>
        </div>
      </Section>

      {/* Scholarships */}
      <Section tinted>
        <SectionTitle
          title="Scholarships"
          subtitle="Roughly one student in four at Greenfield receives some form of assistance."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {SCHOLARSHIPS.map((s) => (
            <div key={s.name} className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="font-bold text-indigo-950">{s.name}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {s.who}
              </p>
              <p className="mt-2 text-sm text-gray-600">{s.value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionTitle title="Questions we get asked" center />
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-gray-200 border-y border-gray-200">
          {FAQS.map((f) => (
            <Faq key={f.q} {...f} />
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-indigo-950 p-8 text-center">
          <h3 className="text-xl font-bold text-white">Still have a question?</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-indigo-200">
            The admissions office answers on weekdays between 9:30 and 17:30.
          </p>
          <Link
            to="/contact"
            className="mt-5 inline-block rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-indigo-950 transition-colors hover:bg-blue-300"
          >
            Contact admissions
          </Link>
        </div>
      </Section>
    </PageLayout>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-indigo-950">{q}</span>
        <FaChevronDown
          className={`shrink-0 text-sm text-indigo-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-gray-600">{a}</p>}
    </div>
  );
}