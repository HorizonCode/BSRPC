import { getStreamerToolInfo } from "../utils/questUtil.js";
import { writeFile } from "fs/promises";
import { ipRegex } from "../utils/regexUtil.js";
import chalk from "chalk";
import Enquirer from "enquirer";
import ora from "ora";

export const runSetupWizard = async (configPath: string) => {
  const { quest_ip }: Record<string, string> = await Enquirer.prompt({
    type: "text",
    name: "quest_ip",
    message: chalk.italic.gray(`Please enter your Quests Local IP Address:`),
    validate: (value: string) => {
      return ipRegex.test(value) ? true : "Please enter a valid IP Address";
    },
  });

  const checkIP = ora("Checking your Quest IP Address...").start();
  try {
    await getStreamerToolInfo({ host: quest_ip, port: "53502" });
    checkIP.succeed("Successfully connected to your Quest!");
    const configData = JSON.stringify({ quest_ip }, null, 2);
    await writeFile(configPath, configData, { encoding: "utf-8" });
    return true;
  } catch {
    checkIP.fail(
      "Error, could not connect to your Quest, please check your IP Address and try again.",
    );
    return await runSetupWizard(configPath);
  }
};
