# Security Specification for Mynt

## Data Invariants
1. A user profile (`/users/{userId}`) can only be created by the user themselves.
2. A user's balance can only be modified by the system or via validated transactions.
3. Transactions (`/users/{userId}/transactions/{txId}`) must always link to the owner and have a server-timestamped `createdAt`.
4. KYC submissions (`/kyc_submissions/{subId}`) can be created by any verified user but only read/managed by admins or the owner.

## The Dirty Dozen (Attack Payloads)

1. **Identity Spoofing**: Attempt to create a user profile for a different UID.
   - Path: `/users/target_uid`
   - Payload: `{ "uid": "attacker_uid", "email": "attacker@example.com", "balance": 1000000 }`
   - Goal: Gain access to another user's profile.

2. **Privilege Escalation**: Attempt to set `isAdmin` or similar admin flags in user profile.
   - Path: `/users/attacker_uid`
   - Payload: `{ "uid": "attacker_uid", "email": "attacker@example.com", "isAdmin": true, "balance": 0 }`
   - Goal: Become an administrator.

3. **Shadow Update**: Attempt to update a user's balance directly.
   - Path: `/users/attacker_uid` (Update)
   - Payload: `{ "balance": 50000 }`
   - Goal: Arbitrarily increase balance.

4. **Resource Poisoning (ID)**: Attempt to create a document with a massive string ID to cause denial of wallet.
   - Path: `/users/REALLY_LONG_ID_..._1MB_STRING`
   - Goal: Resource exhaustion.

5. **Resource Poisoning (Field)**: Attempt to inject a massive string into a text field.
   - Path: `/users/attacker_uid`
   - Payload: `{ "displayName": "A".repeat(1000000) }`
   - Goal: Resource exhaustion.

6. **State Shortcutting**: Attempt to approve own KYC.
   - Path: `/kyc_submissions/attacker_sub_id` (Update)
   - Payload: `{ "status": "approved" }`
   - Goal: Skip verification steps.

7. **Orphaned Writes**: Attempt to create a transaction without a valid user profile.
   - Path: `/users/non_existent_user/transactions/tx_1`
   - Goal: Create data inconsistent with the hierarchy.

8. **Timestamp Spoofing**: Attempt to set a custom `createdAt` date in the past or future.
   - Path: `/users/attacker_uid/transactions/tx_1`
   - Payload: `{ "createdAt": "2020-01-01T00:00:00Z", ... }`
   - Goal: Manipulate history.

9. **PII Leakage**: Attempt to read the entire `users` collection.
   - Path: `/users` (List)
   - Goal: Scrape user emails and data.

10. **Counterparty Injection**: Attempt to create a transaction where the sender doesn't match the auth UID.
    - Path: `/users/victim_uid/transactions/tx_1`
    - Payload: `{ "userId": "victim_uid", "amount": 1000, ... }`
    - Goal: Steal funds (if logic depends on resource data).

11. **Type Confusion**: Attempt to set balance as a string.
    - Path: `/users/attacker_uid` (Update)
    - Payload: `{ "balance": "one billion" }`
    - Goal: Break application logic or validation.

12. **Recursive Cost Attack**: Attempt to trigger deep recursive lookups (if rules were written recursively).
    - Goal: Extreme billing for Firestore.

## Test Runner
Verified via `firestore.rules.test.ts`.
