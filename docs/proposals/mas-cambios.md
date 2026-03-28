🎫 Implementation Ticket: Aires de Río Website Refinement & Optimization

Meeting Date: March 17, 2026
Project: Aires de Río - Real Estate Development Website
Status: In Progress
Priority: High

📋 Executive Summary

This comprehensive implementation document outlines all technical, design, and content changes discussed during the website review meeting for Aires de Río, a residential development project in Santiago del Estero. The document covers image optimization, navigation restructuring, map functionality improvements, photo gallery curation, content refinement, and mobile responsiveness fixes.

🎯 Project Overview

Project Name: Aires de Río Departamentos
Location: Avenida Rivadavia 25 Este, Santiago del Estero
Website Focus: Residential apartment sales and marketing
Key Stakeholders: Sebastian Ferreyra Pons (Developer), Ana Ferreyra Pons (Content/Design Lead)

🔧 Technical Implementation Tasks
1. Image Optimization & Performance

Owner: Sebastian Ferreyra Pons
Priority: High
Status: In Progress

1.1 Image Compression & Loading
Task: Optimize all images for faster loading across desktop and mobile devices
Current Issue: Video content stutters on initial page load; images take too long to render
Solution: Implement progressive image loading with compression algorithms
Details:
Compress all gallery images without quality loss
Implement lazy loading for below-the-fold images
Set up image caching mechanisms
Test load times on mobile networks (3G/4G)
Acceptance Criteria: Page loads in under 3 seconds on mobile; video plays smoothly without stuttering
Reference: 03:18
1.2 Video Loading Strategy
Task: Resolve video stuttering on page load
Options:
Option A: Compress video further
Option B: Delay video autoplay until page fully loads
Option C: Show static image first (building front), then transition to video after 3 seconds
Recommendation: Implement Option C - show building front photo for 3 seconds before video plays
Benefit: Allows page to load completely while providing visual content immediately
Reference: 36:32
2. Dark Mode Implementation & Color Palette

Owner: Sebastian Ferreyra Pons
Priority: High
Status: Needs Revision

2.1 Dark Mode Bug Fixes
Issue: Dark mode displays rendering errors with red line artifacts at top of page
Current Problem: Menu doesn't display properly in dark mode; colors appear washed out/grayed
Solution Required:
Debug CSS color inheritance in dark mode
Ensure all text maintains proper contrast in both light and dark modes
Fix menu visibility issues
Verify icon colors don't appear gray in dark mode
Testing: Test on multiple devices and browsers
Reference: 01:41:41
2.2 Color Palette Selection
Current Palette Issues: Elephant blue and burgundy colors lack freshness; not cohesive
Requirements:
Select colors that are accessible and provide good contrast
Ensure colors support readability and visual hierarchy
Colors should feel modern and inviting
Black background needed for accessibility
Preferred Accent Color: Cyan/light blue (used in "Contact Us" button) - most attractive option
Action: Allow Ana Ferreyra Pons to propose alternative color schemes
Reference: 05:42
3. Navigation & Menu Structure

Owner: Sebastian Ferreyra Pons
Priority: High
Status: Needs Update

3.1 Navigation Link Updates
Current Issue: Navigation links don't match section names; inconsistent naming
Required Changes:
Update footer navigation links to match section headings exactly
Change "Proyectos" to "Ubicación"
Change "Equipamiento" to "Equipamiento e Interiores"
Verify "Interiores" link points to correct section
Remove duplicate "Equipamiento" link
Keep: "Ubicación," "Interiores," "Planos y Distribución," "Contacto"
Acceptance Criteria: All navigation links point to correct sections with matching names
Reference: 01:32:03
3.2 Section Naming Consistency
Task: Ensure all section titles match navigation menu items
Sections to Verify:
Location/Ubicación
Equipment & Interior Design/Equipamiento e Interiores
Floor Plans/Planos y Distribución
Contact/Contacto
Reference: 01:33:13
4. Map Functionality & Interactivity

Owner: Sebastian Ferreyra Pons
Priority: High
Status: In Progress

4.1 Map Zoom & Pan Controls
Current Issue: Map doesn't allow user interaction; limited visibility of surrounding areas
Requirements:
Enable map dragging with mouse/touch
Implement zoom functionality (shift+drag or scroll wheel)
Show 10% more radius than currently visible
Allow users to see surrounding locations and context
Technical Details:
Current visible area: 80 pixels horizontal
Photo dimensions: 100 pixels horizontal
Allow 20-pixel pan in both directions (left/right)
Acceptance Criteria: Users can drag map and see additional 10% of surrounding area
Reference: 22:05
4.2 Map Pin & Label Positioning
Current Issue: Pin labels appear inconsistently; sometimes below, sometimes to the side
Solution: Implement consistent label positioning algorithm
Primary Rule: Always place labels above pins (except for Aires de Río building)
Exception: Aires de Río label can remain in current position
Algorithm: Include label dimensions in boundary calculations
Gallery Icon: Add small gallery/photo icon below location name (inside label box)
Icon Style: Use small, unobtrusive icon (not large poker-card style)
Reference: 50:36
4.3 Map Visibility & Coverage
Issue: Parque Aguirre (Park Aguirre) is nearly invisible on map; 90% of users won't notice it
Solution: Expand map view to show more of surrounding area
Current Limitation: Stadium Único appears above but requires arrow navigation to reach
Recommendation: Increase visible radius to include more landmarks
Reference: 33:03
5. Form & Contact Functionality

Owner: Sebastian Ferreyra Pons
Priority: Medium
Status: Needs Revision

5.1 Form Submission Feedback
Current Issue: Form submission message disappears without confirmation; no clear feedback
Requirements:
Show immediate "Sending..." message when user submits
Display "Sent successfully" confirmation message
Use fixed popup notification (not disappearing text)
Message should appear quickly and remain visible
No need to wait for email server confirmation
User Experience: User needs to know button was clicked and form is processing
Implementation:
Show "Formulario enviado correctamente" (Form sent successfully)
Add instruction: "Revisa tu correo electrónico para descargar el archivo" (Check your email to download the file)
Use popup notification style (not inline text)
Error Handling: If email fails, retry automatically every 5 minutes without user intervention
Reference: 01:08:02
5.2 Email Template Updates
Task: Update confirmation email text
Current Issues:
Remove: "Este enlace es válido por 24 horas y puede usarse una sola vez" (This link is valid for 24 hours and can be used once)
Remove: "Si tienes una consulta no deben responder este correo" (Don't reply to this email)
Update signature line
New Email Signature:
Change from: "Saludos equipos aires de Río"
Change to: "Aires de Río - Departamentos de uno y dos habitaciones en Santiago del Estero"
Or: "Aires de Río - Departamentos de 1, 2 habitaciones y estudios"
Reference: 01:58:49
5.3 Technical Spec Sheet Download
Task: Generate PDF technical specification sheet
Format: Match website design and styling
Content: Include all project details, floor plans, amenities, specifications
Delivery: Email PDF to user after form submission
Status: Currently being prepared by Sebastian
Reference: 02:00:14
6. Scroll & Layout Responsiveness

Owner: Sebastian Ferreyra Pons
Priority: High
Status: Needs Revision

6.1 Scroll Anchor/Jump Issues
Current Problem: When clicking section links, page jumps violently; user loses context
Solution: Implement smooth scroll anchoring
When section expands/collapses, anchor to that section
Prevent violent scroll jumps
Maintain user position context
Technical Approach: Use CSS scroll-behavior: smooth and JavaScript anchor positioning
Reference: 27:40
6.2 Mobile Responsiveness - Layout Width
Current Issue: Content blocks too narrow on mobile; excessive side margins
Requirements:
Increase block width to fill more of screen width
Reduce side margins on mobile devices
Ensure content is readable without excessive whitespace
Test on various mobile screen sizes
Reference: 56:55
6.3 Form Centering Issues
Current Problem: Form content shifts off-center after submission; text appears outside margins
Cause: Form expansion causes document width to expand, breaking layout
Solution:
Prevent form expansion from affecting page width
Keep all content centered
Ensure form doesn't create horizontal scrollbar
Reference: 56:34
6.4 Trigger Animation Timing
Current Issue: Text reveal animations trigger too late; user must scroll far to see content
Problem: Trigger point is too low; content appears after user has scrolled past it
Solution: Adjust trigger point to activate earlier in scroll sequence
Acceptance Criteria: Content appears when user first scrolls to section, not after
Reference: 46:47
🖼️ Content & Design Tasks
7. Photo Gallery Curation & Management

Owner: Ana Ferreyra Pons (Direction), Sebastian Ferreyra Pons (Implementation)
Priority: High
Status: In Progress

7.1 Plaza Vea (Shopping Center) Gallery
Current State: 15 photos (excessive)
Target: Reduce to 5-7 best photos
Photos to Keep:
Photo 1: Keep
Photo 2: Keep
Photo 3: Keep
Photo 4: Keep
Photo 5: Keep
Photo 6: Keep
Photo 9: Keep
Photos to Remove: 7, 8, 10, 11, 12, 13, 14, 15
Issues with Current Photos:
Some are duplicates or very similar angles
Some show parking lot (unattractive)
Need to show: main entrance, supermarket entrance, shopping area entrance
Improvement: Replace with higher-quality photos showing:
Plaza Vea entrance with visible signage
Supermarket entrance
Shopping area entrance
Clean, attractive angles without parking lot
Reference: 14:05
7.2 Terminal de Ómnibus (Bus Terminal) Gallery
Current State: Multiple photos with quality issues
Photos to Keep:
Photo 1: Keep (good quality)
Photo 2: Keep (good quality)
Photo 3: Keep (good quality)
Photos to Remove: 4, 5 (repetitive, similar angles)
Issues: Some photos from Google Maps with visible arrows/UI elements
Action: Remove Google Maps screenshots; use clean photos only
Reference: 20:05
7.3 Tribunales (Courts) Gallery
Current State: Multiple photos, some with quality issues
Issues:
Some photos have gray filter/marks (possibly from phone lens or editing)
Some are pixelated
Some show construction (not final state)
Action: Remove low-quality photos; keep only clear, professional images
Reference: 25:15
7.4 Casa de Gobierno (Government House) Gallery
Current State: Multiple photos, some repetitive
Issues:
Photo 2 doesn't show full building (missing top)
Some photos are very similar
Need better framing to show building context
Solution:
Reorder: Move photo 5 to position 1 (best overall view)
Keep photo 3 as penultimate photo
Remove photo 2 (incomplete framing)
Remove photo 4 (doesn't add value)
Keep photo 1 as last photo
Improvement: Request AI to generate additional photos with better composition showing more surrounding context
Reference: 23:10
7.5 Avenida Rivadavia Gallery
Current State: Multiple photos with quality issues
Issues:
Photos show building under construction (not final state)
Some have gray marks/filters
Some are pixelated
Doesn't effectively showcase the avenue
Decision: Remove or significantly improve
Rationale: Rivadavia doesn't have strong commercial appeal; photos don't sell the concept
Alternative: Consider replacing with photos of nearby attractions (Forum, Roca Avenue) instead
Reference: 25:40
7.6 Parque Aguirre (Park Aguirre) Gallery
Current State: 13 photos (too many)
Photos to Keep:
Photo 1: Keep
Photo 2: Keep
Photo 3: Keep (insisted by stakeholder)
Photo 4: Keep
Photo 5: Keep
Photo 6: Keep
Photo 7: Remove
Photo 8: Remove (not attractive)
Photo 9: Keep
Photo 10: Remove
Photo 11: Remove (doesn't convey information)
Photo 12: Remove
Photo 13: Remove (repetitive)
Final Count: 6-7 photos maximum
Quality Issues: Some photos have color issues (gray zones); colors appear muted
Note: Photos are highly edited with AI; some elements (archer) were added artificially
Reference: 31:54
7.7 Peatonal (Pedestrian Streets) Gallery
Current State: 5 photos
Photos to Keep:
Photo 1: Keep
Photo 2: Keep
Photo 3: Improve (enhance quality)
Photo 4: Remove (doesn't convey information)
Photo 5: Remove
Issues:
Photos are cropped/cut off at edges
Need to adjust framing to show full street view
Some photos appear stretched
Solution: Adjust aspect ratio to be more square; reframe to show full street width
Reference: 40:28
7.8 Centro Cultural del Bicentenario Gallery
Current State: 10 photos (too many)
Issues:
Many photos lack proper proportions
Some don't show full building or ground level
Excessive number for single location
Action: Reduce to 3-4 best photos
Criteria: Show building exterior, interior spaces, architectural details
Reference: 49:04
7.9 Mercado Armonía (Harmony Market) Gallery
Current State: Multiple photos with quality issues
Photos to Keep:
Photo 2: Keep
Photo 3: Keep
Photo 6: Keep
Photo 7: Keep
Photos to Remove: 1, 4, 5 (repetitive or low quality)
Reference: 54:06
7.10 Plaza Libertad Gallery
Current State: Multiple photos
Issues:
Title should be "Plaza Libertad" not "Plaza Pública en el Centro de la Ciudad"
Text needs refinement
Action: Update title to match location name
Reference: 50:56
7.11 Avenida Roca Gallery
Current State: Multiple photos
Issues:
Some photos not interesting or relevant
Need to verify which photos belong to this section
Action: Review and curate for quality and relevance
Reference: 59:04
7.12 Estadio Único (Unique Stadium) - REMOVE
Decision: Remove from location map entirely
Rationale: Too far from building; not part of immediate neighborhood; requires 20+ minute drive
Impact: Doesn't represent walkable/accessible amenities
Reference: 01:03:50
8. Interior Design Gallery & Options

Owner: Ana Ferreyra Pons (Direction), Sebastian Ferreyra Pons (Implementation)
Priority: High
Status: In Progress

8.1 Harmony vs. Luxury Style Differentiation
Current Issue: Photos for Harmony and Luxury styles are unclear; users don't understand the difference
Solution: Add clarifying text and visual differentiation
Text to Add: "Hay dos diseños estéticos o dos opciones de interiores para elegir al momento de compra" (There are two aesthetic designs or interior options to choose from at time of purchase)
Placement: Above or near the two design photos
Reference: 01:19:06
8.2 Harmony Style Specifications
Name: Harmony
Key Features:
Standard shelving (doesn't reach ceiling)
No LED strip lighting on sides
Clean, minimalist aesthetic
Photos: Ensure all Harmony photos show consistent style without ceiling-height shelving
Reference: 01:21:09
8.3 Luxury Style Specifications
Name: Luxury (or Luxe Distal)
Key Features:
Shelving reaches to ceiling
LED strip lighting on sides of living areas
Premium finishes and materials
More sophisticated aesthetic
Visual Identifier: Add watermark/icon to all Luxury photos
Icon: Use the triquetra/Celtic knot symbol (currently selected) as watermark
Placement: Same corner on all Luxury photos (consistent branding)
Purpose: Help users visually associate photos with Luxury style
Reference: 01:21:59
8.4 Photo Verification & Correction
Task: Verify all photos match their respective style
Harmony Photos: Ensure no ceiling-height shelving or LED strips
Luxury Photos: Ensure all show ceiling-height shelving and LED strips
Action: Correct any mismatched photos
Reference: 01:20:58
8.5 Interior Design Text Repositioning
Current Issue: Text "Ofrecemos además otras terminaciones y equipamientos..." appears in wrong location
Current Position: Above design photos
New Position: Below "Equipamiento Opcional" and "Looks Freestyle" sections
Placement: Just before "Solicitar Ficha Técnica" button
Rationale: This text explains additional customization options, so it should appear after describing the standard options
Reference: 01:20:00
9. Content Text Refinement

Owner: Ana Ferreyra Pons
Priority: Medium
Status: Needs Revision

9.1 Location Description Updates
Current Text Issues:
"Ubicado en un área de modernos y elegante desarrollo edilicios" - awkward phrasing
Redundant mentions of Avenida Rivadavia
Doesn't effectively convey location benefits
Proposed New Text:
"Ubicado en un área de modernos y elegantes desarrollos edilicios, centros de convenciones, de fácil acceso al Parque Aguirre y al Puente Nuevo que te conecta con la ciudad de La Banda"
Add: "Plaza Vea - Único centro de compras dentro del área urbana, te ofrece supermercado y shopping de cercanía a solo una cuadra"
Remove: Redundant Avenida Rivadavia section (already mentioned in address)
Rationale: Focus on actual amenities (park, bridge, shopping) rather than street name
Reference: 36:35
9.2 Pedestrian Streets Description
Current Text: "Calles peatonales en el centro mía, Irigoyen y la calle Absalón Rojas son calle peatonales que conectan distintas zonas del centro"