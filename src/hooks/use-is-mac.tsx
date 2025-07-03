import React from "react";

export function useIsMac(): boolean {
  return React.useMemo(() => {
    if (typeof window === "undefined") return false;

    // Use the modern User-Agent Client Hints API if available
    if ("userAgentData" in navigator) {
      return (navigator as any).userAgentData.platform === "macOS";
    }

    // Fallback to userAgent parsing
    return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  }, []);
}
