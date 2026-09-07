const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// We rely on the global supabase object from the CDN script in index.html
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

export default supabase;
