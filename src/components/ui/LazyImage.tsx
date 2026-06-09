import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageOff, Loader2 } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderClassName?: string;
  errorIconSize?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  className = '',
  placeholderClassName = '',
  errorIconSize = 24,
  id,
  style,
  ...props
}) => {
  const [isIntersected, setIsIntersected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersected(true);
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        rootMargin: '100px', // Pre-triggers image loading when it is within 100px of viewport
        threshold: 0.01,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (props.onLoad) {
      props.onLoad(e);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsError(true);
    setIsLoaded(true); // Stop rendering transitions / loaders
    if (props.onError) {
      props.onError(e);
    }
  };

  return (
    <div
      ref={containerRef}
      id={id ? `lazy-image-container-${id}` : undefined}
      className={`relative overflow-hidden bg-slate-100/80 ${className}`}
      style={style}
    >
      {/* Structural pixel-blurry/pulse animated background during transit/loading */}
      <AnimatePresence mode="popLayout">
        {!isLoaded && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200/50 to-slate-100/50 blur-xs ${placeholderClassName}`}
          >
            <Loader2 className="w-5 h-5 text-emerald-600/20 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual image element streamed on viewport intersection */}
      {isIntersected && !isError && (
        <motion.img
          {...(props as any)}
          id={id}
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={handleImageLoad}
          onError={handleImageError}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.02 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isLoaded ? 'filter-none' : 'blur-md'
          }`}
        />
      )}

      {/* Fallback Error Display State */}
      {isError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-1 p-2"
        >
          <ImageOff size={errorIconSize} className="opacity-50 stroke-[1.5]" />
          <span className="text-[9px] text-slate-500 font-sans font-medium tracking-wide">صورة غير متوفرة</span>
        </motion.div>
      )}
    </div>
  );
};

export default LazyImage;
