const client = {
  id: "3f974573800a4ff5b325de9795b8e603",
  secret: "ff188d2860ff44baa57acc79c121a3b9",
  authToken: "",
};

const authRoute = "https://accounts.spotify.com/api/token";
const trackRoute = "https://api.spotify.com/v1/search?type=track&limit=1&q=";

const authorize = async () => {
  const req = await fetch(authRoute, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${
        Buffer.from(`${client.id}:${client.secret}`).toString("base64")
      }`,
    },
    body: `grant_type=client_credentials`,
  });
  const res = await req.json();
  client.authToken = res.access_token;
};

export const request = async (reqUrl: string) => {
  if (!client.authToken) await authorize();

  const req = await fetch(reqUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${client.authToken}`,
    },
  });
  if (!req.ok) return request(reqUrl);
  return req.json();
};

export const getAlbumCoverFromSongName = async (
  songName: string,
): Promise<string | undefined> => {
  try {
    const albumJson = await request(trackRoute + songName);
    const trackItems = albumJson.tracks.items;
    const firstItem = trackItems[0] ?? undefined;
    if (!firstItem) return undefined;
    return firstItem.album.images[0].url;
  } catch {
    return undefined;
  }
};
