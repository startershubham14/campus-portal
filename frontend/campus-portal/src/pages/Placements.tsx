import PageLayout, { Section, SectionTitle } from "../components/PageLayout";
import { FaQuoteLeft, FaBriefcase, FaRupeeSign, FaBuilding, FaChartLine } from "react-icons/fa";

const HEADLINE = [
  { Icon: FaChartLine, value: "92%", label: "Placed, 2025 batch" },
  { Icon: FaRupeeSign, value: "₹8.4 LPA", label: "Median package" },
  { Icon: FaBriefcase, value: "₹46 LPA", label: "Highest package" },
  { Icon: FaBuilding, value: "140", label: "Recruiters on campus" },
];

const BY_BRANCH = [
  ["Computer Engineering", "98%", "₹11.2 LPA", "₹46 LPA"],
  ["Information Technology", "96%", "₹10.1 LPA", "₹32 LPA"],
  ["AI & Data Science", "95%", "₹10.8 LPA", "₹38 LPA"],
  ["Electronics & Telecomm.", "91%", "₹7.6 LPA", "₹24 LPA"],
  ["Electrical Engineering", "88%", "₹6.4 LPA", "₹18 LPA"],
  ["Mechanical Engineering", "87%", "₹6.1 LPA", "₹19 LPA"],
  ["Instrumentation", "86%", "₹5.9 LPA", "₹14 LPA"],
  ["Civil Engineering", "84%", "₹5.4 LPA", "₹12 LPA"],
];

const TRENDS = [
  ["2021", "83%", "₹5.2 LPA"],
  ["2022", "86%", "₹6.1 LPA"],
  ["2023", "88%", "₹7.0 LPA"],
  ["2024", "90%", "₹7.8 LPA"],
  ["2025", "92%", "₹8.4 LPA"],
];

const RECRUITERS = {
  "Product & software": ["Zoho", "Freshworks", "Postman", "Browserstack", "Razorpay", "Zeta", "Chargebee", "Hasura"],
  "Services & consulting": ["Infosys", "TCS", "Wipro", "Cognizant", "Accenture", "Capgemini", "LTIMindtree", "Persistent"],
  "Core engineering": ["Tata Motors", "Bajaj Auto", "Thermax", "Cummins", "Kirloskar", "L&T", "Forbes Marshall", "Alfa Laval"],
  "Finance & analytics": ["Deutsche Bank", "Barclays", "Mastercard", "Fractal", "Mu Sigma", "ICICI Bank"],
};

const PROCESS = [
  { n: "01", t: "Register with the cell", d: "Final-year students register in July. One offer above ₹10 LPA closes your eligibility for further drives — the policy is published and applies to everyone." },
  { n: "02", t: "Pre-placement training", d: "Aptitude, DSA, and mock interviews run through the sixth and seventh semesters. 120 hours, and attendance is tracked." },
  { n: "03", t: "Company pre-talk", d: "Recruiters present the role, stack and compensation on campus before applications open." },
  { n: "04", t: "Online assessment", d: "Most firms screen with an aptitude or coding round, proctored in our labs." },
  { n: "05", t: "Interviews", d: "Technical rounds, then HR. Held on campus, or virtually where the recruiter prefers." },
  { n: "06", t: "Offer and rollout", d: "Offers are released through the cell. The cell tracks joining and follows up on delayed onboarding." },
];

const TRAINING = [
  { t: "Aptitude & reasoning", d: "40 hours across semester six, taught in batches of 60 with weekly sectional tests." },
  { t: "Data structures & algorithms", d: "50 hours, contest-based. The Codechef chapter runs a parallel ladder for the product-company track." },
  { t: "Communication & GD", d: "Group discussion, résumé clinics, and recorded mock interviews with playback review." },
  { t: "Domain electives", d: "Eleven electives co-taught with practitioners, mapped to what recruiters actually screen for." },
];

const OUTCOMES = [
  {
    name: "Ananya Sharma",
    role: "B.Tech CSE, 2025 · SDE at Razorpay",
    initials: "AS",
    color: "bg-indigo-600",
    quote: "The DSA ladder the placement cell ran with Codechef was the difference. I'd done the coursework, but eight months of contests is what got me through the interviews.",
  },
  {
    name: "Rohan Mehta",
    role: "B.Tech Mechanical, 2022 · Design Engineer at Cummins",
    initials: "RM",
    color: "bg-emerald-600",
    quote: "Core companies don't visit every campus any more. Greenfield's cell kept the relationships alive, and the final-year project is what I actually talked about in my interview.",
  },
  {
    name: "Priya Nair",
    role: "MBA, 2024 · Analyst at Deutsche Bank",
    initials: "PN",
    color: "bg-rose-600",
    quote: "The mock interviews were harder than the real one. That was the point, and I only understood it afterwards.",
  },
];

export default function Placements() {
  return (
    <PageLayout
      title="Placements"
      subtitle="Where the 2025 batch went, and how the cell got them there."
    >
      {/* Headline numbers */}
      <Section>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {HEADLINE.map(({ Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-3 text-3xl text-indigo-950" />
              <div className="text-3xl font-bold text-indigo-950">{value}</div>
              <div className="mt-1 text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-gray-400">
          Figures cover the 2025 graduating batch, registered and eligible students only. Audited by the institute's placement committee.
        </p>
      </Section>

      {/* By branch */}
      <Section tinted>
        <SectionTitle title="By branch" subtitle="2025 batch. Median is a fairer read than average — a single high offer moves an average a long way." />
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-140 bg-white text-sm shadow-sm">
            <thead>
              <tr className="border-b-2 border-indigo-950 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="p-4 font-semibold">Branch</th>
                <th className="p-4 text-right font-semibold">Placed</th>
                <th className="p-4 text-right font-semibold">Median</th>
                <th className="p-4 text-right font-semibold">Highest</th>
              </tr>
            </thead>
            <tbody>
              {BY_BRANCH.map(([b, p, m, h]) => (
                <tr key={b} className="border-b border-gray-100 last:border-0">
                  <td className="p-4 font-medium text-indigo-950">{b}</td>
                  <td className="p-4 text-right text-emerald-600 font-semibold">{p}</td>
                  <td className="p-4 text-right text-gray-700">{m}</td>
                  <td className="p-4 text-right text-gray-700">{h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Trend */}
      <Section>
        <SectionTitle title="Five-year trend" subtitle="Placement rate and median package since 2021." />
        <div className="mt-8 space-y-4">
          {TRENDS.map(([year, rate, median]) => (
            <div key={year} className="flex items-center gap-4">
              <span className="w-12 shrink-0 font-semibold text-indigo-950">{year}</span>
              <div className="h-7 flex-1 overflow-hidden rounded bg-gray-100">
                <div
                  className="flex h-full items-center justify-end rounded bg-indigo-600 pr-3 text-xs font-semibold text-white"
                  style={{ width: rate }}
                >
                  {rate}
                </div>
              </div>
              <span className="w-20 shrink-0 text-right text-sm text-gray-500">{median}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Recruiters */}
      <Section tinted>
        <SectionTitle title="Who recruits here" subtitle="140 companies visited in the 2025 season. A selection, by sector." />
        <div className="mt-10 space-y-8">
          {Object.entries(RECRUITERS).map(([sector, names]) => (
            <div key={sector}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-600">{sector}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {names.map((n) => (
                  <span key={n} className="rounded border border-indigo-100 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Process */}
      <Section>
        <SectionTitle title="How a placement season runs" subtitle="Six steps between registering in July and joining the following summer." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROCESS.map((s) => (
            <div key={s.n} className="rounded-lg border border-gray-200 p-6">
              <span className="text-2xl font-bold text-indigo-200">{s.n}</span>
              <h3 className="mt-2 font-bold text-indigo-950">{s.t}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Training */}
      <Section tinted>
        <SectionTitle title="Preparation" subtitle="Training starts eighteen months before the first drive." />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {TRAINING.map((t) => (
            <div key={t.t} className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="font-bold text-indigo-950">{t.t}</h3>
              <p className="mt-2 text-sm text-gray-600">{t.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Outcomes */}
      <Section>
        <SectionTitle title="Where they landed" subtitle="Three graduates on what actually made the difference." center />
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {OUTCOMES.map(({ name, role, initials, color, quote }) => (
            <div key={name} className="flex flex-col rounded-lg border border-gray-200 p-6">
              <FaQuoteLeft className="mb-4 text-3xl text-indigo-200" />
              <p className="mb-6 flex-1 text-sm text-gray-600">{quote}</p>
              <div className="flex items-center gap-3">
                <div className={`${color} flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white`}>
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-indigo-950">{name}</div>
                  <div className="text-xs text-gray-500">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </PageLayout>
  );
}