---
name: HOBA LPG Design System
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0edea'
  surface-container-high: '#ebe8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#424751'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ec'
  outline: '#737783'
  outline-variant: '#c2c6d3'
  surface-tint: '#255dad'
  primary: '#00346f'
  on-primary: '#ffffff'
  primary-container: '#004a99'
  on-primary-container: '#9bbdff'
  inverse-primary: '#abc7ff'
  secondary: '#bb0013'
  on-secondary: '#ffffff'
  secondary-container: '#e71520'
  on-secondary-container: '#fffbff'
  tertiary: '#512d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#704100'
  on-tertiary-container: '#ffaa4c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#abc7ff'
  on-primary-fixed: '#001b3f'
  on-primary-fixed-variant: '#00458f'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000d'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86e'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Be Vietnam Pro
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  section-padding: 80px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The brand personality is authoritative, community-oriented, and mission-critical. As an industry association for Liquefied Petroleum Gas (LPG), the UI must balance industrial safety standards with professional networking.

The design style is **Corporate / Modern**. It utilizes a structured, clean aesthetic that prioritizes information hierarchy and legibility. The visual mood is one of stability and "Safety First," achieved through solid blocks of color, intentional whitespace, and a high-degree of organizational clarity. It avoids excessive decoration in favor of functional utility and professional trustworthiness.

## Colors
The color palette is derived directly from the HOBA LPG logo to ensure maximum brand recognition.

- **Primary Blue (#004A99):** Represents professionalism, industry depth, and the core identity. Used for headers, primary backgrounds, and main navigation elements.
- **Secondary Red (#ED1C24):** Symbolizes energy, action, and urgency. Used sparingly for critical alerts, safety warnings, and high-impact calls to action.
- **Tertiary Orange (#F39200):** Acts as a high-visibility accent color for primary "Register" or "Join" buttons, ensuring they stand out against the blue.
- **Neutral Palette:** Uses a deep charcoal (#1D1D1B) for body text to ensure high contrast against the light gray (#F8F9FA) backgrounds and white containers.

## Typography
**Be Vietnam Pro** is selected for its contemporary, professional feel and excellent legibility in the Vietnamese language. 

- **Headlines:** Use Bold (700) or SemiBold (600) weights. Primary section headers should use the Primary Blue to anchor the page.
- **Body Text:** Standardized at 16px for desktop to ensure comfort for long-form reading of legal documents or news updates.
- **Hierarchy:** Use tight letter spacing for large display text to maintain a modern, "compacted" look. Labels for categories (e.g., "News", "Legal") should be uppercase to distinguish them from body content.

## Layout & Spacing
The design system employs a **Fixed Grid** model for desktop, centered within a 1200px container to ensure readability across wide monitors.

- **Grid:** A 12-column system. Cards (News, Members) typically span 3 or 4 columns.
- **Spacing Rhythm:** Based on an 8px base unit. Section vertical padding is generous (80px) to allow the content to breathe and signify clear transitions between different types of information.
- **Mobile Adaptation:** Layout switches to a single-column flow with 16px side margins. Padding between sections is reduced to 48px to maintain momentum on smaller screens.

## Elevation & Depth
This design system uses **Tonal Layers** and **Low-contrast outlines** rather than heavy shadows.

- **Surface Tiers:** The main background is white or very light gray (#F8F9FA). Secondary information blocks use a subtle border (1px solid #E5E7EB) to define their boundaries.
- **Shadows:** Only used for interactive "floating" elements like dropdown menus or active cards on hover. These shadows are extremely soft: `0 4px 20px rgba(0, 0, 0, 0.05)`.
- **Depth through Color:** Depth is primarily communicated through the contrast between the dark Primary Blue header/footer and the light content area.

## Shapes
A **Soft (1)** roundedness level is applied. This creates a balance between the "sturdiness" required for an industrial association and the "modernity" of a digital-first platform.

- **Standard Elements:** Buttons, input fields, and tags use a 0.25rem (4px) radius.
- **Large Containers:** Content cards and image containers use 0.5rem (8px).
- **Interactive States:** Hovering over a card may subtly increase the perceived "lift" but does not change the radius.

## Components
- **Buttons:** 
  - *Primary:* Tertiary Orange background with white text, bold weight. 
  - *Secondary:* Primary Blue outline with blue text.
  - *Ghost:* Clear background with Primary Blue text for navigation.
- **Header:** Sticky positioning. Features the logo on the left, horizontal navigation in the center, and contact info + "Join" button on the right.
- **Cards:** White background with 1px light gray border. News cards include a fixed-aspect-ratio image, date label, and a "View detail" link with a small arrow icon.
- **Inputs:** 48px height for better accessibility. Uses a light gray stroke that turns Primary Blue on focus.
- **Member Directory:** A dedicated grid component for member logos, using grayscale by default and switching to full color on hover to maintain visual harmony.
- **Footer:** Multi-column layout on Primary Blue. Contains association overview, quick links, contact details with icons, and social media links.