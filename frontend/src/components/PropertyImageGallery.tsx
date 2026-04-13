import { SafeImage } from '@/components/SafeImage'

interface PropertyImageGalleryProps {
    images: string[]
    title: string
}

export function PropertyImageGallery({ images, title }: PropertyImageGalleryProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* Main image */}
            <div className="relative aspect-video w-full">
                <SafeImage
                    src={images.length > 0 ? images[0] : ''}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2 bg-gray-50 border-t border-gray-100">
                    {images.slice(1, 5).map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                            <SafeImage
                                src={img}
                                alt={`${title} ${idx + 2}`}
                                fill
                                className="object-cover hover:scale-110 transition-transform duration-300"
                            />
                            {idx === 3 && images.length > 5 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                                    +{images.length - 5}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
