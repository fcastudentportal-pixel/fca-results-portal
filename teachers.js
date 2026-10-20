
"use strict";

/* ============================================================
   FIRST CLASS ACADEMY — TEACHERS MANAGEMENT

   TEACHER ID:
   FCA-T-AM (Alex Meja)
   Duplicate initials receive a unique suffix:
   FCA-T-AM-2, FCA-T-AM-3, etc.

   ACCESS:
   - Administrator account: login to the admin dashboard.
   - IT technician password: authorize teacher-management actions.
   - Teacher password: teacher's own login credentials.

   SECURITY:
   - Technician password verification uses a Supabase RPC.
   - Do not store the technician password in this file.
   - Server-side RLS policies must also protect database writes.
============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const FCA_ADMIN_EMAIL = "fca.admin@gmail.com";
const TECHNICIAN_VERIFY_RPC = "fca_verify_technician_password";


/* ============================================================
   STATE
============================================================ */

let teachers = [];
let editingTeacherId = null;
let teacherToDeleteId = null;
let technicianAuthorizedForCurrentAction = false;


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
const selectAllSubjectsBtn = document.getElementById("selectAllSubjectsBtn");
const clearSubjectsBtn = document.getElementById("clearSubjectsBtn");
const selectAllClassesBtn = document.getElementById("selectAllClassesBtn");
const clearClassesBtn = document.getElementById("clearClassesBtn");
const passwordToggle = document.getElementById("passwordToggle");
const addTeacherSection = document.getElementById("addTeacher");
const addTeacherBtn = document.getElementById("addTeacherBtn");

const deleteModal = document.getElementById("deleteModal");
const deleteTeacherName = document.getElementById("deleteTeacherName");
const deleteError = document.getElementById("deleteError");
const deleteCancelBtn = document.getElementById("deleteCancelBtn");
const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");

/* ============================================================
   SUPABASE
============================================================ */

function getSupabaseClient() {
    if (!window.fcaSupabase) {
        throw new Error(
            "FCA Supabase client is unavailable. Check config.js."
        );
    }

    return window.fcaSupabase;
}


/* ============================================================
   ADMIN DASHBOARD SESSION
   This checks dashboard login only.
   It does not replace technician authorization.
============================================================ */

async function checkAdminAuthorization() {
    try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw error;
        }

        const user = data?.session?.user;

        if (!user) {
            window.location.replace("admin-login.html");
            return false;
        }

        const email = (user.email || "").trim().toLowerCase();

        if (email !== FCA_ADMIN_EMAIL) {
            await supabase.auth.signOut();
            window.location.replace("admin-login.html");
            return false;
        }

        return true;
    } catch (error) {
        console.error("FCA administrator session error:", error);
        window.location.replace("admin-login.html");
        return false;
    }
}


/* ============================================================
   TECHNICIAN AUTHORIZATION

   Required Supabase RPC:
   fca_verify_technician_password(p_password text)

   Expected response:
   true
   OR
   { authorized: true }

   The RPC must verify the password securely on the server.
   Never replace this with a password hardcoded in JavaScript.
============================================================ */

async function verifyTechnicianPassword(password) {
    if (!password) {
        return false;
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc(
        TECHNICIAN_VERIFY_RPC,
        {
            p_password: password
        }
    );

    if (error) {
        console.error("Technician verification failed:", error);

        throw new Error(
            "Technician verification is not configured correctly. " +
            "Check the Supabase technician-verification RPC."
        );
    }

    if (data === true) {
        return true;
    }

    if (
        data &&
        typeof data === "object" &&
        data.authorized === true
    ) {
        return true;
    }

    return false;
}


/* ============================================================
   ASK FOR TECHNICIAN PASSWORD

   This modal is generated by JavaScript, so no new HTML
   modal is required.
============================================================ */

function requestTechnicianPassword(actionDescription) {
    return new Promise((resolve) => {
        const existing = document.getElementById(
            "fcaTechnicianAuthModal"
        );

        if (existing) {
            existing.remove();
        }

        const modal = document.createElement("div");

        modal.id = "fcaTechnicianAuthModal";

        modal.style.cssText = `
            position:fixed;
            inset:0;
            z-index:99999;
            background:rgba(0,0,0,.65);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:18px;
        `;

        modal.innerHTML = `
            <div style="
                background:#fff;
                color:#1d2430;
                width:100%;
                max-width:420px;
                padding:24px;
                border-radius:14px;
                box-shadow:0 15px 45px rgba(0,0,0,.25);
            ">
                <h2 style="margin:0 0 8px;font-size:21px;">
                    IT Technician Authorization
                </h2>

                <p style="margin:0 0 16px;line-height:1.5;color:#606775;">
                    Enter your technician password to authorize:
                    <strong>${escapeHtml(actionDescription)}</strong>
                </p>

                <label for="fcaTechnicianPassword"
                    style="display:block;margin-bottom:7px;font-weight:600;">
                    Technician password
                </label>

                <input
                    id="fcaTechnicianPassword"
                    type="password"
                    autocomplete="current-password"
                    placeholder="Enter technician password"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        border:1px solid #cfd3da;
                        border-radius:8px;
                        font-size:16px;
                    "
                >

                <p
                    id="fcaTechnicianAuthError"
                    role="alert"
                    style="color:#b42318;min-height:20px;font-size:13px;"
                ></p>

                <div style="display:flex;gap:10px;">
                    <button
                        type="button"
                        id="fcaTechnicianCancel"
                        style="
                            flex:1;padding:12px;border:1px solid #cfd3da;
                            border-radius:8px;background:#fff;cursor:pointer;
                        "
                    >Cancel</button>

                    <button
                        type="button"
                        id="fcaTechnicianConfirm"
                        style="
                            flex:1;padding:12px;border:0;border-radius:8px;
                            background:#650d22;color:#fff;cursor:pointer;
                        "
                    >Authorize</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const input = modal.querySelector("#fcaTechnicianPassword");
        const errorBox = modal.querySelector("#fcaTechnicianAuthError");
        const confirmBtn = modal.querySelector("#fcaTechnicianConfirm");
        const cancelBtn = modal.querySelector("#fcaTechnicianCancel");

        let finished = false;

        function finish(result) {
            if (finished) return;

            finished = true;
            modal.remove();
            resolve(result);
        }

        cancelBtn.addEventListener("click", () => finish(false));

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                finish(false);
            }
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                confirmBtn.click();
            }

            if (event.key === "Escape") {
                finish(false);
            }
        });

        confirmBtn.addEventListener("click", async () => {
            const password = input.value;

            if (!password) {
                errorBox.textContent =
                    "Enter your technician password.";
                input.focus();
                return;
            }

            confirmBtn.disabled = true;
            confirmBtn.textContent = "Verifying...";
            errorBox.textContent = "";

            try {
                const authorized =
                    await verifyTechnicianPassword(password);

                if (!authorized) {
                    errorBox.textContent =
                        "Incorrect technician password.";

                    input.value = "";
                    input.focus();
                    return;
                }

                finish(true);
            } catch (error) {
                console.error(error);

                errorBox.textContent =
                    error.message ||
                    "Unable to verify technician authorization.";
            } finally {
                if (modal.isConnected) {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = "Authorize";
                }
            }
        });

        setTimeout(() => input.focus(), 50);
    });
}


/* ============================================================
   FORM VISIBILITY
============================================================ */

function hideTeacherForm() {
    if (!addTeacherSection) return;

    addTeacherSection.style.setProperty(
        "display",
        "none",
        "important"
    );
}

function showTeacherForm() {
    if (!addTeacherSection) {
        console.error("FCA: addTeacher section was not found.");
        return;
    }

    addTeacherSection.style.setProperty(
        "display",
        "block",
        "important"
    );

    setTimeout(() => {
        addTeacherSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 50);
}


/* ============================================================
   FORM HELPERS
============================================================ */

function showMessage(message, type = "info") {
    if (!teacherMessage) return;

    teacherMessage.textContent = message;
    teacherMessage.className = "message " + type;
}

function setPasswordVisibility(input, button, visible) {
    if (!input || !button) return;

    input.type = visible ? "text" : "password";

    button.classList.toggle("is-visible", visible);
    button.setAttribute(
        "aria-label",
        visible ? "Hide password" : "Show password"
    );
    button.setAttribute(
        "title",
        visible ? "Hide password" : "Show password"
    );
    button.setAttribute(
        "aria-pressed",
        visible ? "true" : "false"
    );
}

function openAddTeacherForm() {
    editingTeacherId = null;

    if (teacherForm) teacherForm.reset();

    if (formTitle) formTitle.textContent = "Add Teacher";

    if (passwordInput) {
        passwordInput.value = "";
        passwordInput.placeholder = "Set teacher login password";
        passwordInput.required = true;
        setPasswordVisibility(passwordInput, passwordToggle, false);
    }

    const saveButton =
        teacherForm?.querySelector(".save-btn");

    if (saveButton) saveButton.textContent = "Save Teacher";

    showMessage("", "info");
    showTeacherForm();

    setTimeout(() => firstNameInput?.focus(), 250);
}

if (addTeacherBtn) {
    addTeacherBtn.addEventListener("click", (event) => {
        event.preventDefault();
        openAddTeacherForm();
    });
}


/* ============================================================
   NORMALIZE SUBJECTS AND CLASSES
============================================================ */

function normalizeList(value, possibleKeys) {
    if (!value) return [];

    function extract(items) {
        return items
            .map((item) => {
                if (typeof item === "string") return item;

                for (const key of possibleKeys) {
                    if (item?.[key]) return item[key];
                }

                return "";
            })
            .filter(Boolean);
    }

    if (Array.isArray(value)) {
        return extract(value);
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return extract(parsed);
            }
        } catch {
            return value.trim() ? [value.trim()] : [];
        }

        return value.trim() ? [value.trim()] : [];
    }

    return [];
}

function normalizeSubjects(value) {
    return normalizeList(value, [
        "name",
        "subject_name",
        "subject"
    ]);
}

function normalizeClasses(value) {
    return normalizeList(value, [
        "name",
        "class_name",
        "class"
    ]);
}


/* ============================================================
   LOAD TEACHERS
============================================================ */

async function loadTeachers() {
    if (!teacherList) return;

    teacherList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">T</div>
            <strong>Loading teachers...</strong>
            <p>Connecting to FCA database.</p>
        </div>
    `;

    try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from("teachers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        teachers = Array.isArray(data) ? data : [];

        displayTeachers();
    } catch (error) {
        console.error("FCA teachers loading error:", error);

        teacherList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">!</div>
                <strong>Unable to load teachers</strong>
                <p>${escapeHtml(error.message || "Database error.")}</p>
                <button class="add-btn" type="button"
                    onclick="loadTeachers()">
                    Retry Connection
                </button>
            </div>
        `;
    }
}

window.loadTeachers = loadTeachers;


/* ============================================================
   DISPLAY TEACHERS
============================================================ */

function displayTeachers() {
    if (teacherCount) {
        teacherCount.textContent = teachers.length;
    }

    if (subjectCount) {
        subjectCount.textContent = teachers.reduce(
            (total, teacher) =>
                total + normalizeSubjects(teacher.subjects).length,
            0
        );
    }

    if (classCount) {
        classCount.textContent = teachers.reduce(
            (total, teacher) =>
                total + normalizeClasses(teacher.classes).length,
            0
        );
    }

    if (!teacherList) return;

    if (!teachers.length) {
        teacherList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">T</div>
                <strong>No teachers added yet</strong>
                <p>Add your first teacher to begin managing classes and results.</p>
                <a href="#addTeacher"
                    class="add-btn empty-add-teacher">
                    + Add Teacher
                </a>
            </div>
        `;
        return;
    }

    teacherList.innerHTML = teachers.map((teacher) => {
        const subjects = normalizeSubjects(teacher.subjects);
        const classes = normalizeClasses(teacher.classes);

        const fullName =
            `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim()
            || teacher.full_name
            || "Unnamed Teacher";

        const initials = (
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
                            <h3>${escapeHtml(fullName)}</h3>
                            <span class="teacher-id">
                                ${escapeHtml(teacher.teacher_number || "No ID")}
                            </span>
                        </div>

                        <p class="username">
                            @${escapeHtml(teacher.username || "No username")}
                        </p>

                        <div class="assignment-block">
                            <strong>Subjects</strong>
                            <div class="tags">
                                ${
                                    subjects.length
                                    ? subjects.map(subject => `
                                        <span class="tag subject-tag">
                                            ${escapeHtml(subject)}
                                        </span>
                                    `).join("")
                                    : `<span class="none">No subjects assigned</span>`
                                }
                            </div>
                        </div>

                        <div class="assignment-block">
                            <strong>Classes</strong>
                            <div class="tags">
                                ${
                                    classes.length
                                    ? classes.map(className => `
                                        <span class="tag class-tag">
                                            ${escapeHtml(className)}
                                        </span>
                                    `).join("")
                                    : `<span class="none">No classes assigned</span>`
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div class="teacher-actions">
                    <button class="edit-btn" type="button"
                        data-action="edit"
                        data-id="${escapeHtml(teacher.id)}">
                        Edit
                    </button>

                    <button class="delete-btn" type="button"
                        data-action="delete"
                        data-id="${escapeHtml(teacher.id)}">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join("");
}


/* ============================================================
   TEACHER LIST ACTIONS
============================================================ */

if (teacherList) {
    teacherList.addEventListener("click", (event) => {
        const target = event.target;

        if (target.closest(".empty-add-teacher")) {
            event.preventDefault();
            openAddTeacherForm();
            return;
        }

        const editButton = target.closest('[data-action="edit"]');

        if (editButton) {
            event.preventDefault();
            editTeacher(editButton.dataset.id);
            return;
        }

        const deleteButton = target.closest('[data-action="delete"]');

        if (deleteButton) {
            event.preventDefault();
            deleteTeacher(deleteButton.dataset.id);
        }
    });
}


/* ============================================================
   SUBJECT AND CLASS SELECTION
============================================================ */

function getSelectedSubjects() {
    return Array.from(
        document.querySelectorAll('input[name="subjects"]:checked')
    ).map(input => input.value);
}

function getSelectedClasses() {
    return Array.from(
        document.querySelectorAll('input[name="classes"]:checked')
    ).map(input => input.value);
}

function selectAllSubjects() {
    document.querySelectorAll('input[name="subjects"]')
        .forEach(input => input.checked = true);
}

function clearSubjects() {
    document.querySelectorAll('input[name="subjects"]')
        .forEach(input => input.checked = false);
}

function selectAllClasses() {
    document.querySelectorAll('input[name="classes"]')
        .forEach(input => input.checked = true);
}

function clearClasses() {
    document.querySelectorAll('input[name="classes"]')
        .forEach(input => input.checked = false);
}

selectAllSubjectsBtn?.addEventListener("click", selectAllSubjects);
clearSubjectsBtn?.addEventListener("click", clearSubjects);
selectAllClassesBtn?.addEventListener("click", selectAllClasses);
clearClassesBtn?.addEventListener("click", clearClasses);


/* ============================================================
   PASSWORD SHOW / HIDE
============================================================ */

passwordToggle?.addEventListener("click", () => {
    setPasswordVisibility(
        passwordInput,
        passwordToggle,
        passwordInput?.type === "password"
    );
});

adminPasswordToggle?.addEventListener("click", () => {
    setPasswordVisibility(
        adminDeletePassword,
        adminPasswordToggle,
        adminDeletePassword?.type === "password"
    );
});


/* ============================================================
   PASSWORD HASHING

   Kept for compatibility with your current teacher records.
   For production authentication, use Supabase Auth or a
   server-side password hashing system instead.
============================================================ */

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


/* ============================================================
   TEACHER ID GENERATION

   Example: Alex Meja => FCA-T-AM
   Duplicate initials get a suffix.
============================================================ */

function generateTeacherNumber(firstName, lastName, excludeId = null) {
    const firstInitial =
        (firstName.trim().charAt(0) || "").toUpperCase();

    const lastInitial =
        (lastName.trim().charAt(0) || "").toUpperCase();

    const base = `FCA-T-${firstInitial}${lastInitial}`;

    const usedNumbers = new Set(
        teachers
            .filter(teacher =>
                excludeId === null ||
                String(teacher.id) !== String(excludeId)
            )
            .map(teacher => teacher.teacher_number)
            .filter(Boolean)
    );

    if (!usedNumbers.has(base)) {
        return base;
    }

    let suffix = 2;

    while (usedNumbers.has(`${base}-${suffix}`)) {
        suffix++;
    }

    return `${base}-${suffix}`;
}


/* ============================================================
   SAVE / UPDATE TEACHER
============================================================ */

if (teacherForm) {
    teacherForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const firstName = firstNameInput?.value.trim() || "";
        const lastName = lastNameInput?.value.trim() || "";
        const username = usernameInput?.value.trim().toLowerCase() || "";
        const password = passwordInput?.value || "";
        const subjects = getSelectedSubjects();
        const classes = getSelectedClasses();

        if (!firstName || !lastName) {
            showMessage("First name and last name are required.", "error");
            return;
        }

        if (!username) {
            showMessage("Username is required.", "error");
            return;
        }

        if (editingTeacherId === null && !password) {
            showMessage(
                "Set a password for the new teacher.",
                "error"
            );
            return;
        }

        if (!subjects.length) {
            showMessage("Select at least one subject.", "error");
            return;
        }

        if (!classes.length) {
            showMessage("Assign at least one class.", "error");
            return;
        }

        try {

            const supabase = getSupabaseClient();

            const saveButton = teacherForm.querySelector(".save-btn");

            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent = "Saving...";
            }

            if (editingTeacherId !== null) {
                const teacher = teachers.find(
                    item => String(item.id) === String(editingTeacherId)
                );

                if (!teacher) {
                    throw new Error("Teacher could not be found.");
                }

                const updateData = {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`,
                    username,
                    subjects,
                    classes,
                    updated_at: new Date().toISOString()
                };

                // Change the teacher password only when a new one is supplied.
                if (password) {
                    updateData.password_hash = await hashPassword(password);
                }

                const { data, error } = await supabase
                    .from("teachers")
                    .update(updateData)
                    .eq("id", editingTeacherId)
                    .select("id");

                if (error) throw error;

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error(
                        "Teacher was not updated. Check Supabase UPDATE policies."
                    );
                }

                resetForm();
                await loadTeachers();
                showMessage("Teacher updated successfully.", "success");
            } else {
                const passwordHash = await hashPassword(password);
                const teacherNumber = generateTeacherNumber(
                    firstName,
                    lastName
                );

                const { data, error } = await supabase
                    .from("teachers")
                    .insert({
                        first_name: firstName,
                        last_name: lastName,
                        full_name: `${firstName} ${lastName}`,
                        username,
                        password_hash: passwordHash,
                        teacher_number: teacherNumber,
                        subjects,
                        classes
                    })
                    .select("id");

                if (error) throw error;

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error(
                        "Teacher was not added. Check Supabase INSERT policies."
                    );
                }

                resetForm();
                await loadTeachers();

                showMessage(
                    `Teacher added successfully. Teacher ID: ${teacherNumber}`,
                    "success"
                );
            }
        } catch (error) {
            console.error("FCA teacher save error:", error);
            showMessage(
                error.message || "Unable to save teacher.",
                "error"
            );
        } finally {
            const saveButton = teacherForm.querySelector(".save-btn");

            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent =
                    editingTeacherId === null
                        ? "Save Teacher"
                        : "Update Teacher";
            }
        }
    });
}


/* ============================================================
   EDIT TEACHER
============================================================ */

function editTeacher(id) {
    const teacher = teachers.find(
        item => String(item.id) === String(id)
    );

    if (!teacher) {
        alert("Teacher not found.");
        return;
    }

    editingTeacherId = teacher.id;

    if (formTitle) formTitle.textContent = "Edit Teacher";

    if (firstNameInput) {
        firstNameInput.value = teacher.first_name || "";
    }

    if (lastNameInput) {
        lastNameInput.value = teacher.last_name || "";
    }

    if (usernameInput) {
        usernameInput.value = teacher.username || "";
    }

    if (passwordInput) {
        passwordInput.value = "";
        passwordInput.required = false;
        passwordInput.placeholder =
            "Leave blank to keep current teacher password";

        setPasswordVisibility(passwordInput, passwordToggle, false);
    }

    clearSubjects();
    clearClasses();

    const teacherSubjects = normalizeSubjects(teacher.subjects);
    const teacherClasses = normalizeClasses(teacher.classes);

    document.querySelectorAll('input[name="subjects"]')
        .forEach(input => {
            input.checked = teacherSubjects.some(
                subject =>
                    subject.toLowerCase() === input.value.toLowerCase()
            );
        });

    document.querySelectorAll('input[name="classes"]')
        .forEach(input => {
            input.checked = teacherClasses.some(
                className =>
                    className.toLowerCase() === input.value.toLowerCase()
            );
        });

    const saveButton = teacherForm?.querySelector(".save-btn");

    if (saveButton) {
        saveButton.textContent = "Update Teacher";
    }

    showMessage(
    "Update the teacher details and save your changes.",
    "info"
);

    showTeacherForm();
}

window.editTeacher = editTeacher;


/* ============================================================
   OPEN DELETE MODAL
============================================================ */

function deleteTeacher(id) {
    const teacher = teachers.find(
        item => String(item.id) === String(id)
    );

    if (!teacher) {
        alert("Teacher could not be found.");
        return;
    }

    if (!deleteModal) {
        console.error("Delete modal was not found in the HTML.");
        return;
    }

    teacherToDeleteId = teacher.id;

    const name =
        `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim();

    if (deleteTeacherName) {
        deleteTeacherName.textContent = name
            ? `Delete ${name}?`
            : "Delete this teacher?";
    }

    if (adminDeletePassword) {
        adminDeletePassword.value = "";
        adminDeletePassword.type = "password";
        adminDeletePassword.placeholder =
            "Use the technician authorization prompt";
    }

    if (deleteError) {
        deleteError.textContent =
            "Your technician password will be requested when you confirm.";
    }

    if (deleteConfirmBtn) {
        deleteConfirmBtn.disabled = false;
        deleteConfirmBtn.textContent = "Delete Teacher";
    }

    deleteModal.classList.add("show");
}

window.deleteTeacher = deleteTeacher;


/* ============================================================
   CLOSE DELETE MODAL
============================================================ */

function closeDeleteModal() {
    deleteModal?.classList.remove("show");

    teacherToDeleteId = null;

    if (adminDeletePassword) {
        adminDeletePassword.value = "";
        adminDeletePassword.type = "password";
    }

    if (deleteError) {
        deleteError.textContent = "";
    }

    if (deleteConfirmBtn) {
        deleteConfirmBtn.disabled = false;
        deleteConfirmBtn.textContent = "Delete Teacher";
    }
}

deleteCancelBtn?.addEventListener("click", closeDeleteModal);

if (adminDeletePassword) {
    adminDeletePassword.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            event.preventDefault();
            closeDeleteModal();
        }
    });
}

if (deleteModal) {
    deleteModal.addEventListener("click", event => {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });
}


/* ============================================================
   CONFIRM DELETE
============================================================ */

deleteConfirmBtn?.addEventListener("click", async () => {
    if (teacherToDeleteId === null) {
        closeDeleteModal();
        return;
    }

    const deletingId = teacherToDeleteId;
    const teacher = teachers.find(
        item => String(item.id) === String(deletingId)
    );

    const name = teacher
        ? `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim()
        : "Teacher";

    try {
        deleteConfirmBtn.disabled = true;
        deleteConfirmBtn.textContent = "Verifying...";

        if (deleteError) deleteError.textContent = "";

        const authorized = await requestTechnicianPassword(
            `deleting ${name || "a teacher"}`
        );

        if (!authorized) {
            if (deleteError) {
                deleteError.textContent = "Deletion cancelled.";
            }
            return;
        }

        deleteConfirmBtn.textContent = "Deleting...";

        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from("teachers")
            .delete()
            .eq("id", deletingId)
            .select("id");

        if (error) throw error;

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error(
                "Teacher was not deleted. Check Supabase DELETE policies."
            );
        }

        closeDeleteModal();

        await loadTeachers();

        showMessage(
            `${name || "Teacher"} deleted successfully.`,
            "success"
        );
    } catch (error) {
        console.error("FCA teacher deletion error:", error);

        if (deleteError) {
            deleteError.textContent =
                error.message || "Unable to delete teacher.";
        }
    } finally {
        if (deleteConfirmBtn) {
            deleteConfirmBtn.disabled = false;
            deleteConfirmBtn.textContent = "Delete Teacher";
        }
    }
});


/* ============================================================
   RESET FORM
============================================================ */

function resetForm() {
    if (teacherForm) {
        teacherForm.reset();
    }

    editingTeacherId = null;

    if (formTitle) formTitle.textContent = "Add Teacher";

    if (passwordInput) {
        passwordInput.value = "";
        passwordInput.required = true;
        passwordInput.placeholder = "Set teacher login password";

        setPasswordVisibility(passwordInput, passwordToggle, false);
    }

    const saveButton = teacherForm?.querySelector(".save-btn");

    if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = "Save Teacher";
    }

    showMessage("", "info");
    hideTeacherForm();
}

if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
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
   AUTH STATE
============================================================ */

if (window.fcaSupabase) {
    window.fcaSupabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT" || !session) {
            window.location.replace("admin-login.html");
        }
    });
}


/* ============================================================
   INITIALIZE
============================================================ */

async function initializeTeachersPage() {
    console.log("FCA Teachers page initializing...");

    hideTeacherForm();

    const authorized = await checkAdminAuthorization();

    if (!authorized) return;

    await loadTeachers();
}

initializeTeachersPage();
