


import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import apiStatusConstants from "../../../utils/apiStatusConstants";
import useListingStore from "../../../store/listingsStore";
import useFilterStore from "../../../store/filterStore";
import Cookies from "js-cookie";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

import Navbar from "../../../components/CommonViews/Navbar";
import FilterSection from "./FilterView";
import SuccessView from "./SuccessView";
import PropertyListingCardSkeletonLoader from "../../../components/CommonViews/PropertyCardSkelton";
import FailureView from "../../../components/CommonViews/FailureView";

const InfiniteScrollLoader = ({ isVisible }) => (
  <div
    className={`flex justify-center items-center py-4  transition-opacity duration-500 ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}
  >
    <div className="w-8 h-8 border-4 border-[#001433] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const UserLandingView = () => {
  const {
    apiResponse,
    pagination,
    currentPage,
    fetchListings,
    setCurrentPage,
  } = useListingStore();

  const { filterData } = useFilterStore();
  const location = useLocation();
  const activePath = location.pathname;
  const jwtToken = Cookies.get(jwtSecretKey);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const lastListingRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchListings(filterData, 1, 15);
        if (jwtToken === undefined) {
          localStorage.clear();
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, [fetchListings, filterData]);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        apiResponse.status === apiStatusConstants.success &&
        currentPage < pagination.totalPages &&
        !isLoadingMore
      ) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setCurrentPage(currentPage + 1);
          fetchListings(filterData, currentPage + 1, 15);
        }, 500); // Smooth loading delay
      }
    },
    [
      apiResponse.status,
      currentPage,
      pagination.totalPages,
      isLoadingMore,
      fetchListings,
      filterData,
    ]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px", // Trigger slightly earlier for smooth loading
      threshold: 0.2, // Load when 20% of the last listing is visible
    });

    if (lastListingRef.current) {
      observer.observe(lastListingRef.current);
    }

    observerRef.current = observer;
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    if (apiResponse.status === apiStatusConstants.success && isLoadingMore) {
      setTimeout(() => setIsLoadingMore(false), 400); // Smoothly hide loader
    }
  }, [apiResponse.status, isLoadingMore]);

  const renderListings = () => {
    if (apiResponse.status === apiStatusConstants.initial) {
      return <PropertyListingCardSkeletonLoader />;
    }

    if (apiResponse.status === apiStatusConstants.inProgress) {
      return apiResponse.data.length === 0 ? (
        <PropertyListingCardSkeletonLoader />
      ) : (
        <>
          <SuccessView
            apiResponse={apiResponse}
            lastListingRef={lastListingRef}
          />
          <InfiniteScrollLoader isVisible={isLoadingMore} />
        </>
      );
    }

    if (apiResponse.status === apiStatusConstants.success) {
      return (
        <>
          <SuccessView
            apiResponse={apiResponse}
            lastListingRef={lastListingRef}
          />
          <InfiniteScrollLoader isVisible={isLoadingMore} />
        </>
      );
    }

    if (apiResponse.status === apiStatusConstants.failure) {
      return <FailureView />;
    }

    return null;
  };

  const [maxHeight, setMaxHeight] = useState("calc(100vh - 6.5rem)");

  useEffect(() => {
    const handleResize = () => {
      setMaxHeight(
        window.innerWidth < 450 ? "calc(100vh - 4rem)" : "calc(100vh - 6rem)"
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col bg-gray-200 items-center">
      {activePath === "/user-landing" && <Navbar />}
      <div className="w-full md:p-5">
        <div style={{ height: maxHeight }} className="grid md:grid-cols-10">
          <div className="hidden 2xl:block 2xl:col-span-1"></div>
          <div
            style={{ maxHeight: maxHeight }}
            className="md:col-span-3 2xl:col-span-2 rounded-sm md:shadow-md"
          >
            <FilterSection
              currentPageChange={() => {
                setCurrentPage(1);
                fetchListings(filterData, 1, 15);
              }}
            />
          </div>
          <div
            style={{ maxHeight: maxHeight }}
            className="md:col-span-7 2xl:col-span-6 rounded-l p-3 md:p-0 md:px-5 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:white [&::-webkit-scrollbar-thumb]:bg-blue-300"
          >
            {renderListings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLandingView;
