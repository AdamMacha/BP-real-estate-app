import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { MapPin, Maximize, Bed, Calendar, ExternalLink, ArrowLeft, Building2, Home } from 'lucide-react'
import { formatPrice, formatArea, cn } from '@/lib/utils'

async function getProperty(id: string) {
    try {
        const property = await prisma.property.findUnique({
            where: { id }
        })
        return property
    } catch (error) {
        console.error('Error fetching property:', error)
        return null
    }
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const property = await getProperty(id)

    if (!property) {
        notFound()
    }

    const sourceColor = property.source === 'sreality' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Zpět na výpis</span>
                    </Link>
                    <div className={cn("px-3 py-1 rounded-full text-sm font-semibold", sourceColor)}>
                        Zdroj: {property.source}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Images & Description */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="relative aspect-video w-full">
                                {property.images && property.images.length > 0 ? (
                                    <Image
                                        src={property.images[0]}
                                        alt={property.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <MapPin className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            {/* Thumbnails grid if more images */}
                            {property.images && property.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2 p-2 bg-gray-50">
                                    {property.images.slice(1, 5).map((img: string, idx: number) => (
                                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden">
                                            <Image
                                                src={img}
                                                alt={`${property.title} - ${idx + 2}`}
                                                fill
                                                className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                            />
                                            {idx === 3 && property.images.length > 5 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                                                    +{property.images.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Popis nemovitosti</h2>
                            <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap">
                                {property.description || "Popis není k dispozici."}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Key Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>

                            <div className="flex items-center gap-2 text-gray-600 mb-6">
                                <MapPin className="w-5 h-5 flex-shrink-0" />
                                <span>{property.address || property.city}</span>
                            </div>

                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <div className="text-4xl font-bold text-blue-600">
                                    {formatPrice(Number(property.price))}
                                </div>
                                {property.priceNote && (
                                    <div className="text-sm text-gray-500 mt-1">{property.priceNote}</div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Maximize className="w-4 h-4" />
                                        <span className="text-sm">Plocha</span>
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {property.areaSize ? formatArea(Number(property.areaSize)) : '-'}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Bed className="w-4 h-4" />
                                        <span className="text-sm">Dispozice</span>
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {property.roomCount || '-'}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Building2 className="w-4 h-4" />
                                        <span className="text-sm">Patro</span>
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {property.floor !== null ? `${property.floor}.` : '-'}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Home className="w-4 h-4" />
                                        <span className="text-sm">Typ</span>
                                    </div>
                                    <div className="font-semibold text-gray-900 capitalize">
                                        {property.propertyType === 'flat' ? 'Byt' :
                                            property.propertyType === 'house' ? 'Dům' :
                                                property.propertyType === 'land' ? 'Pozemek' : 'Komerční'}
                                    </div>
                                </div>
                            </div>

                            <a
                                href={property.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-200"
                            >
                                <span>Přejít na inzerát</span>
                                <ExternalLink className="w-5 h-5" />
                            </a>

                            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>Aktualizováno: {new Date(property.updatedAt).toLocaleDateString('cs-CZ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
