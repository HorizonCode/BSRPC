import { Client, Presence } from "discord-rpc";

let rpcClient: Client | undefined;
const clientId = "1213941177951191130";

let lastRPCUpdate = 0;

export const emptyString = "  ";

const data: Presence = {
  details: emptyString,
  state: emptyString,
  largeImageKey: "beatsaber",
  largeImageText: "Beat Saber",
  smallImageKey: "  ",
  smallImageText: "  ",
  instance: false,
};

export const connectIPC = async () => {
  if (rpcClient) return;
  const tempClient = (rpcClient = new Client({
    transport: "ipc",
  }));
  return (rpcClient = await tempClient.login({ clientId }));
};

export const updatePresence = (newData: Partial<Presence>) => {
  if (!rpcClient) return;
  for (const key in newData) {
    data[key] = newData[key] || emptyString;
  }

  if (Date.now() - lastRPCUpdate <= 1000) return;
  lastRPCUpdate = Date.now();
  rpcClient.setActivity(data);
};
