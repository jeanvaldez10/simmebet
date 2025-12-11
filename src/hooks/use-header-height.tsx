"use client";

import { useEffect, useState } from "react";

export const useHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState(80); // Default fallback

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header instanceof HTMLElement) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Initial measurement
    updateHeaderHeight();

    // Update on resize
    window.addEventListener('resize', updateHeaderHeight);
    
    // Use ResizeObserver for more accurate tracking of header size changes
    const header = document.querySelector('header');
    let resizeObserver: ResizeObserver | null = null;
    
    if (header && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(header);
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return headerHeight;
};
