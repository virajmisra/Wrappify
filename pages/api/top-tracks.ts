import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !(session as any).accessToken) {
    return res.status(401).json({ error: "No token provided" });
  }

  const accessToken = (session as any).accessToken;
  try {
    const response = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Spotify top tracks fetch failed:", await response.text());
      return res.status(response.status).json({ error: "Failed to fetch top tracks from Spotify" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Unexpected error in top-tracks API:", error);
    return res.status(500).json({ error: "Spotify fetch failed" });
  }
}