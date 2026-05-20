import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzpryrssvdphekjykfqu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cHJ5cnNzdmRwaGVranlrZnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMyODIsImV4cCI6MjA5NDA1OTI4Mn0.l6R93pBz5bwxMuTkV8DSP5BI-6Dv1V-Q3FH1jVaXzzM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
