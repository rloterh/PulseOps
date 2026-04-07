# Sprint 11 Upload Policy

Current shared upload validation rules:

- images: `image/jpeg`, `image/png`, `image/webp`
- documents: `application/pdf`
- max upload size: `5 MB`
- empty files are rejected
- storage names are randomized under `orgId/category/uuid.extension`

Important operational rules:

- never trust raw client filenames for storage paths
- keep original filenames as metadata only
- reject unsupported or scriptable file types
- add malware scanning as an infrastructure hook later if the storage pipeline supports it

Sprint 11 still needs the shared upload policy applied to every real upload endpoint before final sign-off.
