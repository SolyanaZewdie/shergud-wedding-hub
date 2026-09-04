# Shergud Wedding Hub

SHERGUD / ሽር ጉድ — TURN THE EXISTING PROTOTYPE INTO A FUNCTIONAL MVP

You are working on an existing wedding vendor marketplace called Shergud (ሽር ጉድ).

The current project already contains a working prototype with UI, navigation, sample vendors, couple/vendor/admin flows, and mocked/local-state functionality.

DO NOT rebuild the application from scratch.

Your job is to audit the existing implementation and upgrade it into a genuinely functional MVP, while preserving the existing visual design and working flows wherever possible.

The priority is:

FUNCTIONALITY > POLISH

Do not unnecessarily redesign screens that already work.

1. PRODUCT

Shergud / ሽር ጉድ is a wedding vendor marketplace connecting couples with wedding vendors.

The three user roles are:

Couple

Vendor

Admin

The platform allows couples to discover wedding vendors, save vendors, contact vendors, and communicate with them.

Vendors can create business profiles, add offerings and portfolio items, and submit themselves for verification.

Admins can review and approve/reject vendors.

The existing prototype was intentionally built with mocked/local state. We now need to replace that temporary architecture with persistent backend functionality.

2. FIRST: AUDIT THE EXISTING CODE

Before making major changes:

Inspect the entire existing project.

Identify the current routes/pages/components.

Identify all existing mock data.

Identify all localStorage usage.

Identify all temporary/demo authentication logic.

Identify all mocked chat logic.

Identify existing vendor, couple, and admin models.

Identify which existing flows already work.

Preserve existing functionality and UI wherever possible.

Do not create duplicate pages/components when an existing implementation can be upgraded.

At the end of the implementation, there should be ONE coherent application rather than parallel old/new implementations.

3. BACKEND: USE SUPABASE

Connect the application to Supabase.

Use:

Supabase Authentication

Supabase PostgreSQL database

Supabase Storage

Row Level Security (RLS)

Do NOT implement a custom authentication system.

Do NOT store application data permanently in localStorage.

localStorage may only be used for harmless UI preferences/demo-mode state if absolutely necessary.

All important application data must persist in Supabase.

4. AUTHENTICATION

Implement real Supabase authentication.

Couples and vendors should be able to:

Sign up

Log in

Log out

Maintain a persistent session

Use email/password authentication.

The signup flow should collect:

Couple

Name

Email

Password

Immediately after signup, continue to wedding onboarding.

Vendor

Business name

Category

Phone

Location

Email/password authentication

Do not ask for unnecessary fields.

5. USER ROLES

Create a proper role system.

Roles:

couple
vendor
admin


Every authenticated user should have a profile associated with their Supabase Auth user ID.

Suggested profile structure:

profiles
---------
id
full_name
email
role
avatar_url
created_at
updated_at


The role must be stored in the database and must NOT simply be determined by frontend state.

The frontend should use the authenticated user's role to determine what they can access.

6. DEMO ROLE SWITCHER

The existing prototype has a simple role switcher for evaluation.

KEEP THIS FEATURE for now because this project is being evaluated as a prototype.

However, separate it from real authorization.

The architecture should still use:

Supabase Auth
      ↓
profiles.role
      ↓
permissions


The demo switcher should not allow a normal authenticated couple/vendor to gain real admin privileges.

If necessary, make the switcher explicitly a Demo Mode feature.

7. DATABASE SCHEMA

Create the necessary Supabase tables.

Use UUID primary keys where appropriate.

profiles

id
full_name
email
role
avatar_url
created_at
updated_at


couple_profiles

id
user_id
wedding_date
wedding_location
guest_count
budget
theme
colors
created_at
updated_at


vendor_profiles

id
user_id
business_name
category
phone
location
description
verification_status
rejection_reason
approved_at
approved_by
created_at
updated_at


verification_status should support:

pending
approved
rejected


vendor_offerings

id
vendor_id
name
description
price
created_at
updated_at


vendor_portfolio

id
vendor_id
image_url
title
description
created_at
updated_at


saved_vendors

id
couple_id
vendor_id
created_at


A couple should not be able to save the same vendor twice.

conversations

id
couple_id
vendor_id
created_at
updated_at


There should be one conversation between a particular couple and vendor unless there is a strong reason otherwise.

messages

id
conversation_id
sender_id
message
created_at
read_at


reviews

Create the structure needed for vendor reviews, but because there is currently no booking/completed-service system, do not pretend reviews are verified transactions.

Existing sample reviews can be seeded as sample/demo data.

8. ROW LEVEL SECURITY

Implement proper Supabase RLS.

This is critical.

Profiles

A user can read/update their own profile.

Couple profiles

A couple can read/update only their own wedding information.

Vendor profiles

A vendor can read/update only their own vendor profile.

Public users/couples can read vendor profiles that are approved.

Offerings

Vendors can create/update/delete only their own offerings.

Public users can read offerings belonging to approved vendors.

Portfolio

Vendors can create/update/delete only their own portfolio items.

Public users can view portfolio items belonging to approved vendors.

Saved vendors

Couples can only read/write their own saved vendors.

Conversations

A couple can access conversations involving that couple.

A vendor can access conversations involving that vendor.

Users must not be able to access other users' conversations.

Messages

Only participants in the conversation can read/send messages.

Admin

Only users whose database role is admin can:

View pending vendor applications

Approve vendors

Reject vendors

Perform admin verification actions

Do NOT rely only on hiding buttons in React for authorization.

Use database RLS/security as the real protection.

9. VENDOR VISIBILITY RULE

A vendor must NOT appear in public marketplace search unless ALL of the following are true:

verification_status = approved
AND
vendor has at least 1 offering
AND
vendor has at least 1 portfolio item


Pending vendors must not appear in public search.

Rejected vendors must not appear in public search.

Approved but incomplete vendors must not appear in public search.

This rule should be enforced consistently in the marketplace queries, not merely visually hidden.

10. COUPLE ONBOARDING

Preserve the existing onboarding UI if it already exists.

The flow should be:

Step 1

Signup:

Name

Email

Password

Step 2 — Required

Wedding date

Wedding location

These cannot be skipped.

Step 3 — Optional

Guest count

Step 4 — Optional

Budget

Step 5 — Optional

Theme

Step 6 — Optional

Colors

Each optional step can be skipped individually.

Save all information to couple_profiles.

After onboarding, show the Wedding Dashboard.

11. WEDDING DASHBOARD

The couple dashboard should display the information stored in Supabase:

Wedding date

Wedding location

Guest count

Budget

Theme

Colors

Allow the couple to edit these values.

Changes must persist after page refresh and logout/login.

12. MARKETPLACE

Preserve the existing marketplace design.

The marketplace should load vendors from Supabase rather than hardcoded arrays.

Support:

Categories

Seed categories/vendors including examples such as:

Photography

Venue

Catering

Decor

Use at least 6–8 vendors across 2–3+ categories.

Filters

Location

Price range

Rating

Sort

Relevance

Rating — default

Price low → high

Price high → low

Newest

Only vendors satisfying the public visibility rule should be returned.

13. VENDOR CARD

Vendor cards should show:

Business name

Category

Starting price

Rating

Location

Portfolio cover image

The starting price can be derived from the vendor's lowest offering.

Use real database data.

14. VENDOR PROFILE

The vendor profile should display:

Business name

Category

Description/business information

Location

Phone/contact information where appropriate

Portfolio gallery

Offerings

Starting prices

Reviews

Rating

The page should retrieve the vendor and related data from Supabase.

15. SAVE VENDOR

Implement persistent saving.

When a logged-in couple clicks Save:

saved_vendors


should be updated.

The saved state must survive:

page refresh

logout/login

navigation

If a guest clicks Save:

Show the existing login/signup prompt.

Do not silently save guest data permanently.

16. CONTACT VENDOR

If a guest clicks Contact:

Prompt them to log in/sign up.

If an authenticated couple clicks Contact:

Open a message composer.

The couple can type a free-text message and send it.

Sending the first message should:

Create a conversation if one doesn't exist.

Insert the message into the messages table.

Open the conversation/chat UI.

17. CHAT

Replace the current purely local/mock chat state with database-backed chat.

A full WebSocket system is NOT required.

For this MVP, messages can be fetched/refreshed from Supabase.

The interface should support:

Couple sends message

Vendor sees message

Vendor replies

Couple sees reply

Conversation persists after refresh

Conversation persists after logout/login

Structure:

Conversation
    ↓
Messages
    ↓
sender_id


Make the interface feel like a simple modern marketplace messaging experience.

Do not build a notification system.

18. VENDOR ONBOARDING

Vendor registration should collect:

Business name

Category

Phone

Location

After registration:

Pending Verification


The vendor should still be able to build their profile while pending.

19. VENDOR DASHBOARD

Create or upgrade the existing vendor dashboard.

Include:

Verification status

Examples:

Pending Verification


Approved


Rejected
Reason: ...


Business Profile

Allow editing:

Business name

Category

Description

Phone

Location

Offerings

Allow vendor to:

Add offering

Edit offering

Delete offering

Each offering:

Name

Description

Starting price

Portfolio

Allow vendor to:

Add portfolio image

Add title/description if appropriate

Delete portfolio item

At least one offering and one portfolio item are required before the vendor can become publicly visible.

20. IMAGE STORAGE

Use Supabase Storage for vendor portfolio images.

Create an appropriate storage bucket.

Vendor uploads should be associated with the authenticated vendor.

Vendors must only be able to manage their own uploaded portfolio assets.

Public users should be able to view portfolio images belonging to approved vendors.

If actual file uploads complicate the current prototype, implement them properly rather than leaving fake image URLs.

Use placeholder/sample images for seeded vendors.

21. ADMIN DASHBOARD

Create/upgrade the Admin Dashboard.

The admin should see:

Pending Vendor Applications


Each application should display useful information:

Business name

Category

Phone

Location

Description

Offerings

Portfolio

Application date

Verification status

Admin actions:

Approve

Changes:

verification_status = approved
approved_at = current timestamp
approved_by = current admin


Reject

Show a simple reason selector/input.

Change:

verification_status = rejected
rejection_reason = ...


The vendor should be able to see their updated status.

22. ADMIN SECURITY

Do not make admin functionality accessible merely because the frontend route exists.

Admin operations must require the authenticated user's database role to be:

admin


Use Supabase RLS/policies for sensitive operations.

Do not expose service-role keys in frontend code.

23. SEED DATA

Seed the database with realistic sample data.

At least:

6–8 vendors


across categories such as:

Photography

Venue

Catering

Decor

Every approved seed vendor should have:

Business name

Category

Location

Description

At least one offering

At least one portfolio image

Rating/review data

Use attractive placeholder images if real images are not available.

The marketplace should not be empty immediately after setup.

24. SAMPLE ADMIN

Create a safe development/demo admin account or provide a documented way to assign an existing account the admin role.

Do not hardcode admin authorization into React.

25. REMOVE MOCKED APPLICATION DATA

After the database functionality is implemented, remove/replace temporary application-level mock state for:

vendors

couples

vendor profiles

offerings

portfolio

saved vendors

conversations

messages

verification status

The database should be the source of truth.

Do not leave two competing data systems where the UI sometimes reads local state and sometimes Supabase.

26. LOADING / ERROR / EMPTY STATES

Every database-driven screen needs sensible states.

Examples:

Loading:

Loading vendors...

Empty marketplace:

No vendors found.

No messages:

No messages yet.

Database error:

Something went wrong. Please try again.

Successful save:

Vendor saved.

Successful approval:

Vendor approved.

Make these states fit the existing Shergud design.

27. MOBILE RESPONSIVENESS

Preserve the current warm wedding aesthetic.

The application must work properly on:

Mobile

Tablet

Desktop

Pay particular attention to:

Vendor cards

Marketplace filters

Vendor profiles

Chat

Couple onboarding

Wedding dashboard

Vendor dashboard

Admin dashboard

28. DESIGN DIRECTION

Shergud should feel:

Warm

Elegant

Trustworthy

Romantic without being overly cliché

Premium but accessible

Ethiopian/local-market appropriate

Human rather than generic SaaS

Keep the existing Shergud visual identity if it is already established.

Do NOT turn this into a generic dashboard template.

Do NOT add unnecessary gradients, excessive glassmorphism, random illustrations, or unrelated SaaS patterns.

The design should communicate:

"I can trust this marketplace with one of the most important days of my life."

29. OUT OF SCOPE

Do NOT build these features yet:

Payment processing

Booking confirmation system

Contracts

In-app payments

Inspiration boards

Moodboards

Wedding planning checklist

Notifications system

Analytics dashboard

Complex recommendation engine

Reviews tied to completed bookings

Vendor subscription/payment system

Advanced real-time infrastructure

Complex calendar availability

Delivery/order management

Focus only on the marketplace, profiles, verification, saved vendors, messaging, onboarding, and admin functionality described above.

30. IMPORTANT IMPLEMENTATION RULES

Rule 1

Do not rewrite working UI unnecessarily.

Rule 2

Do not create duplicate pages when existing pages can be upgraded.

Rule 3

Use Supabase as the source of truth.

Rule 4

Do not expose Supabase service-role credentials in client-side code.

Rule 5

Use RLS for authorization.

Rule 6

Do not fake successful database operations.

If a button says "Approve", actually update the database.

If a button says "Save", actually persist the save.

If a message is sent, actually insert it into the messages table.

Rule 7

Handle loading, errors, and empty states.

Rule 8

Preserve mobile responsiveness.

Rule 9

Do not add features outside the scope.

Rule 10

Before finishing, test the complete end-to-end flows.

31. REQUIRED END-TO-END TEST

Verify this exact scenario:

Couple

Create couple account.

Complete required wedding date/location.

Skip some optional onboarding questions.

See Wedding Dashboard.

Edit wedding information.

Browse vendors.

Filter vendors.

Sort vendors.

Open vendor profile.

Save vendor.

Refresh page.

Confirm vendor is still saved.

Contact vendor.

Send a message.

Refresh.

Confirm conversation remains.

Vendor

Register vendor.

Confirm status is Pending.

Edit business profile.

Add offering.

Add portfolio image.

Confirm vendor is still NOT publicly visible while pending.

Admin approves vendor.

Confirm vendor becomes publicly visible because they now have ≥1 offering and ≥1 portfolio item.

Admin

Log in as admin.

See pending vendor.

Open application.

Approve vendor.

Confirm database status changes.

Confirm vendor can now appear in marketplace.

Rejection

Also verify:

Admin rejects vendor.

Rejection reason is stored.

Vendor sees Rejected status.

Vendor does not appear in public marketplace.

Chat

Verify:

Couple contacts vendor.

Couple sends message.

Vendor sees message.

Vendor replies.

Couple sees reply.

Refresh both sides.

Conversation remains.

32. FINAL ARCHITECTURE GOAL

The final application should conceptually work like this:

                    SHERGUD
                       │
              ┌────────┴────────┐
              │                 │
           COUPLE             VENDOR
              │                 │
       Couple Profile      Vendor Profile
              │                 │
       Wedding Details     Offerings
              │             Portfolio
              │                 │
              └───────┬─────────┘
                      │
                 Marketplace
                      │
               Conversations
                      │
                  Messages

                      │
                      ▼

                    ADMIN
                      │
              Vendor Applications
                      │
               Approve / Reject
                      │
                      ▼
               Vendor Visibility


Supabase should be the persistent source of truth behind this entire architecture.

33. MOST IMPORTANT INSTRUCTION

Do not stop after creating the database schema.

Actually connect the existing frontend to the database.

The goal is not:

"Supabase tables exist."

The goal is:

"The existing Shergud prototype now genuinely works end-to-end using persistent backend data."

Before considering the task complete, inspect the application for mocked/local state and replace it where it represents real application data.

Do not claim a feature is complete unless it works after a page refresh and, where applicable, after logging out and back in.

Preserve the existing Shergud identity and UI while upgrading the underlying application from prototype → functional MVP.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5a9a4443-1c15-492a-aec5-c5930f969913).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
