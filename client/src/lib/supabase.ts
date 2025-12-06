import { createClient, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

// Client-side Supabase client with anon key (limited access)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL format
function isValidUrl(urlString: string | undefined): boolean {
  if (!urlString) return false;
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

// Check if credentials are valid
const hasValidCredentials = isValidUrl(supabaseUrl) && !!supabaseAnonKey;

// Log warnings in development if credentials are missing
if (!hasValidCredentials) {
  console.warn(
    "[Supabase] Missing or invalid configuration. Real-time features will be disabled.",
    "\n  VITE_SUPABASE_URL:", supabaseUrl ? (isValidUrl(supabaseUrl) ? "✓ Valid" : "✗ Invalid URL format") : "✗ Missing",
    "\n  VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Present" : "✗ Missing"
  );
}

// Only create client if credentials are valid
export const supabase: SupabaseClient | null = hasValidCredentials
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  const available = supabase !== null;
  if (!available) {
    console.warn("[Supabase] Client not available. URL:", supabaseUrl ? "present" : "missing", "Key:", supabaseAnonKey ? "present" : "missing");
  }
  return available;
};

// Real-time subscription types
export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

// Subscribe to real-time changes on a table
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void,
  event: RealtimeEvent = "*"
): RealtimeChannel | null {
  if (!supabase) return null;
  
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      "postgres_changes" as any,
      {
        event,
        schema: "public",
        table,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return channel;
}

// Subscribe to storage changes (file uploads/deletes)
export function subscribeToStorage(
  bucket: string,
  callback: (payload: any) => void
): RealtimeChannel | null {
  if (!supabase) return null;
  
  const channel = supabase
    .channel(`storage-${bucket}`)
    .on("broadcast", { event: "file-change" }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return channel;
}

// Broadcast a storage change event
export async function broadcastStorageChange(
  bucket: string,
  action: "upload" | "delete",
  filePath: string,
  metadata?: any
) {
  if (!supabase) return;
  
  const channel = supabase.channel(`storage-${bucket}`);
  
  await channel.send({
    type: "broadcast",
    event: "file-change",
    payload: {
      action,
      bucket,
      filePath,
      metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

// Unsubscribe from a channel
export function unsubscribe(channel: RealtimeChannel | null) {
  if (!supabase || !channel) return;
  supabase.removeChannel(channel);
}

// Subscribe to job updates for real-time CRM
export function subscribeToJobUpdates(
  jobId: number,
  callback: (payload: any) => void
): RealtimeChannel | null {
  if (!supabase) return null;
  
  const channel = supabase
    .channel(`job-${jobId}`)
    .on("broadcast", { event: "job-update" }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return channel;
}

// Broadcast a job update
export async function broadcastJobUpdate(
  jobId: number,
  updateType: "status" | "note" | "document" | "photo" | "assignment",
  data: any
) {
  if (!supabase) return;
  
  const channel = supabase.channel(`job-${jobId}`);
  
  await channel.send({
    type: "broadcast",
    event: "job-update",
    payload: {
      jobId,
      updateType,
      data,
      timestamp: new Date().toISOString(),
    },
  });
}
