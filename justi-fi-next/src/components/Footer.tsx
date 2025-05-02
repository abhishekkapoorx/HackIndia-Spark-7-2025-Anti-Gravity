import React from "react";
import Link from "next/link";
import JustiFiLogo from "./JustiFiLogo";


const Footer = () => (
  <footer className="bg-white py-6 px-4">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0">
      {/* Logo */}
      <div className="flex items-center space-x-2">
       
        <span className="font-semibold text-lg">
            <JustiFiLogo />
        </span>
      </div>

      {/* Simple nav */}
      <nav className="flex space-x-6">
        <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
          Home
        </Link>
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">
          Dashboard
        </Link>
        <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm">
          About
        </Link>
        <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">
          Contact
        </Link>
      </nav>

      {/* Copyright */}
      <p className="text-gray-500 text-sm">
        © 2025 JustiFi. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
