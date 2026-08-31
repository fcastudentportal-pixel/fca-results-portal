/* ============================================================
   FCA SETTINGS MANAGEMENT
   SUPABASE VERSION

   Requires:
   config.js

   config.js must create:

   window.fcaSupabase
============================================================ */


/* ============================================================
   FCA ADMIN
============================================================ */

const FCA_ADMIN_EMAIL =
  "fca.admin@gmail.com";


/* ============================================================
   SUPABASE CLIENT
============================================================ */

function getSupabaseClient(){

  if(!window.fcaSupabase){

    throw new Error(
      "FCA Supabase client is not available."
    );

  }

  return window.fcaSupabase;

}


/* ============================================================
   MESSAGE HELPER
============================================================ */

function showMessage(
  elementId,
  message,
  type
){

  const element =
    document.getElementById(
      elementId
    );


  if(!element){

    return;

  }


  element.textContent =
    message;


  element.className =
    "settings-message " +
    type;

}


/* ============================================================
   CLEAR MESSAGE
============================================================ */

function clearMessage(
  elementId
){

  const element =
    document.getElementById(
      elementId
    );


  if(!element){

    return;

  }


  element.textContent =
    "";

  element.className =
    "settings-message";

}


/* ============================================================
   CHECK ADMIN AUTHORIZATION
============================================================ */

async function checkAdminAuthorization(){

  try{

    const supabase =
      getSupabaseClient();


    /* -----------------------------------------------
       GET CURRENT SESSION
    ------------------------------------------------ */

    const {
      data,
      error
    } =
      await supabase
        .auth
        .getSession();


    if(error){

      console.error(
        "FCA session error:",
        error
      );

      window.location.replace(
        "admin-login.html"
      );

      return false;

    }


    /* -----------------------------------------------
       CHECK SESSION
    ------------------------------------------------ */

    if(
      !data ||
      !data.session ||
      !data.session.user
    ){

      console.warn(
        "No FCA administrator session."
      );

      window.location.replace(
        "admin-login.html"
      );

      return false;

    }


    /* -----------------------------------------------
       GET USER
    ------------------------------------------------ */

    const user =
      data.session.user;


    const email =
      user.email
        ?.trim()
        .toLowerCase();


    console.log(
      "FCA authenticated user:",
      email
    );


    /* -----------------------------------------------
       CHECK ADMIN EMAIL
    ------------------------------------------------ */

    if(
      email !==
      FCA_ADMIN_EMAIL
    ){

      console.warn(
        "Unauthorized FCA account:",
        email
      );


      await supabase
        .auth
        .signOut();


      window.location.replace(
        "admin-login.html"
      );

      return false;

    }


    /* -----------------------------------------------
       DISPLAY ADMIN EMAIL
    ------------------------------------------------ */

    const emailElement =
      document.getElementById(
        "adminEmail"
      );


    if(emailElement){

      emailElement.textContent =
        email;

    }


    console.log(
      "FCA administrator authorized."
    );


    return true;

  }

  catch(error){

    console.error(
      "FCA authorization error:",
      error
    );


    window.location.replace(
      "admin-login.html"
    );


    return false;

  }

}


/* ============================================================
   CHANGE ADMIN PASSWORD
============================================================ */

async function changeAdminPassword(
  event
){

  event.preventDefault();


  clearMessage(
    "passwordMessage"
  );


  const newPassword =
    document.getElementById(
      "newPassword"
    ).value.trim();


  const confirmPassword =
    document.getElementById(
      "confirmPassword"
    ).value.trim();


  /* -----------------------------------------------
     CHECK PASSWORD
  ------------------------------------------------ */

  if(
    !newPassword ||
    !confirmPassword
  ){

    showMessage(
      "passwordMessage",
      "Please enter and confirm your new password.",
      "error"
    );

    return;

  }


  /* -----------------------------------------------
     PASSWORD LENGTH
  ------------------------------------------------ */

  if(
    newPassword.length < 8
  ){

    showMessage(
      "passwordMessage",
      "Password must contain at least 8 characters.",
      "error"
    );

    return;

  }


  /* -----------------------------------------------
     PASSWORD MATCH
  ------------------------------------------------ */

  if(
    newPassword !==
    confirmPassword
  ){

    showMessage(
      "passwordMessage",
      "Passwords do not match.",
      "error"
    );

    return;

  }


  try{

    const supabase =
      getSupabaseClient();


    /* -----------------------------------------------
       UPDATE PASSWORD
    ------------------------------------------------ */

    const {
      error
    } =
      await supabase
        .auth
        .updateUser({

          password:
            newPassword

        });


    if(error){

      throw error;

    }


    /* -----------------------------------------------
       SUCCESS
    ------------------------------------------------ */

    showMessage(
      "passwordMessage",
      "Administrator password changed successfully.",
      "success"
    );


    document
      .getElementById(
        "passwordForm"
      )
      .reset();


    console.log(
      "FCA administrator password updated."
    );

  }

  catch(error){

    console.error(
      "FCA password update error:",
      error
    );


    showMessage(
      "passwordMessage",
      error.message ||
      "Unable to change administrator password.",
      "error"
    );

  }

}


/* ============================================================
   LOAD PORTAL SETTINGS
============================================================ */

function loadPortalSettings(){

  const savedAcademicYear =
    localStorage.getItem(
      "fcaAcademicYear"
    );


  const savedDefaultTerm =
    localStorage.getItem(
      "fcaDefaultTerm"
    );


  const academicYear =
    document.getElementById(
      "academicYear"
    );


  const defaultTerm =
    document.getElementById(
      "defaultTerm"
    );


  if(
    savedAcademicYear &&
    academicYear
  ){

    academicYear.value =
      savedAcademicYear;

  }


  if(
    savedDefaultTerm &&
    defaultTerm
  ){

    defaultTerm.value =
      savedDefaultTerm;

  }


  console.log(
    "FCA portal settings loaded."
  );

}


/* ============================================================
   SAVE PORTAL SETTINGS
============================================================ */

function savePortalSettings(
  event
){

  event.preventDefault();


  clearMessage(
    "portalMessage"
  );


  const academicYear =
    document.getElementById(
      "academicYear"
    ).value;


  const defaultTerm =
    document.getElementById(
      "defaultTerm"
    ).value;


  /* -----------------------------------------------
     SAVE SETTINGS
  ------------------------------------------------ */

  localStorage.setItem(
    "fcaAcademicYear",
    academicYear
  );


  localStorage.setItem(
    "fcaDefaultTerm",
    defaultTerm
  );


  /* -----------------------------------------------
     SHOW SUCCESS
  ------------------------------------------------ */

  showMessage(
    "portalMessage",
    "Portal settings saved successfully.",
    "success"
  );


  console.log(
    "FCA portal settings saved:",
    {
      academicYear,
      defaultTerm
    }
  );

}


/* ============================================================
   LOGOUT
============================================================ */

async function logoutAdmin(){

  try{

    const supabase =
      getSupabaseClient();


    await supabase
      .auth
      .signOut();

  }

  catch(error){

    console.error(
      "FCA logout error:",
      error
    );

  }


  window.location.replace(
    "admin-login.html"
  );

}


/* ============================================================
   SESSION MONITOR
============================================================ */

function startSessionMonitor(){

  try{

    const supabase =
      getSupabaseClient();


    supabase
      .auth
      .onAuthStateChange(
        function(
          event,
          session
        ){

          console.log(
            "FCA Auth Event:",
            event
          );


          /* -------------------------------------------
             SIGNED OUT
          ------------------------------------------- */

          if(
            event ===
            "SIGNED_OUT"
          ){

            window.location.replace(
              "admin-login.html"
            );

            return;

          }


          /* -------------------------------------------
             NO SESSION
          ------------------------------------------- */

          if(
            !session
          ){

            window.location.replace(
              "admin-login.html"
            );

          }

        }
      );

  }

  catch(error){

    console.error(
      "FCA session monitor error:",
      error
    );

  }

}


/* ============================================================
   ATTACH EVENTS
============================================================ */

function attachSettingsEvents(){

  /* -----------------------------------------------
     PASSWORD FORM
  ------------------------------------------------ */

  const passwordForm =
    document.getElementById(
      "passwordForm"
    );


  if(passwordForm){

    passwordForm.addEventListener(
      "submit",
      changeAdminPassword
    );

  }


  /* -----------------------------------------------
     PORTAL SETTINGS FORM
  ------------------------------------------------ */

  const portalSettingsForm =
    document.getElementById(
      "portalSettingsForm"
    );


  if(portalSettingsForm){

    portalSettingsForm.addEventListener(
      "submit",
      savePortalSettings
    );

  }


  /* -----------------------------------------------
     LOGOUT BUTTON
  ------------------------------------------------ */

  const logoutButton =
    document.getElementById(
      "logoutButton"
    );


  if(logoutButton){

    logoutButton.addEventListener(
      "click",
      logoutAdmin
    );

  }

}


/* ============================================================
   INITIALIZE SETTINGS
============================================================ */

async function initializeSettings(){

  console.log(
    "FCA Settings initializing..."
  );


  try{

    /* -----------------------------------------------
       CHECK ADMIN
    ------------------------------------------------ */

    const authorized =
      await checkAdminAuthorization();


    if(!authorized){

      return;

    }


    /* -----------------------------------------------
       LOAD SETTINGS
    ------------------------------------------------ */

    loadPortalSettings();


    /* -----------------------------------------------
       ATTACH EVENTS
    ------------------------------------------------ */

    attachSettingsEvents();


    /* -----------------------------------------------
       SESSION MONITOR
    ------------------------------------------------ */

    startSessionMonitor();


    console.log(
      "FCA Settings initialized successfully."
    );

  }

  catch(error){

    console.error(
      "FCA Settings initialization error:",
      error
    );

  }

}


/* ============================================================
   START FCA SETTINGS
============================================================ */

initializeSettings();