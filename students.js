"use strict";

/* =========================================================
   FCA STUDENTS MANAGEMENT
   SUPABASE
========================================================= */


document.addEventListener("DOMContentLoaded", async function () {


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const FCA_ADMIN_EMAIL = "fca.admin@gmail.com";

    const db = window.fcaSupabase;

    const urlParams = new URLSearchParams(window.location.search);

    const formNumber = urlParams.get("form");


    /* =====================================================
       STATE
    ===================================================== */

    let currentClass = null;

    let students = [];

    let subjects = [];

    let editingStudentId = null;

    let selectedDeleteStudentId = null;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const databaseStatus =
        document.getElementById("databaseStatus");

    const classTitle =
        document.getElementById("classTitle");

    const classDescription =
        document.getElementById("classDescription");

    const summaryClass =
        document.getElementById("summaryClass");

    const summaryYear =
        document.getElementById("summaryYear");

    const studentCount =
        document.getElementById("studentCount");

    const studentsContainer =
        document.getElementById("studentsContainer");

    const emptyState =
        document.getElementById("emptyState");

    const studentSearch =
        document.getElementById("studentSearch");

    const addStudentButton =
        document.getElementById("addStudentButton");

    const emptyAddButton =
        document.getElementById("emptyAddButton");

    const studentModal =
        document.getElementById("studentModal");

    const studentModalTitle =
        document.getElementById("studentModalTitle");

    const closeStudentModal =
        document.getElementById("closeStudentModal");

    const cancelStudentButton =
        document.getElementById("cancelStudentButton");

    const studentForm =
        document.getElementById("studentForm");

    const firstName =
        document.getElementById("firstName");

    const lastName =
        document.getElementById("lastName");

    const gender =
        document.getElementById("gender");

    const academicYear =
        document.getElementById("academicYear");

    const studentClass =
        document.getElementById("studentClass");

    const subjectsContainer =
        document.getElementById("subjectsContainer");

    const credentialsBox =
        document.getElementById("credentialsBox");

    const generatedStudentId =
        document.getElementById("generatedStudentId");

    const generatedPassword =
        document.getElementById("generatedPassword");

    const studentMessage =
        document.getElementById("studentMessage");

    const saveStudentButton =
        document.getElementById("saveStudentButton");

    const deleteModal =
        document.getElementById("deleteModal");

    const closeDeleteModal =
        document.getElementById("closeDeleteModal");

    const cancelDeleteButton =
        document.getElementById("cancelDeleteButton");

    const confirmDeleteButton =
        document.getElementById("confirmDeleteButton");

    const deleteStudentName =
        document.getElementById("deleteStudentName");

    const deleteMessage =
        document.getElementById("deleteMessage");


    /* =====================================================
       INITIAL CHECK
    ===================================================== */

    if (!db) {

        setDatabaseStatus(
            "FCA Supabase client was not found. Check config.js.",
            "error"
        );

        return;
    }


    if (!formNumber) {

        setDatabaseStatus(
            "No class was selected. Open Students from the Classes page.",
            "error"
        );

        addStudentButton.disabled = true;

        return;
    }


    /* =====================================================
       START
    ===================================================== */

    try {

        await checkAuthentication();

        await loadClass();

        await loadSubjects();

        await loadStudents();

        setDatabaseStatus(
            "Database connected successfully.",
            "connected"
        );

    } catch (error) {

        console.error(
            "FCA Students initialization error:",
            error
        );

        setDatabaseStatus(
            error.message ||
            "Unable to load the Students page.",
            "error"
        );

    }


    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    async function checkAuthentication() {

        const {
            data,
            error
        } = await db.auth.getUser();


        if (error) {
            throw error;
        }


        if (!data || !data.user) {

            window.location.href = "index.html";

            return;
        }


        console.log(
            "FCA Students authenticated:",
            data.user.email
        );

    }


    /* =====================================================
       LOAD CLASS
    ===================================================== */

    async function loadClass() {

        const parsedForm =
            Number.parseInt(formNumber, 10);


        if (!Number.isInteger(parsedForm)) {

            throw new Error(
                "Invalid class number."
            );
        }


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
                form_number,
                created_at
            `)
            .eq("form_number", parsedForm)
            .maybeSingle();


        if (error) {
            throw error;
        }


        if (!data) {

            throw new Error(
                "The selected class could not be found."
            );
        }


        currentClass = data;


        const className =
            data.class_name ||
            `Form ${data.form_number}`;


        classTitle.textContent =
            `${className} Students`;


        classDescription.textContent =
            data.description ||
            `Manage students enrolled in ${className}.`;


        summaryClass.textContent =
            className;


        studentClass.value =
            className;


        document.title =
            `${className} Students | FCA Portal`;

    }


    /* =====================================================
       LOAD SUBJECTS
    ===================================================== */

    async function loadSubjects() {

        const {
            data,
            error
        } = await db
            .from("subjects")
            .select("*")
            .order("id", {
                ascending: true
            });


        if (error) {

            console.error(
                "Subject loading error:",
                error
            );

            subjects = [];

            subjectsContainer.innerHTML = `
                <div class="no-subjects">
                    Unable to load subjects.
                </div>
            `;

            return;
        }


        subjects =
            Array.isArray(data)
                ? data
                : [];


        renderSubjectOptions();

    }


    /* =====================================================
       SUBJECT NAME
    ===================================================== */

    function getSubjectName(subject) {

        if (!subject) {
            return "Subject";
        }


        return (
            subject.subject_name ||
            subject.name ||
            subject.title ||
            subject.subject ||
            "Subject"
        );

    }


    /* =====================================================
       SUBJECT ID
    ===================================================== */

    function getSubjectId(subject) {

        return subject.id;

    }


    /* =====================================================
       RENDER SUBJECTS
    ===================================================== */

    function renderSubjectOptions(selectedIds = []) {

        if (!subjects.length) {

            subjectsContainer.innerHTML = `
                <div class="no-subjects">
                    No subjects are available.
                </div>
            `;

            return;
        }


        subjectsContainer.innerHTML =
            subjects.map(function (subject) {

                const id =
                    getSubjectId(subject);

                const name =
                    getSubjectName(subject);

                const selected =
                    selectedIds.includes(id);


                return `
                    <label
                        class="subject-option ${
                            selected ? "selected" : ""
                        }"
                    >

                        <input
                            type="checkbox"
                            class="subject-checkbox"
                            value="${escapeHtml(id)}"
                            ${selected ? "checked" : ""}
                        >

                        <span>
                            ${escapeHtml(name)}
                        </span>

                    </label>
                `;

            }).join("");


        document
            .querySelectorAll(".subject-checkbox")
            .forEach(function (checkbox) {

                checkbox.addEventListener(
                    "change",
                    function () {

                        const option =
                            checkbox.closest(
                                ".subject-option"
                            );

                        if (option) {

                            option.classList.toggle(
                                "selected",
                                checkbox.checked
                            );

                        }

                    }
                );

            });

    }


    /* =====================================================
       LOAD STUDENTS
    ===================================================== */

    async function loadStudents() {

        const {
            data,
            error
        } = await db
            .from("students")
            .select(`
                id,
                first_name,
                last_name,
                gender,
                student_id,
                access_password,
                academic_year,
                class_id,
                created_at,
                updated_at,
                student_subjects (
                    id,
                    subject_id,
                    subjects (
                        id,
                        subject_name,
                        name,
                        title
                    )
                )
            `)
            .eq("class_id", currentClass.id)
            .order("last_name", {
                ascending: true
            })
            .order("first_name", {
                ascending: true
            });


        if (error) {
            throw error;
        }


        students =
            Array.isArray(data)
                ? data
                : [];


        renderStudents();

    }


    /* =====================================================
       RENDER STUDENTS
    ===================================================== */

    function renderStudents() {

        const search =
            studentSearch.value
                .trim()
                .toLowerCase();


        const filteredStudents =
            students.filter(function (student) {

                const fullName =
                    `${student.first_name} ${student.last_name}`
                        .toLowerCase();


                const id =
                    String(
                        student.student_id || ""
                    ).toLowerCase();


                return (
                    !search ||
                    fullName.includes(search) ||
                    id.includes(search)
                );

            });


        studentCount.textContent =
            students.length;


        summaryYear.textContent =
            students.length
                ? getMostRecentAcademicYear()
                : "—";


        if (!students.length) {

            studentsContainer.innerHTML = "";

            emptyState.classList.remove(
                "hidden"
            );

            return;
        }


        if (!filteredStudents.length) {

            studentsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        🔍
                    </div>

                    <h3>
                        No Students Found
                    </h3>

                    <p>
                        No student matches your search.
                    </p>
                </div>
            `;

            emptyState.classList.add(
                "hidden"
            );

            return;
        }


        emptyState.classList.add(
            "hidden"
        );


        studentsContainer.innerHTML =
            filteredStudents.map(function (
                student,
                index
            ) {

                return createStudentCard(
                    student,
                    index
                );

            }).join("");


        attachStudentActions();

    }


    /* =====================================================
       STUDENT CARD
    ===================================================== */

    function createStudentCard(student, index) {

        const fullName =
            `${student.first_name} ${student.last_name}`;


        const subjectRows =
            Array.isArray(student.student_subjects)
                ? student.student_subjects
                : [];


        const subjectNames =
            subjectRows
                .map(function (row) {

                    if (row.subjects) {
                        return getSubjectName(
                            row.subjects
                        );
                    }

                    return null;

                })
                .filter(Boolean);


        const subjectHtml =
            subjectNames.length
                ? `
                    <div class="subject-tags">

                        ${subjectNames.map(function (name) {

                            return `
                                <span class="subject-tag">
                                    ${escapeHtml(name)}
                                </span>
                            `;

                        }).join("")}

                    </div>
                `
                : `
                    <span class="no-subjects">
                        No subjects assigned
                    </span>
                `;


        return `
            <article
                class="student-card"
                data-student-id="${escapeHtml(student.id)}"
            >

                <div class="student-card-header">

                    <div>

                        <div class="student-name">
                            ${escapeHtml(fullName)}
                        </div>

                        <div class="student-id">
                            ${escapeHtml(student.student_id)}
                        </div>

                    </div>


                    <div class="student-number">
                        ${index + 1}
                    </div>

                </div>


                <div class="student-details">


                    <div class="detail">

                        <small>
                            Gender
                        </small>

                        <strong>
                            ${escapeHtml(student.gender)}
                        </strong>

                    </div>


                    <div class="detail">

                        <small>
                            Class
                        </small>

                        <strong>
                            ${escapeHtml(
                                currentClass.class_name ||
                                `Form ${currentClass.form_number}`
                            )}
                        </strong>

                    </div>


                    <div class="detail">

                        <small>
                            Academic Year
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.academic_year
                            )}
                        </strong>

                    </div>


                    <div class="detail">

                        <small>
                            Access Password
                        </small>

                        <strong class="password-value">
                            ${escapeHtml(
                                student.access_password
                            )}
                        </strong>

                    </div>


                    <div class="detail full">

                        <small>
                            Subjects Taken
                        </small>

                        ${subjectHtml}

                    </div>


                </div>


                <div class="student-actions">

                    <button
                        type="button"
                        class="student-action edit-button"
                        data-action="edit"
                        data-id="${escapeHtml(student.id)}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="student-action delete-button"
                        data-action="delete"
                        data-id="${escapeHtml(student.id)}"
                    >
                        Delete
                    </button>

                </div>

            </article>
        `;

    }


    /* =====================================================
       ATTACH ACTIONS
    ===================================================== */

    function attachStudentActions() {

        document
            .querySelectorAll(
                "[data-action='edit']"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openEditStudent(
                            button.dataset.id
                        );

                    }
                );

            });


        document
            .querySelectorAll(
                "[data-action='delete']"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openDeleteStudent(
                            button.dataset.id
                        );

                    }
                );

            });

    }


    /* =====================================================
       ADD STUDENT
    ===================================================== */

    function openAddStudent() {

        editingStudentId = null;


        studentModalTitle.textContent =
            "Add Student";


        saveStudentButton.textContent =
            "Save Student";


        studentForm.reset();


        academicYear.value =
            getCurrentAcademicYear();


        studentClass.value =
            currentClass.class_name ||
            `Form ${currentClass.form_number}`;


        credentialsBox.classList.add(
            "hidden"
        );


        generatedStudentId.textContent =
            "Generated after saving";


        generatedPassword.textContent =
            "Generated after saving";


        clearMessage(
            studentMessage
        );


        renderSubjectOptions();


        showModal(
            studentModal
        );

    }


    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    async function openEditStudent(studentId) {

        const student =
            students.find(function (item) {

                return item.id === studentId;

            });


        if (!student) {
            return;
        }


        editingStudentId =
            student.id;


        studentModalTitle.textContent =
            "Edit Student";


        saveStudentButton.textContent =
            "Save Changes";


        firstName.value =
            student.first_name || "";


        lastName.value =
            student.last_name || "";


        gender.value =
            student.gender || "";


        academicYear.value =
            student.academic_year || "2026";


        studentClass.value =
            currentClass.class_name ||
            `Form ${currentClass.form_number}`;


        const selectedSubjectIds =
            Array.isArray(student.student_subjects)
                ? student.student_subjects
                    .map(function (row) {

                        return row.subject_id;

                    })
                : [];


        renderSubjectOptions(
            selectedSubjectIds
        );


        credentialsBox.classList.remove(
            "hidden"
        );


        generatedStudentId.textContent =
            student.student_id;


        generatedPassword.textContent =
            student.access_password;


        clearMessage(
            studentMessage
        );


        showModal(
            studentModal
        );

    }


    /* =====================================================
       SAVE STUDENT
    ===================================================== */

    studentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            clearMessage(
                studentMessage
            );


            const first =
                firstName.value.trim();


            const surname =
                lastName.value.trim();


            const selectedGender =
                gender.value;


            const year =
                Number.parseInt(
                    academicYear.value,
                    10
                );


            const selectedSubjects =
                getSelectedSubjectIds();


            if (!first || !surname) {

                showMessage(
                    studentMessage,
                    "First name and surname are required.",
                    "error"
                );

                return;
            }


            if (!selectedGender) {

                showMessage(
                    studentMessage,
                    "Please select the student's gender.",
                    "error"
                );

                return;
            }


            if (
                !Number.isInteger(year) ||
                year < 2026
            ) {

                showMessage(
                    studentMessage,
                    "Please select a valid academic year.",
                    "error"
                );

                return;
            }


            if (!selectedSubjects.length) {

                showMessage(
                    studentMessage,
                    "Please select at least one subject.",
                    "error"
                );

                return;
            }


            saveStudentButton.disabled =
                true;


            saveStudentButton.textContent =
                editingStudentId
                    ? "Saving..."
                    : "Creating...";


            try {

                if (editingStudentId) {

                    await updateStudent(
                        first,
                        surname,
                        selectedGender,
                        year,
                        selectedSubjects
                    );

                } else {

                    await createStudent(
                        first,
                        surname,
                        selectedGender,
                        year,
                        selectedSubjects
                    );

                }


                await loadStudents();


                closeModal(
                    studentModal
                );


            } catch (error) {

                console.error(
                    "Student save error:",
                    error
                );


                showMessage(
                    studentMessage,
                    error.message ||
                    "Unable to save student.",
                    "error"
                );

            } finally {

                saveStudentButton.disabled =
                    false;


                saveStudentButton.textContent =
                    editingStudentId
                        ? "Save Changes"
                        : "Save Student";

            }

        }
    );


    /* =====================================================
       CREATE STUDENT
    ===================================================== */

    async function createStudent(
        first,
        surname,
        selectedGender,
        year,
        selectedSubjects
    ) {

        const studentId =
            await generateStudentId(
                surname,
                year
            );


        const accessPassword =
            generateAccessPassword();


        const {
            data: insertedStudent,
            error
        } = await db
            .from("students")
            .insert({
                first_name: first,
                last_name: surname,
                gender: selectedGender,
                student_id: studentId,
                access_password: accessPassword,
                academic_year: year,
                class_id: currentClass.id
            })
            .select()
            .single();


        if (error) {

            if (error.code === "23505") {

                throw new Error(
                    "A student with the generated Student ID already exists. Please try again."
                );

            }

            throw error;
        }


        try {

            await saveStudentSubjects(
                insertedStudent.id,
                selectedSubjects
            );

        } catch (subjectError) {

            await db
                .from("students")
                .delete()
                .eq(
                    "id",
                    insertedStudent.id
                );

            throw subjectError;
        }


        generatedStudentId.textContent =
            studentId;


        generatedPassword.textContent =
            accessPassword;


        credentialsBox.classList.remove(
            "hidden"
        );

    }


    /* =====================================================
       UPDATE STUDENT
    ===================================================== */

    async function updateStudent(
        first,
        surname,
        selectedGender,
        year,
        selectedSubjects
    ) {

        const {
            error
        } = await db
            .from("students")
            .update({
                first_name: first,
                last_name: surname,
                gender: selectedGender,
                academic_year: year
            })
            .eq(
                "id",
                editingStudentId
            );


        if (error) {
            throw error;
        }


        await replaceStudentSubjects(
            editingStudentId,
            selectedSubjects
        );

    }


    /* =====================================================
       SAVE STUDENT SUBJECTS
    ===================================================== */

    async function saveStudentSubjects(
        studentId,
        selectedSubjectIds
    ) {

        const rows =
            selectedSubjectIds.map(function (
                subjectId
            ) {

                return {
                    student_id: studentId,
                    subject_id: subjectId
                };

            });


        const {
            error
        } = await db
            .from("student_subjects")
            .insert(rows);


        if (error) {
            throw error;
        }

    }


    /* =====================================================
       REPLACE STUDENT SUBJECTS
    ===================================================== */

    async function replaceStudentSubjects(
        studentId,
        selectedSubjectIds
    ) {

        const {
            error: deleteError
        } = await db
            .from("student_subjects")
            .delete()
            .eq(
                "student_id",
                studentId
            );


        if (deleteError) {
            throw deleteError;
        }


        await saveStudentSubjects(
            studentId,
            selectedSubjectIds
        );

    }


    /* =====================================================
       GENERATE STUDENT ID
    ===================================================== */

    async function generateStudentId(
        surname,
        year
    ) {

        const prefix =
            surname
                .trim()
                .substring(0, 2)
                .toUpperCase();


        const {
            data,
            error
        } = await db
            .from("students")
            .select(`
                student_id,
                last_name
            `)
            .eq(
                "class_id",
                currentClass.id
            )
            .eq(
                "academic_year",
                year
            );


        if (error) {
            throw error;
        }


        const matching =
            (data || []).filter(function (
                student
            ) {

                const studentPrefix =
                    String(
                        student.last_name || ""
                    )
                    .substring(0, 2)
                    .toUpperCase();


                return (
                    studentPrefix === prefix
                );

            });


        const usedNumbers =
            matching
                .map(function (student) {

                    const parts =
                        String(
                            student.student_id || ""
                        ).split("-");


                    return Number.parseInt(
                        parts[parts.length - 1],
                        10
                    );

                })
                .filter(function (number) {

                    return Number.isInteger(
                        number
                    );

                })
                .sort(function (a, b) {

                    return a - b;

                });


        let nextNumber = 1;


        for (
            let index = 0;
            index < usedNumbers.length;
            index++
        ) {

            if (
                usedNumbers[index] === nextNumber
            ) {

                nextNumber++;

            } else {

                break;

            }

        }


        return (
            `FCA-${year}-${prefix}-${nextNumber}`
        );

    }


    /* =====================================================
       GENERATE ACCESS PASSWORD
    ===================================================== */

    function generateAccessPassword() {

        const letters =
            "abcdefghijklmnopqrstuvwxyz";


        const numbers =
            "0123456789";


        let result =
            "fca@";


        for (let i = 0; i < 3; i++) {

            result +=
                letters.charAt(
                    Math.floor(
                        Math.random() *
                        letters.length
                    )
                );

        }


        for (let i = 0; i < 3; i++) {

            result +=
                numbers.charAt(
                    Math.floor(
                        Math.random() *
                        numbers.length
                    )
                );

        }


        return result;

    }


    /* =====================================================
       GET SELECTED SUBJECTS
    ===================================================== */

    function getSelectedSubjectIds() {

        return Array.from(
            document.querySelectorAll(
                ".subject-checkbox:checked"
            )
        )
        .map(function (checkbox) {

            return checkbox.value;

        });

    }


    /* =====================================================
       DELETE STUDENT
    ===================================================== */

    function openDeleteStudent(studentId) {

        const student =
            students.find(function (item) {

                return item.id === studentId;

            });


        if (!student) {
            return;
        }


        selectedDeleteStudentId =
            student.id;


        deleteStudentName.textContent =
            `${student.first_name} ${student.last_name}`;


        clearMessage(
            deleteMessage
        );


        showModal(
            deleteModal
        );

    }


    confirmDeleteButton.addEventListener(
        "click",
        async function () {

            if (!selectedDeleteStudentId) {
                return;
            }


            confirmDeleteButton.disabled =
                true;


            confirmDeleteButton.textContent =
                "Deleting...";


            clearMessage(
                deleteMessage
            );


            try {

                const {
                    error
                } = await db
                    .from("students")
                    .delete()
                    .eq(
                        "id",
                        selectedDeleteStudentId
                    );


                if (error) {
                    throw error;
                }


                selectedDeleteStudentId =
                    null;


                closeModal(
                    deleteModal
                );


                await loadStudents();


            } catch (error) {

                console.error(
                    "Student deletion error:",
                    error
                );


                showMessage(
                    deleteMessage,
                    error.message ||
                    "Unable to delete student.",
                    "error"
                );

            } finally {

                confirmDeleteButton.disabled =
                    false;


                confirmDeleteButton.textContent =
                    "Delete Student";

            }

        }
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    studentSearch.addEventListener(
        "input",
        renderStudents
    );


    /* =====================================================
       MODAL EVENTS
    ===================================================== */

    addStudentButton.addEventListener(
        "click",
        openAddStudent
    );


    emptyAddButton.addEventListener(
        "click",
        openAddStudent
    );


    closeStudentModal.addEventListener(
        "click",
        function () {

            closeModal(
                studentModal
            );

        }
    );


    cancelStudentButton.addEventListener(
        "click",
        function () {

            closeModal(
                studentModal
            );

        }
    );


    closeDeleteModal.addEventListener(
        "click",
        function () {

            closeModal(
                deleteModal
            );

        }
    );


    cancelDeleteButton.addEventListener(
        "click",
        function () {

            closeModal(
                deleteModal
            );

        }
    );


    document
        .querySelectorAll(".modal-overlay")
        .forEach(function (overlay) {

            overlay.addEventListener(
                "click",
                function () {

                    const modal =
                        overlay.closest(".modal");


                    if (modal) {

                        closeModal(
                            modal
                        );

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                document
                    .querySelectorAll(".modal:not(.hidden)")
                    .forEach(function (modal) {

                        closeModal(
                            modal
                        );

                    });

            }

        }
    );


    /* =====================================================
       MODAL FUNCTIONS
    ===================================================== */

    function showModal(modal) {

        modal.classList.remove(
            "hidden"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";

    }


    function closeModal(modal) {

        modal.classList.add(
            "hidden"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        if (
            !document.querySelector(
                ".modal:not(.hidden)"
            )
        ) {

            document.body.style.overflow =
                "";

        }

    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function getCurrentAcademicYear() {

        const year =
            new Date().getFullYear();


        return String(
            year
        );

    }


    function getMostRecentAcademicYear() {

        if (!students.length) {
            return "—";
        }


        const years =
            students
                .map(function (student) {

                    return Number(
                        student.academic_year
                    );

                })
                .filter(function (year) {

                    return Number.isInteger(
                        year
                    );

                });


        if (!years.length) {
            return "—";
        }


        return Math.max(
            ...years
        );

    }


    function setDatabaseStatus(
        message,
        type
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


    function showMessage(
        element,
        message,
        type
    ) {

        element.textContent =
            message;


        element.className =
            `form-message ${type}`;

    }


    function clearMessage(element) {

        element.textContent =
            "";

        element.className =
            "form-message";

    }


    function escapeHtml(value) {

        return String(
            value ?? ""
        )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    }

});