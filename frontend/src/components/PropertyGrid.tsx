'use client'

import { PropertyCard } from '@/components/PropertyCard'
import type { Property } from '@/types/property'

interface PropertyGridProps {
    properties: Property[]
    medianPricePerM2?: number | null
}

export function PropertyGrid({ properties, medianPricePerM2 }: PropertyGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
                <PropertyCard
                    key={property.id}
                    property={property}
                    medianPricePerM2={medianPricePerM2}
                />
            ))}
        </div>
    )
}
