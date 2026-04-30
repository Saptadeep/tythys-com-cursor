# Prompt on startup:
    Resume project at c:\tythys-com-cursor.
    Then continue from “Next Task” exactly.
    Use CMD instructions only.
    Read:
    - c:\tythys-com-cursor\docs\PRODUCT_UI_ARCHITECTURE.md
    - c:\tythys-com-cursor\docs\CUSTOMIZATION_AND_EXTENSION_GUIDE.md
    - c:\tythys-com-cursor\docs\SESSION_HANDOFF.md
    Then continue from “Next Task” exactly.
    Use CMD instructions only.

# On-going Caution:
Go through the texts and labels in all pages and find out what texts and copy needs to be change. Do not modify styling, design, typography, spacing, or visual theme.
Let me know the changes you detect before implementing.

# Prompt just before GIT:
I am git-pushing the current bundle with commit remark: XXXXXXXXXXXXXXXXXXXXXX

# Prompt on end of session:
Exiting Cursor. Update handoff so that we can resume smoothly. Keep all files maintained.

# Layout design prompt
Build/update this page to match the existing landing page visual system exactly.
Requirements:
- Reuse current app components/tokens/classes and UI language from landing page.
- Keep same design DNA: glass cards, spacing rhythm, typography hierarchy, color semantics, status pills.
- Do not introduce a new design style.
- Any new dialogs/popups/drawers must inherit existing classes and interaction patterns.
- If a style decision is ambiguous, copy the nearest landing-page pattern.
- Scope changes only to: <list exact files>.

# Git savers:
use this if you want your branch to match the pushed commit with message
26-04-2026 8:41:05.04.

# 1) Find the commit hash by exact message
git log --all --oneline --grep="^26-04-2026 8:41:05.04$"

# 2) Reset your local branch to that commit
git reset --hard <COMMIT_HASH>

# 3) Push that exact state to remote
git push --force-with-lease
Safer alternative (no history rewrite, creates a new commit that undoes later changes):

git revert --no-edit <COMMIT_HASH>..HEAD
git push
Use reset --hard + force-with-lease when you want branch history to look exactly like that old pushed point.
Use revert when others may already be using current history.

