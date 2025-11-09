"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <motion.div
        className="relative w-14 h-14"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <motion.span
          className="absolute inset-0 rounded-full border-4 border-gray-200"
          initial={{ opacity: 0.4 }}
        ></motion.span>
        <motion.span
          className="absolute inset-0 rounded-full border-4 border-t-black"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        ></motion.span>
      </motion.div>
    </div>
  );
}
