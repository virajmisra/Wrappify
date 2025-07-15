import type { NextApiRequest, NextApiResponse } from "next";
import supabaseAdmin from "../../lib/supabaseAdmin";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });
  if (!token || !token.accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { month, top_tracks, top_artists } = req.body;

    if (!month || !top_tracks || !top_artists) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upsert snapshot for this user and month
    const { data, error } = await supabaseAdmin
      .from("wrapped_snapshots")
      .upsert(
        {
          user_id: token.sub,
          month,
          top_tracks,
          top_artists,
        },
  { onConflict: 'user_id,month' } // <-- change here
)
      .select();

    if (error) throw error;

    res.status(200).json({ message: "Snapshot saved", data });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save snapshot", details: error.message || error });
  }
}