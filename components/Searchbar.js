"use client"
import React, { memo } from 'react'

const Searchbar = memo(() => (
  <div className='bg-gray-950 rounded-lg border-2 border-gray-800 relative w-100 h-13 text-2xl items-center flex gap-2'>
    <input 
      type="text" 
      className='w-full h-full bg-gray-950 rounded-lg' 
      placeholder="Search..."
    />
    <div className="px-5">/</div>
  </div>
))

export default Searchbar