import Link from 'next/link'
import React from 'react'

const NotFoundPage = () => {
  return (
    <main className="flex-auto primary-container flex flex-col items-center justify-center gap-8 py-12 relative">
      <h1 className="text-5xl font-bold text-primary text-shadow-lg">404</h1>
      <p className="text-lg text-gray-600 max-w-xl">Page not found</p>
      <Link href="/" className="bg-primary text-white px-6 py-3 rounded-lg shadow hover:bg-primary-dark transition">
        Go to home
      </Link>
    </main>
  )
}

export default NotFoundPage
