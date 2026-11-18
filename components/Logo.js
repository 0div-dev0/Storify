import React from 'react'
import Link from 'next/link'

/**
 * Wordmark.
 * tone="light" — for parchment/paper backgrounds (dark ink text)
 * tone="dark"  — for espresso/mahogany backgrounds (light text)
 */
const Logo = ({ compact = false, tone = "light" }) => {
  const toneClass = tone === "dark" ? "text-parchment" : "text-ink"

  return (
    <Link
      href="/"
      aria-label="Storify — go to home"
      className={`flex cursor-pointer gap-2 items-center justify-center font-display font-black no-underline transition-opacity hover:opacity-80 ${toneClass} ${
        compact ? 'text-lg' : 'text-2xl'
      }`}
      style={{ letterSpacing: '-0.02em' }}
    >
      {!compact && (
        <img src="/favicon.ico" alt="" className="object-contain w-6 h-6" />
      )}
      <span>
        Stor<span className="text-terracotta">ify</span>
      </span>
    </Link>
  )
}

export default Logo
