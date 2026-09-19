import React from 'react'
import { useState } from 'react'
import {assets} from '../../assets/assets'
import './Sidebar.css'
function Sidebar()
{
    const [extended,setextended]=useState(false)
    return (
        <>
        <div className="sidebar">
            {/* This section will contain the top elements of the sidebar such as Option menu plus icon */}
            <div className="top">
                <div className="topitems menu mt-8 p-10 "onClick={()=>setextended(!extended)}>
                    <img src={assets.menu_icon} alt='menu icon'></img>
                </div>

                <div className="topitems new-chat w-full inline-flex  flex-row border-2 border-grey rounded-3xl bg-[#e6eaf1] text-gray-600 text-2xl justify-center mt-8 ">
                    <img src={assets.plus_icon} alt="new-chat" />
                    {extended?<p >new chat</p>:null}
                </div>
                <div className="topitems recent flex" >
                    <p className="recent-title font-bold text-black">Recent</p>
                    <div className="recent-entry flex items-start mt-2  p-8 hover:border-3 rounded-lg hover:bg-[#e2e6eb]">
                        <img src={assets.message_icon} alt='recent-history'></img>
                       {extended ?  <p className="items-center">What is React...</p> :null}
                    </div>
                </div>


            </div>

            {/* This Section will contain all the bottom elements of the Sidebar such as History , Help , and Setting  */}

            <div className="bottom">

                <div className="bottomitems recent-entry hover:border-3 rounded-lg hover:bg-[#e2e6eb]">
                    <div className="history">
                        <img src={assets.history_icon} alt='History_Icon'></img>
                        {extended ?<p>History</p>:null}
                    </div>
                </div>
                <div className="bottomitems recent-entry flex-row hover:border-3 rounded-lg hover:bg-[#e2e6eb]">
                    <div className="setting">
                        <img src={assets.setting_icon} alt='setting_Icon'></img>
                        {extended?<p>Setting</p>:null}
                    </div>
                </div>
                <div className="bottomitems recent-entry hover:border-3 rounded-lg hover:bg-[#e2e6eb]">
                    <div className="question">
                        <img src={assets.question_icon} alt='question_Icon'></img>
                        {extended?<p>Help</p>:null}
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default Sidebar