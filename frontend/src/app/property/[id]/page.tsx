// Turbopack cache bust
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { InvestmentAnalysis } from '@/components/InvestmentAnalysis'
import { PropertyManagement } from '@/components/PropertyManagement'
import { PropertyImageGallery } from '@/components/PropertyImageGallery'
import { PropertyDescription } from '@/components/PropertyDescription'
import { PropertyInfoPanel } from '@/components/PropertyInfoPanel'
import { auth } from '@clerk/nextjs/server'

async function getProperty(id: string) {
    try {
        return await prisma.property.findUnique({ where: { id } })
    } catch (error) {
        console.error('Error fetching property:', error)
        return null
    }
}

async function getFavoriteData(propertyId: string, userId: string) {
    try {
        return await prisma.favorite.findUnique({
            where: { userId_propertyId: { userId, propertyId } }
        })
    } catch {
        return null
    }
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { userId } = await auth()
    const property = await getProperty(id)
    const favoriteData = userId ? await getFavoriteData(id, userId) : null

    if (!property) notFound()

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column */}
                    <div className="lg:col-span-2 space-y-8">
                        <PropertyImageGallery
                            images={property.images ?? []}
                            title={property.title}
                        />
                        <PropertyDescription
                            description={property.description}
                            source={property.source}
                        />
                    </div>

                    {/* Right column */}
                    <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                        <PropertyInfoPanel
                            title={property.title}
                            address={property.address}
                            city={property.city}
                            price={property.price ? Number(property.price) : null}
                            priceNote={property.priceNote}
                            areaSize={property.areaSize ? Number(property.areaSize) : null}
                            roomCount={property.roomCount}
                            propertyType={property.propertyType}
                            sourceUrl={property.sourceUrl}
                            updatedAt={property.updatedAt}
                        />
                        <InvestmentAnalysis price={Number(property.price)} />
                        <PropertyManagement
                            propertyId={property.id}
                            initialData={{
                                isFavorite: !!favoriteData,
                                notes: favoriteData?.notes || '',
                                status: (favoriteData as any)?.status || '',
                            }}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
