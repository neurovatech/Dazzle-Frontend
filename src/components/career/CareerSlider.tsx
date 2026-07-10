import Image from "next/image";
import Link from "next/link";

export interface Job {
  id: number;
  category: string;
  date: string;
  title: string;
  slug: string;
  description: string;
  image: string;
}

interface CareerSliderProps {
  jobs: Job[];
}

export default function CareerSlider({ jobs }: CareerSliderProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((slide) => (
        <div
          key={slide.id}
          className="group rounded-xl border border-gray-200 bg-white dark:bg-[#393430] p-6 transition-all duration-300"
        >
          {/* Image */}
          <div className="overflow-hidden rounded-md relative h-[220px] w-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </div>

          {/* Meta */}
          <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300">
            <span>{slide.category}</span>
            <span className="h-4 w-[1px] bg-gray-300" />
            <span>{slide.date}</span>
          </div>

          {/* Title */}
          <h2 className="mt-2 text-xl font-semibold text-[#222222] dark:text-white">
            {slide.title}
          </h2>

          {/* Description */}
          <p className="mt-1 text-sm text-[#aaaaaa]">{slide.description}</p>

          {/* Button */}
          <Link href={`/career/${slide.slug}`}>
            <button className="mt-7 inline-flex items-center gap-2 font-bold uppercase tracking-wide text-black dark:text-white transition hover:gap-3">
              See More
              <span>❯</span>
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
}