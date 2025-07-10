import { useEffect, useState, useCallback } from "react";

interface ScrollShadows {
  showLeftShadow: boolean;
  showRightShadow: boolean;
  showTopShadow: boolean;
  showBottomShadow: boolean;
}

export function useScrollShadows(
  scrollAreaRef: React.RefObject<HTMLDivElement | null>
) {
  const [shadows, setShadows] = useState<ScrollShadows>({
    showLeftShadow: false,
    showRightShadow: false,
    showTopShadow: false,
    showBottomShadow: false,
  });

  const updateShadows = useCallback(() => {
    const scrollContainer = scrollAreaRef.current;
    if (!scrollContainer) return;

    const viewport = scrollContainer.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!viewport) return;

    const {
      scrollLeft,
      scrollTop,
      scrollWidth,
      scrollHeight,
      clientWidth,
      clientHeight,
    } = viewport;

    setShadows({
      showLeftShadow: scrollLeft > 0,
      showRightShadow: scrollLeft < scrollWidth - clientWidth,
      showTopShadow: scrollTop > 0,
      showBottomShadow: scrollTop < scrollHeight - clientHeight,
    });
  }, [scrollAreaRef]);

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current;
    if (!scrollContainer) return;

    const viewport = scrollContainer.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;
    if (!viewport) return;

    // Initial check
    updateShadows();

    // Listen for scroll events
    viewport.addEventListener("scroll", updateShadows);

    // Listen for resize events
    const resizeObserver = new ResizeObserver(updateShadows);
    resizeObserver.observe(viewport);
    resizeObserver.observe(scrollContainer);

    return () => {
      viewport.removeEventListener("scroll", updateShadows);
      resizeObserver.disconnect();
    };
  }, [updateShadows, scrollAreaRef]);

  return shadows;
}
