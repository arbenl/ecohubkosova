# EcoHub Static Pages - Translation Keys Quick Reference

## Pages Created

### 1. /about-us (CANONICAL)

**Namespace:** `about`

Required keys:

```
hero.title
hero.subtitle
hero.cta.primary
hero.cta.secondary

advocacy.heading
advocacy.body

actions.heading
actions.businesses.title
actions.businesses.items (array of strings)
actions.municipalities.title
actions.municipalities.items (array of strings)
actions.citizens.title
actions.citizens.items (array of strings)
actions.inlineCta
actions.browse
actions.organizations

who.heading
who.body
who.principles (array of strings)
who.cta
who.ctaLink

common.or
```

### 2. /how-it-works

**Namespace:** `howItWorks`

Required keys:

```
hero.title
hero.subtitle

consumers.title
consumers.steps (array of objects: { number, title, description })
consumers.cta

sellers.title
sellers.steps (array of objects: { number, title, description })
sellers.cta

features.title
features.items (array of objects: { title, description })

benefits.title
benefits.items (array of objects: { title, points (array) })

cta.heading
cta.subtitle
cta.browse
cta.sell
```

### 3. /sustainability

**Namespace:** `sustainability`

Required keys:

```
hero.title
hero.subtitle

mission.heading
mission.body
mission.cta

pillars.heading
pillars.items (array of objects: { title, description, icon?, points? })
  Available icons: Leaf, Droplet, Zap, Recycle, Award, Lightbulb

impact.heading
impact.metrics (array of objects: { value, label })
impact.description

certification.heading
certification.title
certification.body
certification.standards (array of strings)
certification.cta

partnerships.heading
partnerships.title
partnerships.body
partnerships.partners (array of strings)

cta.heading
cta.subtitle
cta.browse
cta.partner
```

### 4. /contact (EXISTING)

**Namespace:** `contact`

- Page uses existing implementation
- No new keys required

### 5. /faq (EXISTING)

**Namespace:** `faq`

- Page uses existing implementation
- No new keys required

## Data Structure Examples

### Steps Array (How It Works)

```json
"steps": [
  {
    "number": "1",
    "title": "Browse Products",
    "description": "Explore our marketplace of sustainable products"
  },
  {
    "number": "2",
    "title": "Select & Pay",
    "description": "Choose your items and complete payment"
  },
  {
    "number": "3",
    "title": "Receive Order",
    "description": "Get your eco-friendly products delivered"
  },
  {
    "number": "4",
    "title": "Enjoy & Share",
    "description": "Use your purchase and tell others"
  }
]
```

### Features Array (How It Works)

```json
"items": [
  {
    "title": "Verified Sellers",
    "description": "All sellers are verified for sustainability"
  },
  {
    "title": "Secure Payment",
    "description": "Safe and encrypted transactions"
  },
  {
    "title": "Fast Shipping",
    "description": "Quick delivery to your door"
  }
]
```

### Benefits Array (How It Works)

```json
"items": [
  {
    "title": "For Consumers",
    "points": [
      "Access to eco-friendly products",
      "Support local sustainable businesses",
      "Make a positive environmental impact"
    ]
  },
  {
    "title": "For Sellers",
    "points": [
      "Reach conscious consumers",
      "Grow your sustainable business",
      "Build brand loyalty"
    ]
  }
]
```

### Pillars Array (Sustainability)

```json
"items": [
  {
    "icon": "Leaf",
    "title": "Environmental Protection",
    "description": "We prioritize products and practices...",
    "points": [
      "Reduce carbon footprint",
      "Support renewable resources",
      "Minimize waste"
    ]
  },
  {
    "icon": "Droplet",
    "title": "Water Conservation",
    "description": "Every drop matters...",
    "points": [
      "Reduce water usage",
      "Protect water sources"
    ]
  }
]
```

### Metrics Array (Sustainability)

```json
"metrics": [
  {
    "value": "500+",
    "label": "Eco-friendly Products"
  },
  {
    "value": "50K+",
    "label": "Active Consumers"
  },
  {
    "value": "2M kg",
    "label": "CO2 Prevented"
  },
  {
    "value": "100+",
    "label": "Verified Sellers"
  }
]
```

## Rendering Patterns in Components

### Simple Strings

```tsx
<h1>{t("hero.title")}</h1>
```

### Arrays of Strings

```tsx
{
  t.raw("who.principles").map((principle: string, idx: number) => <li key={idx}>{principle}</li>)
}
```

### Arrays of Objects

```tsx
{
  t.raw("consumers.steps").map((step: any, idx: number) => (
    <div key={idx}>
      <div>{step.number}</div>
      <h3>{step.title}</h3>
      <p>{step.description}</p>
    </div>
  ))
}
```

## Testing Checklist

- [ ] All pages render without translation missing warnings
- [ ] Locale parameter is properly extracted and used
- [ ] Links to other pages include locale prefix: `/${locale}/path`
- [ ] Accordion components expand/collapse on /faq
- [ ] Contact form on /contact functions (existing)
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] All color gradients display correctly
- [ ] Icons render properly
- [ ] Navigation between pages works
- [ ] Redirects work: /about → /about-us, etc.

## Locale Support

All pages support:

- **Albanian:** `sq` locale
- **English:** `en` locale

URLs follow pattern: `/{locale}/{page-path}`

Examples:

- `https://ecohub.com/en/about-us`
- `https://ecohub.com/sq/about-us`
- `https://ecohub.com/en/how-it-works`
- `https://ecohub.com/sq/sustainability`
