import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdlkjdnxgansppoklehv.supabase.co';
const supabaseAnonKey = 'sb_publishable_uOuh2g8wKROkfafYLjiYiA_69c0FLOv';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log("Testing Supabase connection...");
  const testEmail = `test.gemini+${Date.now()}@gmail.com`;
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123',
    options: {
      data: {
        name: 'Test User',
        role: 'owner'
      }
    }
  });

  if (error) {
    console.error("Auth Test Failed:", error.message);
  } else {
    console.log("Auth Test Passed!");
    console.log("User created:", data.user?.email);
    console.log("Session exists:", !!data.session);
  }
}

testAuth();
