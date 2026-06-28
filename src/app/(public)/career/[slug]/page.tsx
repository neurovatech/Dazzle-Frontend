import type { Metadata } from "next";
import Breadcrumb from "@/components/share/Breadcrumb";
import careerImg from "@/images/career.webp";
import Image from "next/image";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const title = decodedSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${title} - Career Opportunities - Dazzle`,
    description: `Apply for the ${title} position at Dazzle. Discover responsibilities, requirements, and how to join our growing tech team in Bangladesh.`,
  };
}

export default async function CareerDetails({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const title = decodedSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Career", href: "/career" },
    {
      label: title,
      href: `/career/${slug}`,
    },
  ];

  return (
    <div className="bg-[#FFFBF6] dark:bg-[#2E2B28] md:bg-white font-sans md:p-0 p-5 pb-20 max-w-355 mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex justify-center py-6 w-full md:w-4/5 lg:w-[55%] mt-4 mx-auto">
        <div>
          <Image src={careerImg} alt="Career" className="w-full" />

          {/* Content */}
          <div className="py-5">
            <h2 className="text-[28px] font-bold text-[#111827] dark:text-white">
              {title}
            </h2>

            {/* Tags */}
            <div className="mt-4 flex items-center gap-3">
              <span className="rounded-full bg-gray-100 px-4 py-1 text-sm text-gray-600 dark:text-gray-700">
                Admin
              </span>

              <span className="rounded-full bg-gray-100 px-4 py-1 text-sm text-gray-600 dark:text-gray-700">
                Technology
              </span>
            </div>

            {/* About */}
            <div className="mt-7">
              <h3 className="text-2xl font-bold text-[#111827] dark:text-white">
                About the Role:
              </h3>

              <p className="mt-3 leading-7 text-gray-700 dark:text-gray-300">
                We are looking for a diligent <strong>{title}</strong> to
                ensure accurate inventory management across our outlets. The
                candidate will regularly visit all 10 outlets (7 in Dhaka, 3 in
                Chittagong) to verify stock levels and prepare detailed reports.
                Your work will directly support efficient operations and help
                maintain optimal stock accuracy.
              </p>
            </div>

            {/* Responsibilities */}
            <div className="mt-7">
              <h3 className="text-2xl font-bold text-[#111827] dark:text-white">
                Key Responsibilities:
              </h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-gray-700 dark:text-gray-300">
                <li>Conduct regular visits to each outlet to verify stock.</li>

                <li>
                  Compare physical stock with system records and identify
                  discrepancies.
                </li>

                <li>
                  Prepare clear, timely stock audit reports for management
                  review.
                </li>

                <li>
                  Collaborate with store managers and operational teams to
                  resolve inventory issues.
                </li>

                <li>Ensure compliance with company policies and procedures.</li>
              </ul>
            </div>

            {/* Requirements */}
            <div className="mt-7">
              <h3 className="text-2xl font-bold text-[#111827] dark:text-white">
                Requirements:
              </h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-gray-700 dark:text-gray-300">
                <li>
                  Minimum 2 years of experience in inventory control, stock
                  auditing, or a similar role.
                </li>

                <li>Strong attention to detail and accuracy.</li>

                <li>
                  Ability to travel frequently between outlets in Dhaka and
                  Chattogram.
                </li>

                <li>Good reporting and communication skills.</li>

                <li>
                  Proficiency with Excel or inventory management systems is a
                  plus.
                </li>
              </ul>
            </div>

            {/* Why Join */}
            <div className="mt-7">
              <h3 className="text-2xl font-bold text-[#111827] dark:text-white">
                Why Join Us:
              </h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-gray-700 dark:text-gray-300">
                <li>
                  Work with a fast-growing retail company with multiple premium
                  outlets.
                </li>

                <li>
                  Opportunity to contribute directly to operational efficiency.
                </li>

                <li>Competitive salary and performance-based incentives.</li>
              </ul>
            </div>

            {/* Apply */}
            <div className="mt-7">
              <h3 className="text-2xl font-bold text-[#111827] dark:text-white">
                How to Apply:
              </h3>

              <p className="mt-3 leading-7 text-gray-700 dark:text-gray-300">
                Send your CV and a brief cover letter to{" "}
                <span className="font-bold">admin@dazzle.com.bd</span> with the
                subject{" "}
                <strong>
                  <q>Apply for {title}</q>
                </strong>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
