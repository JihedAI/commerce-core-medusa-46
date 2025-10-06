import React from "react";
import { useLocation } from "react-router-dom";
import { scrollToTop } from "@/utils/smoothScroll";

const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    // If navigating to an anchor on the same page, do not reset to top
    if (hash && pathname === window.location.pathname) return;

    // Reset scroll instantly to avoid flash of mid-page content
    // Fallback to window.scrollTo if smooth utility isn't desired
    try {
      scrollToTop(false);
    } catch {
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};

export default ScrollToTop;


