'use client'

import { Loader2 } from 'lucide-react'
import { Home } from 'lucide-react'

export function LoadingState() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
    )
}

export function ErrorState() {
    return (
        <div className="text-center py-20">
            <p className="text-red-600 text-lg">Chyba při načítání nemovitostí</p>
            <p className="text-gray-600 mt-2">Zkuste to prosím znovu později</p>
        </div>
    )
}

export function EmptyState() {
    return (
        <div className="text-center py-20">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Žádné nemovitosti nenalezeny
            </h3>
            <p className="text-gray-600">
                Zkuste změnit filtry nebo vyhledávací kritéria
            </p>
        </div>
    )
}
