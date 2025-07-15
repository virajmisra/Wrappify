import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !(session as any).accessToken) {
    return res.status(401).json({ error: "No token provided" });
  }

  const accessToken = (session as any).accessToken;

  const response = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  res.status(200).json(data);
}