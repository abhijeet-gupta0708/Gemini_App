import React, { useState } from "react";
import { assets } from "../../assets/assets";

function Sidebar({ onNewChat }) {
  const [extended, setExtended] = useState(false);

  return (
    <aside
      style={{
        width: extended ? "240px" : "72px",
        minWidth: extended ? "240px" : "72px",
      }}
      className="
        min-h-screen
        bg-[#f0f4f9]
        flex
        flex-col
        justify-between
        transition-all
        duration-300
        ease-in-out
        shrink-0
      "
    >

      {/* =========================
          TOP
      ========================= */}

      <div className="pt-4">

        {/* MENU */}

        <button
          type="button"
          onClick={() => setExtended(!extended)}
          className="
            w-full
            h-12
            flex
            items-center
            justify-center
            hover:bg-[#e2e6eb]
            transition
          "
        >
          <img
            src={assets.menu_icon}
            alt="Menu"
            className="w-6 h-6"
          />
        </button>


        {/* NEW CHAT */}

        <button
          type="button"
          onClick={onNewChat}
          className={`
            flex
            items-center
            gap-3
            bg-[#e6eaf1]
            hover:bg-[#dfe4eb]
            transition
            rounded-full
            text-gray-600

            ${
              extended
                ? "w-[calc(100%-24px)] mx-3 px-4 py-3"
                : "w-14 h-12 mx-auto justify-center"
            }
          `}
        >

          <img
            src={assets.plus_icon}
            alt="New Chat"
            className="w-7 h-7 shrink-0"
          />

          {extended && (
            <span className="text-base whitespace-nowrap">
              New chat
            </span>
          )}

        </button>


        {/* RECENT */}

        <div className="mt-6">

          {extended && (
            <p className="px-5 mb-2 font-semibold text-gray-700">
              Recent
            </p>
          )}

          <button
            type="button"
            className={`
              flex
              items-center
              gap-3
              rounded-lg
              hover:bg-[#e2e6eb]
              transition

              ${
                extended
                  ? "w-[calc(100%-16px)] mx-2 px-3 py-3"
                  : "w-14 h-12 mx-auto justify-center"
              }
            `}
          >

            <img
              src={assets.message_icon}
              alt="Recent"
              className="w-5 h-5 shrink-0"
            />

            {extended && (
              <span className="text-sm text-gray-700 truncate">
                What is React...
              </span>
            )}

          </button>

        </div>

      </div>


      {/* =========================
          BOTTOM
      ========================= */}

      <div className="pb-4">

        {/* HISTORY */}

        <button
          type="button"
          className={`
            flex
            items-center
            gap-3
            rounded-lg
            hover:bg-[#e2e6eb]
            transition

            ${
              extended
                ? "w-[calc(100%-16px)] mx-2 px-3 py-3"
                : "w-14 h-12 mx-auto justify-center"
            }
          `}
        >

          <img
            src={assets.history_icon}
            alt="History"
            className="w-5 h-5 shrink-0"
          />

          {extended && (
            <span className="text-sm text-gray-700">
              History
            </span>
          )}

        </button>


        {/* SETTINGS */}

        <button
          type="button"
          className={`
            flex
            items-center
            gap-3
            rounded-lg
            hover:bg-[#e2e6eb]
            transition

            ${
              extended
                ? "w-[calc(100%-16px)] mx-2 px-3 py-3"
                : "w-14 h-12 mx-auto justify-center"
            }
          `}
        >

          <img
            src={assets.setting_icon}
            alt="Settings"
            className="w-5 h-5 shrink-0"
          />

          {extended && (
            <span className="text-sm text-gray-700">
              Settings
            </span>
          )}

        </button>


        {/* HELP */}

        <button
          type="button"
          className={`
            flex
            items-center
            gap-3
            rounded-lg
            hover:bg-[#e2e6eb]
            transition

            ${
              extended
                ? "w-[calc(100%-16px)] mx-2 px-3 py-3"
                : "w-14 h-12 mx-auto justify-center"
            }
          `}
        >

          <img
            src={assets.question_icon}
            alt="Help"
            className="w-5 h-5 shrink-0"
          />

          {extended && (
            <span className="text-sm text-gray-700">
              Help
            </span>
          )}

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;