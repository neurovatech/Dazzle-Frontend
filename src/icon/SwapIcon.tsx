import React from "react";

type SwapIconProps = {
  color?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
};

const SwapIcon: React.FC<SwapIconProps> = ({
  color = "#B57908",
  width = 16,
  height = 16,
  className = "",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12.6665 11.3333V7.33332C12.6665 5.4477 12.6665 4.5049 12.0807 3.91911C11.4949 3.33332 10.5521 3.33332 8.6665 3.33332H6.6665M6.6665 3.33332C6.6665 2.8665 7.99604 1.99434 8.33317 1.66666M6.6665 3.33332C6.6665 3.80014 7.99604 4.6723 8.33317 4.99999"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.3335 5V9C3.3335 10.8856 3.3335 11.8284 3.91928 12.4142C4.50507 13 5.44788 13 7.3335 13H9.3335M9.3335 13C9.3335 13.4668 8.00396 14.339 7.66683 14.6667M9.3335 13C9.3335 12.5332 8.00396 11.661 7.66683 11.3333"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6668 14C13.4032 14 14.0002 13.4031 14.0002 12.6667C14.0002 11.9303 13.4032 11.3333 12.6668 11.3333C11.9304 11.3333 11.3335 11.9303 11.3335 12.6667C11.3335 13.4031 11.9304 14 12.6668 14Z"
        stroke={color}
        strokeWidth="1.2"
      />
      <path
        d="M3.33333 4.66667C4.06971 4.66667 4.66667 4.06971 4.66667 3.33333C4.66667 2.59695 4.06971 2 3.33333 2C2.59695 2 2 2.59695 2 3.33333C2 4.06971 2.59695 4.66667 3.33333 4.66667Z"
        stroke={color}
        strokeWidth="1.2"
      />
    </svg>
  );
};

export default SwapIcon;