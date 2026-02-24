import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export const VideoPlayer = ({ src, className, opacity = 1, isBackground = false }: { src: string, className?: string, opacity?: number, isBackground?: boolean }) => {
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isYouTube = src.includes("youtube.com") || src.includes("youtu.be");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, []);

  // Don't render background videos on mobile to save performance
  if (isBackground && isMobile) {
    return <div ref={containerRef} className={`${className} bg-bg-primary`} style={{ opacity: 0.1 }} />;
  }

  if (isYouTube) {
    const videoId = src.includes("v=") ? src.split("v=")[1].split("&")[0] : src.split("/").pop();
    return (
      <div ref={containerRef} className={`${className} overflow-hidden pointer-events-none bg-black/20`} style={{ opacity }}>
        {isInView && (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`}
            className="absolute inset-0 w-full h-[150%] top-[-25%] pointer-events-none"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            title="Video Player"
          />
        )}
      </div>
    );
  }

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isInView && videoRef.current) {
      const playVideo = () => {
        if (videoRef.current) {
          videoRef.current.play().catch(error => {
            console.log("Video play failed:", error);
          });
        }
      };

      playVideo();
      const timer = setTimeout(playVideo, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, src]);

  return (
    <div ref={containerRef} className={className} style={{ opacity }}>
      {isInView && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  key?: React.Key;
  className?: string;
}

export const FadeIn = ({ children, delay = 0, className }: FadeInProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);
