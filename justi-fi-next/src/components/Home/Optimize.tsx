import React from "react";
import Image from "next/image";
import bolt from "../../../public/bolt.svg";
import Link from "next/link";

function Optimize() {
  return (
    <div className="max-w-full my-12 sm:max-w-[90%] md:max-w-[80%] rounded-[20px] sm:rounded-[30px] md:rounded-[43px] mx-4 sm:mx-auto flex p-4 md:p-6 lg:p-8 items-center bg-gradient-to-r from-[#09B5EA]/10 via-[#09B5EA]/50 to-[#09B5EA]/10 flex-col gap-4 sm:gap-6 md:gap-8">
      <Image
        src={bolt}
        alt="lightning bolt"
        className="w-[50px] h-[45px] sm:w-[60px] sm:h-[55px] md:w-[75px] md:h-[70px] object-cover"
      />
      <h1 className="text-wrap text-xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight sm:leading-[130%] md:leading-[144%] font-[400] text-center">
        Optimize your case strategy{" "}
        <span className="block">effortlessly with JustiFi.</span>
      </h1>
      <Link
        href="/dashboard"
        className="bg-radial mx-auto flex justify-center items-center border-[0.5px] w-full sm:w-[200px] md:w-[230px] rounded-[7px] border-[#020E22] h-[50px] md:h-[59px] px-4 text-white from-[#737373] to-[#041226]"
      >
        Start Building Now
      </Link>
    </div>
  );
}

export default Optimize;
