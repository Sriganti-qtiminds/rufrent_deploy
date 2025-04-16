
// -------------------- without cache -----------------------------

// listingsStore.js
import { create } from "zustand";
import apiStatusConstants from "../utils/apiStatusConstants";
import { fetchAllProperties } from "../services/newapiservices";

const useListingStore = create((set, get) => ({
  apiResponse: {
    status: apiStatusConstants.initial,
    data: [],
    errorMsg: null,
  },
  pagination: {
    totalPages: 0,
    totalRecords: 0,
  },
  currentPage: 1,
  pageLimit: 6,
  filterData: {},
  allListings: [], // Store all accumulated listings in memory only

  setCurrentPage: (page) => set({ currentPage: page }),

  fetchListings: async (filterData, page = 1, pageLimit = 6) => {
    set({
      apiResponse: {
        status: apiStatusConstants.inProgress,
        data: get().allListings, // Keep existing listings during fetch
        errorMsg: null,
      },
      filterData,
      currentPage: page,
    });

    try {
      const updatedFilterData = {
        ...filterData,
        hometype: Array.isArray(filterData.hometype)
          ? filterData.hometype.join(",")
          : filterData.hometype,
        propertydescription: Array.isArray(filterData.propertydescription)
          ? filterData.propertydescription.join(",")
          : filterData.propertydescription,
        availability: Array.isArray(filterData.availability)
          ? filterData.availability.join(",")
          : filterData.availability,
        tenanttype: Array.isArray(filterData.tenanttype)
          ? filterData.tenanttype.join(",")
          : filterData.tenanttype,
      };

      const result = await fetchAllProperties(updatedFilterData, {
        page,
        limit: pageLimit,
      });

      if (result.status) {
        const newListings = result.data.results;
        const currentListings = get().allListings;
        // Append new listings to existing ones, avoiding duplicates
        const updatedListings = [
          ...currentListings,
          ...newListings.filter(
            (nl) => !currentListings.some((cl) => cl.id === nl.id)
          ),
        ];

        set({
          allListings: updatedListings,
          apiResponse: {
            status: apiStatusConstants.success,
            data: updatedListings,
            errorMsg: null,
          },
          pagination: {
            totalPages: result.data.pagination.totalPages,
            totalRecords: result.data.pagination.totalRecords,
          },
        });
      } else {
        set({
          apiResponse: {
            status: apiStatusConstants.failure,
            data: get().allListings,
            errorMsg: result || "Failed to fetch properties",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      set({
        apiResponse: {
          status: apiStatusConstants.failure,
          data: get().allListings,
          errorMsg: "Failed to fetch properties",
        },
      });
    }
  },

  clearListings: () => {
    set({
      allListings: [],
      apiResponse: {
        status: apiStatusConstants.initial,
        data: [],
        errorMsg: null,
      },
      pagination: {
        totalPages: 0,
        totalRecords: 0,
      },
      currentPage: 1,
      filterData: {},
    });
  },
}));

export default useListingStore;
