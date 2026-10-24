// Route enter transition (used from each interface's template.tsx, which
// remounts on navigation): a short rise + un-blur.
"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Animates its children in whenever the route changes. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
