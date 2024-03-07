import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export class Config {
  configPath: string;

  config: Record<string, any> = {};

  constructor(opts: {
    name: string;
  }) {
    this.configPath = path.join(process.cwd(), `${opts.name}.json`);
  }

  exists(): boolean {
    return existsSync(this.configPath);
  }

  async load(): Promise<void> {
    try {
      const configData = await readFile(this.configPath, {
        encoding: "utf-8",
      });
      this.config = JSON.parse(configData);
    } catch {
      throw new Error("Could not load config file.");
    }
  }

  async save(): Promise<void> {
    const configData = JSON.stringify(this.config, null, 2);
    await writeFile(this.configPath, configData, {
      encoding: "utf-8",
    });
  }

  get(key: string): unknown | undefined {
    return this.config[key] ?? undefined;
  }

  set(key: string, value: any): void {
    this.config[key] = value;
  }
}
