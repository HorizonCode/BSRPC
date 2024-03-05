const client = {
  id: "3f974573800a4ff5b325de9795b8e603",
  secret: "ff188d2860ff44baa57acc79c121a3b9",
};

const authRoute = "https://accounts.spotify.com/api/token";
const trackRoute = "https://api.spotify.com/v1/search?type=track&limit=1&q=";

const auth = Buffer.from(`${client.id}:${client.secret}`).toString("base64");

let authToken = "";

export const getAlbumCoverFromSongName = async (
  songName: string,
  forceReauth?: boolean,
): Promise<string | undefined> => {
  try {
    if (!authToken || forceReauth) {
      const req = await fetch(authRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: `grant_type=client_credentials`,
      });
      const res = await req.json();
      authToken = res.access_token;
    }

    const albumReq = await fetch(trackRoute + songName, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!albumReq.ok) return getAlbumCoverFromSongName(songName, true);
    const albumRes = await albumReq.json();
    const trackItems = albumRes.tracks.items;
    const firstItem = trackItems[0] ?? undefined;
    if (!firstItem) return undefined;
    return firstItem.album.images[0].url;
  } catch {
    return undefined;
  }
};
