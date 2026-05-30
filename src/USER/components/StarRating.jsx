import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {Array(fullStars)
        .fill(0)
        .map((_, index) => (
          <FaStar key={index} className="text-yellow-500 w-4 h-4" />
        ))}
      {halfStar && <FaStarHalfAlt className="text-yellow-500 w-4 h-4" />}
      {Array(emptyStars)
        .fill(0)
        .map((_, index) => (
          <FaRegStar key={index} className="text-yellow-500 w-4 h-4" />
        ))}
    </div>
  );
};

export default StarRating;
