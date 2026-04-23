# UI Guidelines

This document defines the shared frontend foundation for `jerSEys` so multiple teammates can build pages without the app drifting visually or structurally.

## Shared UI Primitives

Use the shared primitives in `src/components/ui/` before creating one-off versions.

- `Button.jsx`
  Use for primary, secondary, and ghost actions.
- `Card.jsx`
  Use for white surfaced containers, dashboard blocks, and content groups.
- `PageShell.jsx`
  Use as the outer wrapper for every route-level page.
- `PageHeader.jsx`
  Use for route titles, eyebrow labels, short descriptions, and top-right actions.
- `FormField.jsx`
  Use to keep labels, hints, and errors aligned consistently.
- `StateBlock.jsx`
  Use for empty, loading, success, and error states.

Import pattern:

```jsx
import { Button, Card, FormField, PageHeader, PageShell, StateBlock } from '../components/ui';
```

## Shared Styling Rules

The shared UI stylesheet is:

```text
src/styles/ui.css
```

The shared design tokens live in:

```text
src/styles/variables.css
```

When styling new pages:

- Use color variables like `var(--crimson)` and `var(--text-2)` instead of hardcoding colors.
- Use spacing tokens like `var(--space-4)` and `var(--space-6)` instead of random pixel values.
- Use `var(--radius-sm)` and `var(--radius-md)` for border radius.
- Use `var(--shadow-sm)` and `var(--shadow-md)` for elevation.
- Prefer extending the shared primitives over adding new button/card patterns.

## Reusable Form Patterns

All forms should follow the same structure:

1. Wrap the page in `PageShell`.
2. Use `PageHeader` at the top.
3. Use a `Card` as the form container.
4. Use `.ui-form` or `.ui-form-grid` for layout.
5. Use `FormField` for every input, select, and textarea.
6. Use shared control classes: `ui-input`, `ui-select`, and `ui-textarea`.
7. Put actions at the bottom using `Button`.

Example:

```jsx
<PageShell narrow>
  <PageHeader
    eyebrow="Account"
    title="Sign In"
    description="Access your orders, saved kits, and trade offers."
  />

  <Card>
    <form className="ui-form">
      <div className="ui-form-grid">
        <FormField label="Email" htmlFor="email">
          <input id="email" className="ui-input" placeholder="you@example.com" />
        </FormField>

        <FormField label="Password" htmlFor="password" hint="Use at least 8 characters.">
          <input id="password" type="password" className="ui-input" />
        </FormField>
      </div>

      <div className="ui-inline-stack">
        <Button type="submit">Continue</Button>
        <Button variant="secondary" type="button">Cancel</Button>
      </div>
    </form>
  </Card>
</PageShell>
```

## Shared State Patterns

Avoid ad hoc text for app states. Use `StateBlock` for:

- Empty states
- Error states
- Loading placeholders that need text/action context
- Success confirmation blocks

Recommended copy pattern:

- Title: short and action-oriented
- Description: 1 or 2 sentences max
- Actions: one primary action, optional secondary action

Examples:

- Empty cart
- No trade requests yet
- Failed to load listing
- Order placed successfully

## Route And File Ownership Conventions

Use these rules to keep responsibilities clear:

- `src/pages/`
  Route-level pages only. These files should assemble sections and data flow, not contain lots of low-level UI duplication.
- `src/components/ui/`
  Shared primitives used across many pages.
- `src/components/<feature>/`
  Feature-specific presentational components, such as `home/`, `trade/`, or `shop/`.
- `src/layouts/`
  Page shells that control persistent layout like navbar/footer or auth/admin framing.
- `src/services/`
  API calls, data fetching, and request helpers only.
- `src/context/`
  Shared React context for app-wide state only.
- `src/utils/`
  Pure helpers and formatting utilities. No React components here.
- `src/styles/`
  Global styles, tokens, and feature stylesheets.

Ownership rule:

- If a component is reused by more than one route or feature, move it into `src/components/ui/` or a clearly shared folder.
- If a component is tied to one page domain only, keep it inside that feature area.

## Page Structure Convention

Each new route should usually follow this order:

1. `PageShell`
2. `PageHeader`
3. Main content section(s)
4. Empty/loading/error handling with `StateBlock`
5. Feature-specific cards, tables, or forms

This keeps routes predictable for every developer.

## Naming Conventions

- Components: `PascalCase`
- Route pages: `PascalCase`
- CSS classes: feature-prefixed or shared `ui-` classes
- Shared primitives: always use the `ui-` prefix in CSS

Examples:

- Good: `trade-market-grid`, `shop-filter-bar`, `ui-button`
- Avoid: `box1`, `wrapper2`, `redButton`

## When To Create A New Primitive

Create a new shared primitive only if at least one is true:

- The pattern appears on 3 or more pages
- The pattern has repeated styling and behavior
- The pattern affects overall consistency, such as tabs, badges, or tables

If it is page-specific, keep it local until repetition is clear.

## Immediate Team Recommendation

For all new route pages starting now:

- Use `PageShell`
- Use `PageHeader`
- Use shared `Button`
- Use shared `Card`
- Use `FormField` with `ui-input` classes for forms
- Use `StateBlock` for empty/error states

That alone will keep the project much more consistent while the rest of the team builds.
