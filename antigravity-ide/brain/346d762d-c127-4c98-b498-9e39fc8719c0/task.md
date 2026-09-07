# Pet Profile Image Fix — Tasks

- [x] Fix ImageKit upload response parsing in `handleImageUpload` (align with `data.success && data.url`)
- [x] Add Edit Pet state variables (`editingPet`, `editPet`, `editImageUploading`, `updatingPet`)
- [x] Add `handleEditImageUpload` function
- [x] Add `handleUpdatePet` function (PUT /api/pets/:id)
- [x] Add Edit button to pet cards
- [x] Add Edit Pet modal (reuse Add Pet form structure)
- [x] Ensure Add Pet uses API response data (not stale state) for list update
- [x] Verify no hardcoded Unsplash URLs are used for pet images
- [x] Verify build compiles — dev server running with HMR active
