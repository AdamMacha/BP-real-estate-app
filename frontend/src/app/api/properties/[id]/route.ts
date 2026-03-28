import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const property = await prisma.property.findUnique({
            where: { id }
        })

        if (!property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(property)

    } catch (error) {
        console.error('Error fetching property:', error)
        return NextResponse.json(
            { error: 'Failed to fetch property' },
            { status: 500 }
        )
    }
}
