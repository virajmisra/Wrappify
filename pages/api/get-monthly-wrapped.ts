import type { NextApiRequest, NextApiResponse } from "next";
import supabaseAdmin from "../../lib/supabaseAdmin";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });
  if (!token || !token.sub) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { month } = req.query;
  if (!month || typeof month !== "string") {
    return res.status(400).json({ error: "Month parameter is required" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("wrapped_snapshots")
      .select("top_tracks, top_artists")
      .eq("user_id", token.sub)
      .eq("month", month)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 means no rows found
      throw error;
    }

    if (!data) {
      return res.status(200).json({ savedWrap: null });
    }

    res.status(200).json({ savedWrap: data });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch saved wrap", details: error.message || error });
  }
}