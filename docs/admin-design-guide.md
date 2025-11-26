# Admin Panel Design Guide

## Color Schema

The admin panel uses a dark theme with three primary colors:

| Color     | Tailwind Class                | Usage                                         |
| --------- | ----------------------------- | --------------------------------------------- |
| **Blue**  | `bg-blue-600`                 | Primary actions, active states, status badges |
| **Grey**  | `bg-gray-600` / `bg-gray-700` | Secondary actions, disabled states            |
| **Green** | `bg-green-700`                | Admin-sent messages (to distinguish from AI)  |

## Button Styles

### Primary Action

```html
<button class="bg-blue-600 hover:bg-blue-700 text-white">
  Enable Manual Mode
</button>
```

### Secondary Action

```html
<button class="bg-gray-700 hover:bg-gray-600 text-white">View User</button>
```

### Toggle Off State

```html
<button class="bg-gray-600 hover:bg-gray-500 text-white">
  Disable Manual Mode
</button>
```

## Status Badges

```html
<span class="bg-blue-600 text-white text-xs px-2 py-1 rounded">
  Manual Mode
</span>
```

## Chat Message Bubbles

| Sender    | Color     | Class          |
| --------- | --------- | -------------- |
| User      | Dark grey | `bg-gray-800`  |
| AI (Gozy) | Blue      | `bg-blue-600`  |
| Admin     | Green     | `bg-green-700` |

User messages align left, assistant messages (AI and Admin) align right.

## Dark Mode

The admin panel uses `color-scheme: dark` for native dark scrollbars:

```html
<html class="dark">
  <style>
    .dark {
      color-scheme: dark;
    }
  </style>
</html>
```

## Background Colors

- Page background: `bg-black`
- Card/panel background: `bg-gray-900`
- Input fields: `bg-gray-950`
- Borders: `border-gray-800`
