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

let databaseStatus;
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
let adminClassDeletePassword;
let adminClassPasswordToggle;
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

        setDatabaseStatus(
            "error",
            "❌ Supabase is not available. Check config.js."
        );

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


    setDatabaseStatus(
        "loading",
        "Checking FCA database..."
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


    setDatabaseStatus(
        "success",
        "✓ FCA database connected."
    );


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


    adminClassDeletePassword =
        document.getElementById(
            "adminClassDeletePassword"
        );


    adminClassPasswordToggle =
        document.getElementById(
            "adminClassPasswordToggle"
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


    if (adminClassPasswordToggle) {

        adminClassPasswordToggle.addEventListener(
            "click",
            toggleAdminDeletePassword
        );

    }


    if (adminClassDeletePassword) {

        adminClassDeletePassword.addEventListener(
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


            setDatabaseStatus(
                "error",
                "❌ Database error: " +
                result.error.message
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


        setDatabaseStatus(
            "error",
            "❌ Database connection failed: " +
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
                "❌ Could not load classes: " +
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

    catch(error) {

        console.error(
            "Load classes exception:",
            error
        );


        classes = [];

        renderClasses();


        setDatabaseStatus(
            "error",
            "❌ Classes error: " +
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


            const title =
                item.class_name ||
                "Form " + form;


            const code =
                item.class_code ||
                "FCA-FORM-" + form;


            const description =
                item.description ||
                "Class available for student management and results.";


            card.innerHTML =

                '<div class="class-card-header">' +

                    '<div class="class-card-number">' +
                        escapeHtml(
                            String(form)
                        ) +
                    '</div>' +

                    '<span class="class-status">' +
                        'Active' +
                    '</span>' +

                '</div>' +


                '<div class="class-card-content">' +

                    '<small class="class-label">' +
                        'FCA CLASS' +
                    '</small>' +

                    '<h3>' +
                        escapeHtml(title) +
                    '</h3>' +

                    '<p>' +
                        escapeHtml(description) +
                    '</p>' +

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


    /* =====================================================
       CLASS NAME
    ===================================================== */

    if (deleteClassName) {

        deleteClassName.textContent =
            className;

    }


    /* =====================================================
       WARNING
    ===================================================== */

    if (deleteClassWarning) {

        deleteClassWarning.textContent =
            "Deleting " +
            className +
            " may affect students and results associated with this class.";

    }


    /* =====================================================
       RESET PASSWORD
    ===================================================== */

    if (adminClassDeletePassword) {

        adminClassDeletePassword.value =
            "";

        adminClassDeletePassword.type =
            "password";

    }


    if (adminClassPasswordToggle) {

        adminClassPasswordToggle.textContent =
            "👁";

    }


    /* =====================================================
       RESET MESSAGE
    ===================================================== */

    showDeleteMessage(
        "",
        ""
    );


    /* =====================================================
       RESET BUTTON
    ===================================================== */

    if (deleteClassConfirmBtn) {

        deleteClassConfirmBtn.disabled =
            false;

        deleteClassConfirmBtn.innerHTML =
            "Delete Class";

    }


    /* =====================================================
       SHOW MODAL
    ===================================================== */

    if (deleteClassModal) {

        deleteClassModal.hidden =
            false;

    }


    /* =====================================================
       FOCUS PASSWORD
    ===================================================== */

    setTimeout(
        function() {

            if (adminClassDeletePassword) {

                adminClassDeletePassword.focus();

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


    if (adminClassDeletePassword) {

        adminClassDeletePassword.value =
            "";

        adminClassDeletePassword.type =
            "password";

    }


    if (adminClassPasswordToggle) {

        adminClassPasswordToggle.textContent =
            "👁";

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
   ADMIN PASSWORD TOGGLE
========================================================= */

function toggleAdminDeletePassword() {

    if (!adminClassDeletePassword) {
        return;
    }


    if (
        adminClassDeletePassword.type ===
        "password"
    ) {

        adminClassDeletePassword.type =
            "text";


        if (adminClassPasswordToggle) {

            adminClassPasswordToggle.textContent =
                "🙈";

        }

    }

    else {

        adminClassDeletePassword.type =
            "password";


        if (adminClassPasswordToggle) {

            adminClassPasswordToggle.textContent =
                "👁";

        }

    }

}


/* =========================================================
   CONFIRM DELETE CLASS
========================================================= */

async function confirmDeleteClass() {

    if (!db) {

        showDeleteMessage(
            "FCA database is not connected.",
            "error"
        );

        return;

    }


    if (!selectedDeleteClassId) {

        showDeleteMessage(
            "No class has been selected.",
            "error"
        );

        return;

    }


    const password =
        adminClassDeletePassword
            ? adminClassDeletePassword.value.trim()
            : "";


    if (!password) {

        showDeleteMessage(
            "Please enter the administrator password.",
            "error"
        );

        if (adminClassDeletePassword) {

            adminClassDeletePassword.focus();

        }

        return;

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


        if (adminClassDeletePassword) {

            adminClassDeletePassword.select();

        }


        return;

    }


    /* =====================================================
       DELETE FROM SUPABASE
    ===================================================== */

    if (deleteClassConfirmBtn) {

        deleteClassConfirmBtn.innerHTML =
            '<span class="button-spinner"></span>' +
            '<span>Deleting...</span>';

    }


    showDeleteMessage(
        "Administrator verified. Deleting " +
        className +
        "...",
        "loading"
    );


    setDatabaseStatus(
        "loading",
        "Deleting " +
        className +
        "..."
    );


    try {

        /*
           IMPORTANT:

           select("id") makes Supabase return the row
           that was actually deleted.

           If the returned array is empty, the class
           was NOT actually deleted.
        */

        const {
            data: deletedRows,
            error
        } =
            await db
                .from("classes")
                .delete()
                .eq(
                    "id",
                    selectedDeleteClassId
                )
                .select("id");


        /* =================================================
           DATABASE ERROR
        ================================================= */

        if (error) {

            console.error(
                "Delete class error:",
                error
            );


            if (deleteClassConfirmBtn) {

                deleteClassConfirmBtn.disabled =
                    false;

                deleteClassConfirmBtn.innerHTML =
                    "Delete Class";

            }


            showDeleteMessage(
                "Class could not be deleted: " +
                error.message,
                "error"
            );


            setDatabaseStatus(
                "error",
                "❌ Class could not be deleted."
            );


            return;

        }


        /* =================================================
           VERIFY ACTUAL DELETE
        ================================================= */

        if (
            !Array.isArray(deletedRows) ||
            deletedRows.length === 0
        ) {

            console.error(
                "Supabase did not delete the class.",
                {
                    classId:
                        selectedDeleteClassId,

                    className:
                        className
                }
            );


            if (deleteClassConfirmBtn) {

                deleteClassConfirmBtn.disabled =
                    false;

                deleteClassConfirmBtn.innerHTML =
                    "Delete Class";

            }


            showDeleteMessage(
                "The class was NOT deleted from Supabase. " +
                "Please check the classes table RLS DELETE policy.",
                "error"
            );


            setDatabaseStatus(
                "error",
                "❌ Class was not deleted from the database."
            );


            return;

        }


        /* =================================================
           VERIFY DATABASE
        ================================================= */

        const {
            data: remainingClass,
            error: verifyError
        } =
            await db
                .from("classes")
                .select("id")
                .eq(
                    "id",
                    selectedDeleteClassId
                )
                .maybeSingle();


        if (verifyError) {

            console.warn(
                "Delete verification query returned an error:",
                verifyError
            );

        }


        /*
           If the row can still be found, stop here.
        */

        if (remainingClass) {

            console.error(
                "Class still exists after delete:",
                remainingClass
            );


            if (deleteClassConfirmBtn) {

                deleteClassConfirmBtn.disabled =
                    false;

                deleteClassConfirmBtn.innerHTML =
                    "Delete Class";

            }


            showDeleteMessage(
                "The class still exists in the database.",
                "error"
            );


            setDatabaseStatus(
                "error",
                "❌ Class still exists in Supabase."
            );


            return;

        }


        /* =================================================
           REMOVE FROM LOCAL ARRAY
        ================================================= */

        classes =
            classes.filter(
                function(item) {

                    return String(item.id) !==
                        String(selectedDeleteClassId);

                }
            );


        console.log(
            "Class actually deleted from Supabase:",
            selectedDeleteClassId
        );


        /* =================================================
           SUCCESS
        ================================================= */

        showDeleteMessage(
            className +
            " was deleted successfully.",
            "success"
        );


        setDatabaseStatus(
            "success",
            "✓ " +
            className +
            " deleted successfully."
        );


        /* =================================================
           BUTTON
        ================================================= */

        if (deleteClassConfirmBtn) {

            deleteClassConfirmBtn.disabled =
                true;

            deleteClassConfirmBtn.innerHTML =
                "Deleted";

        }


        /* =================================================
           RELOAD FROM DATABASE
        ================================================= */

        await loadClasses();


        /* =================================================
           CLOSE MODAL
        ================================================= */

        setTimeout(
            function() {

                closeDeleteClassModal();

            },
            700
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


        setDatabaseStatus(
            "error",
            "❌ Delete failed: " +
            error.message
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

        /*
           Authenticate the FCA administrator through
           Supabase Auth.

           The administrator password is NOT stored
           inside this JavaScript file.
        */

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

        togglePassword.textContent =
            "👁";

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

        togglePassword.textContent =
            "👁";

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
   DATABASE STATUS
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
            "connected"
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