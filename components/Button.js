"use client"
import React, { memo, useState } from "react"
import { useRouter } from "next/navigation"

const Button = memo(({ flex, btn, width, inp = true, onClick = null }) => {
  const [uInput, setUInput] = useState("")
  const router = useRouter()

  const handleChange = (event) => {
    setUInput(event.target.value)
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    if (!uInput) return
    router.push(`/login?email=${encodeURIComponent(uInput)}`)
  }

  return (
    <div
      className="flex md:w-150 w-full gap-3 mx-auto md:mx-0"
      style={{ flexDirection: flex, width: width }}
    >
      {inp && <input
        type="email"
        value={uInput}
        onChange={handleChange}
        className="px-10 text-black bg-white rounded-lg w-full h-10"
      />}

      <button
        onClick={handleClick}
        className="cursor-pointer bg-purple-700 px-10 flex items-center justify-center font-bold rounded-lg h-10 py-3 glow-on-hover"
      >
        {btn}
      </button>
    </div>
  )
})

export default Button