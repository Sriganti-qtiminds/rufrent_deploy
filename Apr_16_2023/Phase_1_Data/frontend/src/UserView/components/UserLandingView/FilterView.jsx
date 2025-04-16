
// -----------------------------------

import React, { useState, useEffect, useCallback } from "react";
import { FaFilter } from "react-icons/fa6";
import tailwindStyles from "../../../utils/tailwindStyles";
import useFilterStore from "../../../store/filterStore";
import useListingStore from "../../../store/listingsStore";
import SearchableDropdown from "../PostPropertyView/SearchDropdownView";
import BrokerageView from "../InitialLandingView/BrokerageView";
import ComplimentaryModel from "../FavoritesView/Complimentary";

const FilterSection = () => {
  const [isShow, setIsShow] = useState(false);

  // Get states and actions from both stores
  const {
    dropdownData,
    setFilterData,
    fetchFilters,
    fetchBuildersList,
    fetchCommunitiesList,
    filterData,
    setDropdownData,
  } = useFilterStore();

  const { fetchListings, setCurrentPage, clearListings } = useListingStore();

  // Initialize local filters state from filterStore
  const [filters, setFilters] = useState(filterData);

  // Fetch initial filter data
  useEffect(() => {
    const initializeData = async () => {
      await fetchFilters();
    };
    initializeData();
  }, [fetchFilters]);

  // Fetch builders when city changes
  useEffect(() => {
    if (filters.city) {
      fetchBuildersList(filters.city);
    }
  }, [filters.city, fetchBuildersList]);

  // Fetch communities when builder changes
  useEffect(() => {
    if (filters.builders) {
      fetchCommunitiesList(filters.builders);
    }
  }, [filters.builders, fetchCommunitiesList]);

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    try {
      // Clear existing listings and reset page before applying new filters
      clearListings();
      setCurrentPage(1);
      await fetchListings(filters, 1, 15);
      await setFilterData(filters);
      setIsShow(false);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleClearFilters = useCallback(async () => {
    const emptyFilters = {
      city: "",
      builders: "",
      community: "",
      hometype: [],
      propertydescription: [],
      availability: [],
      tenanttype: [],
    };
    const emptyDropdownData = {
      builderList: [],
      communityList: [],
    };

    try {
      // Clear listings and reset everything
      clearListings();
      setCurrentPage(1);
      await fetchListings(emptyFilters, 1, 15);
      setFilters(emptyFilters);
      await setFilterData(emptyFilters);
      await setDropdownData(emptyDropdownData);
      setIsShow(false);
    } catch (error) {
      console.error("Error clearing filters:", error);
    }
  }, [
    setFilterData,
    fetchListings,
    clearListings,
    setCurrentPage,
    setDropdownData,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFilters((prev) => {
        const currentValues = prev[name] || [];
        if (checked) {
          return {
            ...prev,
            [name]: [...currentValues, value],
          };
        } else {
          return {
            ...prev,
            [name]: currentValues.filter((item) => item !== value),
          };
        }
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "city" ? { builders: "", community: "" } : {}),
        ...(name === "builders" ? { community: "" } : {}),
      }));
      if (name === "city") {
        setDropdownData({
          builderList: [],
          communityList: [],
        });
      } else if (name === "builders") {
        setDropdownData({
          communityList: [],
        });
      }
    }
  };

  const renderDropdown = (name, options, label) => {
    return (
      <div>
        <p className={`${tailwindStyles.paragraph_b} mb-1`}>{label}</p>
        <SearchableDropdown
          name={name}
          options={options}
          value={filters[name]}
          onChange={handleChange}
          placeholder={`Select ${label}`}
          displayKey="name"
          valueKey="id"
        />
      </div>
    );
  };

  const renderFilterForm = () => (
    <form
      className="space-y-2 overflow-y-auto h-full scroll-smooth [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-gray-300"
      style={{ maxHeight: "calc(100% - 50px)" }}
    >
      {renderDropdown("city", dropdownData.cityList, "City")}
      {renderDropdown("builders", dropdownData.builderList, "Builder")}
      {renderDropdown("community", dropdownData.communityList, "Community")}

      <div className="flex flex-col">
        <p className={`${tailwindStyles.paragraph_b} text-start pb-1`}>
          House Type
        </p>
        <div className="grid grid-cols-3">
          {dropdownData.bedroomTypes.map((type) => (
            <label
              key={type.id}
              className={`${tailwindStyles.paragraph} flex items-center space-x-2 pr-2`}
            >
              <input
                type="checkbox"
                name="hometype"
                value={type.id}
                checked={
                  filters.hometype.includes(`${type.id}`) ||
                  filters.hometype.includes(type.id)
                }
                onChange={handleChange}
              />
              <span className={`${tailwindStyles.paragraph}`}>{type.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <p className={`${tailwindStyles.paragraph_b} text-start pb-1`}>
          Furnishing
        </p>
        <div className="grid grid-cols-2">
          {dropdownData.propertyDescriptions.map((desc) => (
            <label
              key={desc.id}
              className="flex items-center space-x-2 md:w-full"
            >
              <input
                type="checkbox"
                name="propertydescription"
                value={desc.id}
                checked={filters.propertydescription.includes(`${desc.id}`)}
                onChange={handleChange}
              />
              <span className={`${tailwindStyles.paragraph}`}>{desc.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <p className={`${tailwindStyles.paragraph_b} text-start pb-1`}>
          Availability
        </p>
        <div className="flex flex-wrap">
          {dropdownData.availability.map((available) => (
            <label
              key={available.id}
              className="flex items-center space-x-2 w-1/2"
            >
              <input
                type="checkbox"
                name="availability"
                value={available.id}
                checked={
                  filters.availability.includes(`${available.id}`) ||
                  filters.availability.includes(available.id)
                }
                onChange={handleChange}
              />
              <span className={`${tailwindStyles.paragraph}`}>
                {available.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        <p className={`${tailwindStyles.paragraph_b} text-start pb-1`}>
          Preferred Tenant
        </p>
        <div className="grid grid-cols-3">
          {dropdownData.tenanttype.map((tenant) => (
            <label key={tenant.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="tenanttype"
                value={tenant.id}
                checked={
                  filters.tenanttype &&
                  filters.tenanttype.includes(`${tenant.id}`)
                }
                onChange={handleChange}
              />
              <span className={`${tailwindStyles.paragraph}`}>
                {tenant.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleClearFilters}
          type="button"
          className={`${tailwindStyles.secondaryButton} w-full`}
        >
          Clear
        </button>
        <button
          onClick={handleApplyFilters}
          type="submit"
          className={`${tailwindStyles.secondaryButton} w-full`}
        >
          Apply
        </button>
       
      </div>
     

    </form>
  );

  return (
    <div className="w-full rounded-md bg-white h-auto md:h-full">
      <button
        className="md:hidden fixed right-0 z-200"
        onClick={() => setIsShow(!isShow)}
      >
        <div className="rounded-full h-10 w-10 flex items-center justify-center">
          <FaFilter className="w-5 h-5 text-[#FFC107]" />
        </div>
      </button>

      <div className="hidden md:block w-full h-full rounded-lg px-4">
        <h2 className={`${tailwindStyles.heading_3} py-2`}>Filters</h2>
        {renderFilterForm()}
      </div>

      {isShow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed mr-20 top-0 left-0 sm:w-3/4 md:w-2/4 h-full bg-white shadow-lg z-50 p-4">
            <button
              className="absolute top-4 right-4 text-lg"
              onClick={() => setIsShow(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            {renderFilterForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
