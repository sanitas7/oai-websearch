#!/usr/bin/env node
/**
 * OpenAI Web Search CLI
 *
 * - positional arg  : search query
 * - --reasoning-effort|-r : low|medium|high (default: medium)
 * - --search-context-size|-c : low|medium|high (default: medium)
 * - --openai-api-key|-k : API key (optional)
 *
 * API key resolution priority:
 *   1. --openai-api-key
 *   2. Environment variable OAI_SEARCH_API_KEY
 *   3. Environment variable OPENAI_API_KEY
 */

import { Command, InvalidArgumentError } from "commander";
import OpenAI from "openai";
import process from "node:process";

type Level = "low" | "medium" | "high";

interface CliOptions {
  reasoningEffort: Level;
  searchContextSize: Level;
  openaiApiKey?: string;
}

const parseLevel =
  (flag: string) =>
  (value: string): Level => {
    const v = value.toLowerCase();
    if (v === "low" || v === "medium" || v === "high") return v;
    throw new InvalidArgumentError(`${flag} must be one of: low, medium, high`);
  };

const getApiKey = (cliKey?: string): string => {
  if (cliKey) return cliKey;
  if (process.env.OAI_SEARCH_API_KEY) return process.env.OAI_SEARCH_API_KEY;
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  console.error(
    "Error: OpenAI API key is required. Pass with --openai-api-key or set OAI_SEARCH_API_KEY / OPENAI_API_KEY."
  );
  process.exit(1);
};

/* ---------- CLI ---------- */

const program = new Command();

program
  .name("oai-websearch")
  .argument("<query>", "search query")
  .option(
    "-r, --reasoning-effort <level>",
    "reasoning effort level",
    parseLevel("--reasoning-effort"),
    "medium"
  )
  .option(
    "-c, --search-context-size <level>",
    "search context size",
    parseLevel("--search-context-size"),
    "medium"
  )
  .option("-k, --openai-api-key <key>", "OpenAI API key")
  .showHelpAfterError();

program.parse(process.argv);

const opts = program.opts<CliOptions>();

const query = program.args.join(" ").trim();
if (!query) {
  program.error("Search query is empty");
}

const main = async (): Promise<void> => {
  const client = new OpenAI({
    apiKey: getApiKey(opts.openaiApiKey),
  });

  try {
    // Use Responses API
    const response = await client.responses.create({
      model: "o3", // Default model
      input: query,
      instructions:
        "You are a helpful assistant specialized in web search. Your primary role is to search the web for the most relevant and up-to-date information based on the user's query. Provide accurate, comprehensive, and well-structured answers based on the search results. Always cite your sources when presenting information from the web.",
      reasoning: {
        effort: opts.reasoningEffort,
      },
      tools: [
        {
          type: "web_search_preview",
          search_context_size: opts.searchContextSize,
        } as any, // Type definitions may not be up to date
      ],
    });

    // Display Responses API output
    console.log(response.output_text);
  } catch (error: any) {
    console.error("Request failed:", error.message || error);
    if (error.status === 401) {
      console.error("\nInvalid API key. Please check your OpenAI API key.");
    } else if (error.status === 429) {
      console.error("\nRate limit exceeded. Please try again later.");
    } else if (error.status === 404) {
      console.error(
        "\nModel not found. Please check if you have access to the o3 model."
      );
    }
    process.exit(1);
  }
};

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
