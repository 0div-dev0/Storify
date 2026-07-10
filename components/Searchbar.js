import React, {useState} from 'react'

const Searchbar = () => {
    const [text, setText] = useState("")

  return (
    <div className='bg-gray-950 rounded-lg border-2 border-gray-800 relative w-100 h-13 text-2xl  items-center flex gap-2'>
      <input type="text" className='w-full h-full bg-gray-950 rounded-lg'/>
      <div className="px-5">/</div>
    </div>
  )
}

export default Searchbar
