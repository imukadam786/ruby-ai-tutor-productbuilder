import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = "https://kmgnizvqkqkiulzgvkcb.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZ25penZxa3FraXVsemd2a2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzEyNzcsImV4cCI6MjA4ODk0NzI3N30.TFuNQgJtbZiAVZp4FPQzjxH6mM5-lgP6PBhoEB9ACnQ";

const key = SERVICE_ROLE_KEY || ANON_KEY;
const supabase = createClient(SUPABASE_URL, key);

const DOWNLOADS = "C:/Users/rrazz/Downloads";
const BUCKET = "study-guides";

const FILES = [
  // Afrikaans HL
  "afr-hl-p1-may-jun-2026-studyguide_compressed.pdf",
  "afri-hl-p2-may-jun-2026-studyguide_compressed.pdf",
  "afr-hl-p3-may-jun-2026-studyguide_compressed.pdf",
  // Business Studies
  "busistd-p1-may-jun-2026-studyguide_compressed.pdf",
  "busistd-p2-may-jun-2026-studyguide_compressed.pdf",
  // Economics
  "eco-p1-may-jun-2026-studyguide_compressed.pdf",
];

console.log(`Using ${SERVICE_ROLE_KEY ? "service role key" : "anon key"}\n`);

for (const filename of FILES) {
  const filePath = resolve(DOWNLOADS, filename);
  let fileData;
  try {
    fileData = readFileSync(filePath);
  } catch {
    console.error(`  ✗ Not found: ${filePath}`);
    continue;
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, fileData, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error(`  ✗ ${filename}: ${error.message}`);
  } else {
    console.log(`  ✓ ${filename}`);
  }
}
