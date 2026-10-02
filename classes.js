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

/*
   FCA administrator account.

   This must match the administrator's Supabase Auth email.
*/
const FCA_ADMIN_EMAIL = "fca.admin@gmail.com";


let db = null;

let teachers = [];
let classes = [];

let selectedDeleteClassId = null;
let selectedDeleteButton = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

let classCount;
let classDescription;
let addClassButton;
let createClassButton;
let classesContainer;
let emptyState;
let completeState;


/* CREATE CLASS MODAL */

let classModal;
let closeModal;
let cancelModal;
let confirmCreateClass;

let teacherSelect;
let teacherPassword;
let togglePassword;
let nextClassName;
let modalMessage;


/* DELETE CLASS MODAL */

let deleteClassModal;
let closeDeleteModal;
let deleteClassName;
let deleteClassWarning;
let adminDeletePassword;
let adminPasswordToggle;
let classDeleteMessage;
let deleteClassCancelBtn;
let deleteClassConfirmBtn;


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    startClassesPage
);


async function startClassesPage() {

    console.log(
        "FCA Classes page starting..."
    );


    setupDOM();

    setupEvents();


    /* =====================================================
       CHECK SUPABASE
    ===================================================== */

    if (!window.fcaSupabase) {

        console.error(
            "FCA: window.fcaSupabase does not exist."
        );

        return;

    }


    db =
        window.fcaSupabase;


    console.log(
        "FCA Supabase client found."
    );


    /* =====================================================
       CHECK CLASSES TABLE
    ===================================================== */

    const connected =
        await checkClassesTable();


    if (!connected) {
        return;
    }


    /* =====================================================
       LOAD DATA
    ===================================================== */

    await loadClasses();

    await loadTeachers();


    console.log(
        "FCA Classes page ready."
    );

}


/* =========================================================
   DOM SETUP
========================================================= */

function setupDOM() {

    /* =====================================================
       MAIN PAGE
    ===================================================== */

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


    /* =====================================================
       CREATE CLASS MODAL
    ===================================================== */

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


    /* =====================================================
       DELETE CLASS MODAL
    ===================================================== */

    deleteClassModal =
        document.getElementById(
            "deleteClassModal"
        );


    closeDeleteModal =
        document.getElementById(
            "closeDeleteModal"
        );


    deleteClassName =
        document.getElementById(
            "deleteClassName"
        );


    deleteClassWarning =
        document.getElementById(
            "deleteClassWarning"
        );


    adminDeletePassword =
        document.getElementById(
            "adminDeletePassword"
        );


    adminPasswordToggle =
        document.getElementById(
            "adminPasswordToggle"
        );


    classDeleteMessage =
        document.getElementById(
            "classDeleteMessage"
        );


    deleteClassCancelBtn =
        document.getElementById(
            "deleteClassCancelBtn"
        );


    deleteClassConfirmBtn =
        document.getElementById(
            "deleteClassConfirmBtn"
        );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    /* =====================================================
       CREATE CLASS
    ===================================================== */

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
                    event.target ===
                    classModal
                ) {

                    closeClassModal();

                }

            }
        );

    }


    /* =====================================================
       DELETE CLASS MODAL
    ===================================================== */

    if (closeDeleteModal) {

        closeDeleteModal.addEventListener(
            "click",
            closeDeleteClassModal
        );

    }


    if (deleteClassCancelBtn) {

        deleteClassCancelBtn.addEventListener(
            "click",
            closeDeleteClassModal
        );

    }


    if (deleteClassConfirmBtn) {

        deleteClassConfirmBtn.addEventListener(
            "click",
            confirmDeleteClass
        );

    }


    if (adminPasswordToggle) {

        adminPasswordToggle.addEventListener(
            "click",
            toggleAdminDeletePassword
        );

    }


    if (adminDeletePassword) {

        adminDeletePassword.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    confirmDeleteClass();

                }

            }
        );

    }


    if (deleteClassModal) {

        deleteClassModal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    deleteClassModal
                ) {

                    closeDeleteClassModal();

                }

            }
        );

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {

                if (
                    classModal &&
                    !classModal.hidden
                ) {

                    closeClassModal();

                }


                if (
                    deleteClassModal &&
                    !deleteClassModal.hidden
                ) {

                    closeDeleteClassModal();

                }

            }

        }
    );

}


/* =========================================================
   DATABASE TEST
========================================================= */

async function checkClassesTable() {

    try {

        console.log(
            "Testing FCA classes table..."
        );


        const result =
            await Promise.race([

                db
                    .from("classes")
                    .select("id")
                    .limit(1),

                new Promise(
                    function(resolve) {

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

                    }
                )

            ]);


        if (result.error) {

            console.error(
                "Classes table error:",
                result.error
            );

            return false;

        }


        console.log(
            "Classes table is accessible."
        );


        return true;

    }

    catch(error) {

        console.error(
            "Database test failed:",
            error
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

    catch(error) {

        console.error(
            "Load classes exception:",
            error
        );


        classes = [];

        renderClasses();

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

    catch(error) {

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


    teacherSelect.innerHTML =
        "";


    const first =
        document.createElement(
            "option"
        );


    first.value =
        "";


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
        String(
            teacher.full_name
        ).trim()
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
        (
            first +
            " " +
            last
        ).trim();


    if (combined) {
        return combined;
    }


    if (
        teacher.name &&
        String(
            teacher.name
        ).trim()
    ) {

        return String(
            teacher.name
        ).trim();

    }


    if (
        teacher.username &&
        String(
            teacher.username
        ).trim()
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


    /* =====================================================
       NO CLASSES
    ===================================================== */

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


    /* =====================================================
       CLASSES EXIST
    ===================================================== */

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


    /* =====================================================
       CREATE CLASS CARDS
    ===================================================== */

    classes.forEach(
        function(item) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "class-card";


            const form =
                Number(
                    item.form_number
                );


            const code =
                item.class_code ||
                "FCA-FORM-" + form;


            card.innerHTML =

                '<div class="class-card-content">' +

                    '<small class="class-label">' +
                        'FCA CLASS' +
                    '</small>' +

                    '<span class="class-code">' +
                        escapeHtml(code) +
                    '</span>' +

                '</div>' +


                '<div class="class-card-actions">' +

                    '<button' +
                        ' type="button"' +
                        ' class="view-class-button"' +
                        ' data-class-id="' +
                        escapeHtml(
                            String(item.id)
                        ) +
                    '">' +

                        '<span class="button-icon">→</span>' +

                        '<span>View Students</span>' +

                    '</button>' +


                    '<button' +
                        ' type="button"' +
                        ' class="delete-class-button"' +
                        ' data-class-id="' +
                        escapeHtml(
                            String(item.id)
                        ) +
                    '">' +

                        '<span class="button-icon">×</span>' +

                        '<span>Delete Class</span>' +

                    '</button>' +

                '</div>';


            if (classesContainer) {

                classesContainer.appendChild(
                    card
                );

            }


            /* =================================================
               VIEW STUDENTS
            ================================================= */

            const viewButton =
                card.querySelector(
                    ".view-class-button"
                );


            if (viewButton) {

                viewButton.addEventListener(
                    "click",
                    function(event) {

                        event.stopPropagation();

                        const classId =
                            this.dataset.classId;


                        openClassStudents(
                            classId
                        );

                    }
                );

            }


            /* =================================================
               DELETE BUTTON
            ================================================= */

            const deleteButton =
                card.querySelector(
                    ".delete-class-button"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function(event) {

                        event.stopPropagation();

                        const classId =
                            this.dataset.classId;


                        openDeleteClassModal(
                            classId,
                            this
                        );

                    }
                );

            }

        }
    );

}


/* =========================================================
   VIEW STUDENTS
========================================================= */

function openClassStudents(classId) {

    const selectedClass =
        classes.find(
            function(item) {

                return String(item.id) ===
                    String(classId);

            }
        );


    if (!selectedClass) {

        alert(
            "Class could not be found."
        );

        return;

    }


    const form =
        Number(
            selectedClass.form_number
        );


    window.location.href =
        "students.html?form=" +
        encodeURIComponent(form);

}


/* =========================================================
   OPEN DELETE CLASS MODAL
========================================================= */

function openDeleteClassModal(
    classId,
    button
) {

    if (!db) {

        alert(
            "FCA database is not connected."
        );

        return;

    }


    const selectedClass =
        classes.find(
            function(item) {

                return String(item.id) ===
                    String(classId);

            }
        );


    if (!selectedClass) {

        alert(
            "Class could not be found."
        );

        return;

    }


    selectedDeleteClassId =
        classId;


    selectedDeleteButton =
        button || null;


    const formNumber =
        Number(
            selectedClass.form_number
        );


    const className =
        selectedClass.class_name ||
        "Form " + formNumber;


    if (deleteClassName) {

        deleteClassName.textContent =
            className;

    }


    if (deleteClassWarning) {

        deleteClassWarning.textContent =
            "Deleting " +
            className +
            " may affect students and results associated with this class.";

    }


    if (adminDeletePassword) {

        adminDeletePassword.value =
            "";

        adminDeletePassword.type =
            "password";

    }


    if (adminPasswordToggle) {

        adminPasswordToggle.classList.remove(
            "is-visible"
        );

        adminPasswordToggle.setAttribute(
            "aria-label",
            "Show password"
        );

        adminPasswordToggle.setAttribute(
            "title",
            "Show password"
        );

        adminPasswordToggle.setAttribute(
            "aria-pressed",
            "false"
        );

    }


    showDeleteMessage(
        "",
        ""
    );


    if (deleteClassConfirmBtn) {

        deleteClassConfirmBtn.disabled =
            false;

        deleteClassConfirmBtn.innerHTML =
            "Delete Class";

    }


    if (deleteClassModal) {

        deleteClassModal.hidden =
            false;

    }


    setTimeout(
        function() {

            if (adminDeletePassword) {

                adminDeletePassword.focus();

            }

        },
        100
    );

}


/* =========================================================
   CLOSE DELETE CLASS MODAL
========================================================= */

function closeDeleteClassModal() {

    if (deleteClassModal) {

        deleteClassModal.hidden =
            true;

    }


    selectedDeleteClassId =
        null;


    selectedDeleteButton =
        null;


    if (adminDeletePassword) {

        adminDeletePassword.value =
            "";

        adminDeletePassword.type =
            "password";

    }


    if (adminPasswordToggle) {

        adminPasswordToggle.classList.remove(
            "is-visible"
        );

        adminPasswordToggle.setAttribute(
            "aria-label",
            "Show password"
        );

        adminPasswordToggle.setAttribute(
            "title",
            "Show password"
        );

        adminPasswordToggle.setAttribute(
            "aria-pressed",
            "false"
        );

    }


    showDeleteMessage(
        "",
        ""
    );


    if (deleteClassConfirmBtn) {

        deleteClassConfirmBtn.disabled =
            false;

        deleteClassConfirmBtn.innerHTML =
            "Delete Class";

    }

}


/* =========================================================
   ADMINISTRATOR PASSWORD TOGGLE
========================================================= */

function toggleAdminDeletePassword() {

    if (!adminDeletePassword) {
        return;
    }


    const showing =
        adminDeletePassword.type === "text";


    adminDeletePassword.type =
        showing
            ? "password"
            : "text";


    if (adminPasswordToggle) {

        adminPasswordToggle.classList.toggle(
            "is-visible",
            !showing
        );


        adminPasswordToggle.setAttribute(
            "aria-label",
            showing
                ? "Show password"
                : "Hide password"
        );


        adminPasswordToggle.setAttribute(
            "title",
            showing
                ? "Show password"
                : "Hide password"
        );


        adminPasswordToggle.setAttribute(
            "aria-pressed",
            showing
                ? "false"
                : "true"
        );

    }

}


/* =========================================================
   CONFIRM DELETE CLASS
========================================================= */

async function confirmDeleteClass() {

  if (!db) {
    showDeleteMessage("error", "Database is not connected.");
    return;
  }

  if (!selectedDeleteClassId) {
    showDeleteMessage("error", "No class has been selected.");
    return;
  }

  const password = dom.adminDeletePassword?.value.trim();

  if (!password) {
    showDeleteMessage(
      "error",
      "Please enter the administrator password."
    );
    dom.adminDeletePassword?.focus();
    return;
  }

  const selectedClass = classes.find(
    item => String(item.id) === String(selectedDeleteClassId)
  );

  if (!selectedClass) {
    showDeleteMessage(
      "error",
      "The selected class could not be found."
    );
    return;
  }

  const formNumber = Number(selectedClass.form_number);

  if (!formNumber) {
    showDeleteMessage(
      "error",
      "This class does not have a valid form number."
    );
    return;
  }

  const formName = `Form ${formNumber}`;

  const deleteButton = dom.deleteClassConfirmBtn;

  if (deleteButton) {
    deleteButton.disabled = true;
    deleteButton.textContent = "Deleting...";
  }

  try {

    /* =====================================================
       1. VERIFY ADMINISTRATOR PASSWORD
    ===================================================== */

    showDeleteMessage(
      "info",
      "Verifying administrator password..."
    );

    const adminVerified = await verifyAdministratorPassword(password);

    if (!adminVerified) {
      throw new Error(
        "The administrator password is incorrect."
      );
    }


    /* =====================================================
       2. FIND STUDENTS IN THIS CLASS
       
       IMPORTANT:
       Do NOT request student_number because that column
       does not exist in the students table.
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

    const studentIds = (students || [])
      .map(student => student.id)
      .filter(Boolean);


    /* =====================================================
       3. DELETE RESULTS BELONGING TO THESE STUDENTS
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
        .in("student_id", studentIds);

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
        error: deleteStudentsError
      } = await db
        .from("students")
        .delete()
        .in("id", studentIds);

      if (deleteStudentsError) {
        throw new Error(
          `Could not delete students: ${deleteStudentsError.message}`
        );
      }
    }


    /* =====================================================
       5. VERIFY STUDENTS WERE DELETED
    ===================================================== */

    const {
      data: remainingStudents,
      error: verifyStudentsError
    } = await db
      .from("students")
      .select("id")
      .eq("class", formName)
      .limit(1);

    if (verifyStudentsError) {
      throw new Error(
        `Could not verify student deletion: ${verifyStudentsError.message}`
      );
    }

    if (remainingStudents && remainingStudents.length > 0) {
      throw new Error(
        `Some students belonging to ${formName} could not be deleted.`
      );
    }


    /* =====================================================
       6. DELETE THE CLASS
    ===================================================== */

    showDeleteMessage(
      "info",
      `Deleting ${formName}...`
    );

    const {
      data: deletedClass,
      error: deleteClassError
    } = await db
      .from("classes")
      .delete()
      .eq("id", selectedDeleteClassId)
      .select("id");

    if (deleteClassError) {
      throw new Error(
        `Could not delete ${formName}: ${deleteClassError.message}`
      );
    }

    if (!deletedClass || deletedClass.length === 0) {
      throw new Error(
        "The class was not deleted. Supabase returned no deleted record."
      );
    }


    /* =====================================================
       7. VERIFY CLASS WAS DELETED
    ===================================================== */

    const {
      data: remainingClass,
      error: verifyClassError
    } = await db
      .from("classes")
      .select("id")
      .eq("id", selectedDeleteClassId)
      .limit(1);

    if (verifyClassError) {
      throw new Error(
        `Could not verify class deletion: ${verifyClassError.message}`
      );
    }

    if (remainingClass && remainingClass.length > 0) {
      throw new Error(
        "The class still exists in the database."
      );
    }


    /* =====================================================
       8. SUCCESS
    ===================================================== */

    classes = classes.filter(
      item =>
        String(item.id) !== String(selectedDeleteClassId)
    );

    showDeleteMessage(
      "success",
      `${formName} and its students/results were deleted successfully.`
    );

    setTimeout(() => {

      closeDeleteClassModal();

      selectedDeleteClassId = null;

      loadClasses();

    }, 900);

  } catch (error) {

    console.error(
      "CLASS DELETE ERROR:",
      error
    );

    showDeleteMessage(
      "error",
      error.message || "Failed to delete class."
    );

  } finally {

    if (deleteButton) {
      deleteButton.disabled = false;
      deleteButton.textContent = "Delete Class";
    }
  }
}


    /* =====================================================
       FIND SELECTED CLASS
    ===================================================== */

    const selectedClass =
        classes.find(
            function(item) {

                return String(item.id) ===
                    String(selectedDeleteClassId);

            }
        );


    if (!selectedClass) {

        showDeleteMessage(
            "The selected class could not be found.",
            "error"
        );

        return;

    }


    const className =
        selectedClass.class_name ||
        "Form " +
        selectedClass.form_number;


    /* =====================================================
       DISABLE BUTTON
    ===================================================== */

    if (deleteClassConfirmBtn) {

        deleteClassConfirmBtn.disabled =
            true;

        deleteClassConfirmBtn.innerHTML =
            '<span class="button-spinner"></span>' +
            '<span>Verifying...</span>';

    }


    showDeleteMessage(
        "Verifying administrator authorization...",
        "loading"
    );


    /* =====================================================
       VERIFY ADMIN PASSWORD
    ===================================================== */

    const valid =
        await verifyAdministratorPassword(
            password
        );


    if (!valid) {

        if (deleteClassConfirmBtn) {

            deleteClassConfirmBtn.disabled =
                false;

            deleteClassConfirmBtn.innerHTML =
                "Delete Class";

        }


        showDeleteMessage(
            "Incorrect administrator password.",
            "error"
        );


        if (adminDeletePassword) {

            adminDeletePassword.select();

        }


        return;

    }


    /* =====================================================
       START DELETE
    ===================================================== */

    if (deleteClassConfirmBtn) {

        deleteClassConfirmBtn.innerHTML =
            '<span class="button-spinner"></span>' +
            '<span>Deleting...</span>';

    }


    showDeleteMessage(
        "Administrator verified. Checking students in " +
        className +
        "...",
        "loading"
    );


    try {

        /* =================================================
           STEP 1
           FIND STUDENTS BELONGING TO THIS CLASS
        ================================================= */

        const formNumber =
            Number(
                selectedClass.form_number
            );


        const formName =
            "Form " +
            formNumber;


        const {
            data: studentsInClass,
            error: studentLookupError
        } =
            await db
                .from("students")
                .select(
                    "id,student_number,name,class"
                )
                .eq(
                    "class",
                    formName
                );


        if (studentLookupError) {

            console.error(
                "Student lookup error:",
                studentLookupError
            );


            throw new Error(
                "Could not find students belonging to " +
                className +
                ": " +
                studentLookupError.message
            );

        }


        const students =
            Array.isArray(studentsInClass)
                ? studentsInClass
                : [];


        const studentIds =
            students
                .map(
                    function(student) {

                        return student.id;

                    }
                )
                .filter(
                    function(id) {

                        return (
                            id !== null &&
                            id !== undefined &&
                            String(id).trim() !== ""
                        );

                    }
                );


        console.log(
            "Students belonging to class:",
            students
        );


        console.log(
            "Number of students to delete:",
            studentIds.length
        );


        /* =================================================
           STEP 2
           DELETE RESULTS
        ================================================= */

        if (studentIds.length > 0) {

            showDeleteMessage(
                "Deleting " +
                studentIds.length +
                " student result record(s)...",
                "loading"
            );


            const {
                error: resultsDeleteError
            } =
                await db
                    .from("results")
                    .delete()
                    .in(
                        "student_id",
                        studentIds
                    );


            if (resultsDeleteError) {

                console.error(
                    "Delete student results error:",
                    resultsDeleteError
                );


                throw new Error(
                    "Student results could not be deleted: " +
                    resultsDeleteError.message
                );

            }

        }


        /* =================================================
           STEP 3
           DELETE STUDENTS
        ================================================= */

        if (studentIds.length > 0) {

            showDeleteMessage(
                "Deleting " +
                studentIds.length +
                " student(s)...",
                "loading"
            );


            const {
                error: studentsDeleteError
            } =
                await db
                    .from("students")
                    .delete()
                    .in(
                        "id",
                        studentIds
                    );


            if (studentsDeleteError) {

                console.error(
                    "Delete students error:",
                    studentsDeleteError
                );


                throw new Error(
                    "Students could not be deleted: " +
                    studentsDeleteError.message
                );

            }

        }


        /* =================================================
           STEP 4
           VERIFY STUDENTS WERE DELETED
        ================================================= */

        if (studentIds.length > 0) {

            const {
                data: remainingStudents,
                error: studentVerifyError
            } =
                await db
                    .from("students")
                    .select("id")
                    .in(
                        "id",
                        studentIds
                    );


            if (studentVerifyError) {

                console.warn(
                    "Student deletion verification warning:",
                    studentVerifyError
                );

            }


            if (
                Array.isArray(remainingStudents) &&
                remainingStudents.length > 0
            ) {

                throw new Error(
                    "Some students still exist in Supabase. " +
                    "Check the students table DELETE policy."
                );

            }

        }


        /* =================================================
           STEP 5
           DELETE CLASS
        ================================================= */

        showDeleteMessage(
            "Students removed. Deleting " +
            className +
            "...",
            "loading"
        );


        const {
            data: deletedRows,
            error: classDeleteError
        } =
            await db
                .from("classes")
                .delete()
                .eq(
                    "id",
                    selectedDeleteClassId
                )
                .select("id");


        if (classDeleteError) {

            console.error(
                "Delete class error:",
                classDeleteError
            );


            throw new Error(
                "Class could not be deleted: " +
                classDeleteError.message
            );

        }


        /* =================================================
           VERIFY CLASS WAS DELETED
        ================================================= */

        if (
            !Array.isArray(deletedRows) ||
            deletedRows.length === 0
        ) {

            throw new Error(
                "The class was NOT deleted from Supabase. " +
                "Please check the classes table DELETE policy."
            );

        }


        const {
            data: remainingClass,
            error: verifyClassError
        } =
            await db
                .from("classes")
                .select("id")
                .eq(
                    "id",
                    selectedDeleteClassId
                )
                .maybeSingle();


        if (verifyClassError) {

            console.warn(
                "Class verification warning:",
                verifyClassError
            );

        }


        if (remainingClass) {

            throw new Error(
                "The class still exists in the database."
            );

        }


        /* =================================================
           STEP 6
           REMOVE CLASS FROM LOCAL ARRAY
        ================================================= */

        classes =
            classes.filter(
                function(item) {

                    return String(item.id) !==
                        String(selectedDeleteClassId);

                }
            );


        console.log(
            "Class deleted:",
            selectedDeleteClassId
        );


        console.log(
            "Students deleted:",
            studentIds.length
        );


        /* =================================================
           SUCCESS
        ================================================= */

        showDeleteMessage(
            className +
            " and " +
            studentIds.length +
            " student(s) were deleted successfully.",
            "success"
        );


        if (deleteClassConfirmBtn) {

            deleteClassConfirmBtn.disabled =
                true;

            deleteClassConfirmBtn.innerHTML =
                "Deleted";

        }


        /* =================================================
           RELOAD CLASSES
        ================================================= */

        await loadClasses();


        /* =================================================
           CLOSE MODAL
        ================================================= */

        setTimeout(
            function() {

                closeDeleteClassModal();

            },
            900
        );

    }

    catch(error) {

        console.error(
            "Delete class exception:",
            error
        );


        if (deleteClassConfirmBtn) {

            deleteClassConfirmBtn.disabled =
                false;

            deleteClassConfirmBtn.innerHTML =
                "Delete Class";

        }


        showDeleteMessage(
            "Delete failed: " +
            error.message,
            "error"
        );

    }

}


/* =========================================================
   VERIFY ADMINISTRATOR PASSWORD
========================================================= */

async function verifyAdministratorPassword(
    password
) {

    if (
        !db ||
        !password
    ) {

        return false;

    }


    try {

        const {
            data,
            error
        } =
            await db.auth.signInWithPassword({

                email:
                    FCA_ADMIN_EMAIL,

                password:
                    password

            });


        if (error) {

            console.error(
                "Administrator verification failed:",
                error.message
            );


            return false;

        }


        if (
            data &&
            data.user &&
            data.user.email
        ) {

            return (
                String(
                    data.user.email
                ).toLowerCase() ===
                FCA_ADMIN_EMAIL.toLowerCase()
            );

        }


        return false;

    }

    catch(error) {

        console.error(
            "Administrator authentication error:",
            error
        );


        return false;

    }

}


/* =========================================================
   NEXT FORM NUMBER
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

        teacherPassword.value =
            "";

        teacherPassword.type =
            "password";

    }


    if (togglePassword) {

        togglePassword.classList.remove(
            "is-visible"
        );

        togglePassword.setAttribute(
            "aria-label",
            "Show password"
        );

        togglePassword.setAttribute(
            "title",
            "Show password"
        );

        togglePassword.setAttribute(
            "aria-pressed",
            "false"
        );

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


    await loadTeachers();


    if (!teachers.length) {

        showModalMessage(
            "No teacher accounts were found. Create a teacher account first.",
            "error"
        );

    }

}


/* =========================================================
   CLOSE CLASS MODAL
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


    if (togglePassword) {

        togglePassword.classList.remove(
            "is-visible"
        );

        togglePassword.setAttribute(
            "aria-label",
            "Show password"
        );

        togglePassword.setAttribute(
            "title",
            "Show password"
        );

        togglePassword.setAttribute(
            "aria-pressed",
            "false"
        );

    }


    if (modalMessage) {

        modalMessage.textContent =
            "";

        modalMessage.className =
            "modal-message";

    }

}


/* =========================================================
   TEACHER PASSWORD TOGGLE
========================================================= */

function toggleTeacherPassword() {

    if (!teacherPassword) {
        return;
    }


    const showing =
        teacherPassword.type === "text";


    teacherPassword.type =
        showing
            ? "password"
            : "text";


    if (togglePassword) {

        togglePassword.classList.toggle(
            "is-visible",
            !showing
        );


        togglePassword.setAttribute(
            "aria-label",
            showing
                ? "Show password"
                : "Hide password"
        );


        togglePassword.setAttribute(
            "title",
            showing
                ? "Show password"
                : "Hide password"
        );


        togglePassword.setAttribute(
            "aria-pressed",
            showing
                ? "false"
                : "true"
        );

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

                return String(item.id) ===
                    String(teacherId);

            }
        );


    if (!teacher) {

        showModalMessage(
            "Selected teacher was not found.",
            "error"
        );

        return;

    }


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


    /* =====================================================
       VERIFY TEACHER PASSWORD
    ===================================================== */

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


    /* =====================================================
       DUPLICATE CHECK
    ===================================================== */

    const {
        data: existing,
        error: duplicateError
    } =
        await db
            .from("classes")
            .select(
                "id, form_number"
            )
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


    /* =====================================================
       CREATE CLASS
    ===================================================== */

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
   HASH PASSWORD
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
                    .padStart(
                        2,
                        "0"
                    );

            }
        )
        .join("");

}


/* =========================================================
   VERIFY TEACHER PASSWORD
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
        String(storedHash)
            .trim()
            .toLowerCase()
    );

}


/* =========================================================
   CREATE MODAL MESSAGE
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
   DELETE MODAL MESSAGE
========================================================= */

function showDeleteMessage(
    message,
    type
) {

    if (!classDeleteMessage) {
        return;
    }


    classDeleteMessage.textContent =
        message;


    classDeleteMessage.className =
        "modal-message";


    if (type) {

        classDeleteMessage.classList.add(
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