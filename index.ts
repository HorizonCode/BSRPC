import ora from "ora";
import { connectIPC, updatePresence } from "./rpc.js";
import { getStreamerToolData, intToDiff, locationToString } from "./questUtil.js";
import { StreamerToolsDataResponse } from "./types.js";
import { config } from "dotenv";

config();

let retries = 3;

const updateRPC = async (response: StreamerToolsDataResponse) => {
  const isPlaying = response.location == 1;

  const currentTimeDate = new Date(0);
  currentTimeDate.setSeconds(response.time);

  const formattedCurrentTime = currentTimeDate.toISOString().substring(14, 19);

  const endTimeDate = new Date(0);
  endTimeDate.setSeconds(response.endTime);

  const formattedEndTime = endTimeDate.toISOString().substring(14, 19);

  //TODO: Add other actions, see location.ts

  updatePresence({
    details: isPlaying
      ? `${
          response.paused ? "Paused" : "Playing..."
        } (${formattedCurrentTime}/${formattedEndTime})`
      : "Idle...",
    state: isPlaying
      ? `${response.songAuthor} - ${response.levelName} [${intToDiff(
          response.difficulty
        )}]`
      : `Browsing in ${locationToString(response.location)}...`
  });
};

(async () => {
  const host = process.env["QUEST_IP"] ?? "";
  const port = process.env["ST_PORT"] ?? "";

  if (host.length <= 0 || port.length <= 0) {
    console.log("You must set the QUEST_IP and ST_PORT environment variables.");
    process.exit(0);
  }

  const firstInitCheck = ora(
    "Checking connection to Streamer Tools..."
  ).start();

  try {
    await getStreamerToolData({ host, port });
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

  setInterval(async () => {
    try {
      const response = await getStreamerToolData({ host, port });
      updateRPC(response); // update the Discord RPC

      // reset retries because we got a valid response.
      retries = 10;
    } catch {
      retries--;
      if (retries <= 0) process.exit(0);
      console.log(`Error, retrying ${retries} more times...`);
    }
  }, 1000 * 3);
})();
