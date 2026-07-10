import React from 'react'
import JournalAnimation from './JournalAnimation'
import Login from './Button'
import styles from "./Hero.module.css"
import Image from "next/image";
// import { useRouter } from 'next/navigation'



const Hero = () => {
    // const router = useRouter()
    // const handleClick = ()=>{
    //     router.push('/journal')
    // }
    // do in smaller component
    return (
        <div className='relative w-full h-200 md:h-150'>
            <Image
                src="/images/heroimage1.jpg"
                alt="Hero"
                width={1200}
                height={800}
                className="absolute w-full h-150 object-cover opacity-8 bg-linear-to-b from-transparent to-black"
            />
        <div className='w-full h-full px-10 py-15 flex flex-col md:flex-row gap-2 bg-gray-950 rounded-lg justify-center md:justify-start'>

            <div className="left h-[60%] md:h-auto md:w-[60%] flex flex-col gap-10">

                <div className={`text-2xl relative z-2 md:text-5xl font-bold ${styles.heroTitle} text-center md:text-left`}>
                    See what you've been up to with AI Journal summaries, analyze your habits, change your lifestyle
                </div>
                <div className="text-xl relative z-2 md:text-3xl">
                    "Turn your life into a story"
                </div>
                <div className='relative z-2'>
                    <Login btn="Start building your story" flex="column" width="80%" color="animate" />
                </div>
            </div>


            <div className={`right h-[90%] relative z-2 py-5 px-15 overflow-hidden md:w-[40%] text-lg md:text-xl font-bold flex flex-col gap-10 ${styles.journal}`}>
                <div className="journal h-[60%]">

                <JournalAnimation />
                </div>
                <div className="test-it-out btn flex-1 w-full">
                                <Login inp={false} color="animate" btn="Test out the journal!" width="100%"/>
                                {/* increase height of btn  */}
                </div>
            </div>
        </div>
        </div>
    )
}

export default Hero
