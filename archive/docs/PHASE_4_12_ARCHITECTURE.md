# Phase 4.12 – Implementation Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ECOHUB FRONTEND (Next.js)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  My Organization Workspace                                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Tabs: Profile | Analytics | Team                           │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                              │  │
│  │  MembersTab Component (members-tab.tsx)                     │  │
│  │  ┌───────────────────────────────────────────────────────┐  │  │
│  │  │ Header: "Team & Collaboration"                        │  │  │
│  │  │ [Invite Team Member] button (ADMIN only)             │  │  │
│  │  ├───────────────────────────────────────────────────────┤  │  │
│  │  │                                                        │  │  │
│  │  │ ADMIN VIEW:                                           │  │  │
│  │  │ ┌─────────────────────────────────────────────────┐  │  │  │
│  │  │ │ Invite Form (collapsible)                       │  │  │  │
│  │  │ │ [Email] [Role Dropdown] [Send Invite]          │  │  │  │
│  │  │ └─────────────────────────────────────────────────┘  │  │  │
│  │  │                                                        │  │  │
│  │  │ Members Table:                                        │  │  │
│  │  │ ┌─────────────────────────────────────────────────┐  │  │  │
│  │  │ │ Name | Email | Role | Joined Date | Actions    │  │  │  │
│  │  │ ├─────────────────────────────────────────────────┤  │  │  │
│  │  │ │ Alice M. | alice@org.com | Admin | Nov 1 | ×  │  │  │  │
│  │  │ │ Bob E. | bob@org.com | Editor | Nov 10 | ×    │  │  │  │
│  │  │ └─────────────────────────────────────────────────┘  │  │  │
│  │  │                                                        │  │  │
│  │  │ Pending Invites:                                      │  │  │
│  │  │ ┌─────────────────────────────────────────────────┐  │  │  │
│  │  │ │ Email | Role | Status | [Revoke]              │  │  │  │
│  │  │ │ carol@example.com | Editor | Pending | Revoke  │  │  │  │
│  │  │ └─────────────────────────────────────────────────┘  │  │  │
│  │  │                                                        │  │  │
│  │  │ VIEWER/EDITOR VIEW:                                  │  │  │
│  │  │ ┌─────────────────────────────────────────────────┐  │  │  │
│  │  │ │ (Same members table, read-only)                 │  │  │  │
│  │  │ │ "Only organization admins manage members"       │  │  │  │
│  │  │ └─────────────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    Server Actions (members-actions.ts)
                                 │
         ┌───────────────┬───────┴────┬───────────────┐
         ▼               ▼            ▼               ▼
  fetchMembers   sendInvite   revokeInvite    acceptInvite
       │              │             │               │
       └──────────────┴─────────────┴───────────────┘
                           │
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                    │
│        src/services/organization-members.ts                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ getOrganizationMembers(orgId)                                       │
│   └─→ Drizzle: SELECT users.* FROM organization_members JOIN users │
│                                                                      │
│ getOrganizationInvites(orgId)                                       │
│   └─→ Raw SQL: SELECT * FROM organization_member_invites           │
│                WHERE organization_id = $1                           │
│                                                                      │
│ inviteMemberToOrganization({orgId, email, role, inviterUserId})    │
│   ├─→ Check inviter is ADMIN in org                                │
│   ├─→ Generate token: randomBytes(32).toString('hex')              │
│   └─→ INSERT into organization_member_invites                      │
│       (status='PENDING', token, email, role)                       │
│                                                                      │
│ revokeInvite({inviteId, orgId, requesterUserId})                   │
│   ├─→ Check requester is ADMIN                                     │
│   └─→ UPDATE organization_member_invites SET status='REVOKED'      │
│                                                                      │
│ changeMemberRole({orgId, targetUserId, newRole, requesterUserId})  │
│   ├─→ Check requester is ADMIN                                     │
│   ├─→ Check not last ADMIN (if demoting)                           │
│   └─→ Drizzle: UPDATE organization_members SET role_in_org=$1      │
│                                                                      │
│ removeMember({orgId, targetUserId, requesterUserId})               │
│   ├─→ Check: requester is ADMIN or removing self                   │
│   ├─→ Check not removing last ADMIN                                │
│   └─→ Drizzle: DELETE FROM organization_members                    │
│                                                                      │
│ acceptInvite({token, userId, userEmail})                           │
│   ├─→ SELECT * FROM organization_member_invites                    │
│   │   WHERE token=$1 AND status='PENDING'                          │
│   ├─→ Validate email matches                                       │
│   ├─→ Check if already member (prevent duplicates)                 │
│   ├─→ INSERT into organization_members (role from invite)          │
│   └─→ UPDATE organization_member_invites SET status='ACCEPTED'     │
│                                                                      │
│ getInviteByToken(token) [Public, no auth]                          │
│   └─→ SELECT * FROM organization_member_invites                    │
│       JOIN organizations ON ...                                     │
│       WHERE token=$1 AND status='PENDING'                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
    Drizzle ORM      Raw postgres-js    Error Handling
    (safe, typed)    (flexible)         (toError utility)
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────────┐
│              SUPABASE PostgreSQL DATABASE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ TABLE: organization_members (existing)                              │
│ ┌────────────────────────────────────────┐                          │
│ │ id (UUID) | organization_id | user_id │                          │
│ │ role_in_organization | is_approved    │                          │
│ │ created_at                             │                          │
│ │ (uniqueIndex: organization_id, user_id) │                        │
│ └────────────────────────────────────────┘                          │
│                                                                      │
│ TABLE: organization_member_invites (NEW)                            │
│ ┌────────────────────────────────────────────────────────────┐     │
│ │ id (UUID)                                                  │     │
│ │ organization_id (FK → organizations)                       │     │
│ │ email (TEXT)                                               │     │
│ │ role_in_organization (TEXT: ADMIN|EDITOR|VIEWER)          │     │
│ │ token (TEXT UNIQUE) [32-byte hex for security]            │     │
│ │ status (TEXT: PENDING|ACCEPTED|REVOKED|EXPIRED)           │     │
│ │ created_by_user_id (FK → users)                            │     │
│ │ created_at, updated_at, accepted_at (TIMESTAMP)            │     │
│ │ INDEXES: token, organization_id, email, status             │     │
│ │ CONSTRAINT: UNIQUE(org_id, email, status)                  │     │
│ │           WHERE status='PENDING'                           │     │
│ └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│ RLS POLICIES (Row Level Security):                                 │
│ ┌────────────────────────────────────────────────────────────┐     │
│ │ 1. SELECT: WHERE user_id IN (org members) OR admin        │     │
│ │ 2. INSERT: WHERE requester is org ADMIN                   │     │
│ │ 3. UPDATE: WHERE requester is org ADMIN                   │     │
│ │ 4. ACCEPT:  WHERE token matches + email matches (public)  │     │
│ └────────────────────────────────────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Flow 1: Admin Invites New Member

```
┌─────────────────┐
│  Admin User     │
│  (Logged in)    │
└────────┬────────┘
         │
         ▼ Opens My Organization → Team tab
┌─────────────────────────────────┐
│ MembersTab Component            │
│ Calls loadMembers()             │
│ Shows current members + form    │
└────────┬────────────────────────┘
         │
         ▼ Admin fills form: email + role
┌─────────────────────────────────┐
│ Invite Form Submitted           │
│ handleInvite() called           │
└────────┬────────────────────────┘
         │
         ▼ Calls Server Action
┌─────────────────────────────────┐
│ sendInviteAction()              │
│ - Verifies user auth            │
│ - Calls service layer           │
└────────┬────────────────────────┘
         │
         ▼ Service Layer
┌─────────────────────────────────┐
│ inviteMemberToOrganization()    │
│ 1. Check inviter is ADMIN       │
│ 2. Generate token (32 bytes)    │
│ 3. INSERT invite record         │
│ 4. Return token                 │
└────────┬────────────────────────┘
         │
         ▼ Database
┌─────────────────────────────────┐
│ INSERT into                     │
│ organization_member_invites     │
│ {email, role, token, status}    │
└────────┬────────────────────────┘
         │
         ▼ Return to UI
┌─────────────────────────────────┐
│ Success message                 │
│ Show token/link to copy         │
│ Reload members + pending list   │
└─────────────────────────────────┘
```

### Flow 2: Invited User Accepts Invitation

```
┌──────────────────────────┐
│ Invited User             │
│ Receives email/link      │
│ Token: [32-byte-token]   │
└────────┬─────────────────┘
         │
         ▼ Clicks link or navigates to:
┌──────────────────────────────────────┐
│ /en/my/organization/invite/[TOKEN]   │
└────────┬─────────────────────────────┘
         │
         ▼ Checks if logged in
    ┌────┴────┐
    │          │
    ▼          ▼
 Logged in   Not logged in
    │          │
    │          ▼ Redirect to /login
    │        ┌─────────────────┐
    │        │ Login page      │
    │        │ with return-to  │
    │        └────────┬────────┘
    │                 │
    │                 ▼ After login, redirect back
    │        ┌─────────────────────────────────┐
    │        │ /en/my/organization/invite/...  │
    └────────┤ With token in URL               │
             └────────┬────────────────────────┘
                      │
                      ▼ Server Action: getInviteDetailsAction()
             ┌──────────────────────────────┐
             │ Lookup invite by token       │
             │ Check status = PENDING       │
             │ Return: {orgName, role, ...} │
             └────────┬─────────────────────┘
                      │
                      ▼ Display acceptance page
             ┌──────────────────────────────────────┐
             │ "Join [OrgName]?"                    │
             │ "Role: Editor"                       │
             │ [Accept] [Decline]                   │
             └────────┬────────┬────────────────────┘
                      │        │
         [Accept]     │        │     [Decline]
         clicked      │        │     clicked
                      ▼        ▼
             ┌──────────────────────────┐
             │ acceptInviteAction()     │
             └────────┬─────────────────┘
                      │
                      ▼ Service: acceptInvite()
             ┌──────────────────────────────┐
             │ 1. Find invite by token      │
             │ 2. Validate email match      │
             │ 3. Check not already member  │
             │ 4. INSERT member record      │
             │ 5. UPDATE invite ACCEPTED    │
             └────────┬─────────────────────┘
                      │
                      ▼ Database
             ┌──────────────────────────────┐
             │ INSERT organization_members  │
             │ UPDATE member_invites        │
             │ status = ACCEPTED            │
             └────────┬─────────────────────┘
                      │
                      ▼ Return to UI
             ┌──────────────────────────────┐
             │ Success!                     │
             │ Redirect to My Organization  │
             │ User now listed in Team tab  │
             └──────────────────────────────┘
```

### Flow 3: Admin Removes Member

```
┌─────────────────┐
│  Admin User     │
│  (Logged in)    │
└────────┬────────┘
         │
         ▼ Views My Organization → Team tab
┌─────────────────────────────────┐
│ Members Table                   │
│ ┌─────────────────────────────┐ │
│ │ Member | Email | Role | [X] │ │
│ └─────────────────────────────┘ │
└────────┬────────────────────────┘
         │
         ▼ Clicks remove [X] button
┌─────────────────────────────────┐
│ Confirmation Dialog             │
│ "Remove member from team?"      │
│ [Cancel] [Remove]               │
└────────┬────────────────────────┘
         │
         ▼ [Remove] clicked
┌─────────────────────────────────┐
│ removeMemberAction()            │
│ - Verify admin auth             │
│ - Call service layer            │
└────────┬────────────────────────┘
         │
         ▼ Service: removeMember()
┌──────────────────────────────────┐
│ 1. Check requester is ADMIN      │
│ 2. Check not removing self       │
│ 3. Check not last ADMIN          │
│ 4. DELETE from members           │
└────────┬─────────────────────────┘
         │
         ▼ Database
┌──────────────────────────────────┐
│ DELETE FROM organization_members │
│ WHERE user_id = $1               │
└────────┬─────────────────────────┘
         │
         ▼ Return to UI
┌──────────────────────────────────┐
│ Success message                  │
│ Member removed from list         │
│ They lose org access             │
└──────────────────────────────────┘
```

---

## Component Hierarchy

```
App Router
  └─ [locale]/
      └─ (protected)/
          └─ my/
              └─ organization/
                  ├─ page.tsx (My Organization layout)
                  │   └─ my-organization-client.tsx
                  │       ├─ Tab buttons: Profile | Analytics | Team
                  │       ├─ Conditional renders:
                  │       │   ├─ {activeTab === "profile" && <ProfileTab />}
                  │       │   ├─ {activeTab === "analytics" && <AnalyticsTab />}
                  │       │   └─ {activeTab === "members" && <MembersTab />}
                  │       │
                  │       └─ MembersTab component (NEW)
                  │           ├─ Header
                  │           ├─ InviteForm (admin only)
                  │           ├─ MembersTable
                  │           │   └─ Admin remove buttons
                  │           ├─ PendingInvitesSection
                  │           │   └─ Revoke buttons
                  │           └─ EmptyState
                  │
                  ├─ members-actions.ts (NEW)
                  │   └─ 8 server actions (auth + service calls)
                  │
                  └─ invite/
                      └─ [token]/
                          └─ page.tsx (NEW - future)
                              └─ Invite acceptance page
```

---

## State Management

### UI State (MembersTab Component)

```
State Variables:
├─ members: OrganizationMemberInfo[]
│   └─ Populated by fetchOrganizationMembersAction()
│
├─ pendingInvites: PendingInvite[]
│   └─ Populated by fetchPendingInvitesAction()
│
├─ loading: boolean
│   └─ Set during async operations
│
├─ showInviteForm: boolean
│   └─ Toggles invite form visibility (admin only)
│
├─ inviteEmail: string
│   └─ Form input for email
│
├─ inviteRole: "ADMIN" | "EDITOR" | "VIEWER"
│   └─ Form select for role
│
└─ inviteSending: boolean
    └─ Loading state during invite submission

Derived State:
└─ isAdmin: boolean = userRole === "ADMIN"
    └─ Determines what features show
```

---

## Error Handling Strategy

```
┌─────────────────────────────────────────┐
│         Error at Any Layer              │
├─────────────────────────────────────────┤
│                                         │
│  Service Layer                          │
│  ├─ Try-catch wraps all logic          │
│  └─ Returns {data: null, error: E}     │
│       │                                │
│       ▼                                │
│  Server Actions                         │
│  ├─ Receives error from service        │
│  ├─ Sends user-friendly message        │
│  └─ Returns {error: string}            │
│       │                                │
│       ▼                                │
│  Frontend Component                     │
│  ├─ Receives error                      │
│  ├─ Shows toast/alert to user          │
│  └─ Suggests corrective action         │
│                                         │
│  Example Errors:                        │
│  ├─ "Inviter is not an admin"          │
│  ├─ "Email is invalid"                 │
│  ├─ "User already member"              │
│  ├─ "Cannot remove last admin"         │
│  ├─ "Invite token expired"             │
│  └─ "Email does not match invite"      │
│                                         │
└─────────────────────────────────────────┘
```

---

## Security Layers

```
┌────────────────────────────────────────────────────┐
│ Layer 1: Client-Side (UI)                          │
├────────────────────────────────────────────────────┤
│ - Show/hide features based on role                │
│ - Buttons disabled for non-admins                 │
│ - Client-side email validation                     │
│ - Does NOT provide security (can be bypassed)     │
└────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────┐
│ Layer 2: Authentication (Server Actions)          │
├────────────────────────────────────────────────────┤
│ - Verify user session exists                       │
│ - Get user ID from session                         │
│ - Pass to service layer                            │
│ - Returns error if not authenticated              │
└────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────┐
│ Layer 3: Authorization (Service Layer)            │
├────────────────────────────────────────────────────┤
│ - Check user role in organization                 │
│ - Verify admin access for protected operations    │
│ - Enforce business rules:                         │
│   - Can't demote last admin                       │
│   - Can't remove last admin                       │
│   - One invite per email/org                      │
│ - Validate input parameters                       │
└────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────┐
│ Layer 4: Database Level Security (RLS)            │
├────────────────────────────────────────────────────┤
│ - PostgreSQL policies prevent direct access       │
│ - Even if auth bypassed, DB policies enforce      │
│ - Policies:                                        │
│   1. SELECT: members + admins only                │
│   2. INSERT: admins only                          │
│   3. UPDATE: admins only                          │
│   4. Accept by token: email must match            │
└────────────────────────────────────────────────────┘
```

---

## Type System

```typescript
// Interface Hierarchy

OrganizationMemberInfo
├─ id: string
├─ userId: string
├─ organizationId: string
├─ userEmail: string
├─ userName: string
├─ role: "ADMIN" | "EDITOR" | "VIEWER"
└─ joinedAt: Date

PendingInvite
├─ id: string
├─ email: string
├─ role: "ADMIN" | "EDITOR" | "VIEWER"
├─ status: "PENDING" | "ACCEPTED" | "REVOKED"
├─ createdAt: Date
└─ createdByUserId: string

Result<T>
├─ data: T | null
└─ error: Error | null

ServerActionResult<T>
├─ data: T
└─ error: string | null
```

---

## Summary

**Phase 4.12 architecture** implements a **3-layer security model** (Client UI → Server Auth → DB RLS) with:

- **Safe data flow** through server actions
- **Type-safe operations** with TypeScript strict mode
- **Secure token generation** for invites
- **RLS enforcement** at database level
- **Clear error handling** with user-friendly messages
- **Role-based access control** (ADMIN-only operations)
- **Bilingual i18n** throughout the stack

**Result:** Robust, secure, scalable team member management for EcoHub organizations.
