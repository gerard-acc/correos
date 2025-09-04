# Correos - Previsión de la demanda

### Quick Start

```bash
npm install           # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Architecture Overview

React 19 + TypeScript application built with Vite, featuring:

- **Routing**: TanStack Router with file-based routing (`src/routes/`)
- **State Management**: Zustand for modal system
- **Styling**: CSS modules with custom CSS variables
- **Data Visualization**: Chart.js with react-chartjs-2
- **Build Tool**: Vite with SWC for fast refresh

### Key Components

#### Modal System

Global modal management using Zustand:

```typescript
import { useModalStore } from "@/store/modalStore";

// Open modal with data
const openModal = useModalStore((state) => state.openModal);
openModal("myModal", { data: "example" });

// Close modal
const closeModal = useModalStore((state) => state.closeModal);
closeModal("myModal");

// Access modal data in component
const modalData = useModalStore((state) => state.modals["myModal"]);
```

#### Table System

Advanced hierarchical data tables with inline editing:

**Key Features:**

- Hierarchical parent-child rows with unlimited nesting
- Dynamic row expansion/collapse (▶/▼ indicators)
- Subcolumn support for detailed data breakdown
- Inline cell editing with Enter/Escape handling
- Verification mode toggle for data validation
- Timeline aggregation (weekly/monthly totals)
- Festivity highlighting for special dates
