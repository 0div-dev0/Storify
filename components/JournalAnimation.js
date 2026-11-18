"use client"
import React, { useEffect, useState } from "react"
import { FaPenNib } from "react-icons/fa";


const paragraphs = [
  "February 7",
  "Today was slow, and I let it be. I felt mentally tired, eased into the morning, and didn’t rush.",
  "Guilt showed up, but I reminded myself that rest matters and not every day has to shine.",
  "I finished one thing I’d been avoiding—imperfect but done—and that was enough.",
  "Tonight, I’m hoping for calmer sleep and an honest tomorrow."
]

const JournalAnimation = () => {
  const [paragraphIndex, setParagraphIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Reduced-motion readers get the finished page instead of a typewriter
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reducedMotion || paragraphIndex >= paragraphs.length) return

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
  }, [charIndex, paragraphIndex, reducedMotion])

  const finishedParagraphs = reducedMotion ? paragraphs : paragraphs.slice(0, paragraphIndex)
  const typingParagraph =
    !reducedMotion && paragraphIndex < paragraphs.length ? paragraphs[paragraphIndex] : null

  return (
    <div className="flex flex-col gap-3 relative overflow-hidden h-full font-body text-ink leading-relaxed">
      <FaPenNib className="absolute top-0 right-0 text-sepia/50" size="22" />
      {finishedParagraphs.map((p, i) => (
        <div key={i} className={i === 0 ? "font-display font-bold text-sepia" : ""}>{p}</div>
      ))}

      {typingParagraph !== null && (
        <div>
          {typingParagraph.slice(0, charIndex)}
          <span className="animate-pulse inline-flex items-center">
            <FaPenNib className="inline text-sepia" size="13" />
          </span>
        </div>
      )}
    </div>
  )
}

export default JournalAnimation