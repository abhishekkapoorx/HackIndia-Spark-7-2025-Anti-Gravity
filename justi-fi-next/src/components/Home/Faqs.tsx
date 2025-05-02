"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import Shiny from "../../../public/shiny.svg";
export default function FAQs() {
  // Group the FAQs by category
  const faqCategories = [
    {
      id: "getting-started",
      name: "Getting Started",
      color: "bg-cyan-500",
      questions: [
        {
          id: "signup",
          question: "How do I sign up for TaxSavvy?",
          answer:
            'Just click "Get Started," enter your email or phone number, and follow the onboarding prompts.',
        },
        {
          id: "finance-knowledge",
          question: "Do I need prior finance knowledge?",
          answer:
            "Not at all! Our platform is built for both beginners and seasoned professionals.",
        },
        {
          id: "switch-user",
          question:
            "Can I switch my user type later (freelancer/salaried/business)?",
          answer:
            "Yes, you can update your profile and service needs anytime via your dashboard.",
        },
        {
          id: "data-safe",
          question: "Is my data safe with TaxSavvy?",
          answer:
            "Absolutely. We use encrypted systems and adhere to India's data protection norms.",
        },
        {
          id: "install",
          question: "Do I need to install anything?",
          answer:
            "No downloads needed. Everything works via your browser or mobile-friendly dashboard.",
        },
        {
          id: "real-expert",
          question: "Can I connect with a real expert?",
          answer: "Yes, all users get access to a dedicated financial advisor.",
        },
        {
          id: "consultation",
          question: "Can I book a free consultation?",
          answer:
            "Yes. We offer one free 15-minute consult to help assess your needs.",
        },
        {
          id: "locations",
          question: "What locations do you serve?",
          answer: "We're 100% digital and serve clients across India.",
        },
        {
          id: "services",
          question: "What services do you offer?",
          answer:
            "Tax filing, GST, business setup, bookkeeping, payroll, investment planning & more.",
        },
        {
          id: "after-signup",
          question: "What happens after I sign up?",
          answer:
            "You'll get an onboarding call + dashboard access to track your financial journey.",
        },
      ],
    },
    {
      id: "plans-pricing",
      name: "Plans & Pricing",
      color: "bg-green-500",
      questions: [
        {
          id: "free-plan",
          question: "Do you offer a free plan?",
          answer:
            "We offer a free consultation. After that, pricing is based on the services you choose.",
        },
        {
          id: "hidden-charges",
          question: "Are there hidden charges?",
          answer: "No hidden charges—our pricing is transparent and upfront.",
        },
        {
          id: "pricing-difference",
          question: "Is pricing different for freelancers vs SMBs?",
          answer: "Yes. We customize pricing based on volume and service type.",
        },
        {
          id: "monthly-payment",
          question: "Can I pay monthly?",
          answer: "Yes, monthly and annual billing options are available.",
        },
        {
          id: "refunds",
          question: "Do you offer refunds?",
          answer:
            "Yes, under specific conditions—outlined in our refund policy.",
        },
        {
          id: "secure-payments",
          question: "Are payments secure?",
          answer: "We use encrypted payment gateways with full compliance.",
        },
        {
          id: "upgrade-plan",
          question: "Can I upgrade my plan anytime?",
          answer:
            "Absolutely. Plans are flexible and scale as your needs grow.",
        },
        {
          id: "document-charges",
          question: "Do you charge for document uploads or storage?",
          answer: "No extra charges for uploads or secure document storage.",
        },
        {
          id: "base-plan",
          question: "What's included in the base plan?",
          answer:
            "Basic ITR filing, compliance advisory, and access to your dashboard.",
        },
        {
          id: "bundled-services",
          question: "Do you offer bundled services?",
          answer:
            "Yes, we offer discounted bundles for salaried pros, freelancers, and SMBs.",
        },
      ],
    },
    {
      id: "freelancer-business",
      name: "Freelancer & Business Services",
      color: "bg-orange-500",
      questions: [
        {
          id: "register-business",
          question: "Can you help me register my business?",
          answer: "Yes, we help with GST, LLP, Pvt Ltd, and more.",
        },
        {
          id: "firc",
          question: "Do you handle FIRC and foreign payments?",
          answer:
            "Yes. We handle FIRC, TDS on foreign income, and RBI compliance.",
        },
        {
          id: "gst-freelancer",
          question: "Do I need GST as a freelancer?",
          answer: "We'll guide you based on your turnover and client type.",
        },
        {
          id: "invoicing",
          question: "Can you manage my invoicing?",
          answer: "Yes. We offer invoicing tools and compliance advisory.",
        },
        {
          id: "freelancer-expenses",
          question: "Can I deduct expenses as a freelancer?",
          answer: "Yes, and we help you optimize them for maximum tax benefit.",
        },
        {
          id: "payroll",
          question: "Do you handle payroll for my startup?",
          answer: "Yes, we offer complete payroll + EPF/ESI setup and filings.",
        },
        {
          id: "bookkeeping",
          question: "Do you offer bookkeeping services?",
          answer: "Absolutely—monthly or quarterly based on your package.",
        },
        {
          id: "virtual-cfo",
          question: "Can you act as my Virtual CFO?",
          answer:
            "Yes! Our Virtual CFO plans provide full strategic financial guidance.",
        },
        {
          id: "roc-filings",
          question: "Do you handle ROC filings for companies?",
          answer:
            "Yes, we manage ROC filings, board resolutions, and annual returns.",
        },
        {
          id: "tax-saving-consult",
          question: "Can I consult on tax saving before financial year ends?",
          answer:
            "Yes, we offer year-round advisory and strategic planning sessions.",
        },
      ],
    },
    {
      id: "tax-filing",
      name: "Tax Filing & Documentation",
      color: "bg-blue-500",
      questions: [
        {
          id: "itr-documents",
          question: "What documents do I need to file ITR?",
          answer:
            "We'll guide you step-by-step, but you'll need PAN, income details, Form 16, etc.",
        },
        {
          id: "without-form16",
          question: "Can I file taxes without Form 16?",
          answer:
            "Yes, we can help reconstruct income records using bank and salary data.",
        },
        {
          id: "refund-status",
          question: "How do I track my refund status?",
          answer:
            "You can check directly via the Income Tax portal or through your dashboard.",
        },
        {
          id: "previous-years",
          question: "Can I file taxes for previous years?",
          answer:
            "Yes, for up to 2 previous assessment years with late fees as applicable.",
        },
        {
          id: "tax-notice",
          question: "What if I get a tax notice?",
          answer: "Our team will help you respond, resolve, or appeal notices.",
        },
        {
          id: "capital-gains",
          question: "Do you handle capital gains tax (stocks, crypto)?",
          answer:
            "Yes. We help you report and optimize capital gains for compliance.",
        },
        {
          id: "joint-filing",
          question: "Can I file jointly with my spouse?",
          answer: "Yes, we'll guide you on the most beneficial way to file.",
        },
        {
          id: "nri-filing",
          question: "Do you support NRI tax filing?",
          answer:
            "Yes. We assist with NRI status, DTAA claims, and foreign income.",
        },
        {
          id: "tds-returns",
          question: "Can you help with TDS returns?",
          answer: "Yes, including form preparation and quarterly filing.",
        },
        {
          id: "return-copy",
          question: "Will I get a copy of my return?",
          answer:
            "Yes, you can download your filed return and acknowledgment anytime.",
        },
      ],
    },
    {
      id: "support",
      name: "Account & Technical Support",
      color: "bg-red-500",
      questions: [
        {
          id: "forgot-password",
          question: "I forgot my password. What should I do?",
          answer:
            'Click "Forgot Password" on login or contact support for quick reset.',
        },
        {
          id: "wrong-document",
          question: "I uploaded the wrong document. Can I replace it?",
          answer:
            "Yes, you can re-upload or contact us for manual replacement.",
        },
        {
          id: "otp-issues",
          question: "I'm not receiving OTPs or email alerts.",
          answer:
            "Please check spam/promotions or update your mobile/email in profile.",
        },
        {
          id: "contact-advisor",
          question: "How do I contact my advisor?",
          answer: 'Use the "My Advisor" tab or email support@taxsavvy.in',
        },
        {
          id: "pause-plan",
          question: "Can I pause my plan?",
          answer: "In certain cases, yes. Contact support for custom requests.",
        },
        {
          id: "call-support",
          question: "I need a call instead of chat. Is that possible?",
          answer: "Yes, we offer scheduled call support.",
        },
        {
          id: "delete-account",
          question: "How do I delete my account?",
          answer:
            "Contact support and your request will be processed within 7 days.",
        },
        {
          id: "mobile-app",
          question: "Is there a mobile app?",
          answer:
            "Coming soon! Currently, we offer a responsive web app experience.",
        },
        {
          id: "update-pan",
          question: "Can I update my PAN or details?",
          answer: "Yes, visit your profile section to make changes.",
        },
        {
          id: "download-invoices",
          question: "How do I download my invoices?",
          answer:
            'Invoices are stored under "Billing & History" in your dashboard.',
        },
      ],
    },
  ];

  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (id) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="w-[70%] mt-12 flex flex-col md:flex-row mx-auto p-1">
      <div className="w-full md:w-[40%]">
        {/* Header */}
        <div className="flex gap-3 w-fit items-center mb-6">
          <Image
            src={Shiny}
            alt="random"
            className="w-full h-full object-contain"
          />
          <h2 className="text-lg font-medium">FAQs</h2>
        </div>

        <h1 className="text-4xl font-bold text-navy-900 mb-8">
          Frequently <br /> Asked Questions
        </h1>

        {/* Category Navigation */}
        <div className="flex flex-wrap w-[60%] gap-3 mb-8">
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? `text-white bg-[#09B5EA]`
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      {/* FAQ Questions */}
      <div className="w-full md:w-[60%] rounded-lg p-2">
        {faqCategories
          .find((category) => category.id === activeCategory)
          ?.questions.map((item) => (
            <div
              key={item.id}
              className={`"mb-3 last:mb-0 rounded-[22px] " ${
                openQuestions[item.id] ? "bg-[#E2F5FD]" : ""
              } `}
            >
              <motion.div
                initial={false}
                onClick={() => toggleQuestion(item.id)}
                className={`flex justify-between items-center p-4 rounded-lg cursor-pointer ${
                  openQuestions[item.id] ? "bg-[#E2F5FD]" : ""
                }`}
              >
                <h3 className="font-medium text-navy-800">{item.question}</h3>
                {openQuestions[item.id] ? (
                  <ChevronDown
                    size={20}
                    className="text-gray-500 flex-shrink-0"
                  />
                ) : (
                  <ChevronUp
                    size={20}
                    className="text-gray-500 flex-shrink-0"
                  />
                )}
              </motion.div>

              <AnimatePresence>
                {openQuestions[item.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-3 text-gray-600 text-sm rounded-b-lg">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
      </div>
    </div>
  );
}
