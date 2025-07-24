import React, { useState, useEffect } from 'react';
import '../styles/PageTransition.css';

const PageTransition = ({ children, isTransitioning }) => {
  const [showContent, setShowContent] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      // Step 1: Show black overlay
      setShowOverlay(true);
      
      // Step 2: Hide content after overlay appears
      setTimeout(() => {
        setShowContent(false);
      }, 150);
    } else {
      // Step 1: Hide overlay first
      setShowOverlay(false);
      
      // Step 2: Show new content after overlay disappears
      setTimeout(() => {
        setShowContent(true);
      }, 150);
    }
  }, [isTransitioning]);

  return (
    <div className="page-transition-container">
      {/* Black overlay */}
      <div 
        className={`black-overlay ${showOverlay ? 'overlay-visible' : 'overlay-hidden'}`}
      />
      
      {/* Page content */}
      <div 
        className={`page-content ${showContent ? 'content-visible' : 'content-hidden'}`}
      >
        {children}
      </div>
    </div>
  );
};

export default PageTransition;
