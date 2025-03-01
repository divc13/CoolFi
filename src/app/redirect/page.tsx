"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FixRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Extract fragment (#accountId=...) from URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      console.log("Hash params:", hashParams);
      console.log("Query params:", queryParams);

      // Convert fragment to query parameters
      // hashParams.forEach((value, key) => {
      //   queryParams.set(key, value);
      // });

      // Redirect to the actual API with fixed query parameters
      const newUrl = `/api/twitter/publish-intent?${queryParams}&${hashParams}`;
      console.log("Redirecting to:", newUrl);
      window.location.replace(newUrl);
    }
  }, []);

  return <p>Redirecting...</p>; // Temporary loading text
}
