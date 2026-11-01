import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  X,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  Bot,
  CheckCircle2,
} from "lucide-react";

export interface PresetQA {
  id: string;
  category: string;
  shortLabel: string;
  question: string;
  answer: string;
  action?: {
    label: string;
    href: string;
  };
}

export const PRESET_QUESTIONS: PresetQA[] = [
  {
    id: "services",
    category: "Services",
    shortLabel: "What services do you provide?",
    question: "What core services and digital solutions does Nylex Studio engineer?",
    answer:
      "Nylex Studio is an architectural digital engineering & design practice specialized in 4 high-impact disciplines:\n\n" +
      "• **High-Performance Web Development**: Headless Astro, Next.js & WebGL platforms engineered for sub-second load times and 100/100 Core Web Vitals.\n" +
      "• **UI/UX Design Systems**: Human-centric interfaces, complete scalable token systems, and production-ready interactive prototypes.\n" +
      "• **Cross-Platform Mobile Apps**: Native-grade iOS & Android applications with offline-first synchronization and 60-120 FPS fluid ergonomics.\n" +
      "• **Brand Identity & Market Positioning**: Distinctive vector logomarks, typography hierarchy, and enterprise brand guideline systems.",
    action: {
      label: "Explore Digital Solutions",
      href: "#solutions",
    },
  },
  {
    id: "timeline",
    category: "Process",
    shortLabel: "What is your project timeline?",
    question: "What is your typical project timeline from kickoff to production launch?",
    answer:
      "We operate in disciplined, high-velocity 1-week iterative sprints with continuous staging access:\n\n" +
      "• **Brand / Showcase Websites**: 2 – 3 weeks\n" +
      "• **Custom Web Applications & Portals**: 4 – 6 weeks\n" +
      "• **Enterprise Design Systems & Retainers**: 6 – 10 weeks\n\n" +
      "Every milestone is clearly mapped upfront. You receive private staging access with weekly live review demonstrations.",
    action: {
      label: "View Process & Philosophy",
      href: "#about",
    },
  },
  {
    id: "pricing",
    category: "Pricing",
    shortLabel: "How does pricing & scoping work?",
    question: "How does Nylex Studio handle project scoping, contracts, and pricing?",
    answer:
      "We believe in 100% transparent, predictable pricing models tailored to project scope:\n\n" +
      "1. **Fixed-Scope Engagements**: Guaranteed milestones, fixed timeline, and transparent pricing with zero surprise invoices.\n" +
      "2. **Dedicated Studio Retainers**: Reserved engineering & design bandwidth for high-growth brands with evolving roadmaps.\n\n" +
      "We provide a comprehensive technical roadmap and guaranteed 24-hour SLA on all proposal briefs.",
    action: {
      label: "Request a Tailored Quote",
      href: "#contact",
    },
  },
  {
    id: "astro-edge",
    category: "Technology",
    shortLabel: "Why Astro & Edge performance?",
    question: "Why does Nylex prioritize Astro, Edge Architecture, and minimal JavaScript?",
    answer:
      "Speed directly drives conversion and brand authority. Traditional heavy SPAs ship megabytes of client-side JavaScript that drain mobile batteries and harm SEO ranking.\n\n" +
      "With **Astro Islands Architecture**:\n" +
      "• Server-rendered static HTML by default (zero unnecessary JS)\n" +
      "• Selective hydration only where real interactivity is justified\n" +
      "• 98–100 Google PageSpeed scores on real devices\n" +
      "• Instant global edge deployment with zero layout shifts.",
    action: {
      label: "Inspect Verified Metrics",
      href: "#reviews",
    },
  },
  {
    id: "portfolio",
    category: "Work",
    shortLabel: "Can I see recent client work?",
    question: "What recent client projects and verified case studies has Nylex delivered?",
    answer:
      "Here are some of our notable production engagements:\n\n" +
      "• **Inkjector Tattoos**: High-converting studio experience delivering a **+140% surge in client bookings** in month one.\n" +
      "• **Vanyaa Rainforest Retreat**: Luxury hospitality web experience with award-grade editorial typography and serenity.\n" +
      "• **Amazink Tattoo**: Sub-second load times with rich 3D visual aesthetic and streamlined booking.\n" +
      "• **Taste of Malabar**: Enterprise catering & event portal that doubled lead volumes within weeks.",
    action: {
      label: "Browse Portfolio Showcase",
      href: "#works",
    },
  },
  {
    id: "contact",
    category: "Initiate",
    shortLabel: "How do we get started?",
    question: "How can we start a new engagement or schedule an architectural intro?",
    answer:
      "Starting an engagement is straightforward and fast:\n\n" +
      "1. Submit your project requirements via our [Contact Form](#contact).\n" +
      "2. Email our lead architect directly at **hello@nylexstudio.com**.\n" +
      "3. Within **24 hours**, we'll analyze your requirements and deliver a structured roadmap, technical recommendations, and timeline estimate.",
    action: {
      label: "Initiate Project Now",
      href: "#contact",
    },
  },
];

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  action?: {
    label: string;
    href: string;
  };
}

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function getSmartReply(userText: string): {
  answer: string;
  action?: { label: string; href: string };
} {
  const query = userText.toLowerCase().trim();

  if (query.match(/price|cost|quote|budget|rate|fee|expensive|charge|how much/i)) {
    return {
      answer:
        "We offer transparent fixed-price milestone contracts as well as monthly dedicated studio retainers. Each project is scoped accurately based on technical requirements with zero hidden fees. Would you like a tailored proposal for your project?",
      action: { label: "Request a Proposal", href: "#contact" },
    };
  }

  if (query.match(/time|timeline|deadline|duration|how long|weeks|fast|speed|schedule/i)) {
    return {
      answer:
        "Most custom brand & showcase websites take 2 to 3 weeks, while comprehensive web platforms and applications take 4 to 6 weeks. We work in rapid 1-week iterative sprints with continuous staging access.",
      action: { label: "Learn About Our Process", href: "#about" },
    };
  }

  if (
    query.match(
      /service|what do you do|solution|offer|develop|build|design|stack|tech|frontend|backend|framework/i
    )
  ) {
    return {
      answer:
        "We specialize in High-Performance Web Development (Astro, Next.js, WebGL), UI/UX Systems & Design Prototyping, Cross-Platform Mobile Apps, and Brand Identity Architecture.",
      action: { label: "View All Solutions", href: "#solutions" },
    };
  }

  if (query.match(/work|portfolio|case study|project|example|client|inkjector|vanyaa|amazink/i)) {
    return {
      answer:
        "We have engineered award-grade platforms for Inkjector Tattoos (+140% bookings), Vanyaa Rainforest Retreat, Amazink Tattoo Studio, and Taste of Malabar. Check out the case studies in our work showcase!",
      action: { label: "View Our Work", href: "#works" },
    };
  }

  if (query.match(/contact|start|hire|call|talk|email|meeting|hello@|reach|whatsapp/i)) {
    return {
      answer:
        "You can initiate a project directly through our contact form below or email us at hello@nylexstudio.com. We guarantee a response and technical proposal within 24 hours!",
      action: { label: "Open Contact Form", href: "#contact" },
    };
  }

  if (
    query.match(
      /hello|hi|hey|hola|namaste|good morning|good afternoon|good evening|wassup|yo/i
    )
  ) {
    return {
      answer:
        "Hello! Welcome to Nylex Studio. I'm here to help you learn about our engineering standards, explore our past projects, or help you start a new digital engagement. What can I assist you with today?",
    };
  }

  if (query.match(/location|where are you|office|remote|country|india/i)) {
    return {
      answer:
        "Nylex Studio operates as a globally distributed, remote-first architectural studio partnering with forward-thinking businesses worldwide.",
    };
  }

  // Default fallback
  return {
    answer:
      "Thank you for reaching out! For specific architectural requirements, custom scope consultations, or technology discussions, our lead engineering team would be happy to review your brief directly.",
    action: { label: "Send Message to Team", href: "#contact" },
  };
}

export const AgentChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "agent",
      text: "Hello! I am the Nylex Studio Intelligence Agent. I can help answer questions regarding our engineering standards, project pricing, timelines, or guide you through starting a new engagement.",
      time: getCurrentTime(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Listen to external toggle events from 3D robot or other triggers
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
    };
    const handleOpen = () => {
      setIsOpen(true);
    };
    const handleClose = () => {
      setIsOpen(false);
    };

    window.addEventListener("toggle-agent-chat", handleToggle);
    window.addEventListener("open-agent-chat", handleOpen);
    window.addEventListener("close-agent-chat", handleClose);

    return () => {
      window.removeEventListener("toggle-agent-chat", handleToggle);
      window.removeEventListener("open-agent-chat", handleOpen);
      window.removeEventListener("close-agent-chat", handleClose);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSelectPreset = (qa: PresetQA) => {
    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: qa.question,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: "agt-" + Date.now(),
        sender: "agent",
        text: qa.answer,
        action: qa.action,
        time: getCurrentTime(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, agentMsg]);
    }, 550);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: trimmed,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getSmartReply(trimmed);
      const agentMsg: ChatMessage = {
        id: "agt-" + Date.now(),
        sender: "agent",
        text: reply.answer,
        action: reply.action,
        time: getCurrentTime(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, agentMsg]);
    }, 650);
  };

  const handleActionClick = (href: string) => {
    // If mobile, close the chat so user can see target section
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-1",
        sender: "agent",
        text: "Conversation refreshed. How else can I assist your digital roadmap today?",
        time: getCurrentTime(),
      },
    ]);
  };

  // Helper to render bold markdown and bullet lines cleanly
  const renderFormattedText = (text: string) => {
    const paragraphs = text.split("\n\n");
    return paragraphs.map((para, pIdx) => {
      const lines = para.split("\n");
      return (
        <p key={pIdx} className="mb-2 last:mb-0">
          {lines.map((line, lIdx) => {
            const isBullet = line.trim().startsWith("•");
            const cleanLine = isBullet ? line.trim().substring(1).trim() : line;

            // Simple parser for **bold** text
            const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

            return (
              <span key={lIdx} className={isBullet ? "flex items-start gap-2 my-1" : "block"}>
                {isBullet && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] mt-1.5 shrink-0" />
                )}
                <span>
                  {parts.map((part, partIdx) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <strong key={partIdx} className="font-semibold text-white">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </span>
              </span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* Mobile-Only Floating Chat Trigger Button (Shows on mobile where 3D Three.js canvas is hidden) */}
      <div className="md:hidden fixed right-4 bottom-5 z-40">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-950/90 border border-[#0052FF]/60 text-white shadow-[0_8px_24px_rgba(0,82,255,0.4)] backdrop-blur-md font-mono text-xs uppercase tracking-wider active:scale-95 transition-all"
          aria-label="Open Nylex AI Chat"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00eaff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0052FF]"></span>
          </span>
          <Bot className="size-4 text-[#00eaff]" />
          <span>Chat with Agent</span>
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <aside
          aria-label="Nylex Studio AI Assistant"
          className="fixed bottom-3 sm:bottom-20 right-2 sm:right-4 z-50 w-[calc(100vw-1rem)] sm:w-[420px] max-h-[85vh] sm:max-h-[620px] flex flex-col rounded-3xl overflow-hidden bg-[#090b14]/95 border border-neutral-800/80 shadow-[0_24px_80px_rgba(0,82,255,0.22)] backdrop-blur-2xl text-neutral-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-950/80 border-b border-neutral-800/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/40 text-[#00eaff]">
                <Bot className="size-4.5" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00eaff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00eaff]"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-widest font-bold text-white">
                    NYLEX AGENT
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/40 text-[#00eaff]">
                    AI CORE
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                    Online &bull; Instant Answers
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
                aria-label="Restart chat"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm custom-scrollbar overscroll-contain">
            {messages.map((msg) => {
              const isAgent = msg.sender === "agent";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAgent ? "items-start" : "items-end"} gap-1.5`}
                >
                  <div className="flex items-center gap-2 px-1 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                    <span>{isAgent ? "Nylex Agent" : "You"}</span>
                    <span>&bull;</span>
                    <span>{msg.time}</span>
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[92%] sm:max-w-[88%] leading-relaxed ${
                      isAgent
                        ? "bg-neutral-900/80 border border-neutral-800/90 text-neutral-200 rounded-tl-sm shadow-xs"
                        : "bg-[#0052FF] text-white rounded-tr-sm shadow-sm"
                    }`}
                  >
                    {isAgent ? (
                      <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}

                    {/* Action Call-to-Action Link */}
                    {msg.action && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center">
                        <button
                          onClick={() => handleActionClick(msg.action!.href)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0052FF]/20 hover:bg-[#0052FF] text-[#00eaff] hover:text-white border border-[#0052FF]/40 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer group"
                        >
                          <span>{msg.action.label}</span>
                          <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col items-start gap-1.5">
                <div className="flex items-center gap-2 px-1 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
                  <span>Nylex Agent</span>
                  <span>&bull;</span>
                  <span>Typing</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-neutral-900/80 border border-neutral-800 text-neutral-400 flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-pulse"></span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                  <span className="font-mono text-xs text-neutral-400 ml-1">Analyzing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Quick Question Pills */}
          <div className="px-4 py-2.5 bg-neutral-950/60 border-t border-neutral-800/80 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="size-3 text-[#00eaff]" />
                <span>Suggested Questions</span>
              </span>
              <span className="font-mono text-[10px] text-neutral-500">Tap to Ask</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar overscroll-contain">
              {PRESET_QUESTIONS.map((qa) => (
                <button
                  key={qa.id}
                  onClick={() => handleSelectPreset(qa)}
                  disabled={isTyping}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-[#0052FF]/20 border border-neutral-800 hover:border-[#0052FF]/60 text-neutral-300 hover:text-white font-mono text-[11px] whitespace-nowrap transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {qa.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 p-3 bg-neutral-950 border-t border-neutral-800/80 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about services, pricing, timeline..."
              className="flex-1 bg-neutral-900/90 border border-neutral-800 focus:border-[#0052FF] rounded-full px-4 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              aria-label="Send message"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0052FF] hover:bg-[#2563EB] disabled:bg-neutral-800 disabled:text-neutral-500 text-white transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-95 shadow-sm"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
};

