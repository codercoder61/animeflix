'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import StatsSection from '@/components/stats-section'
import Image from "next/image";

const animeData = [
  {
    id: "shingeki-no-kyojin",
    title: 'Attack on Titan',
    description: 'Humanity fights for survival against giant humanoid creatures',
    image: '/images/aot.png',
    episodes: 25,
  },
  {
    id: "kimetsu-no-yaiba",
    title: 'Demon Slayer',
    description: 'A young man joins demon slayers to save his sister',
    image: '/images/ds.jpg',
    episodes: 26,
  },
  {
    id: "jujutsu-kaisen",
    title: 'Jujutsu Kaisen',
    description: 'A teenager swallows a cursed finger and joins a secret organization',
    image: '/images/jk.jfif',
    episodes: 24,
  },
  {
    id: "one-piece",
    title: 'One Piece',
    description: 'A pirate embarks on adventures to find the ultimate treasure',
    image: '/images/op.jpg',
    episodes: 1151,
  },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

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
    setCurrentSlide((prev) => (prev - 1 + animeData.length) % animeData.length)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

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
    className="object-cover"
  />

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-10" />

  {/* Content */}
  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-20">
    <h2 className="text-4xl lg:text-5xl font-bold mb-2 text-primary">
      {anime.title}
    </h2>

    <p className="text-lg text-gray-200 mb-6 max-w-2xl">
      {anime.description}
    </p>

    <Link
      href={`/watch/${anime.id}`}
      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90"
    >
      <Play size={20} />
      Watch Episodes
    </Link>
  </div>
</div>

))}

        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 p-2 rounded-full transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 p-2 rounded-full transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={24} className="text-white" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {animeData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-primary w-8'
                  : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-16 px-4 lg:px-0 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Dive Into the Anime World?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Explore thousands of episodes from your favorite anime series
          </p>
          <button
            className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Start Watching Now
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Anime Grid */}
      <section className="mt-16 px-4 lg:px-0 max-w-6xl mx-auto w-full mb-16">
        <h2 className="text-3xl font-bold mb-8">Featured Anime</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {animeData.map((anime,index) => (
            <Link
              key={anime.id}
              href={`/watch/${anime.id}`}
              className="group relative overflow-hidden rounded-lg h-64"
            >
              <Image
  src={anime.image || "/placeholder.svg"}
  alt={anime.title}
  fill
  priority={index === 0}
  className="object-cover"
/>

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {anime.title}
                </h3>
                <p className="text-sm text-gray-300">{anime.episodes} episodes</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
