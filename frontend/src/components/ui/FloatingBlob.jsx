import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const FloatingBlob = ({ color, className, delay = 0 }) => {
  return (
    <motion.div
      className={twMerge("absolute rounded-full blur-3xl mix-blend-multiply filter", className)}
      style={{ backgroundColor: color }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    />
  );
};

export default FloatingBlob;
