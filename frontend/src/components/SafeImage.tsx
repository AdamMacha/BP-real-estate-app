'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SafeImageProps extends ImageProps {
    fallbackIcon?: React.ReactNode
}

export function SafeImage({ src, alt, className, fallbackIcon, ...props }: SafeImageProps) {
    const [error, setError] = useState(false)

    if (!src || error) {
        return (
            <div className={cn("w-full h-full bg-gray-200 flex items-center justify-center", className)}>
                {fallbackIcon || <Home className="w-12 h-12 text-gray-400" />}
            </div>
        )
    }

    return (
        <Image
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    )
}
