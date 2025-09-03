# Correos - Previsión de la demanda

Business dashboard for demand forecasting for the Spanish postal service.

## Developer Documentation

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

### Project Structure

```
src/
├── routes/           # File-based routing
│   ├── __root.tsx   # App shell with Header
│   ├── index.tsx    # Dashboard with navigation cards
│   ├── comercial.tsx
│   ├── operaciones.tsx
│   ├── estrategia.tsx
│   ├── rendimiento.tsx
│   └── seguimiento.tsx
├── components/
│   ├── layout/      # Layout components (Header, Modal, Tabs)
│   ├── common/      # Reusable UI components
│   ├── table/       # Advanced data table system
│   └── chart/       # Chart.js integration
└── store/           # Zustand stores
    └── modalStore.ts
```

### Key Components

#### Modal System

Global modal management using Zustand:

```typescript
import { useModalStore } from '@/store/modalStore'

// Open modal with data
const openModal = useModalStore(state => state.openModal)
openModal('myModal', { data: 'example' })

// Close modal
const closeModal = useModalStore(state => state.closeModal)
closeModal('myModal')

// Access modal data in component
const modalData = useModalStore(state => state.modals['myModal'])
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

**Data Structure:**
```typescript
interface DataStructure {
  [rowKey: string]: {
    [date: string]: number | { [subColumn: string]: number }
    parent?: string
    children?: string[]
    customValues?: { [date: string]: number }
  }
}
```

**Usage:**
```typescript
<Table
  data={dataStructure}
  startDate="2024-01-01"
  endDate="2024-12-31"
  isVerifying={false}
  onToggleVerifying={setIsVerifying}
/>
```

#### Styling System

Uses CSS modules with custom properties defined in `src/index.css`:

**Component Styling Pattern:**
```typescript
// Component.tsx
import styles from './Component.module.css'

export function Component() {
  return <div className={styles.container}>Content</div>
}
```

**CSS Variables:**
```css
/* Access global CSS custom properties */
.container {
  background: var(--color-primary);
  padding: var(--spacing-md);
}
```

### Development Guidelines

#### File Organization
- Place components in appropriate subdirectories (`layout/`, `common/`, `table/`)
- Use CSS modules (`.module.css`) alongside components
- Create TypeScript interfaces in dedicated `interfaces.ts` files

#### State Management
- Use Zustand for global state (modals, app-wide data)
- Keep local state in components when possible
- Modal data is passed through the store system

#### Routing
- Add new routes by creating files in `src/routes/`
- Routes are auto-generated based on file structure
- Use TanStack Router's type-safe navigation

#### Table Development
- Extend `TableCell.tsx` for custom cell types
- Modify `utils.ts` for data processing logic
- Update interfaces for new data structures
- Use verification mode for data validation workflows

#### Chart Integration
- Use Chart.js components from `src/components/chart/`
- Follow existing patterns for data transformation
- Implement responsive chart configurations

### Common Patterns

**Navigation Cards:**
```typescript
<BoxLink to="/route" title="Section Title" icon="📊" />
```

**Date Range Selection:**
```typescript
<DateRange
  startDate={startDate}
  endDate={endDate}
  onChange={(start, end) => setDates(start, end)}
/>
```

**Toggle Components:**
```typescript
<Toggle
  label="Verification Mode"
  checked={isVerifying}
  onChange={setIsVerifying}
/>
```

### Testing & Quality

- Run `npm run lint` before commits
- Use TypeScript strict mode for type safety
- Test table functionality with hierarchical data
- Verify modal interactions across different routes

### Front-end
