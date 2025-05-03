"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook to detect if the current viewport is mobile-sized
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsMobile(window.innerWidth < breakpoint)

    // Handler to call on window resize
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Call handler right away so state gets updated with initial window size
    handleResize()

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoint])

  return isMobile
} 