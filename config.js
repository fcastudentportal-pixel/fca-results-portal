/* =========================================================
   FIRST CLASS ACADEMY
   SUPABASE CONFIGURATION
========================================================= */


/* SUPABASE PROJECT URL */

const SUPABASE_URL =
  "https://lapuqrvfyjxgkynikxqa.supabase.co";


/* SUPABASE PUBLISHABLE KEY */

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_aSAHDuZrc388YBkhtQbw5A_wX2Q01QK";


/* CREATE FCA SUPABASE CLIENT */

window.fcaSupabase =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );