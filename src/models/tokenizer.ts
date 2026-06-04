import { hackModelsRemoveFirstToken } from "./index";
import { openSourceModels } from ".";
import { PreTrainedTokenizer, env } from "@xenova/transformers";
import type { z } from "zod";
import {
  getHuggingfaceSegments,
  type Segment,
} from "~/utils/segments";

export interface TokenizerResult {
  name: string;
  tokens: number[];
  segments?: Segment[];
  count: number;
}

export interface Tokenizer {
  name: string;
  tokenize(text: string): TokenizerResult;
  free?(): void;
}

export class OpenSourceTokenizer implements Tokenizer {
  constructor(private tokenizer: PreTrainedTokenizer, name?: string) {
    this.name = name ?? tokenizer.name;
  }

  name: string;

  static async load(
    model: z.infer<typeof openSourceModels>
  ): Promise<PreTrainedTokenizer> {
    // use current host as proxy if we're running on the client
    if (typeof window !== "undefined") {
      env.remoteHost = window.location.origin;
    }
    env.remotePathTemplate = "/hf/{model}";
    // Set to false for testing!
    // env.useBrowserCache = false;
    const t = await PreTrainedTokenizer.from_pretrained(model, {
      progress_callback: (progress: any) =>
        console.log(`loading "${model}"`, progress),
    });
    console.log("loaded tokenizer", model, t.name);
    return t;
  }

  tokenize(text: string): TokenizerResult {
    const tokens = this.tokenizer.encode(text);
    const removeFirstToken = (
      hackModelsRemoveFirstToken.options as string[]
    ).includes(this.name);
    return {
      name: this.name,
      tokens,
      segments: getHuggingfaceSegments(this.tokenizer, text, removeFirstToken),
      count: tokens.length,
    };
  }
}

export async function createTokenizer(name: string): Promise<Tokenizer> {
  console.log("createTokenizer", name);

  const ossModel = openSourceModels.safeParse(name);
  if (ossModel.success) {
    console.log("loading tokenizer", ossModel.data);
    const tokenizer = await OpenSourceTokenizer.load(ossModel.data);
    console.log("loaded tokenizer", name);
    return new OpenSourceTokenizer(tokenizer, name);
  }
  throw new Error("Invalid model or encoding");
}
