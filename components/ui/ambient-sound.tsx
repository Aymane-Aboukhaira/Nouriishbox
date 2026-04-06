"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // We use a generic ambient nature placeholder sound URL since one wasn't explicitly provided.
    audioRef.current = new Audio("https://cdn.freesound.org/previews/515/515510_10972236-lq.mp3"); // Nature ambience
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2; // Soft by default
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback failed:", err);
      });
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-6 left-6 z-[9900] w-12 h-12 bg-[#F5F0E8] border border-[#C4602A] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform group"
      aria-label="Toggle ambient sound"
    >
      <div className="flex items-center gap-[2px]">
        {[1, 2, 3, 4].map((bar) => (
          <motion.div
            key={bar}
            className="w-[2px] bg-[#1A1A1A] group-hover:bg-[#C4602A] transition-colors rounded-full origin-bottom text-[#F5F0E8]"
            animate={
              isPlaying
                ? { height: [4, 16, 4], transition: { repeat: Infinity, duration: 0.8, delay: bar * 0.15 } }
                : { height: 4, transition: { duration: 0.3 } }
            }
            style={{ height: 4 }}
          />
        ))}
      </div>
    </button>
  );
}
