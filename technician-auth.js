
"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   SHARED IT TECHNICIAN AUTHORIZATION
========================================================= */

(function () {

    const TECHNICIAN_EMAIL = "mejaalex33@gmail.com";

    let technicianAuthClient = null;

    function getTechnicianAuthClient() {

        if (technicianAuthClient) {
            return technicianAuthClient;
        }

        if (
            !window.supabase ||
            typeof window.supabase.createClient !== "function" ||
            !window.fcaSupabase
        ) {
            throw new Error(
                "FCA Supabase configuration is not ready."
            );
        }

        // Separate client: do not replace the administrator session.
        technicianAuthClient = window.supabase.createClient(
            window.fcaSupabase.supabaseUrl,
            window.fcaSupabase.supabaseKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }
        );

        return technicianAuthClient;
    }

    async function verifyPassword(password) {

        if (
            typeof password !== "string" ||
            !password.trim()
        ) {
            return false;
        }

        const client = getTechnicianAuthClient();

        try {

            const { data, error } =
                await client.auth.signInWithPassword({
                    email: TECHNICIAN_EMAIL,
                    password: password
                });

            if (error || !data?.user) {
                return false;
            }

            const verifiedEmail = String(
                data.user.email || ""
            ).trim().toLowerCase();

            return verifiedEmail === TECHNICIAN_EMAIL;

        } catch (error) {

            console.error(
                "FCA technician verification failed:",
                error
            );

            return false;

        } finally {

            // Do not retain the technician session.
            try {
                await client.auth.signOut({ scope: "local" });
            } catch (signOutError) {
                console.error(
                    "FCA temporary technician sign-out failed:",
                    signOutError
                );
            }
        }
    }

    window.FCA_TechnicianAuth = {
        verifyPassword
    };

})();
