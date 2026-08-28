/* ============================================================
   FCA TEACHERS MANAGEMENT
   Flask + SQLite API
============================================================ */

const API_BASE = "http://127.0.0.1:5000/api";

let teachers = [];
let editingTeacherId = null;


/* ============================================================
   ELEMENTS
============================================================ */

const teacherForm = document.getElementById("teacherForm");
const teacherList = document.getElementById("teacherList");

const teacherCount = document.getElementById("teacherCount");
const subjectCount = document.getElementById("subjectCount");
const classCount = document.getElementById("classCount");

const teacherMessage = document.getElementById("teacherMessage");
const formTitle = document.getElementById("formTitle");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const cancelBtn = document.getElementById("cancelBtn");

const selectAllSubjectsBtn =
    document.getElementById("selectAllSubjectsBtn");

const clearSubjectsBtn =
    document.getElementById("clearSubjectsBtn");

const selectAllClassesBtn =
    document.getElementById("selectAllClassesBtn");

const clearClassesBtn =
    document.getElementById("clearClassesBtn");

const passwordToggle =
    document.getElementById("passwordToggle");


/* ============================================================
   API REQUEST
============================================================ */

async function apiRequest(endpoint, options = {}) {

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 10000);

    try {

        const response = await fetch(
            API_BASE + endpoint,
            {
                ...options,

                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },

                signal: controller.signal
            }
        );

        clearTimeout(timeout);

        let data;

        try {

            data = await response.json();

        } catch {

            throw new Error(
                "The FCA API returned an invalid response."
            );

        }

        if (!response.ok) {

            throw new Error(
                data.message ||
                `API request failed (${response.status})`
            );

        }

        return data;

    } catch (error) {

        clearTimeout(timeout);

        if (error.name === "AbortError") {

            throw new Error(
                "Connection timed out. Make sure the FCA Flask server is running."
            );

        }

        if (
            error instanceof TypeError ||
            error.message.includes("Failed to fetch")
        ) {

            throw new Error(
                "Cannot connect to FCA API at " +
                API_BASE +
                ". Start the Flask server in Termux."
            );

        }

        throw error;

    }

}


/* ============================================================
   NORMALIZE SUBJECT
============================================================ */

function getSubjectName(subject) {

    if (typeof subject === "string") {
        return subject;
    }

    if (!subject || typeof subject !== "object") {
        return "";
    }

    return (
        subject.subject_name ||
        subject.name ||
        subject.subject ||
        subject.title ||
        ""
    );

}


/* ============================================================
   NORMALIZE CLASS
============================================================ */

function getClassName(classItem) {

    if (typeof classItem === "string") {
        return classItem;
    }

    if (!classItem || typeof classItem !== "object") {
        return "";
    }

    return (
        classItem.class_name ||
        classItem.name ||
        classItem.class ||
        classItem.title ||
        ""
    );

}


/* ============================================================
   NORMALIZE SUBJECTS
============================================================ */

function normalizeSubjects(value) {

    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {

        return value
            .map(getSubjectName)
            .filter(Boolean);

    }

    if (typeof value === "string") {

        try {

            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {

                return parsed
                    .map(getSubjectName)
                    .filter(Boolean);

            }

        } catch {

            return value.trim()
                ? [value.trim()]
                : [];

        }

    }

    return [];

}


/* ============================================================
   NORMALIZE CLASSES
============================================================ */

function normalizeClasses(value) {

    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {

        return value
            .map(getClassName)
            .filter(Boolean);

    }

    if (typeof value === "string") {

        try {

            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {

                return parsed
                    .map(getClassName)
                    .filter(Boolean);

            }

        } catch {

            return value.trim()
                ? [value.trim()]
                : [];

        }

    }

    return [];

}


/* ============================================================
   LOAD TEACHERS
============================================================ */

async function loadTeachers() {

    if (!teacherList) {
        return;
    }

    teacherList.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                T
            </div>

            <strong>
                Loading teachers...
            </strong>

            <p>
                Connecting to the FCA database.
            </p>

        </div>

    `;

    try {

        const data =
            await apiRequest("/teachers");

        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load teachers."
            );

        }

        teachers =
            Array.isArray(data.teachers)
                ? data.teachers
                : [];

        displayTeachers();

    } catch (error) {

        console.error(
            "FCA Teachers API Error:",
            error
        );

        teacherList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <strong>
                    Unable to connect to FCA database
                </strong>

                <p>
                    ${escapeHtml(error.message)}
                </p>

                <button
                    class="add-btn"
                    type="button"
                    onclick="loadTeachers()"
                >
                    Retry Connection
                </button>

            </div>

        `;

    }

}


/* ============================================================
   DISPLAY TEACHERS
============================================================ */

function displayTeachers() {

    teacherCount.textContent =
        teachers.length;

    let subjectsTotal = 0;
    let classesTotal = 0;


    teachers.forEach(teacher => {

        const subjects =
            normalizeSubjects(
                teacher.subjects
            );

        const classes =
            normalizeClasses(
                teacher.classes
            );

        subjectsTotal +=
            subjects.length;

        classesTotal +=
            classes.length;

    });


    subjectCount.textContent =
        subjectsTotal;

    classCount.textContent =
        classesTotal;


    if (teachers.length === 0) {

        teacherList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    T
                </div>

                <strong>
                    No teachers added yet
                </strong>

                <p>
                    Add your first teacher to begin
                    managing classes and results.
                </p>

                <a
                    href="#addTeacher"
                    class="add-btn"
                >
                    + Add Teacher
                </a>

            </div>

        `;

        return;

    }


    teacherList.innerHTML =
        teachers.map(teacher => {

            const subjects =
                normalizeSubjects(
                    teacher.subjects
                );

            const classes =
                normalizeClasses(
                    teacher.classes
                );


            const fullName =
                `${teacher.first_name || ""} ${teacher.last_name || ""}`
                .trim();


            const initials =
                (
                    (teacher.first_name || "").charAt(0) +
                    (teacher.last_name || "").charAt(0)
                ).toUpperCase();


            return `

                <div class="teacher-card">

                    <div class="teacher-main">

                        <div class="teacher-avatar">
                            ${escapeHtml(initials)}
                        </div>


                        <div class="teacher-info">

                            <div class="teacher-name-row">

                                <h3>
                                    ${escapeHtml(fullName)}
                                </h3>

                                <span class="teacher-id">

                                    ${escapeHtml(
                                        teacher.teacher_number ||
                                        "No ID"
                                    )}

                                </span>

                            </div>


                            <p class="username">

                                @${escapeHtml(
                                    teacher.username ||
                                    "No username"
                                )}

                            </p>


                            <div class="assignment-block">

                                <strong>
                                    Subjects
                                </strong>

                                <div class="tags">

                                    ${
                                        subjects.length

                                        ? subjects.map(subject => `

                                            <span
                                                class="tag subject-tag"
                                            >
                                                ${escapeHtml(subject)}
                                            </span>

                                        `).join("")

                                        : `

                                            <span class="none">
                                                No subjects assigned
                                            </span>

                                        `
                                    }

                                </div>

                            </div>


                            <div class="assignment-block">

                                <strong>
                                    Classes
                                </strong>

                                <div class="tags">

                                    ${
                                        classes.length

                                        ? classes.map(className => `

                                            <span
                                                class="tag class-tag"
                                            >
                                                ${escapeHtml(className)}
                                            </span>

                                        `).join("")

                                        : `

                                            <span class="none">
                                                No classes assigned
                                            </span>

                                        `
                                    }

                                </div>

                            </div>

                        </div>

                    </div>


                    <div class="teacher-actions">

                        <button
                            class="edit-btn"
                            type="button"
                            onclick="editTeacher(${teacher.id})"
                        >
                            Edit
                        </button>


                        <button
                            class="delete-btn"
                            type="button"
                            onclick="deleteTeacher(${teacher.id})"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;

        }).join("");

}


/* ============================================================
   GET SELECTED SUBJECTS
============================================================ */

function getSelectedSubjects() {

    return Array.from(
        document.querySelectorAll(
            'input[name="subjects"]:checked'
        )
    ).map(
        checkbox => checkbox.value
    );

}


/* ============================================================
   GET SELECTED CLASSES
============================================================ */

function getSelectedClasses() {

    return Array.from(
        document.querySelectorAll(
            'input[name="classes"]:checked'
        )
    ).map(
        checkbox => checkbox.value
    );

}


/* ============================================================
   SELECT ALL SUBJECTS
============================================================ */

function selectAllSubjects() {

    document
        .querySelectorAll(
            'input[name="subjects"]'
        )
        .forEach(checkbox => {

            checkbox.checked = true;

        });

}


/* ============================================================
   CLEAR SUBJECTS
============================================================ */

function clearSubjects() {

    document
        .querySelectorAll(
            'input[name="subjects"]'
        )
        .forEach(checkbox => {

            checkbox.checked = false;

        });

}


/* ============================================================
   SELECT ALL CLASSES
============================================================ */

function selectAllClasses() {

    document
        .querySelectorAll(
            'input[name="classes"]'
        )
        .forEach(checkbox => {

            checkbox.checked = true;

        });

}


/* ============================================================
   CLEAR CLASSES
============================================================ */

function clearClasses() {

    document
        .querySelectorAll(
            'input[name="classes"]'
        )
        .forEach(checkbox => {

            checkbox.checked = false;

        });

}


/* ============================================================
   BUTTON LISTENERS
============================================================ */

if (selectAllSubjectsBtn) {

    selectAllSubjectsBtn.addEventListener(
        "click",
        selectAllSubjects
    );

}


if (clearSubjectsBtn) {

    clearSubjectsBtn.addEventListener(
        "click",
        clearSubjects
    );

}


if (selectAllClassesBtn) {

    selectAllClassesBtn.addEventListener(
        "click",
        selectAllClasses
    );

}


if (clearClassesBtn) {

    clearClassesBtn.addEventListener(
        "click",
        clearClasses
    );

}


/* ============================================================
   PASSWORD SHOW / HIDE
============================================================ */

if (passwordToggle && passwordInput) {

    passwordToggle.addEventListener(
        "click",
        function() {

            if (
                passwordInput.type === "password"
            ) {

                passwordInput.type =
                    "text";

                passwordToggle.textContent =
                    "🙈";

                passwordToggle.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                passwordInput.type =
                    "password";

                passwordToggle.textContent =
                    "👁";

                passwordToggle.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}


/* ============================================================
   SAVE / UPDATE TEACHER
============================================================ */

if (teacherForm) {

    teacherForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const firstName =
                firstNameInput.value.trim();

            const lastName =
                lastNameInput.value.trim();

            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value;

            const subjects =
                getSelectedSubjects();

            const classes =
                getSelectedClasses();


            /* ====================================================
               BASIC VALIDATION
            ==================================================== */

            if (!firstName || !lastName) {

                showMessage(
                    "First name and last name are required.",
                    "error"
                );

                return;

            }


            if (!username) {

                showMessage(
                    "Username is required.",
                    "error"
                );

                return;

            }


            /* ====================================================
               PASSWORD VALIDATION
            ==================================================== */

            if (!password) {

                if (editingTeacherId !== null) {

                    showMessage(
                        "Enter the current teacher password to confirm the edit.",
                        "error"
                    );

                } else {

                    showMessage(
                        "Password is required when adding a teacher.",
                        "error"
                    );

                }

                return;

            }


            if (subjects.length === 0) {

                showMessage(
                    "Please select at least one subject.",
                    "error"
                );

                return;

            }


            if (classes.length === 0) {

                showMessage(
                    "Please assign at least one class.",
                    "error"
                );

                return;

            }


            try {

                let data;


                /* =================================================
                   UPDATE EXISTING TEACHER
                   
                   IMPORTANT:
                   The password entered here is the CURRENT
                   password and is sent to Flask for verification.
                   
                   We do NOT send a new password.
                ================================================= */

                if (editingTeacherId !== null) {

                    data =
                        await apiRequest(
                            `/teachers/${editingTeacherId}`,
                            {
                                method: "PUT",

                                body:
                                    JSON.stringify({

                                        first_name:
                                            firstName,

                                        last_name:
                                            lastName,

                                        username:
                                            username,

                                        subjects:
                                            subjects,

                                        classes:
                                            classes,

                                        current_password:
                                            password

                                    })
                            }
                        );

                }


                /* =================================================
                   CREATE NEW TEACHER
                ================================================= */

                else {

                    data =
                        await apiRequest(
                            "/teachers",
                            {
                                method: "POST",

                                body:
                                    JSON.stringify({

                                        first_name:
                                            firstName,

                                        last_name:
                                            lastName,

                                        username:
                                            username,

                                        password:
                                            password,

                                        subjects:
                                            subjects,

                                        classes:
                                            classes

                                    })
                            }
                        );

                }


                if (!data.success) {

                    throw new Error(
                        data.message ||
                        "Teacher could not be saved."
                    );

                }


                showMessage(
                    editingTeacherId !== null
                        ? "Teacher updated successfully."
                        : "Teacher added successfully.",
                    "success"
                );


                resetForm();

                await loadTeachers();


            } catch (error) {

                console.error(
                    "Save teacher error:",
                    error
                );


                showMessage(
                    error.message,
                    "error"
                );

            }

        }
    );

}


/* ============================================================
   EDIT TEACHER
============================================================ */

function editTeacher(id) {

    const teacher =
        teachers.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!teacher) {

        alert("Teacher not found.");

        return;

    }


    editingTeacherId =
        teacher.id;


    formTitle.textContent =
        "Edit Teacher";


    firstNameInput.value =
        teacher.first_name || "";


    lastNameInput.value =
        teacher.last_name || "";


    usernameInput.value =
        teacher.username || "";


    /*
       IMPORTANT:

       Never load the existing password into
       the browser.

       The administrator must manually enter
       the CURRENT password when saving changes.
    */

    passwordInput.value = "";

    passwordInput.placeholder =
        "Enter current password to confirm";


    clearSubjects();

    clearClasses();


    const subjects =
        normalizeSubjects(
            teacher.subjects
        );


    const classes =
        normalizeClasses(
            teacher.classes
        );


    /* ========================================================
       SELECT SUBJECTS
    ======================================================== */

    subjects.forEach(subject => {

        document
            .querySelectorAll(
                'input[name="subjects"]'
            )
            .forEach(checkbox => {

                if (
                    checkbox.value
                        .trim()
                        .toLowerCase() ===
                    subject
                        .trim()
                        .toLowerCase()
                ) {

                    checkbox.checked =
                        true;

                }

            });

    });


    /* ========================================================
       SELECT CLASSES
    ======================================================== */

    classes.forEach(className => {

        document
            .querySelectorAll(
                'input[name="classes"]'
            )
            .forEach(checkbox => {

                if (
                    checkbox.value
                        .trim()
                        .toLowerCase() ===
                    className
                        .trim()
                        .toLowerCase()
                ) {

                    checkbox.checked =
                        true;

                }

            });

    });


    const saveButton =
        teacherForm.querySelector(
            ".save-btn"
        );


    if (saveButton) {

        saveButton.textContent =
            "Update Teacher";

    }


    document
        .getElementById("addTeacher")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    showMessage(
        "Enter the current teacher password to confirm the edit.",
        "info"
    );

}


/* ============================================================
   DELETE TEACHER
============================================================ */

async function deleteTeacher(id) {

    const teacher =
        teachers.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!teacher) {

        return;

    }


    const name =
        `${teacher.first_name || ""} ${teacher.last_name || ""}`
        .trim();


    const confirmed =
        confirm(
            `Delete ${name}?\n\nThis will permanently remove the teacher and their subject/class assignments.`
        );


    if (!confirmed) {

        return;

    }


    try {

        const data =
            await apiRequest(
                `/teachers/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Teacher could not be deleted."
            );

        }


        showMessage(
            "Teacher deleted successfully.",
            "success"
        );


        await loadTeachers();


    } catch (error) {

        console.error(
            "Delete teacher error:",
            error
        );


        showMessage(
            error.message,
            "error"
        );

    }

}


/* ============================================================
   RESET FORM
============================================================ */

function resetForm() {

    if (teacherForm) {

        teacherForm.reset();

    }


    editingTeacherId =
        null;


    formTitle.textContent =
        "Add Teacher";


    if (teacherMessage) {

        teacherMessage.textContent =
            "";

        teacherMessage.className =
            "message";

    }


    if (passwordInput) {

        passwordInput.type =
            "password";

        passwordInput.placeholder =
            "Enter password";

    }


    const saveButton =
        teacherForm
            ? teacherForm.querySelector(".save-btn")
            : null;


    if (saveButton) {

        saveButton.textContent =
            "Save Teacher";

    }


    if (passwordToggle) {

        passwordToggle.textContent =
            "👁";

        passwordToggle.setAttribute(
            "aria-label",
            "Show password"
        );

    }

}


/* ============================================================
   CANCEL
============================================================ */

if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        function() {

            resetForm();

        }
    );

}


/* ============================================================
   MESSAGE
============================================================ */

function showMessage(message, type) {

    if (!teacherMessage) {
        return;
    }

    teacherMessage.textContent =
        message;

    teacherMessage.className =
        "message " + type;

}


/* ============================================================
   HTML ESCAPE
============================================================ */

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ============================================================
   INITIALIZE
============================================================ */

loadTeachers();