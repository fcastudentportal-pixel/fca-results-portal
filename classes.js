/* =========================================================
   FIRST CLASS ACADEMY
   CLASSES MANAGEMENT
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const MAX_CLASSES = 4;

const ADMIN_EMAIL = "fca.admin@gmail.com";

let db = null;

let teachers = [];
let classes = [];


/* =========================================================
   DOM
========================================================= */

let databaseStatus;
let classCount;
let classDescription;
let addClassButton;
let createClassButton;
let classesContainer;
let emptyState;
let completeState;

let classModal;
let closeModal;
let cancelModal;
let confirmCreateClass;

let teacherSelect;
let teacherPassword;
let togglePassword;
let nextClassName;
let modalMessage;


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  startClassesPage
);


async function startClassesPage() {

  console.log("FCA Classes page starting...");

  setupDOM();
  setupEvents();


  /* =======================================================
     CHECK SUPABASE
  ======================================================= */

  if (!window.fcaSupabase) {

    setDatabaseStatus(
      "error",
      "Supabase is not loaded. Check config.js."
    );

    console.error(
      "window.fcaSupabase does not exist."
    );

    return;
  }


  db = window.fcaSupabase;

  console.log(
    "FCA Supabase client found."
  );


  /* =======================================================
     DATABASE CONNECTION TEST
  ======================================================= */

  setDatabaseStatus(
    "loading",
    "Connecting to FCA database..."
  );


  const connected =
    await checkClassesTable();


  if (!connected) {
    return;
  }


  /* =======================================================
     LOAD CLASSES
  ======================================================= */

  await loadClasses();


  /* =======================================================
     LOAD TEACHERS
  ======================================================= */

  await loadTeachers();


  /* =======================================================
     FINAL STATUS
  ======================================================= */

  setDatabaseStatus(
    "success",
    "FCA database connected."
  );


  console.log(
    "FCA Classes page ready."
  );

}


/* =========================================================
   DOM SETUP
========================================================= */

function setupDOM() {

  databaseStatus =
    document.getElementById(
      "databaseStatus"
    );

  classCount =
    document.getElementById(
      "classCount"
    );

  classDescription =
    document.getElementById(
      "classDescription"
    );

  addClassButton =
    document.getElementById(
      "addClassButton"
    );

  createClassButton =
    document.getElementById(
      "createClassButton"
    );

  classesContainer =
    document.getElementById(
      "classesContainer"
    );

  emptyState =
    document.getElementById(
      "emptyState"
    );

  completeState =
    document.getElementById(
      "completeState"
    );


  classModal =
    document.getElementById(
      "classModal"
    );

  closeModal =
    document.getElementById(
      "closeModal"
    );

  cancelModal =
    document.getElementById(
      "cancelModal"
    );

  confirmCreateClass =
    document.getElementById(
      "confirmCreateClass"
    );


  teacherSelect =
    document.getElementById(
      "teacherSelect"
    );

  teacherPassword =
    document.getElementById(
      "teacherPassword"
    );

  togglePassword =
    document.getElementById(
      "togglePassword"
    );

  nextClassName =
    document.getElementById(
      "nextClassName"
    );

  modalMessage =
    document.getElementById(
      "modalMessage"
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

  if (createClassButton) {

    createClassButton.addEventListener(
      "click",
      openClassModal
    );

  }


  if (addClassButton) {

    addClassButton.addEventListener(
      "click",
      openClassModal
    );

  }


  if (closeModal) {

    closeModal.addEventListener(
      "click",
      closeClassModal
    );

  }


  if (cancelModal) {

    cancelModal.addEventListener(
      "click",
      closeClassModal
    );

  }


  if (confirmCreateClass) {

    confirmCreateClass.addEventListener(
      "click",
      createClass
    );

  }


  if (togglePassword) {

    togglePassword.addEventListener(
      "click",
      toggleTeacherPassword
    );

  }


  if (teacherPassword) {

    teacherPassword.addEventListener(
      "keydown",
      function(event) {

        if (event.key === "Enter") {

          event.preventDefault();

          createClass();

        }

      }
    );

  }


  if (classModal) {

    classModal.addEventListener(
      "click",
      function(event) {

        if (
          event.target === classModal
        ) {

          closeClassModal();

        }

      }
    );

  }

}


/* =========================================================
   DATABASE TEST
========================================================= */

async function checkClassesTable() {

  try {

    console.log(
      "Testing FCA classes table..."
    );


    const query =
      db
        .from("classes")
        .select("id")
        .limit(1);


    /*
       TIMEOUT PROTECTION
       Prevents "Connecting..." forever.
    */

    const result =
      await Promise.race([

        query,

        new Promise(function(resolve) {

          setTimeout(
            function() {

              resolve({
                data: null,
                error: {
                  message:
                    "Database request timed out."
                }
              });

            },
            10000
          );

        })

      ]);


    if (result.error) {

      console.error(
        "Classes table error:",
        result.error
      );


      setDatabaseStatus(
        "error",
        "Database error: " +
        result.error.message
      );


      return false;

    }


    console.log(
      "Classes table is accessible."
    );


    return true;

  }

  catch (error) {

    console.error(
      "Database test failed:",
      error
    );


    setDatabaseStatus(
      "error",
      "Database connection failed: " +
      error.message
    );


    return false;

  }

}


/* =========================================================
   LOAD CLASSES
========================================================= */

async function loadClasses() {

  try {

    console.log(
      "Loading FCA classes..."
    );


    const {
      data,
      error
    } =
      await db
        .from("classes")
        .select(
          "id, class_name, class_code, description, created_at, form_number, created_by"
        )
        .order(
          "form_number",
          {
            ascending: true
          }
        );


    if (error) {

      console.error(
        "Load classes error:",
        error
      );


      classes = [];

      renderClasses();


      setDatabaseStatus(
        "error",
        "Could not load classes: " +
        error.message
      );


      return;

    }


    classes =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "Classes loaded:",
      classes
    );


    renderClasses();

  }

  catch (error) {

    console.error(
      "Load classes exception:",
      error
    );


    classes = [];

    renderClasses();


    setDatabaseStatus(
      "error",
      "Classes error: " +
      error.message
    );

  }

}


/* =========================================================
   LOAD TEACHERS
========================================================= */

async function loadTeachers() {

  try {

    console.log(
      "Loading FCA teachers..."
    );


    /*
       Select * so this page does not depend on
       unnecessary teacher columns.
    */

    const {
      data,
      error
    } =
      await db
        .from("teachers")
        .select("*");


    if (error) {

      console.error(
        "Teacher loading error:",
        error
      );


      teachers = [];

      populateTeacherSelect();

      return;

    }


    teachers =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      "Teachers loaded:",
      teachers.length
    );


    populateTeacherSelect();

  }

  catch (error) {

    console.error(
      "Teacher loading exception:",
      error
    );


    teachers = [];

    populateTeacherSelect();

  }

}


/* =========================================================
   TEACHER SELECT
========================================================= */

function populateTeacherSelect() {

  if (!teacherSelect) {
    return;
  }


  teacherSelect.innerHTML = "";


  const first =
    document.createElement(
      "option"
    );


  first.value = "";


  first.textContent =
    teachers.length
      ? "Select your name"
      : "No teachers available";


  teacherSelect.appendChild(
    first
  );


  teachers.forEach(
    function(teacher) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        String(
          teacher.id || ""
        );


      const teacherName =
        getTeacherName(
          teacher
        );


      option.textContent =
        teacher.teacher_number
          ? teacherName +
            " (" +
            teacher.teacher_number +
            ")"
          : teacherName;


      teacherSelect.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   TEACHER NAME
========================================================= */

function getTeacherName(teacher) {

  if (!teacher) {
    return "Teacher";
  }


  if (
    teacher.full_name &&
    String(teacher.full_name).trim()
  ) {

    return String(
      teacher.full_name
    ).trim();

  }


  const first =
    String(
      teacher.first_name || ""
    ).trim();


  const last =
    String(
      teacher.last_name || ""
    ).trim();


  const combined =
    (first + " " + last).trim();


  if (combined) {
    return combined;
  }


  if (
    teacher.name &&
    String(teacher.name).trim()
  ) {

    return String(
      teacher.name
    ).trim();

  }


  if (
    teacher.username &&
    String(teacher.username).trim()
  ) {

    return String(
      teacher.username
    ).trim();

  }


  return "Teacher";

}


/* =========================================================
   RENDER CLASSES
========================================================= */

function renderClasses() {

  const count =
    classes.length;


  if (classCount) {

    classCount.textContent =
      String(count);

  }


  if (classesContainer) {

    classesContainer.innerHTML =
      "";

  }


  /* =======================================================
     NO CLASSES
  ======================================================= */

  if (count === 0) {

    if (emptyState) {
      emptyState.hidden = false;
    }


    if (completeState) {
      completeState.hidden = true;
    }


    if (addClassButton) {
      addClassButton.hidden = true;
    }


    if (classDescription) {

      classDescription.textContent =
        "No classes have been created yet.";

    }


    return;

  }


  /* =======================================================
     CLASSES EXIST
  ======================================================= */

  if (emptyState) {
    emptyState.hidden = true;
  }


  if (completeState) {

    completeState.hidden =
      count < MAX_CLASSES;

  }


  if (addClassButton) {

    addClassButton.hidden =
      count >= MAX_CLASSES;

  }


  if (classDescription) {

    if (count >= MAX_CLASSES) {

      classDescription.textContent =
        "All four FCA classes have been created.";

    }

    else {

      classDescription.textContent =
        count +
        " of " +
        MAX_CLASSES +
        " classes have been created.";

    }

  }


  classes.forEach(
    function(item) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "class-card";


      const form =
        Number(
          item.form_number
        );


      const title =
        item.class_name ||
        "Form " + form;


      const code =
        item.class_code ||
        "FCA-FORM-" + form;


      card.innerHTML =

        '<div class="class-card-icon">' +
          escapeHtml(
            String(form)
          ) +
        '</div>' +

        '<div class="class-card-content">' +

          '<small>FCA CLASS</small>' +

          '<h3>' +
            escapeHtml(
              title
            ) +
          '</h3>' +

          '<p>' +
            escapeHtml(
              item.description ||
              "Class available for student management and results."
            ) +
          '</p>' +

          '<small>' +
            escapeHtml(
              code
            ) +
          '</small>' +

        '</div>';


      if (classesContainer) {

        classesContainer.appendChild(
          card
        );

      }

    }
  );

}


/* =========================================================
   NEXT FORM
========================================================= */

function getNextFormNumber() {

  const existing = [];


  classes.forEach(
    function(item) {

      const number =
        Number(
          item.form_number
        );


      if (!isNaN(number)) {

        existing.push(
          number
        );

      }

    }
  );


  for (
    let i = 1;
    i <= MAX_CLASSES;
    i++
  ) {

    if (
      existing.indexOf(i) === -1
    ) {

      return i;

    }

  }


  return null;

}


/* =========================================================
   OPEN CLASS MODAL
========================================================= */

async function openClassModal() {

  if (!db) {

    alert(
      "FCA database is not connected."
    );

    return;

  }


  const next =
    getNextFormNumber();


  if (!next) {

    alert(
      "All four FCA classes have already been created."
    );

    return;

  }


  if (nextClassName) {

    nextClassName.textContent =
      "Form " + next;

  }


  if (teacherPassword) {

    teacherPassword.value = "";

    teacherPassword.type =
      "password";

  }


  if (modalMessage) {

    modalMessage.textContent =
      "";

    modalMessage.className =
      "modal-message";

  }


  if (teacherSelect) {

    teacherSelect.value =
      "";

  }


  if (classModal) {

    classModal.hidden =
      false;

  }


  /*
     Refresh teachers.
  */

  await loadTeachers();


  if (!teachers.length) {

    showModalMessage(
      "No teacher accounts were found. Create a teacher account first.",
      "error"
    );

  }

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeClassModal() {

  if (!classModal) {
    return;
  }


  classModal.hidden =
    true;


  if (teacherPassword) {

    teacherPassword.value =
      "";

    teacherPassword.type =
      "password";

  }


  if (modalMessage) {

    modalMessage.textContent =
      "";

    modalMessage.className =
      "modal-message";

  }

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function toggleTeacherPassword() {

  if (!teacherPassword) {
    return;
  }


  if (
    teacherPassword.type ===
    "password"
  ) {

    teacherPassword.type =
      "text";


    if (togglePassword) {

      togglePassword.textContent =
        "🙈";

    }

  }

  else {

    teacherPassword.type =
      "password";


    if (togglePassword) {

      togglePassword.textContent =
        "👁";

    }

  }

}


/* =========================================================
   CREATE CLASS
========================================================= */

async function createClass() {

  if (!db) {

    showModalMessage(
      "FCA database is not connected.",
      "error"
    );

    return;

  }


  const formNumber =
    getNextFormNumber();


  if (!formNumber) {

    showModalMessage(
      "All four classes already exist.",
      "error"
    );

    return;

  }


  const teacherId =
    teacherSelect
      ? teacherSelect.value
      : "";


  const password =
    teacherPassword
      ? teacherPassword.value.trim()
      : "";


  if (!teacherId) {

    showModalMessage(
      "Please select your teacher name.",
      "error"
    );

    return;

  }


  if (!password) {

    showModalMessage(
      "Please enter your teacher password.",
      "error"
    );

    return;

  }


  const teacher =
    teachers.find(
      function(item) {

        return String(
          item.id
        ) === String(
          teacherId
        );

      }
    );


  if (!teacher) {

    showModalMessage(
      "Selected teacher was not found.",
      "error"
    );

    return;

  }


  /*
     Accept the password hash from the teacher table.
  */

  const storedHash =
    teacher.password_hash ||
    teacher.password ||
    teacher.password_hash_value ||
    "";


  if (!storedHash) {

    showModalMessage(
      "This teacher account has no password stored.",
      "error"
    );

    return;

  }


  /* =======================================================
     VERIFY PASSWORD
  ======================================================= */

  showModalMessage(
    "Verifying teacher authorization...",
    "loading"
  );


  const valid =
    await verifyPassword(
      password,
      storedHash
    );


  if (!valid) {

    showModalMessage(
      "Incorrect teacher password.",
      "error"
    );

    return;

  }


  /* =======================================================
     CHECK DUPLICATE
  ======================================================= */

  const {
    data: existing,
    error: duplicateError
  } =
    await db
      .from("classes")
      .select("id, form_number")
      .eq(
        "form_number",
        formNumber
      )
      .maybeSingle();


  if (duplicateError) {

    console.error(
      "Duplicate check error:",
      duplicateError
    );


    showModalMessage(
      "Could not check existing classes: " +
      duplicateError.message,
      "error"
    );

    return;

  }


  if (existing) {

    showModalMessage(
      "Form " +
      formNumber +
      " already exists.",
      "error"
    );


    await loadClasses();

    return;

  }


  /* =======================================================
     CREATE CLASS
  ======================================================= */

  showModalMessage(
    "Creating Form " +
    formNumber +
    "...",
    "loading"
  );


  const teacherName =
    getTeacherName(
      teacher
    );


  /*
     IMPORTANT:
     Your database column is class_name,
     NOT name.
  */

  const classData = {

    class_name:
      "Form " + formNumber,

    class_code:
      "FCA-F" + formNumber,

    description:
      "FCA Form " + formNumber,

    form_number:
      formNumber,

    created_by:
      teacherName

  };


  console.log(
    "Creating class:",
    classData
  );


  const {
    data,
    error
  } =
    await db
      .from("classes")
      .insert(
        classData
      )
      .select()
      .single();


  if (error) {

    console.error(
      "CREATE CLASS ERROR:",
      error
    );


    showModalMessage(
      "Class could not be created: " +
      error.message,
      "error"
    );

    return;

  }


  console.log(
    "Class created successfully:",
    data
  );


  showModalMessage(
    "Form " +
    formNumber +
    " created successfully.",
    "success"
  );


  await loadClasses();


  setTimeout(
    function() {

      closeClassModal();

    },
    700
  );

}


/* =========================================================
   PASSWORD HASH
========================================================= */

async function hashPassword(password) {

  const encoder =
    new TextEncoder();


  const bytes =
    encoder.encode(
      password
    );


  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      bytes
    );


  const hashArray =
    Array.from(
      new Uint8Array(
        hashBuffer
      )
    );


  return hashArray
    .map(
      function(byte) {

        return byte
          .toString(16)
          .padStart(2, "0");

      }
    )
    .join("");

}


/* =========================================================
   VERIFY PASSWORD
========================================================= */

async function verifyPassword(
  password,
  storedHash
) {

  if (
    !password ||
    !storedHash
  ) {

    return false;

  }


  const hash =
    await hashPassword(
      password
    );


  return (
    hash.toLowerCase() ===
    String(
      storedHash
    )
      .trim()
      .toLowerCase()
  );

}


/* =========================================================
   STATUS
========================================================= */

function setDatabaseStatus(
  type,
  message
) {

  if (!databaseStatus) {
    return;
  }


  databaseStatus.textContent =
    message;


  databaseStatus.className =
    "database-status";


  if (type === "success") {

    databaseStatus.classList.add(
      "success"
    );

  }


  if (type === "error") {

    databaseStatus.classList.add(
      "error"
    );

  }


  if (type === "loading") {

    databaseStatus.classList.add(
      "loading"
    );

  }

}


/* =========================================================
   MODAL MESSAGE
========================================================= */

function showModalMessage(
  message,
  type
) {

  if (!modalMessage) {
    return;
  }


  modalMessage.textContent =
    message;


  modalMessage.className =
    "modal-message";


  if (type) {

    modalMessage.classList.add(
      type
    );

  }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}