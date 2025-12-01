# BOS Ledger - Technical Documentation

## Executive Summary

**BOS Ledger** is a full-stack financial management application built with Next.js 14, designed to track shipment-based cash flows, inventory, and profitability analytics. The application leverages modern web technologies to deliver a performant, type-safe, and scalable solution with server-side rendering, real-time data updates, and responsive design.

**Key Technical Highlights:**
- Server-side rendering (SSR) for optimal performance and SEO
- Type-safe full-stack development with TypeScript
- Serverless architecture for scalability
- Real-time data synchronization
- Mobile-first responsive design
- Secure authentication with session management

---

## Table of Contents
1. [Technology Stack & Rationale](#technology-stack--rationale)
2. [Architecture Overview](#architecture-overview)
3. [Why Next.js? Technical Justification](#why-nextjs-technical-justification)
4. [Database Design & ORM Strategy](#database-design--orm-strategy)
5. [Folder Structure & Conventions](#folder-structure--conventions)
6. [Next.js 14 App Router Deep Dive](#nextjs-14-app-router-deep-dive)
7. [API Design & Implementation](#api-design--implementation)
8. [Component Architecture & Patterns](#component-architecture--patterns)
9. [Authentication & Security](#authentication--security)
10. [Performance Optimizations](#performance-optimizations)
11. [State Management Strategy](#state-management-strategy)
12. [Key Features Implementation](#key-features-implementation)
13. [Development Workflow](#development-workflow)
14. [Deployment Architecture](#deployment-architecture)
15. [Trade-offs & Design Decisions](#trade-offs--design-decisions)

---

## Technology Stack & Rationale

### Frontend Framework: Next.js 14
**Why Next.js over alternatives (Create React App, Vite, Remix)?**

1. **Server-Side Rendering (SSR)**
   - **Problem**: Traditional SPAs (Single Page Applications) load slowly on first visit and have poor SEO
   - **Solution**: Next.js renders pages on the server, sending fully-formed HTML to the client
   - **Benefit**: Faster initial page load, better SEO, improved Core Web Vitals

2. **Hybrid Rendering**
   - Can mix SSR, Static Site Generation (SSG), and Client-Side Rendering (CSR) in the same app
   - Dashboard uses SSR for fresh data, while static pages use SSG for speed

3. **Built-in API Routes**
   - No need for separate backend server (Express, Fastify)
   - Serverless functions auto-scale on Vercel
   - Reduces infrastructure complexity

4. **File-Based Routing**
   - No need for React Router configuration
   - Intuitive folder structure maps directly to URLs
   - Automatic code-splitting per route

5. **Image Optimization**
   - Automatic image resizing, lazy loading, and modern format conversion (WebP)
   - Reduces bandwidth and improves performance

6. **TypeScript Integration**
   - First-class TypeScript support out of the box
   - Type-safe routing and API calls

**Comparison:**
| Feature | Next.js | Create React App | Vite + React | Remix |
|---------|---------|------------------|--------------|-------|
| SSR | ✅ Built-in | ❌ Requires setup | ❌ Requires setup | ✅ Built-in |
| API Routes | ✅ Serverless | ❌ Need backend | ❌ Need backend | ✅ Loaders |
| File Routing | ✅ Yes | ❌ Manual | ❌ Manual | ✅ Yes |
| Image Optimization | ✅ Automatic | ❌ Manual | ❌ Manual | ❌ Manual |
| Zero Config | ✅ Yes | ✅ Yes | ⚠️ Some config | ✅ Yes |
| Production Ready | ✅ Yes | ⚠️ Deprecated | ✅ Yes | ✅ Yes |

### UI Framework: React 18
**Why React?**
- **Component-Based**: Reusable UI components reduce code duplication
- **Virtual DOM**: Efficient updates minimize browser reflows
- **Ecosystem**: Largest library ecosystem (React Hook Form, React Icons, etc.)
- **Concurrent Features**: useTransition for smooth UI updates during navigation
- **Server Components**: New React 18 feature, fully supported by Next.js 14

### Language: TypeScript
**Why TypeScript over JavaScript?**

1. **Type Safety**
   - Catch errors at compile-time, not runtime
   - Example: Prevents passing wrong data types to API
   ```typescript
   // TypeScript catches this error before deployment
   const amount: number = "100" // Error: Type 'string' is not assignable to type 'number'
   ```

2. **Better IDE Support**
   - Autocomplete for object properties
   - Inline documentation
   - Refactoring tools (rename, move)

3. **Self-Documenting Code**
   ```typescript
   interface Stock {
     id: string
     shipmentId: string
     count: number
     remaining: number
   }
   // Anyone reading this knows exactly what data structure to expect
   ```

4. **Reduced Bugs**
   - Studies show 15% fewer bugs in TypeScript vs JavaScript
   - Especially important for financial applications where accuracy is critical

### Database: PostgreSQL + Prisma ORM
**Why PostgreSQL?**

1. **ACID Compliance**
   - Atomicity, Consistency, Isolation, Durability
   - Critical for financial data integrity
   - Ensures transactions are all-or-nothing (no partial updates)

2. **Relational Data**
   - Shipments have many transactions (one-to-many)
   - Enforces referential integrity with foreign keys
   - Complex queries with JOINs for analytics

3. **JSON Support**
   - Can store semi-structured data if needed
   - Best of both worlds (relational + document store)

4. **Scalability**
   - Handles millions of rows efficiently
   - Supports read replicas for scaling reads

**Why Prisma ORM?**

1. **Type-Safe Database Access**
   ```typescript
   // Prisma generates TypeScript types from schema
   const stock = await prisma.stock.findUnique({
     where: { id: '123' },
     include: { shipment: true }
   })
   // TypeScript knows stock.shipment.name exists
   ```

2. **Auto-Generated Client**
   - No manual SQL writing for CRUD operations
   - Reduces SQL injection vulnerabilities

3. **Migration System**
   - Version-controlled database changes
   - Easy rollbacks if needed

4. **Query Optimization**
   - Automatic query batching
   - N+1 query prevention

**Alternatives Considered:**
- **TypeORM**: More complex, less type-safe
- **Sequelize**: JavaScript-first, weaker TypeScript support
- **Raw SQL**: No type safety, more boilerplate
- **MongoDB**: Not ideal for relational financial data

### Styling: Tailwind CSS
**Why Tailwind over CSS Modules or Styled Components?**

1. **Utility-First**
   - No need to name CSS classes
   - Faster development
   ```tsx
   <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
   ```

2. **Consistency**
   - Design system built-in (spacing scale, colors)
   - Prevents arbitrary values (no `margin: 13px`)

3. **Performance**
   - Unused styles are purged in production
   - Smaller CSS bundle size

4. **Responsive Design**
   - Mobile-first breakpoints
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   ```

5. **No Runtime Cost**
   - Unlike CSS-in-JS (styled-components), Tailwind is pure CSS
   - No JavaScript overhead

### Authentication: NextAuth.js
**Why NextAuth.js?**

1. **Built for Next.js**
   - Seamless integration with Next.js API routes
   - Supports both Pages and App Router

2. **Multiple Providers**
   - Currently using Credentials (email/password)
   - Can easily add OAuth (Google, GitHub) later

3. **Session Management**
   - JWT or database sessions
   - Automatic session refresh

4. **Security Best Practices**
   - CSRF protection
   - Secure cookie handling
   - Password hashing with bcrypt

### Form Management: React Hook Form + Zod
**Why React Hook Form?**

1. **Performance**
   - Uncontrolled components (fewer re-renders)
   - Better than Formik for large forms

2. **Less Boilerplate**
   ```tsx
   const { register, handleSubmit } = useForm()
   <input {...register('email')} />
   ```

**Why Zod?**

1. **Runtime Validation**
   - TypeScript only validates at compile-time
   - Zod validates actual user input at runtime

2. **Type Inference**
   ```typescript
   const schema = z.object({ count: z.number().min(0) })
   type FormData = z.infer<typeof schema> // Automatic TypeScript type
   ```

3. **Error Messages**
   - Customizable validation messages
   - Better UX than browser defaults

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Components (Client-Side)                        │ │
│  │  - Interactive UI (forms, modals, buttons)             │ │
│  │  - State management (useState, useEffect)              │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (Vercel)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Server Components (SSR)                               │ │
│  │  - Fetch data from database                            │ │
│  │  - Render HTML on server                               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Routes (Serverless Functions)                     │ │
│  │  - /api/ledger, /api/stock, /api/auth                  │ │
│  │  - Business logic and validation                       │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ Prisma Client
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Vercel Postgres)           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tables: User, Shipment, LedgerEntry, Stock, PreOrder  │ │
│  │  - ACID transactions                                   │ │
│  │  - Relational integrity                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

#### 1. Server-Side Rendered Page (e.g., Dashboard)
```
User → Browser → Next.js Server → Prisma → PostgreSQL
                       ↓
                  Render HTML
                       ↓
Browser ← HTML with data ← Next.js Server
```

**Advantages:**
- Fast initial load (HTML is pre-rendered)
- SEO-friendly (search engines see content)
- No loading spinners on first visit

#### 2. Client-Side API Call (e.g., Add Transaction)
```
User clicks "Add" → Client Component → fetch('/api/ledger')
                                              ↓
                                    API Route Handler
                                              ↓
                                    Prisma.create()
                                              ↓
                                        PostgreSQL
                                              ↓
                                    Response (JSON)
                                              ↓
Client Component ← Update UI ← Response
```

**Advantages:**
- Interactive without page reload
- Optimistic UI updates possible
- Better user experience

---

## Why Next.js? Technical Justification

### 1. **Performance: Core Web Vitals**

Next.js is optimized for Google's Core Web Vitals:

**Largest Contentful Paint (LCP)**: < 2.5s
- Server-side rendering delivers content faster
- Automatic code-splitting loads only necessary JavaScript

**First Input Delay (FID)**: < 100ms
- Hydration is optimized
- React Server Components reduce JavaScript bundle

**Cumulative Layout Shift (CLS)**: < 0.1
- Image optimization prevents layout shifts
- Font optimization with `next/font`

**Comparison:**
- **Create React App**: LCP ~4-5s (client-side rendering)
- **Next.js SSR**: LCP ~1-2s (server-side rendering)

### 2. **Developer Experience**

**Hot Module Replacement (HMR)**
- Changes reflect instantly without full page reload
- Preserves component state during development

**Error Overlay**
- Detailed error messages with stack traces
- Click to open file in VS Code

**TypeScript Support**
- Zero configuration needed
- Automatic type checking

**Built-in Linting**
- ESLint configured out of the box
- Catches common mistakes

### 3. **Scalability**

**Serverless Architecture**
- API routes are serverless functions
- Auto-scales based on traffic
- Pay only for what you use

**Edge Runtime**
- Can deploy to edge locations worldwide
- Reduces latency for global users

**Incremental Static Regeneration (ISR)**
- Static pages can be updated without rebuild
- Best of both worlds: static speed + dynamic data

### 4. **SEO & Accessibility**

**Server-Side Rendering**
- Search engines see full content immediately
- Better for marketing pages

**Metadata API**
- Easy to set title, description, Open Graph tags
```tsx
export const metadata = {
  title: 'Dashboard | BOS Ledger',
  description: 'Manage your shipment finances'
}
```

**Accessibility**
- Next.js encourages semantic HTML
- Automatic focus management for navigation

### 5. **Security**

**Environment Variables**
- Separate client and server variables
- Server variables never exposed to browser

**CSRF Protection**
- Built into NextAuth.js
- Prevents cross-site request forgery

**Content Security Policy**
- Easy to configure in `next.config.js`
- Prevents XSS attacks

---

## Database Design & ORM Strategy

### Schema Design Principles

#### 1. **Normalization (3NF)**

The database follows Third Normal Form to eliminate redundancy:

**Before Normalization:**
```sql
LedgerEntry (id, date, type, amount, shipment_name, shipment_created_at)
-- Problem: shipment_name is duplicated for every entry
```

**After Normalization:**
```sql
Shipment (id, name, created_at)
LedgerEntry (id, date, type, amount, shipment_id)
-- shipment_id references Shipment.id
```

**Benefits:**
- No data duplication
- Single source of truth
- Easier updates (change shipment name once)

#### 2. **Referential Integrity**

Foreign keys ensure data consistency:

```prisma
model LedgerEntry {
  shipmentId String?
  shipment   Shipment? @relation(fields: [shipmentId], references: [id])
}
```

**What this prevents:**
- Creating entries for non-existent shipments
- Orphaned entries (entries without shipments)

**Cascade Deletes:**
```prisma
model Stock {
  shipment Shipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
}
```
- Deleting a shipment automatically deletes its stock
- Prevents orphaned data

#### 3. **Data Types for Financial Accuracy**

**Decimal vs Float:**
```prisma
amount Decimal // ✅ Precise (no rounding errors)
// vs
amount Float   // ❌ Imprecise (0.1 + 0.2 = 0.30000000000000004)
```

**Why Decimal?**
- Financial calculations must be exact
- Decimal stores exact values (e.g., 10.50)
- Float uses binary representation (approximations)

**Example:**
```typescript
// With Float (WRONG)
0.1 + 0.2 = 0.30000000000000004

// With Decimal (CORRECT)
0.1 + 0.2 = 0.3
```

#### 4. **Indexing Strategy**

**Automatic Indexes:**
- Primary keys (`@id`)
- Unique fields (`@unique`)
- Foreign keys

**Manual Indexes (if needed):**
```prisma
model LedgerEntry {
  date DateTime
  
  @@index([date]) // Speed up date-based queries
}
```

**When to add indexes:**
- Columns used in WHERE clauses
- Columns used in ORDER BY
- Foreign keys (already indexed)

**Trade-off:**
- Faster reads
- Slower writes (index must be updated)

### Prisma Advantages

#### 1. **Type-Safe Queries**

**Without Prisma (Raw SQL):**
```typescript
const result = await db.query('SELECT * FROM stock WHERE id = $1', [id])
// result is 'any' type - no type safety
```

**With Prisma:**
```typescript
const stock = await prisma.stock.findUnique({ where: { id } })
// stock is typed as Stock | null
// TypeScript knows stock.count is a number
```

#### 2. **Automatic Migrations**

**Schema Changes:**
```prisma
// Add new field
model Stock {
  id String @id
  count Int
  notes String? // New field
}
```

**Generate Migration:**
```bash
npx prisma migrate dev --name add_notes_to_stock
```

**What happens:**
1. Prisma generates SQL migration file
2. Applies migration to database
3. Updates TypeScript types
4. All in one command

#### 3. **Relation Loading**

**N+1 Problem:**
```typescript
// BAD: N+1 queries (1 + N)
const stocks = await prisma.stock.findMany() // 1 query
for (const stock of stocks) {
  const shipment = await prisma.shipment.findUnique({ 
    where: { id: stock.shipmentId } 
  }) // N queries
}
```

**Prisma Solution:**
```typescript
// GOOD: 1 query with JOIN
const stocks = await prisma.stock.findMany({
  include: { shipment: true } // Loads shipment in same query
})
```

#### 4. **Transaction Support**

**Atomic Operations:**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.stock.update({ where: { id }, data: { remaining: 0 } })
  await tx.ledgerEntry.create({ data: { /* ... */ } })
})
// Both succeed or both fail (no partial updates)
```

---

## Folder Structure & Conventions

### Next.js 14 App Router Structure

```
app/
├── (auth)/                    # Route group (doesn't affect URL)
│   └── login/
│       └── page.tsx           # /login
├── api/                       # API routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts       # Catch-all route
│   ├── ledger/
│   │   ├── route.ts           # /api/ledger
│   │   └── [id]/
│   │       └── route.ts       # /api/ledger/[id]
│   └── stock/
│       ├── route.ts
│       └── [id]/route.ts
├── dashboard/
│   └── page.tsx               # /dashboard
├── inventory/
│   ├── stock/
│   │   ├── page.tsx           # /inventory/stock (Server Component)
│   │   └── StockPageClient.tsx # Client Component
│   └── pre-order/
│       ├── page.tsx
│       └── PreOrderPageClient.tsx
├── layout.tsx                 # Root layout (wraps all pages)
├── globals.css                # Global styles
└── page.tsx                   # / (home page)
```

### Naming Conventions

**Files:**
- `page.tsx` - Route page component
- `layout.tsx` - Layout wrapper
- `route.ts` - API route handler
- `loading.tsx` - Loading UI (automatic)
- `error.tsx` - Error boundary (automatic)

**Components:**
- PascalCase: `AddStockModal.tsx`
- Descriptive names: `StockPageClient.tsx` (not `Client.tsx`)

**API Routes:**
- RESTful naming: `/api/resource` (plural)
- HTTP methods: GET, POST, PUT, DELETE

### Colocation Strategy

**Server + Client Split:**
```
inventory/stock/
├── page.tsx              # Server: Fetch data
└── StockPageClient.tsx   # Client: Handle interactions
```

**Why?**
- Server component fetches data (faster, no loading spinner)
- Client component handles clicks, modals, state
- Clear separation of concerns

---

## Next.js 14 App Router Deep Dive

### Server Components vs Client Components

#### Server Components (Default)

**Characteristics:**
- Run on server only
- Can access database directly
- Cannot use React hooks (useState, useEffect)
- Cannot use browser APIs (localStorage, window)
- Zero JavaScript sent to client (smaller bundle)

**Example:**
```tsx
// app/dashboard/page.tsx
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  // Direct database access (server-side only)
  const entries = await prisma.ledgerEntry.findMany()
  
  return <div>{entries.map(e => <div key={e.id}>{e.description}</div>)}</div>
}
```

**Benefits:**
- Faster initial load (no client-side data fetching)
- Better security (database credentials never exposed)
- SEO-friendly (content is in HTML)

#### Client Components (Opt-in)

**When to use:**
- User interactions (onClick, onChange)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, geolocation)
- Third-party libraries that use hooks

**Example:**
```tsx
// components/AddStockModal.tsx
"use client" // Required directive

import { useState } from 'react'

export default function AddStockModal() {
  const [count, setCount] = useState(0) // ✅ Hooks work
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**Trade-offs:**
- More JavaScript sent to client
- Can't access server-only resources
- But necessary for interactivity

### Hybrid Approach (Best Practice)

**Pattern:**
1. Server component fetches data
2. Passes data to client component
3. Client component handles interactions

```tsx
// app/inventory/stock/page.tsx (Server)
export default async function StockPage() {
  const stocks = await prisma.stock.findMany() // Server-side
  return <StockPageClient stocks={stocks} />   // Pass to client
}

// StockPageClient.tsx (Client)
"use client"

export default function StockPageClient({ stocks }) {
  const [showModal, setShowModal] = useState(false) // Client-side
  // Handle interactions
}
```

**Why this works:**
- Initial data loads fast (server-side)
- Interactions are smooth (client-side)
- Best of both worlds

### Data Fetching Strategies

#### 1. Server Component (Recommended)

```tsx
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store' // Always fresh
    // or
    next: { revalidate: 60 } // Cache for 60 seconds
  })
  return <Component data={data} />
}
```

**Caching Options:**
- `cache: 'force-cache'` - Cache forever (default)
- `cache: 'no-store'` - Never cache (always fresh)
- `next: { revalidate: 60 }` - Revalidate every 60 seconds

#### 2. Client Component (When necessary)

```tsx
"use client"

function Page() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])
  
  return <Component data={data} />
}
```

**When to use:**
- Data depends on user interaction
- Real-time updates needed
- Polling required

### Streaming & Suspense

**Problem:** Slow database queries block entire page

**Solution:** Stream UI as data loads

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>
      <FastComponent />
    </div>
  )
}
```

**What happens:**
1. Page shell loads immediately
2. `<FastComponent>` renders
3. `<Skeleton>` shows while `<SlowComponent>` loads
4. `<SlowComponent>` replaces skeleton when ready

**Benefits:**
- Faster perceived performance
- Progressive rendering
- Better UX

---

## API Design & Implementation

### RESTful API Principles

**Resource-Based URLs:**
```
GET    /api/stock           # List all
POST   /api/stock           # Create one
GET    /api/stock/[id]      # Get one
PUT    /api/stock/[id]      # Update one
DELETE /api/stock/[id]      # Delete one
```

**HTTP Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not logged in
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

### API Route Structure

```tsx
// app/api/stock/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// GET /api/stock
export async function GET() {
  // 1. Authentication
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 2. Database query
  try {
    const stocks = await prisma.stock.findMany({
      include: { shipment: true }
    })
    
    // 3. Response
    return NextResponse.json(stocks)
  } catch (error) {
    // 4. Error handling
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/stock
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 1. Parse body
  const body = await request.json()
  
  // 2. Validation
  if (!body.shipmentId || body.count < 0) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
  
  // 3. Create resource
  const stock = await prisma.stock.create({
    data: {
      shipmentId: body.shipmentId,
      count: body.count,
      remaining: body.count
    }
  })
  
  // 4. Response with 201 Created
  return NextResponse.json(stock, { status: 201 })
}
```

### Error Handling Strategy

**Consistent Error Format:**
```typescript
{
  error: string,        // User-friendly message
  code?: string,        // Error code for client handling
  details?: any         // Additional context (dev only)
}
```

**Try-Catch Pattern:**
```typescript
try {
  await prisma.stock.create({ data })
} catch (error) {
  if (error.code === 'P2002') {
    // Prisma unique constraint violation
    return NextResponse.json({ 
      error: 'Stock already exists',
      code: 'DUPLICATE'
    }, { status: 400 })
  }
  
  // Generic error
  console.error(error)
  return NextResponse.json({ 
    error: 'Server error' 
  }, { status: 500 })
}
```

### Authentication Middleware

**Pattern:**
```typescript
async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function GET() {
  const session = await requireAuth() // Throws if not authenticated
  // ... rest of handler
}
```

---

## Component Architecture & Patterns

### 1. Compound Component Pattern

**Modal + Form:**
```tsx
<Modal open={showModal} onClose={() => setShowModal(false)}>
  <AddStockForm onSuccess={() => setShowModal(false)} />
</Modal>
```

**Benefits:**
- Reusable modal wrapper
- Form doesn't know about modal
- Separation of concerns

### 2. Controlled vs Uncontrolled Components

**Controlled (React Hook Form):**
```tsx
const { register } = useForm()
<input {...register('count')} />
// React Hook Form controls the value
```

**Why?**
- Better performance (fewer re-renders)
- Built-in validation
- Easy to reset

### 3. Composition over Inheritance

**Bad (Inheritance):**
```tsx
class Button extends Component {
  // Hard to reuse
}
```

**Good (Composition):**
```tsx
function Button({ children, onClick, variant }) {
  return (
    <button 
      onClick={onClick}
      className={variant === 'primary' ? 'bg-blue' : 'bg-gray'}
    >
      {children}
    </button>
  )
}

<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
```

### 4. Custom Hooks

**Reusable Logic:**
```tsx
function useStocks() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/stock')
      .then(res => res.json())
      .then(data => {
        setStocks(data)
        setLoading(false)
      })
  }, [])
  
  return { stocks, loading }
}

// Usage
function StockList() {
  const { stocks, loading } = useStocks()
  if (loading) return <Spinner />
  return <div>{stocks.map(...)}</div>
}
```

---

## Authentication & Security

### NextAuth.js Flow

```
1. User submits login form
   ↓
2. POST /api/auth/signin
   ↓
3. CredentialsProvider.authorize()
   ↓
4. Check email/password in database
   ↓
5. If valid: Create session
   ↓
6. Set secure HTTP-only cookie
   ↓
7. Redirect to /dashboard
```

### Password Security

**Hashing with bcrypt:**
```typescript
import bcrypt from 'bcryptjs'

// Registration
const hashedPassword = await bcrypt.hash(password, 10)
await prisma.user.create({
  data: { email, password: hashedPassword }
})

// Login
const user = await prisma.user.findUnique({ where: { email } })
const valid = await bcrypt.compare(password, user.password)
```

**Why bcrypt?**
- Slow by design (prevents brute force)
- Automatic salt generation
- Industry standard

### Session Management

**JWT vs Database Sessions:**

**JWT (Current):**
- Stored in HTTP-only cookie
- Stateless (no database lookup)
- Fast

**Database Sessions:**
- Stored in database
- Can revoke sessions
- Slower (database query)

### CSRF Protection

**NextAuth.js Built-in:**
- CSRF token in every request
- Validates token on state-changing operations
- Prevents cross-site attacks

### Environment Variables

**Server-only:**
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="secret-key"
```

**Client-accessible (prefix with NEXT_PUBLIC_):**
```env
NEXT_PUBLIC_API_URL="https://api.example.com"
```

**Why separate?**
- Server variables never sent to browser
- Prevents credential leaks

---

## Performance Optimizations

### 1. Code Splitting

**Automatic:**
- Each route is a separate bundle
- Only load JavaScript for current page

**Manual (Dynamic Imports):**
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // Don't render on server
})
```

### 2. Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={100}
  alt="Logo"
  priority // Load immediately (above fold)
/>
```

**What Next.js does:**
- Resize to multiple sizes
- Convert to WebP
- Lazy load (below fold)
- Serve from CDN

### 3. Font Optimization

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

<body className={inter.className}>
```

**Benefits:**
- Self-hosted (no Google Fonts request)
- Preloaded (no FOUT - Flash of Unstyled Text)
- Optimized file size

### 4. Database Query Optimization

**Select Only Needed Fields:**
```tsx
// Bad: Fetch all fields
const user = await prisma.user.findUnique({ where: { id } })

// Good: Select specific fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true } // Only these fields
})
```

**Use Pagination:**
```tsx
const stocks = await prisma.stock.findMany({
  take: 20,  // Limit
  skip: 0,   // Offset
  orderBy: { createdAt: 'desc' }
})
```

### 5. Caching Strategy

**Server-Side:**
```tsx
const data = await fetch('https://api.example.com', {
  next: { revalidate: 3600 } // Cache for 1 hour
})
```

**Client-Side:**
```tsx
const { data } = useSWR('/api/stocks', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false
})
```

---

## State Management Strategy

### No Global State Library Needed

**Why?**
- Server components fetch fresh data
- URL state for navigation (month, filters)
- Local state for UI (modals, forms)

**When you might need Redux/Zustand:**
- Complex cross-component state
- Offline-first apps
- Real-time collaboration

**Current Approach:**

1. **Server State:** Fetched in server components
2. **URL State:** Search params for filters
3. **Local State:** useState for UI

**Example:**
```tsx
// URL state
const month = searchParams.get('month') || dayjs().format('YYYY-MM')

// Local state
const [showModal, setShowModal] = useState(false)

// Server state
const stocks = await prisma.stock.findMany()
```

---

## Key Features Implementation

### 1. Carry-Forward Balance

**Business Logic:**
```typescript
export function getCarryForwardBalance(
  entries: LedgerEntry[], 
  currentMonth: string
): number {
  const monthStart = dayjs(currentMonth + '-01').startOf('month')
  
  return entries
    .filter(e => dayjs(e.date).isBefore(monthStart))
    .reduce((balance, entry) => {
      const amount = toNumber(entry.amount)
      return entry.type === 'IN' 
        ? balance + amount 
        : balance - amount
    }, 0)
}
```

**Why in lib/ledger.ts?**
- Reusable across pages
- Testable in isolation
- Separates business logic from UI

### 2. Running Balance

**Algorithm:**
```typescript
let runningBalance = carryForwardBalance

const entriesWithBalance = sortedEntries.map(entry => {
  const amount = toNumber(entry.amount)
  
  if (entry.type === 'IN') {
    runningBalance += amount
  } else {
    runningBalance -= amount
  }
  
  return {
    ...entry,
    runningBalance
  }
})
```

**Complexity:** O(n) - Single pass through entries

### 3. Shipment Profitability

**Data Structure:**
```typescript
const shipmentMap = new Map<string, {
  invested: number,
  collected: number,
  transactions: LedgerEntry[]
}>()

// Aggregate by shipment
allEntries.forEach(entry => {
  if (!entry.shipmentId) return
  
  const data = shipmentMap.get(entry.shipmentId) || {
    invested: 0,
    collected: 0,
    transactions: []
  }
  
  const amount = toNumber(entry.amount)
  if (entry.type === 'OUT') {
    data.invested += amount
  } else {
    data.collected += amount
  }
  
  data.transactions.push(entry)
  shipmentMap.set(entry.shipmentId, data)
})

// Calculate net profit
const performance = Array.from(shipmentMap.entries()).map(([id, data]) => ({
  shipmentId: id,
  invested: data.invested,
  collected: data.collected,
  net: data.collected - data.invested,
  transactions: data.transactions
}))
```

**Why Map instead of Object?**
- Better performance for frequent lookups
- Preserves insertion order
- Can use any type as key

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Seed database (optional)
npx prisma db seed

# Start dev server
npm run dev
```

### Database Workflow

**Schema Changes:**
1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate` (update TypeScript types)
3. Run `npx prisma db push` (apply to database)

**Migrations (Production):**
```bash
npx prisma migrate dev --name add_stock_table
```

**Why migrations?**
- Version control for database
- Rollback capability
- Team collaboration

### Git Workflow

```bash
# Feature branch
git checkout -b feature/inventory

# Commit changes
git add .
git commit -m "Add inventory management"

# Push to GitHub
git push origin feature/inventory

# Create pull request
# Merge to main
```

---

## Deployment Architecture

### Vercel Platform

**Why Vercel?**
1. **Made by Next.js creators**
   - Best Next.js support
   - Zero configuration

2. **Global CDN**
   - Static assets served from edge
   - Fast worldwide

3. **Serverless Functions**
   - API routes auto-scale
   - Pay per request

4. **Automatic Deployments**
   - Push to GitHub → Auto deploy
   - Preview deployments for PRs

5. **Environment Variables**
   - Secure secret management
   - Different values per environment

### Deployment Flow

```
1. Push to GitHub
   ↓
2. Vercel detects change
   ↓
3. Run build:
   - npm install
   - npx prisma generate
   - npx prisma db push
   - next build
   ↓
4. Deploy to edge network
   ↓
5. Live at https://bos-ledger.vercel.app
```

### Database (Vercel Postgres)

**Features:**
- Managed PostgreSQL
- Automatic backups
- Connection pooling
- SSL encryption

**Connection:**
```env
DATABASE_URL="postgresql://user:pass@host/db"
POSTGRES_URL="postgresql://..." # Direct connection
```

---

## Trade-offs & Design Decisions

### 1. Server Components vs Client Components

**Decision:** Use server components by default

**Trade-offs:**
- ✅ Faster initial load
- ✅ Better SEO
- ✅ Smaller JavaScript bundle
- ❌ Can't use hooks
- ❌ Can't use browser APIs

**When we chose client:**
- Forms (need useState)
- Modals (need interaction)
- Navigation menu (need onClick)

### 2. Prisma vs Raw SQL

**Decision:** Use Prisma ORM

**Trade-offs:**
- ✅ Type safety
- ✅ Auto-generated types
- ✅ Easier migrations
- ❌ Slight performance overhead
- ❌ Less control over queries

**When raw SQL might be better:**
- Complex analytics queries
- Performance-critical operations
- Legacy database integration

### 3. Tailwind vs CSS Modules

**Decision:** Use Tailwind CSS

**Trade-offs:**
- ✅ Faster development
- ✅ Consistent design system
- ✅ Smaller bundle (purged CSS)
- ❌ Verbose className strings
- ❌ Learning curve

### 4. NextAuth vs Custom Auth

**Decision:** Use NextAuth.js

**Trade-offs:**
- ✅ Battle-tested security
- ✅ Multiple providers support
- ✅ Less code to maintain
- ❌ Some configuration complexity
- ❌ Opinionated structure

### 5. Monorepo vs Separate Frontend/Backend

**Decision:** Monorepo (Next.js full-stack)

**Trade-offs:**
- ✅ Single deployment
- ✅ Shared types
- ✅ Simpler infrastructure
- ❌ Tighter coupling
- ❌ Can't scale frontend/backend independently

---

## Conclusion

BOS Ledger demonstrates modern full-stack development with Next.js 14, leveraging:

**Performance:**
- Server-side rendering for fast initial loads
- Code splitting for optimal bundle sizes
- Image and font optimization

**Developer Experience:**
- TypeScript for type safety
- Prisma for database type safety
- Hot module replacement for fast development

**Scalability:**
- Serverless architecture
- PostgreSQL for data integrity
- Vercel edge network for global reach

**Security:**
- NextAuth.js for authentication
- bcrypt for password hashing
- Environment variable separation

**Maintainability:**
- Component-based architecture
- Separation of server and client logic
- Consistent coding patterns

This architecture is production-ready, scalable, and follows industry best practices for modern web applications.
