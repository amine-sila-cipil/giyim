import "./globals.css";
import Script from "next/script";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "YILMAZLAR GİYİM",
  description: "Giyim mağazası web sitesi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />

        <SiteHeader />

        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
