# SIGAP Design System & Philosophy

## Design Philosophy
The SIGAP (Sistem Informasi Gawat Darurat) platform is built on the philosophy of **"Information as a Lifeline."** In emergency and disaster preparedness contexts, the design prioritizes speed of comprehension and ease of use over decorative aesthetics. The visual direction is calm, official, and trustworthy, resembling a public service utility rather than a commercial product. It uses a clean, structured interface to reduce cognitive load during high-stress situations.

## Target Users
The system is specifically engineered for a diverse village population with varying levels of digital literacy:
- **Elderly People:** Requiring high contrast, large text, and intuitive navigation.
- **Villagers:** Needing straightforward, jargon-free information in their native language.
- **Fishermen & Farmers:** Users who may access the site outdoors under bright sunlight, requiring high-visibility UI.
- **Local Government Officers:** Who need a reliable tool to disseminate official information quickly.

## Design Principles
- **Simplicity:** Every element must serve a functional purpose. If it doesn't help the user understand the situation faster, it is removed.
- **Easy to Understand:** Uses universal symbols and clear Indonesian copy to ensure no ambiguity in critical alerts.
- **Mobile First:** Optimized for the primary device of the community (Android smartphones), ensuring a seamless experience on small screens.
- **Minimal Colors:** A restricted palette where color is reserved for status and meaning (e.g., Red for Danger, Green for Safe).
- **Accessible:** Adheres to high accessibility standards to ensure inclusivity for users with visual or motor impairments.
- **Clear Information Hierarchy:** The most critical status information (Kondisi Aman/Bahaya) is always at the top, followed by supporting data.

## Visual Style
- **Colors:** A foundation of Blue (Trust/Official) and White (Clarity). Alert colors (Green, Yellow, Orange, Red) follow official BMKG standards.
- **White Space:** Generous breathing room between components to prevent information density and help users focus on one section at a time.
- **Card Style:** Information is encapsulated in clean, white cards with subtle borders to define boundaries without adding visual noise.
- **Shadows:** Flat design with very soft, minimal elevation (if any) to keep the interface feeling grounded and lightweight.
- **Border Radius:** A consistent `8px` (ROUND_EIGHT) radius for a friendly yet professional appearance.
- **Icon Style:** Outline icons with a consistent stroke weight. Icons are used as functional signposts, never as mere decoration.

## Typography
- **Primary Font:** Inter (or similar clean Sans-Serif) for maximum legibility across all screen sizes.
- **Heading Hierarchy:** Bold, large headings (Headline-MD) for section titles to guide the user's eye during vertical scrolling.
- **Body Text:** Large base font size (Body-LG) to ensure readability for elderly users and those with vision impairment.
- **Priorities:** High contrast ratio between text and background is strictly maintained.

## Layout Principles
- **One-Page Website:** A single-page architecture where users simply scroll vertically. This eliminates the confusion of complex site maps.
- **Left Sidebar Navigation:** On desktop, a persistent sidebar provides instant jumping points to sections. On mobile, this collapses into a simple top-level menu.
- **Vertical Scrolling:** The primary interaction model, matching the natural behavior of mobile users.
- **Responsive Behavior:** A fluid transition from a multi-column grid on desktop to a single-stack layout on mobile.

## Component Style
- **Cards:** The primary container for all data points, using consistent padding and internal alignment.
- **Buttons:** Large, high-contrast touch targets with clear labels (e.g., "Lihat Semua Kontak").
- **Badges/Chips:** Used for status indicators (e.g., "NORMAL," "AMAN") with high-contrast color fills.
- **Status Panels:** Full-width hero banners at the top of the page that change color based on the village's current alert level.
- **Maps:** Simplified, high-contrast map embeds focusing on evacuation routes and assembly points.
- **Emergency Contacts:** Large, clickable cards that trigger direct calls on mobile devices.

## Accessibility
- **Large Touch Targets:** All interactive elements are sized for easy tapping, even for users with limited dexterity.
- **High Contrast:** Strict adherence to WCAG contrast ratios for all text and status-indicating colors.
- **Readable Typography:** Avoidance of light font weights or small sizes.
- **Minimal Animations:** No "fancy" transitions or distracting motion. Animations are used only for functional feedback or subtle atmospheric effects (e.g., pulsing "Aman" indicator).

## Responsive Design
- **Desktop:** Utilizes a fixed sidebar and a modular grid system to present multiple data points (Weather, Quake, Tsunami) simultaneously.
- **Mobile:** Elements are re-ordered into a priority-based vertical stack. The sidebar becomes a hamburger menu, and tables/grids are converted into simplified vertical lists.

## Do
- Use Bahasa Indonesia for all UI text.
- Maintain consistent padding within cards.
- Use official BMKG color coding for all alerts.
- Ensure all phone numbers are clickable `tel:` links.
- Place the most critical "Status Desa" at the absolute top of the page.

## Don't
- Do not use English terminology (e.g., use "Cuaca" instead of "Weather").
- Do not use decorative gradients or glassmorphism.
- Do not use small or light-colored fonts.
- Do not use complex multi-level navigation menus.
- Do not include "coming soon" features that clutter the interface during an actual emergency.

## Final Design Reference

The UI shown below is the official user interface design reference for SIGAP.

## Desktop Dashboard

![Desktop Dashboard](./assets/design/desktop-dashboard.png)

## Mobile Dashboard

![Mobile Dashboard](./assets/design/mobile-dashboard.png)

## Design System

![Design System](./assets/design/design-system.png)