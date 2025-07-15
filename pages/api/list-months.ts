import { NextApiRequest, NextApiResponse } from "next";
import supabaseAdmin from "../../lib/supabaseAdmin";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get logged-in user token
  const token = await getToken({ req });
  if (!token?.sub) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Query saved wrapped months for this user
  const { data, error } = await supabaseAdmin
    .from("wrapped_snapshots")
    .select("month")
    .eq("user_id", token.sub)
    .order("month", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Return months array
  const months = data?.map((row) => row.month) ?? [];
  res.status(200).json({ months });
}