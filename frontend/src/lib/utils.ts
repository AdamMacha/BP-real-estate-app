import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null | undefined): string {
    if (price === null || price === undefined) {
        return "Cena v RK"
    }

    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
        maximumFractionDigits: 0
    }).format(price)
}

export function formatArea(area: number | null | undefined): string {
    if (area === null || area === undefined) {
        return "N/A"
    }

    return `${area.toFixed(0)} m²`
}

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) {
        return "N/A"
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date

    return new Intl.DateTimeFormat('cs-CZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(dateObj)
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text
    }

    return text.substring(0, maxLength) + '...'
}
