import React from "react";
import tailwindStyles from "../../../utils/tailwindStyles";

const SimilarProperties = ({ property }) => {
  if (property.similarProperties === undefined) return null;

  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center bg-[#001433] p-6 rounded-t-3xl overflow-hidden transition-all duration-500 ease-out group">
        <div>
          <h2
            className={`text-xl font-bold 2xl:text-lg relative text-left text-white tracking-tight z-10`}
          >
            <span className="relative inline-block ">
              Similar Properties
              <span
                className="absolute -bottom-2 left-0 w-full h-1 rounded-full transform transition-all duration-300 group-hover:scale-x-110"
                style={{
                  background: "linear-gradient(to right, #22c55e, #ffc107)",
                }}
              />
            </span>
          </h2>

          <div
            className={`${tailwindStyles.heading_3}  mt-3 font-light text-white/90 leading-relaxed z-10 relative transition-all duration-300 group-hover:text-white`}
          >
            <p>{property.similarProperties.message}</p>
          </div>
        </div>
        <div>
          <img src="/BUILDING.png" className="w-14" />
        </div>
      </div>
    </div>
  );
};

export default SimilarProperties;
