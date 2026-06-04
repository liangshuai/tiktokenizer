import { z } from "zod";

export const openSourceModels = z.enum([
  "deepseek-ai/DeepSeek-V4-Flash",
  "Qwen/Qwen3.6-35B-A3B",
  "zai-org/GLM-4.7",
]);

export function tempLlama3HackGetRevision(_model: AllModels): string {
  return "main";
}

export const allModels = openSourceModels;

export type AllModels = z.infer<typeof allModels>;

export const allOptions = allModels;

export type AllOptions = z.infer<typeof allOptions>;

export const MODELS = allModels.options;

export const POPULAR: z.infer<typeof allOptions>[] = [
  "deepseek-ai/DeepSeek-V4-Flash",
  "Qwen/Qwen3.6-35B-A3B",
  "zai-org/GLM-4.7",
];

export function isValidOption(model: unknown): model is AllOptions {
  return allOptions.safeParse(model).success;
}
