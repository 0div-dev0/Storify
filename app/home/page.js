import Home from '@/components/AccountDetails'
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Aside from '@/components/Aside'

const HomePage = async () => {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    return (
        <div className='h-full w-full flex-1 overflow-hidden bg-gray-950 relative'>
            <div className="flex w-full h-full overflow-hidden">
                <Aside />
                <div className='h-full w-full flex-1 flex flex-col overflow-y-auto custom-scrollbar'>
                    <Home email={session?.user?.email} />
                </div>
            </div>
        </div>
    )
}

export default HomePage
