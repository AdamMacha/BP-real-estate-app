'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PropertyCard } from '@/components/PropertyCard'
import { PropertyFilters } from '@/components/PropertyFilters'
import { Loader2, Home } from 'lucide-react'
import type { PropertyFilters as IPropertyFilters, PaginatedResponse, Property } from '@/types/property'

export default function HomePage() {
  const [filters, setFilters] = useState<IPropertyFilters>({
    page: 1,
    limit: 12,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  })

  // Fetch properties
  const { data, isLoading, error } = useQuery<PaginatedResponse<Property>>({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await fetch(`/api/properties?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch properties')
      }
      return response.json()
    }
  })

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  BP Real Estate App
                </h1>
                <p className="text-sm text-gray-600">Všechny nemovitosti na jednom místě</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
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

              {/* Sort */}
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [any, any]
                  setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }))
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="updatedAt-desc">Nejnovější</option>
                <option value="price-asc">Cena: Od nejnižší</option>
                <option value="price-desc">Cena: Od nejvyšší</option>
                <option value="areaSize-desc">Plocha: Od největší</option>
                <option value="areaSize-asc">Plocha: Od nejmenší</option>
              </select>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-20">
                <p className="text-red-600 text-lg">Chyba při načítání nemovitostí</p>
                <p className="text-gray-600 mt-2">Zkuste to prosím znovu později</p>
              </div>
            )}

            {/* Properties grid */}
            {data && data.data.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data.data.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(data.page - 1)}
                      disabled={data.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Předchozí
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                        let pageNum
                        if (data.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (data.page <= 3) {
                          pageNum = i + 1
                        } else if (data.page >= data.totalPages - 2) {
                          pageNum = data.totalPages - 4 + i
                        } else {
                          pageNum = data.page - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-xl transition-all ${data.page === pageNum
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(data.page + 1)}
                      disabled={data.page === data.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Další
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {data && data.data.length === 0 && (
              <div className="text-center py-20">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Žádné nemovitosti nenalezeny
                </h3>
                <p className="text-gray-600">
                  Zkuste změnit filtry nebo vyhledávací kritéria
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
