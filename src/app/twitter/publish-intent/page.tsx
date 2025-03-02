"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingPage from "../../status/loading/page";

export default function PublishIntentPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const params = new URLSearchParams(window.location.search);

        const encodeParams = (params) => {
          return Array.from(params.entries())
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join("&");
        };

        const encodedSearch = encodeParams(params);
        const encodedHash = encodeParams(hashParams);


        const newUrl = `/api/twitter/publish-intent?${encodedSearch}&${encodedHash}`;
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
