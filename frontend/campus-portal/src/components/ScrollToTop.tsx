import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router preserves scroll position across navigations, which means
 * clicking a nav link from halfway down one page lands you halfway down the
 * next. Reset to the top on every route change.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}