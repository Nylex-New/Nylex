title: "AGENCY.md — Universal Website Design & Development Standard"
version: "1.1"
primary_stack: "Astro"
purpose: "Reusable design and development instructions for AI coding agents building premium, modern websites."

AGENCY.md

Universal Website Design & Development Standard

«Purpose: This file is a reusable operating standard for every website project. Read it before planning, designing, coding, or modifying the website. Adapt the visual direction to the project; do not force one fixed theme, layout, color palette, or animation style onto every website.»

---

1. Core Mission

Build websites that are:

- Visually distinctive, professional, modern, and appropriate for their industry.
- Designed around the actual business, audience, content, and conversion goals.
- Responsive across mobile, tablet, laptop, and large desktop screens.
- Polished in details without looking like a generic AI-generated template.
- Motion-aware: animation should support meaning, hierarchy, and feedback—not distract.
- Maintainable and structured using modern development practices.

Never interpret "premium" as "add gradients, glassmorphism, giant headings, floating cards, and animations everywhere."

Premium design may be minimal, editorial, playful, technical, luxurious, corporate, or expressive depending on the project.

Non-negotiable rules

1. Understand the existing project before changing it.
2. Preserve the project's working features, content, routes, integrations, and brand assets unless asked to change them.
3. Do not invent business facts, testimonials, statistics, certifications, addresses, prices, or guarantees.
4. Do not replace a distinctive existing design with a generic template.
5. Do not install every library by default. Use only tools that solve a real project need.
6. Prefer Astro-native HTML/CSS and lightweight JavaScript. Add React only where interactive React components are justified.
7. Use current official documentation through Context7 when available; verify APIs against the installed package versions.
8. Do not overwrite existing user work or project assets.
9. Adapt the design to the actual client requirements rather than following a fixed visual style.

---

2. First-Run Project Assessment

Before coding, inspect the repository and understand the existing project.

Inspect

- "package.json", lockfile, scripts, installed dependencies, and framework version.
- Astro configuration and integrations.
- "src/", "public/", routes/pages, layouts, components, styles, scripts, and assets.
- Existing "AGENTS.md", "CLAUDE.md", "PRODUCT.md", "DESIGN.md", and README files.
- Existing design tokens, fonts, icon systems, and component conventions.
- Forms, API calls, authentication, CMS, payment, booking, and third-party integrations.
- Existing project architecture and coding conventions.

Before implementation

Understand:

- What is the website and what does the business offer?
- Who is the target audience?
- What is the primary action visitors should take?
- What pages and features are required?
- What content and assets are supplied?
- Which brand decisions are fixed?
- What is unknown and must be confirmed?

If information is missing, mark it as unknown. Ask only essential questions; otherwise proceed with clearly stated, reversible assumptions.

Existing-project safety

For an existing website:

- Do not rewrite the project architecture without a clear reason.
- Do not remove routes, components, dependencies, or features simply because they appear unused.
- Check references before deleting or renaming files.
- Preserve API contracts and data structures.
- Make focused changes.
- Avoid overwriting existing user work.

---

3. Design Direction: Project-Specific, Not One-Style-Fits-All

Every project must have a deliberate visual direction based on its category and audience.

Examples:

Website category| Possible visual direction
Luxury resort / hospitality| Editorial photography, calm spacing, refined typography, restrained motion
SaaS / technology| Clear hierarchy, product-led layouts, precise interactions
Corporate / security| Trust, clarity, strong information structure, restrained color
Restaurant / catering| Appetite-led imagery, clear menus, booking/contact actions
Creative agency / portfolio| Strong art direction, expressive typography, purposeful transitions
E-commerce| Product clarity, filters, comparison, trust
Healthcare / education| Readability, accessibility, reassurance, clear navigation
Local service business| Local trust signals, service clarity, calls and enquiries

Do not copy another brand's identity. Use references to understand layout patterns, interaction ideas, and visual principles, then create an original design appropriate to the client.

Design decisions to establish

Before building the main UI, define:

- Brand personality and visual keywords.
- Primary, secondary, accent, background, surface, text, and border colors.
- Typography families, weights, scale, and line heights.
- Spacing scale and responsive container widths.
- Grid, column behavior, and section rhythm.
- Button, link, form, card, and navigation styles.
- Image and video art direction, aspect ratios, and cropping.
- Border radius, borders, shadows, and elevation rules.
- Motion principles, durations, and easing.
- Responsive behavior for key components.

Use design tokens (CSS custom properties) instead of scattering arbitrary values throughout the code.

---

4. Impeccable — Design Thinking, Review, and Refinement

Role: Impeccable is an AI-agent design skill/command system. It helps the agent plan, critique, audit, and refine interfaces. It is not a CSS framework or a runtime dependency.

Repository:

https://github.com/pbakaus/impeccable

Use it when it is installed and available in the coding agent. Do not assume the commands exist if the skill is not installed.

Recommended commands

Command| When to use it| Expected outcome
"/impeccable"| Unsure what to do next| Reviews project context and suggests appropriate next steps
"/impeccable init"| First setup or major product-context change| Records audience, purpose, needs, and constraints
"/impeccable shape"| Before a new page or major redesign| Turns the brief into a design direction
"/impeccable critique"| Review an existing page's design quality| Identifies weak hierarchy and visual issues
"/impeccable audit"| Review interface quality| Produces prioritized design findings
"/impeccable typeset"| Typography feels weak or inconsistent| Improves type hierarchy and readability
"/impeccable layout"| Structure, spacing, or hierarchy is unclear| Refines layout and grouping
"/impeccable colorize"| Color is not communicating hierarchy| Uses color purposefully
"/impeccable animate"| Motion needs improvement| Adds or refines meaningful motion
"/impeccable bolder"| A section lacks visual presence| Increases emphasis
"/impeccable quieter"| A section feels noisy or over-designed| Reduces competing visual elements
"/impeccable delight"| A meaningful interaction deserves a memorable detail| Adds a purposeful moment of delight
"/impeccable overdrive"| Exploring a more expressive direction| Pushes a design concept further
"/impeccable adapt"| Responsive behavior needs refinement| Adapts layout and interaction across screen sizes
"/impeccable polish"| Final refinement pass| Improves fit, finish, consistency, and details
"/impeccable optimize"| Interface implementation needs optimization| Targets avoidable implementation costs
"/impeccable harden"| Robustness and edge cases need attention| Strengthens implementation quality
"/impeccable extract"| Repeated patterns exist across the project| Consolidates reusable components and tokens
"/impeccable document"| A visual system already exists| Records the design system in "DESIGN.md"
"/impeccable generate"| Compare alternatives for a specific element| Generates visual variations
"/impeccable live"| Visual iteration on a running website| Supports visual selection and refinement

Commands and availability can evolve. Before relying on a command, check the installed Impeccable version and current documentation.

Suggested Impeccable usage

New project

1. "/impeccable init"
2. "/impeccable shape"
3. Establish "DESIGN.md" using the actual project direction.
4. Build a representative section.
5. "/impeccable critique"
6. Refine the design before scaling it to all pages.

Existing project

1. "/impeccable"
2. "/impeccable critique"
3. "/impeccable audit"
4. Fix the most important design findings first.
5. Use focused commands such as "typeset", "layout", "adapt", or "polish".

Important: Impeccable does not replace product understanding or developer judgment. Review every suggested change.

---

5. Awesome Design MD — Design System References

Role: A curated collection of "DESIGN.md" files describing the visual language of real products and brands.

Repository:

https://github.com/VoltAgent/awesome-design-md

A "DESIGN.md" is a human-readable design-system reference for an AI agent; it is not a component library.

What a useful DESIGN.md can describe

- Visual theme and atmosphere.
- Color palette and semantic color roles.
- Typography and hierarchy.
- Component styling and interaction states.
- Layout and spacing principles.
- Borders, shadows, depth, and surfaces.
- Responsive behavior.
- Design do's and don'ts.

How to use it

1. Review the available design references.
2. Select a reference only if its design language fits the project.
3. Read the entire selected "DESIGN.md".
4. Extract useful principles and tokens.
5. Adapt them to the client's actual brand, content, and category.
6. Create or update the project's own root-level "DESIGN.md".
7. Tell the agent to follow the project-specific "DESIGN.md".

Example instruction:

«Read "DESIGN.md" before creating or changing UI. Treat it as the visual source of truth. Preserve the brand's colors, typography, spacing, component states, and responsive rules. If a requirement conflicts with the file, explain the conflict and prioritize the explicit client requirement.»

Optional CLI workflow, if the "designmd.sh" CLI is available:

npx designmd.sh add VoltAgent/voltagent
npx designmd.sh list
npx designmd.sh update

Check the current CLI documentation for exact commands and source identifiers before using them.

Alternatively, copy a selected "DESIGN.md" from the repository manually.

Rules

- Never combine unrelated brand systems into one inconsistent interface.
- Never copy proprietary logos, images, or brand assets without permission.
- Use references as inspiration, not as permission to clone a competitor.
- Do not let a reference override the actual client brief.

---

6. React Bits — Reusable React UI and Motion Components

Role: React Bits provides reusable animated UI components and visual effects.

Website:

https://reactbits.dev

What it provides

- Animated text.
- Text reveal effects.
- Blur text.
- Split text.
- Animated backgrounds.
- Particles.
- Spotlight effects.
- Magnetic buttons.
- Animated cards.
- Image effects.
- Background animations.
- Interactive UI components.

Astro compatibility rule

Astro is not a React-only framework. React Bits components require React and the Astro React integration.

Before using React Bits:

1. Confirm the project needs a React component.
2. Check whether "@astrojs/react", "react", and "react-dom" are already installed.
3. If React is justified and missing, consult current Astro integration documentation.
4. Add the React integration to "astro.config.*".
5. Use React Bits components as isolated Astro islands.
6. Do not convert static Astro pages or the whole website to React just to use one effect.

Typical installation command:

pnpm astro add react

Check compatibility and existing dependencies first.

Astro hydration directives

Use the lightest hydration strategy that meets the interaction requirement:

Directive| Use
"client:load"| Critical interactive UI needed immediately
"client:idle"| Non-critical component that can wait
"client:visible"| Below-the-fold component; hydrate when it approaches the viewport
"client:media"| Component needed only at a matching media query
No client directive| Static rendering; no client-side hydration

Example:

---
import AnimatedCard from "../components/AnimatedCard.jsx";
---

<AnimatedCard client:visible />

The component file extension and import path must match the actual project.

React Bits usage rules

- Select components that support the project's React and styling setup.
- Review the component's dependencies, license, and source before adding it.
- Prefer adapting only the component needed over installing an entire ecosystem.
- Avoid duplicate animation libraries for the same effect.
- Keep client-side bundles small.
- Provide static or reduced-motion alternatives.
- Verify keyboard support, focus states, and touch behavior.
- Do not use visual effects that reduce text readability or obscure content.

---

7. GSAP — Advanced Motion and Scroll Experiences

Role: GSAP is a JavaScript animation platform for precise, sequenced, interactive, and scroll-driven animation.

Website:

https://gsap.com

Use GSAP when CSS transitions or a small native script are insufficient—for example, coordinated timelines, pinned sections, scrubbed scroll scenes, or complex SVG motion.

Common GSAP concepts

Feature| Purpose
"gsap.to()"| Animate toward target values
"gsap.from()"| Animate from specified starting values
"gsap.fromTo()"| Define explicit start and end values
"gsap.set()"| Set values immediately
"gsap.timeline()"| Sequence or coordinate animations
Stagger| Animate multiple elements with offsets
ScrollTrigger| Trigger, pin, scrub, or synchronize animations with scroll
MatchMedia| Use different animation behavior for media conditions

Installation

Install GSAP only if the project needs it:

pnpm add gsap

Astro integration pattern

Use GSAP in a bundled Astro "<script>" or a client-side module. For Astro pages with client-side navigation, initialize and clean up animations correctly.

Illustrative Astro component pattern:

<section class="hero">
  <h1 class="hero__title">A clear, meaningful headline</h1>
</section>

<script>
  import { gsap } from "gsap";

  const ctx = gsap.context(() => {
    gsap.from(".hero__title", {
      y: 28,
      autoAlpha: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  // In a real component, tie cleanup to the component/page lifecycle.
  // Do not leave duplicate ScrollTriggers or listeners after navigation.
</script>

This is a starting pattern, not a universal lifecycle implementation.

For repeated Astro view-transition navigation, initialize on the appropriate Astro page lifecycle event and clean up the previous context before reinitializing.

ScrollTrigger example

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ctx = gsap.context(() => {
  gsap.to(".visual", {
    y: -80,
    ease: "none",
    scrollTrigger: {
      trigger: ".story-section",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});

// When the owning page/component is disposed:
ctx.revert();

GSAP rules

- Register plugins explicitly when required.
- Scope selectors to the component where possible.
- Revert contexts and kill ScrollTriggers when the page/component is removed.
- Avoid layout-thrashing properties when transform/opacity will work.
- Do not animate every element on every scroll.
- Avoid scroll-jacking and forced scrolling.
- Keep content usable if JavaScript fails.
- Respect reduced-motion preferences.
- Test on mobile-sized viewports and lower-powered devices.
- Avoid competing GSAP, CSS, and React Bits animations on the same element.
- Use "will-change" sparingly and only when justified.

---

8. Context7 — Current Library Documentation

Role: Context7 is an MCP/documentation tool that retrieves current, library-specific documentation and examples for an AI coding agent.

Website:

https://context7.com

Required behavior

When Context7 is available, use it before implementing or changing framework/library-specific code where API correctness matters.

Especially use it for:

- Astro and Astro integrations.
- React and React Bits dependencies.
- GSAP and ScrollTrigger.
- Tailwind CSS.
- TypeScript and JavaScript libraries.
- Forms, validation, animation, CMS, and deployment integrations.

Prompt convention

Include "use context7" in relevant coding requests, or configure the coding agent to invoke Context7 automatically for documentation-sensitive work.

Example:

«Check the installed Astro version and retrieve the matching official Astro documentation with Context7. Implement the integration using the documented API for that version. Do not use deprecated APIs. use context7»

When possible, specify the exact library and version. Do not accept a documentation result for a different major version without checking compatibility.

MCP setup

Use the official setup guide for the coding agent. Context7's documented setup options include:

npx ctx7 setup

For the CLI, check its current Node.js requirement and supported agent flags before using it.

The hosted MCP endpoint documented by Context7 is:

https://mcp.context7.com/mcp

Do not place API keys in source code, Markdown files committed to Git, screenshots, or logs. Use the agent's secure configuration/environment mechanism.

Context7 verification rules

- Prefer official documentation for the exact installed version.
- Check whether a method, component, or configuration option still exists.
- Verify package compatibility with Astro and the project's runtime.
- Do not blindly paste examples; adapt imports, lifecycle, and file structure.
- If Context7 is unavailable, use the official documentation and clearly note that it was checked manually.

---

9. Astro-First Technical Architecture

Astro is the default primary framework for this standard. Use Astro's strengths: server-rendered/static HTML, content-focused pages, component composition, and selective client-side JavaScript.

Preferred principles

1. Build static content and layouts with ".astro" components.
2. Use semantic HTML as the foundation.
3. Use CSS and native browser APIs for simple interactions.
4. Use React islands only for genuinely interactive React UI.
5. Load non-critical client code only when needed.
6. Avoid turning a content website into a client-heavy SPA without a clear requirement.
7. Keep server-only secrets and private integrations out of browser code.
8. Use Astro's image tooling and responsive image practices where appropriate.
9. Use the framework's official routing, assets, and build conventions.
10. Check current Astro documentation through Context7 before framework-sensitive implementation.

Suggested project structure

Adapt to the existing repository; do not force this exact structure if the project already has a sound convention.

project/
├── public/
│   ├── favicon.svg
│   ├── images/
│   └── fonts/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── sections/
│   ├── layouts/
│   ├── pages/
│   ├── scripts/
│   ├── styles/
│   │   ├── global.css
│   │   └── tokens.css
│   └── content/
├── astro.config.mjs
├── package.json
├── DESIGN.md
├── PRODUCT.md
└── AGENCY.md

Astro scripts and navigation

If using Astro client-side navigation/view transitions, be aware that bundled module scripts generally execute once. Code that must run after each navigation should use the appropriate Astro lifecycle event, such as "astro:page-load", and must avoid attaching duplicate listeners.

Use Astro's view-transition features only when they improve navigation. Check current Astro documentation for the correct component/API and browser fallback behavior.

React islands

- Keep React islands small and isolated.
- Prefer static Astro output for content and layout.
- Choose hydration directives intentionally.
- Avoid hydrating a component that does not need browser interactivity.
- Ensure React components do not duplicate global navigation or state unnecessarily.

---

10. Motion and Interaction Standard

Motion should explain state, hierarchy, continuity, or feedback.

Motion hierarchy

1. Essential feedback: button press, form validation, menu open/close, loading state.
2. Navigation continuity: subtle page/section transitions.
3. Content reveal: restrained entrance for meaningful content.
4. Storytelling motion: scroll-linked sequences when the content benefits.
5. Decorative motion: optional, minimal, and never at the cost of usability.

Good motion practices

- Use short, coherent durations for common UI feedback.
- Use consistent easing.
- Animate transform and opacity where possible.
- Avoid large movement that makes users lose context.
- Do not delay access to important content for an animation.
- Do not make users wait through an intro animation on every visit.
- Avoid constant loops unless they communicate meaningful status.
- Support "prefers-reduced-motion: reduce".
- Make motion optional or simplified for reduced-motion users.
- Check mobile performance and battery impact.

Reduced-motion example

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

This is a broad fallback. For complex GSAP scenes, also configure the animation logic to skip or simplify motion based on the user's motion preference.

---

11. Tool Selection Matrix

Do not use every tool in every project.

Tool| Use it when| Do not use it when
Impeccable| Planning, critiquing, auditing, and refining UI| The skill is not installed or the task is unrelated
Awesome Design MD| A suitable visual reference can inform the project| The reference conflicts with the client's brand or brief
React Bits| A specific React component/effect is needed| A static Astro/CSS implementation is simpler
GSAP| Complex timeline, scroll, or SVG motion is justified| A simple CSS transition is enough
Context7| Library APIs, versions, setup, or configuration need verification| It is unavailable; then consult official docs manually

Refero and Firecrawl are optional research tools and are not required by this standard.

---

12. Reusable Master Instruction for the Coding Agent

When starting a new website project, provide this instruction:

«Read "AGENCY.md" completely before making changes. Treat it as the project's universal design and engineering standard.

First inspect the existing project and understand its framework, dependencies, routes, assets, business purpose, and current implementation. Do not start coding based on assumptions or replace working features.

Astro is the preferred primary framework for this workflow. Keep pages and content Astro-native wherever possible. Use React only for justified interactive islands, and use React Bits only when the selected component genuinely needs React. Use GSAP only for motion that cannot be implemented more simply with CSS or native browser APIs.

Use Impeccable commands when the skill is installed. Review Awesome Design MD for relevant inspiration, but create a project-specific design system rather than copying a brand. Use Context7 to verify current documentation and APIs for the exact installed versions.

Design must be original, business-specific, responsive, and maintainable. Do not impose a fixed color palette, theme, layout, or animation style. Follow the client's brand assets and requirements.

Preserve existing functionality and avoid unrelated refactors. Do not invent content or claim a tool was used when it was not available.

Before finishing, review the implementation for visual consistency, responsive behavior, and correct functionality. Provide a factual summary of what changed and any remaining limitations.»

---

13. Official References

Use these as the source of truth for installation, command syntax, APIs, and version-specific behavior. Documentation may change; verify before implementation.

- Impeccable: https://github.com/pbakaus/impeccable
- Awesome Design MD: https://github.com/VoltAgent/awesome-design-md
- React Bits: https://reactbits.dev/
- GSAP: https://gsap.com/docs/
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Context7: https://context7.com/
- Astro documentation: https://docs.astro.build/
- Astro React integration: https://docs.astro.build/en/guides/integrations-guide/react/
- Astro view transitions: https://docs.astro.build/en/guides/view-transitions/

---

Final Principle

Build the right website for this project—not the same website for every project.

This file defines the quality of the design and development process, not a fixed visual identity. Business context determines the design. Thoughtful UI, purposeful animation, and maintainable implementation determine the quality of the result.

