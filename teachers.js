/* ============================================================
   FCA TEACHERS MANAGEMENT
   SUPABASE VERSION
   Administrator password required for teacher deletion
============================================================ */


/* ============================================================
   FCA ADMIN
============================================================ */

const FCA_ADMIN_EMAIL =
    "fca.admin@gmail.com";


/* ============================================================
   STATE
============================================================ */

let teachers = [];

let editingTeacherId = null;

let teacherToDeleteId = null;


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
   DELETE MODAL
============================================================ */

const deleteModal =
    document.getElementById("deleteModal");

const deleteTeacherName =
    document.getElementById("deleteTeacherName");

const adminDeletePassword =
    document.getElementById("adminDeletePassword");

const deleteError =
    document.getElementById("deleteError");

const deleteCancelBtn =
    document.getElementById("deleteCancelBtn");

const deleteConfirmBtn =
    document.getElementById("deleteConfirmBtn");

const adminPasswordToggle =
    document.getElementById("adminPasswordToggle");


/* ============================================================
   SUPABASE CLIENT CHECK
============================================================ */

function getSupabaseClient(){

    if(!window.fcaSupabase){

        throw new Error(
            "FCA Supabase client is not available. Check config.js."
        );

    }

    return window.fcaSupabase;

}


/* ============================================================
   ADMIN AUTHORIZATION
============================================================ */

async function checkAdminAuthorization(){

    try{

        const supabase =
            getSupabaseClient();


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


        const email =
            data.session.user.email
                ?.trim()
                .toLowerCase();


        console.log(
            "FCA authenticated management user:",
            email
        );


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
   VERIFY ADMINISTRATOR PASSWORD
============================================================ */

async function verifyAdministratorPassword(
    password
){

    if(!password){

        return false;

    }


    const supabase =
        getSupabaseClient();


    const {
        data: sessionData,
        error: sessionError
    } =
        await supabase
            .auth
            .getSession();


    if(sessionError){

        throw new Error(
            sessionError.message
        );

    }


    if(
        !sessionData ||
        !sessionData.session ||
        !sessionData.session.user
    ){

        throw new Error(
            "Administrator session has expired. Please log in again."
        );

    }


    const currentEmail =
        sessionData.session.user.email
            ?.trim()
            .toLowerCase();


    if(
        currentEmail !==
        FCA_ADMIN_EMAIL
    ){

        throw new Error(
            "Only the FCA administrator can delete teachers."
        );

    }


    /*
       Re-authenticate the administrator.

       This confirms that the person performing
       the deletion knows the administrator password.
    */

    const {
        data,
        error
    } =
        await supabase
            .auth
            .signInWithPassword({

                email:
                    FCA_ADMIN_EMAIL,

                password:
                    password

            });


    if(error){

        return false;

    }


    if(
        !data ||
        !data.user
    ){

        return false;

    }


    const authenticatedEmail =
        data.user.email
            ?.trim()
            .toLowerCase();


    return (
        authenticatedEmail ===
        FCA_ADMIN_EMAIL
    );

}


/* ============================================================
   NORMALIZE SUBJECTS
============================================================ */

function normalizeSubjects(value){

    if(!value){

        return [];

    }


    if(Array.isArray(value)){

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


    if(typeof value === "string"){

        try{

            const parsed =
                JSON.parse(value);


            if(Array.isArray(parsed)){

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

        }

        catch{

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

function normalizeClasses(value){

    if(!value){

        return [];

    }


    if(Array.isArray(value)){

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


    if(typeof value === "string"){

        try{

            const parsed =
                JSON.parse(value);


            if(Array.isArray(parsed)){

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

        }

        catch{

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

async function loadTeachers(){

    if(!teacherList){

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
                Connecting to FCA database.
            </p>

        </div>

    `;


    try{

        const supabase =
            getSupabaseClient();


        const {
            data,
            error
        } =
            await supabase
                .from("teachers")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if(error){

            console.error(
                "FCA Teachers database error:",
                error
            );

            throw new Error(
                error.message
            );

        }


        teachers =
            Array.isArray(data)
                ? data
                : [];


        displayTeachers();


    }

    catch(error){

        console.error(
            "FCA Teachers Error:",
            error
        );


        teacherList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <strong>
                    Unable to load teachers
                </strong>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Unknown database error."
                    )}
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

function displayTeachers(){

    if(teacherCount){

        teacherCount.textContent =
            teachers.length;

    }


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


    if(subjectCount){

        subjectCount.textContent =
            subjectsTotal;

    }


    if(classCount){

        classCount.textContent =
            classesTotal;

    }


    if(!teacherList){

        return;

    }


    if(teachers.length === 0){

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
                                                                ${escapeHtml(
                                                                    subject
                                                                )}
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
                                                                ${escapeHtml(
                                                                    className
                                                                )}
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
                                    onclick="editTeacher('${escapeHtml(teacher.id)}')"
                                >
                                    Edit
                                </button>


                                <button
                                    class="delete-btn"
                                    type="button"
                                    onclick="deleteTeacher('${escapeHtml(teacher.id)}')"
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

function getSelectedSubjects(){

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

function getSelectedClasses(){

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

function selectAllSubjects(){

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

function clearSubjects(){

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

function selectAllClasses(){

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

function clearClasses(){

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
   SELECTION BUTTONS
============================================================ */

if(selectAllSubjectsBtn){

    selectAllSubjectsBtn
        .addEventListener(
            "click",
            selectAllSubjects
        );

}


if(clearSubjectsBtn){

    clearSubjectsBtn
        .addEventListener(
            "click",
            clearSubjects
        );

}


if(selectAllClassesBtn){

    selectAllClassesBtn
        .addEventListener(
            "click",
            selectAllClasses
        );

}


if(clearClassesBtn){

    clearClassesBtn
        .addEventListener(
            "click",
            clearClasses
        );

}


/* ============================================================
   PASSWORD SHOW / HIDE
============================================================ */

if(
    passwordToggle &&
    passwordInput
){

    passwordToggle
        .addEventListener(
            "click",
            function(){

                if(
                    passwordInput.type ===
                    "password"
                ){

                    passwordInput.type =
                        "text";

                    passwordToggle.textContent =
                        "🙈";

                }

                else{

                    passwordInput.type =
                        "password";

                    passwordToggle.textContent =
                        "👁";

                }

            }
        );

}


/* ============================================================
   GENERATE TEACHER NUMBER
============================================================ */

function generateTeacherNumber(){

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
   HASH TEACHER PASSWORD
============================================================ */

async function hashPassword(password){

    const encoder =
        new TextEncoder();


    const data =
        encoder.encode(
            password
        );


    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );


    const hashArray =
        Array.from(
            new Uint8Array(
                hashBuffer
            )
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
   VERIFY TEACHER PASSWORD
============================================================ */

async function verifyPassword(
    enteredPassword,
    storedHash
){

    if(
        !enteredPassword ||
        !storedHash
    ){

        return false;

    }


    const enteredHash =
        await hashPassword(
            enteredPassword
        );


    return enteredHash ===
        storedHash;

}


/* ============================================================
   SAVE / UPDATE TEACHER
============================================================ */

if(teacherForm){

    teacherForm.addEventListener(
        "submit",
        async function(event){

            event.preventDefault();


            const firstName =
                firstNameInput.value.trim();


            const lastName =
                lastNameInput.value.trim();


            const username =
                usernameInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            const subjects =
                getSelectedSubjects();


            const classes =
                getSelectedClasses();


            if(
                !firstName ||
                !lastName
            ){

                showMessage(
                    "First name and last name are required.",
                    "error"
                );

                return;

            }


            if(!username){

                showMessage(
                    "Username is required.",
                    "error"
                );

                return;

            }


            if(!password){

                showMessage(
                    editingTeacherId !== null
                        ? "Enter the current teacher password to confirm the edit."
                        : "Password is required when adding a teacher.",
                    "error"
                );

                return;

            }


            if(subjects.length === 0){

                showMessage(
                    "Please select at least one subject.",
                    "error"
                );

                return;

            }


            if(classes.length === 0){

                showMessage(
                    "Please assign at least one class.",
                    "error"
                );

                return;

            }


            try{

                const supabase =
                    getSupabaseClient();


                /* ========================================
                   EDIT TEACHER
                ======================================== */

                if(
                    editingTeacherId !== null
                ){

                    const teacher =
                        teachers.find(
                            item =>
                                String(item.id) ===
                                String(editingTeacherId)
                        );


                    if(!teacher){

                        throw new Error(
                            "Teacher could not be found."
                        );

                    }


                    const validPassword =
                        await verifyPassword(
                            password,
                            teacher.password_hash
                        );


                    if(!validPassword){

                        showMessage(
                            "Incorrect teacher password. The teacher was not updated.",
                            "error"
                        );

                        return;

                    }


                    const {
                        error
                    } =
                        await supabase
                            .from("teachers")
                            .update({

                                first_name:
                                    firstName,

                                last_name:
                                    lastName,

                                full_name:
                                    `${firstName} ${lastName}`,

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
                            .eq(
                                "id",
                                editingTeacherId
                            );


                    if(error){

                        throw new Error(
                            error.message
                        );

                    }


                    showMessage(
                        "Teacher updated successfully.",
                        "success"
                    );

                }


                /* ========================================
                   ADD TEACHER
                ======================================== */

                else{

                    const passwordHash =
                        await hashPassword(
                            password
                        );


                    const teacherNumber =
                        generateTeacherNumber();


                    const {
                        error
                    } =
                        await supabase
                            .from("teachers")
                            .insert({

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

                            });


                    if(error){

                        throw new Error(
                            error.message
                        );

                    }


                    showMessage(
                        "Teacher added successfully.",
                        "success"
                    );

                }


                resetForm();

                await loadTeachers();

            }

            catch(error){

                console.error(
                    "FCA Teacher save error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to save teacher.",
                    "error"
                );

            }

        }
    );

}


/* ============================================================
   EDIT TEACHER
============================================================ */

function editTeacher(id){

    const teacher =
        teachers.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if(!teacher){

        alert(
            "Teacher not found."
        );

        return;

    }


    editingTeacherId =
        teacher.id;


    if(formTitle){

        formTitle.textContent =
            "Edit Teacher";

    }


    if(firstNameInput){

        firstNameInput.value =
            teacher.first_name || "";

    }


    if(lastNameInput){

        lastNameInput.value =
            teacher.last_name || "";

    }


    if(usernameInput){

        usernameInput.value =
            teacher.username || "";

    }


    if(passwordInput){

        passwordInput.value = "";

        passwordInput.placeholder =
            "Enter current password to confirm";

    }


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

                        if(
                            checkbox.value
                                .toLowerCase() ===
                            subject
                                .toLowerCase()
                        ){

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

                        if(
                            checkbox.value
                                .toLowerCase() ===
                            className
                                .toLowerCase()
                        ){

                            checkbox.checked =
                                true;

                        }

                    }
                );

        }
    );


    const saveButton =
        teacherForm
            ? teacherForm.querySelector(
                ".save-btn"
            )
            : null;


    if(saveButton){

        saveButton.textContent =
            "Update Teacher";

    }


    const addTeacherSection =
        document.getElementById(
            "addTeacher"
        );


    if(addTeacherSection){

        addTeacherSection
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }


    showMessage(
        "Enter the current teacher password to confirm the edit.",
        "info"
    );

}


/* ============================================================
   OPEN DELETE MODAL
============================================================ */

function deleteTeacher(id){

    const teacher =
        teachers.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if(!teacher){

        alert(
            "Teacher could not be found."
        );

        return;

    }


    if(!deleteModal){

        console.error(
            "Delete modal was not found."
        );

        return;

    }


    teacherToDeleteId =
        teacher.id;


    const name =
        `${teacher.first_name || ""} ${teacher.last_name || ""}`
            .trim();


    if(deleteTeacherName){

        deleteTeacherName.textContent =
            name
                ? `Delete ${name}?`
                : "Delete this teacher?";

    }


    if(adminDeletePassword){

        adminDeletePassword.value = "";

        adminDeletePassword.type =
            "password";

    }


    if(deleteError){

        deleteError.textContent =
            "";

    }


    if(deleteConfirmBtn){

        deleteConfirmBtn.disabled =
            false;

        deleteConfirmBtn.textContent =
            "Delete Teacher";

    }


    deleteModal.classList.add(
        "show"
    );


    setTimeout(
        function(){

            if(adminDeletePassword){

                adminDeletePassword.focus();

            }

        },
        100
    );

}


/* ============================================================
   CLOSE DELETE MODAL
============================================================ */

function closeDeleteModal(){

    if(!deleteModal){

        return;

    }


    deleteModal.classList.remove(
        "show"
    );


    teacherToDeleteId =
        null;


    if(adminDeletePassword){

        adminDeletePassword.value = "";

        adminDeletePassword.type =
            "password";

    }


    if(deleteError){

        deleteError.textContent =
            "";

    }


    if(deleteConfirmBtn){

        deleteConfirmBtn.disabled =
            false;

        deleteConfirmBtn.textContent =
            "Delete Teacher";

    }

}


/* ============================================================
   CANCEL DELETE
============================================================ */

if(deleteCancelBtn){

    deleteCancelBtn.addEventListener(
        "click",
        closeDeleteModal
    );

}


/* ============================================================
   ADMIN PASSWORD SHOW / HIDE
============================================================ */

if(
    adminPasswordToggle &&
    adminDeletePassword
){

    adminPasswordToggle
        .addEventListener(
            "click",
            function(){

                if(
                    adminDeletePassword.type ===
                    "password"
                ){

                    adminDeletePassword.type =
                        "text";

                    adminPasswordToggle.textContent =
                        "🙈";

                }

                else{

                    adminDeletePassword.type =
                        "password";

                    adminPasswordToggle.textContent =
                        "👁";

                }

            }
        );

}


/* ============================================================
   CONFIRM DELETE
============================================================ */

if(deleteConfirmBtn){

    deleteConfirmBtn.addEventListener(
        "click",
        async function(){

            if(
                teacherToDeleteId ===
                null
            ){

                closeDeleteModal();

                return;

            }


            try{

                deleteConfirmBtn.disabled =
                    true;

                deleteConfirmBtn.textContent =
                    "Verifying...";


                if(deleteError){

                    deleteError.textContent =
                        "";

                }


                /* ========================================
                   REQUIRE ADMIN PASSWORD
                ======================================== */

                const password =
                    adminDeletePassword
                        ? adminDeletePassword.value
                        : "";


                if(!password){

                    if(deleteError){

                        deleteError.textContent =
                            "Administrator password is required.";

                    }

                    return;

                }


                const validAdmin =
                    await verifyAdministratorPassword(
                        password
                    );


                if(!validAdmin){

                    if(deleteError){

                        deleteError.textContent =
                            "Incorrect administrator password. Teacher was not deleted.";

                    }

                    return;

                }


                /* ========================================
                   DELETE TEACHER
                ======================================== */

                deleteConfirmBtn.textContent =
                    "Deleting...";


                const supabase =
                    getSupabaseClient();


                const {
                    data: deletedRows,
                    error
                } =
                    await supabase
                        .from("teachers")
                        .delete()
                        .eq(
                            "id",
                            teacherToDeleteId
                        )
                        .select("id");


                if(error){

                    throw new Error(
                        error.message
                    );

                }


                /*
                   Supabase must return the deleted row.

                   If zero rows are returned, the delete
                   was blocked by RLS or the teacher no
                   longer exists.
                */

                if(
                    !Array.isArray(deletedRows) ||
                    deletedRows.length === 0
                ){

                    throw new Error(
                        "Teacher was NOT deleted from Supabase. Please check the teachers table DELETE RLS policy."
                    );

                }


                /* ========================================
                   GET TEACHER NAME
                ======================================== */

                const deletedTeacher =
                    teachers.find(
                        item =>
                            String(item.id) ===
                            String(teacherToDeleteId)
                    );


                const name =
                    deletedTeacher
                        ? `${deletedTeacher.first_name || ""} ${deletedTeacher.last_name || ""}`.trim()
                        : "Teacher";


                /* ========================================
                   VERIFY PERMANENT DELETION
                ======================================== */

                const {
                    data: remainingTeacher,
                    error: verifyError
                } =
                    await supabase
                        .from("teachers")
                        .select("id")
                        .eq(
                            "id",
                            teacherToDeleteId
                        )
                        .maybeSingle();


                if(verifyError){

                    throw new Error(
                        verifyError.message
                    );

                }


                if(remainingTeacher){

                    throw new Error(
                        "The teacher still exists in Supabase. The deletion could not be completed."
                    );

                }


                /* ========================================
                   UPDATE LOCAL LIST
                ======================================== */

                teachers =
                    teachers.filter(
                        item =>
                            String(item.id) !==
                            String(teacherToDeleteId)
                    );


                closeDeleteModal();


                displayTeachers();


                showMessage(
                    `${name || "Teacher"} deleted successfully.`,
                    "success"
                );


                await loadTeachers();

            }

            catch(error){

                console.error(
                    "FCA teacher delete error:",
                    error
                );


                if(deleteError){

                    deleteError.textContent =
                        error.message ||
                        "Unable to delete teacher.";

                }

            }

            finally{

                if(deleteConfirmBtn){

                    deleteConfirmBtn.disabled =
                        false;

                    deleteConfirmBtn.textContent =
                        "Delete Teacher";

                }

            }

        }
    );

}


/* ============================================================
   ENTER / ESCAPE SUPPORT
============================================================ */

if(adminDeletePassword){

    adminDeletePassword.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                event.preventDefault();


                if(deleteConfirmBtn){

                    deleteConfirmBtn.click();

                }

            }


            if(
                event.key ===
                "Escape"
            ){

                event.preventDefault();

                closeDeleteModal();

            }

        }
    );

}


/* ============================================================
   CLICK OUTSIDE MODAL
============================================================ */

if(deleteModal){

    deleteModal.addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                deleteModal
            ){

                closeDeleteModal();

            }

        }
    );

}


/* ============================================================
   RESET FORM
============================================================ */

function resetForm(){

    if(teacherForm){

        teacherForm.reset();

    }


    editingTeacherId =
        null;


    if(formTitle){

        formTitle.textContent =
            "Add Teacher";

    }


    if(teacherMessage){

        teacherMessage.textContent =
            "";

        teacherMessage.className =
            "message";

    }


    if(passwordInput){

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


    if(saveButton){

        saveButton.textContent =
            "Save Teacher";

    }


    if(passwordToggle){

        passwordToggle.textContent =
            "👁";

    }

}


/* ============================================================
   CANCEL FORM
============================================================ */

if(cancelBtn){

    cancelBtn.addEventListener(
        "click",
        function(){

            resetForm();

        }
    );

}


/* ============================================================
   MESSAGE
============================================================ */

function showMessage(
    message,
    type = "info"
){

    if(!teacherMessage){

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

function escapeHtml(value){

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
   SUPABASE AUTH STATE
============================================================ */

if(window.fcaSupabase){

    window.fcaSupabase
        .auth
        .onAuthStateChange(
            function(event, session){

                console.log(
                    "FCA Teachers Auth Event:",
                    event
                );


                if(
                    event === "SIGNED_OUT" ||
                    !session
                ){

                    window.location.replace(
                        "admin-login.html"
                    );

                }

            }
        );

}


/* ============================================================
   INITIALIZE
============================================================ */

async function initializeTeachersPage(){

    console.log(
        "FCA Teachers page initializing..."
    );


    const authorized =
        await checkAdminAuthorization();


    if(!authorized){

        return;

    }


    await loadTeachers();

}


/* ============================================================
   START
============================================================ */

initializeTeachersPage();