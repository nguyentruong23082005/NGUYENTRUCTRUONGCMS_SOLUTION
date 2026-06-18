# Design System Inspired by Phúc Long Coffee & Tea

## 1. Visual Theme & Atmosphere

Phúc Long's design system embodies a premium yet approachable coffee and tea experience rooted in Vietnamese heritage and natural elegance. The visual identity balances rich, earthy tones with clean minimalist layouts, evoking both traditional craftsmanship and modern café culture. Warm neutrals and forest greens create a sense of trust and natural authenticity, while subtle shadows and generous whitespace maintain a contemporary, breathable aesthetic. The design prioritizes product showcase through high-quality imagery, complemented by restrained typography and intuitive interactions that guide users through a seamless browsing and purchasing journey.

**Key Characteristics**
- Natural color palette anchored by forest green and warm neutrals
- Premium product-focused layouts with abundant whitespace
- Clean, accessible typography with strong hierarchy
- Subtle depth and shadows for refined elevation
- Vietnamese language integration throughout interface
- Product cards as primary content containers
- Warm beige/cream accent backgrounds for featured sections
- Emphasis on photography and visual storytelling

## 2. Color Palette & Roles

### Primary
- **Forest Green** (`#006F3C`): Primary action buttons, key UI elements, brand accent color; most frequently used across the system
- **Deep Forest Green** (`#0C713D`): Secondary green for hover states and alternative primary elements; subtle variation for depth

### Interactive
- **Bright Blue** (`#007AFF`): External links and secondary interactive states; rare accent for standout CTAs
- **Error Red** (`#B71C1C`): Error states, warnings, and critical feedback messages

### Neutral Scale
- **Dark Charcoal** (`#333333`): Primary text color; most prevalent neutral for body copy, labels, and general content
- **True Black** (`#000000`): High-contrast text, emphasis text, and strong visual hierarchy
- **Medium Gray** (`#666666`): Secondary text, disabled states, and de-emphasized content
- **Light Gray** (`#9B9B9B`): Tertiary text, captions, helper text, and subtle UI elements
- **Very Light Gray** (`#CCCCCC`): Subtle borders and very light background tints

### Surface & Borders
- **Off-White** (`#FFFFFF`): Primary surface color for cards and containers
- **Pale Gray-Blue** (`#ECEFF1`): Light background surfaces, secondary container fills, and subtle section backgrounds
- **Very Dark Gray** (`#171717`): Deep background for high-contrast sections or overlays

## 3. Typography Rules

### Font Family
**Primary Font:** Arimo (sans-serif) — primary typeface for all UI, headings, and body copy
- Fallback stack: `Arimo, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

**Secondary Font:** Roboto (sans-serif) — form labels and specialized input styling
- Fallback stack: `Roboto, "Helvetica Neue", Arial, sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display/Hero | Arimo | 32px | 700 | 48px | 0px | Large promotional headings and hero text |
| Heading 1 | Arimo | 28px | 700 | 42px | 0px | Page section titles |
| Heading 2 | Arimo | 24px | 600 | 36px | 0px | Subsection headings, "BEST SELLERS" title |
| Heading 3 | Arimo | 20px | 600 | 30px | 0px | Card titles and medium headings |
| Heading 5 | Arimo | 16px | 400 | 24px | 0px | Section subtitles and medium-weight labels |
| Body | Arimo | 14px | 400 | 21px | 0px | Primary body text, product descriptions |
| Button | Arimo | 14px | 400 | normal | 0px | Button labels and call-to-action text |
| Link | Arimo | 13px | 500 | 19.5px | 0px | Navigation links and inline hyperlinks |
| Caption | Arimo | 12px | 400 | 18px | 0px | Fine print, dates, view counts |
| Input Label | Roboto | 14px | 400 | 20.125px | 0px | Form field labels and input helper text |

### Principles
- Maintain strong visual hierarchy through size and weight differentiation
- Use weight 400 for body content to ensure readability at smaller sizes
- Reserve weight 700 for primary headings and emphatic elements
- Line heights increase with font size to maintain optical proportionality
- Use 13–14px for interactive elements to ensure adequate touch target context
- Keep letter spacing at 0 for clean, modern appearance unless special emphasis needed

## 4. Component Stylings

### Buttons

#### Primary Button (CTA)
- **Background:** `#006F3C`
- **Text Color:** `#FFFFFF`
- **Font:** Arimo, 14px, weight 400
- **Padding:** `12px 24px`
- **Border Radius:** `4px`
- **Border:** None
- **Box Shadow:** None
- **Height:** 40px (minimum touch target)
- **Hover State:** Background `#0C713D`, slight darkening
- **Active State:** Background `#005230`
- **Disabled State:** Background `#CCCCCC`, text `#9B9B9B`

#### Secondary Button
- **Background:** `#ECEFF1`
- **Text Color:** `#333333`
- **Font:** Arimo, 14px, weight 400
- **Padding:** `12px 24px`
- **Border Radius:** `100px`
- **Border:** None
- **Box Shadow:** None
- **Height:** 40px
- **Hover State:** Background `#D6DEE3`, text `#171717`
- **Active State:** Background `#BCCDD5`

#### Ghost/Tertiary Button
- **Background:** `transparent`
- **Text Color:** `#333333`
- **Font:** Arimo, 13px, weight 400
- **Padding:** `8px 16px`
- **Border Radius:** `0px`
- **Border:** `1px solid #9B9B9B`
- **Box Shadow:** None
- **Hover State:** Border `#333333`, text `#171717`

#### Icon Button (Circular)
- **Background:** `#FFFFFF`
- **Text/Icon Color:** `#333333`
- **Width & Height:** 12px minimum (scale for context)
- **Border Radius:** `50%`
- **Border:** `2px solid #808080`
- **Box Shadow:** None
- **Hover State:** Background `#ECEFF1`, border `#006F3C`

### Cards & Containers

#### Product Card (Standard)
- **Background:** `#FFFFFF`
- **Text Color:** `#333333`
- **Font:** Arimo, 14px, weight 400
- **Padding:** `0px` (image flush to edges)
- **Border Radius:** `8px`
- **Border:** `1px solid #ECEFF1`
- **Box Shadow:** None
- **Width:** 230px (responsive)
- **Height:** 298px
- **Interior Sections:** Image area 180px, title/price/button area 118px

#### Product Card — Image Container
- **Background:** `#ECEFF1`
- **Border Radius:** `8px 8px 0px 0px`
- **Height:** 180px
- **Width:** 100%
- **Object Fit:** `cover`

#### Product Card — Content Area
- **Padding:** `16px`
- **Background:** `#FFFFFF`
- **Border Radius:** `0px 0px 8px 8px`

#### Product Card — Price & Badge
- **Price Font:** Arimo, 14px, weight 700, color `#006F3C`
- **Badge Background:** `#B71C1C`
- **Badge Text:** `#FFFFFF`, Arimo, 12px, weight 600
- **Badge Padding:** `6px 12px`
- **Badge Border Radius:** `2px`

#### Promo/Campaign Card (Transparent)
- **Background:** `transparent`
- **Text Color:** `#333333`
- **Border Radius:** `0px`
- **Border:** None
- **Box Shadow:** None
- **Typical Height:** 180px

#### Featured Section Container
- **Background:** `#ECEFF1`
- **Padding:** `48px 40px`
- **Border Radius:** `0px`
- **Border:** None
- **Box Shadow:** None

### Inputs & Forms

#### Text Input (Default)
- **Background:** `#FAFAFA`
- **Text Color:** `rgba(0, 0, 0, 0.87)`
- **Font:** Roboto, 14px, weight 400
- **Padding:** `7.5px 6px`
- **Border Radius:** `0px`
- **Border:** `1px solid #E0E0E0`
- **Box Shadow:** None
- **Height:** 20.125px (content height; adjust with padding for total)
- **Placeholder Color:** `rgba(0, 0, 0, 0.38)`
- **Focus State:** Border `#006F3C`, box-shadow `inset 0 0 0 1px #006F3C`

#### Text Input (With Label)
- **Label Font:** Roboto, 14px, weight 400, color `#333333`
- **Label Margin Bottom:** `8px`

#### Search Input (Header)
- **Background:** `#ECEFF1`
- **Text Color:** `#333333`
- **Font:** Arimo, 14px, weight 400
- **Padding:** `10px 16px`
- **Border Radius:** `24px`
- **Border:** None
- **Placeholder Color:** `#9B9B9B`
- **Height:** 40px
- **Width:** 350px (responsive)

#### Form Field Container
- **Margin Bottom:** `16px`
- **Display:** `flex`, flex-direction `column`

### Navigation

#### Primary Navigation Bar
- **Background:** `#FFFFFF`
- **Height:** 64px
- **Border Bottom:** `1px solid #ECEFF1`
- **Padding:** `0px 40px`
- **Display:** `flex`, align-items `center`, justify-content `space-between`

#### Navigation Link (Inactive)
- **Font:** Arimo, 13px, weight 500, color `#666666`
- **Padding:** `10px 16px`
- **Text Decoration:** None
- **Transition:** `color 0.2s ease`

#### Navigation Link (Active)
- **Font:** Arimo, 13px, weight 700, color `#006F3C`
- **Border Bottom:** `2px solid #006F3C`

#### Navigation Link (Hover)
- **Color:** `#0C713D`
- **Transition:** `color 0.2s ease`

#### Breadcrumb
- **Font:** Arimo, 12px, weight 400, color `#9B9B9B`
- **Separator:** `/`, padding `0px 6px`
- **Active Item Color:** `#333333`

### Badges

#### "Best Seller" Badge
- **Background:** `#B71C1C`
- **Text Color:** `#FFFFFF`
- **Font:** Arimo, 12px, weight 600
- **Padding:** `6px 12px`
- **Border Radius:** `2px`
- **Text Transform:** `uppercase`

#### Status Badge
- **Default Background:** `#ECEFF1`
- **Default Text:** `#333333`
- **Font:** Arimo, 12px, weight 500
- **Padding:** `4px 10px`
- **Border Radius:** `12px`

## 5. Layout Principles

### Spacing System
**Base Unit:** 4px

**Scale:**
- `4px` — Micro spacing (icon gaps, tight component padding)
- `8px` — Extra small spacing (inline spacing, tight margins)
- `12px` — Small spacing (component internal padding)
- `16px` — Standard padding (card padding, section internal spacing)
- `20px` — Medium spacing (section margins)
- `24px` — Large spacing (major section separators)
- `28px` — Extra large spacing
- `32px` — Large margin between sections
- `40px` — Extra large section spacing (hero padding)
- `48px` — Major section top/bottom spacing
- `52px` — Extra major spacing
- `64px` — Hero and full-width section padding

**Usage Context:**
- Button padding: `12px 24px` or `10px 16px`
- Card padding: `16px`
- Section padding: `48px 40px`
- Margins between sections: `32px – 64px`
- Container padding: `40px`

### Grid & Container
- **Max Container Width:** 1280px
- **Standard Padding:** `40px` on left/right at full width
- **Column Strategy:** 5-column responsive grid for product cards (5 cards on desktop → 3 on tablet → 1 on mobile)
- **Card Spacing:** 16px gap between cards (consistent margin-right and margin-bottom)
- **Hero Section:** Full width, 1280px max-width centered, 64px padding top/bottom
- **Featured Section:** Full width background color, centered content at max-width

### Whitespace Philosophy
Generous whitespace creates a premium, breathing aesthetic. Margins between major content blocks (48–64px) provide visual separation and reading comfort. Card-based layouts with 16px gutters maintain organization without clutter. Empty space around CTAs and product images draws focus naturally.

### Border Radius Scale
- **`0px`:** Flat, structural elements (navigation, inputs, large containers)
- **`2px`:** Subtle, small badges and minor UI elements
- **`4px`:** Standard buttons and interactive components
- **`8px`:** Product cards and medium containers
- **`12px`:** Rounded badge shapes and soft buttons
- **`24px`:** Search inputs and highly rounded secondary buttons
- **`50%`:** Circular icon buttons and avatar containers
- **`100px`:** Pill-shaped secondary buttons

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Base (Level 0) | None | Main surfaces, cards, standard container backgrounds |
| Elevation 1 | `rgba(204, 204, 204, 0.3) 0px 2px 4px 0px` | Subtle lift for interactive elements on hover |
| Elevation 2 | `rgba(0, 0, 0, 0.12) 0px 2px 8px 0px` | Dropdown menus and floating elements |
| Modal/High | `rgba(0, 0, 0, 0.16) 0px 21px 36px 0px` | Modal dialogs, lightboxes, and prominent overlays |

**Shadow Philosophy:** Shadows are used minimally to maintain a clean, contemporary aesthetic. Subtle elevation appears only on interactive elements requiring clear distinction from background surfaces. Modal shadows are pronounced but not harsh, ensuring clear visual hierarchy without overwhelming the interface. Shadows use dark overlay with moderate opacity (12–16%) to preserve legibility and maintain the refined brand character.

## 7. Do's and Don'ts

### Do
- Use **`#006F3C`** as the primary action color for all CTAs and key interactive elements
- Maintain **40px minimum touch targets** for all interactive components
- Apply **strong typography hierarchy** via size and weight; avoid relying on color alone for meaning
- Center content at **1280px max-width** with **40px side padding** for desktop layouts
- Use **generous whitespace** (32–64px) between major content sections
- Leverage **product imagery** as the primary content focus; keep UI minimal and supportive
- Adopt **`#ECEFF1` background** for featured/promotional sections to create visual distinction
- Keep **buttons at 40px height** minimum; use padding to accommodate small text
- Apply **`8px border-radius`** consistently to product cards and larger containers
- Use **Arimo font family** exclusively for all UI text; Roboto reserved for form labels only
- Implement **hover states** with slight color darkening or subtle elevation
- Use **`#B71C1C`** exclusively for error, warning, and "Best Seller" badges

### Don't
- Don't use colors outside the defined palette; maintain strict adherence to the 12 extracted colors
- Don't create touch targets smaller than **40px height and 44px width** for buttons
- Don't apply shadows to standard card or container surfaces; reserve shadows for elevation only
- Don't exceed **two font families**; never introduce serif or display fonts
- Don't use `text-shadow` for text rendering; rely on color contrast and weight
- Don't create custom border-radius values; stick to the defined scale (0, 2, 4, 8, 12, 24, 50%, 100px)
- Don't apply excessive padding inside small components; use the precise values defined
- Don't use `letter-spacing` values; maintain 0 for all text except special hero or display treatments
- Don't reduce line height below 1.4x font size; maintain generous vertical spacing for readability
- Don't mix hover state behaviors; use only color shifts, elevation, or border changes—not all three
- Don't display more than **5 product cards** per row on desktop; maintain responsive grid discipline
- Don't use background colors other than `#FFFFFF`, `#ECEFF1`, or `#171717` for main surfaces

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Key Changes |
|-----------------|-------|-------------|
| Desktop | 1280px+ | 5-column product grid, full navigation, 40px side padding |
| Tablet | 768px – 1279px | 3-column product grid, condensed navigation, 24px side padding |
| Mobile | 320px – 767px | 1-column product grid, hamburger navigation, 16px side padding, stacked layout |

### Touch Targets
- **Minimum Size:** 44px × 44px for interactive elements (buttons, links)
- **Recommended Size:** 48px × 48px for primary actions
- **Safe Spacing:** 8px minimum gap between adjacent interactive elements
- **Button Height:** 40px standard; increase to 48px on mobile for primary CTAs
- **Link Padding:** 10px vertical, 16px horizontal minimum

### Collapsing Strategy
- **Hero Section:** Full height on desktop (400–500px) → reduced height on tablet (300px) → stacked/minimal on mobile (200px)
- **Product Cards:** 5 columns → 3 columns → 1 column (full width minus padding)
- **Navigation:** Horizontal menu → hamburger menu below 768px
- **Padding:** 40px → 24px → 16px (left/right)
- **Font Sizes:** Reduce heading sizes by 2–4px on mobile (e.g., 24px → 20px)
- **Section Spacing:** Reduce margins from 48–64px → 32px → 16px as viewport shrinks
- **Search Bar:** Full width on mobile, maintain responsive input sizing
- **Image Containers:** Maintain aspect ratio; scale proportionally with container width

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA:** Forest Green (`#006F3C`) — all primary action buttons
- **Secondary CTA:** Deep Forest Green (`#0C713D`) — hover states and alternatives
- **Text (Primary):** Dark Charcoal (`#333333`) — body copy and default text
- **Text (Emphasis):** True Black (`#000000`) — headings and strong emphasis
- **Text (Secondary):** Medium Gray (`#666666`) — labels and reduced prominence
- **Text (Tertiary):** Light Gray (`#9B9B9B`) — captions and helpers
- **Background (Default):** Off-White (`#FFFFFF`) — cards and standard surfaces
- **Background (Accent):** Pale Gray-Blue (`#ECEFF1`) — featured sections and light surfaces
- **Background (Deep):** Very Dark Gray (`#171717`) — dark overlays
- **Error/Badge:** Error Red (`#B71C1C`) — warnings and special badges
- **Border/Divider:** Very Light Gray (`#CCCCCC`) — subtle lines
- **Accent Link:** Bright Blue (`#007AFF`) — external/secondary links

### Iteration Guide

1. **Always use `#006F3C`** for primary buttons, CTAs, and key brand elements; it is the most-used color (134 instances) and defines the brand identity.

2. **Enforce 40px minimum height** on all interactive components (buttons, inputs, icon targets) to meet touch accessibility standards; adjust padding but never reduce height below this threshold.

3. **Apply `#ECEFF1` background only** to featured promotional sections, light container backgrounds, and secondary surfaces; never use for primary content containers.

4. **Use Arimo font exclusively** for all UI, headings, and body text; Roboto is reserved only for form labels (`<label>` elements).

5. **Maintain 8px border-radius on product cards** and large containers; use 4px for buttons and 0px for structural/navigation elements; vary based on component type defined.

6. **Group spacing in multiples of 4px**: valid values are 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 52, 64px; never use arbitrary values outside this scale.

7. **Set container max-width to 1280px** with 40px left/right padding on desktop; reduce padding to 24px on tablet (768–1279px) and 16px on mobile (below 768px).

8. **Implement 5-column product grid** on desktop using equal-width cards with 16px gap; collapse to 3 columns on tablet and 1 column on mobile.

9. **Apply shadow only to elevated/interactive elements**: use `rgba(204, 204, 204, 0.3) 0px 2px 4px 0px` for subtle hover lift, `rgba(0, 0, 0, 0.12) 0px 2px 8px 0px` for dropdowns, and `rgba(0, 0, 0, 0.16) 0px 21px 36px 0px` for modals; never shadow base surfaces.

10. **Reserve `#B71C1C`** exclusively for error states and "Best Seller" badges; use uppercase text styling with white foreground on this red background.

11. **Line height must be 1.4x to 1.6x font size** for body text (14px → 21px = 1.5x); maintain this ratio for all typography to ensure readability and premium aesthetic.

12. **Keep button padding at `12px 24px` standard**; adjust internal font size (13–14px) instead of padding to maintain visual proportion and touch targets.