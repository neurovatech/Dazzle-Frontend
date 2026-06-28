type Props = {
  className?: string;
  color?: string;
};

function MobileMenuIcon({ className = "", color = "#222222" }: Props) {
  return (
    <svg
      width="16"
      height="14"
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 0.5H15.1667M0.5 6.91667H15.1667M0.5 13.3333H9.66667"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default MobileMenuIcon;