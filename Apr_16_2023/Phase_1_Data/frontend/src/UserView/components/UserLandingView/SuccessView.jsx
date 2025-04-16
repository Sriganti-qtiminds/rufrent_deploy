
import React from "react";
import PropertyListingCard from "./userLandingCardView";

const SuccessView = ({ apiResponse, lastListingRef }) => {
  const listings = apiResponse.data || [];

  return (
    <div className="w-full">
      <div className="space-y-4">
        {listings.length > 0 ? (
          listings.map((property, index) => {
            const isLastItem = index === listings.length - 1;
            return (
              <div
                key={property.id || index}
                ref={isLastItem ? lastListingRef : null}
              >
                <PropertyListingCard property={property} />
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center min-h-[70vh] font-bold text-2xl">
            No Properties Found
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessView;
