const SUPABASE_URL = 'https://nkasnaxxfqimwdrpwfot.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rYXNuYXh4ZnFpbXdkcnB3Zm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDY0NjMsImV4cCI6MjEwNTU4MjQ2M30.eInJ3oBU3yrrlnWwHBx7PkRrMpb6hyzB4pfVCqqEljg';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);