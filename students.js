"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   STUDENTS MANAGEMENT
   SUPABASE VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("FCA Students: starting...");

    const supabase = window.fcaSupabase;


    /* =====================================================
       SUPABASE CHECK
    ===================================================== */

    if (!supabase) {

        console.error("FCA Supabase client not found.");

        const status =
            document.getElementById("databaseStatus");

        if (status) {
            status.textContent =
                "Database connection unavailable.";
            status.classList.add("error");
        }

        return;
    }

    console.log("FCA Supabase client found.");


    /* =====================================================
       SUBJECTS
    ===================================================== */

    const SUBJECTS = [
        "Agriculture",
        "Bible Knowledge",
        "Biology",
        "Chemistry",
        "Chichewa",
        "English",
        "Geography",
        "History",
        "Life Skills",
        "Mathematics",
        "Physics",
        "Social Studies"
    ];


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
        document.getElementById("databaseStatus");

    const classesSection =
        document.getElementById("classesSection");

    const studentsSection =
        document.getElementById("studentsSection");

    const classesContainer =
        document.getElementById("classesContainer");

    const noClassesState =
        document.getElementById("noClassesState");

    const studentsGrid =
        document.getElementById("studentsGrid");

    const noStudentsState =
        document.getElementById("noStudentsState");

    const studentCount =
        document.getElementById("studentCount");

    const selectedClassTitle =
        document.getElementById("selectedClassTitle");

    const selectedClassDescription =
        document.getElementById("selectedClassDescription");

    const selectedClassCode =
        document.getElementById("selectedClassCode");

    const addStudentButton =
        document.getElementById("addStudentButton");

    const emptyAddStudentButton =
        document.getElementById("emptyAddStudentButton");

    const backToClassesButton =
        document.getElementById("backToClassesButton");


    /* =====================================================
       ADD STUDENT ELEMENTS
    ===================================================== */

    const addStudentModal =
        document.getElementById("addStudentModal");

    const addStudentForm =
        document.getElementById("addStudentForm");

    const studentFullName =
        document.getElementById("studentFullName");

    const studentGender =
        document.getElementById("studentGender");

    const studentIdPreview =
        document.getElementById("studentIdPreview");

    const studentPasswordPreview =
        document.getElementById("studentPasswordPreview");

    const studentClassPreview =
        document.getElementById("studentClassPreview");

    const addStudentError =
        document.getElementById("addStudentError");

    const addStudentSuccess =
        document.getElementById("addStudentSuccess");

    const createdStudentId =
        document.getElementById("createdStudentId");

    const createdStudentPassword =
        document.getElementById("createdStudentPassword");


    /* =====================================================
       EDIT STUDENT ELEMENTS
    ===================================================== */

    const editStudentModal =
        document.getElementById("editStudentModal");

    const editStudentForm =
        document.getElementById("editStudentForm");

    const editStudentFullName =
        document.getElementById("editStudentFullName");

    const editStudentGender =
        document.getElementById("editStudentGender");

    const editStudentId =
        document.getElementById("editStudentId");

    const editStudentPassword =
        document.getElementById("editStudentPassword");

    const editStudentClass =
        document.getElementById("editStudentClass");

    const editStudentError =
        document.getElementById("editStudentError");


    /* =====================================================
       DELETE STUDENT ELEMENTS
    ===================================================== */

    const deleteStudentModal =
        document.getElementById("deleteStudentModal");

    const deleteStudentError =
        document.getElementById("deleteStudentError");


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    initialize();


    async function initialize() {

        setDatabaseStatus(
            "Checking database...",
            "loading"
        );

        try {

            const { error } =
                await supabase
                    .from("students")
                    .select("id")
                    .limit(1);

            if (error) {
                throw error;
            }

            setDatabaseStatus(
                "Database connected",
                "success"
            );

            await loadClasses();

            await loadStudents();

            openClassFromUrl();

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

    function setDatabaseStatus(message, type) {

        if (!databaseStatus) {
            return;
        }

        databaseStatus.textContent = message;

        databaseStatus.classList.remove(
            "loading",
            "success",
            "error"
        );

        databaseStatus.classList.add(type);
    }


    /* =====================================================
       LOAD CLASSES
    ===================================================== */

    async function loadClasses() {

        const { data, error } =
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

        classes = data || [];

        renderClasses();
    }


    /* =====================================================
       LOAD STUDENTS
    ===================================================== */

    async function loadStudents() {

        const { data, error } =
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

        students = data || [];

        console.log(
            "Students loaded:",
            students.length
        );

        console.log(
            "Gender data:",
            students.map(function (student) {
                return {
                    name: student.full_name,
                    gender: student.gender
                };
            })
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


        classes.forEach(function (classItem) {

            const card =
                document.createElement("div");

            card.className = "class-card";


            const className =
                escapeHtml(
                    getClassName(classItem)
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
                                ? `<span class="class-card-code">
                                    ${classCode}
                                   </span>`
                                : ""
                        }

                    </div>

                    ${
                        description
                            ? `<p class="class-card-description">
                                ${description}
                               </p>`
                            : ""
                    }

                </div>


                <div class="class-card-actions">

                    <button
                        type="button"
                        class="view-class-button"
                        data-class-id="${classItem.id}"
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

                    openClass(classItem);

                }
            );


            classesContainer.appendChild(card);

        });

    }


    /* =====================================================
       OPEN CLASS FROM URL
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
            classes.find(function (item) {

                return String(
                    item.form_number
                ) === String(form);

            });


        if (classItem) {

            openClass(classItem);

        }

    }


    /* =====================================================
       OPEN CLASS
    ===================================================== */

    function openClass(classItem) {

        selectedClass = classItem;

        classesSection.hidden = true;

        studentsSection.hidden = false;


        selectedClassTitle.textContent =
            getClassName(classItem);


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

        selectedClass = null;

        studentsSection.hidden = true;

        classesSection.hidden = false;

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
                        student.class_id &&
                        selectedClass.id
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


        studentsGrid.innerHTML = "";


        if (!classStudents.length) {

            noStudentsState.hidden = false;

            return;
        }


        noStudentsState.hidden = true;


        classStudents.forEach(
            function (student) {

                studentsGrid.appendChild(
                    createStudentCard(student)
                );

            }
        );

    }


    /* =====================================================
       CREATE STUDENT CARD
    ===================================================== */

    function createStudentCard(student) {

        const card =
            document.createElement("article");

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


        const accessPassword =
            student.access_password ||
            "Not available";


        const className =
            getStudentClassName(student);


        const subjects =
            normalizeSubjects(
                student.subjects
            );


        const initials =
            getInitials(fullName);


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
                        ${escapeHtml(accessPassword)}
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
                    data-student-id="${student.id}"
                >
                    Edit Student
                </button>

                <button
                    type="button"
                    class="delete-student-button"
                    data-student-id="${student.id}"
                >
                    Delete Student
                </button>

            </div>

        `;


        const editButton =
            card.querySelector(
                ".edit-student-button"
            );


        const deleteButton =
            card.querySelector(
                ".delete-student-button"
            );


        editButton.addEventListener(
            "click",
            function () {

                openEditStudentModal(student);

            }
        );


        deleteButton.addEventListener(
            "click",
            function () {

                openDeleteStudentModal(student);

            }
        );


        return card;

    }


    /* =====================================================
       OPEN ADD STUDENT MODAL
    ===================================================== */

    function openAddStudentModal() {

        if (!selectedClass) {
            return;
        }


        addStudentForm.hidden = false;

        addStudentSuccess.hidden = true;

        clearError(addStudentError);


        studentFullName.value = "";

        studentGender.value = "";

        studentClassPreview.value =
            getClassName(selectedClass);


        clearSubjectCheckboxes(
            "addStudentSubject"
        );


        const studentId =
            generateStudentId(
                selectedClass.form_number
            );


        const password =
            generateAccessPassword();


        studentIdPreview.value =
            studentId;


        studentPasswordPreview.value =
            password;


        addStudentModal.hidden = false;


        setTimeout(
            function () {

                studentFullName.focus();

            },
            50
        );

    }


    /* =====================================================
       CLOSE ADD STUDENT MODAL
    ===================================================== */

    function closeAddStudentModal() {

        addStudentModal.hidden = true;

        clearError(addStudentError);

    }


    /* =====================================================
       SAVE NEW STUDENT
    ===================================================== */

    async function saveNewStudent(event) {

        event.preventDefault();


        if (!selectedClass) {

            showError(
                addStudentError,
                "Please select a class first."
            );

            return;
        }


        clearError(addStudentError);


        const fullName =
            studentFullName.value.trim();


        const gender =
            studentGender.value.trim();


        const studentId =
            studentIdPreview.value.trim();


        const accessPassword =
            studentPasswordPreview.value.trim();


        const selectedSubjects =
            getSelectedSubjects(
                "addStudentSubject"
            );


        /* ================================================
           VALIDATION
        ================================================= */

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


        if (!selectedSubjects.length) {

            showError(
                addStudentError,
                "Please select at least one subject."
            );

            return;
        }


        /* ================================================
           PREPARE DATA
        ================================================= */

        const formNumber =
            Number(
                selectedClass.form_number
            );


        const newStudent = {

            id: crypto.randomUUID(),

            full_name: fullName,

            gender: gender,

            student_id: studentId,

            access_password: accessPassword,

            class_id: selectedClass.id,

            form_number: formNumber,

            subjects: selectedSubjects

        };


        console.log(
            "Creating student:",
            newStudent
        );


        /* ================================================
           INSERT
        ================================================= */

        const { data, error } =
            await supabase
                .from("students")
                .insert(newStudent)
                .select()
                .single();


        if (error) {

            console.error(
                "Create student error:",
                error
            );


            showError(
                addStudentError,
                getSupabaseErrorMessage(error)
            );

            return;
        }


        console.log(
            "Student created:",
            data
        );


        students.unshift(data);


        renderStudents();


        /* ================================================
           SUCCESS
        ================================================= */

        createdStudentId.textContent =
            data.student_id;


        createdStudentPassword.textContent =
            data.access_password;


        addStudentForm.hidden = true;

        addStudentSuccess.hidden = false;

    }


    /* =====================================================
       OPEN EDIT STUDENT MODAL
    ===================================================== */

    function openEditStudentModal(student) {

        editingStudent = student;

        clearError(editStudentError);


        editStudentFullName.value =
            student.full_name || "";


        editStudentGender.value =
            student.gender || "";


        editStudentId.value =
            student.student_id || "";


        editStudentPassword.value =
            student.access_password || "";


        editStudentClass.value =
            getStudentClassName(student);


        clearSubjectCheckboxes(
            "editStudentSubject"
        );


        const studentSubjects =
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
                        studentSubjects.includes(
                            checkbox.value
                        );

                }
            );


        editStudentModal.hidden = false;


        setTimeout(
            function () {

                editStudentFullName.focus();

            },
            50
        );

    }


    /* =====================================================
       CLOSE EDIT MODAL
    ===================================================== */

    function closeEditStudentModal() {

        editStudentModal.hidden = true;

        editingStudent = null;

        clearError(editStudentError);

    }


    /* =====================================================
       UPDATE STUDENT
    ===================================================== */

    async function updateStudent(event) {

        event.preventDefault();


        if (!editingStudent) {
            return;
        }


        clearError(editStudentError);


        const fullName =
            editStudentFullName.value.trim();


        const gender =
            editStudentGender.value.trim();


        const accessPassword =
            editStudentPassword.value.trim();


        const selectedSubjects =
            getSelectedSubjects(
                "editStudentSubject"
            );


        /* ================================================
           VALIDATION
        ================================================= */

        if (!fullName) {

            showError(
                editStudentError,
                "Please enter the student's full name."
            );

            editStudentFullName.focus();

            return;
        }


        if (!gender) {

            showError(
                editStudentError,
                "Please select the student's gender."
            );

            editStudentGender.focus();

            return;
        }


        if (!accessPassword) {

            showError(
                editStudentError,
                "Please enter an access password."
            );

            editStudentPassword.focus();

            return;
        }


        if (!selectedSubjects.length) {

            showError(
                editStudentError,
                "Please select at least one subject."
            );

            return;
        }


        /* ================================================
           UPDATE DATA
        ================================================= */

        const updates = {

            full_name: fullName,

            gender: gender,

            access_password: accessPassword,

            subjects: selectedSubjects

        };


        console.log(
            "Updating student:",
            updates
        );


        const { data, error } =
            await supabase
                .from("students")
                .update(updates)
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
                getSupabaseErrorMessage(error)
            );

            return;
        }


        console.log(
            "Student updated:",
            data
        );


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

            students[index] = data;

        }


        renderStudents();

        closeEditStudentModal();

    }


    /* =====================================================
       OPEN DELETE MODAL
    ===================================================== */

    function openDeleteStudentModal(student) {

        deletingStudent = student;

        clearError(deleteStudentError);

        deleteStudentModal.hidden = false;

    }


    /* =====================================================
       CLOSE DELETE MODAL
    ===================================================== */

    function closeDeleteStudentModal() {

        deleteStudentModal.hidden = true;

        deletingStudent = null;

        clearError(deleteStudentError);

    }


    /* =====================================================
       DELETE STUDENT
    ===================================================== */

    async function deleteStudent() {

        if (!deletingStudent) {
            return;
        }


        clearError(deleteStudentError);


        const studentId =
            deletingStudent.id;


        const { error } =
            await supabase
                .from("students")
                .delete()
                .eq(
                    "id",
                    studentId
                );


        if (error) {

            console.error(
                "Delete student error:",
                error
            );


            showError(
                deleteStudentError,
                getSupabaseErrorMessage(error)
            );

            return;
        }


        students =
            students.filter(
                function (student) {

                    return String(
                        student.id
                    ) !== String(
                        studentId
                    );

                }
            );


        closeDeleteStudentModal();

        renderStudents();

    }


    /* =====================================================
       GENERATE STUDENT ID
    ===================================================== */

    function generateStudentId(formNumber) {

        const year =
            new Date().getFullYear();


        const surnameCode =
            getSurnameCode(
                studentFullName.value.trim()
            );


        const prefix =
            `FCA-${year}-${surnameCode}`;


        let highestNumber = 0;


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
                            parts[parts.length - 1]
                        );


                    if (
                        Number.isFinite(number) &&
                        number > highestNumber
                    ) {

                        highestNumber = number;

                    }

                }

            }
        );


        return `${prefix}-${highestNumber + 1}`;

    }


    /* =====================================================
       GENERATE ACCESS PASSWORD
    ===================================================== */

    function generateAccessPassword() {

        const numbers =
            Math.floor(
                100 + Math.random() * 900
            );


        const letters =
            Math.random()
                .toString(36)
                .substring(2, 5)
                .toLowerCase();


        return `fca@${numbers}${letters}`;

    }


    /* =====================================================
       SURNAME CODE
    ===================================================== */

    function getSurnameCode(fullName) {

        const parts =
            fullName
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!parts.length) {
            return "XX";
        }


        const surname =
            parts[parts.length - 1]
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
       GET CLASS NAME
    ===================================================== */

    function getClassName(classItem) {

        if (!classItem) {
            return "Unknown Class";
        }


        if (classItem.class_name) {
            return classItem.class_name;
        }


        if (
            classItem.form_number !== null &&
            classItem.form_number !== undefined
        ) {

            return `Form ${classItem.form_number}`;

        }


        return "Unknown Class";

    }


    /* =====================================================
       GET STUDENT CLASS NAME
    ===================================================== */

    function getStudentClassName(student) {

        if (!student) {
            return "Unknown Class";
        }


        if (
            selectedClass &&
            String(student.class_id) ===
            String(selectedClass.id)
        ) {

            return getClassName(
                selectedClass
            );

        }


        const classItem =
            classes.find(
                function (classData) {

                    return String(
                        classData.id
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
            student.form_number !== null &&
            student.form_number !== undefined
        ) {

            return `Form ${student.form_number}`;

        }


        return "Unknown Class";

    }


    /* =====================================================
       GET INITIALS
    ===================================================== */

    function getInitials(name) {

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
            parts[parts.length - 1][0]
        ).toUpperCase();

    }


    /* =====================================================
       NORMALIZE SUBJECTS
    ===================================================== */

    function normalizeSubjects(subjects) {

        if (Array.isArray(subjects)) {

            return subjects
                .filter(Boolean)
                .map(String);

        }


        if (typeof subjects === "string") {

            try {

                const parsed =
                    JSON.parse(subjects);


                if (Array.isArray(parsed)) {

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


    /* =====================================================
       GET SELECTED SUBJECTS
    ===================================================== */

    function getSelectedSubjects(name) {

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


    /* =====================================================
       CLEAR SUBJECT CHECKBOXES
    ===================================================== */

    function clearSubjectCheckboxes(name) {

        document
            .querySelectorAll(
                `input[name="${name}"]`
            )
            .forEach(
                function (checkbox) {

                    checkbox.checked = false;

                }
            );

    }


    /* =====================================================
       SHOW ERROR
    ===================================================== */

    function showError(element, message) {

        if (!element) {
            return;
        }

        element.textContent = message;

        element.hidden = false;

    }


    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    function clearError(element) {

        if (!element) {
            return;
        }

        element.textContent = "";

        element.hidden = true;

    }


    /* =====================================================
       SUPABASE ERROR MESSAGE
    ===================================================== */

    function getSupabaseErrorMessage(error) {

        if (!error) {
            return "An unexpected error occurred.";
        }


        if (
            error.message &&
            error.message.toLowerCase()
                .includes("gender")
        ) {

            return (
                "The Gender field could not be saved. " +
                "Please make sure the gender column exists " +
                "in the students table."
            );

        }


        if (error.message) {
            return error.message;
        }


        return "An unexpected database error occurred.";

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       EVENT LISTENERS
    ===================================================== */

    /* BACK TO CLASSES */

    if (backToClassesButton) {

        backToClassesButton.addEventListener(
            "click",
            backToClasses
        );

    }


    /* ADD STUDENT */

    if (addStudentButton) {

        addStudentButton.addEventListener(
            "click",
            openAddStudentModal
        );

    }


    if (emptyAddStudentButton) {

        emptyAddStudentButton.addEventListener(
            "click",
            openAddStudentModal
        );

    }


    /* ADD FORM */

    if (addStudentForm) {

        addStudentForm.addEventListener(
            "submit",
            saveNewStudent
        );

    }


    /* CLOSE ADD */

    document
        .getElementById("closeAddStudentModal")
        ?.addEventListener(
            "click",
            closeAddStudentModal
        );


    document
        .getElementById("cancelAddStudent")
        ?.addEventListener(
            "click",
            closeAddStudentModal
        );


    /* SUCCESS CLOSE */

    document
        .getElementById("closeSuccessButton")
        ?.addEventListener(
            "click",
            closeAddStudentModal
        );


    /* EDIT FORM */

    if (editStudentForm) {

        editStudentForm.addEventListener(
            "submit",
            updateStudent
        );

    }


    /* CLOSE EDIT */

    document
        .getElementById("closeEditStudentModal")
        ?.addEventListener(
            "click",
            closeEditStudentModal
        );


    document
        .getElementById("cancelEditStudent")
        ?.addEventListener(
            "click",
            closeEditStudentModal
        );


    /* DELETE */

    document
        .getElementById("closeDeleteStudentModal")
        ?.addEventListener(
            "click",
            closeDeleteStudentModal
        );


    document
        .getElementById("cancelDeleteStudent")
        ?.addEventListener(
            "click",
            closeDeleteStudentModal
        );


    document
        .getElementById("confirmDeleteStudent")
        ?.addEventListener(
            "click",
            deleteStudent
        );


    /* =====================================================
       MODAL BACKDROP CLOSING
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
                        event.target === modal
                    ) {

                        modal.hidden = true;

                    }

                }
            );

        }
    );


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key !== "Escape") {
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
       AUTO-GENERATE STUDENT ID
       WHEN NAME CHANGES
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