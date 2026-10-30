const { createClient } = require('@supabase/supabase-js');
const required=['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY'];
const missing=required.filter((key)=>!process.env[key]);
if(missing.length) console.warn(`Supabase is not configured. Missing: ${missing.join(', ')}`);
const supabase=process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}}):null;
const authClient=process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}}):null;
module.exports={supabase,authClient};
