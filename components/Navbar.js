"use client"
import React, { useState, useRef, useEffect } from 'react'
import Logo from './Logo'
import { FaRegCircleUser } from "react-icons/fa6"
import {
  IoHomeOutline,
  IoBookOutline,
  IoCompassOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoLogInOutline,
} from "react-icons/io5"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { GiHamburgerMenu } from 'react-icons/gi'
import { useAuth } from '@/lib/AuthContext'
import AuthModal from './AuthModal'

const Navbar = () => {
  const pathname = usePathname()
  const { user, profile, logout } = useAuth()

  const [dropdown, setDropdown] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const desktopDropdownRef = useRef(null)
  const mobileDropdownRef = useRef(null)

  const handleToggleAside = () => {
    window.dispatchEvent(new CustomEvent('toggleSidebar'))
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleMouseDown = (e) => {
      const clickedDesktop = desktopDropdownRef.current?.contains(e.target)
      const clickedMobile = mobileDropdownRef.current?.contains(e.target)
      if (!clickedDesktop && !clickedMobile) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const navLinks = [
    { label: 'Home', icon: <IoHomeOutline size={16} />, href: '/home' },
    { label: 'Explore', icon: <IoCompassOutline size={16} />, href: '/explore' },
    { label: 'Journal', icon: <IoBookOutline size={16} />, href: '/journal' },
  ]

  const displayName = profile?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Writer')

  // The goals drawer (Aside) only exists on the dashboard and journal shells —
  // elsewhere the hamburger would be a control with nothing behind it.
  const hasSidebar = pathname === '/home' || pathname === '/journal'

  const handleLogout = async () => {
    setDropdown(false)
    await logout()
  }

  return (
    <>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <nav className="flex px-4 md:px-15 py-3 md:py-4 items-center justify-between w-full min-h-[64px] md:min-h-[72px] bg-parchment/95 backdrop-blur-md border-b border-sepia/15 sticky top-0 z-50 min-w-0">
        {/* Desktop Navigation Layout */}
        <div className="hidden md:flex items-center justify-between w-full">
          {/* Left: Logo + Nav Links */}
          <div className="flex gap-10 lg:gap-20 items-center">
            <div className="logo w-auto relative shrink-0">
              <Logo />
            </div>
            <ul className="links flex gap-2 items-center">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-bold tracking-wide uppercase cursor-pointer ${
                        isActive
                          ? 'text-parchment bg-mahogany'
                          : 'text-ink-soft hover:text-sepia hover:bg-vellum'
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex gap-4 items-center">
            {user ? (
              /* User dropdown trigger — desktop */
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setDropdown(prev => !prev)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-vellum hover:bg-clay transition-all cursor-pointer group"
                  aria-expanded={dropdown}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 rounded-full bg-sepia/15 border border-sepia/40 flex items-center justify-center">
                    <FaRegCircleUser size={14} className="text-sepia" />
                  </div>
                  <span className="text-sm font-bold text-ink group-hover:text-sepia transition-colors max-w-[140px] truncate">
                    {displayName}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-ink-soft transition-transform duration-200 ${dropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                <div
                  className={`absolute right-0 top-[calc(100%+8px)] w-56 bg-parchment rounded-xl shadow-[0_12px_40px_-8px_rgba(74,49,32,0.4)] overflow-hidden origin-top-right transition-all duration-200 ${
                    dropdown ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="px-4 py-3 border-b border-sepia/15 bg-vellum">
                    <p className="eyebrow mb-0.5">Written by</p>
                    <p className="text-sm font-bold text-ink truncate">{displayName}</p>
                    <p className="text-xs text-ink-soft truncate font-mono">{user.email}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => { setDropdown(false); window.location.href = '/settings' }}
                      className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-bold text-ink-soft hover:text-sepia hover:bg-vellum transition-all cursor-pointer"
                      aria-label="Open settings"
                    >
                      <IoSettingsOutline size={16} />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-bold text-brick hover:bg-brick/10 transition-all cursor-pointer"
                      aria-label="Sign out"
                    >
                      <IoLogOutOutline size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn-vintage text-xs md:text-sm py-2 px-4 cursor-pointer"
              >
                <IoLogInOutline size={16} />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Layout */}
        <div className="flex md:hidden items-center justify-between w-full">
          {/* Left: Sidebar Toggle Hamburger (dashboard / journal only) */}
          {hasSidebar && (
            <button
              onClick={handleToggleAside}
              className="p-2 text-ink-soft hover:text-sepia transition-colors cursor-pointer"
              aria-label="Toggle goals sidebar"
            >
              <GiHamburgerMenu size={22} />
            </button>
          )}

          {/* Center: Logo */}
          <div className="logo shrink-0">
            <Logo compact />
          </div>

          {/* Right: User Menu — mobile */}
          <div className="relative" ref={mobileDropdownRef}>
            {user ? (
              <>
                <button
                  onClick={() => setDropdown(prev => !prev)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-vellum cursor-pointer"
                  aria-expanded={dropdown}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="w-6 h-6 rounded-full bg-sepia/15 border border-sepia/40 flex items-center justify-center">
                    <FaRegCircleUser size={12} className="text-sepia" />
                  </div>
                  <svg
                    className={`w-3 h-3 text-ink-soft transition-transform duration-200 ${dropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu (Mobile) */}
                <div
                  className={`absolute right-0 top-[calc(100%+8px)] w-48 bg-parchment rounded-xl shadow-[0_12px_40px_-8px_rgba(74,49,32,0.4)] overflow-hidden origin-top-right transition-all duration-200 ${
                    dropdown ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="px-3 py-2 border-b border-sepia/15 bg-vellum truncate">
                    <p className="eyebrow mb-0.5 text-[9px]">Written by</p>
                    <p className="text-xs font-bold text-ink truncate">{displayName}</p>
                    <p className="text-[10px] text-ink-soft truncate font-mono">{user.email}</p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => { setDropdown(false); window.location.href = '/settings' }}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-bold text-ink-soft hover:bg-vellum transition-all cursor-pointer"
                      aria-label="Open settings"
                    >
                      <IoSettingsOutline size={14} />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-bold text-brick hover:bg-brick/10 transition-all cursor-pointer"
                      aria-label="Sign out"
                    >
                      <IoLogOutOutline size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn-vintage text-xs py-1.5 px-3 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-parchment/95 backdrop-blur-md border-t border-sepia/15 flex items-center justify-around z-40 md:hidden">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-colors cursor-pointer ${
                isActive ? 'text-terracotta font-bold' : 'text-ink-soft hover:text-sepia'
              }`}
            >
              <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                {link.icon}
              </div>
              <span className="text-[10px] tracking-widest uppercase">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

export default Navbar
