'use client'

import type { PropertyFilters as IPropertyFilters } from '@/types/property'

interface PropertySortSelectProps {
    filters: IPropertyFilters
    onSortChange: (sortBy: IPropertyFilters['sortBy'], sortOrder: IPropertyFilters['sortOrder']) => void
}

export function PropertySortSelect({ filters, onSortChange }: PropertySortSelectProps) {
    return (
        <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [IPropertyFilters['sortBy'], IPropertyFilters['sortOrder']]
                onSortChange(sortBy, sortOrder)
            }}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
            <option value="updatedAt-desc">Nejnovější</option>
            <option value="price-asc">Cena: Od nejnižší</option>
            <option value="price-desc">Cena: Od nejvyšší</option>
            <option value="areaSize-desc">Plocha: Od největší</option>
            <option value="areaSize-asc">Plocha: Od nejmenší</option>
        </select>
    )
}
