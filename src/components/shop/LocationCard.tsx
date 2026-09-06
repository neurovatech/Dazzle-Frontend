"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StoreItem } from "./ShopLocation";
import { Map, MapPin, X } from "lucide-react";
import mapIcon from "@/images/location.svg";
import ArrowAngleRightIcon from "@/icon/ArrowAngleRightIcon";
import NoImg from "@/images/no_images.png";
import GlobalModal from "@/components/share/GlobalModal";

interface LocationCardProps {
  store: StoreItem;
}

const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim() === "";
};

const NA = (
  <span className="text-gray-400 dark:text-gray-500 italic text-sm">
    No data available
  </span>
);

const LocationCard: React.FC<LocationCardProps> = ({ store }) => {
  const [mapOpen, setMapOpen] = useState(false);

  const hasThumbnail = !isEmpty(store.thumbnailImg);
  const hasCoords = !isEmpty(store.latitude) && !isEmpty(store.longitude);

  const googleMapEmbedUrl = hasCoords
    ? `https://www.google.com/maps?q=${store.latitude},${store.longitude}&z=15&output=embed`
    : !isEmpty(store.address)
      ? `https://www.google.com/maps?q=${encodeURIComponent(store.address!)}&z=15&output=embed`
      : null;

  return (
    <>
      <div className="bg-white dark:bg-[#1B1B1B] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2E2E2E] shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col px-[19px] py-[22px]">
        {/* Image */}
        <div className="relative h-55 w-full overflow-hidden rounded-2xl">
          <Image
            src={hasThumbnail ? store.thumbnailImg! : NoImg}
            alt={
              !isEmpty(store.branchName) && !isEmpty(store.slug)
                ? `${store.branchName} ${store.slug}`
                : "Store image"
            }
            fill
            className="object-cover transition-transform duration-500 hover:scale-105 rounded-2xl"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = NoImg.src;
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Distance badge */}
          {/* <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#000000BA] backdrop-blur-sm text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-sm">
            <Image src={mapIcon} width={11} height={11} alt="" />
            <span className="text-white">
              {isEmpty(store.distance) ? "N/A" : store.distance}
            </span>
          </div> */}

          {/* Map button */}
          <button
            onClick={() => setMapOpen(true)}
            className="absolute bottom-3 left-3 flex items-center gap-1.5 border border-[#6D3F0E] bg-white/90 dark:bg-[#2A2A2A]/90 backdrop-blur-sm text-[#000000] dark:text-white text-sm font-medium px-3 py-2 rounded-[27px] shadow-[0px_4px_9.5px_1px_#6D3F0E6E] hover:bg-white dark:hover:bg-[#333333] transition-colors"
            aria-label="View on map"
          >
            <Map size={16} className="text-[#6D3F0E]" />
            View Map
          </button>
        </div>

        {/* Content */}
        <div className="pt-8">
          <Link
            href={
              isEmpty(store.slug)
                ? `/shop-location/${store.branchName}`
                : `/shop-location/${store.slug}`
            }
          >
            <div>
              <h3 className="font-semibold text-[#222222] dark:text-white text-lg leading-tight h-12">
                {isEmpty(store.branchName) ? NA : store.branchName}{" "}
              </h3>

              <p className="text-sm text-[#747474] dark:text-gray-400 mt-2 h-15">
                {isEmpty(store.address) ? NA : store.address}
              </p>
            </div>
          </Link>
          <hr className="border-[#EEEEEE] dark:border-[#333333] my-2" />

          {/* Schedule & contact */}
          <Link
            href={
              isEmpty(store.slug)
                ? `/shop-location/${store.branchName}`
                : `/shop-location/${store.slug}`
            }
          >
            <div className="mb-4 flex justify-between gap-4">
              <div>
                <div>
                  <p className="text-[#747474] dark:text-gray-400 uppercase text-sm">
                    Day Off
                  </p>
                  <p className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C] mt-0.5">
                    {isEmpty(store.dayOff) ? NA : store.dayOff}
                  </p>
                </div>

                <div>
                  <p className="text-[#747474] dark:text-gray-400 uppercase text-sm mt-2">
                    Contact
                  </p>
                  <span className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C]">
                    {isEmpty(store.contactNo) ? NA : store.contactNo}
                  </span>
                </div>
              </div>

              <div>
                <div>
                  <p className="text-[#747474] dark:text-gray-400 uppercase text-sm">
                    Open Day
                  </p>
                  <p className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C] mt-0.5">
                    {isEmpty(store.openDay) && isEmpty(store.hours) ? (
                      NA
                    ) : (
                      <>
                        {isEmpty(store.openDay) ? "N/A" : store.openDay}
                        {" : "}
                        <span>
                          {isEmpty(store.hours) ? "N/A" : store.hours}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[#747474] dark:text-gray-400 uppercase text-sm mt-2">
                    Email
                  </p>
                  <span className="font-semibold text-[#6D3F0E] dark:text-[#D89B5C]">
                    {isEmpty(store.email) ? NA : store.email}
                  </span>
                </div>
              </div>
            </div>
          </Link>
          {/* Footer */}
          <Link
            href={
              isEmpty(store.slug)
                ? `/shop-location/${store.branchName}`
                : `/shop-location/${store.slug}`
            }
            className="w-full flex items-center justify-between bg-[#222222] dark:bg-[#2E2E2E] hover:bg-[#333333] dark:hover:bg-[#3A3A3A] text-white text-sm px-4 py-2.5 rounded-[14px] transition-colors"
          >
            See Details
            <span className="w-6 h-6 rounded-full border border-[#FACC15] flex items-center justify-center">
              <ArrowAngleRightIcon />
            </span>
          </Link>
        </div>
      </div>

      {/* Map Modal */}
      <GlobalModal
        title={store.branchName}
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
      >
        <div className="flex flex-col w-full">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEEEEE] dark:border-[#2E2E2E]">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#6D3F0E]" />
              <div>
                <h2 className="font-semibold text-[#222222] dark:text-white text-base leading-tight">
                  {isEmpty(store.branchName)
                    ? "Store Location"
                    : store.branchName}
                </h2>
                {!isEmpty(store.address) && (
                  <p className="text-xs text-[#747474] dark:text-gray-400 mt-0.5">
                    {store.address}
                  </p>
                )}
              </div>
            </div>

            {/* <button
              onClick={() => setMapOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#2E2E2E] hover:bg-gray-200 dark:hover:bg-[#3A3A3A] transition-colors"
              aria-label="Close map"
            >
              <X size={16} className="text-[#222222] dark:text-white" />
            </button> */}
          </div>

          {/* Map iframe or No Location fallback */}
          <div className="w-full h-[400px] bg-gray-100 dark:bg-[#2A2A2A]">
            {googleMapEmbedUrl ? (
              <iframe
                src={googleMapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map for ${store.branchName ?? "store"}`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6">
                <MapPin
                  size={40}
                  className="text-gray-300 dark:text-gray-600"
                />
                <p className="text-[#747474] dark:text-gray-400 font-medium">
                  No location data available
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Latitude, longitude and address are not provided for this
                  store.
                </p>
              </div>
            )}
          </div>

          {/* Coords row — only shown when coords exist */}
          {hasCoords && (
            <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-50 dark:bg-[#1B1B1B] border-t border-[#EEEEEE] dark:border-[#2E2E2E] text-xs text-[#747474] dark:text-gray-400">
              <span>
                <span className="font-medium text-[#222222] dark:text-white">
                  Lat:
                </span>{" "}
                {store.latitude}
              </span>
              <span>
                <span className="font-medium text-[#222222] dark:text-white">
                  Lng:
                </span>{" "}
                {store.longitude}
              </span>
            </div>
          )}
        </div>
      </GlobalModal>
    </>
  );
};

export default LocationCard;
