"use client"
import React, { useState, useRef, useEffect } from 'react'
import Logo from './Logo'
import { FaRegCircleUser } from "react-icons/fa6"
import { MdDarkMode } from "react-icons/md"
import { CiLight } from "react-icons/ci"
import { IoHomeOutline, IoBookOutline, IoCompassOutline, IoSettingsOutline, IoLogOutOutline } from "react-icons/io5"
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { GiHamburgerMenu } from 'react-icons/gi'

const Navbar = () => {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const logged = session?.user?.email
  const router = useRouter()
  const [dropdown, setDropdown] = useState(false)
  const [theme, setTheme] = useState(true) // true = dark
  const desktopDropdownRef = useRef(null)
  const mobileDropdownRef = useRef(null)

  const handleToggleAside = () => {
    window.dispatchEvent(new CustomEvent('toggleSidebar'))
  }

  // Close dropdown on outside click — use mousedown so it fires before the
  // button's click handler, preventing an immediate re-open.
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

  const handleLogOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const navLinks = [
    { label: 'Home', icon: <IoHomeOutline size={16} />, href: '/home' },
    { label: 'Explore', icon: <IoCompassOutline size={16} />, href: '/explore' },
    { label: 'Journal', icon: <IoBookOutline size={16} />, href: '/journal' },
  ]

  // Truncate email for display
  const displayEmail = logged && logged.length > 20 ? logged.slice(0, 18) + '…' : logged

  // ── Skeleton / loading state ──────────────────────────────────────────────
  // While next-auth is resolving the session we render a neutral skeleton so
  // neither the "logged in" nor the "logged out" state flashes.
  if (status === 'loading') {
    return (
      <nav className="flex px-4 md:px-15 py-3 md:py-4 items-center justify-between w-full min-h-[64px] md:min-h-[72px] bg-gray-950/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 min-w-0">
        <div className="flex items-center justify-between w-full min-w-0 animate-pulse">
          <div className="w-12 h-8 rounded-lg bg-white/5 flex-shrink-0" />
          <div className="flex gap-3 items-center min-w-0">
            <div className="hidden md:block w-40 h-8 rounded-lg bg-white/5 flex-shrink-0" />
            <div className="w-28 h-8 rounded-xl bg-white/5 flex-shrink-0" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="flex px-4 md:px-15 py-3 md:py-4 items-center justify-between w-full min-h-[64px] md:min-h-[72px] bg-gray-950/95 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 min-w-0">
        {/* LOGGED IN STATE */}
        {logged && (
          <div className="flex items-center justify-between w-full">
            {/* Desktop Navigation Layout */}
            <div className="hidden md:flex items-center justify-between w-full">
              {/* Left: Logo + Nav Links */}
              <div className="flex gap-10 lg:gap-20 items-center">
                <div className="logo w-15 relative shrink-0">
                  <Logo />
                </div>
                <ul className="links flex gap-2 items-center">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${isActive
                            ? 'text-white bg-indigo-500/10 border border-indigo-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
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

                {/* User dropdown trigger — desktop */}
                <div className="relative" ref={desktopDropdownRef}>
                  <button
                    onClick={() => setDropdown(prev => !prev)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    aria-expanded={dropdown}
                    aria-haspopup="true"
                    aria-label={logged ? `User menu for ${logged}` : 'User menu'}
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                      <FaRegCircleUser size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors max-w-[140px] truncate">
                      {displayEmail}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  <div
                    className={`absolute right-0 top-[calc(100%+8px)] w-56 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden origin-top-right transition-all duration-200 ${dropdown ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                  >
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                      <p className="text-xs text-slate-400 mb-0.5">Signed in as</p>
                      <p className="text-sm text-white font-medium truncate">{logged}</p>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => setTheme(!theme)}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                        aria-label={theme ? 'Switch to light mode' : 'Switch to dark mode'}
                      >
                        {theme ? <MdDarkMode size={16} className="text-slate-400" /> : <CiLight size={16} className="text-slate-400" />}
                        {theme ? 'Dark Mode' : 'Light Mode'}
                      </button>

                      <button
                        onClick={() => { setDropdown(false); router.push('/settings') }}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                        aria-label="Open settings"
                      >
                        <IoSettingsOutline size={16} className="text-slate-400" />
                        Settings
                      </button>

                      <div className="border-t border-white/10 my-1" />

                      <button
                        onClick={handleLogOut}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                        aria-label="Sign out"
                      >
                        <IoLogOutOutline size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Layout */}
            <div className="flex md:hidden items-center justify-between w-full">
              {/* Left: Sidebar Toggle Hamburger */}
              <button
                onClick={handleToggleAside}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Toggle goals sidebar"
              >
                <GiHamburgerMenu size={22} />
              </button>

              {/* Center: Logo */}
              <div className="logo w-12 relative shrink-0">
                <Logo />
              </div>

              {/* Right: User Menu — mobile */}
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() => setDropdown(prev => !prev)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10"
                  aria-expanded={dropdown}
                  aria-haspopup="true"
                  aria-label={logged ? `User menu for ${logged}` : 'User menu'}
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                    <FaRegCircleUser size={12} className="text-indigo-400" />
                  </div>
                  <svg
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${dropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu (Mobile) */}
                <div
                  className={`absolute right-0 top-[calc(100%+8px)] w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden origin-top-right transition-all duration-200 ${dropdown ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                >
                  <div className="px-3 py-2 border-b border-white/10 bg-white/5 truncate">
                    <p className="text-[10px] text-slate-400 mb-0.5">Signed in as</p>
                    <p className="text-xs text-white font-medium truncate">{logged}</p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => setTheme(!theme)}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300"
                      aria-label={theme ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {theme ? <MdDarkMode size={14} className="text-slate-400" /> : <CiLight size={14} className="text-slate-400" />}
                      {theme ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                      onClick={() => { setDropdown(false); router.push('/settings') }}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300"
                      aria-label="Open settings"
                    >
                      <IoSettingsOutline size={14} className="text-slate-400" />
                      Settings
                    </button>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={handleLogOut}
                      className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10"
                      aria-label="Sign out"
                    >
                      <IoLogOutOutline size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGGED OUT STATE */}
        {!logged && status !== 'loading' && (
          <div className="flex items-center justify-between w-full">
            <div className="logo h-12 w-12 relative">
              <Logo />
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.97]"
            >
              Login
            </Link>
          </div>
        )}
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {logged && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-950/90 backdrop-blur-md border-t border-white/5 flex items-center justify-around z-40 md:hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-colors ${isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <div className={`${isActive ? 'scale-110 text-indigo-400' : 'text-slate-400'} transition-transform`}>
                  {link.icon}
                </div>
                <span className="text-[10px] tracking-wide">{link.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

export default Navbar
