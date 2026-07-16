import PageLayout, { Section, SectionTitle } from "../components/PageLayout";
import {
  FaBook,
  FaFlask,
  FaBed,
  FaFutbol,
  FaUtensils,
  FaWifi,
  FaBus,
  FaHeartbeat,
  FaCode,
  FaRobot,
  FaMusic,
  FaTheaterMasks,
  FaCamera,
  FaMicrophone,
  FaHandsHelping,
  FaPalette,
} from "react-icons/fa";

const FACILITIES = [
  { Icon: FaBook, name: "Central Library", d: "94,000 volumes, 180 journal subscriptions, and IEEE / ACM / Springer access. Reading hall open until 23:00 in exam weeks." },
  { Icon: FaFlask, name: "Laboratories", d: "62 labs across the twelve departments, including the Centre for Advanced Computing and a 40-node GPU cluster." },
  { Icon: FaBed, name: "Hostels", d: "Six blocks — four for men, two for women — housing 2,400 students. Twin and triple sharing, with a warden resident in each block." },
  { Icon: FaFutbol, name: "Sports", d: "Cricket and football grounds, eight-lane track, indoor badminton and table tennis, gym, and a 25m pool." },
  { Icon: FaUtensils, name: "Dining", d: "Three messes and a food court. Vegetarian, non-vegetarian and Jain menus, with the week's menu published every Sunday." },
  { Icon: FaWifi, name: "Network", d: "Campus-wide Wi-Fi at 1 Gbps, and wired access in every hostel room. Labs stay open to project students out of hours." },
  { Icon: FaBus, name: "Transport", d: "Eighteen buses on nine routes across Greenfield and Pune, running morning and evening on term days." },
  { Icon: FaHeartbeat, name: "Health & counselling", d: "On-campus clinic with a doctor daily, an ambulance on call, and free confidential counselling by appointment." },
];

const CLUBS = [
  { Icon: FaCode, name: "Codechef Greenfield", d: "Weekly contests and ICPC preparation. Placed 14th at the Amritapuri regional in 2025." },
  { Icon: FaRobot, name: "Robotics Society", d: "Builds for Robocon and eYantra. The 2025 team reached the Robocon national quarter-finals." },
  { Icon: FaMusic, name: "Swaraag", d: "The music club — Indian classical, a cappella and the college band. Plays at every campus event." },
  { Icon: FaTheaterMasks, name: "Rangmanch", d: "Theatre in Marathi, Hindi and English. Stages two full productions a year plus street theatre." },
  { Icon: FaCamera, name: "Lens & Frame", d: "Photography and film. Runs the campus documentary project and shoots every fest." },
  { Icon: FaMicrophone, name: "Debating Society", d: "Parliamentary debate and MUN. Hosts Greenfield MUN each November for 400 delegates." },
  { Icon: FaHandsHelping, name: "NSS Unit", d: "Village adoption at Wadgaon, blood drives, and a digital-literacy programme in local schools." },
  { Icon: FaPalette, name: "Design Collective", d: "UI, illustration and print. Designs the fest identity and runs open workshops each semester." },
];

const EVENTS = [
  {
    name: "Aavishkar",
    when: "February · 3 days",
    tag: "Technical festival",
    d: "The flagship tech fest: a 36-hour hackathon, robotics arena, paper presentations and a project expo. Around 4,000 participants from 60 colleges attended in 2025.",
  },
  {
    name: "Tarang",
    when: "October · 4 days",
    tag: "Cultural festival",
    d: "Music, dance, drama and fashion across four days, closing with a headline concert on the main ground.",
  },
  {
    name: "Spardha",
    when: "December · 1 week",
    tag: "Sports meet",
    d: "Inter-department tournaments in fourteen disciplines, plus the annual athletics meet.",
  },
  {
    name: "Prarambh",
    when: "August · 2 days",
    tag: "Orientation",
    d: "Induction for the incoming batch: department tours, club fair, and a mentor assigned to every first-year student.",
  },
];

const SUPPORT = [
  { t: "Mentor system", d: "Every student is assigned a faculty mentor for the full programme. Mentors meet their group monthly and hold the attendance and grade conversation before it becomes a problem." },
  { t: "Peer tutoring", d: "Senior students run subject clinics before each unit test. Free, and open to anyone." },
  { t: "Anti-ragging", d: "Zero tolerance, an anonymous reporting line, and a standing committee. Greenfield has recorded no substantiated incident since 2017." },
  { t: "Grievance redressal", d: "A student grievance committee with elected representatives meets fortnightly and publishes outcomes." },
];

export default function CampusLife() {
  return (
    <PageLayout
      title="Campus Life"
      subtitle="Forty-two acres, eight clubs worth joining, and somewhere to be at 11pm the night before a deadline."
    >
      {/* Facilities */}
      <Section>
        <SectionTitle title="Facilities" subtitle="What's actually on the campus." />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map(({ Icon, name, d }) => (
            <div key={name} className="rounded-lg border border-gray-200 p-5 transition-colors hover:border-indigo-300">
              <Icon className="text-2xl text-indigo-600" />
              <h3 className="mt-3 font-bold text-indigo-950">{name}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Clubs */}
      <Section tinted>
        <SectionTitle
          title="Clubs and societies"
          subtitle="Student-run, faculty-backed, and funded from the activity levy."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {CLUBS.map(({ Icon, name, d }) => (
            <div key={name} className="flex gap-4 rounded-lg bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <Icon className="text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-950">{name}</h3>
                <p className="mt-1 text-sm text-gray-600">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Events */}
      <Section>
        <SectionTitle title="The year's calendar" subtitle="Four fixtures the campus organises itself around." />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {EVENTS.map((e) => (
            <div key={e.name} className="rounded-lg border-l-4 border-indigo-600 bg-indigo-50 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-bold text-indigo-950">{e.name}</h3>
                <span className="text-xs font-semibold text-indigo-600">{e.when}</span>
              </div>
              <span className="mt-1 inline-block rounded bg-white px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {e.tag}
              </span>
              <p className="mt-3 text-sm text-gray-600">{e.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Support */}
      <Section tinted>
        <SectionTitle
          title="Looking after students"
          subtitle="The parts of campus life that matter most when something goes wrong."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {SUPPORT.map((s) => (
            <div key={s.t} className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="font-bold text-indigo-950">{s.t}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Hostel detail */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionTitle title="Living on campus" />
            <div className="mt-5 space-y-4 text-gray-600">
              <p>
                Six hostel blocks sit on the north side of the campus, a five-minute
                walk from the academic buildings and the library. Rooms are twin or
                triple sharing, furnished, with wired network in every room and hot
                water through the year.
              </p>
              <p>
                Each block has a resident warden, a common room, a reading room that
                stays open all night during exams, and a laundry. Mess is compulsory
                for residents and runs three menus, with the week published every
                Sunday so you can plan around it.
              </p>
              <p>
                First-year students and out-of-state students are guaranteed a place.
                Later years are allotted on distance from home and CGPA; in practice
                about seven in ten applicants get a room.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-indigo-50 p-6">
            <h3 className="font-semibold text-indigo-950">Hostel at a glance</h3>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Blocks", "6 (4 men, 2 women)"],
                ["Capacity", "2,400"],
                ["Room types", "Twin, triple"],
                ["Annual cost", "₹78,000 incl. mess"],
                ["Gate hours", "05:30 – 23:00"],
                ["Wardens", "Resident, one per block"],
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
    </PageLayout>
  );
}