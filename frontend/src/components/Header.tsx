'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'

export function Header() {
    const pathname = usePathname()
    const { isSignedIn } = useUser()

    const navItems = [
        { name: 'Hledat', href: '/', icon: Search },
        { name: 'Oblíbené', href: '/favorites', icon: Heart },
    ]

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform duration-200">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                BP Real Estate
                            </h1>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Investiční agregátor</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Navigation */}
                        <nav className="flex items-center gap-1 sm:gap-2">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4", isActive && item.name === 'Oblíbené' && "fill-blue-600")} />
                                        <span className="hidden sm:inline">{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Auth */}
                        {isSignedIn ? (
                            <UserButton />
                        ) : (
                            <SignInButton mode="redirect">
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-100">
                                    <span>Přihlásit se</span>
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
