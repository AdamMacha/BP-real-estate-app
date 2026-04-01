import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

async function ensureUser(userId: string, email: string) {
    return await prisma.user.upsert({
        where: { id: userId },
        update: { email },
        create: {
            id: userId,
            email,
            name: email.split('@')[0],
            passwordHash: 'clerk-managed'
        }
    })
}

export async function GET() {
    try {
        const { userId, sessionClaims } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const email = (sessionClaims?.email as string) ?? `${userId}@clerk.user`
        await ensureUser(userId, email)

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: { property: true }
        })
        return NextResponse.json(favorites)
    } catch (error) {
        console.error('Error fetching favorites:', error)
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, sessionClaims } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const email = (sessionClaims?.email as string) ?? `${userId}@clerk.user`
        await ensureUser(userId, email)

        const payload = await request.json()
        const { propertyId, notes, status, toggle } = payload

        if (toggle) {
            const existing = await prisma.favorite.findUnique({
                where: {
                    userId_propertyId: {
                        userId,
                        propertyId
                    }
                }
            })

            if (existing) {
                await prisma.favorite.delete({
                    where: { id: existing.id }
                })
                return NextResponse.json({ favorited: false })
            } else {
                await prisma.favorite.create({
                    data: {
                        userId,
                        propertyId
                    }
                })
                return NextResponse.json({ favorited: true })
            }
        }

        // Update existing favorite (notes/status)
        const updated = await prisma.favorite.upsert({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId
                }
            },
            update: { notes, status },
            create: {
                userId,
                propertyId,
                notes,
                status
            }
        })

        return NextResponse.json(updated)

    } catch (error) {
        console.error('Favorites API error:', error)
        return NextResponse.json({
            error: 'Failed to manage favorite',
            details: (error as Error).message
        }, { status: 500 })
    }
}
