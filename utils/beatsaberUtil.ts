import { Location } from "../enums/location";

export const diffToString = (diff: number): string => {
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
    default:
      return "Unknown";
  }
};
