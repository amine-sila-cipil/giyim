"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "/images/elbise.jpeg",
    title: "Yeni Sezon Elbiseler",
    subtitle: "Zarif kesimler, günlük rahatlık ve özel gün şıklığı bir arada.",
    cta: "Elbiseleri İncele",
    href: "/urunler",
  },
  {
    image: "/images/tunik.jpeg",
    title: "Modern Tunik Koleksiyonu",
    subtitle: "Konforlu kumaşlar ve sade detaylarla her ana uyum sağlayan parçalar.",
    cta: "Koleksiyona Git",
    href: "/urunler",
  },
];

export default function HomeSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  return (
    <section className="home-slider" aria-label="Öne çıkan ürünler">
      <div
        className="home-slider__track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <article className="home-slide" key={slide.title}>
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 1180px"
              className="home-slide__image"
            />
            <div className="home-slide__shade" />
            <div className="home-slide__content">
              <p className="home-slide__eyebrow">Yılmazlar Giyim</p>
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <Link className="home-slide__button" href={slide.href}>
                {slide.cta}
              </Link>
            </div>
          </article>
        ))}
      </div>

      <button
        className="home-slider__control home-slider__control--prev"
        type="button"
        aria-label="Önceki görsel"
        onClick={() => goToSlide(activeIndex - 1)}
      >
        {"<"}
      </button>
      <button
        className="home-slider__control home-slider__control--next"
        type="button"
        aria-label="Sonraki görsel"
        onClick={() => goToSlide(activeIndex + 1)}
      >
        {">"}
      </button>

      <div className="home-slider__dots" aria-label="Slider sayfaları">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            className={index === activeIndex ? "is-active" : ""}
            type="button"
            aria-label={`${index + 1}. görsele geç`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
