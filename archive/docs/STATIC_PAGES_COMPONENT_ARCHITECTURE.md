# EcoHub Static Pages - Component Architecture

## Component Usage Summary

### Shadcn UI Components Used

| Component                     | Pages Used                          | Purpose                           |
| ----------------------------- | ----------------------------------- | --------------------------------- |
| `Button`                      | All pages                           | CTAs, navigation, form submission |
| `Card` / `CardContent`        | About, How It Works, Sustainability | Grouped content sections          |
| `Input`                       | Contact                             | Form fields (existing)            |
| `Textarea`                    | Contact                             | Message input (existing)          |
| `Accordion` / `AccordionItem` | FAQ (existing)                      | Expandable Q&A sections           |
| `Label`                       | Contact (existing)                  | Form labels                       |

### Lucide React Icons Used

| Icon                      | Pages               | Purpose                |
| ------------------------- | ------------------- | ---------------------- |
| `CheckCircle`             | About, How It Works | Checkmarks in lists    |
| `ArrowRight`              | How It Works        | Flow indicators        |
| `Leaf`                    | Sustainability      | Eco-friendly indicator |
| `Droplet`                 | Sustainability      | Water/resources        |
| `Zap`                     | Sustainability      | Energy                 |
| `Recycle`                 | Sustainability      | Recycling              |
| `Award`                   | Sustainability      | Certification          |
| `Lightbulb`               | Sustainability      | Innovation             |
| `Mail`, `Phone`, `MapPin` | Contact (existing)  | Contact methods        |
| `HelpCircle`              | FAQ (existing)      | Help indicator         |

## Page Layout Patterns

### Hero Section Pattern

```tsx
<div className="py-24 relative overflow-hidden bg-gradient-to-br from-[color]-50 to-[color]-100">
  <div className="container px-4 md:px-6 relative z-10">
    <div className="text-center mb-20">
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">{t("hero.title")}</h1>
      <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-12">
        {t("hero.subtitle")}
      </p>
      {/* CTAs */}
    </div>
  </div>
</div>
```

### Content Section Pattern

```tsx
<div className="py-16 md:py-24">
  <div className="container px-4 md:px-6">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">{t("section.heading")}</h2>
      {/* Content */}
    </div>
  </div>
</div>
```

### Grid Section Pattern

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {t.raw("items").map((item: any, idx: number) => (
    <Card key={idx}>
      <CardContent className="pt-6">{/* Card content */}</CardContent>
    </Card>
  ))}
</div>
```

### CTA Section Pattern

```tsx
<div className="py-16 md:py-24 bg-gradient-to-r from-[color]-600 to-[color]-600">
  <div className="container px-4 md:px-6 text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t("cta.heading")}</h2>
    <p className="text-lg text-[color]-50 max-w-2xl mx-auto mb-8">{t("cta.subtitle")}</p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">{/* CTA Buttons */}</div>
  </div>
</div>
```

## Color Scheme by Page

| Page           | Primary | Secondary | Gradient                 |
| -------------- | ------- | --------- | ------------------------ |
| About          | Emerald | Green     | emerald-50 → emerald-100 |
| How It Works   | Blue    | Cyan      | blue-50 → cyan-100       |
| Sustainability | Green   | Teal      | green-50 → teal-100      |
| Contact        | Purple  | Pink      | purple-50 → pink-100     |
| FAQ            | Orange  | Amber     | orange-50 → amber-100    |

## Responsive Breakpoints

- **Mobile:** Base styles (no prefix)
- **Tablet:** `md:` breakpoint (768px)
- **Desktop:** `lg:` breakpoint (1024px)

Common patterns:

```tsx
// Single column on mobile, 2-3 columns on larger screens
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Full width text on mobile, max-width on desktop
className = "max-w-3xl mx-auto"

// Stacked buttons on mobile, inline on desktop
className = "flex flex-col sm:flex-row gap-4"
```

## Spacing Pattern

- **Sections:** `py-16 md:py-24` (vertical padding)
- **Large sections:** `py-24` or `py-16 md:py-24`
- **Small sections:** `py-12` or `py-8`
- **Container padding:** `px-4 md:px-6`
- **Content margins:** `mb-8`, `mb-12`, `mb-16`, `mb-20`
- **Item spacing:** `gap-8` (standard), `gap-6` (compact), `space-y-4` (text)

## Typography Hierarchy

```
Hero Title:      text-5xl md:text-6xl font-bold
Section Title:   text-4xl font-bold or text-3xl md:text-4xl
Subsection:      text-2xl font-bold or text-xl font-bold
Body Text:       text-lg or text-base
Small Text:      text-sm
```

## Data Fetching Pattern

All pages use the same async pattern:

```tsx
export default async function PageName({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pageNamespace" })

  return (
    // JSX using t() for translations
  )
}
```

### Why Async?

- Next.js 14+ requires async params handling
- Enables server-side rendering and optimization
- Direct access to locale context without client-side overhead
- Supports dynamic content generation

## Common Patterns

### Rendering Arrays with Fallback

```tsx
{
  t
    .raw("items")
    .map((item: any, idx: number) => <div key={idx}>{/* Use item properties */}</div>) || (
    <p>No items available</p>
  )
}
```

### Conditional Icon Rendering

```tsx
const iconMap: Record<string, React.ComponentType<{ className: string }>> = {
  Leaf, Droplet, Zap, Recycle, Award, Lightbulb,
}
const IconComponent = pillar.icon ? iconMap[pillar.icon] : Leaf
<IconComponent className="w-12 h-12" />
```

### Locale-Aware Links

```tsx
<Link href={`/${locale}/marketplace`}>{t("link.text")}</Link>
```

## Performance Considerations

1. **Server Rendering:** All pages render on server for faster initial load
2. **Static Content:** Pages contain static HTML with dynamic translations
3. **Image Optimization:** Uses Next.js Image component when needed (not currently used)
4. **CSS-in-JS:** Tailwind CSS for styling (no runtime overhead)
5. **Component Splitting:** Uses Shadcn UI pre-built components

## Accessibility Features

- Semantic HTML headings (h1, h2, h3)
- Proper heading hierarchy
- Icon labels with text context
- Color contrast maintained
- Button text is descriptive
- Links are understandable out of context
- Form labels (on existing contact form)

## SEO Optimization

- Server-side rendering (SSR)
- Proper heading hierarchy
- Meta tags support ready (though not implemented yet)
- Canonical URLs (about-us, how-it-works, sustainability)
- Sitemap friendly URLs
- Structured content sections
- Link text is descriptive

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- ES2020+ JavaScript
- CSS Grid and Flexbox support required

## Testing Considerations

### Unit Tests

- Translation key availability
- Locale parameter handling
- Conditional rendering logic

### Integration Tests

- Page renders with correct locale
- Links navigate to correct URLs
- Forms submit (contact page)
- Accordion toggles (FAQ page)

### E2E Tests

- Navigation between pages
- Responsive layout on different screen sizes
- Link functionality
- Form submission flow
