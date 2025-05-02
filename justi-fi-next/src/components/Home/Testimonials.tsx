import React from "react";
import Image from "next/image";
import t1 from "../../../public/testimonial1.svg";
import t2 from "../../../public/testimonial2.svg";
import t3 from "../../../public/testimonial3.svg";
import t4 from "../../../public/testimonial4.svg";
import t5 from "../../../public/testimonial5.svg";
import t6 from "../../../public/testimonial6.svg";
import quote from "../../../public/quote.svg";
import people from "../../../public/people.svg";
function Testimonials() {
  const testimonials = [
    {
      testimonial:
        "Tax Savvy made my tax filing stress-free and super simple. Their team is prompt, helpful, thoroughly professional, and truly understands what freelancers need!",
      imageSrc: t1,
      name: "Priya Mehra",
      role: "Freelance Content Writer",
    },
    {
      testimonial:
        "Thanks to Tax Savvy, we now have complete clarity on our finances. Their expert support and guidance is exactly what our startup needed to securely grow.",
      imageSrc: t2,
      name: "Rohan Malhotra",
      role: "Co-Founder, Codenest Labs",
    },
    {
      testimonial:
        "As a salaried professional, I always overpaid on my taxes. Tax Savvy helped me strategically save more while staying 100% compliant with tax laws.",
      imageSrc: t3,
      name: "Neha Sharma",
      role: "Marketing Manager",
    },
    {
      testimonial:
        "Their bookkeeping and compliance services are top-notch. We finally have peace of mind when it comes to taxes, and their support is invaluable!",
      imageSrc: t4,
      name: "Arjun Sethi",
      role: "Director, Orion Enterprises",
    },
    {
      testimonial:
        "Tax Savvy is like having an in-house CFO. Their financial advice is always timely, actionable, tailored to our needs, and extremely beneficial.",
      imageSrc: t5,
      name: "Meera Iyer",
      role: "Founder, Bloom Agency",
    },
    {
      testimonial:
        "I never thought tax planning could be this easy. The team at Tax Savvy is efficient, friendly, always reliable, and exceptionally knowledgeable.",
      imageSrc: t6,
      name: "Akshay Rao",
      role: "UI/UX Designer",
    },
  ];

  return (
    <div className="my-12 p-8">
      <h1 className="text-[48px] flex flex-col text-[#012245] text-center font-[400] leading-[144%] mb-12">
        <div className="flex flex-col md:flex-row w-fit font-[600] mx-auto items-center">
          Hear Stories{" "}
          <Image
            src={people}
            alt="people"
            className="w-[150px] h-[50px] mt-1 object-contain"
          />{" "}
          Straight from <br />
        </div>
        <span className="text-[#06B5EE] font-[600]">
          <span className="text-black"> The </span>People We Helped{" "}
        </span>
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-8">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            testimonial={testimonial.testimonial}
            imageSrc={testimonial.imageSrc}
            name={testimonial.name}
            role={testimonial.role}
          />
        ))}
      </div>
    </div>
  );
}

export default Testimonials;

const TestimonialCard = ({ testimonial, imageSrc, name, role }) => {
  return (
    <div className="max-w-md flex justify-center items-center  p-4 rounded-lg">
      <div className="">
        {/* Quote Icon */}
        <div className="mb-4 w-full p-2 grid place-items-center rounded-[22px] bg-[#FBFEFF] ">
          <div className="flex gap-3">
            <Image
              src={quote}
              alt="quote"
              className="h-[17px] w-[20px] mt-3 object-contain"
            />

            {/* Testimonial Text */}
            <p className="text-gray-800 text-wrap font-medium mb-8 text-lg">
              {testimonial}
            </p>
          </div>
        </div>

        {/* Author Information */}
        <div className="flex flex-col pl-5 ">
          <div className="w-16 h-16 relative mr-4">
            <Image
              src={imageSrc}
              alt={name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-xl font-bold text-left text-gray-900">
              {name}
            </h4>
            <p className="text-gray-600 text-left uppercase text-sm tracking-wide">
              {role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
