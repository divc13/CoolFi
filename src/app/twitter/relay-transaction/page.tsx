"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PLUGIN_URL } from "@/app/config";
import LoadingPage from "../../status/loading/page";

export default function PublishIntentPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);

        const newUrl = `/api/twitter/relay-transaction?${queryParams}`;

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
