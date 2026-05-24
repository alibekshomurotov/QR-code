'use client'
import QRGenerator from './components/QRGenerator'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <QRGenerator />
    </main>
  )
}