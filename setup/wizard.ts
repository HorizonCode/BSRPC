import {
  getStreamerToolInfo,
  resolveQuestFromLocalNetwork,
} from "../utils/questUtil";
import { ipRegex, portRegex } from "../utils/regexUtil";
import chalk from "chalk";
import Enquirer from "enquirer";
import ora from "ora";
import { Config } from "../config/config";

const setupTypes = [
  {
    name: "Auto-Discovery (not yet implemented)",
    value: "auto",
  },
  {
    name: "Manual",
    value: "manual",
  },
];

export const runSetupWizard = async (config: Config) => {
  const { resolve_type }: Record<string, string> = await Enquirer.prompt([{
    type: "select",
    message:
      "Do you want to enter your Quests IP Address and Port manually or use the auto-discovery feature?",
    name: "resolve_type",
    choices: setupTypes,
    validate: (value: string) => {
      if (value == setupTypes[0].name) {
        return "Auto-Discovery is not yet implemented!";
      }
      return true;
    },
  }]);
  if (resolve_type == setupTypes[0].name) {
    const resolved = await resolveQuestFromLocalNetwork();
    if (resolved) {
      config.set("quest_ip", resolved.host);
      config.set("st_port", resolved.port);
      config.save();
      return true;
    }
    return await runSetupWizard(config);
  }
  const { quest_ip, st_port }: Record<string, string> = await Enquirer.prompt([{
    type: "text",
    name: "quest_ip",
    message: chalk.italic.gray(`Please enter your Quests Local IP Address:`),
    validate: (value: string) => {
      return ipRegex.test(value) ? true : "Please enter a valid IP Address";
    },
  }, {
    type: "text",
    message: chalk.italic.gray(
      `Please enter the port of Streamer Tools(press enter to use default port 53502):`,
    ),
    name: "st_port",
    initial: "53502",
    validate: (value: string) => {
      return portRegex.test(value) ? true : "Please enter a valid port number";
    },
  }]);

  const checkIP = ora(
    `Checking connection to your Quest(${quest_ip}:${st_port})...`,
  ).start();
  try {
    await getStreamerToolInfo({ host: quest_ip, port: "53502" });
    checkIP.succeed("Successfully connected to your Quest!");
    config.set("quest_ip", quest_ip);
    await config.save();
    return true;
  } catch {
    checkIP.fail(
      "Error, could not connect to your Quest, please check your IP Address and Port and try again.",
    );
    return await runSetupWizard(config);
  }
};
