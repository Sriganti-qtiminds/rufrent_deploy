import React from "react";
import tailwindStyles from "../../utils/tailwindStyles";

const MessageBanner = ({ message, type }) => {
  if (!message) return null;
  const isSuccess = type === "success";
  const base = `${tailwindStyles.paragraph} absolute top-2 w-[calc(100%-20px)] mb-4 p-2 text-center rounded`;
  const theme = isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  return <div className={`${base} ${theme}`}>{message}</div>;
};

export default MessageBanner;