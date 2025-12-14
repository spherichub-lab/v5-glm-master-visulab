
// Frontend only mode - Supabase client neutralized.
// No actual connection to backend.
export const supabase = {
    // Dummy implementation to prevent import errors if missed
    from: () => ({ select: () => ({ data: [], error: null }) }),
    auth: {
        signInWithPassword: async () => ({ data: { session: true }, error: null }),
        getUser: async () => ({ data: { user: { id: 'mock-user' } } })
    }
} as any;
