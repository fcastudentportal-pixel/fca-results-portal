/* =========================================================
   FIRST CLASS ACADEMY
   FCA SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
  "https://lapuqrvfyjxgkynikxqa.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_aSAHDuZrc388YBkhtQbw5A_wX2Q01QK";


/* =========================================================
   CREATE ONE SHARED SUPABASE CLIENT
========================================================= */

if (!window.supabase) {

  console.error(
    "FCA Supabase library was not loaded."
  );

} else {

  window.fcaSupabase =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

}


/* =========================================================
   FCA ADMINISTRATOR
========================================================= */

window.FCA_ADMIN_EMAIL =
  "fca.admin@gmail.com";


/* =========================================================
   SUPABASE TABLE HELPERS
========================================================= */

window.FCA_TABLES = {

  teachers: "teachers",

  classes: "classes",

  students: "students",

  subjects: "subjects",

  results: "results",

  announcements: "announcements",

  calendar: "calendar"

};


/* =========================================================
   CHECK SUPABASE CLIENT
========================================================= */

window.fcaCheckSupabase =
  function () {

    if (!window.fcaSupabase) {

      console.error(
        "FCA Supabase client is unavailable."
      );

      return false;

    }

    return true;

  };


/* =========================================================
   CHECK ADMIN SESSION
========================================================= */

window.fcaCheckAdmin =
  async function () {

    if (!window.fcaSupabase) {

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


      if (
        error ||
        !data ||
        !data.session ||
        !data.session.user
      ) {

        return false;

      }


      const email =
        data.session.user.email
          ?.trim()
          .toLowerCase();


      return (
        email ===
        window.FCA_ADMIN_EMAIL
      );

    }

    catch (error) {

      console.error(
        "FCA admin session error:",
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

      if (window.fcaSupabase) {

        await window.fcaSupabase
          .auth
          .signOut();

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