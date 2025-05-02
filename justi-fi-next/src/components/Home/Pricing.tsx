"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import rp from "../../../public/ruppee.svg";
import tick from "../../../public/tick.svg";
function Pricing() {
  const [seeIndividual, setSeeIndividual] = useState(true);
  return (
    <div className="my-12">
      <h1 className="text-black text-[48px] font-[600] text-center">Pricing</h1>
      <div className="w-fit p-[1px] mx-auto border-[1px] border-[#767676] rounded-full  flex gap-2">
        <div
          className={`${
            seeIndividual ? "bg-black shadow-lg text-white" : ""
          } px-4 py-2  cursor-pointer rounded-full "`}
          onClick={() => setSeeIndividual(true)}
        >
          Individuals
        </div>
        <div
          className={`${
            seeIndividual ? "" : "bg-black text-white shadow-lg"
          } px-4 py-2  cursor-pointer rounded-full "`}
          onClick={() => setSeeIndividual(false)}
        >
          Startups
        </div>
      </div>
      {seeIndividual ? <IndividualCard /> : <StartupCard />}
    </div>
  );
}

const IndividualCard = () => {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
      {/* 1999 */}
      <div className="border-[#E4E4E4] w-full border-1 rounded-[20px] flex p-2 flex-col gap-2">
        <div className="bg-[#FBFEFF] p-2 sm:p-4 rounded-t-[20px]">
          <h1 className="text-left font-[600] text-lg sm:text-[20px] text-wrap sm:text-nowrap">
            With Income Upto ₹10 Lacs
          </h1>
          <h2 className="flex gap-1 sm:gap-2 items-center">
            <Image
              src={rp}
              alt="ruppee"
              className="w-[14px] h-[22px] sm:w-[17px] sm:h-[28px] my-auto object-contain"
            />
            <span className="text-4xl sm:text-[60px] font-[700] mb-2 sm:mb-4">
              1999
            </span>
            <span className="my-auto text-xs sm:text-[16px]"> /per year</span>
          </h2>
          <h1 className="text-left text-sm sm:text-[16px] text-[#636564]">
            Advanced tools for growing teams
          </h1>
          <Link
            href="/checkout?amount=1999&service=individual"
            className="bg-radial mt-6 sm:mt-9 mb-4 sm:mb-8 flex justify-center items-center border-[0.5px] w-full rounded-[7px] border-[#020E22] h-[40px] sm:h-[50px] px-4 text-white from-[#737373] to-[#041226]"
          >
            Get Started
          </Link>
        </div>
        <div>
          <h1 className="font-[700] pl-3 text-sm sm:text-[16px] spacing-[175%]">
            What&apos;s Included
          </h1>
          <div className="flex flex-col gap-2 sm:gap-4 pl-4 mt-2">
            {[
              "Income Tax Filing.",
              "Detailed Tax Planning & Regime Selection.",
              "Investment Declaration Issues.",
              "Assistance With PF Transfer And Job Switch Calculation.",
              "Phone + Email Support",
              "Income Tax Filing For One Financial Year.",
              "Old Vs. New Tax Regime Consultation.",
            ].map((item, index) => {
              return (
                <div key={index} className="flex gap-2">
                  <Image
                    src={tick}
                    alt="tick"
                    className="w-4 h-4 sm:w-[20px] sm:h-[20px] my-auto object-contain"
                  />
                  <p className="text-xs sm:text-[16px] text-[#636564]">
                    {item}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4999  */}
      <div className="border-[#E4E4E4] w-full border-1 rounded-[20px] flex p-2 flex-col gap-2">
        <div className="bg-[#FBFEFF] p-2 sm:p-4 rounded-t-[20px]">
          <h1 className="text-left font-[600] text-lg sm:text-[20px] text-wrap sm:text-nowrap">
            With Income Upto ₹20 Lacs
          </h1>
          <h2 className="flex gap-1 sm:gap-2 items-center">
            <Image
              src={rp}
              alt="ruppee"
              className="w-[14px] h-[22px] sm:w-[17px] sm:h-[28px] my-auto object-contain"
            />
            <span className="text-4xl sm:text-[60px] font-[700] mb-2 sm:mb-4">
              4999
            </span>
            <span className="my-auto text-xs sm:text-[16px]"> /per year</span>
          </h2>
          <div className="bg-black p-1 px-3 sm:px-4 text-xs sm:text-sm text-white w-fit rounded-full">
            Popular
          </div>
          <Link
            href="/checkout?amount=4999&service=individual"
            className="bg-radial mt-4 sm:mt-6 mb-4 sm:mb-8 flex justify-center items-center border-[0.5px] w-full rounded-[7px] border-[#020E22] h-[40px] sm:h-[50px] px-4 text-white from-[#737373] to-[#041226]"
          >
            Get Started
          </Link>
        </div>
        <div>
          <h1 className="font-[700] pl-3 text-sm sm:text-[16px] spacing-[175%]">
            What&apos;s Included
          </h1>
          <div className="flex flex-col pl-4 pb-4 sm:pb-7 gap-2 sm:gap-4 mt-2">
            {[
              "Comprehensive Tax Filing And Planning.",
              "Guidance On House Loan, Education Loan, Or EV Benefits.",
              "Investment Declaration Support.",
              "Job Switch Problems (PF Transfer, Gratuity, And Notice Pay Recovery).",
              "Capital Gains Calculation And Consultation.",
              "Quarterly Tax Advisory For Future Planning.",
              "Priority Support (Phone/WhatsApp).",
              "Capital Gains Calculation And Consultation.",
            ].map((item, index) => {
              return (
                <div key={index} className="flex gap-2">
                  <Image
                    src={tick}
                    alt="tick"
                    className="w-4 h-4 sm:w-[20px] sm:h-[20px] my-auto object-contain"
                  />
                  <p className="text-xs sm:text-[16px] text-[#636564]">
                    {item}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* on request  */}
      <div className="border-[#E4E4E4] w-full border-1 rounded-[20px] flex p-2 flex-col gap-2">
        <div className="bg-[#FBFEFF] p-2 sm:p-4 rounded-t-[20px]">
          <h1 className="text-left font-[600] text-lg sm:text-[20px] text-wrap sm:text-nowrap">
            With Income Upto ₹20 Lacs
          </h1>
          <h2 className="flex gap-1 sm:gap-2 items-center">
            <Image
              src={rp}
              alt="ruppee"
              className="w-[14px] h-[22px] sm:w-[17px] sm:h-[28px] my-auto object-contain"
            />
            <span className="text-3xl sm:text-[60px] font-[700] mb-2 sm:mb-4">
              On Request
            </span>
          </h2>
          <h1 className="text-left text-sm sm:text-[16px] text-[#636564]">
            Advanced tools for growing teams
          </h1>
          <Link
          href={`/checkout?service=income-upto-20-lacs`}
            className="bg-radial mt-4 sm:mt-8 mb-4 sm:mb-8 flex justify-center items-center border-[0.5px] w-full rounded-[7px] border-[#020E22] h-[40px] sm:h-[50px] px-4 text-white from-[#737373] to-[#041226]"
          >
            Get Started
          </Link>
        </div>
        <div>
          <h1 className="font-[700] pl-3 text-sm sm:text-[16px] spacing-[175%]">
            What&apos;s Included
          </h1>
          <div className="flex h-full flex-col pl-4 gap-2 sm:gap-4 mt-2">
            {[
              "Comprehensive Tax Filing And Planning.",
              "Investment Declaration Support.",
              "Priority Support (Phone/WhatsApp).",
              "Advanced Tax-Saving Strategies.",
              "Dedicated Account Manager.",
              "Guidance On House Loan, Education Loan, Or EV Benefits.",
              "Job Switch Problems (PF Transfer, Gratuity, And Notice Pay Recovery).",
              "Capital Gains Calculation And Consultation.",
              "Quarterly Tax Advisory For Future Planning.",
              "Filing For Multiple Income Sources (Freelancing, Investments, Etc).",
              "Forex Income And Double Taxation Relief.",
            ].map((item, index) => {
              return (
                <div key={index} className="flex gap-2">
                  <Image
                    src={tick}
                    alt="tick"
                    className="w-4 h-4 sm:w-[20px] sm:h-[20px] my-auto object-contain"
                  />
                  <p className="text-xs sm:text-[16px] text-[#636564]">
                    {item}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
const StartupCard = () => {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {/* 1499  */}
      <div className="border-[#E4E4E4] w-full border-1 rounded-[20px] flex p-2  flex-col gap-2">
        <div className="bg-[#FBFEFF] p-2 rounded-t-[20px] ">
          <h1 className="text-left font-[600] text-[20px] text-nowrap">
            Freelancers
          </h1>
          <h2 className="flex gap-2">
            <Image
              src={rp}
              alt="ruppee"
              className="w-[17px] h-[28px] my-auto object-contain"
            />
            <span className="text-[60px] font-[700] mb-4">1999</span>
            <span className="my-auto text-[16px]"> /per month</span>
          </h2>
          <h1 className="text-left text-[16px] text-[#636564]">
            Essentials features for individuals
          </h1>
          <Link
            href="/checkout?amount=1999&service=freelancers"
            className="bg-radial mt-4 mb-8 flex justify-center items-center border-[0.5px] w-full rounded-[7px] border-[#020E22] h-[50px] px-4 text-white from-[#737373] to-[#041226]"
          >
            Get Started
          </Link>
        </div>
        <div>
          <h1 className="font-[700] pl-3 text-[16px] spacing-[175%]">
            What&apos;s Included
          </h1>
          <div className="flex flex-col pl-4 gap-4 mt-2">
            {["GST Filing", "Income Tax Filing", "Personalized Support"].map(
              (item, index) => {
                return (
                  <div key={index} className="flex gap-2 ">
                    <Image
                      src={tick}
                      alt="tick"
                      className="w-[20px] h-[20px] my-auto object-contain"
                    />
                    <p className="text-[16px] text-[#636564]">{item}</p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
      {/* 3999 */}
      <div className="border-[#E4E4E4] w-full border-1 rounded-[20px] flex p-2  flex-col gap-2">
        <div className="bg-[#FBFEFF] p-2 rounded-t-[20px] ">
          <h1 className="text-left font-[600] text-[20px] text-nowrap">
            Small Businesses
          </h1>
          <h2 className="flex gap-2">
            <Image
              src={rp}
              alt="ruppee"
              className="w-[17px] h-[28px] my-auto object-contain"
            />
            <span className="text-[60px] font-[700] mb-4">3999</span>
            <span className="my-auto text-[16px]"> /per month</span>
          </h2>
          <h1 className="text-left text-[16px] text-[#636564]">
            Advanced tools for growing teams
          </h1>
          <Link
            href="/checkout?amount=3999&service=smallbusiness"
            className="bg-radial mt-4 mb-8 flex justify-center items-center border-[0.5px] w-full rounded-[7px] border-[#020E22] h-[50px] px-4 text-white from-[#737373] to-[#041226]"
          >
            Get Started
          </Link>
        </div>
        <div>
          <h1 className="font-[700] pl-3 text-[16px] spacing-[175%]">
            What&apos;s Included
          </h1>
          <div className="flex flex-col pl-4 gap-4 mt-2">
            {[
              "GST+ITR Compliance",
              "BookKeeping & Advisory",
              "ROC Filings",
            ].map((item, index) => {
              return (
                <div key={index} className="flex gap-2 ">
                  <Image
                    src={tick}
                    alt="tick"
                    className="w-[20px] h-[20px] my-auto object-contain"
                  />
                  <p className="text-[16px] text-[#636564]">{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* on request  */}
      <div className="border-[#E4E4E4] w-full border-1 rounded-[20px] flex p-2  flex-col gap-2">
        <div className="bg-[#FBFEFF] p-2 rounded-t-[20px] ">
          <h1 className="text-left font-[600] text-[20px] text-nowrap">
            Starting & Growing Companies
          </h1>
          <h2 className="flex gap-2">
            <Image
              src={rp}
              alt="ruppee"
              className="w-[17px] h-[28px] my-auto object-contain"
            />
            <span className="text-[44px] text-nowrap font-[700] mb-4">
              On Request
            </span>
            {/* <span className="my-auto text-[16px]"> /per month</span> */}
          </h2>
          <h1 className="text-left text-[16px] text-[#636564]">
            Comprehensive company features
          </h1>
          <Link
            href={`/checkout?service=income-upto-20-lacs`}
            className="bg-radial mt-9 mb-8 flex justify-center items-center border-[0.5px] w-full rounded-[7px] border-[#020E22] h-[50px] px-4 text-white from-[#737373] to-[#041226]"
          >
            Get Started
          </Link>
        </div>
        <div>
          <h1 className="font-[700] pl-3 text-[16px] spacing-[175%]">
            What&apos;s Included
          </h1>
          <div className="flex h-full pl-4 flex-col gap-4 mt-2">
            {[
              "Virtual CFO Services",
              "Financial Strategy & Tax Optimization",
              "Investor-Ready Books",
            ].map((item, index) => {
              return (
                <div key={index} className="flex gap-2 ">
                  <Image
                    src={tick}
                    alt="tick"
                    className="w-[20px] h-[20px] my-auto object-contain"
                  />
                  <p className="text-[16px] text-[#636564]">{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
