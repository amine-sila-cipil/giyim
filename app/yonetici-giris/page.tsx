import { redirect } from "next/navigation";

export default function YoneticiGirisPage() {
  redirect("/giris?next=/admin");
}
