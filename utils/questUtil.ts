import { Location } from "../enums/location.js";
import {
  StreamerToolsDataResponse,
  StreamerToolsInfoResponse,
} from "../types/responses.js";

export const getStreamerToolData = async (opts: {
  host: string;
  port: string;
}): Promise<StreamerToolsDataResponse> => {
  const fetchReq = await fetch(`http://${opts.host}:${opts.port}/data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return await fetchReq.json();
};

export const getStreamerToolInfo = async (opts: {
  host: string;
  port: string;
}): Promise<StreamerToolsInfoResponse> => {
  const fetchReq = await fetch(`http://${opts.host}:${opts.port}/data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  return await fetchReq.json();
};

export const intToDiff = (diff: number): string => {
  switch (diff) {
    case 0:
      return "Easy";
    case 1:
      return "Normal";
    case 2:
      return "Hard";
    case 3:
      return "Expert";
    case 4:
      return "Expert +";
  }
  return "Unknown";
};

export const locationToString = (loc: number): string => {
  switch (loc) {
    case Location.MENU:
      return "Song Select";
    case Location.OPTIONS:
      return "Settings";
  }
};
