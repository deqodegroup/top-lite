# TOP Lite — Design Source of Truth

## Founder decision — 2026-09-26 (supersedes the conflicting rules below)
The Founder chose the **"Moana" ocean-black canvas with Apple Liquid Glass materials** and a living particle STORM orb, for the October Niue Language Week demo. Implemented in `src/styles/moana.css` (theme layer, loaded last) and `src/components/StormOrb.jsx` (WebGL, CSS orb kept as fallback).

Superseded by this decision:
- "White / near-white canvas" -> ocean-black `#0B0914` with purple/teal radial light.
- "No noisy particles" / "random particles" -> the STORM orb is a fine, deliberate particle sphere (7,500 points desktop, 2,600 mobile). Still no decorative particles elsewhere.
- "No neon glow" -> glow stays restrained; gold `#C9A84C` is the single accent, purple `#6B35A8` primary action, teal `#1BBFBF` listening.
- Typography: system stack for the interface; Cormorant Garamond only for the welcome headline.

Still in force: Apple Design Option, restrained Liquid Glass (heavy glass for structural surfaces, light glass for controls, never light-on-light), reduced-motion / reduced-transparency / high-contrast fallbacks, calm copy, STORM as the visual centrepiece.

The old light theme remains in `global.css` / `future.css`; reverting = remove the `moana.css` import in `src/main.jsx`.

## Selected design system
TOP Lite deliberately opts into the reusable Apple Design Option from `deqodegroup/dq-universal/skills/apple-design/SKILL.md`.

This is a product-specific design choice. Apple-inspired design is not universal DEQODE law; ICM is.

## Product feeling
TOP Lite should feel calm, premium, native, alive and culturally grounded. It must not look like a generic SaaS dashboard or AI landing page.

## Visual direction
- White / near-white canvas.
- Ocean/deep blue as the primary brand accent.
- Restrained Liquid Glass only where it adds hierarchy or tactility.
- Generous whitespace.
- Thin, refined TOP identity.
- STORM is the visual centrepiece.
- Pacific/ocean identity expressed through motion, light, rhythm and form rather than decorative clutter.
- Minimal navigation.
- Mobile-first composition.

## Layout hierarchy
1. Small TOP identity in the upper-left.
2. Quiet language/menu controls in the upper-right.
3. STORM centred as the primary visual anchor.
4. Minimal supporting copy only where useful.
5. Wide, premium conversational composer at the bottom.
6. Conversation content appears progressively without turning the interface into a card grid.

## STORM visual language
STORM should feel like a living ocean intelligence rather than a generic glowing ball.
- Layered translucent core.
- Fine concentric glass rings.
- Fluid internal currents.
- Soft ocean-blue depth.
- Very subtle resting breath.
- Clear state responses for listening, thinking and speaking.
- No neon cyberpunk glow.
- No noisy particles.
- No constant distracting animation.

## Liquid Glass rules
Use sparingly for:
- composer/input surface;
- small floating controls;
- language menu;
- contextual overlays.

Avoid:
- large glass dashboard cards;
- excessive blur everywhere;
- glass for purely decorative surfaces;
- gradients that overpower the content.

## Motion and interaction
Motion must communicate state or response.
Approved motion patterns:
- soft scale and opacity changes;
- subtle spring/settle interaction;
- STORM breathing at rest;
- stronger but controlled pulse while listening;
- slow internal current movement while thinking;
- responsive current movement while speaking;
- small hover/focus elevation on controls;
- composer focus light shift;
- reduced-motion support.

Avoid:
- heavy parallax;
- random particles;
- constant floating UI;
- spectacle-first transitions;
- animation that delays user input.

## Typography
Use the native/system stack where possible to preserve a refined device-native feel. Hierarchy should be strong but quiet. Avoid oversized marketing headlines dominating the interface.

## Copy tone
Short, calm and useful. TOP Lite is a language companion, not a marketing landing page.

## Accessibility
- Clear contrast.
- Keyboard focus states.
- Touch targets appropriate for mobile.
- `prefers-reduced-motion` respected.
- Voice/mic controls must remain understandable without animation.

## Design acceptance test
The build should pass these questions:
- Does STORM own the centre of the experience?
- Does the interface feel like a premium conversational product rather than a landing page?
- Is the glass treatment restrained?
- Is the ocean-blue palette elegant rather than neon?
- Is the mobile experience native-feeling and uncluttered?
- Can animation be removed without breaking usability?
