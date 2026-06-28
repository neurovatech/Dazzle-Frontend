import AnnouncementCard, {
  AnnouncementType,
} from "@/components/AnnouncementCard";
import Breadcrumb from "@/components/share/Breadcrumb";

const Announcement = () => {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Announcement", href: "/announcement" },
  ];

  const announcements: AnnouncementType[] = Array.from(
    { length: 8 },
    (_, i) => ({
      id: i + 1,
      title:
        "iPhone 16 Pro Price BD (2025): Authentic Apple Flagship at Dazzle",
      slug: `iphone-16-pro-${i + 1}`,
      badge: "75% OFF",
      images: "",
    }),
  );

  return (
    <div className="bg-[#FFFBF6] md:bg-white md:dark:bg-[#302d29] font-sans p-5 pb-20 max-w-355 mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-[32px] font-bold text-[#101518] dark:text-white mb-4">
        Announcement
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {announcements.map((announcement) => (
          <AnnouncementCard key={announcement.id} press={announcement} />
        ))}
      </div>
    </div>
  );
};

export default Announcement;
