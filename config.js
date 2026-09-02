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
   CREATE SHARED SUPABASE CLIENT
========================================================= */

(function () {

  if (!window.supabase) {

    console.error(
      "FCA ERROR: Supabase JavaScript library was not loaded."
    );

    window.fcaSupabase = null;

    return;

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

  }

  catch (error) {

    console.error(
      "FCA ERROR: Could not create Supabase client:",
      error
    );

    window.fcaSupabase = null;

  }

})();


/* =========================================================
   CHECK SUPABASE CLIENT
========================================================= */

window.fcaCheckSupabase =
  function () {

    return (
      window.fcaSupabase !== null &&
      typeof window.fcaSupabase !== "undefined"
    );

  };


/* =========================================================
   GET CURRENT SESSION
========================================================= */

window.fcaGetSession =
  async function () {

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
        await window.fcaSupabase
          .auth
          .getSession();


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

window.fcaCheckAdmin =
  async function () {

    if (!window.fcaCheckSupabase()) {

      return false;

    }


    try {

      const {
        data,
        error
      } =
        await window.fcaSupabase
          .auth
          .getSession();


      if (error) {

        console.error(
          "FCA authentication error:",
          error
        );

        return false;

      }


      const session =
        data?.session;


      if (!session || !session.user) {

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

window.fcaRequireAdmin =
  async function () {

    const authorized =
      await window.fcaCheckAdmin();


    if (!authorized) {

      console.warn(
        "FCA: Admin authorization failed."
      );


      if (window.fcaSupabase) {

        try {

          await window.fcaSupabase
            .auth
            .signOut();

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

window.fcaLogout =
  async function () {

    try {

      if (window.fcaSupabase) {

        await window.fcaSupabase
          .auth
          .signOut();

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
   SUPABASE CONNECTION TEST
========================================================= */

window.fcaTestConnection =
  async function () {

    if (!window.fcaCheckSupabase()) {

      return {
        connected: false,
        error: "Supabase client is not available."
      };

    }


    try {

      /*
       * Auth request tests that the Supabase client
       * can communicate with the project.
       */

      const {
        error
      } =
        await window.fcaSupabase
          .auth
          .getSession();


      if (error) {

        return {
          connected: false,
          error: error.message
        };

      }


      return {
        connected: true,
        error: null
      };

    }

    catch (error) {

      return {
        connected: false,
        error: error.message
      };

    }

  };


/* =========================================================
   FCA CONFIGURATION READY
========================================================= */

console.log(
  "FCA config.js loaded."
);

console.log(
  "FCA Supabase:",
  window.fcaSupabase
    ? "READY"
    : "NOT AVAILABLE"
);