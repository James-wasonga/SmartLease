"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Property = {
  id: number;
  title: string;
  location: string;
  imageUrl: string;
};

const featuredProperties: Property[] = [
  {
    id: 1,
    title: "Modern 3-Bedroom House",
    location: "Nairobi, Kenya",
    imageUrl: "/images/3-bedroomhouse.jpg",
  },
  {
    id: 2,
    title: "Elegant 2-Bedroom Apartment",
    location: "Lagos, Nigeria",
    imageUrl: "/images/1-bedroomhouse.jpg",
  },
  {
    id: 3,
    title: "Spacious Family Home",
    location: "Accra, Ghana",
    imageUrl: "/images/2-bedroomhouse.jpg",
  },
  {
    id: 4,
    title: "Luxury Villa",
    location: "Cape Town, South Africa",
    imageUrl: "/images/mansion5.jpg",
  },
  {
    id: 5,
    title: "Contemporary Penthouse",
    location: "Kigali, Rwanda",
    imageUrl: "/images/mansion2.jpg",
  },
];

export default function FeaturedProperties() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;

    if (scrollWidth <= clientWidth) return;

    let scrollPosition = 0;
    const scrollSpeed = 1; // pixels per frame
    let animationId: number;

    const animate = () => {
      scrollPosition += scrollSpeed;

      // Reset position when we've scrolled past half the content (for seamless loop)
      if (scrollPosition >= scrollWidth / 2) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    // Start animation after a short delay
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 2000);

    // Pause animation on hover
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationId);
    };

    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeoutId);
      scrollContainer?.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Duplicate properties for seamless infinite scroll
  const duplicatedProperties = [...featuredProperties, ...featuredProperties];

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">
          Featured Properties
        </h2>

        <div className="relative overflow-hidden">
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-100 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-100 to-transparent z-10 pointer-events-none"></div>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-hidden scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {duplicatedProperties.map((property, index) => (
              <div
                key={`${property.id}-${index}`}
                className="flex-shrink-0 w-80 bg-white shadow-lg rounded-xl overflow-hidden 
                         transition-all duration-300 hover:shadow-2xl hover:scale-105 
                         hover:-translate-y-2 group animate-slide-in"
                style={{
                  animationDelay: `${
                    (index % featuredProperties.length) * 0.2
                  }s`,
                }}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={property.imageUrl}
                    alt={property.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {property.location}
                  </p>
                  <button
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg 
                                   hover:bg-blue-700 active:bg-blue-800 
                                   transform hover:scale-105 active:scale-95
                                   transition-all duration-200 font-medium
                                   shadow-md hover:shadow-lg"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual scroll indicator */}
        <div className="flex justify-center mt-8">
          <p className="text-sm text-gray-500 flex items-center">
            <svg
              className="w-4 h-4 mr-2 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Hover to pause • Scroll manually for more control
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out both;
        }

        /* Hide scrollbar */
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
