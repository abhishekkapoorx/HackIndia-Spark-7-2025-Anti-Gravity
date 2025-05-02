import React from "react";
import Image from "next/image";
import Link from "next/link";
import heroImg from "../../../public/hero1.svg";
import pattern from "../../../public/pattern.svg";

function HomeHero() {
  return (
    <div className="min-h-screen w-full px-4 md:px-6">
      <div className="max-w-[84%] rounded-[19px] min-h-[500px] md:h-[80svh] p-4 mt-8 md:mt-12 my-auto overflow-hidden mx-auto relative">
        <div className="absolute -z-[30] bottom-0 left-0 w-[200px] md:w-[390px] h-[200px] md:h-[370px] blur-[100px] md:blur-[150px] rounded-full bg-[#0BB1ED80]/80"></div>
        <div className="absolute -z-[30] top-0 right-0 w-[200px] md:w-[390px] h-[200px] md:h-[370px] blur-[100px] md:blur-[150px] rounded-full bg-[#0BB1ED80]/80"></div>
        <Image
          src={pattern}
          alt="pattern"
          className="h-[400px] w-[400px] -z-[20] absolute top-10 right-10"
        />
        <div className="my-auto h-fit py-8 md:py-0">
          <Image
            src={heroImg}
            alt="hero image"
            className="w-2/5 sm:w-1/3 md:w-1/5 h-auto mt-8 md:mt-20 object-cover mx-auto"
          />
          <h1 className="text-center mt-5 font-[700] text-2xl sm:text-3xl md:text-4xl lg:text-[54px] spacing-[148%] px-2">
            JustiFi: Agentic Lawsuit Manager
            <br className="mb-5" />
            <span className="block mt-5">
              Build, Manage & File Your Cases Effortlessly
            </span>
          </h1>
          <p className="text-center font-[500] text-wrap md:text-nowrap w-full md:w-[70%] mx-auto mt-9 px-2 text-sm sm:text-base">
            Automate case construction through guided conversations, generate
            court-ready documents, and track arguments with solid citations.
            <span className="block">
              JustiFi keeps all your case memory in one place for seamless updates.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row w-fit gap-4 mx-auto mt-8">
            <Link
              href="/dashboard"
              className="bg-linear-to-b md:mx-0 mx-auto flex justify-center items-center border-[0.5px] w-fit rounded-[7px] border-[#020E22] h-[50px] px-4 text-white from-[#737373] to-[#041226]"
            >
              Get Started
            </Link>
            {/* <Link
              href="/contact"
              className="flex justify-center items-center border-[0.5px] w-fit rounded-[7px] border-[#020E22] h-[50px] px-4"
            >
              Talk to an Expert
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeHero;
