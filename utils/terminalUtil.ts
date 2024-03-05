export function setTerminalTitle(title: string) {
  if (process.platform === "win32") process.title = title;
  else {
    process.stdout.write(
      String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7),
    );
  }
}
