/* =========================================================
   FCA ADMIN LOGIN
========================================================= */


/* =========================================================
   OFFICIAL FCA ADMIN
========================================================= */

const FCA_ADMIN_EMAIL =
  "fca.admin@gmail.com";



/* =========================================================
   ELEMENTS
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


const loginButton =
  document.getElementById(
    "loginButton"
  );


const loginMessage =
  document.getElementById(
    "loginMessage"
  );


const passwordToggle =
  document.getElementById(
    "passwordToggle"
  );



/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

if(
  passwordInput &&
  passwordToggle
){

  passwordToggle.addEventListener(
    "click",
    function(){

      const hidden =
        passwordInput.type ===
        "password";


      if(hidden){

        passwordInput.type =
          "text";


        passwordToggle.textContent =
          "🙈";


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
          "👁️";


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
   MESSAGE
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
   CHECK EXISTING SESSION
========================================================= */

async function checkExistingSession(){

  try{

    const {
      data,
      error
    } =
      await supabase.auth.getSession();


    if(error){

      console.error(
        "Session error:",
        error
      );

      return;

    }


    if(
      data &&
      data.session &&
      data.session.user
    ){

      const email =
        data.session.user.email
          ?.toLowerCase();


      if(
        email ===
        FCA_ADMIN_EMAIL.toLowerCase()
      ){

        window.location.replace(
          "admin.html"
        );

      }

      else{

        await supabase.auth.signOut();

      }

    }

  }

  catch(error){

    console.error(
      "Authentication error:",
      error
    );

  }

}



/* =========================================================
   ADMIN LOGIN
========================================================= */

if(loginForm){

  loginForm.addEventListener(
    "submit",
    async function(event){

      event.preventDefault();


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
          "Enter the administrator email."
        );

        return;

      }


      if(!password){

        showMessage(
          "Enter the administrator password."
        );

        return;

      }



      /* -------------------------
         EMAIL AUTHORIZATION
      ------------------------- */

      if(
        email !==
        FCA_ADMIN_EMAIL.toLowerCase()
      ){

        showMessage(
          "Unauthorized administrator account."
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


      showMessage(
        ""
      );



      try{


        /* -------------------------
           SUPABASE LOGIN
        ------------------------- */

        const {
          data,
          error
        } =
          await supabase.auth.signInWithPassword({

            email:
              email,

            password:
              password

          });



        /* -------------------------
           LOGIN FAILED
        ------------------------- */

        if(error){

          console.error(
            "Login error:",
            error
          );


          showMessage(
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
            "Administrator authentication failed."
          );


          loginButton.disabled =
            false;


          loginButton.textContent =
            "Login";


          return;

        }



        /* -------------------------
           FINAL AUTHORIZATION
        ------------------------- */

        if(
          data.user.email
            ?.toLowerCase() !==
          FCA_ADMIN_EMAIL.toLowerCase()
        ){

          await supabase.auth.signOut();


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


        window.location.replace(
          "admin.html"
        );


      }

      catch(error){

        console.error(
          "Login error:",
          error
        );


        showMessage(
          "Unable to connect to the authentication service."
        );


        loginButton.disabled =
          false;


        loginButton.textContent =
          "Login";

      }

    }
  );

}



/* =========================================================
   START
========================================================= */

checkExistingSession();