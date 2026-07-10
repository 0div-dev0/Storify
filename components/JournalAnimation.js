"use client"
import React, { useEffect, useState } from "react"
import { FaPenNib } from "react-icons/fa";


const paragraphs = [
  "February 7",
  "Today was slow, and I let it be. I felt mentally tired, eased into the morning, and didn't rush.",
  "Guilt showed up, but I reminded myself that rest matters and not every day has to shine.",
  "I finished one thing I'd been avoiding—imperfect but done—and that was enough.",
  "Tonight, I'm hoping for calmer sleep and an honest tomorrow."
]

const JournalAnimation = () => {
  const [paragraphIndex, setParagraphIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    if (paragraphIndex >= paragraphs.length) return

    const currentText = paragraphs[paragraphIndex]

    if (charIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setCharIndex((prev) => prev + 1)
      }, 30) // typing speed (ms)

      return () => clearTimeout(timeout)
    } else {
      // pause before starting next paragraph
      const timeout = setTimeout(() => {
        setParagraphIndex((prev) => prev + 1)
        setCharIndex(0)
      }, 500)

      return () => clearTimeout(timeout)
    }
  }, [charIndex, paragraphIndex])

  return (
      <div className="flex flex-col gap-3 bg-gray-700 relative rounded-xl py-3 px-5 overflow-hidden h-full">
        <FaPenNib className="absolute top-2 right-2" size="30"/>
      {paragraphs.slice(0, paragraphIndex).map((p, i) => (
        <div key={i}>{p}</div> 
      ))}

      {paragraphIndex < paragraphs.length && (
        <div>
          {paragraphs[paragraphIndex].slice(0, charIndex)}
          <span className="animate-pulse">        <FaPenNib className="inline" size="15"/>
</span>
        </div>
      )}
    </div>
  )
}

export default JournalAnimation