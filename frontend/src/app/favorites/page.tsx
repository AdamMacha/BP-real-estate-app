export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { Heart } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { FavoriteCard, EmptyFavorites } from '@/components/FavoriteCard'

function serializeProperty(property: any) {
    return {
        ...property,
        price: property.price != null ? Number(property.price) : null,
        latitude: property.latitude != null ? Number(property.latitude) : null,
        longitude: property.longitude != null ? Number(property.longitude) : null,
        areaSize: property.areaSize != null ? Number(property.areaSize) : null,
        scrapedAt: property.scrapedAt?.toISOString() ?? null,
        publishedAt: property.publishedAt?.toISOString() ?? null,
        updatedAt: property.updatedAt?.toISOString() ?? null,
        createdAt: property.createdAt?.toISOString() ?? null,
    }
}

async function getFavorites(userId: string) {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: { property: true },
            orderBy: { createdAt: 'desc' }
        })
        return favorites.map((fav: any) => ({
            ...fav,
            createdAt: fav.createdAt?.toISOString() ?? null,
            property: serializeProperty(fav.property)
        }))
    } catch (error) {
        console.error('Error fetching favorites:', error)
        return []
    }
}

export default async function FavoritesPage() {
    const { userId, redirectToSignIn } = await auth()
    if (!userId) return redirectToSignIn()

    const favorites = await getFavorites(userId)

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-100 rounded-2xl">
                        <Heart className="w-6 h-6 text-red-600 fill-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Moje oblíbené</h1>
                        <p className="text-gray-500 font-medium">Správa uložených nemovitostí a poznámek</p>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <EmptyFavorites />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {favorites.map((fav: any) => (
                            <FavoriteCard key={fav.id} favorite={fav} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
