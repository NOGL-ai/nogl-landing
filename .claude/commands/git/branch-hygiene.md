# Branch & Worktree Hygiene

Run this at the START of every Claude Code session to prevent branch tangle.

## What this does

1. Identifies all local and CT 504 branches not yet merged to main
2. For each: either creates a PR and merges it, or deletes it if it has no unique work
3. Removes stale worktrees
4. Ensures main is up to date on both local and CT 504

## Steps

### 1. Sync main
```bash
git fetch origin
git checkout main
git merge --ff-only origin/main
```

### 2. List unmerged branches
```bash
# Local branches with commits not in main
git branch --no-merged main

# Remote branches with commits not in main
git branch -r --no-merged origin/main | grep -v HEAD
```

### 3. For each unmerged branch — decide:
- **Has real feature work** (more than 2 commits, touches src/) → push to origin, create PR, merge
- **Claude session worktree branch** (name starts with `claude/`) → check if empty vs main, delete if no diff
- **CT 504 only** → fetch origin to check, push or discard

```bash
# Check if branch has any unique diff vs main
git diff main..<branch> --stat

# Create PR and merge (for branches with real work)
gh pr create --head <branch> --base main --title "..." --body "..."
gh pr merge <number> --squash --delete-branch

# Delete with no work
git branch -D <branch>
git push origin --delete <branch>  # if on remote
```

### 4. Prune stale worktrees
```bash
git worktree list
git worktree prune
# For worktrees on branches already merged to main:
git worktree remove <path> --force
```

### 5. CT 504 cleanup
```bash
ssh root@10.10.10.182 "cd /root/nogl-landing && git fetch origin && git branch --no-merged origin/main"
# Delete CT 504-only stale branches
ssh root@10.10.10.182 "cd /root/nogl-landing && git branch -D <branch>"
# Kill orphan processes
ssh root@10.10.10.182 "pkill -f tsx; pkill -f esbuild; pm2 status"
```

### 6. Verify clean state
```bash
git branch --no-merged main   # should be empty or only active WIP
git worktree list              # only current session worktree
gh pr list --state open        # should be 0 (or only intentional WIP PRs)
```

## Rules to follow every session

- **Never leave a branch open after its work lands in main.** If you open a PR, merge it before ending the session.
- **Never leave orphan tsx/esbuild processes on CT 504.** Always `pkill -f tsx; pkill -f esbuild` before ending a session that ran enqueue/debug scripts.
- **Keep CT 504 in sync with origin/main** — always `git fetch origin && git merge origin/main` after merging PRs.
- **One branch per session** — use the Claude Code worktree branch for exploratory work, merge or discard at end.
