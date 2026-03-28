'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Maximize, Bed, Heart } from 'lucide-react'
import type { Property } from '@/types/property'
import { formatPrice, formatArea, cn } from '@/lib/utils'

interface PropertyCardProps {
    property: Property
    onFavoriteToggle?: (propertyId: string) => void
    isFavorite?: boolean
}

export function PropertyCard({ property, onFavoriteToggle, isFavorite = false }: PropertyCardProps) {
    const sourceColor = property.source === 'sreality' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'

    return (
        <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Image */}
            <Link href={`/property/${property.id}`} className="block relative h-64 overflow-hidden">
                {property.thumbnail ? (
                    <Image
                        src={property.thumbnail}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <MapPin className="w-16 h-16 text-gray-400" />
                    </div>
                )}

                {/* Source badge */}
                <div className={cn(
                    "absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm",
                    sourceColor
                )}>
                    {property.source}
                </div>

                {/* Favorite button */}
                {onFavoriteToggle && (
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            onFavoriteToggle(property.id)
                        }}
                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                        <Heart
                            className={cn(
                                "w-5 h-5 transition-colors",
                                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                            )}
                        />
                    </button>
                )}
            </Link>

            {/* Content */}
            <div className="p-6">
                {/* Price */}
                <div className="mb-3">
                    <div className="text-3xl font-bold text-gray-900">
                        {formatPrice(Number(property.price))}
                    </div>
                    {property.priceNote && (
                        <div className="text-sm text-gray-500 mt-1">{property.priceNote}</div>
                    )}
                </div>

                {/* Title */}
                <Link href={`/property/${property.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {property.title}
                    </h3>
                </Link>

                {/* Location */}
                {property.city && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{property.address || property.city}</span>
                    </div>
                )}

                {/* Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
                    {property.areaSize && (
                        <div className="flex items-center gap-1.5">
                            <Maximize className="w-4 h-4" />
                            <span>{formatArea(Number(property.areaSize))}</span>
                        </div>
                    )}

                    {property.roomCount && (
                        <div className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4" />
                            <span>{property.roomCount}</span>
                        </div>
                    )}
                </div>

                {/* View button */}
                <Link
                    href={`/property/${property.id}`}
                    className="mt-4 block w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-center rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    Zobrazit detail
                </Link>
            </div>
        </div>
    )
}
