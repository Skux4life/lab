import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return undefined;

    const command = String(event.input.command ?? "");
    const isDangerous = /\brm\s+(-rf?|-fr|--recursive)\b/i.test(command);

    if (!isDangerous) return undefined;

    if (!ctx.hasUI) {
      return { block: true, reason: "Blocked dangerous rm command (no UI available)" };
    }

    const ok = await ctx.ui.confirm(
      "Dangerous command",
      `Allow this command?\n\n${command}`,
    );

    if (!ok) {
      return { block: true, reason: "Blocked by user" };
    }

    return undefined;
  });
}
