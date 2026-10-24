---
description: Create or refresh repository-wide AGENTS.md instructions
---

Initialize the current repository for coding agents.

1. Determine the Git root; do not assume the current directory is the root.
2. Inspect the repository structure, README, package manifests, workspace configuration, documented conventions, and existing nested `AGENTS.md` files.
3. Create or update `AGENTS.md` at the Git root with concise, repository-wide guidance covering architecture, authoritative documentation, setup and verification commands, coding conventions, and safety constraints.
4. Preserve useful existing root instructions and all nested `AGENTS.md` files. Avoid duplicating nested guidance; explain its scope instead.
5. Derive commands and claims only from repository files. Do not expose secrets or read secret values from environment files.
6. Keep the result easy to maintain and report which files changed.

$ARGUMENTS
