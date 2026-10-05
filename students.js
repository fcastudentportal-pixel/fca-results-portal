"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   STUDENTS MANAGEMENT
   SUPABASE VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("FCA Students: starting...");

    const db = window.fcaSupabase;

    if (!db) {
        console.error("FCA Supabase client not found.");
        showPageError(
            "Database connection is not available."
        );
        return;
    }

    console.log("FCA Supabase client found");


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const FCA_ADMIN_EMAIL = "fca.admin@gmail.com";

    const DEFAULT_ACADEMIC_YEAR =
        new Date().getFullYear();

    const STANDARD_SUBJECTS = [
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

    let currentFormNumber = null;
    let currentClass = null;

    let students = [];
    let subjects = [];

    let editingStudentId = null;
    let deletingStudentId = null;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const databaseStatus =
        document.getElementById("databaseStatus");

    const studentsContainer =
        document.getElementById("studentsContainer");

    const studentCount =
        document.getElementById("studentCount");

    const classNameStat =
        document.getElementById("classNameStat");

    const academicYearStat =
        document.getElementById("academicYearStat");

    const pageTitle =
        document.getElementById("pageTitle");

    const pageDescription =
        document.getElementById("pageDescription");

    const studentListDescription =
        document.getElementById(
            "studentListDescription"
        );

    const studentClass =
        document.getElementById("studentClass");

    const academicYear =
        document.getElementById("academicYear");

    const firstName =
        document.getElementById("firstName");

    const lastName =
        document.getElementById("lastName");

    const gender =
        document.getElementById("gender");

    const studentId =
        document.getElementById("studentId");

    const accessPassword =
        document.getElementById("accessPassword");

    const subjectsContainer =
        document.getElementById(
            "subjectsContainer"
        );

    const studentForm =
        document.getElementById("studentForm");

    const formTitle =
        document.getElementById("formTitle");

    const submitStudentButton =
        document.getElementById(
            "submitStudentButton"
        );

    const cancelEditButton =
        document.getElementById(
            "cancelEditButton"
        );

    const generatedCredentials =
        document.getElementById(
            "generatedCredentials"
        );

    const generatedStudentId =
        document.getElementById(
            "generatedStudentId"
        );

    const generatedPassword =
        document.getElementById(
            "generatedPassword"
        );


    /* =====================================================
       START
    ===================================================== */

    setupPage();


    /* =====================================================
       SETUP PAGE
    ===================================================== */

    async function setupPage() {

        setupEvents();

        setAcademicYear();

        currentFormNumber =
            getFormNumberFromURL();

        console.log(
            "Current form number:",
            currentFormNumber
        );

        if (!currentFormNumber) {

            showPageError(
                "No class was selected. Please return to Classes and select a class."
            );

            return;
        }

        await loadClass();

        if (!currentClass) {
            return;
        }

        await loadSubjects();

        await loadStudents();
    }


    /* =====================================================
       GET FORM NUMBER FROM URL
    ===================================================== */

    function getFormNumberFromURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const value =
            params.get("form");

        if (!value) {
            return null;
        }

        const number =
            Number(value);

        if (
            !Number.isInteger(number) ||
            number < 1 ||
            number > 4
        ) {
            return null;
        }

        return number;
    }


    /* =====================================================
       LOAD CLASS
       
       IMPORTANT:
       The FCA classes table DOES NOT contain
       an academic_year column.
    ===================================================== */

    async function loadClass() {

        try {

            console.log(
                "Loading FCA Form:",
                currentFormNumber
            );

            const { data, error } =
                await db
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

                showPageError(
                    error.message ||
                    "Unable to load the selected class."
                );

                return;
            }


            if (!data) {

                showPageError(
                    "This class does not exist in the FCA database."
                );

                return;
            }


            currentClass = data;

            console.log(
                "Current class:",
                currentClass
            );


            const className =
                data.class_name ||
                `Form ${currentFormNumber}`;


            document.title =
                `FCA | ${className} Students`;


            if (pageTitle) {

                pageTitle.textContent =
                    `${className} Students`;
            }


            if (pageDescription) {

                pageDescription.textContent =
                    `Manage students registered in ${className}.`;
            }


            if (classNameStat) {

                classNameStat.textContent =
                    className;
            }


            if (studentClass) {

                studentClass.value =
                    className;
            }


            if (studentListDescription) {

                studentListDescription.textContent =
                    `Students registered in ${className}.`;
            }


            setAcademicYear(
                DEFAULT_ACADEMIC_YEAR
            );

        } catch (error) {

            console.error(
                "Unexpected class error:",
                error
            );

            showPageError(
                "An unexpected error occurred while loading the class."
            );
        }
    }


    /* =====================================================
       SET ACADEMIC YEAR
    ===================================================== */

    function setAcademicYear(value) {

        const year =
            value ||
            DEFAULT_ACADEMIC_YEAR;


        if (academicYear) {

            academicYear.value =
                year;
        }


        if (academicYearStat) {

            academicYearStat.textContent =
                year;
        }
    }


    /* =====================================================
       GET ACADEMIC YEAR
    ===================================================== */

    function getAcademicYear() {

        if (academicYear) {

            const value =
                Number(
                    academicYear.value
                );

            if (
                Number.isInteger(value) &&
                value > 2000
            ) {
                return value;
            }
        }


        if (
            currentClass &&
            currentClass.academic_year
        ) {

            const value =
                Number(
                    currentClass.academic_year
                );

            if (
                Number.isInteger(value) &&
                value > 2000
            ) {
                return value;
            }
        }


        return DEFAULT_ACADEMIC_YEAR;
    }


    /* =====================================================
       LOAD SUBJECTS
    ===================================================== */

    async function loadSubjects() {

        try {

            if (subjectsContainer) {

                subjectsContainer.innerHTML =
                    `
                    <div class="loading-message">
                        Loading subjects...
                    </div>
                    `;
            }


            const { data, error } =
                await db
                    .from("subjects")
                    .select("*")
                    .order(
                        "name",
                        {
                            ascending: true
                        }
                    );


            if (error) {

                console.warn(
                    "Subjects table could not be loaded:",
                    error.message
                );

                subjects =
                    STANDARD_SUBJECTS.map(
                        function (name) {
                            return {
                                name: name
                            };
                        }
                    );

            } else {

                subjects =
                    Array.isArray(data)
                        ? data
                        : [];
            }


            if (!subjects.length) {

                subjects =
                    STANDARD_SUBJECTS.map(
                        function (name) {
                            return {
                                name: name
                            };
                        }
                    );
            }


            renderSubjects();

        } catch (error) {

            console.error(
                "Subjects loading error:",
                error
            );


            subjects =
                STANDARD_SUBJECTS.map(
                    function (name) {
                        return {
                            name: name
                        };
                    }
                );


            renderSubjects();
        }
    }


    /* =====================================================
       RENDER SUBJECTS
    ===================================================== */

    function renderSubjects() {

        if (!subjectsContainer) {
            return;
        }


        subjectsContainer.innerHTML = "";


        subjects.forEach(
            function (subject, index) {

                const subjectName =
                    subject.name ||
                    subject.subject_name ||
                    subject.title ||
                    STANDARD_SUBJECTS[index] ||
                    `Subject ${index + 1}`;


                const wrapper =
                    document.createElement("label");


                wrapper.className =
                    "subject-checkbox";


                const checkbox =
                    document.createElement("input");


                checkbox.type =
                    "checkbox";


                checkbox.name =
                    "subjects";


                checkbox.value =
                    subjectName;


                checkbox.dataset.subject =
                    subjectName;


                const text =
                    document.createElement("span");


                text.textContent =
                    subjectName;


                wrapper.appendChild(
                    checkbox
                );


                wrapper.appendChild(
                    text
                );


                subjectsContainer.appendChild(
                    wrapper
                );
            }
        );
    }


    /* =====================================================
       LOAD STUDENTS
    ===================================================== */

    async function loadStudents() {

        try {

            setDatabaseStatus(
                "Loading students...",
                "loading"
            );


            let result =
                await db
                    .from("students")
                    .select("*")
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


            /*
                If form_number filtering fails,
                try class_id instead.
            */

            if (
                result.error &&
                currentClass &&
                currentClass.id
            ) {

                console.warn(
                    "Form number query failed. Trying class_id..."
                );


                result =
                    await db
                        .from("students")
                        .select("*")
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
            }


            if (result.error) {

                console.error(
                    "Students loading error:",
                    result.error
                );


                showStudentListError(
                    result.error.message ||
                    "Unable to load students."
                );


                setDatabaseStatus(
                    "Database error",
                    "error"
                );

                return;
            }


            students =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            students.sort(
                compareStudentsAlphabetically
            );


            renderStudents();

            updateStudentStats();


            setDatabaseStatus(
                "Database connected",
                "success"
            );

        } catch (error) {

            console.error(
                "Unexpected students error:",
                error
            );


            showStudentListError(
                "An unexpected error occurred while loading students."
            );


            setDatabaseStatus(
                "Database error",
                "error"
            );
        }
    }


    /* =====================================================
       SORT STUDENTS
    ===================================================== */

    function compareStudentsAlphabetically(
        a,
        b
    ) {

        const nameA =
            getStudentFullName(a)
                .toLowerCase();

        const nameB =
            getStudentFullName(b)
                .toLowerCase();


        return nameA.localeCompare(
            nameB
        );
    }


    /* =====================================================
       GET FULL NAME
    ===================================================== */

    function getStudentFullName(
        student
    ) {

        if (!student) {
            return "";
        }


        return (
            student.full_name ||
            ""
        ).trim();
    }


    /* =====================================================
       GET FIRST NAME
    ===================================================== */

    function getStudentFirstName(
        student
    ) {

        const fullName =
            getStudentFullName(
                student
            );


        if (!fullName) {
            return "";
        }


        return fullName
            .split(/\s+/)[0];
    }


    /* =====================================================
       GET LAST NAME
    ===================================================== */

    function getStudentLastName(
        student
    ) {

        const fullName =
            getStudentFullName(
                student
            );


        if (!fullName) {
            return "";
        }


        const parts =
            fullName.split(/\s+/);


        if (parts.length <= 1) {
            return "";
        }


        return parts
            .slice(1)
            .join(" ");
    }


    /* =====================================================
       RENDER STUDENTS
    ===================================================== */

    function renderStudents() {

        if (!studentsContainer) {
            return;
        }


        studentsContainer.innerHTML = "";


        if (!students.length) {

            studentsContainer.innerHTML =
                `
                <div class="empty-state">
                    <h3>No Students Yet</h3>
                    <p>
                        No students have been registered
                        in this class.
                    </p>
                </div>
                `;

            return;
        }


        students.forEach(
            function (student, index) {

                const card =
                    document.createElement("article");


                card.className =
                    "student-card";


                const fullName =
                    getStudentFullName(
                        student
                    );


                const genderText =
                    student.gender ||
                    "Not specified";


                const studentNumber =
                    student.student_id ||
                    "Not assigned";


                card.innerHTML =
                    `
                    <div class="student-card-header">

                        <div class="student-avatar">
                            ${getInitials(fullName)}
                        </div>

                        <div class="student-card-name">
                            <h3>
                                ${escapeHTML(fullName || "Unnamed Student")}
                            </h3>

                            <span>
                                Student ${index + 1}
                            </span>
                        </div>

                    </div>


                    <div class="student-card-details">

                        <div class="student-detail">
                            <span class="detail-label">
                                Student ID
                            </span>

                            <strong>
                                ${escapeHTML(studentNumber)}
                            </strong>
                        </div>


                        <div class="student-detail">
                            <span class="detail-label">
                                Gender
                            </span>

                            <strong>
                                ${escapeHTML(genderText)}
                            </strong>
                        </div>


                        <div class="student-detail">
                            <span class="detail-label">
                                Academic Year
                            </span>

                            <strong>
                                ${student.academic_year || getAcademicYear()}
                            </strong>
                        </div>

                    </div>


                    <div class="student-card-actions">

                        <button
                            type="button"
                            class="edit-student-button"
                            data-action="edit"
                            data-id="${student.id}"
                        >
                            Edit Student
                        </button>


                        <button
                            type="button"
                            class="delete-student-button"
                            data-action="delete"
                            data-id="${student.id}"
                        >
                            Delete Student
                        </button>

                    </div>
                    `;


                studentsContainer.appendChild(
                    card
                );
            }
        );
    }


    /* =====================================================
       INITIALS
    ===================================================== */

    function getInitials(
        name
    ) {

        if (!name) {
            return "ST";
        }


        const parts =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);


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
       UPDATE STATS
    ===================================================== */

    function updateStudentStats() {

        if (studentCount) {

            studentCount.textContent =
                students.length;
        }


        if (classNameStat && currentClass) {

            classNameStat.textContent =
                currentClass.class_name ||
                `Form ${currentFormNumber}`;
        }


        if (academicYearStat) {

            academicYearStat.textContent =
                getAcademicYear();
        }
    }


    /* =====================================================
       SETUP EVENTS
    ===================================================== */

    function setupEvents() {

        if (studentForm) {

            studentForm.addEventListener(
                "submit",
                handleStudentSubmit
            );
        }


        if (cancelEditButton) {

            cancelEditButton.addEventListener(
                "click",
                cancelEdit
            );
        }


        if (studentsContainer) {

            studentsContainer.addEventListener(
                "click",
                function (event) {

                    const button =
                        event.target.closest(
                            "button[data-action]"
                        );


                    if (!button) {
                        return;
                    }


                    const id =
                        button.dataset.id;


                    if (
                        button.dataset.action ===
                        "edit"
                    ) {

                        editStudent(id);
                    }


                    if (
                        button.dataset.action ===
                        "delete"
                    ) {

                        deleteStudent(id);
                    }
                }
            );
        }


        if (firstName) {

            firstName.addEventListener(
                "input",
                generatePreviewCredentials
            );
        }


        if (lastName) {

            lastName.addEventListener(
                "input",
                generatePreviewCredentials
            );
        }


        if (gender) {

            gender.addEventListener(
                "change",
                generatePreviewCredentials
            );
        }


        if (academicYear) {

            academicYear.addEventListener(
                "change",
                function () {

                    updateStudentStats();

                    generatePreviewCredentials();
                }
            );
        }
    }


    /* =====================================================
       SUBMIT STUDENT
    ===================================================== */

    async function handleStudentSubmit(
        event
    ) {

        event.preventDefault();


        if (!currentClass) {

            alert(
                "No FCA class is currently selected."
            );

            return;
        }


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


        const year =
            getAcademicYear();


        if (!first) {

            alert(
                "Please enter the student's first name."
            );

            return;
        }


        if (!last) {

            alert(
                "Please enter the student's last name."
            );

            return;
        }


        const selectedSubjects =
            getSelectedSubjects();


        if (!selectedSubjects.length) {

            alert(
                "Please select at least one subject."
            );

            return;
        }


        try {

            setDatabaseStatus(
                editingStudentId
                    ? "Updating student..."
                    : "Creating student...",
                "loading"
            );


            const studentData = {

                firstName: first,

                lastName: last,

                gender: selectedGender,

                academicYear: year,

                subjects: selectedSubjects
            };


            let existingStudent =
                null;


            if (editingStudentId) {

                existingStudent =
                    students.find(
                        function (student) {

                            return String(
                                student.id
                            ) === String(
                                editingStudentId
                            );
                        }
                    );
            }


            let generatedID =
                existingStudent &&
                existingStudent.student_id
                    ? existingStudent.student_id
                    : null;


            let generatedAccessPassword =
                existingStudent &&
                existingStudent.access_password
                    ? existingStudent.access_password
                    : null;


            if (!generatedID) {

                generatedID =
                    await generateStudentId(
                        studentData
                    );
            }


            if (!generatedAccessPassword) {

                generatedAccessPassword =
                    generateAccessPassword();
            }


            const payload =
                buildStudentPayload(
                    studentData,
                    generatedID,
                    generatedAccessPassword
                );


            let result;


            if (editingStudentId) {

                result =
                    await db
                        .from("students")
                        .update(payload)
                        .eq(
                            "id",
                            editingStudentId
                        )
                        .select()
                        .single();

            } else {

                result =
                    await db
                        .from("students")
                        .insert(payload)
                        .select()
                        .single();
            }


            if (result.error) {

                console.error(
                    "Student save error:",
                    result.error
                );


                alert(
                    result.error.message ||
                    "Unable to save student."
                );


                setDatabaseStatus(
                    "Database error",
                    "error"
                );

                return;
            }


            console.log(
                "Student saved:",
                result.data
            );


            if (editingStudentId) {

                alert(
                    "Student updated successfully."
                );

            } else {

                showGeneratedCredentials(
                    generatedID,
                    generatedAccessPassword
                );

                alert(
                    "Student created successfully."
                );
            }


            resetStudentForm();

            await loadStudents();


            setDatabaseStatus(
                "Database connected",
                "success"
            );

        } catch (error) {

            console.error(
                "Unexpected save error:",
                error
            );


            alert(
                "An unexpected error occurred while saving the student."
            );


            setDatabaseStatus(
                "Database error",
                "error"
            );
        }
    }


    /* =====================================================
       BUILD STUDENT PAYLOAD
       
       Matches actual students table:
       - full_name
       - student_id
       - access_password
       - class_id
       - form_number
       - subjects
       - gender
       - academic_year
       - updated_at
    ===================================================== */

    function buildStudentPayload(
        studentData,
        studentIdValue,
        accessPasswordValue
    ) {

        return {

            full_name:
                `${studentData.firstName} ${studentData.lastName}`
                    .trim(),

            gender:
                studentData.gender || null,

            student_id:
                studentIdValue,

            access_password:
                accessPasswordValue,

            subjects:
                studentData.subjects,

            academic_year:
                studentData.academicYear,

            class_id:
                currentClass.id,

            form_number:
                currentFormNumber,

            updated_at:
                new Date().toISOString()
        };
    }


    /* =====================================================
       GET SELECTED SUBJECTS
    ===================================================== */

    function getSelectedSubjects() {

        if (!subjectsContainer) {
            return [];
        }


        const checked =
            subjectsContainer.querySelectorAll(
                'input[type="checkbox"]:checked'
            );


        return Array.from(
            checked
        ).map(
            function (checkbox) {

                return checkbox.value;
            }
        );
    }


    /* =====================================================
       GENERATE STUDENT ID
    ===================================================== */

    async function generateStudentId(
        studentData
    ) {

        const academicYear =
            studentData.academicYear ||
            getAcademicYear();


        const surname =
            studentData.lastName
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .pop() ||
            "STUDENT";


        const prefix =
            surname
                .substring(0, 3)
                .toUpperCase();


        let position =
            students.length + 1;


        /*
           Temporary student object uses
           full_name because the students
           table has no surname column.
        */

        const temporaryStudent = {

            full_name:
                surname
        };


        try {

            const { count, error } =
                await db
                    .from("students")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )
                    .eq(
                        "form_number",
                        currentFormNumber
                    );


            if (!error && typeof count === "number") {

                position =
                    count + 1;
            }

        } catch (error) {

            console.warn(
                "Unable to calculate student count:",
                error
            );
        }


        /*
           Keep this reference so the variable
           is intentionally based on the actual
           students table structure.
        */

        if (!temporaryStudent.full_name) {
            position = students.length + 1;
        }


        return (
            `FCA-${academicYear}-${prefix}-${String(position).padStart(3, "0")}`
        );
    }


    /* =====================================================
       GENERATE ACCESS PASSWORD
    ===================================================== */

    function generateAccessPassword() {

        const letters =
            "abcdefghijklmnopqrstuvwxyz";

        let randomLetters = "";


        for (let i = 0; i < 3; i++) {

            randomLetters +=
                letters[
                    Math.floor(
                        Math.random() *
                        letters.length
                    )
                ];
        }


        const numbers =
            Math.floor(
                100 +
                Math.random() * 900
            );


        return (
            `fca@${randomLetters}${numbers}`
        );
    }


    /* =====================================================
       GENERATE PREVIEW CREDENTIALS
    ===================================================== */

    function generatePreviewCredentials() {

        if (
            !firstName ||
            !lastName ||
            !studentId
        ) {
            return;
        }


        const first =
            firstName.value.trim();


        const last =
            lastName.value.trim();


        if (!first || !last) {
            return;
        }


        /*
           Do not overwrite an existing student ID
           during editing.
        */

        if (editingStudentId) {
            return;
        }


        const surname =
            last
                .split(/\s+/)
                .filter(Boolean)
                .pop() ||
            "STUDENT";


        const prefix =
            surname
                .substring(0, 3)
                .toUpperCase();


        const year =
            getAcademicYear();


        const position =
            students.length + 1;


        studentId.value =
            `FCA-${year}-${prefix}-${String(position).padStart(3, "0")}`;
    }


    /* =====================================================
       SHOW GENERATED CREDENTIALS
    ===================================================== */

    function showGeneratedCredentials(
        generatedID,
        generatedPasswordValue
    ) {

        if (generatedStudentId) {

            generatedStudentId.textContent =
                generatedID;
        }


        if (generatedPassword) {

            generatedPassword.textContent =
                generatedPasswordValue;
        }


        if (generatedCredentials) {

            generatedCredentials.style.display =
                "block";
        }
    }


    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    function editStudent(
        id
    ) {

        const student =
            students.find(
                function (item) {

                    return String(item.id) ===
                        String(id);
                }
            );


        if (!student) {

            alert(
                "Student could not be found."
            );

            return;
        }


        editingStudentId =
            student.id;


        const first =
            getStudentFirstName(
                student
            );


        const last =
            getStudentLastName(
                student
            );


        if (firstName) {
            firstName.value =
                first;
        }


        if (lastName) {
            lastName.value =
                last;
        }


        if (gender) {
            gender.value =
                student.gender || "";
        }


        if (academicYear) {

            academicYear.value =
                student.academic_year ||
                DEFAULT_ACADEMIC_YEAR;
        }


        if (studentId) {

            studentId.value =
                student.student_id || "";
        }


        if (accessPassword) {

            accessPassword.value =
                student.access_password || "";
        }


        setSelectedSubjects(
            student.subjects
        );


        if (formTitle) {

            formTitle.textContent =
                "Edit Student";
        }


        if (submitStudentButton) {

            submitStudentButton.textContent =
                "Update Student";
        }


        if (cancelEditButton) {

            cancelEditButton.style.display =
                "inline-flex";
        }


        if (generatedCredentials) {

            generatedCredentials.style.display =
                "none";
        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =====================================================
       SET SELECTED SUBJECTS
    ===================================================== */

    function setSelectedSubjects(
        selected
    ) {

        if (!subjectsContainer) {
            return;
        }


        let selectedSubjects = [];


        if (Array.isArray(selected)) {

            selectedSubjects =
                selected;

        } else if (
            typeof selected === "string"
        ) {

            try {

                const parsed =
                    JSON.parse(selected);

                if (Array.isArray(parsed)) {

                    selectedSubjects =
                        parsed;
                }

            } catch (error) {

                selectedSubjects =
                    selected
                        .split(",")
                        .map(
                            function (item) {
                                return item.trim();
                            }
                        )
                        .filter(Boolean);
            }
        }


        const checkboxes =
            subjectsContainer.querySelectorAll(
                'input[type="checkbox"]'
            );


        checkboxes.forEach(
            function (checkbox) {

                checkbox.checked =
                    selectedSubjects.includes(
                        checkbox.value
                    );
            }
        );
    }


    /* =====================================================
       CANCEL EDIT
    ===================================================== */

    function cancelEdit() {

        editingStudentId =
            null;


        resetStudentForm();
    }


    /* =====================================================
       RESET FORM
    ===================================================== */

    function resetStudentForm() {

        if (studentForm) {

            studentForm.reset();
        }


        editingStudentId =
            null;


        if (studentClass && currentClass) {

            studentClass.value =
                currentClass.class_name ||
                `Form ${currentFormNumber}`;
        }


        setAcademicYear(
            DEFAULT_ACADEMIC_YEAR
        );


        if (studentId) {

            studentId.value = "";
        }


        if (accessPassword) {

            accessPassword.value = "";
        }


        if (formTitle) {

            formTitle.textContent =
                "Add Student";
        }


        if (submitStudentButton) {

            submitStudentButton.textContent =
                "Add Student";
        }


        if (cancelEditButton) {

            cancelEditButton.style.display =
                "none";
        }


        if (generatedCredentials) {

            generatedCredentials.style.display =
                "none";
        }


        if (subjectsContainer) {

            const checkboxes =
                subjectsContainer.querySelectorAll(
                    'input[type="checkbox"]'
                );


            checkboxes.forEach(
                function (checkbox) {

                    checkbox.checked =
                        false;
                }
            );
        }
    }


    /* =====================================================
       DELETE STUDENT
    ===================================================== */

    async function deleteStudent(
        id
    ) {

        const student =
            students.find(
                function (item) {

                    return String(item.id) ===
                        String(id);
                }
            );


        if (!student) {

            alert(
                "Student could not be found."
            );

            return;
        }


        const fullName =
            getStudentFullName(
                student
            );


        const confirmed =
            confirm(
                `Are you sure you want to delete ${fullName}?\n\nThis action cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        deletingStudentId =
            student.id;


        try {

            setDatabaseStatus(
                "Deleting student...",
                "loading"
            );


            const { error } =
                await db
                    .from("students")
                    .delete()
                    .eq(
                        "id",
                        deletingStudentId
                    );


            if (error) {

                console.error(
                    "Delete student error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to delete student."
                );


                setDatabaseStatus(
                    "Database error",
                    "error"
                );

                return;
            }


            alert(
                "Student deleted successfully."
            );


            deletingStudentId =
                null;


            await loadStudents();


            await recalculateStudentIds();


            await loadStudents();


            setDatabaseStatus(
                "Database connected",
                "success"
            );

        } catch (error) {

            console.error(
                "Unexpected delete error:",
                error
            );


            alert(
                "An unexpected error occurred while deleting the student."
            );


            setDatabaseStatus(
                "Database error",
                "error"
            );
        }
    }


    /* =====================================================
       RECALCULATE STUDENT IDS
    ===================================================== */

    async function recalculateStudentIds() {

        try {

            const { data, error } =
                await db
                    .from("students")
                    .select(
                        "id, full_name, academic_year"
                    )
                    .eq(
                        "form_number",
                        currentFormNumber
                    );


            if (error) {

                console.warn(
                    "Unable to recalculate IDs:",
                    error.message
                );

                return;
            }


            if (!Array.isArray(data)) {
                return;
            }


            data.sort(
                function (a, b) {

                    return (
                        getStudentFullName(a)
                            .localeCompare(
                                getStudentFullName(b)
                            )
                    );
                }
            );


            for (
                let index = 0;
                index < data.length;
                index++
            ) {

                const student =
                    data[index];


                const surname =
                    getStudentLastName(
                        student
                    )
                    .split(/\s+/)
                    .filter(Boolean)
                    .pop() ||
                    getStudentFirstName(
                        student
                    ) ||
                    "STUDENT";


                const prefix =
                    surname
                        .substring(0, 3)
                        .toUpperCase();


                const year =
                    student.academic_year ||
                    DEFAULT_ACADEMIC_YEAR;


                const newId =
                    `FCA-${year}-${prefix}-${String(index + 1).padStart(3, "0")}`;


                await db
                    .from("students")
                    .update({
                        student_id:
                            newId,

                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        student.id
                    );
            }

        } catch (error) {

            console.warn(
                "ID recalculation error:",
                error
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


        databaseStatus.classList.remove(
            "loading",
            "success",
            "error"
        );


        if (type) {

            databaseStatus.classList.add(
                type
            );
        }
    }


    /* =====================================================
       PAGE ERROR
    ===================================================== */

    function showPageError(
        message
    ) {

        const existing =
            document.getElementById(
                "pageError"
            );


        if (existing) {

            existing.textContent =
                message;

            return;
        }


        const errorBox =
            document.createElement("div");


        errorBox.id =
            "pageError";


        errorBox.className =
            "page-error";


        errorBox.innerHTML =
            `
            <strong>
                Unable to load class
            </strong>

            <p>
                ${escapeHTML(message)}
            </p>
            `;


        const container =
            document.querySelector(
                ".main-content"
            ) ||
            document.querySelector(
                "main"
            ) ||
            document.body;


        container.prepend(
            errorBox
        );
    }


    /* =====================================================
       STUDENT LIST ERROR
    ===================================================== */

    function showStudentListError(
        message
    ) {

        if (!studentsContainer) {
            return;
        }


        studentsContainer.innerHTML =
            `
            <div class="empty-state error-state">

                <h3>
                    Unable to load students
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>
            `;
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
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

});