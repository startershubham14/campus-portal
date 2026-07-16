import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/**
 * Standard shell for every interior page: header, a titled banner, the page
 * body, then the footer. Keeps the five content pages visually identical.
 */
export default function PageLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />

      <div className="bg-indigo-950 py-14">
        <div className="m-auto w-7/10">
          <h1 className="text-4xl font-bold text-white">{title}</h1>
          <p className="mt-3 max-w-2xl text-indigo-200">{subtitle}</p>
        </div>
      </div>

      <main>{children}</main>

      <SiteFooter />
    </>
  );
}

/** A centred section with the site's standard width and vertical rhythm. */
export function Section({
  tinted = false,
  children,
}: {
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={tinted ? "bg-indigo-50 py-16" : "bg-white py-16"}>
      <div className="m-auto w-7/10">{children}</div>
    </section>
  );
}

/** Section heading used across the interior pages. */
export function SectionTitle({
  title,
  subtitle,
  center = false,
}: {
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-3xl font-bold text-indigo-950">{title}</h2>
      {subtitle && (
        <p className={`mt-2 text-gray-500 ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}