import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://afygczsryhicyzthwczy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeWdjenNyeWhpY3l6dGh3Y3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDgxNTYsImV4cCI6MjA5NzcyNDE1Nn0.GJ6v6oiwaYTNJe8I7xihEX4oea1aV4jWLgdiyegNfxc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
