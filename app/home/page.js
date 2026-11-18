import Home from '@/components/AccountDetails'
import React from 'react'
import Aside from '@/components/Aside'

const HomePage = async () => {
    return (
        <div className='h-full w-full flex-1 overflow-hidden relative'>
            <div className="flex w-full h-full overflow-hidden">
                <Aside />
                <div className='h-full w-full flex-1 flex flex-col overflow-y-auto'>
                    <Home />
                </div>
            </div>
        </div>
    )
}

export default HomePage