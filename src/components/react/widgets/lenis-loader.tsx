"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function LenisLoader() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
