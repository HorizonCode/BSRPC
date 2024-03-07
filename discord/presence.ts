import { Client, Presence } from "discord-rpc";

let rpcClient: Client | undefined;
let rpcConnected = false;
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
  return new Promise(async (res, rej) => {
    try {
      const tempClient = (rpcClient = new Client({
        transport: "ipc",
      }));
      tempClient.on("ready", () => {
        rpcConnected = true;
        console.log(
          "Discord RPC connected with user " + tempClient.user.username,
        );
        res(tempClient);
      });
      return (rpcClient = await tempClient.login({ clientId }));
    } catch {
      rej();
    }
  });
};

export const updatePresence = (newData: Partial<Presence>) => {
  if (!rpcClient || !rpcConnected) return;
  for (const key in newData) {
    data[key] = newData[key] || emptyString;
  }

  if (Date.now() - lastRPCUpdate <= 3000) return; // only update each 3 seconds
  lastRPCUpdate = Date.now();
  rpcClient.setActivity(data);
};
