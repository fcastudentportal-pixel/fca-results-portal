/* =========================================================
   FIRST CLASS ACADEMY
   ADMINISTRATOR LOGIN
========================================================= */


/* =========================================================
   OFFICIAL ADMIN EMAIL
========================================================= */

const FCA_ADMIN_EMAIL =
  "fca.admin@gmail.com";


/* =========================================================
   GET HTML ELEMENTS
========================================================= */

const loginForm =
  document.getElementById(
    "adminLoginForm"
  );

const emailInput =
  document.getElementById(
    "adminEmail"
  );

const passwordInput =
  document.getElementById(
    "adminPassword"
  );

const passwordToggle =
  document.getElementById(
    "passwordToggle"
  );

const loginButton =
  document.getElementById(
    "loginButton"
  );

const loginMessage =
  document.getElementById(
    "loginMessage"
  );


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
  message,
  type = "error"
){

  if(!loginMessage){

    return;

  }


  loginMessage.textContent =
    message;


  loginMessage.className =
    "message " + type;

}


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

if(
  passwordToggle &&
  passwordInput
){

  passwordToggle.addEventListener(
    "click",
    function(){

      if(
        passwordInput.type ===
        "password"
      ){

        passwordInput.type =
          "text";


        passwordToggle.textContent =
          "👁";


        passwordToggle.setAttribute(
          "aria-label",
          "Hide password"
        );


        passwordToggle.setAttribute(
          "title",
          "Hide password"
        );

      }

      else{

        passwordInput.type =
          "password";


        passwordToggle.textContent =
          "👁";


        passwordToggle.setAttribute(
          "aria-label",
          "Show password"
        );


        passwordToggle.setAttribute(
          "title",
          "Show password"
        );

      }

    }
  );

}


/* =========================================================
   CHECK SUPABASE CLIENT
========================================================= */

if(
  !window.fcaSupabase
){

  console.error(
    "FCA Supabase client was not created."
  );

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

if(loginForm){

  loginForm.addEventListener(
    "submit",
    async function(event){

      event.preventDefault();


      /* -------------------------
         READ VALUES
      ------------------------- */

      const email =
        emailInput.value
          .trim()
          .toLowerCase();


      const password =
        passwordInput.value;


      /* -------------------------
         VALIDATION
      ------------------------- */

      if(!email){

        showMessage(
          "Please enter the administrator email."
        );

        return;

      }


      if(!password){

        showMessage(
          "Please enter the administrator password."
        );

        return;

      }


      /* -------------------------
         OFFICIAL EMAIL ONLY
      ------------------------- */

      if(
        email !==
        FCA_ADMIN_EMAIL
      ){

        showMessage(
          "Unauthorized administrator account."
        );

        return;

      }


      /* -------------------------
         SUPABASE CHECK
      ------------------------- */

      if(
        !window.fcaSupabase
      ){

        showMessage(
          "Supabase is not configured correctly."
        );

        return;

      }


      /* -------------------------
         LOADING
      ------------------------- */

      loginButton.disabled =
        true;


      loginButton.textContent =
        "Signing in...";


      showMessage("");


      try{


        /* =================================================
           SUPABASE EMAIL/PASSWORD LOGIN
        ================================================= */

        const {
          data,
          error
        } =
          await window.fcaSupabase
            .auth
            .signInWithPassword({

              email:
                email,

              password:
                password

            });


        /* -------------------------
           SUPABASE ERROR
        ------------------------- */

        if(error){

          console.error(
            "FCA Supabase login error:",
            error
          );


          showMessage(
            error.message ||
            "Invalid administrator email or password."
          );


          loginButton.disabled =
            false;


          loginButton.textContent =
            "Login";


          return;

        }


        /* -------------------------
           USER CHECK
        ------------------------- */

        if(
          !data ||
          !data.user
        ){

          showMessage(
            "Authentication failed."
          );


          loginButton.disabled =
            false;


          loginButton.textContent =
            "Login";


          return;

        }


        /* -------------------------
           FINAL EMAIL CHECK
        ------------------------- */

        const authenticatedEmail =
          data.user.email
            ?.trim()
            .toLowerCase();


        if(
          authenticatedEmail !==
          FCA_ADMIN_EMAIL
        ){

          await window.fcaSupabase
            .auth
            .signOut();


          showMessage(
            "This account is not authorized for the FCA Admin Dashboard."
          );


          loginButton.disabled =
            false;


          loginButton.textContent =
            "Login";


          return;

        }


        /* -------------------------
           SUCCESS
        ------------------------- */

        showMessage(
          "Login successful.",
          "success"
        );


        /* -------------------------
           OPEN ADMIN DASHBOARD
        ------------------------- */

        setTimeout(
          function(){

            window.location.replace(
              "admin.html"
            );

          },
          300
        );


      }


      catch(error){

        console.error(
          "FCA authentication error:",
          error
        );


        showMessage(
          "Authentication error: " +
          (
            error.message ||
            "Unknown error"
          )
        );


        loginButton.disabled =
          false;


        loginButton.textContent =
          "Login";

      }

    }
  );

}