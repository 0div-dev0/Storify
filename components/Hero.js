"use client"
import React from 'react'
import JournalAnimation from './JournalAnimation'
import Button from './Button'
import styles from "./Hero.module.css"
import Image from "next/image";

const Hero = () => {
    return (
        <div className='w-full h-200 md:h-150 relative'>
            <Image
                src="/images/heroimage1.jpg"
                alt="Hero"
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="absolute w-full h-full object-cover opacity-8"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
            <div className='relative w-full h-full px-10 py-15 flex flex-col md:flex-row gap-2 bg-gray-950 rounded-lg justify-center md:justify-start'>

                <div className="left h-[60%] md:h-auto md:w-[60%] flex flex-col gap-10">

                    <div className={`text-2xl relative z-2 md:text-5xl font-bold ${styles.heroTitle} text-center md:text-left`}>
                        See what you've been up to with AI Journal summaries, analyze your habits, change your lifestyle
                    </div>
                    <div className="text-xl relative z-2 md:text-3xl">
                        "Turn your life into a story"
                    </div>
                    <div className='relative z-2'>
                        <Button btn="Start building your story" flex="column" width="80%" color="#5522cc" />
                    </div>
                </div>


                <div className={`right h-[90%] relative z-2 py-5 px-15 overflow-hidden md:w-[40%] text-lg md:text-xl font-bold flex flex-col gap-10 ${styles.journal}`}>
                    <div className="journal h-[60%]">

                    <JournalAnimation />
                    </div>
                    <div className="test-it-out btn flex-1 w-full">
                                    <Button inp={false} color="#5522cc" btn="Test out the journal!" width="100%"/>
                                    {/* increase height of btn  */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero