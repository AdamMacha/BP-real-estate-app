'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { PropertyFilters } from '@/types/property'

interface PropertyFiltersProps {
    filters: PropertyFilters
    onFiltersChange: (filters: PropertyFilters) => void
}

export function PropertyFilters({ filters, onFiltersChange }: PropertyFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [citySearch, setCitySearch] = useState(filters.city || '')
    const [citySuggestions, setCitySuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const cityInputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Fetch city suggestions
    useEffect(() => {
        const fetchCities = async () => {
            if (citySearch.length < 2) {
                setCitySuggestions([])
                return
            }

            try {
                const response = await fetch(`/api/cities?q=${encodeURIComponent(citySearch)}`)
                const data = await response.json()
                setCitySuggestions(data.cities || [])
            } catch (error) {
                console.error('Error fetching cities:', error)
                setCitySuggestions([])
            }
        }

        const debounce = setTimeout(fetchCities, 300)
        return () => clearTimeout(debounce)
    }, [citySearch])

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                cityInputRef.current &&
                !cityInputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value || undefined,
            page: 1
        })
    }

    const handleCitySelect = (city: string) => {
        setCitySearch(city)
        handleFilterChange('city', city)
        setShowSuggestions(false)
    }

    const clearFilters = () => {
        setCitySearch('')
        onFiltersChange({
            page: 1,
            limit: filters.limit,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder
        })
    }

    const hasActiveFilters = !!(
        filters.city ||
        filters.district ||
        filters.region ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.minSize ||
        filters.maxSize ||
        filters.propertyType ||
        filters.transactionType ||
        filters.roomCount
    )

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 backdrop-blur-lg bg-white/95 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Filtry</h2>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isExpanded ? <X className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
                </button>
            </div>

            {/* Filters content */}
            <div className={`space-y-4 ${!isExpanded ? 'hidden lg:block' : ''}`}>
                {/* City search with autocomplete */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Město
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            ref={cityInputRef}
                            type="text"
                            placeholder="Např. Praha, Brno..."
                            value={citySearch}
                            onChange={(e) => {
                                setCitySearch(e.target.value)
                                setShowSuggestions(true)
                                if (!e.target.value) {
                                    handleFilterChange('city', '')
                                }
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {citySearch && (
                            <button
                                onClick={() => {
                                    setCitySearch('')
                                    handleFilterChange('city', '')
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {/* Suggestions dropdown */}
                    {showSuggestions && citySuggestions.length > 0 && (
                        <div
                            ref={suggestionsRef}
                            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                        >
                            {citySuggestions.map((city, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleCitySelect(city)}
                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* District */}
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Okres
                    </label>
                    <input
                        type="text"
                        placeholder="Např. Brno-venkov"
                        value={filters.district || ''}
                        onChange={(e) => handleFilterChange('district', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div> */}

                {/* Region */}
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kraj
                    </label>
                    <input
                        type="text"
                        placeholder="Např. Jihomoravský"
                        value={filters.region || ''}
                        onChange={(e) => handleFilterChange('region', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div> */}

                {/* Transaction type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Typ transakce
                    </label>
                    <select
                        value={filters.transactionType || ''}
                        onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">Vše</option>
                        <option value="sale">Prodej</option>
                        <option value="rent">Pronájem</option>
                    </select>
                </div>

                {/* Property type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Typ nemovitosti
                    </label>
                    <select
                        value={filters.propertyType || ''}
                        onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">Vše</option>
                        <option value="flat">Byt</option>
                        <option value="house">Dům</option>
                        <option value="land">Pozemek</option>
                        <option value="commercial">Komerční</option>
                    </select>
                </div>

                {/* Room count */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dispozice
                    </label>
                    <select
                        value={filters.roomCount || ''}
                        onChange={(e) => handleFilterChange('roomCount', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">Vše</option>
                        <option value="1+kk">1+kk</option>
                        <option value="1+1">1+1</option>
                        <option value="2+kk">2+kk</option>
                        <option value="2+1">2+1</option>
                        <option value="3+kk">3+kk</option>
                        <option value="3+1">3+1</option>
                        <option value="4+kk">4+kk</option>
                        <option value="4+1">4+1</option>
                        <option value="5+kk">5+kk</option>
                        <option value="5+1">5+1</option>
                    </select>
                </div>

                {/* Price range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cena
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice || ''}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice || ''}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Area size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plocha (m²)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minSize || ''}
                            onChange={(e) => handleFilterChange('minSize', e.target.value ? Number(e.target.value) : undefined)}
                            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxSize || ''}
                            onChange={(e) => handleFilterChange('maxSize', e.target.value ? Number(e.target.value) : undefined)}
                            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Clear filters button */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Vymazat filtry
                    </button>
                )}
            </div>
        </div>
    )
}
