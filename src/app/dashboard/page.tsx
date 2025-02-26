import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dashboard/home"); // Redirects automatically
  return null;
}
