import { redirect } from "next/navigation";

export default function Page() {
  redirect("/home"); // Redirects automatically
  return null;
}