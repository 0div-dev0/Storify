"use client"
import React, { useState, useEffect } from 'react'
import GoalCalendar from './GoalCalendar'
import TodayGoals from './TodayGoals'
import { IoClose } from 'react-icons/io5'

const Aside = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleToggle = () => setOpen(prev => !prev)
    window.addEventListener('toggleSidebar', handleToggle)
    return () => window.removeEventListener('toggleSidebar', handleToggle)
  }, [])

  const handleClose = () => {
    window.dispatchEvent(new CustomEvent('toggleSidebar'))
  }

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={handleClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 md:relative md:top-auto md:left-auto md:z-30
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-80 h-full bg-gray-950 border-r border-white/5 
        transition-transform duration-300 ease-in-out
        overflow-y-auto custom-scrollbar
      `}>
        {/* Mobile Drawer Close Button */}
        <div className="flex md:hidden justify-end p-2 border-b border-white/5 bg-gray-950 sticky top-0 z-10">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <TodayGoals />
          <GoalCalendar />
        </div>
      </aside>
    </>
  )
}

export default Aside
