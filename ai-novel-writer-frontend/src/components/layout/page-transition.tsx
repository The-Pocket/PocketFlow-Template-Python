'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Slide transition for modal-like pages
export function SlideTransition({ 
  children, 
  direction = 'right',
  className 
}: PageTransitionProps & { direction?: 'left' | 'right' | 'up' | 'down' }) {
  const pathname = usePathname()

  const slideVariants = {
    initial: {
      x: direction === 'right' ? '100%' : direction === 'left' ? '-100%' : 0,
      y: direction === 'down' ? '100%' : direction === 'up' ? '-100%' : 0,
      opacity: 0,
    },
    in: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    out: {
      x: direction === 'right' ? '-100%' : direction === 'left' ? '100%' : 0,
      y: direction === 'down' ? '-100%' : direction === 'up' ? '100%' : 0,
      opacity: 0,
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={slideVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Fade transition for subtle changes
export function FadeTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  const fadeVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={fadeVariants}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Scale transition for focus mode
export function ScaleTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  const scaleVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.95,
    },
    in: { 
      opacity: 1, 
      scale: 1,
    },
    out: { 
      opacity: 0, 
      scale: 1.05,
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={scaleVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}