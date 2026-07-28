# Pi Beginner Cheat Sheet

## Start Pi
```bash
pi
```
From your project folder:
```bash
cd my-project
pi
```

## First-time login
Inside Pi:
```text
/login
```
Then choose your provider.

## Ask for help in plain English
Examples:
- `Explain this codebase`
- `Find the bug in src/app.ts`
- `Add tests for the auth flow`
- `Refactor this function`
- `Review this repo for bugs`

## Most useful commands
- `/login` — sign in
- `/model` — switch model
- `/settings` — change theme/thinking
- `/new` — start a new session
- `/resume` — open an old session
- `/session` — show current session info
- `/tree` — browse conversation branches
- `/quit` — exit Pi

## Working with files
### Attach files to your prompt
- Type `@` in the editor to search for files
- Or start Pi with files:

```bash
pi @src/index.ts "Explain this file"
pi @a.ts @b.ts "Compare these files"
```

### Useful prompts
- `Summarize @README.md`
- `Explain @src/server.ts`
- `Find problems in @src/auth.ts`
- `Update @test/login.test.ts to match the new API`

## Handy keyboard shortcuts
- `Ctrl+L` — choose model
- `Shift+Enter` — new line
- `Ctrl+G` — open external editor
- `Escape` — cancel current work
- `Ctrl+C` — clear editor
- `Ctrl+C` twice — quit

If you forget shortcuts:
```text
/hotkeys
```

## One-shot mode
Ask one question and exit:
```bash
pi -p "Summarize this codebase"
```

Use stdin:
```bash
cat README.md | pi -p "Summarize this"
```

## Common starter workflow
From a repo:
```bash
pi
```
Then ask:
1. `Map this codebase`
2. `What are the main entry points?`
3. `Find the most likely bug`
4. `Propose a fix`
5. `Implement it`

## Good habits
- Be specific: name files, features, errors
- Ask Pi to explain before changing code if you’re unsure
- Use `@file` when you want attention on a specific file
- Use `/new` when switching to a different task

## Minimal examples
```bash
pi
pi "Explain this repo"
pi -p "Summarize this project"
pi @src/app.ts "Review this file"
pi -c
```

- `pi` — open interactive mode
- `pi -c` — continue last session
