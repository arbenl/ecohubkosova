#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const logPath = resolve(projectRoot, "logs", "mcp-health.json");
const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const normalizedMode = modeArg?.split("=")[1] === "ci" ? "ci" : "local";

const report = {
  timestamp: new Date().toISOString(),
  mode: normalizedMode,
  contractVersion: null,
  overallStatus: "ok",
  servers: {},
  errors: [],
};

const aliasMap = new Map();

function markWarn(message) {
  if (message) {
    report.errors.push(message);
  }
  if (report.overallStatus === "ok") {
    report.overallStatus = "warn";
  }
}

function markFail(message) {
  if (message) {
    report.errors.push(message);
  }
  report.overallStatus = "fail";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesPattern(pattern, candidates) {
  if (!pattern) return false;
  if (pattern.includes("*")) {
    const regex = new RegExp(`^${escapeRegex(pattern).replace(/\\\*/g, ".*")}$`);
    return candidates.some((tool) => regex.test(tool));
  }
  return candidates.includes(pattern);
}

function toolSatisfied(tool, candidates) {
  const aliases = aliasMap.get(tool) ?? [];
  const patterns = [tool, ...aliases];
  return patterns.some((pattern) => matchesPattern(pattern, candidates));
}

function evaluateContract(requiredTools, optionalTools, candidates) {
  const missingRequired = [];
  const missingOptional = [];

  for (const tool of requiredTools) {
    if (!toolSatisfied(tool, candidates)) {
      missingRequired.push(tool);
    }
  }

  for (const tool of optionalTools) {
    if (!toolSatisfied(tool, candidates)) {
      missingOptional.push(tool);
    }
  }

  let status = "ok";
  if (missingRequired.length > 0) {
    status = "fail";
  } else if (missingOptional.length > 0) {
    status = "warn";
  }

  return { missingRequired, missingOptional, status };
}

async function ensureLogWritten() {
  await mkdir(dirname(logPath), { recursive: true });
  await writeFile(logPath, JSON.stringify(report, null, 2));
}

async function listToolsForServer(serverName, serverConfig) {
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
  const command = serverConfig.command || serverConfig.cmd || serverConfig.bin;
  if (!command) {
    throw new Error(`No command defined for ${serverName}`);
  }

  const transport = new StdioClientTransport({
    command,
    args: serverConfig.args ?? [],
    cwd: serverConfig.cwd ?? projectRoot,
    env: {
      ...process.env,
      ...(serverConfig.env ?? {}),
    },
  });

  const client = new Client({
    name: "eco-mcp-health",
    version: "1.0.0",
  });

  const timeoutMs = 45000;
  const tools = [];

  let timeoutId;
  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Timed out after ${timeoutMs}ms while querying ${serverName}`));
      }, timeoutMs);
    });

    const listPromise = (async () => {
      await client.connect(transport);
      const result = await client.listTools({});
      return (result?.tools ?? []).map((tool) => tool.name);
    })();

    const discovered = await Promise.race([listPromise, timeoutPromise]);
    tools.push(...discovered);
  } finally {
    clearTimeout(timeoutId);
    try {
      await transport.close();
    } catch {
      // ignore close failures; process might already be gone
    }
  }

  return tools;
}

async function main() {
  try {
    const mcpConfigRaw = await readFile(resolve(projectRoot, "mcp.json"), "utf-8");
    const mcpConfig = JSON.parse(mcpConfigRaw);
    const serverConfigs = mcpConfig.mcpServers ?? {};

    const contractPath = resolve(projectRoot, "tools", "mcp-contract.json");
    const contractRaw = await readFile(contractPath, "utf-8");
    const contract = JSON.parse(contractRaw);
    report.contractVersion = contract.version ?? null;

    if (contract.toolAliases && typeof contract.toolAliases === "object") {
      for (const [logicalName, values] of Object.entries(contract.toolAliases)) {
        if (Array.isArray(values)) {
          aliasMap.set(logicalName, values);
        }
      }
    }

    if (!contract.servers || typeof contract.servers !== "object") {
      markFail("Contract is missing the servers map.");
      return;
    }

    for (const [serverName, entry] of Object.entries(contract.servers)) {
      const requiredTools = Array.isArray(entry.requiredTools) ? entry.requiredTools : [];
      const optionalTools = Array.isArray(entry.optionalTools) ? entry.optionalTools : [];
      const serverConfig = serverConfigs[serverName];

      const serverReport = {
        configured: Boolean(serverConfig),
        command: serverConfig?.command ?? null,
        args: serverConfig?.args ?? [],
        cwd: serverConfig?.cwd ?? projectRoot,
        reachable: null,
        handshake: normalizedMode === "local" ? "pending" : "skipped",
        discoveredTools: [],
        contract: {
          required: requiredTools,
          optional: optionalTools,
          missingRequired: [],
          missingOptional: [],
          status: normalizedMode === "local" ? "pending" : "skipped",
        },
        errors: [],
        warnings: [],
      };

      if (!serverConfig) {
        serverReport.handshake = "skipped";
        serverReport.reachable = false;
        serverReport.contract.status = "fail";
        const message = `Missing server configuration for ${serverName}.`;
        serverReport.errors.push(message);
        markFail(message);
        report.servers[serverName] = serverReport;
        continue;
      }

      if (normalizedMode === "local") {
        try {
          const tools = await listToolsForServer(serverName, serverConfig);
          serverReport.discoveredTools = tools;
          serverReport.reachable = true;
          serverReport.handshake = "ok";

          const evaluation = evaluateContract(requiredTools, optionalTools, tools);
          serverReport.contract.missingRequired = evaluation.missingRequired;
          serverReport.contract.missingOptional = evaluation.missingOptional;
          serverReport.contract.status = evaluation.status;

          if (evaluation.missingRequired.length > 0) {
            const message = `Server ${serverName} is missing required tools: ${evaluation.missingRequired.join(", ")}`;
            serverReport.errors.push(message);
            markFail(message);
          } else if (evaluation.missingOptional.length > 0) {
            const message = `Server ${serverName} is missing optional tools: ${evaluation.missingOptional.join(", ")}`;
            serverReport.warnings.push(message);
            markWarn(message);
          } else {
            serverReport.contract.status = "ok";
          }
        } catch (error) {
          const message = `Failed to query server ${serverName}: ${error instanceof Error ? error.message : String(error)}`;
          serverReport.reachable = false;
          serverReport.handshake = "fail";
          serverReport.errors.push(message);
          markFail(message);
        }
      } else {
        // CI mode only validates structure, not tool availability
        serverReport.handshake = "skipped";
        serverReport.reachable = null;
        serverReport.contract.status = "skipped";
      }

      report.servers[serverName] = serverReport;
    }

    // Ensure contract does not reference unknown servers
    for (const serverName of Object.keys(contract.servers)) {
      if (!report.servers[serverName]) {
        // Should not happen because we iterated all entries
        const message = `Contract entry for ${serverName} was not processed.`;
        markFail(message);
      }
    }
  } catch (error) {
    const message = `Health check error: ${error instanceof Error ? error.message : String(error)}`;
    markFail(message);
  } finally {
    await ensureLogWritten();
  }
}

main()
  .then(() => {
    const shouldFail = report.overallStatus === "fail";
    const summary = `[MCP HEALTH] Mode=${report.mode} Status=${report.overallStatus.toUpperCase()}`;
    if (shouldFail) {
      console.error(summary);
    } else {
      console.log(summary);
    }
    if (shouldFail) {
      process.exit(1);
    }
  })
  .catch(async (error) => {
    const message = `Unexpected MCP health failure: ${error instanceof Error ? error.message : String(error)}`;
    markFail(message);
    await ensureLogWritten();
    console.error(`[MCP HEALTH] ${message}`);
    process.exit(1);
  });
