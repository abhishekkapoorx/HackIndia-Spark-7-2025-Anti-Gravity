// "use client"

// import React from "react"
// import { BlogCard } from "../ui/Blog-component"

// // import { Blog1, Blog2, Blog3, Blog_Line } from "../../public"
// import Blog1 from "../../../public/Blog1.svg"
// import Blog2 from "../../../public/Blog2.svg"
// import Blog3 from "../../../public/Blog3.svg"
// import { motion, useInView } from "framer-motion"

// export default function BlogSection() {
//   const ref = React.useRef(null)

//   const blogPosts = [
//     {
//       category: "TAX TIPS & TRENDS",
//       title: "Why Filing Your Taxes Late Is Costing You More Than You Think?",
//       excerpt: "Late fees aren't the only downside—delays can shrink your refund and stress you out. Here's how to stay ahead...",
//       imageUrl: Blog1,
//       href: "#",
//     },
//     {
//       category: "TAX FOR SALARIED PROFESSIONALS",
//       title: "Form 16, Deductions & Deadlines — Simplified!",
//       excerpt: "Tax season doesn't have to feel like a maze. Here's a breakdown every salaried employee should read...",
//       imageUrl: Blog2,
//       href: "#",
//     },
//     {
//       category: "SMART TAX MOVES",
//       title: "Maximize Your Deductions To Avoid This Year's Tax Trap",
//       excerpt: "Skipping these common deductions could mean more money out of your pocket. #TaxSavvyTips",
//       imageUrl: Blog3,
//       href: "#",
//     },
//   ];
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.3,
//       },
//     },
//   }

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.6,
//       },
//     },
//   }

//   return (
//     <section
//       className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
//     >
//     <div className="text-right w-full mb-8 sm:mb-12 relative">
//       <p className="text-4xl sm:text-4xl font-bold mb-3 sm:mb-4 flex justify-end items-end">
//         Latest <span className="text-[#09B5EA] inline">&nbsp;news & Blogs</span>
//       </p>
//       <p className="text-lg sm:text-xl text-gray-600 px-4 sm:px-0 text-right">
//       Quick reads, real tips, and zero jargon—your <br></br> shortcut to smarter money moves.
//       </p>
//     </div>

//       <motion.div
//         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
//         variants={containerVariants}
//       >
//         {blogPosts.map((post, index) => (
//           <motion.div
//             key={index}
//             className="w-full border-b-8 border-r-8 border-[#E9E9E9] rounded-xl"
//             variants={itemVariants}
//           >
//             <BlogCard {...post} />
            
//           </motion.div>
//         ))}
//       </motion.div>
//     </section>
//   )
// }

"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import Blog1 from "../../../public/Blog1.svg"
import Blog2 from "../../../public/Blog2.svg"
import Blog3 from "../../../public/Blog3.svg"
import Model1 from "../../../public/Model1.svg"
import Model2 from "../../../public/Model2.svg"
import Model3 from "../../../public/Model3.svg"
import Link from "next/link"

export default function BlogSection() {
  const blogPosts = [
    {
      date: "24.04.2025",
      title: "Top Tax-Saving Hacks for Salaried Professionals",
      excerpt:
        "Maximize your deductions with these smart, little-known strategies—save more without changing your lifestyle.",
      imageUrl: Blog1,
      href: "/blogs/blog1",
      readMore: "READ MORE →",
      author: {
        name: "By Tanya Mehra",
        role: "Tax Advisor",
        avatar: Model1,
      },
    },
    {
      date: "24.04.2025",
      title: "How to File ITR in Under 10 Minutes",
      excerpt:
        "No more late-night tax panic. Learn how to file quickly using smart tools and zero jargon-here's everything in plain English.",
      imageUrl: Blog2,
      href: "/blogs/blog2",
      readMore: "READ MORE →",
      author: {
        name: "By Rahul Bansal",
        role: "CA & Finance Blogger",
        avatar: Model2,
      },
    },
    {
      date: "24.04.2025",
      title: "Freelancer? Here's How You Can Save Big on Taxes",
      excerpt:
        "From TDS to deductions—this guide has all you need to know to stay compliant and stress-free. A quick-read checklist to help.",
      imageUrl: Blog3,
      href: "/blogs/blog3",
      readMore: "READ MORE →",
      author: {
        name: "By Rhea Kapoor",
        role: "Content Creator",
        avatar: Model3,
      },
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-right w-full mb-8 sm:mb-12 relative">
        <p className="text-4xl sm:text-4xl font-bold mb-3 sm:mb-4 flex justify-end items-end">
          Latest <span className="text-[#09B5EA] inline">&nbsp;news & Blogs</span>
        </p>
        <p className="text-lg sm:text-xl text-gray-600 px-4 sm:px-0 text-right">
          Quick reads, real tips, and zero jargon—your <br></br> shortcut to smarter money moves.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 lg:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {blogPosts.map((post, index) => (
          <motion.div
            key={index}
            className="bg-white max-w-[310px] mx-auto overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            variants={itemVariants}
          >
            <div className="relative  w-full">
              <Image src={post.imageUrl || "/placeholder.svg"} alt={post.title}  />
            </div>

            <div className="p-6 max-w-[310px]">
              <div className="text-gray-500 text-sm mb-2">{post.date}</div>
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-gray-600 mb-4 text-sm line-clamp-3">{post.excerpt}</p>

              <Link href={post.href} className="text-[#09B5EA] font-medium hover:underline">
                {post.readMore}
              </Link>

              <div className="flex items-center mt-6 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full overflow-hidden relative mr-3">
                  <Image
                    src={post.author.avatar || "/placeholder.svg"}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">{post.author.name}</p>
                  <p className="text-gray-500 text-xs">{post.author.role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
