import { useState, useEffect } from "react";
import { getJsonData } from "../globalManger.js";

export function useSearchData() {
  const [searchData, setSearchData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkData = () => {
      try {
        const data = getJsonData();
        if (
          isMounted &&
          data &&
          JSON.stringify(data) !== JSON.stringify(searchData)
        ) {
          console.log("New search data found:", data);
          setSearchData(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error("Error fetching search data:", err);
        }
      }
    };

    setIsLoading(true);
    checkData();
    setIsLoading(false);

    const intervalId = setInterval(checkData, 2000);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array

  return {
    searchData,
    isLoading,
    error,
  };
}
