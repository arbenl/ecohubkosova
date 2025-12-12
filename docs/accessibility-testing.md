# Accessibility Testing Guide

This document outlines our accessibility testing procedures to ensure EcoHub Kosova is usable by everyone.

## WCAG 2.1 Compliance Target

We aim for **WCAG 2.1 Level AA** compliance across all public pages.

## Automated Testing

### Tools We Use

1. **axe DevTools** (Browser Extension)
   - Install from [Chrome Web Store](https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnindnejefpokejbdd)
   - Run on every page to catch common issues

2. **Lighthouse** (Built into Chrome DevTools)
   - Press F12 → Lighthouse tab → Check "Accessibility"
   - Target score: 90+

3. **WAVE** (Browser Extension)
   - Visual feedback for accessibility issues
   - Helpful for understanding error context

### Running Automated Checks

```bash
# Run Lighthouse CI (if configured)
pnpm lighthouse

# Run playwright accessibility tests
pnpm test:e2e --grep "accessibility"
```

## Manual Testing Checklist

### Keyboard Navigation

- [ ] **Tab order** is logical (left-to-right, top-to-bottom)
- [ ] **Focus indicators** are visible on all interactive elements
- [ ] **Skip to content** link works (Tab from page load)
- [ ] **Modal dialogs** trap focus correctly
- [ ] **Dropdown menus** can be navigated with arrow keys
- [ ] **Escape key** closes modals and dropdowns
- [ ] **Enter/Space** activates buttons and links

### Screen Reader Testing

Test with at least one of:

- **VoiceOver** (macOS/iOS): Press Cmd+F5 to enable
- **NVDA** (Windows): Free download from nvaccess.org
- **TalkBack** (Android): Settings → Accessibility

#### What to Check

- [ ] Page **headings** are announced correctly (h1 → h2 → h3 hierarchy)
- [ ] **Images** have meaningful alt text (or empty alt for decorative)
- [ ] **Form labels** are associated with inputs
- [ ] **Error messages** are announced when they appear
- [ ] **Button purposes** are clear from their labels
- [ ] **Links** indicate where they lead
- [ ] **Tables** have proper headers
- [ ] **ARIA landmarks** identify page regions

### Visual Testing

- [ ] **Color contrast** ratio is at least 4.5:1 for normal text
- [ ] **Color contrast** ratio is at least 3:1 for large text (18pt+)
- [ ] **Information** is not conveyed by color alone
- [ ] **Text can be resized** to 200% without loss of content
- [ ] **Animations** can be paused or respect `prefers-reduced-motion`

### Responsive & Zoom

- [ ] Content is **readable at 400% zoom**
- [ ] **Touch targets** are at least 44x44 pixels on mobile
- [ ] **No horizontal scrolling** required on mobile

## Page-Specific Checklists

### Homepage

- [ ] Hero section is keyboard accessible
- [ ] CTA buttons have clear labels
- [ ] Partner logos have alt text

### Marketplace

- [ ] Filter controls are keyboard accessible
- [ ] Listing cards have descriptive alt text
- [ ] Pagination is keyboard navigable

### Forms (Login, Register, Contact)

- [ ] All inputs have visible labels
- [ ] Required fields are indicated
- [ ] Error messages are associated with inputs
- [ ] Form submits on Enter key

### Modals & Dialogs

- [ ] Focus moves to modal when opened
- [ ] Focus is trapped within modal
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element on close

## Common Issues & Fixes

### Missing Form Labels

```tsx
// ❌ Bad
<input type="email" placeholder="Email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="user@example.com" />
```

### Images Without Alt Text

```tsx
// ❌ Bad
<img src="/photo.jpg" />

// ✅ Good (meaningful)
<img src="/photo.jpg" alt="Recycling center in Prishtina" />

// ✅ Good (decorative)
<img src="/decoration.jpg" alt="" />
```

### Buttons Without Text

```tsx
// ❌ Bad
<button><Icon /></button>

// ✅ Good
<button aria-label="Close menu"><Icon /></button>
```

### Color-Only Information

```tsx
// ❌ Bad
<span className="text-red-500">{error}</span>

// ✅ Good
<span className="text-red-500" role="alert">
  <AlertIcon /> {error}
</span>
```

## Testing Schedule

| Frequency | Task                               |
| --------- | ---------------------------------- |
| Every PR  | Run Lighthouse accessibility audit |
| Weekly    | Manual keyboard navigation test    |
| Monthly   | Full screen reader test            |
| Quarterly | External accessibility audit       |

## Reporting Issues

When reporting accessibility issues, include:

1. **Page URL** where the issue occurs
2. **Steps to reproduce**
3. **Assistive technology used** (if applicable)
4. **Expected behavior**
5. **Actual behavior**
6. **WCAG criterion violated** (if known)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

Remember: Accessibility benefits everyone! 🌍
