import React from 'react'

const Logo = () => {
  return (
    <div className='flex cursor-pointer gap-2 items-center justify-center font-bold text-white text-shadow-purple-700 text-shadow-lg text-2xl'>
      <img src="./favicon.ico" alt="" className=' object-contain'/> Storify
    </div>
  )
}

export default Logo
