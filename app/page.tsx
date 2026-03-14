import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import OperatorCard from './components/OperatorCard'
import SearchBar from './components/SearchBar'
import SpeedboatIcon from './components/SpeedboatIcon'
import ThemeToggle from './components/ThemeToggle'

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

async function getFeaturedOperator() {
  const operator = await prisma.operator.findFirst({
    where: {
      isFeatured: true,
      isActive: true,
    },
    include: {
      routes: {
        orderBy: { order: 'asc' },
        include: {
          stops: { orderBy: { order: 'asc' } },
          schedule: true,
        },
      },
    },
  })
  
  // If no featured operator, check if any featured has expired
  if (!operator) {
    // Check for expired featured
    const expired = await prisma.operator.findMany({
      where: {
        isFeatured: true,
        featuredExpiry: { lt: new Date() },
      },
    })
    if (expired.length > 0) {
      // Unfeature expired
      await prisma.operator.updateMany({
        where: { featuredExpiry: { lt: new Date() } },
        data: { isFeatured: false, featuredExpiry: null },
      })
    }
  }
  
  return operator
}

async function OperatorsList({ search }: { search: string }) {
  const operators = await prisma.operator.findMany({
    where: {
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { boatName: { contains: search } },
              { routes: { some: { stops: { some: { island: { contains: search } } } } } },
            ],
          }
        : {}),
    },
    include: {
      routes: {
        orderBy: { order: 'asc' },
        include: {
          stops: { orderBy: { order: 'asc' } },
          schedule: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  if (operators.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-gray-500 text-lg font-medium">No operators found matching &ldquo;{search}&rdquo;</p>
        <p className="text-gray-400 text-sm mt-2">Try searching for an island name, boat name, or operator</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {operators.map((op) => (
        <OperatorCard key={op.id} operator={op} />
      ))}
    </div>
  )
}

export default async function HomePage({ searchParams }: PageProps) {
  const { search = '' } = await searchParams
  const featuredOperator = await getFeaturedOperator()

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0B1120] transition-colors">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-[#0B1120] dark:via-[#0B1120] dark:to-[#0B1120] text-white dark:text-white">
        {/* Subtle gradient overlay - only for light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-teal-500/10 dark:hidden" />
        {/* Dark gradient overlay - only for dark mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-teal-500/5 hidden dark:block" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-20 text-center">
          {/* Theme Toggle */}
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5 tracking-tight">
            Find your speedboat
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">across the Maldives</span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto mb-6 leading-relaxed">
            All operators, schedules, and routes in one place.
          </p>

          {/* Featured Operator Banner */}
          {featuredOperator ? (
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 mb-8">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Featured</span>
              <div className="flex items-center gap-3">
                {featuredOperator.logoUrl ? (
                  <Image 
                    src={featuredOperator.logoUrl} 
                    alt={featuredOperator.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-contain bg-white"
                    unoptimized={featuredOperator.logoUrl.startsWith('http')}
                  />
                ) : (
                  <SpeedboatIcon className="w-10 h-10" />
                )}
                <div className="text-left">
                  <p className="font-semibold text-white">{featuredOperator.name}</p>
                  <p className="text-sm text-gray-400">{featuredOperator.boatName}</p>
                </div>
              </div>
              {featuredOperator.ticketingUrl && (
                <a
                  href={featuredOperator.ticketingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Book Now
                </a>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-4 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-2xl px-6 py-4 mb-8">
              <div className="text-left">
                <p className="font-semibold text-amber-200">Advertise Here</p>
                <p className="text-sm text-gray-400">Get your business featured on our homepage</p>
              </div>
              <Link
                href="/contact"
                className="ml-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Contact Us
              </Link>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Operators</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Routes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Speedboat Schedules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-5xl mx-auto px-4 -mt-7 relative z-10 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-gray-200/60 dark:shadow-slate-900/50 border border-gray-200/80 dark:border-slate-700/60 p-4 md:p-5">
          <Suspense fallback={<div className="h-12 bg-gray-100 rounded-xl animate-pulse" />}>
            <SearchBar />
          </Suspense>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Search by boat name, operator, or island (e.g. &ldquo;Maafushi&rdquo;, &ldquo;Thulusdhoo&rdquo;)
          </p>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        {search && (
          <p className="text-sm text-gray-500 mb-4">
            Showing results for: <span className="font-semibold text-gray-800">&ldquo;{search}&rdquo;</span>
          </p>
        )}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-200/80" />
              ))}
            </div>
          }
        >
          <OperatorsList search={search} />
        </Suspense>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-gray-800 dark:text-white">
            islandferryhub.com
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Helping tourists and locals find their way across the Maldives
          </p>
        </div>
      </footer>
    </main>
  )
}
