import React from 'react'
import DiaryLLM from '@/components/DiaryLLM'
import Aside from '@/components/Aside'

const JournalInterface = async () => {
  return (
    <div className='flex-1 h-full flex flex-col relative overflow-hidden'>
      <div className="flex w-full h-full overflow-hidden">
        <Aside />
        <div className='h-full w-full flex-1 flex flex-col overflow-hidden'>
          <DiaryLLM />
        </div>
      </div>
    </div>
  )
}

export default JournalInterface