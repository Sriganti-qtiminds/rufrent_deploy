import { useState, useEffect, useRef } from "react";
import axios from "axios";
import tailwindStyles from "../../../utils/tailwindStyles"; 

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const CompactCallbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    userType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypes, setUserTypes] = useState([]);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch countries data and user types
  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const data = response.data.map((country) => ({
          name: country.name.common,
          code: country.idd?.root + (country.idd?.suffixes?.[0] || ""),
          flag: country.flags?.png || "",
        }));
        setCountries(data);
        const india = data.find((country) => country.name === "India");
        if (india) setSelectedCountry(india);
      } catch (error) {
        console.error("Failed to load country data:", error);
      }
    }

    async function fetchUserTypes() {
      try {
        setLoadingUserTypes(true);
        const url = `${apiUrl}/getEnquirerCatCode`;
        const response = await axios.get(url);
        console.log(response);
        
        if (response.data.success) {
          setUserTypes(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load user types:", error);
      } finally {
        setLoadingUserTypes(false);
      }
    }

    fetchCountries();
    fetchUserTypes();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile" && value.length > 10) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Find the selected user type ID
      const selectedUserType = userTypes.find(
        (type) => type.category.toLowerCase() === formData.userType.toLowerCase()
      );

      if (!selectedUserType) {
        throw new Error("Invalid user type selected");
      }

      const payload = {
        usercat: selectedUserType.id,
        name: formData.name,
        country_code: selectedCountry.code,
        mobile_no: formData.mobile,         
        status: 25,
      };

      console.log("Submitting payload:", payload);
      const url = `${apiUrl}/addNewEnquiryRecord`;        
      const response = await fetch(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Request failed");
      }

      const data = await response.json();

      setShowSuccess(true);
      setFormData({
        name: "",
        mobile: "",
        userType: "",
      });

      // Show success message for 3 seconds then close popup
      setTimeout(() => {
        setShowSuccess(false);
        setShowPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
    //   className={`${tailwindStyles.whiteCard} rounded-lg p-3 max-w-2xl mx-auto`}
    >
      {showSuccess ? (
        <div className="text-center py-2 px-2 text-blue-600 font-medium">
          Request submitted successfully! We will contact you soon.
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={() => setShowPopup(true)}
            className={`py-3 px-6 bg-[#ffc107] rounded-lg p-3 max-w-2xl mx-auto font-bold text-md`}
          >
            Request A Callback
          </button>
        </div>
      )}

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            {showSuccess ? (
              <div className="text-center py-4 px-2 text-green-600 font-medium">
                Request submitted successfully! We will contact you soon.
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Request Callback</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">                   
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border rounded text-gray-500"
                      disabled={loadingUserTypes}
                    >
                      <option value="" disabled hidden className="text-gray-600">
                        {loadingUserTypes ? "Loading..." : "Owner/Tenant"}
                      </option>
                      {userTypes.map((type) => (
                        <option key={type.id} value={type.category.toLowerCase()}>
                          {type.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">                    
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-4">                    
                    <div className="flex items-center">
                      <div className="relative w-1/3 mr-2" ref={dropdownRef}>
                        <button
                          type="button"
                          className="w-full p-2 border rounded flex items-center justify-between bg-white"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                          {selectedCountry ? (
                            <div className="flex items-center space-x-2">
                              <img
                                src={selectedCountry.flag}
                                alt={selectedCountry.name}
                                className="w-5 h-5"
                              />
                              <span>{selectedCountry.code}</span>
                            </div>
                          ) : (
                            <span>Code</span>
                          )}
                        </button>
                        {isDropdownOpen && (
                          <div className="absolute z-10 mt-1 bg-white border rounded shadow-lg w-full min-w-[240px]">
                            <ul className="max-h-60 overflow-y-auto">
                              <li className="p-2">
                                <input
                                  type="text"
                                  placeholder="Search countries"
                                  className="w-full p-2 border rounded text-gray-500"
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                />
                              </li>
                              {filteredCountries.map((country, index) => (
                                <li
                                  key={index}
                                  className="p-2 flex items-center cursor-pointer hover:bg-gray-100 "
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    setIsDropdownOpen(false);
                                  }}
                                >
                                  <img
                                    src={country.flag}
                                    alt={country.name}
                                    className="w-5 h-5 mr-2"
                                  />
                                  <span className="truncate">
                                    {country.name} {country.code}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Mobile Number"
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="w-2/3 p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPopup(false)}
                      className="px-4 py-2 border rounded text-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || loadingUserTypes}
                      className={`${tailwindStyles.secondaryButton} px-4 py-2 ${
                        isSubmitting ? "bg-blue-600" : ""
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactCallbackForm;
