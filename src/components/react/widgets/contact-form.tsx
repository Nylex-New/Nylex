import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "$10k - $25k",
    details: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const budgetOptions = ["<$10k", "$10k - $25k", "$25k - $50k", "$50k+"];
  const serviceOptions = [
    "Web Development & Engineering",
    "UI/UX & Product Design",
    "Mobile Applications (iOS / Android)",
    "Bespoke Brand Architecture",
    "Full-Stack Enterprise Solutions",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    setTimeout(() => {
      setStatus("success");
    }, 900);
  };

  if (status === "success") {
    return (
      <div className="p-8 sm:p-14 rounded-2xl border border-[#0052FF]/30 bg-neutral-50/80 flex flex-col items-center text-center gap-6 text-neutral-950">
        <div className="w-14 h-14 rounded-full border border-[#0052FF] text-[#0052FF] flex items-center justify-center">
          <CheckCircle2 className="size-7" />
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-neutral-950">Request Transmitted</h3>
          <p className="text-neutral-600 mt-2 text-sm sm:text-base max-w-md font-light leading-relaxed">
            Thank you for reaching out. Our technical directors will analyze your requirements and return with a detailed roadmap within 24 hours.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
          <a
            href="https://wa.me/918921442748"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#0052FF] hover:bg-[#2563EB] text-white font-semibold text-sm transition-all"
          >
            <span>Chat directly on WhatsApp</span>
            <ArrowUpRight className="size-4" />
          </a>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setFormData({
                name: "",
                email: "",
                phone: "",
                service: "",
                budget: "$10k - $25k",
                details: "",
              });
            }}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-neutral-300 hover:border-neutral-500 text-neutral-800 font-mono text-xs uppercase tracking-wider transition-all"
          >
            New Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* 01. Name & 02. Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2.5">
          <label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            01 / Full Name *
          </label>
          <input
            id="name"
            required
            type="text"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:border-[#0052FF] focus:outline-none transition-colors text-sm font-sans placeholder:text-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            02 / Work Email *
          </label>
          <input
            id="email"
            required
            type="email"
            placeholder="jane@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:border-[#0052FF] focus:outline-none transition-colors text-sm font-sans placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* 03. Phone & 04. Service */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2.5">
          <label htmlFor="phone" className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            03 / Contact Number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:border-[#0052FF] focus:outline-none transition-colors text-sm font-sans placeholder:text-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="service" className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            04 / Service Domain *
          </label>
          <select
            id="service"
            required
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:border-[#0052FF] focus:outline-none transition-colors text-sm font-sans cursor-pointer"
          >
            <option value="" disabled className="bg-white text-neutral-900">
              Select Requirement
            </option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-white text-neutral-900">
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 05. Budget Allocation */}
      <div className="flex flex-col gap-3">
        <label className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          05 / Budget Allocation
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {budgetOptions.map((b) => {
            const isSelected = formData.budget === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setFormData({ ...formData, budget: b })}
                className={`py-3.5 px-3 rounded-xl border text-xs font-mono transition-all text-center cursor-pointer ${
                  isSelected
                    ? "border-[#0052FF] bg-[#0052FF] text-white font-semibold"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-[#0052FF] hover:text-[#0052FF]"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* 06. Scope & Details */}
      <div className="flex flex-col gap-2.5">
        <label htmlFor="details" className="font-mono text-xs uppercase tracking-widest text-neutral-500">
          06 / Project Scope & Goals *
        </label>
        <textarea
          id="details"
          required
          rows={4}
          placeholder="Briefly describe your objectives, timeline, deliverables, or current challenges..."
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          className="w-full px-4 py-3.5 rounded-xl border border-neutral-300 bg-white text-neutral-900 focus:border-[#0052FF] focus:outline-none transition-colors text-sm font-sans placeholder:text-neutral-400 resize-none leading-relaxed"
        />
      </div>

      {/* Submit Action (Zero Shadows, Clean Contrast) */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-4 rounded-xl bg-[#0052FF] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Transmitting Request...</span>
          </>
        ) : (
          <>
            <span>Transmit Request</span>
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
