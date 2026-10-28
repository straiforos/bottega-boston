/** JSON value stored in D1 text columns (replaces Supabase Json). */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
