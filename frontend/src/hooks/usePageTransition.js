import { useCallback, useEffect, useState } from 'react';

export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      // Prevent default browser navigation
      event.preventDefault();

      // Trigger transition
      setIsTransitioning(true);

      // Allow navigation after transition delay
      setTimeout(() => {
        setIsTransitioning(false);
        // The browser will handle the actual navigation
      }, 300);
    };

    // Listen for browser navigation events
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const transitionToPage = useCallback((callback, delay = 300) => {
    setIsTransitioning(true);

    setTimeout(() => {
      if (callback) callback();
      setIsTransitioning(false);
    }, delay);
  }, []);

  return { isTransitioning, transitionToPage };
};
