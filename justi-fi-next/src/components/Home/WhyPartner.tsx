import React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import Partner1 from "../../../public/Partner1.svg";
import Partner2 from "../../../public/Partner2.svg";
import Partner3 from "../../../public/Partner3.svg";

function WhyPartner() {
  const partners = [
    {
      img: Partner1,
      heading: "Expert Counsel",
      description:
        "Tap into AI-driven legal insights and structured arguments backed by concrete citations.",
      link: "/features#expert-counsel",
    },
    {
      img: Partner2,
      heading: "Case Automation",
      description:
        "Automate fact-gathering, opposing arguments, and draft court documents in minutes.",
      link: "/features#case-automation",
    },
    {
      img: Partner3,
      heading: "End-to-End Management",
      description:
        "Track deadlines, schedule hearings conversationally, and keep all case memory in one place.",
      link: "/features#case-management",
    },
  ];

  return (
    <div className="w-full my-12 p-8 bg-[#FBFEFF]">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <h1 className="leading-[130%] text-4xl md:text-6xl pt-4 text-center mx-auto font-[600] text-[#020E22]">
          <span className="text-[#09B5EA]">Why Partner</span> with JustiFi?
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <PartnerCard
              key={partner.heading}
              img={partner.img}
              heading={partner.heading}
              description={partner.description}
              link={partner.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const PartnerCard = ({
  img,
  heading,
  description,
  link,
}: {
  img: StaticImageData;
  heading: string;
  description: string;
  link: string;
}) => {
  return (
    <div className="border-[1px] h-[300px] w-full max-w-sm mx-auto p-7 rounded-[25px] border-[#E4E4E4] grid place-items-center">
      <div className="flex flex-col gap-4 items-center">
        <Image
          src={img}
          alt={heading}
          className="w-[54px] h-[54px] border-[1px] border-[#E4E4E4] rounded-full object-cover"
        />
        <h2 className="font-[700] text-[24px] text-center">{heading}</h2>
        <p className="text-[16px] text-center px-2">{description}</p>
      
      </div>
    </div>
  );
};

export default WhyPartner;
