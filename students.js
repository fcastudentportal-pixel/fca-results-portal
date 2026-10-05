"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   STUDENTS MANAGEMENT
   SUPABASE VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("FCA Students: starting...");

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const FCA_ADMIN_EMAIL = "fca.admin@gmail.com";

    const db = window.fcaSupabase;

    let currentFormNumber = null;
    let currentClass = null;

    let students = [];
    let selectedStudentId = null;
    let editingStudentId = null;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const databaseStatus =
        document.getElementById("databaseStatus");

    const pageTitle =
        document.getElementById("pageTitle");

    const pageDescription =
        document.getElementById("pageDescription");

    const addStudentBtn =
        document.getElementById("addStudentBtn");

    const studentCount =
        document.getElementById("studentCount");

    const classNameStat =
        document.getElementById("classNameStat");

    const academicYearStat =
        document.getElementById("academicYearStat");

    const studentListDescription =
        document.getElementById("studentListDescription");

    const studentList =
        document.getElementById("studentList");

    const studentFormPanel =
        document.getElementById("studentFormPanel");

    const studentForm =
        document.getElementById("studentForm");

    const formTitle =
        document.getElementById("formTitle");

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

    const studentId =
        document.getElementById("studentId");

    const generatedStudentId =
        document.getElementById("generatedStudentId");

    const accessPassword =
        document.getElementById("accessPassword");

    const passwordToggle =
        document.getElementById("passwordToggle");

    const selectAllSubjectsBtn =
        document.getElementById("selectAllSubjectsBtn");

    const clearSubjectsBtn =
        document.getElementById("clearSubjectsBtn");

    const subjectCheckboxes =
        document.getElementById("subjectCheckboxes");

    const cancelBtn =
        document.getElementById("cancelBtn");

    const studentMessage =
        document.getElementById("studentMessage");


    /* =====================================================
       DELETE MODAL ELEMENTS
    ===================================================== */

    const deleteModal =
        document.getElementById("deleteModal");

    const deleteStudentName =
        document.getElementById("deleteStudentName");

    const adminDeletePassword =
        document.getElementById("adminDeletePassword");

    const adminPasswordToggle =
        document.getElementById("adminPasswordToggle");

    const deleteError =
        document.getElementById("deleteError");

    const deleteCancelBtn =
        document.getElementById("deleteCancelBtn");

    const deleteConfirmBtn =
        document.getElementById("deleteConfirmBtn");


    /* =====================================================
       INITIAL CHECK
    ===================================================== */

    if (!db) {

        console.error(
            "FCA Supabase client not found."
        );

        showDatabaseStatus(
            "Database connection unavailable",
            false
        );

        showStudentListError(
            "The FCA database connection could not be found."
        );

        return;
    }

    console.log(
        "FCA Supabase client found."
    );

    showDatabaseStatus(
        "Database connected",
        true
    );


    /* =====================================================
       GET FORM NUMBER FROM URL
    ===================================================== */

    function getFormNumberFromUrl() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const form =
            parseInt(
                params.get("form"),
                10
            );

        if (
            Number.isInteger(form) &&
            form >= 1 &&
            form <= 4
        ) {

            return form;
        }

        return null;
    }


    /* =====================================================
       DATABASE STATUS
    ===================================================== */

    function showDatabaseStatus(
        message,
        connected
    ) {

        if (!databaseStatus) {
            return;
        }

        databaseStatus.textContent =
            message;

        databaseStatus.classList.toggle(
            "connected",
            connected
        );

        databaseStatus.classList.toggle(
            "error",
            !connected
        );
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initialize() {

        currentFormNumber =
            getFormNumberFromUrl();

        if (!currentFormNumber) {

            showStudentListError(
                "No valid class was selected."
            );

            if (pageTitle) {

                pageTitle.textContent =
                    "Students";
            }

            if (pageDescription) {

                pageDescription.textContent =
                    "Select a valid FCA class to manage students.";
            }

            return;
        }

        console.log(
            "Selected Form:",
            currentFormNumber
        );

        await loadClass();

        if (!currentClass) {
            return;
        }

        updatePageInformation();

        await loadStudents();
    }


    /* =====================================================
       LOAD CLASS
    ===================================================== */

    async function loadClass() {

        try {

            console.log(
                "Loading Form",
                currentFormNumber
            );

            const {
                data,
                error
            } = await db
                .from("classes")
                .select(`
                    id,
                    class_name,
                    class_code,
                    form_number
                `)
                .eq(
                    "form_number",
                    currentFormNumber
                )
                .maybeSingle();

            if (error) {

                console.error(
                    "Class loading error:",
                    error
                );

                showStudentListError(
                    "Unable to load class. " +
                    error.message
                );

                return;
            }

            if (!data) {

                console.warn(
                    "No class found for Form",
                    currentFormNumber
                );

                showStudentListError(
                    `Form ${currentFormNumber} has not been created yet.`
                );

                return;
            }

            currentClass =
                data;

            console.log(
                "Class loaded:",
                currentClass
            );

        } catch (error) {

            console.error(
                "Unexpected class error:",
                error
            );

            showStudentListError(
                "An unexpected error occurred while loading the class."
            );
        }
    }


    /* =====================================================
       UPDATE PAGE INFORMATION
    ===================================================== */

    function updatePageInformation() {

        if (!currentClass) {
            return;
        }

        const className =
            currentClass.class_name ||
            `Form ${currentFormNumber}`;

        const classCode =
            currentClass.class_code ||
            `FCA-F${currentFormNumber}`;

        if (pageTitle) {

            pageTitle.textContent =
                `${className} Students`;
        }

        if (pageDescription) {

            pageDescription.textContent =
                `Manage students enrolled in ${className}.`;
        }

        if (classNameStat) {

            classNameStat.textContent =
                className;
        }

        if (studentClass) {

            studentClass.value =
                `${className} (${classCode})`;
        }

        if (studentListDescription) {

            studentListDescription.textContent =
                `Students enrolled in ${className}.`;
        }

        const year =
            new Date().getFullYear();

        if (academicYearStat) {

            academicYearStat.textContent =
                year;
        }

        if (
            academicYear &&
            !academicYear.value
        ) {

            academicYear.value =
                year;
        }
    }


    /* =====================================================
       LOAD STUDENTS
    ===================================================== */

    async function loadStudents() {

        showStudentListLoading();

        try {

            let query =
                db
                    .from("students")
                    .select(`
                        id,
                        full_name,
                        student_id,
                        access_password,
                        class_id,
                        form_number,
                        subjects,
                        gender,
                        academic_year,
                        updated_at
                    `)
                    .eq(
                        "form_number",
                        currentFormNumber
                    )
                    .order(
                        "full_name",
                        {
                            ascending: true
                        }
                    );

            let {
                data,
                error
            } = await query;


            /*
             * Some older records may not have
             * form_number.
             *
             * If the first query returns no
             * students, try class_id.
             */

            if (
                !error &&
                (!data || data.length === 0) &&
                currentClass
            ) {

                const fallback =
                    await db
                        .from("students")
                        .select(`
                            id,
                            full_name,
                            student_id,
                            access_password,
                            class_id,
                            form_number,
                            subjects,
                            gender,
                            academic_year,
                            updated_at
                        `)
                        .eq(
                            "class_id",
                            currentClass.id
                        )
                        .order(
                            "full_name",
                            {
                                ascending: true
                            }
                        );

                data =
                    fallback.data;

                error =
                    fallback.error;
            }

            if (error) {

                console.error(
                    "Students loading error:",
                    error
                );

                showStudentListError(
                    "Unable to load students. " +
                    error.message
                );

                return;
            }

            students =
                Array.isArray(data)
                    ? data
                    : [];

            console.log(
                "Students loaded:",
                students.length
            );

            updateStudentCount();

            renderStudents();

        } catch (error) {

            console.error(
                "Unexpected students error:",
                error
            );

            showStudentListError(
                "An unexpected error occurred while loading students."
            );
        }
    }


    /* =====================================================
       LOADING STATE
    ===================================================== */

    function showStudentListLoading() {

        if (!studentList) {
            return;
        }

        studentList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    S
                </div>

                <strong>
                    Loading students...
                </strong>

                <p>
                    Connecting to the FCA database.
                </p>

            </div>
        `;
    }


    /* =====================================================
       ERROR STATE
    ===================================================== */

    function showStudentListError(message) {

        if (!studentList) {
            return;
        }

        studentList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <strong>
                    Unable to load students
                </strong>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>
        `;
    }


    /* =====================================================
       UPDATE STUDENT COUNT
    ===================================================== */

    function updateStudentCount() {

        if (studentCount) {

            studentCount.textContent =
                students.length;
        }
    }


    /* =====================================================
       RENDER STUDENTS
    ===================================================== */

    function renderStudents() {

        if (!studentList) {
            return;
        }

        if (students.length === 0) {

            studentList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        S
                    </div>

                    <strong>
                        No students yet
                    </strong>

                    <p>
                        Add the first student to this class.
                    </p>

                </div>
            `;

            return;
        }

        studentList.innerHTML =
            students
                .map(function (student) {

                    return createStudentCard(
                        student
                    );

                })
                .join("");
    }


    /* =====================================================
       CREATE STUDENT CARD
       
       MATCHES THE CURRENT STUDENTS.CSS
    ===================================================== */

    function createStudentCard(student) {

        const name =
            student.full_name ||
            "Unnamed Student";

        const id =
            student.student_id ||
            "No Student ID";

        const genderText =
            student.gender ||
            "Not specified";

        const year =
            student.academic_year ||
            "—";

        const subjects =
            Array.isArray(student.subjects)
                ? student.subjects
                : [];

        return `
            <div
                class="student-card"
                data-id="${escapeHtml(student.id)}"
            >

                <!-- STUDENT MAIN -->

                <div class="student-main">

                    <!-- AVATAR -->

                    <div class="student-avatar">
                        ${escapeHtml(
                            getInitials(name)
                        )}
                    </div>


                    <!-- STUDENT INFORMATION -->

                    <div class="student-info">

                        <!-- NAME + ID -->

                        <div class="student-name-row">

                            <h3>
                                ${escapeHtml(name)}
                            </h3>

                            <span class="student-id">
                                ${escapeHtml(id)}
                            </span>

                        </div>


                        <!-- DETAILS -->

                        <div class="student-details">

                            <div class="detail-item">

                                <span>
                                    Gender
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        genderText
                                    )}
                                </strong>

                            </div>


                            <div class="detail-item">

                                <span>
                                    Academic Year
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        String(year)
                                    )}
                                </strong>

                            </div>


                            <div class="detail-item">

                                <span>
                                    Class
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        currentClass
                                            ? currentClass.class_name
                                            : `Form ${currentFormNumber}`
                                    )}
                                </strong>

                            </div>


                            <div class="detail-item">

                                <span>
                                    Student ID
                                </span>

                                <strong>
                                    ${escapeHtml(id)}
                                </strong>

                            </div>

                        </div>


                        <!-- SUBJECTS -->

                        <div class="student-subjects">

                            <strong>
                                Subjects
                            </strong>

                            <div class="tags">

                                ${
                                    subjects.length > 0

                                        ? subjects
                                            .map(function (subject) {

                                                return `
                                                    <span
                                                        class="tag subject-tag"
                                                    >
                                                        ${escapeHtml(
                                                            subject
                                                        )}
                                                    </span>
                                                `;

                                            })
                                            .join("")

                                        : `
                                            <span class="none">
                                                No subjects selected
                                            </span>
                                        `
                                }

                            </div>

                        </div>

                    </div>

                </div>


                <!-- ACTIONS -->

                <div class="student-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        data-action="edit"
                        data-id="${escapeHtml(student.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-action="delete"
                        data-id="${escapeHtml(student.id)}"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;
    }


    /* =====================================================
       INITIALS
    ===================================================== */

    function getInitials(name) {

        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(function (part) {

                return part.charAt(0);

            })
            .join("")
            .toUpperCase();
    }


    /* =====================================================
       SUBJECT CHECKBOXES
       
       IMPORTANT:
       Subjects are STATIC in students.html,
       matching the Teachers page.
    ===================================================== */

    function getSubjectCheckboxes() {

        if (!subjectCheckboxes) {
            return [];
        }

        return Array.from(
            subjectCheckboxes.querySelectorAll(
                'input[type="checkbox"][name="subjects"]'
            )
        );
    }


    /* =====================================================
       SELECT ALL SUBJECTS
    ===================================================== */

    function selectAllSubjects() {

        getSubjectCheckboxes()
            .forEach(function (checkbox) {

                checkbox.checked =
                    true;
            });
    }


    /* =====================================================
       CLEAR SUBJECTS
    ===================================================== */

    function clearSubjects() {

        getSubjectCheckboxes()
            .forEach(function (checkbox) {

                checkbox.checked =
                    false;
            });
    }


    /* =====================================================
       GET SELECTED SUBJECTS
    ===================================================== */

    function getSelectedSubjects() {

        return getSubjectCheckboxes()
            .filter(function (checkbox) {

                return checkbox.checked;

            })
            .map(function (checkbox) {

                return checkbox.value;

            });
    }


    /* =====================================================
       SET STUDENT SUBJECTS
    ===================================================== */

    function setStudentSubjects(
        selectedSubjects
    ) {

        const selected =
            Array.isArray(selectedSubjects)
                ? selectedSubjects
                : [];

        getSubjectCheckboxes()
            .forEach(function (checkbox) {

                checkbox.checked =
                    selected.includes(
                        checkbox.value
                    );
            });
    }


    /* =====================================================
       OPEN ADD STUDENT FORM
    ===================================================== */

    function openAddStudentForm() {

        editingStudentId =
            null;

        if (studentForm) {
            studentForm.reset();
        }

        if (formTitle) {

            formTitle.textContent =
                "Add Student";
        }

        const year =
            new Date().getFullYear();

        if (academicYear) {

            academicYear.value =
                year;
        }

        if (
            studentClass &&
            currentClass
        ) {

            const className =
                currentClass.class_name ||
                `Form ${currentFormNumber}`;

            const classCode =
                currentClass.class_code ||
                `FCA-F${currentFormNumber}`;

            studentClass.value =
                `${className} (${classCode})`;
        }

        if (studentId) {
            studentId.value = "";
        }

        if (generatedStudentId) {
            generatedStudentId.value = "";
        }

        if (accessPassword) {
            accessPassword.value = "";
        }

        clearSubjects();

        clearStudentMessage();

        if (studentFormPanel) {

            studentFormPanel.classList.add(
                "active"
            );
        }

        if (firstName) {
            firstName.focus();
        }
    }


    /* =====================================================
       CLOSE STUDENT FORM
    ===================================================== */

    function closeStudentForm() {

        editingStudentId =
            null;

        if (studentFormPanel) {

            studentFormPanel.classList.remove(
                "active"
            );
        }

        clearStudentMessage();
    }


    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    function editStudent(id) {

        const student =
            students.find(function (item) {

                return item.id === id;

            });

        if (!student) {
            return;
        }

        editingStudentId =
            student.id;

        if (formTitle) {

            formTitle.textContent =
                "Edit Student";
        }

        const nameParts =
            splitFullName(
                student.full_name || ""
            );

        if (firstName) {

            firstName.value =
                nameParts.firstName;
        }

        if (lastName) {

            lastName.value =
                nameParts.lastName;
        }

        if (gender) {

            gender.value =
                student.gender || "";
        }

        if (academicYear) {

            academicYear.value =
                student.academic_year ||
                new Date().getFullYear();
        }

        if (
            studentClass &&
            currentClass
        ) {

            const className =
                currentClass.class_name ||
                `Form ${currentFormNumber}`;

            const classCode =
                currentClass.class_code ||
                `FCA-F${currentFormNumber}`;

            studentClass.value =
                `${className} (${classCode})`;
        }

        if (studentId) {

            studentId.value =
                student.student_id || "";
        }

        if (generatedStudentId) {

            generatedStudentId.value =
                student.student_id || "";
        }

        if (accessPassword) {

            accessPassword.value =
                student.access_password || "";
        }

        setStudentSubjects(
            student.subjects
        );

        clearStudentMessage();

        if (studentFormPanel) {

            studentFormPanel.classList.add(
                "active"
            );
        }

        if (firstName) {
            firstName.focus();
        }
    }


    /* =====================================================
       SPLIT FULL NAME
    ===================================================== */

    function splitFullName(fullName) {

        const parts =
            fullName
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (parts.length === 0) {

            return {
                firstName: "",
                lastName: ""
            };
        }

        if (parts.length === 1) {

            return {
                firstName: parts[0],
                lastName: ""
            };
        }

        return {
            firstName: parts[0],
            lastName: parts
                .slice(1)
                .join(" ")
        };
    }


    /* =====================================================
       GENERATE STUDENT ID
    ===================================================== */

    async function generateStudentId(
        first,
        last,
        year
    ) {

        const safeFirst =
            (first || "")
                .trim()
                .toUpperCase();

        const safeLast =
            (last || "")
                .trim()
                .toUpperCase();

        let prefix =
            safeLast
                .replace(/[^A-Z]/g, "")
                .substring(0, 3);

        if (prefix.length < 3) {

            prefix =
                (
                    safeFirst +
                    prefix
                )
                    .replace(
                        /[^A-Z]/g,
                        ""
                    )
                    .padEnd(
                        3,
                        "X"
                    )
                    .substring(
                        0,
                        3
                    );
        }

        const academicYearValue =
            parseInt(
                year,
                10
            ) ||
            new Date().getFullYear();

        const basePrefix =
            `FCA-${academicYearValue}-${prefix}`;

        const {
            data,
            error
        } = await db
            .from("students")
            .select("student_id")
            .ilike(
                "student_id",
                `${basePrefix}-%`
            );

        if (error) {

            console.error(
                "Student ID lookup error:",
                error
            );

            throw error;
        }

        const existingIds =
            new Set(
                (data || [])
                    .map(function (item) {

                        return item.student_id;

                    })
                    .filter(Boolean)
            );

        let number = 1;
        let newId = "";

        do {

            newId =
                `${basePrefix}-${String(number).padStart(3, "0")}`;

            number++;

        } while (
            existingIds.has(newId)
        );

        return newId;
    }


    /* =====================================================
       GENERATE ACCESS PASSWORD
    ===================================================== */

    function generateAccessPassword() {

        const letters =
            "abcdefghijklmnopqrstuvwxyz";

        const numbers =
            "0123456789";

        let password =
            "fca@";

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            password +=
                letters.charAt(
                    Math.floor(
                        Math.random() *
                        letters.length
                    )
                );
        }

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            password +=
                numbers.charAt(
                    Math.floor(
                        Math.random() *
                        numbers.length
                    )
                );
        }

        return password;
    }


    /* =====================================================
       SAVE STUDENT
    ===================================================== */

    async function saveStudent() {

        clearStudentMessage();

        const first =
            firstName
                ? firstName.value.trim()
                : "";

        const last =
            lastName
                ? lastName.value.trim()
                : "";

        const selectedGender =
            gender
                ? gender.value
                : "";

        const selectedYear =
            academicYear
                ? parseInt(
                    academicYear.value,
                    10
                )
                : new Date().getFullYear();


        if (!first) {

            showStudentMessage(
                "Please enter the student's first name.",
                "error"
            );

            if (firstName) {
                firstName.focus();
            }

            return;
        }


        if (!last) {

            showStudentMessage(
                "Please enter the student's last name.",
                "error"
            );

            if (lastName) {
                lastName.focus();
            }

            return;
        }


        if (!selectedYear) {

            showStudentMessage(
                "Please enter the academic year.",
                "error"
            );

            return;
        }


        if (!currentClass) {

            showStudentMessage(
                "No class is currently selected.",
                "error"
            );

            return;
        }


        const subjects =
            getSelectedSubjects();


        try {

            let generatedId =
                studentId
                    ? studentId.value.trim()
                    : "";

            let password =
                accessPassword
                    ? accessPassword.value.trim()
                    : "";


            /* =================================================
               GENERATE CREDENTIALS FOR NEW STUDENT
            ================================================= */

            if (!editingStudentId) {

                generatedId =
                    await generateStudentId(
                        first,
                        last,
                        selectedYear
                    );

                password =
                    generateAccessPassword();

            } else {

                /*
                 * Keep existing credentials when
                 * editing unless missing.
                 */

                if (!generatedId) {

                    generatedId =
                        await generateStudentId(
                            first,
                            last,
                            selectedYear
                        );
                }

                if (!password) {

                    password =
                        generateAccessPassword();
                }
            }


            const fullName =
                `${first} ${last}`.trim();


            const payload = {

                full_name:
                    fullName,

                student_id:
                    generatedId,

                access_password:
                    password,

                class_id:
                    currentClass.id,

                form_number:
                    currentFormNumber,

                subjects:
                    subjects,

                gender:
                    selectedGender || null,

                academic_year:
                    selectedYear,

                updated_at:
                    new Date().toISOString()
            };


            /* =================================================
               UPDATE EXISTING STUDENT
            ================================================= */

            if (editingStudentId) {

                const {
                    error
                } = await db
                    .from("students")
                    .update(payload)
                    .eq(
                        "id",
                        editingStudentId
                    );

                if (error) {

                    console.error(
                        "Student update error:",
                        error
                    );

                    showStudentMessage(
                        "Unable to update student. " +
                        error.message,
                        "error"
                    );

                    return;
                }

                showStudentMessage(
                    "Student updated successfully.",
                    "success"
                );

            }


            /* =================================================
               INSERT NEW STUDENT
            ================================================= */

            else {

                const {
                    error
                } = await db
                    .from("students")
                    .insert(payload);

                if (error) {

                    console.error(
                        "Student insert error:",
                        error
                    );

                    showStudentMessage(
                        "Unable to add student. " +
                        error.message,
                        "error"
                    );

                    return;
                }


                /*
                 * Show generated credentials
                 * before closing.
                 */

                if (studentId) {

                    studentId.value =
                        generatedId;
                }

                if (generatedStudentId) {

                    generatedStudentId.value =
                        generatedId;
                }

                if (accessPassword) {

                    accessPassword.value =
                        password;
                }

                showStudentMessage(
                    "Student added successfully.",
                    "success"
                );
            }


            await loadStudents();


            /*
             * Close form after successful save.
             */

            setTimeout(
                function () {

                    closeStudentForm();

                },
                700
            );

        } catch (error) {

            console.error(
                "Save student error:",
                error
            );

            showStudentMessage(
                "An unexpected error occurred while saving the student.",
                "error"
            );
        }
    }


    /* =====================================================
       STUDENT MESSAGE
    ===================================================== */

    function showStudentMessage(
        message,
        type
    ) {

        if (!studentMessage) {
            return;
        }

        studentMessage.textContent =
            message;

        studentMessage.className =
            "student-message " +
            (type || "");
    }


    function clearStudentMessage() {

        if (!studentMessage) {
            return;
        }

        studentMessage.textContent =
            "";

        studentMessage.className =
            "student-message";
    }


    /* =====================================================
       OPEN DELETE STUDENT MODAL
    ===================================================== */

    function openDeleteStudentModal(id) {

        const student =
            students.find(function (item) {

                return item.id === id;

            });

        if (!student) {
            return;
        }

        selectedStudentId =
            student.id;

        if (deleteStudentName) {

            deleteStudentName.textContent =
                student.full_name ||
                "this student";
        }

        if (adminDeletePassword) {

            adminDeletePassword.value =
                "";

            adminDeletePassword.type =
                "password";
        }

        if (deleteError) {

            deleteError.textContent =
                "";
        }

        if (deleteModal) {

            deleteModal.classList.add(
                "active"
            );
        }

        if (adminDeletePassword) {

            adminDeletePassword.focus();
        }
    }


    /* =====================================================
       CLOSE DELETE MODAL
    ===================================================== */

    function closeDeleteModal() {

        selectedStudentId =
            null;

        if (deleteModal) {

            deleteModal.classList.remove(
                "active"
            );
        }

        if (adminDeletePassword) {

            adminDeletePassword.value =
                "";

            adminDeletePassword.type =
                "password";
        }

        if (deleteError) {

            deleteError.textContent =
                "";
        }

        /*
         * Reset administrator eye icon.
         */

        updatePasswordEye(
            adminPasswordToggle,
            false
        );
    }


    /* =====================================================
       CONFIRM DELETE STUDENT
    ===================================================== */

    async function confirmDeleteStudent() {

        if (!selectedStudentId) {
            return;
        }

        const password =
            adminDeletePassword
                ? adminDeletePassword.value.trim()
                : "";

        if (!password) {

            showDeleteError(
                "Please enter the administrator password."
            );

            return;
        }

        if (deleteConfirmBtn) {

            deleteConfirmBtn.disabled =
                true;

            deleteConfirmBtn.textContent =
                "Deleting...";
        }

        try {

            /*
             * Re-authenticate administrator.
             */

            const {
                error: authError
            } =
                await db.auth.signInWithPassword({
                    email:
                        FCA_ADMIN_EMAIL,

                    password:
                        password
                });


            if (authError) {

                console.error(
                    "Admin authentication error:",
                    authError
                );

                showDeleteError(
                    "Administrator password is incorrect."
                );

                return;
            }


            /* =================================================
               DELETE STUDENT
            ================================================= */

            const {
                error
            } =
                await db
                    .from("students")
                    .delete()
                    .eq(
                        "id",
                        selectedStudentId
                    );


            if (error) {

                console.error(
                    "Student deletion error:",
                    error
                );

                showDeleteError(
                    "Unable to delete student. " +
                    error.message
                );

                return;
            }


            console.log(
                "Student deleted successfully."
            );


            closeDeleteModal();

            await loadStudents();

        } catch (error) {

            console.error(
                "Delete student error:",
                error
            );

            showDeleteError(
                "An unexpected error occurred while deleting the student."
            );

        } finally {

            if (deleteConfirmBtn) {

                deleteConfirmBtn.disabled =
                    false;

                deleteConfirmBtn.textContent =
                    "Delete Student";
            }
        }
    }


    /* =====================================================
       DELETE ERROR
    ===================================================== */

    function showDeleteError(message) {

        if (!deleteError) {
            return;
        }

        deleteError.textContent =
            message;
    }


    /* =====================================================
       PASSWORD TOGGLE
       
       STUDENT PASSWORD
    ===================================================== */

    function togglePassword() {

        if (!accessPassword) {
            return;
        }

        const isPassword =
            accessPassword.type ===
            "password";

        accessPassword.type =
            isPassword
                ? "text"
                : "password";

        updatePasswordEye(
            passwordToggle,
            isPassword
        );
    }


    /* =====================================================
       ADMIN PASSWORD TOGGLE
    ===================================================== */

    function toggleAdminDeletePassword() {

        if (!adminDeletePassword) {
            return;
        }

        const isPassword =
            adminDeletePassword.type ===
            "password";

        adminDeletePassword.type =
            isPassword
                ? "text"
                : "password";

        updatePasswordEye(
            adminPasswordToggle,
            isPassword
        );
    }


    /* =====================================================
       PASSWORD EYE ICON
    ===================================================== */

    function updatePasswordEye(
        button,
        showingPassword
    ) {

        if (!button) {
            return;
        }

        const openEye = `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <path
                    d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                />

                <circle
                    cx="12"
                    cy="12"
                    r="2.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                />

            </svg>
        `;


        const closedEye = `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <path
                    d="M3 3l18 18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />

                <path
                    d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a17.4 17.4 0 0 1-3.3 3.8M6.2 6.8C3.7 8.3 2 12 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

            </svg>
        `;


        button.innerHTML =
            showingPassword
                ? closedEye
                : openEye;


        button.setAttribute(
            "aria-label",
            showingPassword
                ? "Hide password"
                : "Show password"
        );
    }


    /* =====================================================
       EVENT HANDLERS
    ===================================================== */

    if (addStudentBtn) {

        addStudentBtn.addEventListener(
            "click",
            openAddStudentForm
        );
    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            closeStudentForm
        );
    }


    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                saveStudent();
            }
        );
    }


    /* =====================================================
       SUBJECT BUTTONS
    ===================================================== */

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


    /* =====================================================
       PASSWORD BUTTONS
    ===================================================== */

    if (passwordToggle) {

        passwordToggle.addEventListener(
            "click",
            togglePassword
        );
    }


    if (adminPasswordToggle) {

        adminPasswordToggle.addEventListener(
            "click",
            toggleAdminDeletePassword
        );
    }


    /* =====================================================
       DELETE MODAL BUTTONS
    ===================================================== */

    if (deleteCancelBtn) {

        deleteCancelBtn.addEventListener(
            "click",
            closeDeleteModal
        );
    }


    if (deleteConfirmBtn) {

        deleteConfirmBtn.addEventListener(
            "click",
            confirmDeleteStudent
        );
    }


    /* =====================================================
       STUDENT LIST EVENTS
       
       Event delegation keeps Edit/Delete working
       for dynamically rendered cards.
    ===================================================== */

    if (studentList) {

        studentList.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "button[data-action]"
                    );

                if (!button) {
                    return;
                }

                const action =
                    button.dataset.action;

                const id =
                    button.dataset.id;

                if (!id) {
                    return;
                }

                if (action === "edit") {

                    editStudent(id);

                } else if (
                    action === "delete"
                ) {

                    openDeleteStudentModal(id);
                }
            }
        );
    }


    /* =====================================================
       CLOSE MODAL WHEN CLICKING BACKDROP
    ===================================================== */

    if (deleteModal) {

        deleteModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    deleteModal
                ) {

                    closeDeleteModal();
                }
            }
        );
    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {
                return;
            }


            if (
                deleteModal &&
                deleteModal.classList.contains(
                    "active"
                )
            ) {

                closeDeleteModal();

                return;
            }


            if (
                studentFormPanel &&
                studentFormPanel.classList.contains(
                    "active"
                )
            ) {

                closeStudentForm();
            }
        }
    );


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

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


    /* =====================================================
       START
    ===================================================== */

    initialize();

});