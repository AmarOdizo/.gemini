# Task List: MyPets.jsx Bug Fixes

- `[x]` Update `MyPets.jsx` to handle live backend schema changes
  - `[x]` Update all `pet.species` references to `(pet.species || pet.type)`
  - `[x]` Fix the fallback image logic to properly map Cat, Rabbit, etc.
  - `[x]` Fix the filtering logic to properly match `type`.
- `[x]` Enhance `fetchPets` and `handleAddPetSubmit` to cleanly handle `ownerId`.
- `[x]` Add explicit error handling for ImageKit upload errors to prevent fallback chameleon.
- `[x]` Verify changes.
