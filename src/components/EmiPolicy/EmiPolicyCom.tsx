"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Components ───────────────────────────────────────────────────────────────
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl bg-[#F7F7F7] dark:bg-[#393430] p-6 ${className}`}
  >
    {children}
  </div>
);

// ── Data ─────────────────────────────────────────────────────────────────────
const offlineEMIData = [
  {
    bank: "AB Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Prime Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Brac Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Community Bank",
    min: "5000",
    emi: ["4.499%", "5.999%", "8.499%", "9.99%", "N/A", "N/A", "N/A"],
  },
  {
    bank: "City Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Dhaka Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "DBBL",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Eastern Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Islami Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Jamuna Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Lanka Bangla",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Meghna Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Midland Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "NRB Commercial",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "NRB Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Pubali Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Standard Chartered",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Southeast Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Trust Bank",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "UCBL",
    min: "5000",
    emi: [
      "4.499%",
      "5.999%",
      "8.499%",
      "9.99%",
      "14.99%",
      "18.999%",
      "22.999%",
    ],
  },
  {
    bank: "Uttara Bank",
    min: "5000",
    emi: ["4.499%", "5.999%", "8.499%", "9.99%", "N/A", "N/A", "N/A"],
  },
];

const onlineEMIData = [
  {
    bank: "Bank Asia",
    emi: ["5.13%", "6.75%", "8.99%", "11.33%", "N/A", "N/A", "N/A", "N/A"],
  },
  {
    bank: "DBBL",
    emi: [
      "5.13%",
      "6.75%",
      "8.99%",
      "11.33%",
      "15.03%",
      "20.38%",
      "N/A",
      "26.26%",
    ],
  },
  {
    bank: "Eastern Bank",
    emi: [
      "5.13%",
      "6.75%",
      "8.99%",
      "11.33%",
      "15.03%",
      "20.38%",
      "N/A",
      "26.26%",
    ],
  },
  {
    bank: "Standard Chartered",
    emi: [
      "5.67%",
      "7.86%",
      "10.74%",
      "13.77%",
      "17.65%",
      "23.25%",
      "N/A",
      "31.07%",
    ],
  },
  {
    bank: "City Bank (AMEX)",
    emi: [
      "6.18%",
      "7.80%",
      "10.04%",
      "12.38%",
      "16.08%",
      "21.43%",
      "22.85%",
      "27.31%",
    ],
  },
  {
    bank: "Brac Bank",
    emi: [
      "6.18%",
      "7.80%",
      "10.04%",
      "12.38%",
      "16.08%",
      "21.43%",
      "22.85%",
      "22.85%",
    ],
  },
  {
    bank: "Islami Bank Bangladesh",
    emi: [
      "6.18%",
      "7.80%",
      "10.04%",
      "12.38%",
      "16.08%",
      "21.43%",
      "22.85%",
      "22.85%",
    ],
  },
  {
    bank: "Prime Bank",
    emi: ["5.13%", "6.75%", "8.99%", "11.33%", "15.03%", "N/A", "N/A", "N/A"],
  },
  {
    bank: "Trust Bank",
    emi: [
      "5.13%",
      "6.75%",
      "8.99%",
      "11.33%",
      "15.03%",
      "20.38%",
      "N/A",
      "26.26%",
    ],
  },
];
function EmiPolicyCom() {
  const { data, error } = useQuery({
    queryKey: ["emi-policy-data"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => api.get<any>("/pages/emi-policy"),
  });

  

  return (
    <div>
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
          EMI Policy
        </h1>
      </div>

      <div className="space-y-6">
        {/* Contact */}
        <Card>
          <p className="text-sm md:text-base text-[#222] dark:text-gray-300 leading-7">
            EMI সংক্রান্ত যেকোনো ধরনের বিভ্রান্তি/ অভিযোগ/ পরামর্শ কিংবা তথ্যের
            জন্য যোগাযোগ করুন :
            <span className="font-semibold"> 09638001122</span>
          </p>
        </Card>

        {/* Offline EMI */}
        <Card>
          <h2 className="text-xl font-bold mb-4">
            অফলাইনে ক্রেডিট কার্ড EMI সুবিধা
          </h2>

          <p className="text-sm md:text-base mb-5 text-[#444] dark:text-gray-300">
            Normal Transaction:{" "}
            <span className="font-semibold">0.99% চার্জ প্রযোজ্য</span> (যেকোনো
            ব্রাঞ্চে যেকোনো অ্যামাউন্টে)
          </p>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-[1200px] w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="border p-3 text-left">Bank</th>
                  <th className="border p-3">Minimum</th>
                  <th className="border p-3">3M</th>
                  <th className="border p-3">6M</th>
                  <th className="border p-3">9M</th>
                  <th className="border p-3">12M</th>
                  <th className="border p-3">18M</th>
                  <th className="border p-3">24M</th>
                  <th className="border p-3">36M</th>
                </tr>
              </thead>

              <tbody>
                {offlineEMIData.map((row, index) => (
                  <tr
                    key={row.bank}
                    className={
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-600"
                        : "bg-gray-50 dark:bg-gray-700"
                    }
                  >
                    <td className="border p-3 font-medium">{row.bank}</td>
                    <td className="border p-3 text-center">{row.min}</td>

                    {row.emi.map((item, i) => (
                      <td key={i} className="border p-3 text-center">
                        {item}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Online EMI */}
        <Card>
          <h2 className="text-xl font-bold mb-4">ওয়েবসাইটে EMI সুবিধা</h2>

          <p className="text-sm md:text-base mb-5 text-[#444]  dark:text-gray-300">
            No POS charge will be applied on EMI payment
          </p>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-[1300px] w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="border p-3 text-left">Bank</th>
                  <th className="border p-3">3M</th>
                  <th className="border p-3">6M</th>
                  <th className="border p-3">9M</th>
                  <th className="border p-3">12M</th>
                  <th className="border p-3">18M</th>
                  <th className="border p-3">24M</th>
                  <th className="border p-3">30M</th>
                  <th className="border p-3">36M</th>
                </tr>
              </thead>

              <tbody>
                {onlineEMIData.map((row, index) => (
                  <tr
                    key={row.bank}
                    className={
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-600"
                        : "bg-gray-50 dark:bg-gray-700"
                    }
                  >
                    <td className="border p-3 font-medium">{row.bank}</td>

                    {row.emi.map((item, i) => (
                      <td key={i} className="border p-3 text-center">
                        {item}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment Charges */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Payment Charges</h2>

          <div className="space-y-6 text-sm md:text-base">
            <div>
              <h3 className="font-semibold mb-2">QR / Link Payment</h3>

              <ul className="space-y-2 text-[#444] dark:text-gray-300 list-disc list-inside">
                <li>
                  VISA/MasterCard : QR payment / Link payment{" "}
                  <span className="font-semibold">2.04%</span>
                </li>

                <li>
                  City Bank (AMEX) : QR payment / Link payment{" "}
                  <span className="font-semibold">3.63%</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Website Direct Payment</h3>

              <ul className="space-y-2 text-[#444] dark:text-gray-300 list-disc list-inside">
                <li>
                  VISA/MasterCard : Direct payment by website{" "}
                  <span className="font-semibold">2.56%</span>
                </li>

                <li>
                  City Bank (AMEX) : Direct payment by website is not available
                  right now
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <p className="mt-10 text-center text-xs text-gray-500 dark:text-gray-400">
        সর্বশেষ আপডেট: এপ্রিল ২০২৬
      </p>
    </div>
  );
}

export default EmiPolicyCom;
