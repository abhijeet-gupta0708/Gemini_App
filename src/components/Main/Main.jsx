import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import "./Main.css";

function Main() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  const resetChat = () => {
    setQuestion("");
    setSubmittedQuestion("");
    setAnswer("");
    setError("");
    setLoading(false);
  };

  window.addEventListener("new-chat", resetChat);

  return () => {
    window.removeEventListener("new-chat", resetChat);
  };
}, []);

  // =========================
  // ASK GEMINI
  // =========================

  const askQuestion = async (text = question) => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setSubmittedQuestion(text);

    try {
      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong"
        );
      }

      setAnswer(data.reply);

      // Clear input after successful request
      setQuestion("");

    } catch (error) {
      console.error("Frontend error:", error);

      setError(error.message);

    } finally {
      setLoading(false);
    }
  };


  // =========================
  // ENTER KEY
  // =========================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      askQuestion();
    }
  };


  // =========================
  // SUGGESTIONS
  // =========================

  const suggestions = [
    {
      text: "Suggest beautiful places to visit on a road trip",
      icon: assets.bulb_icon,
    },
    {
      text: "Explain how artificial intelligence works",
      icon: assets.code_icon,
    },
    {
      text: "Give me some project ideas",
      icon: assets.compass_icon,
    },
    {
      text: "Help me learn React",
      icon: assets.question_icon,
    },
  ];


  return (
    <main
      className="
        main
        flex-1
        min-h-screen
        relative
        pb-32
      "
    >

      {/* =========================
          NAVBAR
      ========================= */}

      <nav
        className="
          flex
          items-center
          justify-between
          px-4
          sm:px-6
          lg:px-10
          py-4
        "
      >

        <p
          className="
            text-xl
            sm:text-2xl
            font-medium
            text-[#585858]
          "
        >
          Gemini
        </p>

        <img
          src={assets.user_icon}
          alt="User"
          className="
            w-9
            h-9
            sm:w-10
            sm:h-10
            rounded-full
          "
        />

      </nav>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <section
        className="
          w-full
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-10
          flex
          flex-col
          justify-center
          min-h-[75vh]
        "
      >
        {/* ========================= 
                GREETING
        ========================= */}
        {!answer && !loading && !error &&( 
          <div className=" mt-16 sm:mt-20 lg:mt-24 mb-8 " >
            <h1 className=" text-3xl sm:text-4xl lg:text-5xl font-semibold " > 
              <span className=" text-transparent bg-clip-text bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] " > 
                Hello, Dev. </span> 
                </h1>
                <h2 className="mt-3 ml-2 p-4 text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#c4c7c5] " > 
                  How can I help you today? 
                  </h2> 
                  </div> )}
        {/* =========================
            SUGGESTION CARDS
        ========================= */}

        {!answer &&
          !loading &&
          !error && (

            <div
              className="
                w-full
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-5
                mt-4
              "
            >

              {suggestions.map(
                (item, index) => (

                  <button
                    key={index}
                    onClick={() =>
                      askQuestion(item.text)
                    }

                    className="
                      min-h-[150px]
                      p-5
                      rounded-2xl
                      bg-[#f0f4f9]
                      flex
                      flex-col
                      justify-between
                      text-left
                      transition-all
                      duration-200
                      hover:bg-[#e2e7ee]
                      hover:-translate-y-1
                      hover:shadow-md
                    "
                  >

                    <p
                      className="
                        text-sm
                        sm:text-base
                        text-[#1f1f1f]
                      "
                    >
                      {item.text}
                    </p>


                    <img
                      src={item.icon}
                      alt=""
                      className="
                        w-8
                        h-8
                        self-end
                      "
                    />

                  </button>

                )
              )}

            </div>

          )}


        {/* =========================
            LOADING
        ========================= */}

        {loading && (

          <div
            className="
              max-w-4xl
              w-full
              mx-auto
              mt-12
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                mb-6
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-gradient-to-r
                  from-blue-500
                  via-purple-500
                  to-pink-500
                  animate-pulse
                "
              />

              <p className="text-[#585858]">
                Gemini is thinking...
              </p>

            </div>


            <div className="space-y-3">

              <div
                className="
                  h-4
                  bg-[#e8eaed]
                  rounded-full
                  animate-pulse
                  w-full
                "
              />

              <div
                className="
                  h-4
                  bg-[#e8eaed]
                  rounded-full
                  animate-pulse
                  w-[85%]
                "
              />

              <div
                className="
                  h-4
                  bg-[#e8eaed]
                  rounded-full
                  animate-pulse
                  w-[65%]
                "
              />

            </div>

          </div>

        )}


        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div
            className="
              max-w-4xl
              w-full
              mx-auto
              mt-10
              p-5
              rounded-2xl
              bg-red-50
              border
              border-red-200
            "
          >

            <p
              className="
                font-semibold
                text-red-600
              "
            >
              Error
            </p>

            <p
              className="
                mt-2
                text-red-500
                break-words
              "
            >
              {error}
            </p>

          </div>

        )}


        {/* =========================
            RESPONSE
        ========================= */}

        {answer && !loading && (

          <div
            className="
              max-w-4xl
              w-full
              mx-auto
              mt-8
            "
          >

            {/* USER QUESTION */}

            <div
              className="
                flex
                justify-end
                mb-8
              "
            >

              <div
                className="
                  max-w-[85%]
                  sm:max-w-[70%]
                  bg-[#f0f4f9]
                  px-5
                  py-3
                  rounded-2xl
                  rounded-br-sm
                "
              >

                <p
                  className="
                    text-[#1f1f1f]
                    whitespace-pre-wrap
                  "
                >
                  {submittedQuestion}
                </p>

              </div>

            </div>


            {/* GEMINI RESPONSE */}

            <div
              className="
                flex
                gap-3
                sm:gap-4
              "
            >

              <div className="shrink-0">

                <div
                  className="
                    w-9
                    h-9
                    rounded-full
                    bg-gradient-to-r
                    from-blue-500
                    via-purple-500
                    to-pink-500
                  "
                />

              </div>


              <div
                className="
                  flex-1
                  min-w-0
                "
              >

                <p
                  className="
                    font-semibold
                    text-[#333]
                    mb-3
                  "
                >
                  Gemini
                </p>


                <p
                  className="
                    text-[#444]
                    leading-7
                    whitespace-pre-wrap
                    break-words
                  "
                >
                  {answer}
                </p>

              </div>

            </div>

          </div>

        )}

      </section>


      {/* =========================
          SEARCH BOX
      ========================= */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          w-full
          bg-white/90
          backdrop-blur-md
          border-t
          border-gray-100
          p-3
          sm:p-4
        "
      >

        <div
          className="
            w-full
            mx-auto
          "
        >

          <div
            className="
              flex
              items-center
              w-full
              gap-2
              bg-[#f0f4f9]
              rounded-full
              px-4
              py-2
              sm:px-5
              sm:py-3
            "
          >

            {/* INPUT */}

            <input
              type="text"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask Gemini..."
              disabled={loading}
              className="
                flex-1
                min-w-0
                bg-transparent
                outline-none
                text-sm
                sm:text-base
                text-[#333]
                placeholder:text-[#777]
              "
            />


            {/* GALLERY */}

            <button
              type="button"
              className="
                hidden
                sm:flex
                shrink-0
                items-center
                justify-center
              "
            >

              <img
                src={assets.gallery_icon}
                alt="Gallery"
                className="w-6 h-6"
              />

            </button>


            {/* MICROPHONE */}

            <button
              type="button"
              className="
                hidden
                sm:flex
                shrink-0
                items-center
                justify-center
              "
            >

              <img
                src={assets.mic_icon}
                alt="Microphone"
                className="w-6 h-6"
              />

            </button>


            {/* SEND */}

            <button
              type="button"
              onClick={() => askQuestion()}
              disabled={
                !question.trim() ||
                loading
              }
              className="
                w-9
                h-9
                sm:w-10
                sm:h-10
                shrink-0
                flex
                items-center
                justify-center
                rounded-full
                hover:bg-gray-200
                disabled:opacity-40
                disabled:cursor-not-allowed
                transition
              "
            >

              <img
                src={assets.send_icon}
                alt="Send"
                className="
                  w-5
                  h-5
                  sm:w-6
                  sm:h-6
                "
              />

            </button>

          </div>


          {/* DISCLAIMER */}

          <p
            className="
              text-center
              text-[10px]
              sm:text-xs
              text-gray-400
              mt-2
            "
          >
            Gemini can make mistakes. Check important information.
          </p>

        </div>

      </div>

    </main>
  );
}

export default Main;