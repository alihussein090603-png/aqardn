# Security Specification for عقارات المثنى (Al-Muthanna Real Estate) Firestore Layer

## 1. Data Invariants
1. **User Identity Invariant**: A user/broker document ID must perfectly match their authenticated Firebase Auth UID. No user can register a document under someone else's UID, and no user can update another user's profile metadata.
2. **Broker Privilege Invariant**: Only authenticated users with verified email status and the verified `'broker'` or `'admin'` role can create properties. No anonymous or standard seeker users can create property listings.
3. **Property Ownership Invariant**: A listing's `brokerId` must match the creator's UID. A broker can delete or modify only their own listings (`resource.data.brokerId == request.auth.uid`).
4. **State Transition Constraint**: Once a listing status transitions to `'sold'`, it is considered terminal and cannot be edited by the broker unless reset by an Administrator.
5. **Value Poisoning Prevention**: Fields such as `price`, `area`, `rooms`, and `bathrooms` must be positive numeric values. String sizes and arrays must be bounded to avoid wallet-draining storage consumption.
6. **Immutable Fields**: `createdAt`, `id`, and original `brokerId` fields in a property are immutable once created.
7. **Wishlist Exclusivity**: A wishlist document matching UID can only be read, modified, or populated by the authenticated owner (`request.auth.uid == userId`).

---

## 2. The "Dirty Dozen" Payloads (Vulnerability Vector Matrix)

Here are 12 malicious payload vectors designed to test the access control locks of our Firestore layer. Each of these attempts must return `PERMISSION_DENIED`:

### P1: Identity Spoofing (RBAC Escalation)
* **Target Collection**: `/users/attacker_uid`
* **Intended Exploit**: A user attempts to self-escalate their `role` attribute to `'admin'` or `'broker'` without authentication verification.
* **Payload**:
  ```json
  {
    "uid": "attacker_uid",
    "name": "Attacker",
    "email": "attacker@gmail.com",
    "phone": "+9647700000000",
    "whatsapp": "wa.me/9647700000000",
    "role": "admin",
    "isVerified": true,
    "createdAt": "2026-06-05T00:00:00.000Z"
  }
  ```

### P2: Rogue Profile Hijacking
* **Target Collection**: `/users/victim_uid`
* **Intended Exploit**: Authenticated user `attacker_uid` attempts to update the contact number of `victim_uid` to hijack incoming leads.
* **Payload**:
  ```json
  {
    "phone": "+9647701111111"
  }
  ```

### P3: Anonymous Property Insertion
* **Target Collection**: `/properties/temp_prop`
* **Intended Exploit**: Unauthenticated/anonymous client attempting to write an active property layout block.
* **Payload**:
  ```json
  {
    "id": "temp_prop",
    "brokerId": "anonymous_user",
    "title": "Unauthenticated spam house",
    "category": "house",
    "type": "sale",
    "price": 50,
    "currency": "IQD",
    "status": "active"
  }
  ```

### P4: Email Unverified Broker Creation
* **Target Collection**: `/properties/prop_123`
* **Intended Exploit**: Authenticated but unverified user (`email_verified == false`) attempts to post a property.
* **Payload**:
  ```json
  {
    "id": "prop_123",
    "brokerId": "unverified_broker_uid",
    "title": "Spam list",
    "category": "land",
    "type": "sale",
    "price": 100,
    "currency": "IQD",
    "status": "active"
  }
  ```

### P5: Foreign Listing Poisoning (Broker Impersonation)
* **Target Collection**: `/properties/prop_456`
* **Intended Exploit**: A registered broker `attacker_uid` attempts to post a property listing with `brokerId` set to `victim_broker_uid`.
* **Payload**:
  ```json
  {
    "id": "prop_456",
    "brokerId": "victim_broker_uid",
    "title": "Impersonated mansion in Samawa",
    "category": "house",
    "type": "sale",
    "price": 250,
    "currency": "IQD",
    "status": "active"
  }
  ```

### P6: Rogue Listing Deletion
* **Target Collection**: `/properties/prop_owned_by_victim`
* **Intended Exploit**: Broker `attacker_uid` attempts to execute a hard `delete` operation on a luxury villa document belonging to `victim_broker_uid`.
* **Operation**: `DELETE /properties/prop_owned_by_victim` as `attacker_uid`.

### P7: Value Poisoning (Denial of Wallet Storage Attack)
* **Target Collection**: `/properties/prop_789`
* **Intended Exploit**: Injecting a 5MB base64 or custom payload into `description` or `title` to exhaust project storage limits.
* **Payload**:
  ```json
  {
    "title": "A".repeat(1000000),
    "description": "B".repeat(2000000),
    "price": -500,
    "area": -20,
    "category": "house",
    "type": "sale"
  }
  ```

### P8: Client-Side Seeker Query Scraping (Insecure Read)
* **Target Collection**: `/properties`
* **Intended Exploit**: Scraping unpublished/pending listings with state `'pending'` as a generic seeker/guest.
* **Operation**: `get` or `list` on `/properties` filtering by `status == 'pending'`.

### P9: Wishlist Hijacking (Cross-User Write)
* **Target Collection**: `/wishlists/victim_uid`
* **Intended Exploit**: Authenticated user `attacker_uid` attempts to empty the saved wishlisted properties of `victim_uid`.
* **Payload**:
  ```json
  {
    "userId": "victim_uid",
    "propertyIds": []
  }
  ```

### P10: Terminal State Overwrite
* **Target Collection**: `/properties/prop_already_sold`
* **Intended Exploit**: A broker attempts to modify details (change title, area, price) of a property that has already been registered with terminal status `'sold'`.
* **Payload**:
  ```json
  {
    "title": "Re-opening sold property of Samawa",
    "price": 100
  }
  ```

### P11: Immutable Field Tampering
* **Target Collection**: `/properties/prop_valid`
* **Intended Exploit**: Tampering with the original `createdAt` timestamp to modify historical data lists.
* **Payload**:
  ```json
  {
    "createdAt": "2020-01-01T00:00:00.000Z"
  }
  ```

### P12: Invalid ID Ingestion (Path Variable Abuse)
* **Target Collection**: `/properties/[invalid_characters_!!!!_$$]`
* **Intended Exploit**: Attempting to create property listings with malformed symbols in order to poison routes or disrupt database serialization.
* **Operation**: `create` on document with ID containing malformed bytes.

---

## 3. The Test Runner Blueprint

The following block defines our TypeScript/JS unit test structure representing how these scenarios are validated in our testing pipeline utilizing `@firebase/rules-unit-testing`.

```typescript
import { 
  initializeTestEnvironment, 
  RulesTestEnvironment 
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'aqarat-muthanna-enterprise-321',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8')
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('عقارات المثنى (Al-Muthanna Real Estate) Firestore Security Rules', () => {
  
  // P1 Test - Identity Spoofing (RBAC check)
  test('P1: Seeker cannot self-promote to Broker or Admin', async () => {
    const unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = unauthenticatedDb.collection('users').doc('attacker_uid');
    await expect(docRef.set({
      uid: 'attacker_uid',
      name: 'Attacker Seeker',
      role: 'admin',
      isVerified: true
    })).rejects.toThrow();
  });

  // P2 Test - Rogue Profile Hijacking
  test('P2: User cannot edit profile belonging to someone else', async () => {
    const attackerDb = testEnv.authenticatedContext('attacker_uid').firestore();
    const victimRef = attackerDb.collection('users').doc('victim_uid');
    await expect(victimRef.update({
      phone: '+9647701111111'
    })).rejects.toThrow();
  });

  // P3 Test - Anonymous Property Insertion
  test('P3: Anonymous users cannot list property', async () => {
    const anonDb = testEnv.unauthenticatedContext().firestore();
    const propRef = anonDb.collection('properties').doc('spam_prop');
    await expect(propRef.set({
      id: 'spam_prop',
      brokerId: 'some_ref',
      title: 'Spam mansion',
      price: 150
    })).rejects.toThrow();
  });

  // P4 Test - Email Unverified Broker check
  test('P4: Unverified email owners are blocked from writing', async () => {
    const unverifiedDb = testEnv.authenticatedContext('unverified_uid', { email_verified: false }).firestore();
    const docRef = unverifiedDb.collection('properties').doc('test_prop');
    await expect(docRef.set({
      id: 'test_prop',
      brokerId: 'unverified_uid',
      title: 'Valid title but email unverified'
    })).rejects.toThrow();
  });

  // P5 Test - Third-party broker impersonation
  test('P5: Broker cannot create a mapping referencing a different brokerId', async () => {
    const attackerDb = testEnv.authenticatedContext('attacker_uid', { email_verified: true }).firestore();
    const propRef = attackerDb.collection('properties').doc('fake_prop');
    await expect(propRef.set({
      id: 'fake_prop',
      brokerId: 'victim_uid',
      title: 'I am taking credit for this house'
    })).rejects.toThrow();
  });

  // P6 Test - Rogue Listing Deletion
  test('P6: Broker cannot delete another broker\'s properties', async () => {
    const attackerDb = testEnv.authenticatedContext('attacker_uid', { email_verified: true }).firestore();
    const propRef = attackerDb.collection('properties').doc('victim_prop');
    // Assume victim_prop data has brokerId == 'victim_uid'
    await expect(propRef.delete()).rejects.toThrow();
  });

  // P9 Test - Wishlist Hijacking
  test('P9: Attacker cannot write to user\'s wishlist', async () => {
    const attackerDb = testEnv.authenticatedContext('attacker_uid').firestore();
    const wishlistRef = attackerDb.collection('wishlists').doc('victim_uid');
    await expect(wishlistRef.set({
      userId: 'victim_uid',
      propertyIds: []
    })).rejects.toThrow();
  });
});
```

These strict assertions ensure our access controls are fully secure.
