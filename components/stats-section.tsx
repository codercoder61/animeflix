'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Tv, Users, Play, Star } from 'lucide-react'

interface Stat {
  label: string
  value: number
  icon: React.ReactNode
  suffix: string
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([])

  useEffect(() => {
    // Simulate API call with data
    const statsData: Stat[] = [
      {
        label: 'Anime Series',
        value: 6000,
        icon: <Tv size={32} />,
        suffix: '+',
      },
      {
        label: 'Episodes Available',
        value: 50000,
        icon: <Play size={32} />,
        suffix: '+',
      },
      {
        label: 'Average Rating',
        value: 48,
        icon: <Star size={32} />,
        suffix: '/5',
      },
    ]
    setStats(statsData)
  }, [])

  return (
    <section className="w-full bg-gradient-to-r from-primary/10 to-accent/10 py-16 px-4 lg:px-0 mt-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose AnimeFlix?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-center mb-4 text-primary">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {stat.value.toLocaleString()}
                <span className="text-xl">{stat.suffix}</span>
              </div>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
