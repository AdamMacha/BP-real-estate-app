'use client'

import { useState } from 'react'
import { TrendingUp, Calculator, Coins } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface InvestmentAnalysisProps {
    price: number
}

export function InvestmentAnalysis({ price }: InvestmentAnalysisProps) {
    const [estimatedRent, setEstimatedRent] = useState<number>(Math.round(price * 0.04 / 12)) // Default to 4% yield
    
    const annualRent = estimatedRent * 12
    const yieldPercentage = (annualRent / price) * 100
    const paybackYears = price / annualRent

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator className="w-16 h-16" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Investiční analýza
            </h2>

            <div className="space-y-6">
                {/* Input Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Odhadovaný měsíční nájem (Kč)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={estimatedRent}
                            onChange={(e) => setEstimatedRent(Number(e.target.value))}
                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-semibold"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                            Kč
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-xs font-bold text-blue-600 uppercase mb-1">Roční výnos (ROI)</div>
                        <div className="text-xl font-black text-blue-800">
                            {yieldPercentage.toFixed(2)} %
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Návratnost</div>
                        <div className="text-xl font-black text-gray-800">
                            {paybackYears.toFixed(1)} let
                        </div>
                    </div>
                </div>

                {/* Info Text */}
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                    <p className="flex items-start gap-2">
                        <span className="font-bold">TIP:</span>
                        Tento výpočet je pouze orientační. Nezahrnuje daně, poplatky za energie ani náklady na údržbu.
                    </p>
                </div>
            </div>
        </div>
    )
}
