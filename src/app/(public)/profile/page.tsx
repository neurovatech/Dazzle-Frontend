/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import ProfileSideNav from "@/components/Profile/ProfileSideNav";
import { useEffect, useState } from "react";
import { ProfileTypes } from "@/types/profile.types";
import { StarIcon } from "@/icon";
import WishList from "@/components/Profile/WishList";
import Breadcrumb from "@/components/share/Breadcrumb";
import OrderDetails from "@/components/Profile/OrderDetails";
import ProfileOtp from "@/components/Profile/ProfileOtp";
import ProfilePage from "@/components/Profile/ProfilePage";
export interface SlideItem {
  id: string | number;
  imageUrl?: string;
  title?: string;
  content?: React.ReactNode;
}

interface NewestProps {
  slides?: SlideItem[];
  autoplayDelay?: number;
  navigation?: boolean;
  pagination?: boolean;
  slidesPerView?: number;
}

const Profile = ({}: NewestProps) => {
  const [activeIndex, setActiveIndex] = useState<ProfileTypes>({
    label: "Wishlist",
    icon: StarIcon,
    component: WishList,
  });
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [showOtp, setShowOtp] = useState<boolean>(false);

  const Component = activeIndex.component;

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Profile", href: "#" },
  ];

  useEffect(() => {
    if (activeIndex.label !== "Orders") {
      setShowOrderDetails(false);
    }
    if (activeIndex.label !== "Change Password") {
      setShowOtp(false);
    }
  }, [activeIndex.label]);

  return (
    <div className=" font-sans md:p-0 p-5 pb-20">
      <ProfilePage />
    </div>
  );
};

export default Profile;
