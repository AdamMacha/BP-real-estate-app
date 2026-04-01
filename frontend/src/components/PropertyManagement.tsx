'use client'

import { useState, useEffect } from 'react'
import { Heart, StickyNote, ClipboardList, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface PropertyManagementProps {
    propertyId: string
    initialData?: {
        isFavorite: boolean
        notes: string | null
        status: string | null
    }
}

export function PropertyManagement({ propertyId, initialData }: PropertyManagementProps) {
    const router = useRouter()
    const [isFavorite, setIsFavorite] = useState(initialData?.isFavorite || false)
    const [notes, setNotes] = useState(initialData?.notes || '')
    const [status, setStatus] = useState(initialData?.status || '')
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    // Clear message after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [message])

    const handleToggleFavorite = async () => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId, toggle: true })
            })
            const data = await res.json()
            setIsFavorite(data.favorited)
            router.refresh()
        } catch (error) {
            console.error('Error toggling favorite:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdateManagement = async () => {
        setIsSaving(true)
        try {
            await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId, notes, status })
            })
            setMessage('Uloženo!')
            router.refresh()
        } catch (error) {
            console.error('Error updating management:', error)
            setMessage('Chyba při ukládání')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-purple-600" />
                Správa nemovitosti
            </h2>

            <div className="space-y-6">
                {/* Favorite Toggle */}
                <button
                    onClick={handleToggleFavorite}
                    disabled={isSaving}
                    className={cn(
                        "w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 border-2",
                        isFavorite 
                            ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100" 
                            : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100 hover:border-gray-200"
                    )}
                >
                    <Heart className={cn("w-5 h-5", isFavorite && "fill-red-600")} />
                    {isFavorite ? 'Uloženo v oblíbených' : 'Přidat do oblíbených'}
                </button>

                {/* Status Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stav komunikace</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Zájem', 'Prohlídka', 'Zamítnuto'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={cn(
                                    "py-2 px-1 text-xs font-bold rounded-lg border transition-all",
                                    status === s 
                                        ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100" 
                                        : "bg-white border-gray-200 text-gray-600 hover:border-purple-300"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <StickyNote className="w-4 h-4" />
                        Osobní poznámky
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Např.: Má sklep, balkón do ulice..."
                        rows={3}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-sm"
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleUpdateManagement}
                    disabled={isSaving}
                    className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Uložit změny
                </button>

                {message && (
                    <p className={cn(
                        "text-center text-sm font-bold animate-in fade-in slide-in-from-bottom-2",
                        message.includes('Chyba') ? "text-red-600" : "text-green-600"
                    )}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    )
}
