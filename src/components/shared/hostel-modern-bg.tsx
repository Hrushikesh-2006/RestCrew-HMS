"use client";

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

const blocks = [
  { left: "2%", width: 140, height: 320, delay: 0.1, color: "var(--neon-purple)" },
  { left: "14%", width: 100, height: 260, delay: 0.4, color: "var(--neon-cyan)" },
  { left: "28%", width: 160, height: 380, delay: 0.2, color: "var(--neon-purple)" },
  { left: "48%", width: 120, height: 300, delay: 0.6, color: "var(--neon-orange)" },
  { left: "68%", width: 150, height: 360, delay: 0.3, color: "var(--neon-cyan)" },
  { left: "86%", width: 110, height: 280, delay: 0.5, color: "var(--neon-purple)" },
];

export function HostelModernBackground() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-500, 500], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-5, 5]), springConfig);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Prevent hydration mismatch by rendering a consistent shell on SSR
  if (!mounted) {
    return (
      <div className="hostel-bg-layer overflow-hidden" aria-hidden="true">
        <div className="hostel-bg-gradient" />
      </div>
    );
  }

  return (
    <div className="hostel-bg-layer overflow-hidden" aria-hidden="true">
      <div className="hostel-bg-gradient" />
      
      {/* Dynamic Glow Orbs matching client hydration expectation */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="hostel-glow-orb"
        style={{ 
          top: '14%', 
          left: '12%', 
          width: 260, 
          height: 260, 
          background: 'var(--hostel-glow-warm)',
          opacity: 0.55
        }}
      />
      <motion.div 
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.5, 0.4]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="hostel-glow-orb"
        style={{ 
          top: '18%', 
          left: '66%', 
          width: 320, 
          height: 320, 
          background: 'var(--hostel-glow-cool)',
          opacity: 0.55
        }}
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35]
        }}
        transition={{ duration: 12, repeat: Infinity }}
        className="hostel-glow-orb"
        style={{ 
          top: '58%', 
          left: '38%', 
          width: 280, 
          height: 280, 
          background: 'var(--hostel-glow-mint)',
          opacity: 0.55
        }}
      />

      <motion.div 
        style={{ rotateX, rotateY, perspective: 1000 }}
        className="hostel-skyline"
      >
        {blocks.map((block, index) => (
          <motion.div
            key={index}
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: block.delay, duration: 1, ease: "circOut" }}
            className="hostel-block"
            style={{
              left: block.left,
              width: block.width,
              height: block.height,
              zIndex: 10 + index,
            }}
          >
            <div className="hostel-block-face hostel-block-front backdrop-blur-sm border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="hostel-window-grid opacity-80" />
            </div>
            <div 
              className="hostel-block-face hostel-block-side" 
              style={{ filter: 'brightness(0.7)' }}
            />
            {/* Top Glow */}
            <div 
              className="absolute -top-1 left-0 w-full h-1 blur-[2px]" 
              style={{ background: block.color, opacity: 0.6 }}
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="hostel-vignette opacity-60" />
    </div>
  );
}
