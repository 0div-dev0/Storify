"use client"
import React, { useState } from "react"
import styles from "./Login.module.css"
import { useRouter } from "next/navigation"

const Login = ({ flex, btn, width, color, inp=true, onClick=null }) => {
  const [uInput, setUInput] = useState("")
  const router = useRouter()

  const handleChange = (event) => {
    setUInput(event.target.value)
  }

  const handleClick = () => {
    if(onClick){
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
        className={`bg-[#5522cc] cursor-pointer px-10 flex items-center justify-center font-bold rounded-lg h-10 py-3 ${
          color === "animate" && styles.glowonhover
        }`}
        style={{ backgroundColor: color }}
      >
        {btn}
      </button>
    </div>
  )
}

export default Login
