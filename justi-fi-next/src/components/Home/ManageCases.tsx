import React from "react";
import Link from "next/link";
import Image from "next/image";
import step1 from "../../../public/manage1.svg";
import step2 from "../../../public/manage2.svg";
import step3 from "../../../public/manage3.svg";
import { StaticImageData } from "next/image";

function ManageCase() {
  const steps = [
    {
      img: step1,
      title: "Discuss",
      description:
        "Start a guided conversation to capture all the essential facts and issues of your case.",
    },
    {
      img: step2,
      title: "Construct",
      description:
        "Generate structured arguments—supporting and opposing factors—complete with solid citations.",
    },
    {
      img: step3,
      title: "File & Track",
      description:
        "Draft court-ready documents and manage upcoming hearings and deadlines seamlessly.",
    },
  ];

  return (
    <div className="min-h-[60svh] w-full">
      <div className="relative my-6 md:my-12 p-4 md:p-20 overflow-hidden">
        <div className="absolute -z-[50] w-[250px] md:w-[500px] bottom-0 h-[250px] md:h-[500px] rounded-full bg-[#0BB1ED80]/50 blur-[100px] md:blur-[150px]" />
        <div className="absolute -z-[50] w-[250px] md:w-[500px] h-[250px] md:h-[500px] right-0 rounded-full bg-[#0BB1ED80]/50 blur-[100px] md:blur-[150px]" />
        <div className="absolute -z-[50] w-[250px] md:w-[500px] h-[250px] md:h-[500px] right-1/3 rounded-full bg-[#0BB1ED80]/50 blur-[100px] md:blur-[150px]" />

        <div className="max-w-6xl mx-auto">
          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <h1 className="text-left mb-4 text-2xl md:text-3xl lg:text-[40px] font-[600]">
              Build Your Case in
              <br className="hidden sm:block" /> 3 Simple Steps
            </h1>
            <Link
              href="/dashboard"
              className="bg-radial flex justify-center items-center border-[0.5px] w-full sm:w-fit rounded-[7px] border-[#020E22] h-[50px] px-4 text-white from-[#737373] to-[#041226]"
            >
              Start Building Now
            </Link>
          </div>

          <div className="bg-white rounded-[17px] p-9 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {steps.map((step, idx) => (
              <StepCard
                key={idx}
                index={idx}
                img={step.img}
                title={step.title}
                description={step.description}
                isLast={idx === steps.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const StepCard = ({
  index,
  img,
  title,
  description,
  isLast,
}: {
  index: number;
  img: StaticImageData;
  title: string;
  description: string;
  isLast: boolean;
}) => (
  <div className="pb-6 pl-5 md:pb-0">
    <h2 className="text-4xl md:text-5xl lg:text-[64px] font-[700] text-[#F4F4F4] w-fit">
      0{index + 1}
    </h2>
    <div
      className={`${
        !isLast ? "border-b md:border-b-0 md:border-r" : ""
      } border-[#D9D9D9] pb-4 md:pb-0 md:pr-4`}
    >
      <Image src={img} alt={title} className="w-[48px] h-[48px] object-cover" />
      <h3 className="text-left text-xl md:text-2xl lg:text-[24px] font-[700] mt-4">
        {title}
      </h3>
      <p className="text-left text-sm md:text-base lg:text-[16px] w-full md:w-[90%] lg:w-[85%]">
        {description}
      </p>
    </div>
  </div>
);

export default ManageCase;
