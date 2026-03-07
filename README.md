# 🌿 Lohia Farm - Precision Agriculture Dashboard

Lohia Farm is a sophisticated, real-time environmental monitoring solution designed to provide high-fidelity oversight of greenhouse ecosystems. By bridging the gap between hardware telemetry and modern web architecture, this platform empowers agricultural operators with the data density required for precision crop management.

The dashboard serves as a centralized command center, aggregating complex sensor data into a high-glance, glassmorphic interface. It is engineered to handle high-frequency data streams—tracking Temperature, CO₂ levels, Humidity, and Air Quality—ensuring that environmental fluctuations are captured and visualized with zero latency.

## 🏗️ Technical Architecture

The project is built on a **Modular Feature Architecture**, emphasizing strict separation of concerns to ensure that the system remains scalable, maintainable, and hardware-agnostic.

### 1. Data Layer (`/src/lib` & `/src/hooks`)
* **Data Models (`farmData.ts`):** Implements rigorous TypeScript interfaces that define the "Structural Blueprint" for all environmental metrics.
* **State Management (`use-farm-data.ts`):** A custom React hook that manages the lifecycle of sensor data. It functions as the logic engine, processing raw numerical input into structured states for the UI.
* **Utilities (`utils.ts`):** Pure helper functions designed for HSL (Hue-Saturation-Lightness) color calculations and formatting, ensuring the logic remains decoupled from the component tree.

### 2. View Layer (`/src/components`)
* **MetricCard.tsx:** A specialized, stateless UI component utilizing Glassmorphism principles. It is optimized for "high-glance" readability, adjusting its visual properties dynamically based on the data it receives.
* **Layout Systems:** A hierarchical structure consisting of `HeroSection.tsx`, `DashboardHeader.tsx`, etc. that establishes a professional brand identity.

### 3. Styling & UI Engine
* **Tailwind CSS:** A utility-first styling utilizing a custom HSL color palette to maintain brand consistency across all lighting conditions.
* **Lucide React:** A comprehensive iconography set mapped to specific sensor types via an extensible `iconMap`.



## 🛠️ Tech Stack
- **Framework:** React 18 + Vite
- **Language:** TypeScript (ensuring full type safety across the data pipeline)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide-React

## 💻 Local Development

To set up the Lohia Farm environment locally for testing, follow these steps:

# 1. Clone this repository (go to Code green button to get more help)

```bash
# 2. Install dependencies in project root
npm install

# 3. Launch the development server
npm run dev

# 3. Test and make changes as you wish!
