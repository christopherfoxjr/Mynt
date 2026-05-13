# Security Specification - Mynt Banking

## 1. Data Invariants
- **Identity Integrity**: A user can only access their own user profile, transactions, and savings pots.
- **Relational Consistency**: Transactions and Pots must be child resources of a valid User document.
- **Immutability**: `createdAt` and `ownerId` fields must never change after creation.
- **Financial Safety**: Zero-balance check is not enforced on delete (pots can be emptied), but negative increments are restricted by application logic.
- **Admin Supremacy**: Users in the admin whitelist can view all KYC submissions and manage user statuses.

## 2. The "Dirty Dozen" Payloads
These payloads represent attempts to bypass security and should be rejected.

1. **Identity Spoofing**: Creating a profile for another user ID.
2. **Shadow Updates**: Injecting `kycCompleted: true` during a standard profile update.
3. **Transaction Poisoning**: Creating a transaction in another user's subcollection.
4. **Id Poisoning**: Using a 1MB string as a Document ID to cause resource exhaustion.
5. **Timestamp Spoofing**: Providing a backdated `createdAt` timestamp from the client.
6. **Cross-User Leak**: Attempting to list transactions of another user by bypassing the `where` clause.
7. **Role Escalation**: Attempting to update a user document with `accountStatus: 'active'` without admin credentials.
8. **Pot Orphanage**: Creating a pot with a non-existent parent user check (relational sync).
9. **Field Pollution**: Adding arbitrary fields like `isAdmin: true` to a user document.
10. **State Skipping**: Moving a KYC status from `pending` to `approved` via the client SDK.
11. **PII Harvesting**: Attempting a `get` request on a private user info document.
12. **Array Bloating**: Attempting to push 10,000 tags into a document to exceed the 1MB limit.

## 3. Test Scenarios
- **Scenario A**: Authenticated user `A` tries to read `users/B/transactions`. (Expect: DENIED)
- **Scenario B**: User `A` tries to update `users/A` but includes `stripeAccountId: 'attacker_id'`. (Expect: DENIED)
- **Scenario C**: Anonymous user tries to read any collection. (Expect: DENIED)
- **Scenario D**: Logged in user tries to create a pot without a `name`. (Expect: DENIED via isValidPot)
