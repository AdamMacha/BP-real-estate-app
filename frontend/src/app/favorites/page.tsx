export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { PropertyCard } from '@/components/PropertyCard'
import { Heart, StickyNote, ClipboardList, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { auth } from '@clerk/nextjs/server'



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
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-100 rounded-2xl">
                        <Heart className="w-6 h-6 text-red-600 fill-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-letter-none">Moje oblíbené</h1>
                        <p className="text-gray-500 font-medium">Správa uložených nemovitostí a poznámek</p>
                    </div>
                </div>

                {favorites.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Zatím nemáte žádné oblíbené</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Ukládejte si zajímavé inzeráty pomocí sekce Správa v detailu nemovitosti.
                        </p>
                        <Link href="/">
                            <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-100 text-base border-none cursor-pointer">
                                Prohlížet nemovitosti
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {favorites.map((fav: any) => (
                            <div key={fav.id} className="group flex flex-col">
                                <PropertyCard 
                                    property={fav.property as any} 
                                    isFavorite={true}
                                />
                                
                                {/* Management Overlay Info */}
                                <div className="mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 min-h-[80px] flex flex-col justify-center">
                                    {fav.status ? (
                                        <div className="flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4 text-purple-600" />
                                            <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
                                                Stav: {fav.status}
                                            </Badge>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Info className="w-4 h-4" />
                                            <span className="text-[10px] font-medium italic">Bez nastaveného stavu</span>
                                        </div>
                                    )}

                                    {fav.notes ? (
                                        <div className="flex items-start gap-2">
                                            <StickyNote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-gray-600 line-clamp-2 italic italic-letter-none">
                                                "{fav.notes}"
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-gray-400 italic pl-6">Bez poznámky</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
