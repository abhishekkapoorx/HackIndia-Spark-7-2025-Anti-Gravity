import React from "react";
import Image from "next/image";
import oneStop from "../../../public/oneStop.svg";

function OneStop() {
  const content = [
    "Conversational Case Building—capture key facts through guided dialogue.",
    "AI-Powered Argument Drafting—generate supporting & opposing arguments with citations.",
    "Document Generation—produce court-ready filings in minutes.",
    "Memory Retrieval—access past case details and precedents instantly.",
    "Meeting Scheduling—set up hearings and client consults with a simple prompt.",
    "Opposition Analysis—identify counterarguments and case weaknesses.",
    "Filing Support—prepare and manage court documents seamlessly.",
    "Ongoing Case Management—track deadlines, updates, and case progress.",
  ];

  return (
    <div className="px-4 md:px-6">
      <div className="max-w-7xl mx-auto my-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-[600] text-center leading-tight mb-12">
          Introducing Your One-Stop <br />
          <span className="text-[#09B5EA]">Litigation Management Suite</span>
        </h1>

        <h2 className="max-w-2xl mx-auto md:mx-0 text-center md:text-left font-[400] text-base sm:text-lg mb-8">
          We help legal professionals streamline case workflows, automate drafting, and maintain complete case memory{" "}
          <span className="block md:inline">
            with our all-in-one litigation management platform—available whenever you need it!
          </span>
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Feature list */}
          <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.map((text, idx) => (
              <div
                key={idx}
                className="flex p-3 border border-[#E4E4E4] rounded-[14px] max-w-[300px] mx-auto"
              >
                <h4 className="text-sm sm:text-base">{text}</h4>
              </div>
            ))}
          </div>

          {/* Illustration */}
          <div className="hidden md:flex md:w-2/5 lg:w-[40rem] justify-center md:ml-24">
            <Image
              src={oneStop}
              alt="Legal case management"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* On mobile show image below */}
          <div className="md:hidden w-full flex justify-center mt-6">
            <Image
              src={oneStop}
              alt="Legal case management"
              className="w-4/5 sm:w-3/5 h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OneStop;
