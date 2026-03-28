export type PropertySource = 'sreality' | 'bezrealitky'

export type PropertyType = 'flat' | 'house' | 'land' | 'commercial'

export type TransactionType = 'sale' | 'rent'

export interface Property {
    id: string
    source: PropertySource
    externalId: string
    title: string
    description?: string | null
    price?: number | null
    priceNote?: string | null
    propertyType: PropertyType
    transactionType: TransactionType
    address?: string | null
    city?: string | null
    district?: string | null
    region?: string | null
    latitude?: number | null
    longitude?: number | null
    areaSize?: number | null
    roomCount?: string | null
    floor?: number | null
    totalFloors?: number | null
    images: string[]
    thumbnail?: string | null
    sourceUrl: string
    scrapedAt: Date
    publishedAt?: Date | null
    updatedAt: Date
    isActive: boolean
}

export interface PropertyFilters {
    city?: string
    district?: string
    region?: string
    minPrice?: number
    maxPrice?: number
    minSize?: number
    maxSize?: number
    propertyType?: PropertyType
    transactionType?: TransactionType
    roomCount?: string
    page?: number
    limit?: number
    sortBy?: 'price' | 'areaSize' | 'updatedAt'
    sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}
