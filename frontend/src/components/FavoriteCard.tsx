'use client'

import { PropertyCard } from '@/components/PropertyCard'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, StickyNote, Info, Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FavoriteData {
    id: string
    status?: string | null
    notes?: string | null
    property: any
}

interface FavoriteCardProps {
    favorite: FavoriteData
}

export function FavoriteCard({ favorite }: FavoriteCardProps) {
    return (
        <div className="group flex flex-col">
            <PropertyCard
                property={favorite.property}
                isFavorite={true}
            />

            {/* Notes & status overlay */}
            <div className="mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 min-h-[80px] flex flex-col justify-center">
                {favorite.status ? (
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-purple-600" />
                        <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
                            Stav: {favorite.status}
                        </Badge>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                        <Info className="w-4 h-4" />
                        <span className="text-[10px] font-medium italic">Bez nastaveného stavu</span>
                    </div>
                )}

                {favorite.notes ? (
                    <div className="flex items-start gap-2">
                        <StickyNote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-600 line-clamp-2 italic">
                            &ldquo;{favorite.notes}&rdquo;
                        </p>
                    </div>
                ) : (
                    <p className="text-[10px] text-gray-400 italic pl-6">Bez poznámky</p>
                )}
            </div>
        </div>
    )
}

export function EmptyFavorites() {
    return (
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
    )
}
