import { Location, Review, BlogPost } from "@/types/location";

export const LOCATIONS: Location[] = [
  {
    id: 1,
    name: "Jamuna Future Park",
    branch: "Branch - 1",
    address:
      "Shop No. G2C & G2D, North Court, Block - B, 4th floor, Jamuna Future Park, Kuri Pragati Sharani, Dhaka",
    dayOff: "Wednesday",
    openDay: "Thursday-Tuesday",
    hours: "11am-7pm",
    contact: "09638001122",
    email: "dazzle@gmail.com",
    image:
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80",
    distance: "0.2 km from your location",
    slug: "jamuna-future-park-branch-1",
  },
  {
    id: 2,
    name: "Jamuna Future Park",
    branch: "Branch - 1",
    address:
      "Shop No. G2C & G2D, North Court, Block - B, 4th floor, Jamuna Future Park, Kuri Pragati Sharani, Dhaka",
    dayOff: "Wednesday",
    openDay: "Thursday-Tuesday",
    hours: "11am-7pm",
    contact: "09638001122",
    email: "dazzle@gmail.com",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    distance: "0.2 km from your location",
    slug: "jamuna-future-park-branch-2",
  },
  {
    id: 3,
    name: "Jamuna Future Park",
    branch: "Branch - 1",
    address:
      "Shop No. G2C & G2D, North Court, Block - B, 4th floor, Jamuna Future Park, Kuri Pragati Sharani, Dhaka",
    dayOff: "Wednesday",
    openDay: "Thursday-Tuesday",
    hours: "11am-7pm",
    contact: "09638001122",
    email: "dazzle@gmail.com",
    image:
      "https://images.unsplash.com/photo-1573495612937-f01934eeaaa7?w=600&q=80",
    distance: "0.2 km from your location",
    slug: "jamuna-future-park-branch-3",
  },
  {
    id: 4,
    name: "Jamuna Future Park",
    branch: "Branch - 1",
    address:
      "Shop No. G2C & G2D, North Court, Block - B, 4th floor, Jamuna Future Park, Kuri Pragati Sharani, Dhaka",
    dayOff: "Wednesday",
    openDay: "Thursday-Tuesday",
    hours: "11am-7pm",
    contact: "09638001122",
    email: "dazzle@gmail.com",
    image:
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80",
    distance: "0.2 km from your location",
    slug: "jamuna-future-park-branch-4",
  },
  {
    id: 5,
    name: "Jamuna Future Park",
    branch: "Branch - 1",
    address:
      "Shop No. G2C & G2D, North Court, Block - B, 4th floor, Jamuna Future Park, Kuri Pragati Sharani, Dhaka",
    dayOff: "Wednesday",
    openDay: "Thursday-Tuesday",
    hours: "11am-7pm",
    contact: "09638001122",
    email: "dazzle@gmail.com",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    distance: "0.2 km from your location",
    slug: "jamuna-future-park-branch-5",
  },
  {
    id: 6,
    name: "Jamuna Future Park",
    branch: "Branch - 1",
    address:
      "Shop No. G2C & G2D, North Court, Block - B, 4th floor, Jamuna Future Park, Kuri Pragati Sharani, Dhaka",
    dayOff: "Wednesday",
    openDay: "Thursday-Tuesday",
    hours: "11am-7pm",
    contact: "09638001122",
    email: "dazzle@gmail.com",
    image:
      "https://images.unsplash.com/photo-1573495612937-f01934eeaaa7?w=600&q=80",
    distance: "0.2 km from your location",
    slug: "jamuna-future-park-branch-6",
  },
];

export const REVIEWS: Review[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  text: "Lorem ipsum dolor sit amet consectetur. Amet ara at lectus ac socia. Diam in aliquet odio gravida pharetra nibh nis ultrices lorem. Massa tortor tortor pharetra in diam convallis consectetur sapien.",
  author: "Sadman Bin Ahsan",
  role: "Businessman",
  avatar: `https://i.pravatar.cc/40?img=${i + 10}`,
}));

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title:
      "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh",
    excerpt:
      "Looking for the best Apple products, the top smartphones, and the latest and greatest in the world of gadgets? Look no further than Dazzle Mobile & Gadget Shop—your ultimate tech haven in Bangladesh.",
    color: "bg-purple-50",
  },
  {
    id: 2,
    title:
      "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh",
    excerpt:
      "Looking for the best Apple products, the top smartphones, and the latest and greatest in the world of gadgets? Look no further than Dazzle Mobile & Gadget Shop—your ultimate tech haven in Bangladesh.",
    color: "bg-blue-50",
  },
  {
    id: 3,
    title:
      "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh",
    excerpt:
      "Looking for the best Apple products, the top smartphones, and the latest and greatest in the world of gadgets? Look no further than Dazzle Mobile & Gadget Shop—your ultimate tech haven in Bangladesh.",
    color: "bg-green-50",
  },
  {
    id: 4,
    title:
      "Welcome to Dazzle Mobile & Gadget Shop – Your Premier Destination for Cutting-Edge Devices in Bangladesh",
    excerpt:
      "Looking for the best Apple products, the top smartphones, and the latest and greatest in the world of gadgets? Look no further than Dazzle Mobile & Gadget Shop—your ultimate tech haven in Bangladesh.",
    color: "bg-yellow-50",
  },
];