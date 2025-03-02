"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "../../status/loading/page";
import { error } from "console";

export default function PublishIntentPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const params = new URLSearchParams(window.location.search);
        const mergedParams = new URLSearchParams();
        params.forEach((value, key) => mergedParams.append(key, value));
        hashParams.forEach((value, key) => mergedParams.append(key, value));
        const newUrl = `/api/twitter/publish-intent?${(mergedParams.toString())}`;

        // const newUrl = `/api/twitter/publish-intent?${params}&${hashParams}`;
        
        // const encodeParams = (params) => {
        //     return Array.from(params.entries())
        //     .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        //     .join("&");
        // };
        
        // const encodedSearch = encodeParams(params);
        // const encodedHash = encodeParams(hashParams);


        console.log({newUrl});

        const response = await fetch(newUrl);
        const data = await response.json();

        if (response.status == 200) {
          router.push("/status/success");
        } else {
          router.push("/status/failure");
        }
      } catch (error) {
        console.error("Error:", error);
        router.push("/status/failure");
      }
    };

    fetchIntent();
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center text-xl">
      {loading && <LoadingPage />}
    </div>
  );
}
