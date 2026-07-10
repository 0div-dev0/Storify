import React from 'react'
import DiaryLLM from '@/components/DiaryLLM'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Aside from '@/components/Aside'

const JournalInterface = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className='flex-1 h-full bg-gray-950 flex flex-col relative overflow-hidden'>
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
