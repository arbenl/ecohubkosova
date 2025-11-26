# Phase 4.11 – Quick Reference Guide

## What Was Built

Analytics dashboard for organizations in the "My Organization" workspace. Track views, contacts, saves, and shares of listings with time-range filtering.

---

## Files

### Backend Service

- **`src/services/analytics.ts`** (320 lines)
  - `getListingAnalytics(listingId, options?)` → `ListingAnalytics`
  - `getOrganizationAnalytics(organizationId, options?)` → `OrganizationAnalytics`
  - `getUserAnalytics(userId, options?)` → `UserAnalytics` (future use)
  - `getDateForRange(range)` → `Date | undefined`

### UI Components

- **`analytics-tab.tsx`** (195 lines) - Main analytics dashboard component
- **`analytics-actions.ts`** (12 lines) - Server action wrapper
- **`my-organization-client.tsx`** - Modified to add tab system

### Tests

- **`e2e/marketplace/organization-analytics.spec.ts`** (220 lines, 10 scenarios)

### i18n

- **`messages/en/my-organization.json`** - Added 40+ keys
- **`messages/sq/my-organization.json`** - Added 40+ keys

---

## Key Types

```typescript
interface ListingAnalytics {
  listingId: string
  listingTitle: string
  listingStatus: string
  totalViews: number
  totalContacts: number
  totalSaves: number
  totalShares: number
}

interface OrganizationAnalytics {
  organizationId: string
  totals: { views; contacts; saves; shares }
  listings: ListingAnalytics[]
}

interface AnalyticsOptions {
  since?: Date // Filter by time period
}
```

---

## Usage Examples

### From Server Component

```typescript
import { getOrganizationAnalytics } from "@/services/analytics"

const { data, error } = await getOrganizationAnalytics(orgId, {
  since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
})
```

### From Client Component (via Server Action)

```typescript
"use client"
import { fetchOrganizationAnalyticsAction } from "./analytics-actions"

const { data, error } = await fetchOrganizationAnalyticsAction(orgId, "last30Days")
```

### Time Ranges

```typescript
getDateForRange("last30Days") // Date 30 days ago
getDateForRange("last90Days") // Date 90 days ago
getDateForRange("allTime") // undefined (no filter)
```

---

## UI Components

### AnalyticsTab Props

```typescript
{
  organizationId: string
  analytics: OrganizationAnalytics | null
  isLoading: boolean
  onTimeRangeChange: (range: 'last30Days' | 'last90Days' | 'allTime') => void
  selectedTimeRange: 'last30Days' | 'last90Days' | 'allTime'
}
```

### Integration

```tsx
// In My Organization workspace
<Tabs>
  <Tab name="Profile">...</Tab>
  <Tab name="Analytics">
    <AnalyticsTab
      organizationId={org.id}
      analytics={analytics}
      isLoading={loading}
      onTimeRangeChange={setRange}
      selectedTimeRange={range}
    />
  </Tab>
</Tabs>
```

---

## i18n Keys

### English

```json
{
  "analytics": {
    "tabs": { "analytics": "Analytics" },
    "title": "Impact & Insights",
    "summary": { "views": "Views", "contacts": "Contacts", ... },
    "listings": { "title": "How your listings are performing", ... },
    "empty": { "title": "No activity yet", ... }
  }
}
```

### Albanian (Same Structure)

```json
{
  "analytics": {
    "title": "Ndikimi & Përfundime",
    "summary": { "views": "Shikime", ... }
  }
}
```

---

## Database Queries

### Aggregate Interactions by Type

```sql
SELECT interaction_type, COUNT(*) as count
FROM eco_listing_interactions
WHERE listing_id = $1
  AND created_at >= $2 (optional)
GROUP BY interaction_type
```

### All Listings for Organization

```sql
SELECT id, title, status
FROM eco_listings
WHERE organization_id = $1
```

---

## E2E Test Scenarios

1. ✅ Tab visibility
2. ✅ Tab loading & async fetch
3. ✅ Summary cards render
4. ✅ Time-range filtering
5. ✅ Performance table display
6. ✅ Albanian localization
7. ✅ Empty state handling
8. ✅ Tab persistence
9. ✅ Time range updates
10. ✅ Interaction count display

---

## Eco-First Terminology

| Technical   | EcoHub             | Reason                                  |
| ----------- | ------------------ | --------------------------------------- |
| Impressions | Views              | Simpler for non-technical users         |
| Leads       | Interest inquiries | Emphasizes relationship over conversion |
| Conversion  | Saved for later    | Circular economy focus (not "buying")   |
| Engagement  | Shares             | Emphasizes community connection         |

---

## Security Model

✅ **Server-Only Access**

- Analytics service uses Drizzle ORM (server-side only)
- Server action wrapper prevents client-side DB access
- Protected by auth check in page.tsx

✅ **No Credentials Exposed**

- postgres/tls modules never reach browser
- Using `"use server"` on actions.ts

✅ **Future Role-Based Access**

- Could add checks in analytics-actions.ts
- ADMIN: See all analytics
- EDITOR: See only their listings
- VIEWER: No access

---

## Performance Considerations

### Query Optimization

- ✅ Single `groupBy()` aggregation per listing set
- ✅ No N+1 queries
- ✅ Indexes on `listing_id` and `interaction_type`
- ✅ `noStore()` for real-time data

### UI Rendering

- ✅ Lazy-loaded on analytics tab click
- ✅ Async/await for data fetching
- ✅ Loading spinner during fetch
- ✅ Responsive table with horizontal scroll on mobile

### Time Range Filtering

- ✅ 3 options (30/90 days, all time)
- ✅ Date math done server-side
- ✅ No pagination (assumes reasonable data volume)

---

## Future Enhancements

### Phase 4.11.1: My Impact (User Analytics)

- Personal dashboard at `/my/impact`
- Show user's listing performance
- Top 5 listings

### Phase 4.11.2: Charts & Visualization

- Line charts for trends
- Bar charts for listing comparison
- Pie charts for interaction breakdown

### Phase 4.11.3: Export & Sharing

- CSV export
- Email digest
- PDF report
- Public analytics link

### Phase 4.11.4: Role-Based Permissions

- Different access levels
- Who viewed what when

### Phase 4.11.5: Benchmarking

- Platform averages
- Category trends
- Seasonal patterns

---

## Troubleshooting

### Analytics Tab Not Showing

- Check user is logged in
- Check user has organization membership
- Verify `my-organization` namespace in i18n

### No Data Showing in Analytics

- Check if listings have interactions
- Try "All time" range
- Check database has eco_listing_interactions records

### Build Errors: "Cannot resolve 'tls'"

- ✅ Fixed by using server actions
- Never import analytics service directly in client components
- Always use `fetchOrganizationAnalyticsAction()`

---

## Testing Locally

### Run E2E Tests

```bash
pnpm exec playwright test e2e/marketplace/organization-analytics.spec.ts
```

### Debug Individual Test

```bash
pnpm exec playwright test e2e/marketplace/organization-analytics.spec.ts -g "should display analytics"
```

### Manually Test

1. Login to `/en/login`
2. Navigate to `/en/my/organization`
3. Click "Analytics" tab
4. Try different time ranges
5. Switch to Albanian: `/sq/my/organization`

---

## Build Status

```
✅ pnpm lint     : PASS (0 violations)
✅ pnpm tsc      : PASS (0 errors)
✅ pnpm build    : PASS (0 errors)
TIME: 23.77 seconds
STATUS: 🟢 PRODUCTION-READY
```

---

End of Quick Reference
