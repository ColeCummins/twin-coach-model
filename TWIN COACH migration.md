**Guide: Migrating the Twin Coach Deal Configurator to Project IDX**

**Goal:** Move the single-file HTML/JS tool into a modern, robust web application environment for better collaboration, version control, and deployment.

**Prerequisites:** A Google account.

### **Step 1: Initialize the Project in IDX**

1. Go to [**idx.google.com**](https://idx.google.com).  
2. Click **"Get Started"** or **"Create a workspace"**.  
3. **Choose a Template:** Select **"Web App"** \-\> **"React"** (recommended for this level of interactivity) or **"HTML/CSS/JS"** (if you want to keep it closest to what we have now).  
   * *Recommendation:* Choose **React** (using Vite). It is much better for managing the complex state (the state object) and the reactive UI (the sliders updating the charts instantly).  
4. **Name your workspace:** e.g., twin-coach-flywheel.  
5. Click **"Create"**. IDX will spin up a cloud-based VS Code environment for you.

### **Step 2: Structure the Application (React Approach)**

Once your workspace loads, you will see a file structure on the left.

1. **Install Tailwind CSS:**  
   * Open the terminal in IDX (Ctrl+\`).  
   * Run: npm install \-D tailwindcss postcss autoprefixer  
   * Run: npx tailwindcss init \-p  
   * (This sets up the styling engine we've been using).  
2. **Install Chart.js:**  
   * Run: npm install chart.js react-chartjs-2  
3. Create Your Components:  
   Instead of one giant file, break it down. Create a folder src/components and add:  
   * DealParameters.jsx: For all the sliders and inputs.  
   * RentScenarios.jsx: For the rent strategy buttons.  
   * Dashboard.jsx: For the KPI cards.  
   * StakeholderCard.jsx: A reusable component for the Seller, Investor, Co-op, and CLT cards.

### **Step 3: Porting the Logic**

This is the "copy-paste with purpose" phase.

1. **Central Logic (utils/calculations.js):**  
   * Create a new file src/utils/calculations.js.  
   * Copy the **entire calculateModel function** from our v33 HTML file into this file.  
   * Export it: export const calculateModel \= (params) \=\> { ... }  
   * Copy the constants (BONUS\_SCHEDULE, RENT\_SCENARIOS, etc.) here too.  
2. **State Management (App.jsx):**  
   * In src/App.jsx, use React's useState to hold the params object.  
   * Example:  
     const \[params, setParams\] \= useState({  
         fairMarketValue: 2300000,  
         landRatio: 0.40,  
         // ... all other defaults from v33  
     });

3. **Connecting the UI:**  
   * In App.jsx, import your calculateModel function.  
   * Call it: const results \= calculateModel(params);  
   * Pass results down to your Dashboard and StakeholderCard components as props.  
   * Pass setParams down to DealParameters so the sliders can update the state.

### **Step 4: Adding the "Day 1 Solvency" Warning**

In your utils/calculations.js file, inside the calculateModel function, add this specific check:

// ... inside calculateModel  
const sellerNetCashDay1 \= downPayment \- (closingCosts \+ seller.bargainTax);

// Define a safety buffer (e.g., $20k for moving costs/peace of mind)  
const minSellerCash \= 20000;

if (sellerNetCashDay1 \< minSellerCash) {  
    results.warnings.push({  
        type: 'critical',  
        msg: \`CRITICAL: Day 1 Cash ($${formatCurrency(sellerNetCashDay1)}) is insufficient to cover taxes and closing costs. Increase Down Payment.\`  
    });  
}

### **Step 5: Deploying**

1. In Project IDX, look for the **"Project IDX" icon** on the left sidebar.  
2. You can usually deploy directly to **Firebase Hosting** with a few clicks.  
3. This gives you a live URL to share with the Seller, the CPA, and the Investors.

### **Why This is Better**

* **Modularity:** If you need to change the tax rate, you change it in *one* place (calculations.js), and the whole app updates.  
* **Reliability:** React handles the "state" (the numbers changing) much more reliably than our vanilla JS event listeners, preventing those "race conditions."  
* **Professionalism:** Sending a link to a hosted web app looks much more professional than emailing an HTML file.

This migration path preserves all the hard work we've done on the math (\`v33\`) but moves it into a container that is worthy of a multi-million dollar community project.  
