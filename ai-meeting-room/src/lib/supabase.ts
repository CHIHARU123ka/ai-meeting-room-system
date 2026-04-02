import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function saveMeeting(
  requirement: string,
  messages: Array<{ role: string; content: string }>,
  designContext: string
) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("meetings")
    .insert({
      requirement,
      messages: JSON.stringify(messages),
      design_context: designContext,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) {
    console.error("Supabase save error:", error);
    return null;
  }
  return data;
}

export async function getMeetings() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }
  return data || [];
}
