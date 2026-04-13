import { MapPin, Maximize, Bed, Calendar, ExternalLink, Home } from 'lucide-react'
import { formatPrice, formatArea } from '@/lib/utils'

const PROPERTY_TYPE_LABELS: Record<string, string> = {
    flat: 'Byt',
    house: 'Dům',
    land: 'Pozemek',
    commercial: 'Komerční',
}

interface StatTileProps {
    icon: React.ReactNode
    label: string
    value: string
}

function StatTile({ icon, label, value }: StatTileProps) {
    return (
        <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <div className="font-semibold text-gray-900 text-sm">{value}</div>
        </div>
    )
}

interface PropertyInfoPanelProps {
    title: string
    address?: string | null
    city?: string | null
    price?: number | null
    priceNote?: string | null
    areaSize?: number | null
    roomCount?: string | null
    propertyType: string
    sourceUrl: string
    updatedAt: Date | string
}

export function PropertyInfoPanel({
    title,
    address,
    city,
    price,
    priceNote,
    areaSize,
    roomCount,
    propertyType,
    sourceUrl,
    updatedAt,
}: PropertyInfoPanelProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>

            <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{address || city}</span>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="text-4xl font-bold text-blue-600">
                    {formatPrice(Number(price))}
                </div>
                {priceNote && (
                    <div className="text-sm text-gray-500 mt-1">{priceNote}</div>
                )}
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <StatTile
                    icon={<Maximize className="w-4 h-4" />}
                    label="Plocha"
                    value={areaSize ? formatArea(Number(areaSize)) : '-'}
                />
                <StatTile
                    icon={<Bed className="w-4 h-4" />}
                    label="Dispozice"
                    value={roomCount || '-'}
                />
                <StatTile
                    icon={<Home className="w-4 h-4" />}
                    label="Typ"
                    value={PROPERTY_TYPE_LABELS[propertyType] ?? propertyType}
                />
            </div>

            {/* CTA */}
            <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 hover:shadow-blue-200"
            >
                <span>Přejít na inzerát</span>
                <ExternalLink className="w-5 h-5" />
            </a>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 border-t border-gray-100 pt-6">
                <Calendar className="w-4 h-4" />
                <span>Aktualizováno: {new Date(updatedAt).toLocaleDateString('cs-CZ')}</span>
            </div>
        </div>
    )
}
