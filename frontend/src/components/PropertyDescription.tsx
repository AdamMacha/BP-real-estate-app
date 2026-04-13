import { cn } from '@/lib/utils'

interface PropertyDescriptionProps {
    description?: string | null
    source: string
}

const sourceColorMap: Record<string, string> = {
    sreality: 'bg-blue-100 text-blue-800',
    bezrealitky: 'bg-green-100 text-green-800',
}

export function PropertyDescription({ description, source }: PropertyDescriptionProps) {
    const sourceColor = sourceColorMap[source] ?? 'bg-gray-100 text-gray-800'

    return (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Popis nemovitosti</h2>
                <div className={cn('px-3 py-1 rounded-full text-xs font-semibold', sourceColor)}>
                    Zdroj: {source}
                </div>
            </div>
            <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap">
                {description || 'Popis není k dispozici.'}
            </div>
        </div>
    )
}
