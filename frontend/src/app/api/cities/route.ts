import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q') || ''

        // Get distinct cities and addresses to extract city names
        const properties = await prisma.property.findMany({
            where: {
                isActive: true,
                OR: [
                    {
                        city: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        address: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            select: {
                city: true,
                address: true
            },
            distinct: ['city'],
            take: 50
        })

        // Extract unique city names
        const citySet = new Set<string>()

        properties.forEach((prop: { city: string | null, address: string | null }) => {
            if (prop.city) {
                citySet.add(prop.city)
            }
            // Also extract from address
            if (prop.address) {
                const parts = prop.address.split(',')
                if (parts.length >= 2) {
                    const cityPart = parts[1].trim()
                    const city = cityPart.split(' - ')[0].trim()
                    if (city && city.length > 2) {
                        citySet.add(city)
                    }
                }
            }
        })

        // Filter and sort cities
        const cities = Array.from(citySet)
            .filter(city =>
                city.toLowerCase().includes(query.toLowerCase()) &&
                city.length > 2 &&
                !city.match(/^\d/) // Skip if starts with number
            )
            .sort()
            .slice(0, 20)

        return NextResponse.json({ cities })

    } catch (error) {
        console.error('Error fetching cities:', error)
        return NextResponse.json(
            { error: 'Failed to fetch cities' },
            { status: 500 }
        )
    }
}
