"use client";

import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  EyeIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from "@heroicons/react/24/outline";

export const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [readAloud, setReadAloud] = useState(false);

  // Apply font size globally
  useEffect(() => {
    document.documentElement.style.fontSize = `${100 + fontSizeOffset}%`;
  }, [fontSizeOffset]);

  // Apply high contrast globally
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast-mode");
    } else {
      document.body.classList.remove("high-contrast-mode");
    }
  }, [highContrast]);

  // Handle read aloud interactions
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      if (!readAloud) return;
      const target = e.target as HTMLElement;
      
      // Don't read our own widget
      if (target.closest('.accessibility-widget-container')) return;

      const textToRead = target.textContent?.trim();
      if (textToRead && textToRead.length > 0) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.9; // Slightly slower for better comprehension
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    };

    if (readAloud) {
      document.addEventListener("mouseover", handleMouseOver);
    } else {
      window.speechSynthesis.cancel();
      document.removeEventListener("mouseover", handleMouseOver);
    }

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      window.speechSynthesis.cancel();
    };
  }, [readAloud]);

  const toggleWidget = () => setIsOpen(!isOpen);

  const increaseFontSize = () => {
    if (fontSizeOffset < 50) setFontSizeOffset((prev) => prev + 10);
  };

  const decreaseFontSize = () => {
    if (fontSizeOffset > -20) setFontSizeOffset((prev) => prev - 10);
  };

  const resetFontSize = () => setFontSizeOffset(0);

  return (
    <div className="fixed bottom-6 right-6 z-50 accessibility-widget-container font-sans text-base">
      {isOpen && (
        <div className="bg-white border-2 border-primary shadow-2xl rounded-2xl p-4 mb-4 w-72 transition-all duration-300 transform origin-bottom-right">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="font-bold text-lg text-slate-800">Accessibility</h3>
            <button 
              onClick={toggleWidget}
              className="text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Close Accessibility Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Text Size Controls */}
            <div>
              <p className="font-semibold text-sm text-slate-700 mb-2">Text Size</p>
              <div className="flex justify-between items-center bg-slate-50 rounded-lg p-2">
                <button 
                  onClick={decreaseFontSize}
                  className="p-2 hover:bg-slate-200 rounded-md transition-colors"
                  aria-label="Decrease text size"
                >
                  <MagnifyingGlassMinusIcon className="h-5 w-5 text-slate-700" />
                </button>
                <button 
                  onClick={resetFontSize}
                  className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                  aria-label="Reset text size"
                >
                  Reset
                </button>
                <button 
                  onClick={increaseFontSize}
                  className="p-2 hover:bg-slate-200 rounded-md transition-colors"
                  aria-label="Increase text size"
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5 text-slate-700" />
                </button>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div>
              <button 
                onClick={() => setHighContrast(!highContrast)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  highContrast 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                aria-pressed={highContrast}
              >
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-5 w-5" />
                  <span className="font-semibold">High Contrast</span>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${highContrast ? 'bg-white/30' : 'bg-slate-300'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${highContrast ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>

            {/* Read Aloud Toggle */}
            <div>
              <button 
                onClick={() => setReadAloud(!readAloud)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  readAloud 
                    ? 'bg-green-600 text-white' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                aria-pressed={readAloud}
              >
                <div className="flex items-center gap-2">
                  {readAloud ? <SpeakerWaveIcon className="h-5 w-5" /> : <SpeakerXMarkIcon className="h-5 w-5" />}
                  <span className="font-semibold">Read Aloud Hover</span>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${readAloud ? 'bg-white/30' : 'bg-slate-300'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${readAloud ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
              {readAloud && (
                <p className="text-xs text-green-600 mt-2 px-1">
                  Hover over any text on the screen to hear it spoken aloud.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleWidget}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50 ${
          isOpen ? 'bg-slate-800 text-white' : 'bg-primary text-white'
        }`}
        aria-label="Accessibility Options"
        aria-expanded={isOpen}
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
        </svg>
      </button>
    </div>
  );
};
