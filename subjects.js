"use strict";


/* =========================================================
   FIRST CLASS ACADEMY
   SUBJECTS MANAGEMENT

   JUNIOR:
   FORMS 1 & 2

   SENIOR:
   FORMS 3 & 4
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const FCA_ADMIN_EMAIL =
    "fca.admin@gmail.com";


/* =========================================================
   FCA SUBJECT EXAMINATION STRUCTURE
========================================================= */

const FCA_SUBJECTS = {

    English: {

        code: "ENG",

        junior: [

            {
                paper: "Paper I",
                marks: 50
            },

            {
                paper: "Paper II",
                marks: 50
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 70
            },

            {
                paper: "Paper II",
                marks: 60
            },

            {
                paper: "Paper III",
                marks: 70
            }

        ]

    },


    Chichewa: {

        code: "CHI",

        junior: [

            {
                paper: "Paper I",
                marks: 50
            },

            {
                paper: "Paper II",
                marks: 50
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 70
            },

            {
                paper: "Paper II",
                marks: 60
            },

            {
                paper: "Paper III",
                marks: 70
            }

        ]

    },


    Mathematics: {

        code: "MATH",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 100
            },

            {
                paper: "Paper II",
                marks: 100
            }

        ]

    },


    Geography: {

        code: "GEO",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 100
            },

            {
                paper: "Paper II",
                marks: 100
            }

        ]

    },


    Biology: {

        code: "BIO",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 100
            },

            {
                paper: "Paper II",
                marks: 40
            }

        ]

    },


    Agriculture: {

        code: "AGRI",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 100
            },

            {
                paper: "Paper II",
                marks: 40
            }

        ]

    },


    Chemistry: {

        code: "CHEM",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 100
            },

            {
                paper: "Paper II",
                marks: 40
            }

        ]

    },


    Physics: {

        code: "PHY",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 100
            },

            {
                paper: "Paper II",
                marks: 40
            }

        ]

    },


    History: {

        code: "HIST",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 50
            },

            {
                paper: "Paper II",
                marks: 120
            }

        ]

    },


    "Bible Knowledge": {

        code: "BK",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 50
            },

            {
                paper: "Paper II",
                marks: 120
            }

        ]

    },


    "Social Studies": {

        code: "SOC",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 50
            },

            {
                paper: "Paper II",
                marks: 100
            }

        ]

    },


    "Life Skills": {

        code: "LIFE",

        junior: [

            {
                paper: "Paper I",
                marks: 100
            }

        ],

        senior: [

            {
                paper: "Paper I",
                marks: 50
            },

            {
                paper: "Paper II",
                marks: 100
            }

        ]

    }

};


/* =========================================================
   VARIABLES
========================================================= */

let db = null;

let subjects = [];

let editingSubjectId = null;

let subjectToDeleteId = null;


/* =========================================================
   DOM ELEMENTS
========================================================= */

let addSubjectBtn;

let subjectFormPanel;

let subjectForm;

let formTitle;

let subjectName;

let subjectCode;

let cancelBtn;

let saveSubjectBtn;

let subjectMessage;

let juniorSubjects;

let seniorSubjects;

let subjectCount;

let juniorSubjectCount;

let seniorSubjectCount;

let databaseStatus;

let deleteModal;

let deleteSubjectName;

let adminDeletePassword;

let adminPasswordToggle;

let adminEyeOpen;

let adminEyeClosed;

let deleteError;

let deleteCancelBtn;

let deleteConfirmBtn;

let closeDeleteModalBtn;


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeSubjectsPage
);


/* =========================================================
   CACHE ELEMENTS
========================================================= */

function cacheElements() {

    addSubjectBtn =
        document.getElementById(
            "addSubjectBtn"
        );


    subjectFormPanel =
        document.getElementById(
            "subjectFormPanel"
        );


    subjectForm =
        document.getElementById(
            "subjectForm"
        );


    formTitle =
        document.getElementById(
            "formTitle"
        );


    subjectName =
        document.getElementById(
            "subjectName"
        );


    subjectCode =
        document.getElementById(
            "subjectCode"
        );


    cancelBtn =
        document.getElementById(
            "cancelBtn"
        );


    saveSubjectBtn =
        document.getElementById(
            "saveSubjectBtn"
        );


    subjectMessage =
        document.getElementById(
            "subjectMessage"
        );


    juniorSubjects =
        document.getElementById(
            "juniorSubjects"
        );


    seniorSubjects =
        document.getElementById(
            "seniorSubjects"
        );


    subjectCount =
        document.getElementById(
            "subjectCount"
        );


    juniorSubjectCount =
        document.getElementById(
            "juniorSubjectCount"
        );


    seniorSubjectCount =
        document.getElementById(
            "seniorSubjectCount"
        );


    databaseStatus =
        document.getElementById(
            "databaseStatus"
        );


    deleteModal =
        document.getElementById(
            "deleteModal"
        );


    deleteSubjectName =
        document.getElementById(
            "deleteSubjectName"
        );


    adminDeletePassword =
        document.getElementById(
            "adminDeletePassword"
        );


    adminPasswordToggle =
        document.getElementById(
            "adminPasswordToggle"
        );


    adminEyeOpen =
        document.getElementById(
            "adminEyeOpen"
        );


    adminEyeClosed =
        document.getElementById(
            "adminEyeClosed"
        );


    deleteError =
        document.getElementById(
            "deleteError"
        );


    deleteCancelBtn =
        document.getElementById(
            "deleteCancelBtn"
        );


    deleteConfirmBtn =
        document.getElementById(
            "deleteConfirmBtn"
        );


    closeDeleteModalBtn =
        document.getElementById(
            "closeDeleteModalBtn"
        );

}


/* =========================================================
   SUPABASE
========================================================= */

function getSupabaseClient() {

    if (window.fcaSupabase) {

        return window.fcaSupabase;

    }

    return null;

}


/* =========================================================
   AUTHORIZATION
========================================================= */

async function checkAdminAuthorization() {

    const {
        data,
        error
    } = await db.auth.getSession();


    if (error) {

        throw error;

    }


    const session =
        data?.session;


    if (!session) {

        window.location.href =
            "index.html";

        return false;

    }


    const email =
        String(
            session.user.email || ""
        )
        .trim()
        .toLowerCase();


    if (
        email !==
        FCA_ADMIN_EMAIL.toLowerCase()
    ) {

        alert(
            "You are not authorized to access the FCA administration portal."
        );


        await db.auth.signOut();


        window.location.href =
            "index.html";


        return false;

    }


    return true;

}


/* =========================================================
   DATABASE STATUS
========================================================= */

function setDatabaseStatus(
    message,
    type = ""
) {

    databaseStatus.textContent =
        message;


    databaseStatus.classList.remove(
        "connected",
        "error"
    );


    if (type) {

        databaseStatus.classList.add(
            type
        );

    }

}


/* =========================================================
   HIDE FORM
========================================================= */

function hideSubjectForm() {

    if (!subjectFormPanel) return;


    subjectFormPanel.style.setProperty(
        "display",
        "none",
        "important"
    );


    subjectFormPanel.classList.remove(
        "active",
        "show"
    );

}


/* =========================================================
   SHOW FORM
========================================================= */

function showSubjectForm(
    mode = "add"
) {

    if (!subjectFormPanel) return;


    subjectFormPanel.style.setProperty(
        "display",
        "block",
        "important"
    );


    subjectFormPanel.classList.add(
        "active",
        "show"
    );


    if (mode === "add") {

        formTitle.textContent =
            "Add Subject";


        saveSubjectBtn.textContent =
            "Save Subject";

    } else {

        formTitle.textContent =
            "Edit Subject";


        saveSubjectBtn.textContent =
            "Update Subject";

    }


    requestAnimationFrame(
        function () {

            subjectFormPanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}


/* =========================================================
   PREPARE ADD
========================================================= */

function prepareAddForm() {

    editingSubjectId = null;


    subjectForm.reset();


    clearSubjectMessage();


    formTitle.textContent =
        "Add Subject";


    saveSubjectBtn.textContent =
        "Save Subject";


    showSubjectForm("add");


    setTimeout(
        function () {

            subjectName.focus();

        },
        250
    );

}


/* =========================================================
   EDIT SUBJECT
========================================================= */

function editSubject(id) {

    const subject =
        subjects.find(
            function (item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!subject) {

        alert(
            "Subject could not be found."
        );

        return;

    }


    editingSubjectId =
        subject.id;


    subjectName.value =
        subject.name || "";


    subjectCode.value =
        subject.code || "";


    clearSubjectMessage();


    showSubjectForm("edit");


    setTimeout(
        function () {

            subjectName.focus();

        },
        250
    );

}


/* =========================================================
   RESET FORM
========================================================= */

function resetSubjectForm() {

    editingSubjectId = null;


    if (subjectForm) {

        subjectForm.reset();

    }


    clearSubjectMessage();


    formTitle.textContent =
        "Add Subject";


    saveSubjectBtn.textContent =
        "Save Subject";

}


/* =========================================================
   CANCEL
========================================================= */

function cancelSubjectForm() {

    resetSubjectForm();

    hideSubjectForm();

}


/* =========================================================
   LOAD SUBJECTS
========================================================= */

async function loadSubjects() {

    setDatabaseStatus(
        "Loading subjects..."
    );


    const {
        data,
        error
    } = await db
        .from("subjects")
        .select("*")
        .order(
            "name",
            {
                ascending: true
            }
        );


    if (error) {

        throw error;

    }


    subjects =
        Array.isArray(data)
            ? data
            : [];


    /*
       If the database is empty, use the FCA
       standard subject list for display.
    */

    if (!subjects.length) {

        subjects =
            Object.keys(
                FCA_SUBJECTS
            ).map(
                function (name, index) {

                    const config =
                        FCA_SUBJECTS[name];


                    return {

                        id:
                            `default-${index}`,

                        name:
                            name,

                        code:
                            config.code,

                        is_default:
                            true

                    };

                }
            );

    }


    renderSubjects();

    updateStatistics();


    setDatabaseStatus(
        "Database connected",
        "connected"
    );

}


/* =========================================================
   RENDER ALL SUBJECTS
========================================================= */

function renderSubjects() {

    juniorSubjects.innerHTML = "";

    seniorSubjects.innerHTML = "";


    subjects.forEach(
        function (subject) {

            const config =
                getSubjectConfig(
                    subject.name
                );


            if (!config) {

                return;

            }


            juniorSubjects.appendChild(
                createSubjectCard(
                    subject,
                    "junior"
                )
            );


            seniorSubjects.appendChild(
                createSubjectCard(
                    subject,
                    "senior"
                )
            );

        }
    );

}


/* =========================================================
   FIND SUBJECT CONFIG
========================================================= */

function getSubjectConfig(name) {

    if (!name) return null;


    if (
        FCA_SUBJECTS[name]
    ) {

        return FCA_SUBJECTS[name];

    }


    const key =
        Object.keys(
            FCA_SUBJECTS
        ).find(
            function (subjectName) {

                return subjectName
                    .toLowerCase() ===
                    String(name)
                        .toLowerCase();

            }
        );


    return key
        ? FCA_SUBJECTS[key]
        : null;

}


/* =========================================================
   CREATE SUBJECT CARD
========================================================= */

function createSubjectCard(
    subject,
    section
) {

    const config =
        getSubjectConfig(
            subject.name
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "subject-card";


    const papers =
        section === "junior"
            ? config.junior
            : config.senior;


    const totalMarks =
        papers.reduce(
            function (total, paper) {

                return total +
                    paper.marks;

            },
            0
        );


    const forms =
        section === "junior"
            ? "Forms 1–2"
            : "Forms 3–4";


    const initial =
        escapeHtml(
            String(
                subject.name || "S"
            )
            .trim()
            .charAt(0)
            .toUpperCase()
        );


    card.innerHTML = `

        <div class="subject-card-header">

            <div class="subject-icon">
                ${initial}
            </div>

            <span class="subject-code">
                ${escapeHtml(
                    subject.code ||
                    config.code
                )}
            </span>

        </div>


        <h3 class="subject-name">

            ${escapeHtml(
                subject.name
            )}

        </h3>


        <p class="subject-forms">

            ${forms}

        </p>


        <div class="paper-heading">

            <span>
                Examination Papers
            </span>

            <span class="total-marks">
                ${papers.length}
                ${papers.length === 1
                    ? "Paper"
                    : "Papers"}
            </span>

        </div>


        <div class="paper-list">

            ${papers.map(
                function (paper) {

                    return `

                        <div class="paper-row">

                            <span class="paper-name">
                                ${escapeHtml(
                                    paper.paper
                                )}
                            </span>

                            <span class="paper-marks">
                                ${paper.marks} marks
                            </span>

                        </div>

                    `;

                }
            ).join("")}

        </div>


        <div class="subject-total">

            <span>
                Total Maximum Marks
            </span>

            <strong>
                ${totalMarks}
            </strong>

        </div>


        ${
            subject.is_default
                ? ""
                : `

                <div class="subject-actions">

                    <button
                        type="button"
                        class="edit-subject-btn"
                        data-action="edit"
                        data-id="${escapeHtml(
                            subject.id
                        )}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="delete-subject-btn"
                        data-action="delete"
                        data-id="${escapeHtml(
                            subject.id
                        )}"
                    >
                        Delete
                    </button>

                </div>

            `
        }

    `;


    return card;

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        Object.keys(
            FCA_SUBJECTS
        ).length;


    subjectCount.textContent =
        total;


    juniorSubjectCount.textContent =
        total;


    seniorSubjectCount.textContent =
        total;

}


/* =========================================================
   SAVE SUBJECT
========================================================= */

async function saveSubject(
    event
) {

    event.preventDefault();


    const name =
        subjectName.value.trim();


    const code =
        subjectCode.value
            .trim()
            .toUpperCase();


    if (!name) {

        showSubjectMessage(
            "Please enter the subject name.",
            "error"
        );

        return;

    }


    if (!code) {

        showSubjectMessage(
            "Please enter the subject code.",
            "error"
        );

        return;

    }


    const config =
        getSubjectConfig(name);


    if (!config) {

        showSubjectMessage(
            "This subject is not part of the FCA standard subject list.",
            "error"
        );

        return;

    }


    /*
       Prevent duplicates.
    */

    const duplicate =
        subjects.find(
            function (subject) {

                return (
                    String(
                        subject.name || ""
                    )
                    .trim()
                    .toLowerCase() ===
                    name.toLowerCase()
                )
                &&
                (
                    !editingSubjectId ||
                    String(subject.id) !==
                    String(editingSubjectId)
                );

            }
        );


    if (duplicate) {

        showSubjectMessage(
            "This subject already exists.",
            "error"
        );

        return;

    }


    saveSubjectBtn.disabled =
        true;


    saveSubjectBtn.textContent =
        editingSubjectId
            ? "Updating..."
            : "Saving...";


    try {

        const payload = {

            name:
                name,

            code:
                code

        };


        let result;


        /*
           If this is an existing database record,
           update it.
        */

        if (
            editingSubjectId &&
            !String(
                editingSubjectId
            ).startsWith("default-")
        ) {

            result =
                await db
                    .from("subjects")
                    .update(payload)
                    .eq(
                        "id",
                        editingSubjectId
                    );


        } else {

            result =
                await db
                    .from("subjects")
                    .insert(payload);

        }


        if (result.error) {

            throw result.error;

        }


        resetSubjectForm();

        hideSubjectForm();

        await loadSubjects();


    } catch (error) {

        console.error(
            "FCA Subjects save error:",
            error
        );


        showSubjectMessage(
            getFriendlyError(error),
            "error"
        );


    } finally {

        saveSubjectBtn.disabled =
            false;


        saveSubjectBtn.textContent =
            editingSubjectId
                ? "Update Subject"
                : "Save Subject";

    }

}


/* =========================================================
   DELETE SUBJECT
========================================================= */

function deleteSubject(id) {

    const subject =
        subjects.find(
            function (item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!subject) return;


    subjectToDeleteId =
        subject.id;


    deleteSubjectName.textContent =
        subject.name;


    adminDeletePassword.value =
        "";


    clearDeleteError();


    deleteModal.classList.add(
        "show"
    );


    deleteModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteModal() {

    subjectToDeleteId =
        null;


    deleteModal.classList.remove(
        "show"
    );


    deleteModal.setAttribute(
        "aria-hidden",
        "true"
    );


    adminDeletePassword.value =
        "";


    clearDeleteError();

}


/* =========================================================
   VERIFY ADMIN PASSWORD
========================================================= */

async function verifyAdministratorPassword(
    password
) {

    const {
        data,
        error
    } = await db.auth.getUser();


    if (error || !data?.user) {

        throw new Error(
            "Administrator session could not be verified."
        );

    }


    const email =
        String(
            data.user.email || ""
        )
        .trim()
        .toLowerCase();


    if (
        email !==
        FCA_ADMIN_EMAIL.toLowerCase()
    ) {

        throw new Error(
            "You are not authorized to perform this action."
        );

    }


    const {
        error: signInError
    } =
        await db.auth.signInWithPassword({

            email:
                data.user.email,

            password:
                password

        });


    if (signInError) {

        throw new Error(
            "Incorrect administrator password."
        );

    }


    return true;

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

async function confirmDeleteSubject() {

    if (!subjectToDeleteId) {

        return;

    }


    const password =
        adminDeletePassword.value.trim();


    if (!password) {

        showDeleteError(
            "Please enter the administrator password."
        );

        return;

    }


    deleteConfirmBtn.disabled =
        true;


    deleteConfirmBtn.textContent =
        "Deleting...";


    try {

        await verifyAdministratorPassword(
            password
        );


        const {
            error
        } =
            await db
                .from("subjects")
                .delete()
                .eq(
                    "id",
                    subjectToDeleteId
                );


        if (error) {

            throw error;

        }


        closeDeleteModal();


        await loadSubjects();


    } catch (error) {

        console.error(
            "FCA Subjects delete error:",
            error
        );


        showDeleteError(
            getFriendlyError(error)
        );


    } finally {

        deleteConfirmBtn.disabled =
            false;


        deleteConfirmBtn.textContent =
            "Delete Subject";

    }

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function toggleAdminDeletePassword() {

    const showing =
        adminDeletePassword.type ===
        "text";


    adminDeletePassword.type =
        showing
            ? "password"
            : "text";


    adminEyeOpen.style.display =
        showing
            ? "none"
            : "block";


    adminEyeClosed.style.display =
        showing
            ? "block"
            : "none";


    adminPasswordToggle.setAttribute(
        "aria-label",
        showing
            ? "Show password"
            : "Hide password"
    );

}


/* =========================================================
   MESSAGES
========================================================= */

function showSubjectMessage(
    message,
    type
) {

    subjectMessage.textContent =
        message;


    subjectMessage.className =
        `form-message ${type}`;


    subjectMessage.style.display =
        "block";

}


function clearSubjectMessage() {

    subjectMessage.textContent =
        "";


    subjectMessage.style.display =
        "none";


    subjectMessage.className =
        "form-message";

}


function showDeleteError(
    message
) {

    deleteError.textContent =
        message;


    deleteError.style.display =
        "block";

}


function clearDeleteError() {

    deleteError.textContent =
        "";


    deleteError.style.display =
        "none";

}


/* =========================================================
   FRIENDLY ERROR
========================================================= */

function getFriendlyError(
    error
) {

    const message =
        String(
            error?.message ||
            error?.details ||
            error ||
            "An unexpected error occurred."
        );


    if (
        message
            .toLowerCase()
            .includes(
                "duplicate"
            )
    ) {

        return "This subject already exists.";

    }


    if (
        message
            .toLowerCase()
            .includes(
                "row-level security"
            )
    ) {

        return "Database security rules blocked this action.";

    }


    return message;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
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


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {


    /* ADD */

    addSubjectBtn.addEventListener(
        "click",
        prepareAddForm
    );


    /* SUBMIT */

    subjectForm.addEventListener(
        "submit",
        saveSubject
    );


    /* CANCEL */

    cancelBtn.addEventListener(
        "click",
        cancelSubjectForm
    );


    /* JUNIOR ACTIONS */

    juniorSubjects.addEventListener(
        "click",
        handleSubjectAction
    );


    /* SENIOR ACTIONS */

    seniorSubjects.addEventListener(
        "click",
        handleSubjectAction
    );


    /* DELETE */

    deleteConfirmBtn.addEventListener(
        "click",
        confirmDeleteSubject
    );


    deleteCancelBtn.addEventListener(
        "click",
        closeDeleteModal
    );


    closeDeleteModalBtn.addEventListener(
        "click",
        closeDeleteModal
    );


    /* PASSWORD */

    adminPasswordToggle.addEventListener(
        "click",
        toggleAdminDeletePassword
    );


    /* OVERLAY */

    const overlay =
        deleteModal.querySelector(
            ".modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeDeleteModal
        );

    }


    /* ESC */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                if (
                    deleteModal.classList.contains(
                        "show"
                    )
                ) {

                    closeDeleteModal();

                }

            }

        }
    );

}


/* =========================================================
   SUBJECT ACTION HANDLER
========================================================= */

function handleSubjectAction(
    event
) {

    const button =
        event.target.closest(
            "button[data-action]"
        );


    if (!button) return;


    const action =
        button.dataset.action;


    const id =
        button.dataset.id;


    if (
        action === "edit"
    ) {

        editSubject(id);

    }


    if (
        action === "delete"
    ) {

        deleteSubject(id);

    }

}


/* =========================================================
   AUTH STATE
========================================================= */

function setupAuthListener() {

    db.auth.onAuthStateChange(
        function (event) {

            if (
                event === "SIGNED_OUT"
            ) {

                window.location.href =
                    "index.html";

            }

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeSubjectsPage() {

    cacheElements();


    /*
       Form is hidden when the page opens.
    */

    hideSubjectForm();


    /*
       Render the official FCA structure immediately.
       This means the academic information is visible
       even before Supabase is connected.
    */

    renderDefaultSubjects();


    updateStatistics();


    setupEventListeners();


    db =
        getSupabaseClient();


    if (!db) {

        setDatabaseStatus(
            "Supabase client not found.",
            "error"
        );

        return;

    }


    try {

        const authorized =
            await checkAdminAuthorization();


        if (!authorized) {

            return;

        }


        setupAuthListener();


        await loadSubjects();


    } catch (error) {

        console.error(
            "FCA Subjects initialization error:",
            error
        );


        setDatabaseStatus(
            getFriendlyError(error),
            "error"
        );

    }

}


/* =========================================================
   DEFAULT SUBJECT DISPLAY
========================================================= */

function renderDefaultSubjects() {

    subjects =
        Object.keys(
            FCA_SUBJECTS
        ).map(
            function (name, index) {

                return {

                    id:
                        `default-${index}`,

                    name:
                        name,

                    code:
                        FCA_SUBJECTS[name].code,

                    is_default:
                        true

                };

            }
        );


    renderSubjects();

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.editSubject =
    editSubject;


window.deleteSubject =
    deleteSubject;


window.showSubjectForm =
    showSubjectForm;


window.hideSubjectForm =
    hideSubjectForm;