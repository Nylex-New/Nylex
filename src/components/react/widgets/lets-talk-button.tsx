import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const LetsTalkButton = ({ className }: { className?: string }) => {
  return (
    <a
      href="#contact"
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0052FF] hover:bg-[#2563EB] text-white font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 group cursor-pointer",
        className,
      )}
    >
      <span className="text-white">Let's Talk</span>
      <ArrowUpRight className="size-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
    </a>
  );
};
