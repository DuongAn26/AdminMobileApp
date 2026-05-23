import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjoeynekvqkzaiijmwmx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqb2V5bmVrdnFremFpaWptd214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODY0MjYsImV4cCI6MjA5MTk2MjQyNn0.3uLoSe8t66ywOlP6Gakt1IJXfZK9IqUeDmd1Tymcfws';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);