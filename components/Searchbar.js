import React from 'react'

const Searchbar = () => {
  return (
    <div className="card-vintage w-full max-w-xs h-11 flex items-center gap-2 px-4">
      <label htmlFor="search-input" className="sr-only">Search</label>
      <input
        id="search-input"
        type="text"
        placeholder="Search…"
        className="w-full h-full bg-transparent text-ink placeholder:text-ink-faint font-body focus:outline-none"
      />
      <kbd className="text-ink-faint font-mono text-xs bg-vellum rounded px-1.5 py-0.5">/</kbd>
    </div>
  )
}

export default Searchbar