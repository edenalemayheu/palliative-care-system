# DECISIONS.md — Frontend Assumptions & Flagged Gaps

All decisions made during implementation that deviate from docs, fill doc gaps, or resolve conflicts between documents.

---

## D-01 PatientProgressPage route

**Gap:** `/patients/:id/progress` appears in `docs/frontend-specification/03-patients.md` but is absent from `docs/folder-structure/frontend-structure.md`'s route summary table.

**Decision:** Route added. The spec document is the authoritative source for what screens exist; the folder-structure route table is not exhaustive.

---

## D-02 Detail pages for sub-resources

**Gap:** `VisitDetailPage`, `MedicationDetailPage`, `LabDetailPage`, `ReferralDetailPage`, and `AdmissionDetailPage` all appear in their respective spec files but are not listed in `frontend-structure.md`'s pages table.

**Decision:** All five detail pages created under `src/pages/staff/`. They are clearly described in the spec files and required for a complete, clickable UI.

---

## D-03 Staff sidebar "Visits" nav item

**Gap:** `frontend-specification/09-staff-dashboard.md` lists a "Visits" nav item but no standalone `/visits` route exists — all visit routes require a `patientId` parameter.

**Decision:** The Visits nav item points to `/patients` (the patient list). Users select a patient first, then record a visit from the patient detail page. This matches the actual route architecture and avoids a broken link. A tooltip "Select a patient to record a visit" is shown on hover.

---

## D-04 Admin mock credential

**Gap:** The prompt specified `john@gmail.com / abcdefghi / John Doe` as the staff mock credential but gave no admin credential.

**Decision:** Admin mock: `admin@example.com / admin123 / Admin User`. Documented in README and displayed on the login page as a demo hint.

---

## D-05 `src/api/mocks/` folder

**Gap:** `frontend-structure.md` does not list `src/api/mocks/` but the prompt explicitly requires a separate fixture folder so that switching to the real backend is a one-line flag change.

**Decision:** Added `src/api/mocks/` as a subfolder of `src/api/`. Each mock file mirrors its service-layer counterpart: `auth.mock.ts`, `patients.mock.ts`, `visits.mock.ts`, `medications.mock.ts`, `labs.mock.ts`, `referrals.mock.ts`, `admissions.mock.ts`, `admin.mock.ts`, `staff.mock.ts`.

---

## D-06 `src/lib/config.ts`

**Gap:** `frontend-structure.md` does not list `src/lib/config.ts` but the `VITE_USE_MOCK` flag architecture from the prompt requires a central config export.

**Decision:** Added `src/lib/config.ts` exporting `USE_MOCK`, `API_URL`, `APP_NAME`, and `APP_ENV`. Every API service file imports `USE_MOCK` from here — changing the flag in `.env` is the only required integration step.

---

## D-07 Axios response envelope unwrapping

**Gap:** Docs describe a `{ statusCode, success, message, data }` response envelope for all API responses. Components should never see the envelope.

**Decision:** The Axios response interceptor in `src/lib/axios.ts` unwraps the envelope once: if `response.data` has a `data` key, `response.data` is replaced with `response.data.data`. Every API function therefore returns clean typed data. No component or hook deals with `.data.data`.

---

## D-08 Feature component folders — stub files

**Gap:** `frontend-structure.md` lists component files inside `src/components/patients/`, `src/components/visits/`, etc. The actual implementations live directly in the page files for this project (following the spec's page-level implementation examples).

**Decision:** Stub `export {}` files created for every filename listed in `frontend-structure.md` to satisfy the folder structure requirement. Real implementations are co-located in pages per the spec code samples.

---

## D-09 ReportsPage export (admin-only)

**Source:** `docs/requirments.md` FR-61 — "Admin can export reports in PDF or Excel format" (Priority: Could).

**Decision:** Export buttons implemented on `ReportsPage` (admin-only). In mock mode, clicking export triggers `mockAdminApi.exportReport()` which returns a dummy Blob. Staff role cannot access `/admin/reports`.

---

## D-10 SettingsPage

**Gap:** No functional requirements exist for settings beyond "system settings (future feature)".

**Decision:** Placeholder page showing system info (app name, institution, version, environment, mock mode status) and a security checklist. No live settings are implemented.

---

## D-11 `PatientProgressPage` — data

**Gap:** The patient progress data is derived from visit KPS/PPS scores. Mock data in `patients.mock.ts` → `getProgress()` synthesises 6 data points per patient with a declining trend to make the chart visually interesting.

---

## D-12 `formatEnumLabel` utility

**Added:** `src/lib/utils.ts` exports `formatEnumLabel(value: string)` which converts CamelCase enum strings (`SymptomsImproved`) to human-readable title case (`Symptoms Improved`). Used throughout detail pages.

---

## D-13 Immutability of patient records

**Source:** `docs/requirments.md` — "Patient records are immutable outside the documented close-case/update flows".

**Decision:** No edit button or edit form exists anywhere in the patient module. The only mutation on patient data is Close Case (admin-only). Medication `status` and lab `result` can be updated by staff — these are explicit update flows documented in the spec, not general edits.

---

## D-14 Secondary diagnoses and comorbidities on registration form

**Gap:** The spec defines these as `string[]` but a text input naturally produces a single string.

**Decision:** The PatientRegistrationPage shows a free-text input with a hint "Separate with commas". The form controller parses the comma-separated string into an array before submitting. This matches how clinicians naturally enter multiple values.

---

## D-15 VITE_USE_MOCK in .env

**Note:** `.env` is gitignored. `.env.example` is committed with the same content (`VITE_USE_MOCK=true`). When the real backend is ready, update `.env`: set `VITE_USE_MOCK=false` and `VITE_API_URL=<backend-url>`. No code changes needed.
