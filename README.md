# Burhani Sports Club Houston WebApp

Event management platform for Burhani Sports Club Houston.

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in Firebase credentials
2. `npm install`
3. `npm run dev`

## Firestore Indexes

For events and news queries to work, deploy the Firestore indexes:

```bash
firebase deploy --only firestore:indexes
```

Or create them manually via the Firebase Console when you see the index creation link in error messages.

## Admin Access

To promote a user to SUPER_ADMIN (after they've signed up):
```bash
npx tsx scripts/promote-superadmin.ts user@example.com
```
Or manually in Firestore: `users` collection → set `role` to `ADMIN` or `SUPER_ADMIN`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:seed` - Seed Firestore with roles, sports, locations, token packages
- `npm run db:clear` - Clear all Firestore data (use with caution)
