import "./globals.css";
import Link from "next/link";
import Script from "next/script";

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

        <header className="site-header">
          <h1 className="site-logo">
            <Link href="/">YILMAZLAR GİYİM</Link>
          </h1>

          <nav className="site-nav">
            <ul>
              <li>
                <Link href="/">Ana Sayfa</Link>
              </li>
              <li>
                <Link href="/urunler">Ürünler</Link>
              </li>
              <li>
                <Link href="/giris">Giriş</Link>
              </li>
              <li>
                <Link href="/kayitol">Kayıt Ol</Link>
              </li>
              <li>
                <Link href="/hakkimizda">Hakkımızda</Link>
              </li>
              <li>
                <Link href="/iletisim">İletişim</Link>
              </li>
              <li>
                <Link href="/sepet">Sepet</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
