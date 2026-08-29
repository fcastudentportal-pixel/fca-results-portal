/* ============================================================
   FCA TEACHERS MANAGEMENT
   SUPABASE VERSION
============================================================ */


/* ============================================================
   SUPABASE CONFIGURATION
============================================================ */

const SUPABASE_URL =
    "https://lapuqrvfyjxgkynikxqa.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_aSAHDuZrc388YBkhtQbw5A_wX2Q01QK";

const TEACHERS_TABLE =
    `${SUPABASE_URL}/rest/v1/teachers`;


/* ============================================================
   STATE
============================================================ */

let teachers = [];
let editingTeacherId = null;


/* ============================================================
   ELEMENTS
============================================================ */

const teacherForm =
    document.getElementById("teacherForm");

const teacherList =
    document.getElementById("teacherList");

const teacherCount =
    document.getElementById("teacherCount");

const subjectCount =
    document.getElementById("subjectCount");

const classCount =
    document.getElementById("classCount");

const teacherMessage =
    document.getElementById("teacherMessage");

const formTitle =
    document.getElementById("formTitle");

const firstNameInput =
    document.getElementById("firstName");

const lastNameInput =
    document.getElementById("lastName");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const cancelBtn =
    document.getElementById("cancelBtn");

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
   SUPABASE REQUEST
============================================================ */

async function supabaseRequest(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                ...options,

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        "application/json",

                    "Prefer":
                        options.method === "POST"
                            ? "return=representation"
                            : "return=representation",

                    ...(options.headers || {})

                }
            }
        );


    const text =
        await response.text();


    let data = null;


    if (text) {

        try {

            data =
                JSON.parse(text);

        } catch {

            data = text;

        }

    }


    if (!response.ok) {

        let message =
            "Supabase request failed.";


        if (
            data &&
            typeof data === "object"
        ) {

            message =
                data.message ||
                data.details ||
                data.hint ||
                data.error ||
                message;

        }


        throw new Error(
            message
        );

    }


    return data;

}


/* ============================================================
   PASSWORD HASH
============================================================ */

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


/* ============================================================
   PASSWORD VERIFY
============================================================ */

async function verifyPassword(
    enteredPassword,
    storedHash
) {

    if (!enteredPassword || !storedHash) {

        return false;

    }


    const enteredHash =
        await hashPassword(
            enteredPassword
        );


    return enteredHash === storedHash;

}


/* ============================================================
   TEACHER NUMBER
============================================================ */

function generateTeacherNumber() {

    const year =
        new Date()
            .getFullYear();


    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `FCA-T-${year}-${random}`;

}


/* ============================================================
   SUBJECTS
============================================================ */

function normalizeSubjects(value) {

    if (!value) {

        return [];

    }


    if (Array.isArray(value)) {

        return value
            .map(
                item =>
                    typeof item === "string"
                        ? item
                        : (
                            item?.name ||
                            item?.subject_name ||
                            item?.subject ||
                            ""
                        )
            )
            .filter(Boolean);

    }


    if (typeof value === "string") {

        try {

            const parsed =
                JSON.parse(value);


            if (Array.isArray(parsed)) {

                return parsed
                    .map(
                        item =>
                            typeof item === "string"
                                ? item
                                : (
                                    item?.name ||
                                    item?.subject_name ||
                                    item?.subject ||
                                    ""
                                )
                    )
                    .filter(Boolean);

            }

        } catch {

            return value
                .trim()
                ? [value.trim()]
                : [];

        }

    }


    return [];

}


/* ============================================================
   CLASSES
============================================================ */

function normalizeClasses(value) {

    if (!value) {

        return [];

    }


    if (Array.isArray(value)) {

        return value
            .map(
                item =>
                    typeof item === "string"
                        ? item
                        : (
                            item?.name ||
                            item?.class_name ||
                            item?.class ||
                            ""
                        )
            )
            .filter(Boolean);

    }


    if (typeof value === "string") {

        try {

            const parsed =
                JSON.parse(value);


            if (Array.isArray(parsed)) {

                return parsed
                    .map(
                        item =>
                            typeof item === "string"
                                ? item
                                : (
                                    item?.name ||
                                    item?.class_name ||
                                    item?.class ||
                                    ""
                                )
                    )
                    .filter(Boolean);

            }

        } catch {

            return value
                .trim()
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

    teacherList.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                T
            </div>

            <strong>
                Loading teachers...
            </strong>

            <p>
                Connecting to Supabase.
            </p>

        </div>

    `;


    try {

        const data =
            await supabaseRequest(
                `${TEACHERS_TABLE}?select=*&order=created_at.desc`,
                {
                    method: "GET"
                }
            );


        teachers =
            Array.isArray(data)
                ? data
                : [];


        displayTeachers();


    } catch (error) {

        console.error(
            "Supabase Teachers Error:",
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


    teachers.forEach(
        teacher => {

            subjectsTotal +=
                normalizeSubjects(
                    teacher.subjects
                ).length;


            classesTotal +=
                normalizeClasses(
                    teacher.classes
                ).length;

        }
    );


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
        teachers
            .map(
                teacher => {

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
                            (teacher.first_name || "")
                                .charAt(0) +

                            (teacher.last_name || "")
                                .charAt(0)
                        )
                            .toUpperCase();


                    return `

                        <div class="teacher-card">

                            <div class="teacher-main">

                                <div class="teacher-avatar">
                                    ${escapeHtml(initials)}
                                </div>


                                <div class="teacher-info">

                                    <div class="teacher-name-row">

                                        <h3>
                                            ${escapeHtml(
                                                fullName ||
                                                teacher.full_name ||
                                                "Unnamed Teacher"
                                            )}
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

                                                    ? subjects
                                                        .map(
                                                            subject => `

                                                                <span
                                                                    class="tag subject-tag"
                                                                >
                                                                    ${escapeHtml(subject)}
                                                                </span>

                                                            `
                                                        )
                                                        .join("")

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

                                                    ? classes
                                                        .map(
                                                            className => `

                                                                <span
                                                                    class="tag class-tag"
                                                                >
                                                                    ${escapeHtml(className)}
                                                                </span>

                                                            `
                                                        )
                                                        .join("")

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
                                    onclick="editTeacher('${teacher.id}')"
                                >
                                    Edit
                                </button>


                                <button
                                    class="delete-btn"
                                    type="button"
                                    onclick="deleteTeacher('${teacher.id}')"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* ============================================================
   SELECTED SUBJECTS
============================================================ */

function getSelectedSubjects() {

    return Array.from(
        document.querySelectorAll(
            'input[name="subjects"]:checked'
        )
    )
        .map(
            checkbox =>
                checkbox.value
        );

}


/* ============================================================
   SELECTED CLASSES
============================================================ */

function getSelectedClasses() {

    return Array.from(
        document.querySelectorAll(
            'input[name="classes"]:checked'
        )
    )
        .map(
            checkbox =>
                checkbox.value
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
        .forEach(
            checkbox => {

                checkbox.checked =
                    true;

            }
        );

}


/* ============================================================
   CLEAR SUBJECTS
============================================================ */

function clearSubjects() {

    document
        .querySelectorAll(
            'input[name="subjects"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );

}


/* ============================================================
   SELECT ALL CLASSES
============================================================ */

function selectAllClasses() {

    document
        .querySelectorAll(
            'input[name="classes"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    true;

            }
        );

}


/* ============================================================
   CLEAR CLASSES
============================================================ */

function clearClasses() {

    document
        .querySelectorAll(
            'input[name="classes"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );

}


/* ============================================================
   BUTTONS
============================================================ */

if (selectAllSubjectsBtn) {

    selectAllSubjectsBtn
        .addEventListener(
            "click",
            selectAllSubjects
        );

}


if (clearSubjectsBtn) {

    clearSubjectsBtn
        .addEventListener(
            "click",
            clearSubjects
        );

}


if (selectAllClassesBtn) {

    selectAllClassesBtn
        .addEventListener(
            "click",
            selectAllClasses
        );

}


if (clearClassesBtn) {

    clearClassesBtn
        .addEventListener(
            "click",
            clearClasses
        );

}


/* ============================================================
   PASSWORD SHOW / HIDE
============================================================ */

if (
    passwordToggle &&
    passwordInput
) {

    passwordToggle
        .addEventListener(
            "click",
            function() {

                if (
                    passwordInput.type ===
                    "password"
                ) {

                    passwordInput.type =
                        "text";

                    passwordToggle.textContent =
                        "🙈";

                } else {

                    passwordInput.type =
                        "password";

                    passwordToggle.textContent =
                        "👁";

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
                usernameInput.value.trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            const subjects =
                getSelectedSubjects();


            const classes =
                getSelectedClasses();


            /* ================================================
               VALIDATION
            ================================================= */

            if (
                !firstName ||
                !lastName
            ) {

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


            if (!password) {

                showMessage(
                    editingTeacherId !== null

                        ? "Enter the current password to confirm the edit."

                        : "Password is required when adding a teacher.",

                    "error"
                );

                return;

            }


            if (
                subjects.length === 0
            ) {

                showMessage(
                    "Please select at least one subject.",
                    "error"
                );

                return;

            }


            if (
                classes.length === 0
            ) {

                showMessage(
                    "Please assign at least one class.",
                    "error"
                );

                return;

            }


            try {

                /* ============================================
                   EDIT
                ============================================ */

                if (
                    editingTeacherId !== null
                ) {

                    const teacher =
                        teachers.find(
                            item =>
                                String(item.id) ===
                                String(editingTeacherId)
                        );


                    if (!teacher) {

                        throw new Error(
                            "Teacher could not be found."
                        );

                    }


                    /*
                       Verify current password
                    */

                    const validPassword =
                        await verifyPassword(
                            password,
                            teacher.password_hash
                        );


                    if (!validPassword) {

                        showMessage(
                            "Incorrect teacher password. The teacher was not updated.",
                            "error"
                        );

                        return;

                    }


                    /*
                       Update details
                    */

                    await supabaseRequest(
                        `${TEACHERS_TABLE}?id=eq.${encodeURIComponent(editingTeacherId)}`,
                        {
                            method: "PATCH",

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

                                    updated_at:
                                        new Date()
                                            .toISOString()

                                })
                        }
                    );


                    showMessage(
                        "Teacher updated successfully.",
                        "success"
                    );

                }


                /* ============================================
                   ADD
                ============================================ */

                else {

                    const passwordHash =
                        await hashPassword(
                            password
                        );


                    const teacherNumber =
                        generateTeacherNumber();


                    await supabaseRequest(
                        TEACHERS_TABLE,
                        {
                            method: "POST",

                            body:
                                JSON.stringify({

                                    first_name:
                                        firstName,

                                    last_name:
                                        lastName,

                                    full_name:
                                        `${firstName} ${lastName}`,

                                    username:
                                        username,

                                    password_hash:
                                        passwordHash,

                                    teacher_number:
                                        teacherNumber,

                                    subjects:
                                        subjects,

                                    classes:
                                        classes

                                })
                        }
                    );


                    showMessage(
                        "Teacher added successfully.",
                        "success"
                    );

                }


                resetForm();

                await loadTeachers();


            } catch (error) {

                console.error(
                    "Teacher save error:",
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
                String(item.id) ===
                String(id)
        );


    if (!teacher) {

        alert(
            "Teacher not found."
        );

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
       NEVER load the password.
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


    subjects.forEach(
        subject => {

            document
                .querySelectorAll(
                    'input[name="subjects"]'
                )
                .forEach(
                    checkbox => {

                        if (
                            checkbox.value
                                .toLowerCase() ===
                            subject
                                .toLowerCase()
                        ) {

                            checkbox.checked =
                                true;

                        }

                    }
                );

        }
    );


    classes.forEach(
        className => {

            document
                .querySelectorAll(
                    'input[name="classes"]'
                )
                .forEach(
                    checkbox => {

                        if (
                            checkbox.value
                                .toLowerCase() ===
                            className
                                .toLowerCase()
                        ) {

                            checkbox.checked =
                                true;

                        }

                    }
                );

        }
    );


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
                String(item.id) ===
                String(id)
        );


    if (!teacher) {

        return;

    }


    const name =
        `${teacher.first_name || ""} ${teacher.last_name || ""}`
            .trim();


    /*
       Ask for password BEFORE deleting.
    */

    const password =
        prompt(
            `Enter the current password for ${name} to confirm deletion:`
        );


    if (password === null) {

        return;

    }


    if (!password) {

        alert(
            "Password is required."
        );

        return;

    }


    try {

        /*
           Verify password
        */

        const validPassword =
            await verifyPassword(
                password,
                teacher.password_hash
            );


        if (!validPassword) {

            alert(
                "Incorrect password. Teacher was NOT deleted."
            );

            return;

        }


        const confirmed =
            confirm(
                `Delete ${name} permanently?\n\nThis action cannot be undone.`
            );


        if (!confirmed) {

            return;

        }


        await supabaseRequest(
            `${TEACHERS_TABLE}?id=eq.${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );


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
            ? teacherForm.querySelector(
                ".save-btn"
            )
            : null;


    if (saveButton) {

        saveButton.textContent =
            "Save Teacher";

    }


    if (passwordToggle) {

        passwordToggle.textContent =
            "👁";

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

function showMessage(
    message,
    type
) {

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

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* ============================================================
   START
============================================================ */

loadTeachers();