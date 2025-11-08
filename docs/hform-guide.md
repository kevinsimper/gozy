# HForm Documentation

HForm is a type-safe form handling library designed for Hono applications. It provides seamless integration with Zod schemas, HTMX support, and server-side rendering using JSX.

## Table of Contents

- [Overview](#overview)
- [Installation & Setup](#installation--setup)
- [Basic Usage](#basic-usage)
- [Field Types](#field-types)
- [Validation](#validation)
- [HTMX Integration](#htmx-integration)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## Overview

HForm solves common form handling challenges:

- Type-safe form definitions with TypeScript
- Runtime validation with Zod schemas
- HTMX integration for dynamic updates
- Server-side rendering with JSX
- Consistent error handling

## Installation & Setup

HForm is already included in the Zeus project at `src/services/hform/`. To use it in your routes:

```typescript
import { HForm, buildZodSchema } from "../services/hform";
import { z } from "zod";
```

## Basic Usage

### 1. Define your form fields

```typescript
const fields = [
  {
    name: "email",
    label: "Email Address",
    htmlType: "email",
    required: true,
    zodSchema: z.string().email("Invalid email address"),
    placeholder: "user@example.com",
  },
  {
    name: "password",
    label: "Password",
    htmlType: "password",
    required: true,
    zodSchema: z.string().min(8, "Password must be at least 8 characters"),
  },
] as const;
```

### 2. Build the schema and form

```typescript
const { schema, formDefinition } = buildZodSchema(fields);

const form = HForm(formDefinition, {
  id: "login-form",
  hxPost: "/login",
  hxTarget: "#form-container",
  hxSwap: "innerHTML",
});
```

### 3. Handle form submission

```typescript
app.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const parseResult = schema.safeParse(body);

  if (!parseResult.success) {
    const errors = form.handleValidation(parseResult);
    return c.html(form.render(body, errors));
  }

  // Process valid data
  const { email, password } = parseResult.data;
  // ... authentication logic
});
```

### 4. Render the form

```typescript
app.get("/login", (c) => {
  return c.html(
    <div id="form-container">
      {form.render()}
    </div>
  );
});
```

**Note**: You don't need to use `await` with `form.render()` in JSX context. While `render()` returns a Promise, Hono's JSX automatically handles async components, so `{form.render()}` works correctly without `await`.

### 5. Render with prefilled values

```typescript
app.get("/profile/edit", async (c) => {
  const user = await getUser(c);

  // Prefill form with existing user data
  const values = {
    email: user.email,
    username: user.username,
    bio: user.bio
  };

  return c.html(
    <div id="form-container">
      {form.render(values)}
    </div>
  );
});
```

## Field Types

### Text Input

```typescript
{
  name: "username",
  label: "Username",
  htmlType: "text",
  required: true,
  zodSchema: z.string().min(3).max(20),
  placeholder: "Enter username"
}
```

### Email Input

```typescript
{
  name: "email",
  label: "Email",
  htmlType: "email",
  required: true,
  zodSchema: z.string().email()
}
```

### Password Input

```typescript
{
  name: "password",
  label: "Password",
  htmlType: "password",
  required: true,
  zodSchema: z.string().min(8),
  description: "Must be at least 8 characters"
}
```

### Number Input

```typescript
{
  name: "age",
  label: "Age",
  htmlType: "number",
  required: false,
  zodSchema: z.number().min(18).max(120).optional()
}
```

### Checkbox

```typescript
{
  name: "terms",
  label: "I agree to the terms",
  htmlType: "checkbox",
  required: true,
  zodSchema: z.boolean(),
  description: "You must agree to continue"
}
```

### Textarea

```typescript
{
  name: "message",
  label: "Message",
  htmlType: "textarea",
  required: true,
  zodSchema: z.string().min(10).max(500),
  rows: 4
}
```

### Select

```typescript
{
  name: "country",
  label: "Country",
  htmlType: "select",
  required: true,
  zodSchema: z.enum(["us", "uk", "ca"]),
  options: [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" }
  ]
}
```

### File Upload

```typescript
{
  name: "avatar",
  label: "Profile Picture",
  htmlType: "file",
  required: false,
  zodSchema: z.instanceof(File).optional(),
  accept: "image/*"
}
```

## Validation

### Zod Schema Integration

HForm automatically builds a Zod schema from your field definitions:

```typescript
const { schema } = buildZodSchema(fields);
// schema is now a Zod object schema with all field validations
```

### Custom Validation Messages

```typescript
{
  name: "username",
  zodSchema: z.string()
    .min(3, "Username too short")
    .max(20, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
}
```

### Handling Validation Errors

```typescript
const parseResult = schema.safeParse(formData);
if (!parseResult.success) {
  const errors = form.handleValidation(parseResult);
  // errors: { fieldName?: string, general?: string }
  return c.html(form.render(formData, errors));
}
```

## HTMX Integration

### Basic HTMX Form

```typescript
const form = HForm(formDefinition, {
  id: "my-form",
  hxPost: "/submit",
  hxTarget: "#result",
  hxSwap: "innerHTML",
  hxIndicator: "#loading",
});
```

### Loading States

```typescript
// In your HTML
<div id="loading" class="htmx-indicator">
  <div class="spinner">Loading...</div>
</div>
```

### Response Handling

```typescript
app.post("/submit", async (c) => {
  // ... validation

  if (success) {
    c.header("HX-Trigger", "formSuccess");
    return c.html(<div>Success!</div>);
  }

  return c.html(form.render(data, errors));
});
```

## Examples

### Login Form (from services/hform/example/login.tsx)

```typescript
const fields = [
  {
    name: "username",
    label: "Username",
    htmlType: "email",
    required: true,
    zodSchema: z.string().email(),
  },
  {
    name: "password",
    label: "Password",
    htmlType: "password",
    required: true,
    zodSchema: z.string().min(3),
  },
] as const;

const { schema, formDefinition } = buildZodSchema(fields);
const form = HForm(formDefinition, {
  hxPost: "/htmx/login",
  hxTarget: "#login-form",
  hxSwap: "outerHTML",
});
```

### File Upload Form (from services/hform/example/fileupload.tsx)

```typescript
const fields = [
  {
    name: "title",
    label: "Title",
    htmlType: "text",
    required: true,
    zodSchema: z.string().min(1),
  },
  {
    name: "file",
    label: "File",
    htmlType: "file",
    required: true,
    zodSchema: z.any(),
  },
] as const;

const form = HForm(formDefinition, {
  method: "POST",
  action: "/htmx/fileupload",
  enctype: "multipart/form-data",
});
```

### Organization Creation (from actual usage)

```typescript
const fields = [
  {
    name: "name",
    label: "Organization Name",
    htmlType: "text",
    required: true,
    zodSchema: z.string().min(1, "Organization name is required"),
    placeholder: "Enter organization name",
  },
] as const;

const form = HForm(formDefinition, {
  method: "POST",
  action: lk(AppLink.DashboardOrganizationsCreate),
});
```

## API Reference

### `buildZodSchema(fields)`

Builds a Zod schema and form definition from field array.

**Parameters:**

- `fields`: Array of field definitions (must use `as const`)

**Returns:**

- `schema`: Zod object schema
- `formDefinition`: Processed field definitions for HForm

### `HForm(fields, options)`

Creates a form instance with rendering and validation methods.

**Parameters:**

- `fields`: Field definitions from buildZodSchema
- `options`: Form configuration
  - `id?`: Form element ID
  - `method?`: HTTP method (GET/POST)
  - `action?`: Form action URL
  - `hxPost?`: HTMX POST endpoint
  - `hxTarget?`: HTMX target selector
  - `hxSwap?`: HTMX swap strategy
  - `hxIndicator?`: Loading indicator selector
  - `enctype?`: Form encoding type

**Returns:**

- Form instance with methods:
  - `render(values?, errors?)`: Render form HTML with optional prefilled values and errors
  - `handleValidation(parseResult)`: Process Zod errors
  - `renderField(field, value?, error?)`: Render single field

### Field Definition Type

```typescript
type FieldDefinition = {
  name: string;
  label: string;
  htmlType:
    | "text"
    | "email"
    | "password"
    | "number"
    | "checkbox"
    | "file"
    | "textarea"
    | "select";
  required: boolean;
  zodSchema: ZodSchema;
  placeholder?: string;
  description?: string;
  rows?: number; // for textarea
  options?: Array<{ value: string; label: string }>; // for select
  accept?: string; // for file input
};
```

## Best Practices

### 1. Always use `as const`

```typescript
const fields = [...] as const;
// This ensures proper type inference
```

### 2. Provide user-friendly validation messages

```typescript
zodSchema: z.string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username cannot exceed 20 characters");
```

### 3. Use HTMX for better UX

```typescript
// Replace full page reloads with partial updates
hxTarget: "#form-container",
hxSwap: "outerHTML"
```

### 4. Handle file uploads properly

```typescript
// Always set enctype for file uploads
enctype: "multipart/form-data";
```

### 5. Implement proper error handling

```typescript
if (!parseResult.success) {
  const errors = form.handleValidation(parseResult);
  return c.html(form.render(formData, errors));
}
```

### 6. Use loading indicators

```typescript
hxIndicator: "#loading-spinner";
// Style with CSS: .htmx-indicator { display: none; }
// HTMX shows it during requests
```

### 7. Avoid duplicate IDs

When using HTMX, the form's `id` parameter sets the ID on the `<form>` element itself. Don't wrap the form in a div with the same ID:

```typescript
// ❌ Bad - duplicate IDs
<div id="my-form-container">
  {form.render()}  // This creates <form id="my-form-container">
</div>

// ✅ Good - unique IDs
<div class="p-6">
  {form.render()}  // Form has its own ID from the options
</div>

// ✅ Good - different IDs if wrapper needed
<div id="form-wrapper">
  {form.render()}  // Form uses id from HForm options
</div>
```

### 8. Progressive enhancement

```typescript
// Form works without JavaScript
method: "POST",
action: "/submit",
// Enhanced with HTMX when available
hxPost: "/submit",
hxTarget: "#result"
```

## Common Patterns

### Prefilling Forms

Forms can be prefilled with existing data for edit operations:

```typescript
// Edit existing organization
app.get("/organizations/:id/edit", async (c) => {
  const org = await getOrganization(c.req.param("id"));

  const values = {
    name: org.name,
    description: org.description,
    country: org.country,
    isActive: org.isActive
  };

  return c.html(
    <div>
      <h2>Edit Organization</h2>
      {form.render(values)}
    </div>
  );
});

// After validation error, preserve user input
app.post("/organizations/:id/edit", async (c) => {
  const formData = await c.req.parseBody();
  const result = schema.safeParse(formData);

  if (!result.success) {
    const errors = form.handleValidation(result);
    // Re-render with user's input and errors
    return c.html(form.render(formData, errors));
  }

  // Update organization...
});
```

### Dynamic Select Options

```typescript
const getCountries = async () => {
  const countries = await fetchCountries();
  return countries.map((c) => ({
    value: c.code,
    label: c.name,
  }));
};

// In your route
const countries = await getCountries();
const form = HForm(formDefinition, options);
// Pass options when rendering
```

### Multi-step Forms

```typescript
// Step 1
const step1Form = HForm(step1Fields, {
  hxPost: "/wizard/step1",
  hxTarget: "#wizard-container",
});

// Return next step from POST handler
app.post("/wizard/step1", async (c) => {
  // Validate step 1
  return c.html(step2Form.render());
});
```

### Conditional Fields

```typescript
// Show/hide fields based on other values
const renderCustomForm = (values: FormValues) => {
  if (values.userType === "business") {
    return businessForm.render(values);
  }
  return personalForm.render(values);
};
```

## Troubleshooting

### Form not submitting with HTMX

- Check that HTMX script is loaded
- Verify hxPost URL is correct
- Check browser console for errors

### Validation errors not showing

- Ensure you're passing errors to render()
- Check field names match between schema and form

### File uploads failing

- Set `enctype="multipart/form-data"`
- Use `c.req.parseBody()` not `c.req.json()`
- Check file size limits

### Type errors with field definitions

- Always use `as const` on field arrays
- Ensure zodSchema matches htmlType

## Conclusion

HForm provides a robust, type-safe solution for form handling in Hono applications. By combining Zod validation, HTMX integration, and server-side rendering, it enables building interactive forms with minimal client-side JavaScript while maintaining excellent developer experience and type safety.
