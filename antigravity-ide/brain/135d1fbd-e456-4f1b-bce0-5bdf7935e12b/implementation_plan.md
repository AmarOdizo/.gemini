# Implementation Plan: MyPets Bug Fixes

Based on my investigation into the live API response and the frontend code, here are the exact reasons why you are experiencing these 3 bugs, followed by the proposed fixes.

## Bug Analysis

### 1. Unable to add Cat, Rabbit, and Other category
**Reason:** The live backend on Render is returning the species of the pet in a field called `type` (e.g., `"type": "Dog"`), not `species`. However, `MyPets.jsx` was strictly looking for `pet.species`. When you add a Cat, it successfully saves to the database, but the frontend reads `pet.species` as `undefined`. Therefore, when you click the "Cat" filter button, it finds 0 matches and looks like it wasn't added.

### 2. A different picture is shown (Chameleon) & Image not showing
**Reason:** Since `pet.species` is evaluated as `undefined` (because it's actually `pet.type`), the frontend tries to load the default image for the pet. Because it doesn't know what species it is, it falls back to the `Other` category. The default image for `Other` is hardcoded as an Unsplash image of a **chameleon**. 
Additionally, your actual ImageKit upload is failing silently because the ImageKit API keys in the backend environment variables (`public_/PfWSDF...` and `private_QugD...`) are dummy/mock keys. Since the upload fails, it uses the fallback (the chameleon).

### 3. Pet data vanishes after logout
**Reason:** When you log out and log back in, the `currentUser` object might be structured slightly differently depending on whether it was a registration or a login response. If the `ownerId` (like `6a9e64...`) isn't precisely matched in the frontend fetch query (`?ownerId=...`), the API will return 0 pets. Also, if you were using a guest session or a token expired, it might fail to load. We will harden the `fetchPets` function to guarantee it correctly identifies the owner's ID across all login/logout states.

---

## User Review Required

> [!WARNING]
> **ImageKit Uploads Will Continue to Fail** until you provide real ImageKit API keys in your Render backend `.env` file. However, I will fix the frontend so that it gracefully handles the failure and shows the correct default image (Cat, Dog, etc.) instead of the chameleon!

## Proposed Changes

### Frontend Modifications (`petcare-react/src/pages/MyPets.jsx`)
- **[MODIFY]** `MyPets.jsx`:
  - Update all references of `pet.species` to `(pet.species || pet.type)` so it correctly reads the field from the live backend.
  - Update the fallback image logic: `DEFAULT_PET_IMAGES[pet.species || pet.type] || DEFAULT_PET_IMAGES.Other`.
  - Fix the species filtering logic to properly match `type`.
  - Enhance the `fetchPets` function to ensure it robustly extracts the `ownerId` from the active `currentUser` object, ensuring data perfectly restores after logging out and back in.
  - Add explicit error handling for the ImageKit upload so it alerts you if the mock keys cause a failure, rather than silently falling back to the chameleon.

## Verification Plan
1. Apply the fixes to `MyPets.jsx`.
2. Wait for you to add a new Cat/Rabbit.
3. Verify that the correct Cat/Rabbit fallback image appears (no chameleon).
4. Verify that the filter buttons work seamlessly for all categories.
