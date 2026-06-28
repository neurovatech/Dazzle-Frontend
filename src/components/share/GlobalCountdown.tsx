"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
interface CountdownProps {
  targetDate: string | Date;
  title?: string;
  pagesLink?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimeBoxProps {
  value: number;
  label: string;
}

const TimeBox: React.FC<TimeBoxProps> = ({ value }) => {
  return (
    <div className="flex flex-col items-center bg-[#FFD07959] text-white rounded-xl px-[7px] py-[4px] shadow-md">
      <span className="text-[14px] font-medium">
        {String(value).padStart(2, "0")}
      </span>
    </div>
  );
};

const GlobalCountdown: React.FC<CountdownProps> = ({
  targetDate,
  title = "",
  pagesLink = "",
}) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
      setTimeLeft(calculateTimeLeft());
    }, 0);

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, [targetDate]);

  if (!mounted) return null;

  return (
    <div className="w-full flex md:flex-row gap-4 lg:py-6 py-4 justify-between items-center">
      <div className="flex md:flex-row gap-4">
        <h2 className="md:text-[32px] text-[14px] font-bold text-white hover:text-[#CB843B]">
          {title}
        </h2>

        <div className="flex flex-wrap items-center lg:gap-3 gap-1">
          <TimeBox value={timeLeft.days} label="Days" />
          <span className="text-white"> : </span>

          <TimeBox value={timeLeft.hours} label="Hours" />
          <span className="text-white"> : </span>

          <TimeBox value={timeLeft.minutes} label="Minutes" />
          <span className="text-white"> : </span>

          <TimeBox value={timeLeft.seconds} label="Seconds" />
        </div>
      </div>

      {pagesLink && (
        <Link className="text-white font-medium text-primary hover:underline" href={pagesLink}>
          See All
        </Link>
      )}
    </div>
  );
};

export default GlobalCountdown;
