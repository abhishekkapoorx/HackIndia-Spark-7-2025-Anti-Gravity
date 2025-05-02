import React from "react";
import Image from "next/image";
import chat from "../../../public/chat.png";

function Tools() {
  return (
    <div className="w-[70%] mx-auto flex gap-24 mb-12">
      <div>
        <h1 className="text-[48px] font-[700] spacing-[146%]">
          We have dedicated tools & <br />
          support built for{" "}
          <span className="text-[#09B5EA]">
            legal <br /> professionals
          </span>
        </h1>
        <p className="text-left font-[600] text-[16px] pt-4 pb-8 spacing-[156%]">
          Managing case prep after hours? We get it. <br />
          Our AI manager converses with you, gathers key facts, tracks citations,{" "}
          <br />
          and drafts court-ready documents in minutes.
        </p>
      </div>
      {/* <div className="w-1/3 h-full">
        <Image
          src={chat}
          alt="Agent chat"
          className="w-full h-full mx-auto"
        />
      </div> */}
    </div>
  );
}

export default Tools;
