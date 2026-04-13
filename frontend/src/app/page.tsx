'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { PropertyFilters } from '@/components/PropertyFilters'
import { PropertyGrid } from '@/components/PropertyGrid'
import { PropertySortSelect } from '@/components/PropertySortSelect'
import { Pagination } from '@/components/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/PropertyListStates'
import { Header } from '@/components/Header'
import { Loader2 } from 'lucide-react'
import type { PropertyFilters as IPropertyFilters, PaginatedResponse, Property } from '@/types/property'

const buildQueryParams = (filters: IPropertyFilters) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  return params
}

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<IPropertyFilters>(() => {
    const p = searchParams
    return {
      page: Number(p.get('page')) || 1,
      limit: Number(p.get('limit')) || 12,
      sortBy: (p.get('sortBy') as IPropertyFilters['sortBy']) || 'updatedAt',
      sortOrder: (p.get('sortOrder') as IPropertyFilters['sortOrder']) || 'desc',
      city: p.get('city') || undefined,
      propertyType: (p.get('propertyType') as IPropertyFilters['propertyType']) || undefined,
      transactionType: (p.get('transactionType') as IPropertyFilters['transactionType']) || undefined,
      roomCount: p.get('roomCount') || undefined,
      minPrice: Number(p.get('minPrice')) || undefined,
      maxPrice: Number(p.get('maxPrice')) || undefined,
      minSize: Number(p.get('minSize')) || undefined,
      maxSize: Number(p.get('maxSize')) || undefined,
    }
  })

  useEffect(() => {
    const params = buildQueryParams(filters)
    if (window.location.search !== `?${params.toString()}`) {
      router.push(`/?${params.toString()}`, { scroll: false })
    }
  }, [filters, router])

  const { data, isLoading, error } = useQuery<PaginatedResponse<Property>>({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const params = buildQueryParams(filters)
      const response = await fetch(`/api/properties?${params}`)
      if (!response.ok) throw new Error('Failed to fetch properties')
      return response.json()
    }
  })

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (sortBy: IPropertyFilters['sortBy'], sortOrder: IPropertyFilters['sortOrder']) => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <PropertyFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </aside>

          {/* Properties grid */}
          <div className="lg:col-span-3">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {data ? `${data.total} nemovitostí` : 'Načítání...'}
                </h2>
                {data && (
                  <p className="text-sm text-gray-600 mt-1">
                    Stránka {data.page} z {data.totalPages}
                  </p>
                )}
              </div>
              <PropertySortSelect filters={filters} onSortChange={handleSortChange} />
            </div>

            {isLoading && <LoadingState />}
            {error && <ErrorState />}

            {data && data.data.length > 0 && (
              <>
                <PropertyGrid
                  properties={data.data}
                  medianPricePerM2={data.marketStats?.medianPricePerM2}
                />
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}

            {data && data.data.length === 0 && <EmptyState />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
