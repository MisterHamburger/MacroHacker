# Macro Hacker — Design System

## Aesthetic
SpaceX mission control meets fitness tracker. Dark, precise, technical. Numbers are the hero.
No warmth, no friendliness, no gradients. Data on black.

## Color Tokens
```
--bg-base:        #0a0a0a   ← page background
--bg-surface:     #111111   ← nav, input areas
--bg-elevated:    #1a1a1a   ← hover states, secondary surfaces
--bg-card:        #141414   ← cards, panels
--border:         #222222   ← standard borders
--border-subtle:  #1c1c1c   ← dividers, inner borders
--text-primary:   #f0f0f0   ← headings, values, primary content
--text-secondary: #cccccc   ← body text, descriptions
--text-muted:     #999999   ← labels, metadata, units
--accent:         #c8f135   ← lime — ONE accent color only, no others
--accent-dim:     rgba(200,241,53,0.12)
--accent-glow:    rgba(200,241,53,0.25)
--status-over:    #ff6b6b   ← over-limit only
```

## Typography
- **Bebas Neue** — macro numbers, large display values only
- **DM Sans 300/400/500** — all body copy, food names, chat messages, descriptions
- **DM Mono 400/500** — all labels, units, status text, metadata, dates

### Size scale
| Use | Font | Size | Weight | Case | Tracking |
|-----|------|------|--------|------|---------|
| Macro number | Bebas Neue | 32–80px | — | — | normal |
| Page title | DM Mono | 11px | 500 | UPPER | 0.15em |
| Section label | DM Mono | 9px | 400 | UPPER | 0.15em |
| Body / chat | DM Sans | 14px | 400 | — | normal |
| Label / unit | DM Mono | 10px | 400 | UPPER | 0.1em |
| Micro label | DM Mono | 9px | 400 | UPPER | 0.12em |

## Layout
- Mobile-first, max-width 480px centered
- Spacing in multiples of 8px only
- Bottom nav only — 3 items: Today / History / Settings
- Safe area insets respected on iOS (`env(safe-area-inset-*)`)

## Components

### Cards
- Border radius: `--r-lg` (20px) outer, `--r-md` (12px) inner, `--r-sm` (6px) smallest
- Background: `--bg-card`
- Border: 1px `--border-subtle`
- No drop shadows — depth from background layering only
- Padding: 20px

### Progress Bars
- Height: 3px — thin and precise, not chunky
- Track: `--border`
- Fill: `--accent` under target, `--status-over` over target
- No animation except `transition: width 300ms`

### Buttons
- Primary: `--accent` background, `--bg-base` text, DM Mono 10px UPPER
- Secondary: transparent, `--border` border, `--text-secondary` text
- No border-radius on ghost buttons in chat — use text links
- Disabled: opacity 0.4

### Chat Messages
- User messages: right-aligned, `--bg-elevated` background, `--r-md` radius, no tail
- AI messages: left-aligned, no background, text only — feels like a readout
- Timestamps: DM Mono 9px `--text-muted`, below message
- Action confirmations (food logged, workout logged): accent-dim background, accent border-left 2px

### Macro Summary Bar (top of Today)
- Always visible, compact — 48px tall max
- 4 values inline: CAL · PRO · FAT · CARB
- Values in Bebas Neue 24px, labels in DM Mono 8px
- Calories in `--accent`, others in `--text-primary`
- Over-limit switches to `--status-over`

### Input Area
- Background: `--bg-surface`
- Textarea: `--bg-elevated`, `--border`, no outline, 14px DM Sans
- Send/Mic/Cam buttons inline at bottom right

## Rules — Non-Negotiable
1. Dark only. No light mode. Background is always `--bg-base`.
2. One accent: `--accent` (#c8f135 lime). No blue, purple, teal, or gradients.
3. All macro numbers use Bebas Neue.
4. All labels use DM Mono, uppercase, letter-spacing ≥ 0.1em.
5. Progress bars are 3px. Never thicker.
6. Borders use `--border` or `--border-subtle`. Never white, never colored.
7. No drop shadows. Depth from background stacking only.
8. Bottom nav only. 3 items max.
9. Cards: 20px radius outer. Inner elements: 12px or 6px.
10. Primary buttons: accent color only. Secondary: ghost/outline.
11. Over-limit = `--status-over`. On-track = `--accent`.
12. Spacing in multiples of 8px.
13. No emojis in UI except as user input in chat.

## Feel
Mission control readout. Every number matters. Fast to read at a glance on a phone.
Not a wellness app. Not friendly. Precise, utilitarian, slightly cold.
SpaceX telemetry display if it tracked your macros.
