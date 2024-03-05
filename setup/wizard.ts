import chalk from "chalk";
import enquirer from "enquirer";
import ora from "ora";
import { getStreamerToolInfo } from "../utils/questUtil.js";
import { writeFile } from "fs/promises";

export const runSetupWizard = async (configPath: string) => {
  console.log(
    chalk.yellowBright(
      "You will now enter some information about your Quest, be sure to have Beat Saber open on your Quest!",
    ),
  );
  const { quest_ip }: Record<string, string> = await enquirer.prompt({
    type: "text",
    name: "quest_ip",
    message: chalk.italic.gray(`Please enter your Quests Local IP Address:`),
    validate: (value: string) => {
      const ipRegex =
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
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
