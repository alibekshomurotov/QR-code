'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            QR Generator
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">Asosiy</Link>
            <Link href="/history" className="text-gray-700 hover:text-blue-600 transition">Tarix</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}