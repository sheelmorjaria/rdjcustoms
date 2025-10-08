# Logo Setup Instructions

## Adding Your Logo

To replace the "RDJCustoms" text with your logo in the header:

### 1. Prepare Your Logo File

1. **File Requirements:**
   - Format: `.webp` (recommended for web performance)
   - Alternative formats: `.png`, `.jpg`, `.svg` also work
   - Recommended size: 200px-400px wide, 80px-120px height
   - Transparent background preferred

2. **File Naming:**
   - Name it `logo.webp` exactly
   - Or update the code to match your filename

### 2. Add Logo to Project

Place your logo file in the frontend public directory:
```
frontend/public/logo.webp
```

### 3. Logo Specifications

The current code is set up with:
- **Height:** 64px on mobile, 80px on desktop (h-16 md:h-20)
- **Width:** Auto (maintains aspect ratio)
- **Fallback:** Text "RDJCustoms" appears if logo fails to load

### 4. Customizing Logo Size

To adjust the logo size, edit the `className` in `frontend/src/App.jsx`:

```jsx
className="h-16 md:h-20 w-auto"  // Current: 64px mobile, 80px desktop
```

Common height options:
- `h-8` = 32px
- `h-10` = 40px
- `h-12` = 48px
- `h-16` = 64px (current mobile)
- `h-20` = 80px (current desktop)
- `h-24` = 96px

### 5. Alternative File Formats

If you prefer a different format, update the src in `App.jsx`:

```jsx
// For PNG
src="/logo.png"

// For SVG
src="/logo.svg"

// For JPG
src="/logo.jpg"
```

### 6. Testing

After adding your logo:

1. Restart the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Check that the logo appears in the header
3. Test the fallback by temporarily renaming the logo file

### 7. Logo Design Tips

- **Contrast:** Ensure logo is visible on the dark forest-green header background
- **Size:** Keep it legible at small sizes
- **Brand:** Make sure it represents your brand well
- **Performance:** WebP format provides best compression

### 8. Responsive Considerations

The logo is set to be responsive:
- On mobile: May need smaller size
- On desktop: Current size should work well

To make it more responsive, you could update the className to:
```jsx
className="h-8 md:h-10 w-auto"  // Smaller on mobile, larger on desktop
```

## Current Code Location

The logo code is in:
```
frontend/src/App.jsx
Lines 138-157 (in the Header component)
```

## Troubleshooting

**Logo not appearing?**
1. Check file path is correct: `frontend/public/logo.webp`
2. Check filename matches exactly (case-sensitive)
3. Verify file isn't corrupted
4. Check browser console for errors

**Logo too big/small?**
- Adjust the `h-10` class to `h-8`, `h-12`, etc.

**Want to add text alongside logo?**
- Remove the `hidden` class from the span
- Adjust layout as needed