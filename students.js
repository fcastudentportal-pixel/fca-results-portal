"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   STUDENTS MANAGEMENT
   SUPABASE VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("FCA Students: starting...");


    /* =====================================================
       SUPABASE
    ===================================================== */

    const supabase = window.fcaSupabase;


    if (!supabase) {

        console.error(
            "FCA Supabase client not found."
        );

        const status =
            document.getElementById("databaseStatus");

        if (status) {

            status.textContent =
                "Database connection unavailable.";

            status.className =
                "database-status error";

        }

        return;

    }


    console.log(
        "FCA Supabase client found."
    );


    /* =====================================================
       STATE
    ===================================================== */

    let classes = [];

    let students = [];

    let selectedClass = null;

    let editingStudent = null;

    let deletingStudent = null;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const databaseStatus =
        document.getElementById(
            "databaseStatus"
        );


    const classesSection =
        document.getElementById(
            "classesSection"
        );


    const studentsSection =
        document.getElementById(
            "studentsSection"
        );


    const classesContainer =
        document.getElementById(
            "classesContainer"
        );


    const noClassesState =
        document.getElementById(
            "noClassesState"
        );


    const studentsGrid =
        document.getElementById(
            "studentsGrid"
        );


    const noStudentsState =
        document.getElementById(
            "noStudentsState"
        );


    const studentCount =
        document.getElementById(
            "studentCount"
        );


    const selectedClassTitle =
        document.getElementById(
            "selectedClassTitle"
        );


    const selectedClassDescription =
        document.getElementById(
            "selectedClassDescription"
        );


    const selectedClassCode =
        document.getElementById(
            "selectedClassCode"
        );


    const addStudentButton =
        document.getElementById(
            "addStudentButton"
        );


    const emptyAddStudentButton =
        document.getElementById(
            "emptyAddStudentButton"
        );


    const backToClassesButton =
        document.getElementById(
            "backToClassesButton"
        );


    /* =====================================================
       ADD STUDENT
    ===================================================== */

    const addStudentModal =
        document.getElementById(
            "addStudentModal"
        );


    const addStudentForm =
        document.getElementById(
            "addStudentForm"
        );


    const studentFullName =
        document.getElementById(
            "studentFullName"
        );


    const studentGender =
        document.getElementById(
            "studentGender"
        );


    const studentIdPreview =
        document.getElementById(
            "studentIdPreview"
        );


    const studentPasswordPreview =
        document.getElementById(
            "studentPasswordPreview"
        );


    const studentClassPreview =
        document.getElementById(
            "studentClassPreview"
        );


    const addStudentError =
        document.getElementById(
            "addStudentError"
        );


    const addStudentSuccess =
        document.getElementById(
            "addStudentSuccess"
        );


    const createdStudentId =
        document.getElementById(
            "createdStudentId"
        );


    const createdStudentPassword =
        document.getElementById(
            "createdStudentPassword"
        );


    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    const editStudentModal =
        document.getElementById(
            "editStudentModal"
        );


    const editStudentForm =
        document.getElementById(
            "editStudentForm"
        );


    const editStudentFullName =
        document.getElementById(
            "editStudentFullName"
        );


    const editStudentGender =
        document.getElementById(
            "editStudentGender"
        );


    const editStudentId =
        document.getElementById(
            "editStudentId"
        );


    const editStudentPassword =
        document.getElementById(
            "editStudentPassword"
        );


    const editStudentClass =
        document.getElementById(
            "editStudentClass"
        );


    const editStudentError =
        document.getElementById(
            "editStudentError"
        );


    /* =====================================================
       DELETE STUDENT
    ===================================================== */

    const deleteStudentModal =
        document.getElementById(
            "deleteStudentModal"
        );


    const deleteStudentError =
        document.getElementById(
            "deleteStudentError"
        );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    initialize();


    async function initialize() {

        setDatabaseStatus(
            "Checking database...",
            "loading"
        );


        try {

            /*
             * First test the classes table.
             * This page depends on classes first.
             */

            const {
                error: classesError
            } =
                await supabase
                    .from("classes")
                    .select("id")
                    .limit(1);


            if (classesError) {

                throw classesError;

            }


            await loadClasses();


            await loadStudents();


            setDatabaseStatus(
                "Database connected",
                "success"
            );


            openClassFromUrl();


            console.log(
                "FCA Students: initialization complete."
            );


        } catch (error) {

            console.error(
                "FCA Students initialization error:",
                error
            );


            setDatabaseStatus(
                "Database connection failed",
                "error"
            );

        }

    }


    /* =====================================================
       DATABASE STATUS
    ===================================================== */

    function setDatabaseStatus(
        message,
        type
    ) {

        if (!databaseStatus) {
            return;
        }


        databaseStatus.textContent =
            message;


        databaseStatus.className =
            "database-status " + type;

    }


    /* =====================================================
       LOAD CLASSES
    ===================================================== */

    async function loadClasses() {

        const {
            data,
            error
        } =
            await supabase
                .from("classes")
                .select(
                    "id, class_name, class_code, description, form_number"
                )
                .order(
                    "form_number",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Error loading classes:",
                error
            );

            throw error;

        }


        classes =
            Array.isArray(data)
                ? data
                : [];


        renderClasses();

    }


    /* =====================================================
       LOAD STUDENTS
    ===================================================== */

    async function loadStudents() {

        const {
            data,
            error
        } =
            await supabase
                .from("students")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Error loading students:",
                error
            );

            throw error;

        }


        students =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Students loaded:",
            students.length
        );

    }


    /* =====================================================
       RENDER CLASSES
    ===================================================== */

    function renderClasses() {

        if (!classesContainer) {
            return;
        }


        classesContainer.innerHTML = "";


        if (!classes.length) {

            noClassesState.hidden = false;

            return;

        }


        noClassesState.hidden = true;


        classes.forEach(
            function (classItem) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "class-card";


                const className =
                    escapeHtml(
                        getClassName(
                            classItem
                        )
                    );


                const classCode =
                    escapeHtml(
                        classItem.class_code || ""
                    );


                const description =
                    escapeHtml(
                        classItem.description || ""
                    );


                card.innerHTML = `

                    <div class="class-card-content">

                        <div class="class-card-main">

                            <h3>
                                ${className}
                            </h3>

                            ${
                                classCode
                                    ? `
                                        <span class="class-card-code">
                                            ${classCode}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>


                        ${
                            description
                                ? `
                                    <p class="class-card-description">
                                        ${description}
                                    </p>
                                  `
                                : ""
                        }

                    </div>


                    <div class="class-card-actions">

                        <button
                            type="button"
                            class="view-class-button"
                        >
                            View Students
                        </button>

                    </div>

                `;


                const viewButton =
                    card.querySelector(
                        ".view-class-button"
                    );


                viewButton.addEventListener(
                    "click",
                    function () {

                        openClass(
                            classItem
                        );

                    }
                );


                classesContainer.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       URL CLASS
    ===================================================== */

    function openClassFromUrl() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const form =
            params.get("form");


        if (!form) {
            return;
        }


        const classItem =
            classes.find(
                function (item) {

                    return String(
                        item.form_number
                    ) === String(form);

                }
            );


        if (classItem) {

            openClass(
                classItem
            );

        }

    }


    /* =====================================================
       OPEN CLASS
    ===================================================== */

    function openClass(classItem) {

        selectedClass =
            classItem;


        classesSection.hidden =
            true;


        studentsSection.hidden =
            false;


        selectedClassTitle.textContent =
            getClassName(
                classItem
            );


        selectedClassDescription.textContent =
            classItem.description ||
            "Manage students in this class.";


        selectedClassCode.textContent =
            classItem.class_code ||
            `Form ${classItem.form_number}`;


        renderStudents();


        const newUrl =
            `${window.location.pathname}?form=${encodeURIComponent(
                classItem.form_number
            )}`;


        window.history.replaceState(
            {},
            "",
            newUrl
        );

    }


    /* =====================================================
       BACK TO CLASSES
    ===================================================== */

    function backToClasses() {

        selectedClass =
            null;


        studentsSection.hidden =
            true;


        classesSection.hidden =
            false;


        window.history.replaceState(
            {},
            "",
            window.location.pathname
        );

    }


    /* =====================================================
       RENDER STUDENTS
    ===================================================== */

    function renderStudents() {

        if (!selectedClass) {
            return;
        }


        const classStudents =
            students.filter(
                function (student) {

                    if (
                        student.class_id !== null &&
                        student.class_id !== undefined
                    ) {

                        return String(
                            student.class_id
                        ) === String(
                            selectedClass.id
                        );

                    }


                    return String(
                        student.form_number
                    ) === String(
                        selectedClass.form_number
                    );

                }
            );


        studentCount.textContent =
            classStudents.length;


        studentsGrid.innerHTML =
            "";


        if (!classStudents.length) {

            noStudentsState.hidden =
                false;

            return;

        }


        noStudentsState.hidden =
            true;


        classStudents.forEach(
            function (student) {

                studentsGrid.appendChild(
                    createStudentCard(
                        student
                    )
                );

            }
        );

    }


    /* =====================================================
       STUDENT CARD
    ===================================================== */

    function createStudentCard(
        student
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "student-card";


        const fullName =
            student.full_name ||
            "Unnamed Student";


        const studentId =
            student.student_id ||
            "Not assigned";


        const gender =
            student.gender ||
            "Not specified";


        const password =
            student.access_password ||
            "Not available";


        const className =
            getStudentClassName(
                student
            );


        const subjects =
            normalizeSubjects(
                student.subjects
            );


        const initials =
            getInitials(
                fullName
            );


        card.innerHTML = `

            <div class="student-card-header">

                <div class="student-avatar">
                    ${escapeHtml(initials)}
                </div>


                <div class="student-card-title">

                    <h3>
                        ${escapeHtml(fullName)}
                    </h3>

                    <span>
                        ${escapeHtml(studentId)}
                    </span>

                </div>

            </div>


            <div class="student-card-details">


                <div class="student-detail">

                    <span>
                        Full Name
                    </span>

                    <strong>
                        ${escapeHtml(fullName)}
                    </strong>

                </div>


                <div class="student-detail">

                    <span>
                        Gender
                    </span>

                    <strong>
                        ${escapeHtml(gender)}
                    </strong>

                </div>


                <div class="student-detail">

                    <span>
                        Student ID
                    </span>

                    <strong>
                        ${escapeHtml(studentId)}
                    </strong>

                </div>


                <div class="student-detail">

                    <span>
                        Access Password
                    </span>

                    <strong>
                        ${escapeHtml(password)}
                    </strong>

                </div>


                <div class="student-detail">

                    <span>
                        Class
                    </span>

                    <strong>
                        ${escapeHtml(className)}
                    </strong>

                </div>


            </div>


            <div class="student-subjects">

                <span class="student-subjects-label">
                    Subjects Taken
                </span>


                <div class="student-subject-tags">

                    ${
                        subjects.length

                            ? subjects.map(
                                function (subject) {

                                    return `
                                        <span class="subject-tag">
                                            ${escapeHtml(subject)}
                                        </span>
                                    `;

                                }
                              ).join("")

                            : `
                                <span class="subject-empty">
                                    No subjects assigned
                                </span>
                              `
                    }

                </div>

            </div>


            <div class="student-card-actions">

                <button
                    type="button"
                    class="edit-student-button"
                >
                    Edit Student
                </button>


                <button
                    type="button"
                    class="delete-student-button"
                >
                    Delete Student
                </button>

            </div>

        `;


        card
            .querySelector(
                ".edit-student-button"
            )
            .addEventListener(
                "click",
                function () {

                    openEditStudentModal(
                        student
                    );

                }
            );


        card
            .querySelector(
                ".delete-student-button"
            )
            .addEventListener(
                "click",
                function () {

                    openDeleteStudentModal(
                        student
                    );

                }
            );


        return card;

    }


    /* =====================================================
       ADD STUDENT MODAL
    ===================================================== */

    function openAddStudentModal() {

        if (!selectedClass) {
            return;
        }


        addStudentForm.hidden =
            false;


        addStudentSuccess.hidden =
            true;


        clearError(
            addStudentError
        );


        studentFullName.value =
            "";


        studentGender.value =
            "";


        studentClassPreview.value =
            getClassName(
                selectedClass
            );


        clearSubjectCheckboxes(
            "addStudentSubject"
        );


        studentIdPreview.value =
            generateStudentId(
                selectedClass.form_number
            );


        studentPasswordPreview.value =
            generateAccessPassword();


        addStudentModal.hidden =
            false;


        setTimeout(
            function () {

                studentFullName.focus();

            },
            50
        );

    }


    function closeAddStudentModal() {

        addStudentModal.hidden =
            true;


        clearError(
            addStudentError
        );

    }


    /* =====================================================
       SAVE STUDENT
    ===================================================== */

    async function saveNewStudent(
        event
    ) {

        event.preventDefault();


        if (!selectedClass) {

            showError(
                addStudentError,
                "Please select a class first."
            );

            return;

        }


        const fullName =
            studentFullName.value.trim();


        const gender =
            studentGender.value.trim();


        const studentId =
            studentIdPreview.value.trim();


        const password =
            studentPasswordPreview.value.trim();


        const subjects =
            getSelectedSubjects(
                "addStudentSubject"
            );


        clearError(
            addStudentError
        );


        if (!fullName) {

            showError(
                addStudentError,
                "Please enter the student's full name."
            );

            studentFullName.focus();

            return;

        }


        if (!gender) {

            showError(
                addStudentError,
                "Please select the student's gender."
            );

            studentGender.focus();

            return;

        }


        if (!subjects.length) {

            showError(
                addStudentError,
                "Please select at least one subject."
            );

            return;

        }


        const newStudent = {

            id:
                crypto.randomUUID(),

            full_name:
                fullName,

            gender:
                gender,

            student_id:
                studentId,

            access_password:
                password,

            class_id:
                selectedClass.id,

            form_number:
                Number(
                    selectedClass.form_number
                ),

            subjects:
                subjects

        };


        const {
            data,
            error
        } =
            await supabase
                .from("students")
                .insert(
                    newStudent
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Create student error:",
                error
            );


            showError(
                addStudentError,
                getSupabaseErrorMessage(
                    error
                )
            );

            return;

        }


        students.unshift(
            data
        );


        renderStudents();


        createdStudentId.textContent =
            data.student_id;


        createdStudentPassword.textContent =
            data.access_password;


        addStudentForm.hidden =
            true;


        addStudentSuccess.hidden =
            false;

    }


    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    function openEditStudentModal(
        student
    ) {

        editingStudent =
            student;


        clearError(
            editStudentError
        );


        editStudentFullName.value =
            student.full_name || "";


        editStudentGender.value =
            student.gender || "";


        editStudentId.value =
            student.student_id || "";


        editStudentPassword.value =
            student.access_password || "";


        editStudentClass.value =
            getStudentClassName(
                student
            );


        clearSubjectCheckboxes(
            "editStudentSubject"
        );


        const subjects =
            normalizeSubjects(
                student.subjects
            );


        document
            .querySelectorAll(
                'input[name="editStudentSubject"]'
            )
            .forEach(
                function (checkbox) {

                    checkbox.checked =
                        subjects.includes(
                            checkbox.value
                        );

                }
            );


        editStudentModal.hidden =
            false;


        setTimeout(
            function () {

                editStudentFullName.focus();

            },
            50
        );

    }


    function closeEditStudentModal() {

        editStudentModal.hidden =
            true;


        editingStudent =
            null;


        clearError(
            editStudentError
        );

    }


    /* =====================================================
       UPDATE STUDENT
    ===================================================== */

    async function updateStudent(
        event
    ) {

        event.preventDefault();


        if (!editingStudent) {
            return;
        }


        const fullName =
            editStudentFullName.value.trim();


        const gender =
            editStudentGender.value.trim();


        const password =
            editStudentPassword.value.trim();


        const subjects =
            getSelectedSubjects(
                "editStudentSubject"
            );


        clearError(
            editStudentError
        );


        if (!fullName) {

            showError(
                editStudentError,
                "Please enter the student's full name."
            );

            return;

        }


        if (!gender) {

            showError(
                editStudentError,
                "Please select the student's gender."
            );

            return;

        }


        if (!password) {

            showError(
                editStudentError,
                "Please enter an access password."
            );

            return;

        }


        if (!subjects.length) {

            showError(
                editStudentError,
                "Please select at least one subject."
            );

            return;

        }


        const updates = {

            full_name:
                fullName,

            gender:
                gender,

            access_password:
                password,

            subjects:
                subjects

        };


        const {
            data,
            error
        } =
            await supabase
                .from("students")
                .update(
                    updates
                )
                .eq(
                    "id",
                    editingStudent.id
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Update student error:",
                error
            );


            showError(
                editStudentError,
                getSupabaseErrorMessage(
                    error
                )
            );

            return;

        }


        const index =
            students.findIndex(
                function (student) {

                    return String(
                        student.id
                    ) === String(
                        editingStudent.id
                    );

                }
            );


        if (index !== -1) {

            students[index] =
                data;

        }


        renderStudents();


        closeEditStudentModal();

    }


    /* =====================================================
       DELETE STUDENT
    ===================================================== */

    function openDeleteStudentModal(
        student
    ) {

        deletingStudent =
            student;


        clearError(
            deleteStudentError
        );


        deleteStudentModal.hidden =
            false;

    }


    function closeDeleteStudentModal() {

        deleteStudentModal.hidden =
            true;


        deletingStudent =
            null;


        clearError(
            deleteStudentError
        );

    }


    async function deleteStudent() {

        if (!deletingStudent) {
            return;
        }


        clearError(
            deleteStudentError
        );


        const {
            error
        } =
            await supabase
                .from("students")
                .delete()
                .eq(
                    "id",
                    deletingStudent.id
                );


        if (error) {

            console.error(
                "Delete student error:",
                error
            );


            showError(
                deleteStudentError,
                getSupabaseErrorMessage(
                    error
                )
            );

            return;

        }


        students =
            students.filter(
                function (student) {

                    return String(
                        student.id
                    ) !== String(
                        deletingStudent.id
                    );

                }
            );


        closeDeleteStudentModal();


        renderStudents();

    }


    /* =====================================================
       STUDENT ID
    ===================================================== */

    function generateStudentId(
        formNumber
    ) {

        const year =
            new Date().getFullYear();


        const surnameCode =
            getSurnameCode(
                studentFullName.value
            );


        const prefix =
            `FCA-${year}-${surnameCode}`;


        let highestNumber =
            0;


        students.forEach(
            function (student) {

                const existingId =
                    String(
                        student.student_id || ""
                    );


                if (
                    existingId.startsWith(
                        prefix + "-"
                    )
                ) {

                    const parts =
                        existingId.split("-");


                    const number =
                        Number(
                            parts[
                                parts.length - 1
                            ]
                        );


                    if (
                        Number.isFinite(
                            number
                        ) &&
                        number >
                            highestNumber
                    ) {

                        highestNumber =
                            number;

                    }

                }

            }
        );


        return (
            `${prefix}-${highestNumber + 1}`
        );

    }


    /* =====================================================
       PASSWORD
    ===================================================== */

    function generateAccessPassword() {

        const numbers =
            Math.floor(
                100 +
                Math.random() * 900
            );


        const letters =
            Math.random()
                .toString(36)
                .substring(2, 5)
                .toLowerCase();


        return (
            `fca@${numbers}${letters}`
        );

    }


    /* =====================================================
       SURNAME CODE
    ===================================================== */

    function getSurnameCode(
        fullName
    ) {

        const parts =
            String(
                fullName || ""
            )
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!parts.length) {
            return "XX";
        }


        const surname =
            parts[
                parts.length - 1
            ]
                .replace(
                    /[^A-Za-z]/g,
                    ""
                )
                .toUpperCase();


        if (!surname) {
            return "XX";
        }


        return (
            surname.substring(0, 2) ||
            "XX"
        );

    }


    /* =====================================================
       CLASS NAME
    ===================================================== */

    function getClassName(
        classItem
    ) {

        if (!classItem) {
            return "Unknown Class";
        }


        if (classItem.class_name) {

            return classItem.class_name;

        }


        if (
            classItem.form_number !==
                null &&
            classItem.form_number !==
                undefined
        ) {

            return (
                `Form ${classItem.form_number}`
            );

        }


        return "Unknown Class";

    }


    /* =====================================================
       STUDENT CLASS
    ===================================================== */

    function getStudentClassName(
        student
    ) {

        if (!student) {
            return "Unknown Class";
        }


        const classItem =
            classes.find(
                function (item) {

                    return String(
                        item.id
                    ) === String(
                        student.class_id
                    );

                }
            );


        if (classItem) {

            return getClassName(
                classItem
            );

        }


        if (
            student.form_number !==
                null &&
            student.form_number !==
                undefined
        ) {

            return (
                `Form ${student.form_number}`
            );

        }


        return "Unknown Class";

    }


    /* =====================================================
       INITIALS
    ===================================================== */

    function getInitials(
        name
    ) {

        const parts =
            String(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!parts.length) {
            return "ST";
        }


        if (parts.length === 1) {

            return parts[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            parts[0][0] +
            parts[
                parts.length - 1
            ][0]
        ).toUpperCase();

    }


    /* =====================================================
       SUBJECTS
    ===================================================== */

    function normalizeSubjects(
        subjects
    ) {

        if (
            Array.isArray(
                subjects
            )
        ) {

            return subjects
                .filter(Boolean)
                .map(String);

        }


        if (
            typeof subjects ===
            "string"
        ) {

            try {

                const parsed =
                    JSON.parse(
                        subjects
                    );


                if (
                    Array.isArray(
                        parsed
                    )
                ) {

                    return parsed
                        .filter(Boolean)
                        .map(String);

                }

            } catch (error) {

                return subjects
                    .split(",")
                    .map(
                        function (item) {

                            return item.trim();

                        }
                    )
                    .filter(Boolean);

            }

        }


        return [];

    }


    function getSelectedSubjects(
        name
    ) {

        return Array.from(
            document.querySelectorAll(
                `input[name="${name}"]:checked`
            )
        ).map(
            function (checkbox) {

                return checkbox.value;

            }
        );

    }


    function clearSubjectCheckboxes(
        name
    ) {

        document
            .querySelectorAll(
                `input[name="${name}"]`
            )
            .forEach(
                function (checkbox) {

                    checkbox.checked =
                        false;

                }
            );

    }


    /* =====================================================
       ERRORS
    ===================================================== */

    function showError(
        element,
        message
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            message;


        element.hidden =
            false;

    }


    function clearError(
        element
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            "";


        element.hidden =
            true;

    }


    /* =====================================================
       SUPABASE ERROR
    ===================================================== */

    function getSupabaseErrorMessage(
        error
    ) {

        if (!error) {

            return (
                "An unexpected error occurred."
            );

        }


        const message =
            String(
                error.message || ""
            );


        if (
            message
                .toLowerCase()
                .includes("gender")
        ) {

            return (
                "The Gender field could not be saved. " +
                "Make sure the gender column exists " +
                "in the students table."
            );

        }


        return (
            message ||
            "An unexpected database error occurred."
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

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


    /* =====================================================
       EVENTS
    ===================================================== */

    backToClassesButton?.addEventListener(
        "click",
        backToClasses
    );


    addStudentButton?.addEventListener(
        "click",
        openAddStudentModal
    );


    emptyAddStudentButton?.addEventListener(
        "click",
        openAddStudentModal
    );


    addStudentForm?.addEventListener(
        "submit",
        saveNewStudent
    );


    document
        .getElementById(
            "closeAddStudentModal"
        )
        ?.addEventListener(
            "click",
            closeAddStudentModal
        );


    document
        .getElementById(
            "cancelAddStudent"
        )
        ?.addEventListener(
            "click",
            closeAddStudentModal
        );


    document
        .getElementById(
            "closeSuccessButton"
        )
        ?.addEventListener(
            "click",
            closeAddStudentModal
        );


    editStudentForm?.addEventListener(
        "submit",
        updateStudent
    );


    document
        .getElementById(
            "closeEditStudentModal"
        )
        ?.addEventListener(
            "click",
            closeEditStudentModal
        );


    document
        .getElementById(
            "cancelEditStudent"
        )
        ?.addEventListener(
            "click",
            closeEditStudentModal
        );


    document
        .getElementById(
            "closeDeleteStudentModal"
        )
        ?.addEventListener(
            "click",
            closeDeleteStudentModal
        );


    document
        .getElementById(
            "cancelDeleteStudent"
        )
        ?.addEventListener(
            "click",
            closeDeleteStudentModal
        );


    document
        .getElementById(
            "confirmDeleteStudent"
        )
        ?.addEventListener(
            "click",
            deleteStudent
        );


    /* =====================================================
       BACKDROP
    ===================================================== */

    [
        addStudentModal,
        editStudentModal,
        deleteStudentModal
    ].forEach(
        function (modal) {

            if (!modal) {
                return;
            }


            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.hidden =
                            true;

                    }

                }
            );

        }
    );


    /* =====================================================
       ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            if (
                addStudentModal &&
                !addStudentModal.hidden
            ) {

                closeAddStudentModal();

            }


            if (
                editStudentModal &&
                !editStudentModal.hidden
            ) {

                closeEditStudentModal();

            }


            if (
                deleteStudentModal &&
                !deleteStudentModal.hidden
            ) {

                closeDeleteStudentModal();

            }

        }
    );


    /* =====================================================
       AUTO STUDENT ID
    ===================================================== */

    studentFullName?.addEventListener(
        "input",
        function () {

            if (!selectedClass) {
                return;
            }


            studentIdPreview.value =
                generateStudentId(
                    selectedClass.form_number
                );

        }
    );


    console.log(
        "FCA Students: ready."
    );

});