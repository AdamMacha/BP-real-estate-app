import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { PropertyFilters } from '@/types/property'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams

        // Parse filters from query params
        const filters: PropertyFilters = {
            city: searchParams.get('city') || undefined,
            district: searchParams.get('district') || undefined,
            region: searchParams.get('region') || undefined,
            minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
            maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
            minSize: searchParams.get('minSize') ? Number(searchParams.get('minSize')) : undefined,
            maxSize: searchParams.get('maxSize') ? Number(searchParams.get('maxSize')) : undefined,
            propertyType: (searchParams.get('propertyType') as any) || undefined,
            transactionType: (searchParams.get('transactionType') as any) || undefined,
            roomCount: searchParams.get('roomCount') || undefined,
            page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
            limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
            sortBy: (searchParams.get('sortBy') as any) || 'updatedAt',
            sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
        }

        // Build where clause
        const where: any = {
            isActive: true
        }

        if (filters.city) {
            where.OR = [
                {
                    city: {
                        contains: filters.city,
                        mode: 'insensitive'
                    }
                },
                {
                    address: {
                        contains: filters.city,
                        mode: 'insensitive'
                    }
                }
            ]
        }

        if (filters.propertyType) {
            where.propertyType = filters.propertyType
        }

        if (filters.transactionType) {
            where.transactionType = filters.transactionType
        }

        if (filters.roomCount) {
            where.roomCount = filters.roomCount
        }

        if (filters.district) {
            where.district = {
                contains: filters.district,
                mode: 'insensitive'
            }
        }

        if (filters.region) {
            where.region = {
                contains: filters.region,
                mode: 'insensitive'
            }
        }

        // Price range
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.price = {}
            if (filters.minPrice !== undefined) {
                where.price.gte = filters.minPrice
            }
            if (filters.maxPrice !== undefined) {
                where.price.lte = filters.maxPrice
            }
        }

        // Area size range
        if (filters.minSize !== undefined || filters.maxSize !== undefined) {
            where.areaSize = {}
            if (filters.minSize !== undefined) {
                where.areaSize.gte = filters.minSize
            }
            if (filters.maxSize !== undefined) {
                where.areaSize.lte = filters.maxSize
            }
        }

        // Count total
        const total = await prisma.property.count({ where })

        // Get properties with pagination
        const properties = await prisma.property.findMany({
            where,
            skip: ((filters.page || 1) - 1) * (filters.limit || 20),
            take: filters.limit || 20,
            orderBy: {
                [filters.sortBy || 'updatedAt']: filters.sortOrder || 'desc'
            }
        })

        // Calculate total pages
        const totalPages = Math.ceil(total / (filters.limit || 20))

        return NextResponse.json({
            data: properties,
            total,
            page: filters.page || 1,
            limit: filters.limit || 20,
            totalPages
        })

    } catch (error) {
        console.error('Error fetching properties:', error)
        return NextResponse.json(
            { error: 'Failed to fetch properties' },
            { status: 500 }
        )
    }
}
