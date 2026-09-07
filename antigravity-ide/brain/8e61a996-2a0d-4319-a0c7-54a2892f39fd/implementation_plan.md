# Fix SPA Navigation and Flicker (Implement Layouts)

The issue you are experiencing with full-page reloads, visual jumps, and flickering sidebars during navigation is caused by a common React anti-pattern: the `Sidebar` and `TopNav` layout wrappers are being rendered individually inside *each* page component. When React Router navigates to a new page, it unmounts the old page (destroying the sidebar) and mounts the new page (recreating the sidebar), causing the browser to repaint and lose state.

To make this a true Single Page Application (SPA), we need to extract the sidebar and layout structure into a shared React Router `<Layout>` component using `<Outlet>`.

## Open Questions
None. The required changes are well-understood.

## Proposed Changes

We will create a `MainLayout` component that renders the `Sidebar` (dynamically choosing Owner or Vet based on the user's role) and an `<Outlet />` for the page content. We will then update `App.jsx` to wrap all authenticated routes with this Layout. Finally, we will remove the redundant sidebars and wrapper `<div>`s from all individual page components.

### 1. New Component: `MainLayout.jsx`

#### [NEW] `src/layouts/MainLayout.jsx`
Will contain the shared `flex` container, the dynamic sidebar (`OwnerSidebar` or `VetSidebar`), and the `ml-[280px]` content wrapper with an `<Outlet />`.

### 2. Application Routing

#### [MODIFY] `src/App.jsx`
- Import `MainLayout`
- Wrap all protected routes (both Owner and Vet) inside `<Route element={<MainLayout />}>`

### 3. Page Components (Remove Redundant Layouts)

We will modify the following files to remove their explicit `Sidebar` imports, outer `div.flex` wrappers, and `ml-[280px]` margins, as these will now be handled by `MainLayout`.

#### Owner Pages
- [MODIFY] `src/pages/OwnerDashboard.jsx`
- [MODIFY] `src/pages/FindVets.jsx`
- [MODIFY] `src/pages/VetProfile.jsx`
- [MODIFY] `src/pages/MyPets.jsx`
- [MODIFY] `src/pages/Appointments.jsx`
- [MODIFY] `src/pages/Prescription.jsx`
- [MODIFY] `src/pages/BookingConfirmation.jsx`

#### Doctor/Vet Pages
- [MODIFY] `src/pages/DoctorDashboard.jsx`
- [MODIFY] `src/pages/DoctorProfile.jsx`
- [MODIFY] `src/pages/VetAppointments.jsx`
- [MODIFY] `src/pages/VetAvailability.jsx`
- [MODIFY] `src/pages/VetEarnings.jsx`
- [MODIFY] `src/pages/Prescribe.jsx`

#### Shared/Dynamic Pages
- [MODIFY] `src/pages/VetTelehealthRoom.jsx`
- [MODIFY] `src/pages/LiveChat.jsx`

## Verification Plan

### Manual Verification
1. Log in to the application (either as an Owner or Vet).
2. Click through the Sidebar navigation links (Dashboard, Find Vets, Appointments, etc.).
3. Verify that the Sidebar and overall layout remain completely stable (no flickering, jumping, or reloading).
4. Verify that the URL changes and the main content area updates smoothly.
5. Verify that layout-specific pages like `LiveChat` still span the full height correctly without padding issues.
