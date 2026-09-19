import { assets } from '../../assets/assets';
import './Main.css';
import React from 'react';

function Main()
{
    return (
      <>
        <div className="main flex-1 relative pb-2 min-h-full mt-4">
          <div className="nav flex flex-row items-center p-4  justify-between text-2xl text-[#585858]">
            <p className="ml-8 p-5">Gemini</p>
            <img src={assets.user_icon} alt="user_icon" />
          </div>

          <div className="main-container  flex flex-col justify-center items-center m-10">
            <div className="greet m-10 p-10 font-bold text-4xl text-[#c4c7c5]">
              <p>
                <span> Hello, Dev.</span>
              </p>
              <p>How can i help you today ?</p>
            </div>
            <div className="cards  gap-4 grid sm:grid-cols-2 lg:grid-cols-4">
              <div className="card1 min-h-44  p-4 flex flex-col justify-between rounded-2xl bg-[#f0f4f9] hover:backdrop-blur-2xl hover:bg-[#c4c7c5] hover: transition:width 0.3s ease hover:border-3  ">
                <p className="text-wrap text-center"> Suggest beautiful places to visit on a road trip</p>
                <img className="self-end" src={assets.bulb_icon} alt="bulb_icon" />
              </div>
              
              <div className="card2 min-h-44 flex flex-col justify-between p-4  rounded-2xl bg-[#f0f4f9]  hover:backdrop-blur-2xl hover:bg-[#c4c7c5] hover: transition:width 0.3s ease hover:border-3 ">
                <p>Explain how artificial intelligence works</p>
                <img className="self-end" src={assets.code_icon} alt="code_icon" />
              </div>
              <div className="card3 min-h-44 flex flex-col justify-between p-4 rounded-2xl bg-[#f0f4f9] hover:backdrop-blur-2xl hover:bg-[#c4c7c5] hover: transition:width 0.3s ease hover:border-3 ">
                <p>Give me some project ideas</p>
                <img className="self-end" src={assets.compass_icon} alt="compass_icon" />
              </div>
              <div className="card4 min-h-44 flex flex-col justify-between p-4  rounded-2xl bg-[#f0f4f9] hover:backdrop-blur-2xl hover:bg-[#c4c7c5] hover: transition:width 0.3s ease hover:border-3 ">
                <p>Help me learn React</p>
                <img className="self-end" src={assets.question_icon} alt="question_icon" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
}

export default Main