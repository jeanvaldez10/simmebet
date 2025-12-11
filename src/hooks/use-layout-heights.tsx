"use client";

import { useEffect, useState } from "react";

export const useLayoutHeights = () => {
  const [headerHeight, setHeaderHeight] = useState(80); // Default fallback
  const [tickerHeight, setTickerHeight] = useState(38); // Fixed ticker height
  const [categoriesHeight, setCategoriesHeight] = useState(58); // Actual measured categories height
  const [totalHeight, setTotalHeight] = useState(176); // 80 + 38 + 58

  useEffect(() => {
    const updateHeights = () => {
      const header = document.querySelector('header');
      const ticker = document.querySelector('.ticker-container');
      const categories = document.querySelector('.market-categories-container');
      
      let newHeaderHeight = 80;
      let newTickerHeight = 0;
      let newCategoriesHeight = 0;
      
      if (header instanceof HTMLElement) {
        newHeaderHeight = header.offsetHeight;
      }
      
      if (ticker instanceof HTMLElement) {
        newTickerHeight = ticker.offsetHeight;
      }
      
      if (categories instanceof HTMLElement) {
        newCategoriesHeight = categories.offsetHeight;
      }
      
      setHeaderHeight(newHeaderHeight);
      setTickerHeight(newTickerHeight);
      setCategoriesHeight(newCategoriesHeight);
      setTotalHeight(newHeaderHeight + newTickerHeight + newCategoriesHeight);
    };

    // Immediate measurement attempt
    updateHeights();
    
    // Fallback measurement with minimal delay to ensure DOM is ready
    const timer = setTimeout(updateHeights, 10);

    // Update on resize
    window.addEventListener('resize', updateHeights);
    
    // Use ResizeObserver for more accurate tracking
    const header = document.querySelector('header');
    const ticker = document.querySelector('.ticker-container');
    const categories = document.querySelector('.market-categories-container');
    let headerObserver: ResizeObserver | null = null;
    let tickerObserver: ResizeObserver | null = null;
    let categoriesObserver: ResizeObserver | null = null;
    
    if ('ResizeObserver' in window) {
      if (header) {
        headerObserver = new ResizeObserver(updateHeights);
        headerObserver.observe(header);
      }
      
      if (ticker) {
        tickerObserver = new ResizeObserver(updateHeights);
        tickerObserver.observe(ticker);
      }
      
      if (categories) {
        categoriesObserver = new ResizeObserver(updateHeights);
        categoriesObserver.observe(categories);
      }
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeights);
      if (headerObserver) {
        headerObserver.disconnect();
      }
      if (tickerObserver) {
        tickerObserver.disconnect();
      }
      if (categoriesObserver) {
        categoriesObserver.disconnect();
      }
    };
  }, []);

  return { headerHeight, tickerHeight, categoriesHeight, totalHeight };
};
