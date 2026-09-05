const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mdlkjdnxgansppoklehv.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_uOuh2g8wKROkfafYLjiYiA_69c0FLOv';

// We rely on the global supabase object from the CDN script in index.html
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

export default supabase;
