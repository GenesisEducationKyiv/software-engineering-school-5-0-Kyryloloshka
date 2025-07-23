"use client"
import { Button } from '@/components/ui/button'
import { headerLinks } from '@/lib/configs/header-links'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const Header = () => {
  const pathname = usePathname();
  return (
    <header className="primary-container flex justify-between items-center py-4">
      <Link href="/" className="text-2xl font-bold text-primary text-shadow-lg">WeatherApp</Link>
      <nav>
        <ul className="flex gap-8">
          {headerLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
            <li key={link.href}>
              <Button className={cn(isActive ? 'bg-white hover:text-blue-800 hover:bg-white text-primary' : 'hover:bg-white hover:text-primary')} asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            </li>
          )})}
        </ul>
      </nav>
    </header>
  )
}

export default Header
