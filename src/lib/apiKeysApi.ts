import { supabase } from "@/integrations/supabase/client";

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keySuffix: string;
  status: "active" | "revoked";
  lastUsedAt: string | null;
  createdAt: string;
}

interface KeyRow {
  id: string;
  name: string;
  key_prefix: string;
  key_suffix: string;
  status: string;
  last_used_at: string | null;
  created_at: string;
}

function toKey(r: KeyRow): ApiKey {
  return {
    id: r.id,
    name: r.name,
    keyPrefix: r.key_prefix,
    keySuffix: r.key_suffix,
    status: r.status as ApiKey["status"],
    lastUsedAt: r.last_used_at,
    createdAt: r.created_at,
  };
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as KeyRow[]).map(toKey);
}

// Generate a cryptographically strong random token using the Web Crypto API.
// 32 bytes => 256 bits of entropy, encoded as URL-safe base64.
function generateSecureToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function createApiKey(name: string): Promise<ApiKey> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const prefix = `sk-slm-${name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4) || "key"}`;
  // Strong 256-bit random suffix (display the last 8 chars as a fingerprint).
  const token = generateSecureToken(32);
  const suffix = token.slice(-8);
  const { data, error } = await supabase.from("api_keys")
    .insert({ user_id: user.id, name, key_prefix: prefix, key_suffix: suffix, status: "active" })
    .select("*").single();
  if (error) throw error;
  return toKey(data as KeyRow);
}

export async function revokeApiKey(id: string): Promise<void> {
  const { error } = await supabase.from("api_keys").update({ status: "revoked" }).eq("id", id);
  if (error) throw error;
}
