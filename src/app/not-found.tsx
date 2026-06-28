import Link from "next/link";

const NotFound = () => {
  return (
    <div className="bg-[#FFFBF6] md:bg-white md:dark:bg-[#302d29] flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center">
        {/* Animated 404 Heading */}
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] animate-pulse">
          404
        </h1>

        <div className="mt-4 relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-[#302d29] px-4 text-sm text-gray-500 uppercase tracking-widest">
              Page Not Found
            </span>
          </div>
        </div>

        <h2 className="mt-8 text-2xl md:text-3xl font-bold text-[#222222] dark:text-white">
          {`Oops! You've drifted into space.`}
        </h2>

        <p className="mt-4 text-[#717171] dark:text-gray-400 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Back to Home Button */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-full bg-gradient-to-r from-gray-600 to-[#E9CCAE] hover:opacity-90 transition-all shadow-lg hover:shadow-[#B57908]/20"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Decorative Element */}
      {/* <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#3202B9] via-[#85FFB4] to-[#FF9800]"></div> */}
    </div>
  );
};

export default NotFound;
