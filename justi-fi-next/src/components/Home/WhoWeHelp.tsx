import React from "react";
import help1 from "../../../public/help1.svg";
import help2 from "../../../public/help2.svg";
import help3 from "../../../public/help3.svg";
import help4 from "../../../public/help4.svg";
import Image, { StaticImageData } from "next/image";

function WhoWeHelp() {
  const content = [
    {
      img: help1,
      heading: "Solo Attorneys",
      description:
        "Automate your case research—capture facts, generate arguments with citations, and draft filings in minutes.",
    },
    {
      img: help2,
      heading: "Small Law Firms",
      description:
        "Collaborate seamlessly: share case memory across teams, track opposing arguments, and produce court-ready docs together.",
    },
    {
      img: help3,
      heading: "In-House Counsel",
      description:
        "Manage corporate matters efficiently—store precedents, build compliance cases conversationally, and streamline filings.",
    },
    {
      img: help4,
      heading: "Legal Aid Clinics",
      description:
        "Serve clients faster: gather client stories, structure pro bono cases, and produce evidence-backed briefs with ease.",
    },
  ];

  return (
    <div className="mb-20">
      <h1 className="text-[48px] mb-4 font-[600] text-center">
        Who <span className="text-[#09B5EA]">We Help?</span>
      </h1>
      <div className="w-[95%] md:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.map((data) => (
          <ContentCard
            key={data.heading}
            heading={data.heading}
            img={data.img}
            description={data.description}
          />
        ))}
      </div>
    </div>
  );
}

const ContentCard = ({
  heading,
  img,
  description,
}: {
  heading: string;
  img: StaticImageData;
  description: string;
}) => {
  return (
    <div className="bg-[#E2F5FD] pb-3 rounded-[24px]">
      <div className="w-[80%] mx-auto">
        <h2 className="text-[#253974] text-center md:text-left my-4 text-[36px] font-[600]">
          {heading}
        </h2>
        <div className="flex flex-col-reverse md:flex-row gap-3">
          <p className="w-[90%] block mx-auto md:mx-0 md:w-[60%] mt-4 text-center md:text-left text-[20px]">
            {description}
          </p>
          <Image
            src={img}
            alt={heading}
            className="w-[190px] h-[190px] mx-auto md:mx-0 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default WhoWeHelp;
