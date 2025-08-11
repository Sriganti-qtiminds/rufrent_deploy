import React from "react";
import tailwindStyles from "../../utils/tailwindStyles";

const CountryCodeDropdown = ({
  dropdownRef,
  isDropdownOpen,
  setDropdownOpen,
  selectedCountry,
  setSelectedCountry,
  countries,
  searchTerm,
  setSearchTerm,
}) => {
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-[30%]" ref={dropdownRef}>
      <button
        className="w-full px-2 h-8 border rounded flex items-center justify-between bg-white text-sm md:text-md"
        onClick={() => setDropdownOpen(!isDropdownOpen)}
      >
        {selectedCountry ? (
          <div className="flex items-center space-x-1">
            <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-5 h-5" />
            <span className={`${tailwindStyles.paragraph} truncate`}>
              {selectedCountry.code}
            </span>
          </div>
        ) : (
          <span>Select</span>
        )}
      </button>
      {isDropdownOpen && (
        <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg w-full min-w-[100px]">
          <ul className="max-h-60 overflow-y-auto">
            <li className="p-2">
              <input
                type="text"
                placeholder="Search countries"
                className="w-full p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </li>
            {filteredCountries.map((country, index) => (
              <li
                key={index}
                className="p-2 flex items-center cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedCountry(country);
                  setDropdownOpen(false);
                }}
              >
                <img src={country.flag} alt={country.name} className="w-5 h-5 mr-2" />
                <span className={`${tailwindStyles.paragraph} truncate`}>
                  {country.name} {country.code}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CountryCodeDropdown;