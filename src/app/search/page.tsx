import { redirect } from "next/navigation";

/** Search lives in the header overlay — keep /search as a soft entry. */
export default function SearchPage() {
  redirect("/");
}
