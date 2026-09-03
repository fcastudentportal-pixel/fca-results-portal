/* =========================================================
   FIRST CLASS ACADEMY
   FCA SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://lapuqrvfyjxgkynikxqa.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_aSAHDuZrc388YBkhtQbw5A_wX2Q01QK";


/* =========================================================
   FCA ADMINISTRATOR
========================================================= */

window.FCA_ADMIN_EMAIL =
    "fca.admin@gmail.com";


/* =========================================================
   FCA TABLES
========================================================= */

window.FCA_TABLES = {

    teachers: "teachers",
    classes: "classes",
    students: "students",
    subjects: "subjects",
    results: "results"

};


/* =========================================================
   CREATE SUPABASE CLIENT
========================================================= */

function createFCAClient() {

    console.log("FCA: Checking Supabase library...");

    if (
        typeof window.supabase === "undefined" ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "FCA ERROR: Supabase library is NOT loaded."
        );

        window.fcaSupabase = null;

        return false;
    }


    try {

        window.fcaSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        console.log(
            "FCA: Supabase client created successfully."
        );

        console.log(
            "FCA Supabase URL:",
            SUPABASE_URL
        );


        return true;

    }

    catch (error) {

        console.error(
            "FCA ERROR: Supabase client creation failed:",
            error
        );

        window.fcaSupabase = null;

        return false;
    }
}


/* =========================================================
   CREATE CLIENT
========================================================= */

createFCAClient();


/* =========================================================
   CHECK SUPABASE
========================================================= */

window.fcaCheckSupabase = function () {

    return !!(
        window.fcaSupabase &&
        typeof window.fcaSupabase.from === "function" &&
        typeof window.fcaSupabase.auth === "object"
    );

};


/* =========================================================
   GET SESSION
========================================================= */

window.fcaGetSession = async function () {

    if (!window.fcaCheckSupabase()) {

        return {
            session: null,
            error: new Error(
                "Supabase client is not available."
            )
        };
    }


    try {

        const {
            data,
            error
        } =
            await window.fcaSupabase.auth.getSession();


        return {
            session: data?.session || null,
            error: error || null
        };

    }

    catch (error) {

        console.error(
            "FCA session error:",
            error
        );

        return {
            session: null,
            error
        };
    }

};


/* =========================================================
   CHECK ADMIN
========================================================= */

window.fcaCheckAdmin = async function () {

    if (!window.fcaCheckSupabase()) {
        return false;
    }


    try {

        const {
            data,
            error
        } =
            await window.fcaSupabase.auth.getSession();


        if (error) {

            console.error(
                "FCA authentication error:",
                error
            );

            return false;
        }


        const session =
            data?.session;


        if (!session?.user) {
            return false;
        }


        const email =
            String(
                session.user.email || ""
            )
            .trim()
            .toLowerCase();


        const adminEmail =
            String(
                window.FCA_ADMIN_EMAIL || ""
            )
            .trim()
            .toLowerCase();


        return email === adminEmail;

    }

    catch (error) {

        console.error(
            "FCA admin check error:",
            error
        );

        return false;
    }

};


/* =========================================================
   REQUIRE ADMIN
========================================================= */

window.fcaRequireAdmin = async function () {

    const authorized =
        await window.fcaCheckAdmin();


    if (!authorized) {

        console.warn(
            "FCA: Admin authorization failed."
        );


        if (window.fcaSupabase) {

            try {

                await window.fcaSupabase.auth.signOut();

            }

            catch (error) {

                console.error(
                    "FCA sign-out error:",
                    error
                );
            }
        }


        window.location.replace(
            "admin-login.html"
        );


        return false;
    }


    return true;

};


/* =========================================================
   LOGOUT
========================================================= */

window.fcaLogout = async function () {

    try {

        if (window.fcaSupabase) {

            await window.fcaSupabase.auth.signOut();

        }

    }

    catch (error) {

        console.error(
            "FCA logout error:",
            error
        );
    }


    window.location.replace(
        "admin-login.html"
    );

};


/* =========================================================
   TEST DATABASE CONNECTION
========================================================= */

window.fcaTestConnection = async function () {

    if (!window.fcaCheckSupabase()) {

        return {
            connected: false,
            error: "Supabase client is not available."
        };
    }


    try {

        const {
            data,
            error
        } =
            await window.fcaSupabase
                .from("students")
                .select("id")
                .limit(1);


        if (error) {

            console.error(
                "FCA database test failed:",
                error
            );


            return {
                connected: false,
                error: error.message
            };
        }


        return {
            connected: true,
            error: null,
            data
        };

    }

    catch (error) {

        console.error(
            "FCA database connection error:",
            error
        );


        return {
            connected: false,
            error: error.message
        };
    }

};


/* =========================================================
   CONFIG READY
========================================================= */

console.log(
    "======================================"
);

console.log(
    "FCA config.js loaded"
);

console.log(
    "FCA Supabase:",
    window.fcaCheckSupabase()
        ? "READY"
        : "NOT AVAILABLE"
);

console.log(
    "======================================"
);