import ora from "ora";
import localIpUrl from "local-ip-url";
import {
  StreamerToolsDataResponse,
  StreamerToolsInfoResponse,
} from "../types/responses.js";

export const resolveQuestFromLocalNetwork = async () => {
  const spinner = ora("Attempting to resolve Quest from local network...")
    .start();

  const localIp = localIpUrl("public", "ipv4");
  for (let i = 0; i < 255; i++) {
    const nextIP = localIp.split(".").slice(0, 3).join(".") + "." + (i + 1);
    spinner.text = `Attempting to resolve Quest from ${nextIP}...`;
    try {
      const data = await getStreamerToolInfo({
        host: nextIP,
        port: "53502",
        timeout: 500,
      });
      if (data) {
        spinner.succeed(`Resolved Quest from ${nextIP}!`);
        return {
          host: nextIP,
          port: "53502",
        };
      }
    } catch {
    }
  }
  spinner.fail(`Failed to resolve Quest automatically!`);
  return undefined;
};

export const getStreamerToolData = async (opts: {
  host: string;
  port: string;
  timeout?: number;
}): Promise<StreamerToolsDataResponse> => {
  const timeout = opts.timeout ?? 8000;
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
  const fetchReq = await fetch(`http://${opts.host}:${opts.port}/data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    signal: timeoutController.signal,
  });
  clearTimeout(timeoutId);
  return await fetchReq.json();
};

export const getStreamerToolInfo = async (opts: {
  host: string;
  port: string;
  timeout?: number;
}): Promise<StreamerToolsInfoResponse> => {
  const timeout = opts.timeout ?? 8000;
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);
  const fetchReq = await fetch(`http://${opts.host}:${opts.port}/data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    signal: timeoutController.signal,
  });
  clearTimeout(timeoutId);
  return await fetchReq.json();
};
