# Project Context: Dark Knight Agency

This document tracks the current progress, architectural decisions, and next steps for the **Dark Knight Agency** project.

---

## 🚀 Overview & Repositioning
The project goal is to reposition **Dark Knight Agency** from a pure web design agency to a premium **Website + AI Automation Studio** serving both local SMBs and enterprise clients. 

The core philosophy has shifted to: **"We Don't Just Build Websites. We Build Systems That Grow Your Business."**

---

## 🛠️ Work Done So Far

### 1. Brand Copy & Typography Update
- **Hero & Taglines:** Updated the home page's text copy to introduce the hybrid focus on web development and automated business workflows.
- **Marquee Ticker:** Injected tech integrations relevant to modern automations (e.g., `n8n`, `Make.com`, `OpenAI`, `Zapier`, `Supabase`, `Next.js`, `Framer`).
- **Results Stats:** Adjusted labels to highlight automation metrics:
  - *Workflows Automated*
  - *Leads Generated*
  - *Hours Saved*
  - *Client Growth*

### 2. Services Reframing (6 New Pillars)
Replaced the original services with 6 modern pillars in [index.html](file:///Users/namansoni/Downloads/DK%20agency/Dark-Knight-Agency/index.html):
1. **Portfolio & Landing Pages:** High-converting single-page sites.
2. **Business Growth Sites:** 3–7 page SEO-optimized lead machines.
3. **AI Chatbot & Lead Automation:** WhatsApp, Instagram, and web-based bots.
4. **Social Media Automation:** Automated DMs, posting schedules, and engagement.
5. **Full-Stack Web Apps:** Dashboards, SaaS, and custom backends.
6. **Enterprise AI Systems:** Multi-workflow AI agents, CRM integration, voice bots, and RAG.

### 3. Expanded Pricing Tiers (4 Tiers ➔ 5 Tiers)
Expanded the pricing framework to 5 distinct packages to match the new positioning:
*   **Tier 01: Spark (₹8K–₹25K)** — Portfolio or landing sites. Color: `--green`.
*   **Tier 02: Growth (₹25K–₹60K)** — 3–7 page business/agency sites. Color: `--blue`.
*   **Tier 03: Automate (₹30K–₹75K setup)** — AI chatbots and social media automation. Color: `--purple`.
*   **Tier 04: Scale (₹1.5L–₹5L)** — Full-stack SaaS or web apps. Color: `--red`.
*   **Tier 05: Enterprise (₹5L–₹25L+)** — Enterprise AI systems + custom web platforms. Color: `--gold` (New).

### 4. Technical Implementations
- **New Gold Design Tokens:** Added gold accent variables inside [css/variables.css](file:///Users/namansoni/Downloads/DK%20agency/Dark-Knight-Agency/css/variables.css):
  ```css
  --gold:        #ffb830;
  --gold-mid:    #cc8e1a;
  --gold-dim:    rgba(255,184,48,0.08);
  --gold-glow:   rgba(255,184,48,0.15);
  --gold-border: rgba(255,184,48,0.25);
  ```
- **Active Tab Styling:** Defined `.pricing-tab.active-gold` in [css/main.css](file:///Users/namansoni/Downloads/DK%20agency/Dark-Knight-Agency/css/main.css) to support styling for the fifth tab.
- **Tab Controller Logic:** Updated [js/pricing.js](file:///Users/namansoni/Downloads/DK%20agency/Dark-Knight-Agency/js/pricing.js) to support the 5th key (`enterprise: 'active-gold'`) and handle active state resets.

---

## 📋 What Needs to Be Added / Modified Next

### 1. Update the Repository `README.md`
- The project [README.md](file:///Users/namansoni/Downloads/DK%20agency/Dark-Knight-Agency/README.md) still mentions the old 4 pricing tiers (Launch Presence, Scale Machine, Authority Engine, Elite Full Arsenal) and old prices (starting at ₹5K). It must be updated to align with the new 5-tier pricing and services.

### 2. Mobile Layout & UX Check
- **Pricing Tabs:** With 5 tabs instead of 4, check that the navigation bar wraps or scrolls horizontally correctly on smaller mobile devices without breaking layouts.
- **Scroll reveal alignment:** Double-check that none of the animation wrappers in [css/animations.css](file:///Users/namansoni/Downloads/DK%20agency/Dark-Knight-Agency/css/animations.css) interfere with the new layout height.

### 3. Contact Form / Automation Pipeline
- Currently, the CTAs open direct WhatsApp links (`https://wa.me/...`) with preset message templates.
- **Enhancement:** Consider adding an interactive lead intake form or integrating a webhook connecting to `n8n` or `Make.com` to demonstrate the agency's automation capabilities right on the site.

### 4. Service Detail Modals/Breakouts
- Since AI automation can be abstract for clients, adding micro-modals or interactive hover tooltips explaining the deliverables (e.g. *What is a RAG database?*, *How does the Instagram auto-DM work?*) can help conversion rates.

### 5. Deployment Setup
- Configure and test static site deployment on Netlify or Vercel, ensuring all CSS, JS, and image assets load quickly and cache properly.
