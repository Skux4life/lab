/**
 * acli guard
 *
 * Allowlist-based guard for the Atlassian CLI (`acli`) when run through the bash tool.
 * Read-only subcommands run freely. Anything else (create/edit/delete/transition/auth/...,
 * including unknown or future subcommands) needs user confirmation, or is blocked when
 * there is no UI to ask.
 *
 * This is a guardrail, not a security boundary: it cannot see through variables, eval,
 * wrapper scripts, etc. Use least-privilege API tokens for a hard limit.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/** Leading positional words (after `acli`) that are read-only. Prefix match. */
const READ_ONLY: string[][] = [
	["help"],
	["auth", "status"],
	// Jira
	["jira", "auth", "status"],
	["jira", "workitem", "search"],
	["jira", "workitem", "view"],
	["jira", "workitem", "list-watchers"],
	["jira", "workitem", "watcher", "list"],
	["jira", "workitem", "comment", "list"],
	["jira", "workitem", "comment", "visibility"],
	["jira", "workitem", "attachment", "list"],
	["jira", "workitem", "link", "list"],
	["jira", "workitem", "link", "type"],
	["jira", "project", "list"],
	["jira", "project", "view"],
	["jira", "board", "search"],
	["jira", "board", "view"],
	["jira", "board", "get"],
	["jira", "board", "list-projects"],
	["jira", "board", "list-sprints"],
	["jira", "sprint", "view"],
	["jira", "sprint", "list-workitems"],
	["jira", "filter", "list"],
	["jira", "filter", "search"],
	["jira", "filter", "view"],
	["jira", "filter", "get"],
	["jira", "filter", "list-columns"],
	["jira", "filter", "get-columns"],
	["jira", "dashboard", "search"],
	// Confluence
	["confluence", "auth", "status"],
	["confluence", "page", "view"],
	["confluence", "space", "list"],
	["confluence", "space", "view"],
	["confluence", "blog", "list"],
	["confluence", "blog", "view"],
];

const HELP_FLAGS = new Set(["-h", "--help", "-v", "--version"]);

interface Token {
	text: string;
	quoted: boolean;
}

/** Minimal shell tokenizer: splits into command segments, keeps quoted strings as one token. */
function tokenize(input: string): Token[][] {
	const segments: Token[][] = [];
	let tokens: Token[] = [];
	let cur = "";
	let has = false;
	let quoted = false;

	const pushToken = () => {
		if (has) tokens.push({ text: cur, quoted });
		cur = "";
		has = false;
		quoted = false;
	};
	const pushSegment = () => {
		pushToken();
		if (tokens.length) segments.push(tokens);
		tokens = [];
	};

	for (let i = 0; i < input.length; i++) {
		const c = input[i];
		if (c === "'") {
			quoted = has = true;
			const end = input.indexOf("'", i + 1);
			const stop = end === -1 ? input.length : end;
			cur += input.slice(i + 1, stop);
			i = stop;
		} else if (c === '"') {
			quoted = has = true;
			i++;
			while (i < input.length && input[i] !== '"') {
				if (input[i] === "\\" && i + 1 < input.length) i++;
				cur += input[i++];
			}
		} else if (c === "\\" && i + 1 < input.length) {
			has = true;
			cur += input[++i];
		} else if (c === " " || c === "\t") {
			pushToken();
		} else if (";&|\n()`".includes(c)) {
			pushSegment();
		} else {
			has = true;
			cur += c;
		}
	}
	pushSegment();
	return segments;
}

const isAcli = (t: string) => t === "acli" || t.endsWith("/acli") || t === "acli.exe";

/** Returns the acli invocations in `command` that are not on the read-only allowlist. */
export function findGuardedInvocations(command: string, depth = 0): string[] {
	const found: string[] = [];
	if (depth > 5) return [command]; // too nested to analyse: fail closed

	for (const seg of tokenize(command)) {
		for (let i = 0; i < seg.length; i++) {
			const tok = seg[i];

			// Quoted strings that mention acli (e.g. `sh -c "acli ..."`) are analysed as commands.
			if ((tok.quoted || /\s/.test(tok.text)) && /\bacli\b/.test(tok.text)) {
				found.push(...findGuardedInvocations(tok.text, depth + 1));
				continue;
			}
			if (tok.quoted || !isAcli(tok.text)) continue;

			const args = seg.slice(i + 1).map((t) => t.text);
			const display = ["acli", ...args].join(" ");
			if (args.some((a) => HELP_FLAGS.has(a))) continue;

			const positionals: string[] = [];
			for (const a of args) {
				if (a.startsWith("-")) break;
				positionals.push(a);
			}
			if (positionals.length === 0 && args.every((a) => a.startsWith("-"))) continue; // bare acli

			const allowed = READ_ONLY.some((p) => p.every((w, idx) => positionals[idx] === w));
			if (!allowed) found.push(display);
		}
	}
	return found;
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "bash") return undefined;

		const command = String(event.input.command ?? "");
		if (!/acli/.test(command)) return undefined;

		const guarded = findGuardedInvocations(command);
		if (guarded.length === 0) return undefined;

		const list = guarded.map((g) => `  ${g}`).join("\n");

		if (!ctx.hasUI) {
			return { block: true, reason: `Blocked non-read-only acli command (no UI to confirm):\n${list}` };
		}

		const choice = await ctx.ui.select(`⚠️ acli command may change data:\n\n${list}\n\nAllow?`, ["Yes", "No"]);
		if (choice !== "Yes") {
			return { block: true, reason: "Blocked by user: acli command is not on the read-only allowlist" };
		}
		return undefined;
	});
}
