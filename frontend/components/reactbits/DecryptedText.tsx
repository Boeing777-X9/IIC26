'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';

export interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  className?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover';
}

export default function DecryptedText({
  text,
  speed = 40,
  maxIterations = 12,
  sequential = true,
  className = '',
  encryptedClassName = 'text-cyan-400 font-mono opacity-80',
  animateOn = 'view'
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const characters = '0123456789ABCDEF!@#$%&*<>[]{}';

  const shuffleChar = useCallback(() => {
    return characters[Math.floor(Math.random() * characters.length)];
  }, [characters]);

  const triggerDecrypt = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setRevealedIndices(new Set());

    let currentStep = 0;
    const len = text.length;

    intervalRef.current = setInterval(() => {
      setRevealedIndices(prev => {
        const next = new Set(prev);
        if (sequential) {
          if (next.size < len) {
            next.add(next.size);
          } else {
            clearInterval(intervalRef.current ?? undefined);
            setIsAnimating(false);
            setDisplayText(text);
            return next;
          }
        } else {
          currentStep++;
          if (currentStep >= maxIterations) {
            clearInterval(intervalRef.current ?? undefined);
            setIsAnimating(false);
            setDisplayText(text);
            return next;
          }
        }

        const scrambled = text
          .split('')
          .map((c, i) => (c === ' ' ? ' ' : next.has(i) ? c : shuffleChar()))
          .join('');
        setDisplayText(scrambled);
        return next;
      });
    }, speed);
  }, [isAnimating, text, sequential, maxIterations, speed, shuffleChar]);

  useEffect(() => {
    if (animateOn === 'view') {
      const observer = new IntersectionObserver(
        entries => {
          if (entries[0]?.isIntersecting && !hasAnimated) {
            triggerDecrypt();
            setHasAnimated(true);
          }
        },
        { threshold: 0.1 }
      );
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [animateOn, hasAnimated, triggerDecrypt]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <span
      ref={containerRef}
      className={`inline-block select-none ${className}`}
      onMouseEnter={() => {
        if (animateOn === 'hover') triggerDecrypt();
      }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, idx) => {
          const isRevealed = revealedIndices.has(idx) || !isAnimating;
          return (
            <span key={idx} className={isRevealed ? '' : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </span>
  );
}
