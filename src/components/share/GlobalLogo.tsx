"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import LogoBlack from "@/images/header-logo-black.svg";
import LogoWhite from "@/images/header-logo-white.svg";

function GlobalLogo() {
  const { theme } = useTheme();

  return (
    <div className="flex justify-center items-center mb-5">
      {theme === "dark" ? (
        <Image
          src={LogoWhite}
          width={200}
          height={200}
          alt="Picture of the author"
        />
      ) : (
        <Image
          src={LogoBlack}
          width={200}
          height={200}
          alt="Picture of the author"
        />
      )}
    </div>
  );
}

export default GlobalLogo;
