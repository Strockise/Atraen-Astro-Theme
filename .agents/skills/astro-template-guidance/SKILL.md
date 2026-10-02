---
name: astro-template-guidance
description: Use this skill whenever you need to understand how the Atraen template works, including adding new pages, managing content (Strapi or local JSON), configuring pages, using components, understanding project architecture, using scripts, or styling and theming. Use it for ANY question related to the structure, usage, and customization of the project template.
---

# Template Guidance

This skill acts as the unified handbook for the Atraen Astro template. It uses the progressive disclosure pattern to
keep context lean.

Depending on the user's specific request, **you MUST read the appropriate reference document** from the
`references/` directory (relative to this file) before proceeding.

## Routing Guide

Read the specific file in `references/` based on the user's request:

- **Adding a new page, route, or section:**
  Read: `references/adding-new-pages.md`

- **Using, modifying, or understanding UI components (e.g. BlogCard, PrimaryButton, SEO, FaqSection):**
  Read: `references/component-usage.md`

- **Adding, editing, or updating content (blog posts, services, FAQ, testimonials, Strapi, Strapi MCP):**
  Read: `references/content-management.md`

- **Configuring site settings, navigation, social links, or SEO (config.json, menu.json):**
  Read: `references/page-configuration.md`

- **Understanding the high-level codebase structure or data flow:**
  Read: `references/project-architecture.md`

- **Running npm scripts (dev, build, Strapi, seed):**
  Read: `references/script-usage.md`

- **Customizing styles, design tokens, animations, or the Webflow interaction runtime:**
  Read: `references/styling-and-theming.md`

- **Working with multi-language (i18n) features, translations, or localized routing:**
  Read: `references/i18n-guidance.md`

## Instructions

1. Identify the domain of the user's request.
2. Read the corresponding reference markdown file in `references/` relative to this skill.
3. Follow the instructions within that reference file.
4. Golden rule for every change: keep the existing class names and the `data-wf-*`, `data-w-*`, `top-delay-*`,
   `delay-02`, `scroll="scroll interaction"` attributes and `w-node-*` ids. Layout and animations depend on them.
