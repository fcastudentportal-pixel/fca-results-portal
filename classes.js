/* =========================================================
   FIRST CLASS ACADEMY
   FCA CLASSES MANAGEMENT
   SUPABASE VERSION
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const MAX_CLASSES = 4;

const FCA_ADMIN_EMAIL = "fca.admin@gmail.com";

let db = null;

let teachers = [];
let classes = [];

let selectedDeleteClassId = null;

let dom = {};


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  startClassesPage();
});


async function startClassesPage() {

  console.log("FCA Classes: starting...");

  setupDOM();
  setupEvents();

  if (!window.fcaSupabase) {

    console.error(
      "FCA Classes: window.fcaSupabase was not found."
    );

    showPageError(
      "Database connection is not available. Please check config.js."
    );

    return;
  }

  db = window.fcaSupabase;

  console.log("FCA Classes: Supabase client found.");

  await loadClasses();
}


/* =========================================================
   DOM
========================================================= */

function setupDOM() {

  dom = {

    classCount:
      document.getElementById("classCount"),

    classDescription:
      document.getElementById("classDescription"),

    addClassButton:
      document.getElementById("addClassButton"),

    createClassButton:
      document.getElementById("createClassButton"),

    classesContainer:
      document.getElementById("classesContainer"),

    emptyState:
      document.getElementById("emptyState"),

    completeState:
      document.getElementById("completeState"),


    /* CREATE MODAL */

    classModal:
      document.getElementById("classModal"),

    closeModal:
      document.getElementById("closeModal"),

    teacherSelect:
      document.getElementById("teacherSelect"),

    teacherPassword:
      document.getElementById("teacherPassword"),

    togglePassword:
      document.getElementById("togglePassword"),

    nextClassName:
      document.getElementById("nextClassName"),

    modalMessage:
      document.getElementById("modalMessage"),

    cancelModal:
      document.getElementById("cancelModal"),

    confirmCreateClass:
      document.getElementById("confirmCreateClass"),


    /* DELETE MODAL */

    deleteClassModal:
      document.getElementById("deleteClassModal"),

    closeDeleteModal:
      document.getElementById("closeDeleteModal"),

    deleteClassName:
      document.getElementById("deleteClassName"),

    deleteClassWarning:
      document.getElementById("deleteClassWarning"),

    adminDeletePassword:
      document.getElementById("adminDeletePassword"),

    adminPasswordToggle:
      document.getElementById("adminPasswordToggle"),

    classDeleteMessage:
      document.getElementById("classDeleteMessage"),

    deleteClassCancelBtn:
      document.getElementById("deleteClassCancelBtn"),

    deleteClassConfirmBtn:
      document.getElementById("deleteClassConfirmBtn")
  };
}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

  /* CREATE CLASS */

  dom.createClassButton?.addEventListener(
    "click",
    openClassModal
  );

  dom.addClassButton?.addEventListener(
    "click",
    openClassModal
  );

  dom.closeModal?.addEventListener(
    "click",
    closeClassModal
  );

  dom.cancelModal?.addEventListener(
    "click",
    closeClassModal
  );

  dom.confirmCreateClass?.addEventListener(
    "click",
    createClass
  );

  dom.togglePassword?.addEventListener(
    "click",
    toggleTeacherPassword
  );


  /* DELETE CLASS */

  dom.closeDeleteModal?.addEventListener(
    "click",
    closeDeleteClassModal
  );

  dom.deleteClassCancelBtn?.addEventListener(
    "click",
    closeDeleteClassModal
  );

  dom.deleteClassConfirmBtn?.addEventListener(
    "click",
    confirmDeleteClass
  );

  dom.adminPasswordToggle?.addEventListener(
    "click",
    toggleAdminDeletePassword
  );


  /* ENTER KEY */

  dom.teacherPassword?.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        event.preventDefault();
        createClass();
      }

    }
  );


  dom.adminDeletePassword?.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        event.preventDefault();
        confirmDeleteClass();
      }

    }
  );


  /* OVERLAY CLOSE */

  dom.classModal?.addEventListener(
    "click",
    event => {

      if (event.target === dom.classModal) {
        closeClassModal();
      }

    }
  );


  dom.deleteClassModal?.addEventListener(
    "click",
    event => {

      if (event.target === dom.deleteClassModal) {
        closeDeleteClassModal();
      }

    }
  );


  /* ESCAPE */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Escape") {
        return;
      }

      if (
        dom.classModal &&
        !dom.classModal.hidden
      ) {
        closeClassModal();
      }

      if (
        dom.deleteClassModal &&
        !dom.deleteClassModal.hidden
      ) {
        closeDeleteClassModal();
      }

    }
  );
}


/* =========================================================
   LOAD CLASSES
========================================================= */

async function loadClasses() {

  if (!db) {
    return;
  }

  console.log("FCA Classes: loading classes...");

  try {

    const {
      data,
      error
    } = await db
      .from("classes")
      .select(`
        id,
        class_name,
        class_code,
        description,
        created_at,
        form_number,
        created_by
      `)
      .order("form_number", {
        ascending: true
      });


    if (error) {

      console.error(
        "FCA Classes load error:",
        error
      );

      showPageError(
        `Could not load classes: ${error.message}`
      );

      return;
    }


    classes = Array.isArray(data)
      ? data
      : [];


    console.log(
      "FCA Classes loaded:",
      classes
    );


    renderClasses();

  } catch (error) {

    console.error(
      "FCA Classes unexpected error:",
      error
    );

    showPageError(
      `Could not load classes: ${error.message}`
    );
  }
}


/* =========================================================
   RENDER CLASSES
========================================================= */

function renderClasses() {

  const count = classes.length;


  /* COUNT */

  if (dom.classCount) {
    dom.classCount.textContent = count;
  }


  /* DESCRIPTION */

  if (dom.classDescription) {

    if (count === 0) {

      dom.classDescription.textContent =
        "No classes have been created yet.";

    } else if (count === MAX_CLASSES) {

      dom.classDescription.textContent =
        "All four FCA classes have been created.";

    } else {

      dom.classDescription.textContent =
        `${count} class${count === 1 ? "" : "es"} created.`;
    }
  }


  /* CONTAINER */

  if (dom.classesContainer) {

    dom.classesContainer.innerHTML = "";

    classes.forEach(classItem => {

      const card = createClassCard(classItem);

      dom.classesContainer.appendChild(card);

    });
  }


  /* EMPTY STATE */

  if (dom.emptyState) {

    dom.emptyState.hidden =
      count !== 0;
  }


  /* COMPLETE STATE */

  if (dom.completeState) {

    dom.completeState.hidden =
      count < MAX_CLASSES;
  }


  /* ADD BUTTON */

  if (dom.addClassButton) {

    dom.addClassButton.hidden =
      count >= MAX_CLASSES;
  }
}


/* =========================================================
   CREATE CLASS CARD
========================================================= */

function createClassCard(classItem) {

  const card = document.createElement("article");

  card.className = "class-card";

  const formNumber =
    Number(classItem.form_number) || 0;

  const classCode =
    classItem.class_code ||
    `FCA-F${formNumber}`;


  card.innerHTML = `

    <div class="class-card-content">

      <small class="class-label">
        FCA CLASS
      </small>

      <span class="class-code">
        ${escapeHtml(classCode)}
      </span>

    </div>

    <div class="class-card-actions">

      <button
        type="button"
        class="view-class-button"
        data-class-id="${escapeHtml(classItem.id)}"
      >
        <span class="button-icon">→</span>
        <span>View Students</span>
      </button>

      <button
        type="button"
        class="delete-class-button"
        data-class-id="${escapeHtml(classItem.id)}"
      >
        <span class="button-icon">×</span>
        <span>Delete Class</span>
      </button>

    </div>
  `;


  /* VIEW STUDENTS */

  const viewButton =
    card.querySelector(".view-class-button");

  viewButton?.addEventListener(
    "click",
    () => {

      openClassStudents(classItem);

    }
  );


  /* DELETE */

  const deleteButton =
    card.querySelector(".delete-class-button");

  deleteButton?.addEventListener(
    "click",
    () => {

      openDeleteClassModal(classItem);

    }
  );


  return card;
}


/* =========================================================
   VIEW STUDENTS
========================================================= */

function openClassStudents(classItem) {

  const formNumber =
    Number(classItem.form_number);

  if (!formNumber) {

    alert(
      "This class does not have a valid form number."
    );

    return;
  }

  window.location.href =
    `students.html?form=${encodeURIComponent(formNumber)}`;
}


/* =========================================================
   CREATE CLASS MODAL
========================================================= */

async function openClassModal() {

  if (!db) {

    showPageError(
      "Database connection is not available."
    );

    return;
  }


  const nextForm =
    getNextFormNumber();


  if (!nextForm) {

    alert(
      "All four FCA classes have already been created."
    );

    return;
  }


  resetCreateModal();


  if (dom.nextClassName) {

    dom.nextClassName.textContent =
      `Form ${nextForm}`;
  }


  if (dom.classModal) {

    dom.classModal.hidden = false;

    dom.classModal.classList.add("show");
  }


  await loadTeachers();
}


function closeClassModal() {

  if (!dom.classModal) {
    return;
  }

  dom.classModal.classList.remove("show");

  dom.classModal.hidden = true;
}


function resetCreateModal() {

  if (dom.teacherSelect) {
    dom.teacherSelect.value = "";
  }

  if (dom.teacherPassword) {
    dom.teacherPassword.value = "";
    dom.teacherPassword.type = "password";
  }

  if (dom.modalMessage) {
    dom.modalMessage.textContent = "";
    dom.modalMessage.className = "modal-message";
  }

  setPasswordEye(
    dom.togglePassword,
    false
  );
}


/* =========================================================
   LOAD TEACHERS
========================================================= */

async function loadTeachers() {

  if (!db) {
    return;
  }


  if (dom.teacherSelect) {

    dom.teacherSelect.innerHTML = `
      <option value="">
        Loading teachers...
      </option>
    `;

    dom.teacherSelect.disabled = true;
  }


  try {

    const {
      data,
      error
    } = await db
      .from("teachers")
      .select("*")
      .order("created_at", {
        ascending: false
      });


    if (error) {

      console.error(
        "FCA Teachers load error:",
        error
      );

      if (dom.teacherSelect) {

        dom.teacherSelect.innerHTML = `
          <option value="">
            Unable to load teachers
          </option>
        `;

      }

      showModalMessage(
        "error",
        `Could not load teachers: ${error.message}`
      );

      return;
    }


    teachers = Array.isArray(data)
      ? data
      : [];


    populateTeacherSelect();


  } catch (error) {

    console.error(
      "Teacher loading error:",
      error
    );

    showModalMessage(
      "error",
      `Could not load teachers: ${error.message}`
    );

  } finally {

    if (dom.teacherSelect) {
      dom.teacherSelect.disabled = false;
    }
  }
}


/* =========================================================
   TEACHER DROPDOWN
========================================================= */

function populateTeacherSelect() {

  if (!dom.teacherSelect) {
    return;
  }


  dom.teacherSelect.innerHTML = "";


  const firstOption =
    document.createElement("option");

  firstOption.value = "";

  firstOption.textContent =
    teachers.length
      ? "Select a teacher"
      : "No teachers available";

  dom.teacherSelect.appendChild(firstOption);


  teachers.forEach(teacher => {

    const option =
      document.createElement("option");

    option.value =
      String(teacher.id);

    const firstName =
      teacher.first_name || "";

    const lastName =
      teacher.last_name || "";

    const teacherNumber =
      teacher.teacher_number || "";


    const fullName =
      `${firstName} ${lastName}`.trim();


    option.textContent =
      teacherNumber
        ? `${fullName} — ${teacherNumber}`
        : fullName || "Teacher";


    dom.teacherSelect.appendChild(option);

  });
}


/* =========================================================
   CREATE CLASS
========================================================= */

async function createClass() {

  if (!db) {

    showModalMessage(
      "error",
      "Database connection is not available."
    );

    return;
  }


  const nextForm =
    getNextFormNumber();


  if (!nextForm) {

    showModalMessage(
      "error",
      "All four FCA classes already exist."
    );

    return;
  }


  const teacherId =
    dom.teacherSelect?.value;


  const teacherPassword =
    dom.teacherPassword?.value.trim();


  if (!teacherId) {

    showModalMessage(
      "error",
      "Please select a teacher."
    );

    return;
  }


  if (!teacherPassword) {

    showModalMessage(
      "error",
      "Please enter the teacher password."
    );

    dom.teacherPassword?.focus();

    return;
  }


  const teacher =
    teachers.find(
      item =>
        String(item.id) ===
        String(teacherId)
    );


  if (!teacher) {

    showModalMessage(
      "error",
      "The selected teacher could not be found."
    );

    return;
  }


  const confirmButton =
    dom.confirmCreateClass;


  if (confirmButton) {

    confirmButton.disabled = true;

    confirmButton.textContent =
      "Creating...";
  }


  try {

    /* =====================================================
       VERIFY TEACHER PASSWORD
    ===================================================== */

    showModalMessage(
      "info",
      "Verifying teacher password..."
    );


    const storedHash =
      teacher.password_hash ||
      teacher.password ||
      teacher.password_hash_value;


    if (!storedHash) {

      throw new Error(
        "This teacher does not have a stored password."
      );
    }


    const enteredHash =
      await hashPassword(
        teacherPassword
      );


    if (
      String(storedHash).toLowerCase() !==
      String(enteredHash).toLowerCase()
    ) {

      throw new Error(
        "The teacher password is incorrect."
      );
    }


    /* =====================================================
       CHECK FOR DUPLICATE FORM
    ===================================================== */

    const {
      data: existingClass,
      error: existingError
    } = await db
      .from("classes")
      .select("id")
      .eq("form_number", nextForm)
      .limit(1);


    if (existingError) {

      throw new Error(
        `Could not check existing classes: ${existingError.message}`
      );
    }


    if (
      existingClass &&
      existingClass.length > 0
    ) {

      throw new Error(
        `Form ${nextForm} already exists.`
      );
    }


    /* =====================================================
       CREATE CLASS
    ===================================================== */

    showModalMessage(
      "info",
      `Creating Form ${nextForm}...`
    );


    const {
      data: createdClass,
      error: createError
    } = await db
      .from("classes")
      .insert([
        {
          class_name: `Form ${nextForm}`,
          class_code: `FCA-F${nextForm}`,
          description: `FCA Form ${nextForm}`,
          form_number: nextForm,
          created_by: teacher.id
        }
      ])
      .select()
      .single();


    if (createError) {

      throw new Error(
        `Could not create class: ${createError.message}`
      );
    }


    if (!createdClass) {

      throw new Error(
        "Class creation returned no data."
      );
    }


    console.log(
      "Class created:",
      createdClass
    );


    showModalMessage(
      "success",
      `Form ${nextForm} created successfully.`
    );


    /* =====================================================
       RELOAD CLASSES
    ===================================================== */

    await loadClasses();


    setTimeout(() => {

      closeClassModal();

    }, 700);


  } catch (error) {

    console.error(
      "CREATE CLASS ERROR:",
      error
    );

    showModalMessage(
      "error",
      error.message ||
      "Failed to create class."
    );

  } finally {

    if (confirmButton) {

      confirmButton.disabled = false;

      confirmButton.textContent =
        "Create Class";
    }
  }
}


/* =========================================================
   DELETE CLASS MODAL
========================================================= */

function openDeleteClassModal(classItem) {

  if (!classItem) {
    return;
  }


  selectedDeleteClassId =
    classItem.id;


  const formNumber =
    Number(classItem.form_number) || 0;


  const formName =
    `Form ${formNumber}`;


  if (dom.deleteClassName) {

    dom.deleteClassName.textContent =
      formName;
  }


  if (dom.deleteClassWarning) {

    dom.deleteClassWarning.textContent =
      `Deleting ${formName} will also remove its students and their results. This action cannot be undone.`;
  }


  if (dom.adminDeletePassword) {

    dom.adminDeletePassword.value = "";

    dom.adminDeletePassword.type =
      "password";
  }


  setPasswordEye(
    dom.adminPasswordToggle,
    false
  );


  if (dom.classDeleteMessage) {

    dom.classDeleteMessage.textContent = "";

    dom.classDeleteMessage.className =
      "modal-message";
  }


  if (dom.deleteClassModal) {

    dom.deleteClassModal.hidden = false;

    dom.deleteClassModal.classList.add(
      "show"
    );
  }
}


function closeDeleteClassModal() {

  if (!dom.deleteClassModal) {
    return;
  }


  dom.deleteClassModal.classList.remove(
    "show"
  );

  dom.deleteClassModal.hidden = true;


  selectedDeleteClassId = null;


  if (dom.adminDeletePassword) {
    dom.adminDeletePassword.value = "";
  }
}


/* =========================================================
   DELETE CLASS
========================================================= */

async function confirmDeleteClass() {

  if (!db) {

    showDeleteMessage(
      "error",
      "Database connection is not available."
    );

    return;
  }


  if (!selectedDeleteClassId) {

    showDeleteMessage(
      "error",
      "No class has been selected."
    );

    return;
  }


  const password =
    dom.adminDeletePassword?.value.trim();


  if (!password) {

    showDeleteMessage(
      "error",
      "Please enter the administrator password."
    );

    dom.adminDeletePassword?.focus();

    return;
  }


  const selectedClass =
    classes.find(
      item =>
        String(item.id) ===
        String(selectedDeleteClassId)
    );


  if (!selectedClass) {

    showDeleteMessage(
      "error",
      "The selected class could not be found."
    );

    return;
  }


  const formNumber =
    Number(selectedClass.form_number);


  if (!formNumber) {

    showDeleteMessage(
      "error",
      "This class has an invalid form number."
    );

    return;
  }


  const formName =
    `Form ${formNumber}`;


  const deleteButton =
    dom.deleteClassConfirmBtn;


  if (deleteButton) {

    deleteButton.disabled = true;

    deleteButton.textContent =
      "Deleting...";
  }


  try {

    /* =====================================================
       1. VERIFY ADMIN PASSWORD
    ===================================================== */

    showDeleteMessage(
      "info",
      "Verifying administrator password..."
    );


    const verified =
      await verifyAdministratorPassword(
        password
      );


    if (!verified) {

      throw new Error(
        "The administrator password is incorrect."
      );
    }


    /* =====================================================
       2. FIND STUDENTS

       IMPORTANT:
       Only "id" is selected.
       There is NO student_number here.
    ===================================================== */

    showDeleteMessage(
      "info",
      `Finding students in ${formName}...`
    );


    const {
      data: students,
      error: studentsError
    } = await db
      .from("students")
      .select("id")
      .eq("class", formName);


    if (studentsError) {

      throw new Error(
        `Could not find students belonging to ${formName}: ${studentsError.message}`
      );
    }


    const studentIds =
      (students || [])
        .map(student => student.id)
        .filter(Boolean);


    console.log(
      `Students found in ${formName}:`,
      studentIds
    );


    /* =====================================================
       3. DELETE RESULTS
    ===================================================== */

    if (studentIds.length > 0) {

      showDeleteMessage(
        "info",
        `Deleting results for ${studentIds.length} student(s)...`
      );


      const {
        error: resultsError
      } = await db
        .from("results")
        .delete()
        .in(
          "student_id",
          studentIds
        );


      if (resultsError) {

        throw new Error(
          `Could not delete student results: ${resultsError.message}`
        );
      }
    }


    /* =====================================================
       4. DELETE STUDENTS
    ===================================================== */

    if (studentIds.length > 0) {

      showDeleteMessage(
        "info",
        `Deleting ${studentIds.length} student(s)...`
      );


      const {
        error: studentsDeleteError
      } = await db
        .from("students")
        .delete()
        .in(
          "id",
          studentIds
        );


      if (studentsDeleteError) {

        throw new Error(
          `Could not delete students: ${studentsDeleteError.message}`
        );
      }
    }


    /* =====================================================
       5. DELETE CLASS
    ===================================================== */

    showDeleteMessage(
      "info",
      `Deleting ${formName}...`
    );


    const {
      data: deletedClass,
      error: classDeleteError
    } = await db
      .from("classes")
      .delete()
      .eq(
        "id",
        selectedDeleteClassId
      )
      .select("id");


    if (classDeleteError) {

      throw new Error(
        `Could not delete ${formName}: ${classDeleteError.message}`
      );
    }


    if (
      !deletedClass ||
      deletedClass.length === 0
    ) {

      throw new Error(
        "The class was not deleted. Check the Supabase RLS policy for the classes table."
      );
    }


    /* =====================================================
       6. SUCCESS
    ===================================================== */

    classes =
      classes.filter(
        item =>
          String(item.id) !==
          String(selectedDeleteClassId)
      );


    renderClasses();


    showDeleteMessage(
      "success",
      `${formName} was deleted successfully.`
    );


    setTimeout(() => {

      closeDeleteClassModal();

      loadClasses();

    }, 800);


  } catch (error) {

    console.error(
      "DELETE CLASS ERROR:",
      error
    );


    showDeleteMessage(
      "error",
      `Delete failed: ${error.message}`
    );


  } finally {

    if (deleteButton) {

      deleteButton.disabled = false;

      deleteButton.textContent =
        "Delete Class";
    }
  }
}


/* =========================================================
   ADMIN PASSWORD VERIFICATION
========================================================= */

async function verifyAdministratorPassword(password) {

  if (!db) {
    return false;
  }


  try {

    const {
      data,
      error
    } = await db.auth.signInWithPassword({

      email:
        FCA_ADMIN_EMAIL,

      password:
        password

    });


    if (error) {

      console.error(
        "Administrator authentication failed:",
        error
      );

      return false;
    }


    return !!data?.user;


  } catch (error) {

    console.error(
      "Administrator verification error:",
      error
    );

    return false;
  }
}


/* =========================================================
   GET NEXT FORM
========================================================= */

function getNextFormNumber() {

  const existingForms =
    classes
      .map(item =>
        Number(item.form_number)
      )
      .filter(number =>
        number >= 1 &&
        number <= MAX_CLASSES
      );


  for (
    let number = 1;
    number <= MAX_CLASSES;
    number++
  ) {

    if (
      !existingForms.includes(number)
    ) {

      return number;
    }
  }


  return null;
}


/* =========================================================
   TEACHER PASSWORD TOGGLE
========================================================= */

function toggleTeacherPassword() {

  if (!dom.teacherPassword) {
    return;
  }


  const isPassword =
    dom.teacherPassword.type ===
    "password";


  dom.teacherPassword.type =
    isPassword
      ? "text"
      : "password";


  setPasswordEye(
    dom.togglePassword,
    isPassword
  );
}


/* =========================================================
   ADMIN DELETE PASSWORD TOGGLE
========================================================= */

function toggleAdminDeletePassword() {

  if (!dom.adminDeletePassword) {
    return;
  }


  const isPassword =
    dom.adminDeletePassword.type ===
    "password";


  dom.adminDeletePassword.type =
    isPassword
      ? "text"
      : "password";


  setPasswordEye(
    dom.adminPasswordToggle,
    isPassword
  );
}


/* =========================================================
   PASSWORD EYE ICON
========================================================= */

function setPasswordEye(
  button,
  visible
) {

  if (!button) {
    return;
  }


  const openEye =
    button.querySelector(
      ".eye-open"
    );

  const closedEye =
    button.querySelector(
      ".eye-closed"
    );


  if (openEye) {

    openEye.style.display =
      visible
        ? "block"
        : "none";
  }


  if (closedEye) {

    closedEye.style.display =
      visible
        ? "none"
        : "block";
  }


  button.setAttribute(
    "aria-label",
    visible
      ? "Hide password"
      : "Show password"
  );
}


/* =========================================================
   HASH PASSWORD
========================================================= */

async function hashPassword(password) {

  const encoder =
    new TextEncoder();


  const data =
    encoder.encode(password);


  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );


  const hashArray =
    Array.from(
      new Uint8Array(hashBuffer)
    );


  return hashArray
    .map(
      byte =>
        byte
          .toString(16)
          .padStart(2, "0")
    )
    .join("");
}


/* =========================================================
   MODAL MESSAGES
========================================================= */

function showModalMessage(
  type,
  message
) {

  if (!dom.modalMessage) {
    return;
  }


  dom.modalMessage.textContent =
    message;


  dom.modalMessage.className =
    `modal-message ${type}`;
}


function showDeleteMessage(
  type,
  message
) {

  if (!dom.classDeleteMessage) {
    return;
  }


  dom.classDeleteMessage.textContent =
    message;


  dom.classDeleteMessage.className =
    `modal-message ${type}`;
}


/* =========================================================
   PAGE ERROR
========================================================= */

function showPageError(message) {

  console.error(
    "FCA Classes:",
    message
  );


  if (dom.classDescription) {

    dom.classDescription.textContent =
      message;
  }


  if (dom.classesContainer) {

    dom.classesContainer.innerHTML = `
      <div class="classes-error">
        ${escapeHtml(message)}
      </div>
    `;
  }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
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