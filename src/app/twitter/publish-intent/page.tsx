"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import LoadingPage from "../../status/loading/page";

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

        console.log({newUrl});

        const response = await fetch(newUrl);
        const data = await response.json();
        const cb_url = data.callback_url;

        console.log(cb_url);
        console.log(response.status);

        if (response.status == 200) {

            if (cb_url)
            {
            router.push(cb_url);
            }
            else{
            router.push("/status/success");
            }

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
