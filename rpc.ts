import * as DiscordRPC from "discord-rpc";

let rpcClient: DiscordRPC.Client | undefined;
const clientId = "1213941177951191130";

export const emptyString = "  ";

const data: DiscordRPC.Presence = {
  details: emptyString,
  state: emptyString,
  largeImageKey: "beatsaber",
  largeImageText: "Beat Saber",
  smallImageKey: "  ",
  smallImageText: "  ",
  endTimestamp: undefined,
  startTimestamp: Date.now(),
  instance: false
};

export const connectIPC = async () => {
  if (rpcClient) return;
  const tempClient = (rpcClient = new DiscordRPC.Client({
    transport: "ipc"
  }));
  return (rpcClient = await tempClient.login({ clientId }));
};

export const updatePresence = (newData: Partial<typeof data>) => {
  if (!rpcClient) return;
  for (const key in newData) {
    data[key] = newData[key] || emptyString;
  }

  rpcClient.setActivity(data);
};
