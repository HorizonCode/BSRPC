import { connectIPC, updatePresence } from "./discord/presence.js";
import {
  getStreamerToolData,
  intToDiff,
  locationToString,
} from "./utils/questUtil.js";
import { StreamerToolsDataResponse } from "./types/responses.js";
import { getFormattedTimeFromSeconds } from "./utils/timeUtil.js";
import { getAlbumCoverFromSongName } from "./utils/spotifyUtil.js";
import path from "path";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { runSetupWizard } from "./setup/wizard.js";
import { setTerminalTitle } from "./utils/terminalUtil.js";
import { ipRegex } from "./utils/regexUtil.js";
import chalk from "chalk";
import ora from "ora";

const appInfo = {
  name: "BSRPC",
  version: "0.1.0",
  author: "HorizonCode",
};

const configFile = path.join(process.cwd(), "bsrpc.json");
const imageCache = new Map<string, string>();

const timeout = {
  retries: 3,
  maxRetries: 3,
};

const updateRPC = async (response: StreamerToolsDataResponse) => {
  const isPlaying = response.location == 1;
  const formattedCurrentTime = getFormattedTimeFromSeconds(response.time);
  const formattedEndTime = getFormattedTimeFromSeconds(response.endTime);

  //TODO: Add other actions, see location.ts
  const isCustomLevel = response.id.startsWith("custom_level_");
  const useBeatsaverCover = response.coverFetchable;
  let coverURL = undefined;

  if (response.levelName && response.levelName.length > 0) {
    if (isCustomLevel) {
      const customLevelId = response.id.split("_", 3)[2].toLowerCase();
      coverURL = useBeatsaverCover
        ? `https://cdn.beatsaver.com/${customLevelId}.jpg`
        : "beatsaber";
    } else {
      if (imageCache.has(response.levelName)) {
        coverURL = imageCache.get(response.levelName);
      } else {
        const fetchedCover = await getAlbumCoverFromSongName(
          `${response.songAuthor} ${response.levelName}`,
        );
        imageCache.set(response.levelName, fetchedCover ?? "beatsaber"); // use default as fallback
      }
    }
  }

  updatePresence({
    details: isPlaying
      ? `${
        response.paused ? "Paused" : "Playing..."
      } (${formattedCurrentTime}/${formattedEndTime})`
      : "Idle...",
    state: isPlaying
      ? `${response.songAuthor} - ${response.levelName} [${
        intToDiff(
          response.difficulty,
        )
      }]`
      : `Browsing in ${locationToString(response.location)}...`,
    largeImageKey: isPlaying ? coverURL : "beatsaber",
    largeImageText: isPlaying
      ? `${response.songAuthor} - ${response.levelName}`
      : "Beat Saber",
    smallImageKey: isPlaying && isCustomLevel ? "info" : undefined,
    smallImageText: isPlaying && isCustomLevel
      ? `Map by ${response.levelAuthor}`
      : undefined,
  });
};

const printInfo = () => {
  console.log(chalk.cyanBright.bold(`    ____ _____ ____  ____  ______
   / __ ) ___// __ \\/ __ \\/ ____/
  / __  \\__ \\/ /_/ / /_/ / /
 / /_/ /__/ / _, _/ ____/ /___
/_____/____/_/ |_/_/    \\____/`));
  console.log(
    chalk.gray(`- Version: ${chalk.cyan.bold(appInfo.version)}`),
  );
  console.log(
    chalk.gray(
      `- Made with ${chalk.red.italic.bold("<3")} by ${
        chalk.cyan.bold(appInfo.author)
      }\n\n${chalk.gray.italic("---------------------------------------")}\n`,
    ),
  );
};

(async () => {
  setTerminalTitle(`${appInfo.name} ${appInfo.version}`);
  printInfo();
  const configCheck = existsSync(configFile);
  if (!configCheck) {
    console.log(chalk.redBright("Running setup..."));
    console.log(
      chalk.yellowBright(
        "You will now enter some information about your Quest, be sure to have Beat Saber open on your Quest!",
      ),
    );
    if (!(await runSetupWizard(configFile))) return;
  }

  const configData = await readFile(configFile, "utf8");
  const configJSON = JSON.parse(configData);

  const host = configJSON["quest_ip"] ?? "";
  const port = "53502";

  if (host.length <= 0) {
    console.log(
      chalk.redBright("✖ You must set the quest_ip in the config file."),
    );
    process.exit(0);
  }

  if (!ipRegex.test(host)) {
    console.log(chalk.redBright("✖ Invalid IP Address in config file."));
    process.exit(0);
  }

  const firstInitCheck = ora(
    "Checking connection to Streamer Tools...",
  ).start();

  let testStreamerToolData: StreamerToolsDataResponse | undefined = undefined;

  try {
    testStreamerToolData = await getStreamerToolData({ host, port });
    firstInitCheck.succeed("Successfully connected to Streamer Tools.");
  } catch {
    firstInitCheck.fail("Error, could not connect to Streamer Tools.");
    process.exit(0);
  }

  const discordRPCConnect = ora("Connecting to Discord IPC...").start();

  try {
    if (!(await connectIPC())) {
      discordRPCConnect.fail("Failed to connect to Discord IPC.");
      process.exit(0);
    } else {
      discordRPCConnect.succeed("Successfully connected to Discord IPC.");
    }
  } catch {
    discordRPCConnect.fail("Failed to connect to Discord IPC.");
    process.exit(0);
  }

  // Update the RPC on init by just using the first test response.
  if (testStreamerToolData) updateRPC(testStreamerToolData);

  setInterval(async () => {
    try {
      const response = await getStreamerToolData({ host, port });
      if (response) updateRPC(response); // update the Discord RPC

      // reset retries because we got a valid response.
      timeout.retries = timeout.maxRetries;
    } catch {
      timeout.retries--;
      if (timeout.retries <= 0) process.exit(0);
      console.log(
        chalk.yellow(
          `Lost connection to Streamer Tools, retrying ${timeout.retries} more times...`,
        ),
      );
    }
  }, 1000 * 1);
})();
