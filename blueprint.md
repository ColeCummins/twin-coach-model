
# Blueprint: Twin Coach Financial Model

## Overview

This application serves as an interactive financial modeling and visualization tool for the "Twin Coach" community ownership model. It is designed to provide a transparent and detailed comparison against conventional real estate transactions and to break down the financial outcomes for all key stakeholders: the Seller, the Housing Cooperative (Co-op), the Investors, and the Community Land Trust (CLT).

## Implemented Features (v2)

This version represents a major overhaul of the application, focusing on improved user experience, architectural robustness, and financial transparency.

### Architecture & Navigation
*   **Multi-Page Structure:** The application was refactored from a single-page app into a multi-page structure using `react-router-dom` for clear and scalable navigation.
*   **Central Landing Page:** A new, aesthetically pleasing landing page (`src/pages/Home.jsx`) was created to serve as the central hub, directing users to the main sections of the application.
*   **Dedicated Page Components:** The "Stakeholder Dashboard" and "Sale Comparison" views were moved into their own dedicated page components (`src/pages/DashboardPage.jsx` and `src/pages/ComparisonPage.jsx`).
*   **Persistent Navigation:** A `NavBar` component (`src/components/NavBar.jsx`) provides consistent navigation across all pages.

### Financial Modeling & Transparency
*   **Upgraded Calculation Engine:** The core financial logic in `src/utils/flywheelCalculator.js` was replaced with a complete, CPA-audited calculation engine, ensuring accuracy and reliability.
*   **Before & After Tax Values:** The `StakeholderCard` component was enhanced to display both **Gross (before-tax)** and **Net (after-tax)** financial figures, offering users a more transparent and comprehensive understanding of the financial outcomes.
*   **Dynamic Dashboard:** The Stakeholder Dashboard is now powered by the full, correct set of parameters, feeding the accurate `flywheelCalculator` function to generate its data.

### User Experience & Aesthetics
*   **Modern Design:** The UI was updated with modern design principles, including the use of cards, iconography from `react-icons`, and a clean, visually balanced layout.
*   **Intuitive Flow:** The new structure guides the user from a high-level overview on the landing page to the detailed financial dashboards, creating a more intuitive and understandable user journey.

## Current Request: Commit & Rebuild

The following steps will be taken to finalize the recent changes:
1.  **Update Blueprint:** Document the architectural and feature changes in this `blueprint.md` file.
2.  **Stage Changes:** Add all new and modified files to the git staging area.
3.  **Commit Changes:** Commit the staged files with a descriptive message outlining the scope of the updates.
4.  **Build Application:** Run the production build process to generate the optimized static assets for deployment.
