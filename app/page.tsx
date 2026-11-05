
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import BookmarkButton from '@/components/bookmark-button'
import { animeData } from '@/lib/anime-data'

import Header from '@/components/header'
import Footer from '@/components/footer'
import StatsSection from '@/components/stats-section'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Automatic carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % animeData.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % animeData.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      (prev - 1 + animeData.length) % animeData.length
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      <Header />

      <main className="flex-1">

        {/* Carousel Section */}
        <section className="relative w-full h-[500px] overflow-hidden rounded-lg mx-auto max-w-6xl mt-8 px-4 lg:px-0">

          <div className="relative w-full h-full">

            {animeData.map((anime, index) => (
              <div
                key={anime.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === currentSlide
                    ? 'opacity-100 pointer-events-auto z-10'
                    : 'opacity-0 pointer-events-none z-0'
                }`}
              >

                <Image
                  src={anime.image}
                  alt={anime.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 1152px"
                  className="object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

                {/* Anime Information */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-20">

                  <h2 className="text-4xl lg:text-5xl font-bold mb-2 text-primary">
                    {anime.title}
                  </h2>

                  <p className="text-lg text-gray-200 mb-6 max-w-2xl">
                    {anime.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/watch/${anime.id}`}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Play size={20} />
                      Watch Episodes
                    </Link>
                    <BookmarkButton item={{ type: 'anime', id: anime.id, title: anime.title, image: anime.image }} />
                  </div>

                </div>
              </div>
            ))}

          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 p-2 rounded-full transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 p-2 rounded-full transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={24} className="text-white" />
          </button>

        </section>

        {/* CTA Section */}
        <section className="mt-16 px-4 lg:px-0 max-w-6xl mx-auto w-full">

          <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-8 text-center">

            <h2 className="text-3xl font-bold mb-4">
              Ready to Dive Into the Anime World?
            </h2>

            <p className="text-lg text-muted-foreground mb-6">
              Explore thousands of episodes from your favorite anime series
            </p>

            <Link
              href="/"
              className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Start Watching Now
            </Link>

          </div>

        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Featured Anime Grid */}
        <section className="mt-16 px-4 lg:px-0 max-w-6xl mx-auto w-full mb-16">

          <h2 className="text-3xl font-bold mb-8">
            Featured Anime
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {animeData.map((anime, index) => (
              <Link
                key={anime.id}
                href={`/watch/${anime.id}`}
                className="group relative overflow-hidden rounded-lg h-64"
              >

                <Image
                  src={anime.image}
                  alt={anime.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                {/* Anime Information */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                    {anime.title}
                    </h3>
                    <BookmarkButton item={{ type: 'anime', id: anime.id, title: anime.title, image: anime.image }} label="Save" />
                  </div>

                  <p className="text-sm text-gray-300">
                    {anime.episodes} episodes
                  </p>

                </div>

              </Link>
            ))}

          </div>

        </section>

      </main>

      <Footer />

    </div>
  )
}
