// components/Logo.tsx
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ width = 140, height = 140 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="select-none flex items-center justify-center"
    >
      <div className="relative">
        <Image
          src="/logo.png"
          alt="NexMart Logo"
          width={width}
          height={height}
          className="
            drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]
            hover:scale-105
            transition-transform
            duration-300
            w-24 h-24
            sm:w-28 sm:h-28
            md:w-32 md:h-32
            lg:w-36 lg:h-36
            xl:w-40 xl:h-40
          "
          priority
        />
      </div>
    </motion.div>
  );
};

export default Logo;
