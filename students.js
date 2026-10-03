"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   STUDENTS MANAGEMENT
   SUPABASE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("FCA Students: starting...");


    /* =====================================================
       SUPABASE
    ===================================================== */

    const supabase = window.fcaSupabase;

    if (!supabase) {

        console.error(
            "FCA Students: Supabase client not found."
        );

        return;
    }


    /* =====================================================
       CONSTANTS
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
       DOM ELEMENTS
    ===================================================== */

    const classesSection =
        document.getElementById("classesSection");

    const studentsSection =
        document.getElementById("studentsSection");

    const classesContainer =
        document.getElementById("classesContainer");

    const studentsContainer =
        document.getElementById("studentsContainer");

    const noClassesState =
        document.getElementById("noClassesState");

    const noStudentsState =
        document.getElementById("noStudentsState");

    const backToClasses =
        document.getElementById("backToClasses");

    const selectedClassName =
        document.getElementById("selectedClassName");

    const selectedClassTitle =
        document.getElementById("selectedClassTitle");

    const selectedClassDescription =
        document.getElementById("selectedClassDescription");

    const studentCount =
        document.getElementById("studentCount");

    const addStudentButton =
        document.getElementById("addStudentButton");

    const emptyAddStudentButton =
        document.getElementById("emptyAddStudentButton");


    /* =====================================================
       ADD MODAL
    ===================================================== */

    const studentAddModal =
        document.getElementById("studentAddModal");

    const addStudentForm =
        document.getElementById("addStudentForm");

    const closeAddStudentModal =
        document.getElementById("closeAddStudentModal");

    const cancelAddStudent =
        document.getElementById("cancelAddStudent");

    const studentFullName =
        document.getElementById("studentFullName");

    const studentIdPreview =
        document.getElementById("studentIdPreview");

    const studentPasswordPreview =
        document.getElementById("studentPasswordPreview");

    const studentClassPreview =
        document.getElementById("studentClassPreview");

    const addStudentError =
        document.getElementById("addStudentError");

    const saveStudentButton =
        document.getElementById("saveStudentButton");

    const studentCreatedBox =
        document.getElementById("studentCreatedBox");

    const createdStudentId =
        document.getElementById("createdStudentId");

    const createdStudentPassword =
        document.getElementById("createdStudentPassword");

    const closeCreatedStudent =
        document.getElementById("closeCreatedStudent");

    const selectAllSubjectsBtn =
        document.getElementById("selectAllSubjectsBtn");

    const clearSubjectsBtn =
        document.getElementById("clearSubjectsBtn");


    /* =====================================================
       EDIT MODAL
    ===================================================== */

    const studentEditModal =
        document.getElementById("studentEditModal");

    const editStudentForm =
        document.getElementById("editStudentForm");

    const closeEditStudentModal =
        document.getElementById("closeEditStudentModal");

    const cancelEditStudent =
        document.getElementById("cancelEditStudent");

    const editStudentFullName =
        document.getElementById("editStudentFullName");

    const editStudentId =
        document.getElementById("editStudentId");

    const editStudentPassword =
        document.getElementById("editStudentPassword");

    const editStudentClass =
        document.getElementById("editStudentClass");

    const editStudentError =
        document.getElementById("editStudentError");

    const updateStudentButton =
        document.getElementById("updateStudentButton");

    const editSelectAllSubjectsBtn =
        document.getElementById(
            "editSelectAllSubjectsBtn"
        );

    const editClearSubjectsBtn =
        document.getElementById(
            "editClearSubjectsBtn"
        );


    /* =====================================================
       STATE
    ===================================================== */

    let classes = [];

    let students = [];

    let selectedClass = null;

    let selectedEditStudent = null;


    /* =====================================================
       INITIALIZE
    ===================================================== */

    initialize();


    async function initialize() {

        await loadClasses();

        await loadStudents();

        setupEvents();

        openFormFromUrl();

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function setupEvents() {

        backToClasses.addEventListener(
            "click",
            backToClassesHandler
        );

        addStudentButton.addEventListener(
            "click",
            openAddStudentModal
        );

        emptyAddStudentButton.addEventListener(
            "click",
            openAddStudentModal
        );

        closeAddStudentModal.addEventListener(
            "click",
            closeAddModal
        );

        cancelAddStudent.addEventListener(
            "click",
            closeAddModal
        );

        closeCreatedStudent.addEventListener(
            "click",
            closeAddModal
        );

        addStudentForm.addEventListener(
            "submit",
            saveNewStudent
        );


        selectAllSubjectsBtn.addEventListener(
            "click",
            function () {
                selectAllSubjects(
                    "studentSubjects"
                );
            }
        );


        clearSubjectsBtn.addEventListener(
            "click",
            function () {
                clearSubjects(
                    "studentSubjects"
                );
            }
        );


        closeEditStudentModal.addEventListener(
            "click",
            closeEditModal
        );

        cancelEditStudent.addEventListener(
            "click",
            closeEditModal
        );

        editStudentForm.addEventListener(
            "submit",
            updateStudent
        );


        editSelectAllSubjectsBtn.addEventListener(
            "click",
            function () {
                selectAllSubjects(
                    "editStudentSubjects"
                );
            }
        );


        editClearSubjectsBtn.addEventListener(
            "click",
            function () {
                clearSubjects(
                    "editStudentSubjects"
                );
            }
        );


        studentAddModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === studentAddModal
                ) {
                    closeAddModal();
                }

            }
        );


        studentEditModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === studentEditModal
                ) {
                    closeEditModal();
                }

            }
        );

    }


    /* =====================================================
       LOAD CLASSES
    ===================================================== */

    async function loadClasses() {

        const { data, error } = await supabase
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
                "FCA Students: failed to load classes.",
                error
            );

            classes = [];

            renderClasses();

            return;
        }


        classes = data || [];

        renderClasses();

    }


    /* =====================================================
       LOAD STUDENTS
    ===================================================== */

    async function loadStudents() {

        const { data, error } = await supabase
            .from("students")
            .select("*")
            .order(
                "full_name",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "FCA Students: failed to load students.",
                error
            );

            students = [];

            return;
        }


        students = data || [];

    }


    /* =====================================================
       RENDER CLASSES
    ===================================================== */

    function renderClasses() {

        classesContainer.innerHTML = "";


        if (!classes.length) {

            noClassesState.hidden = false;

            return;
        }


        noClassesState.hidden = true;


        classes.forEach(function (classItem) {

            const card =
                document.createElement("button");

            card.type = "button";

            card.className =
                "student-class-card";


            const formNumber =
                getFormNumber(classItem);


            const classCode =
                getClassCode(
                    classItem,
                    formNumber
                );


            const className =
                getClassName(
                    classItem,
                    formNumber
                );


            card.innerHTML = `
                <div class="student-class-icon">
                    ${escapeHtml(formNumber)}
                </div>

                <div class="student-class-info">

                    <small>FCA CLASS</small>

                    <h3>
                        ${escapeHtml(className)}
                    </h3>

                    <p>
                        ${escapeHtml(classCode)}
                    </p>

                </div>

                <div class="student-class-arrow">
                    →
                </div>
            `;


            card.addEventListener(
                "click",
                function () {
                    openClass(classItem);
                }
            );


            classesContainer.appendChild(card);

        });

    }


    /* =====================================================
       OPEN FORM FROM URL
    ===================================================== */

    function openFormFromUrl() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const form =
            Number(
                params.get("form")
            );


        if (
            !Number.isInteger(form) ||
            form < 1 ||
            form > 4
        ) {
            return;
        }


        const classItem =
            classes.find(function (item) {

                return (
                    Number(
                        item.form_number
                    ) === form
                );

            });


        if (!classItem) {

            return;
        }


        openClass(
            classItem,
            false
        );

    }


    /* =====================================================
       OPEN CLASS
    ===================================================== */

    function openClass(
        classItem,
        updateUrl = true
    ) {

        selectedClass = classItem;


        const formNumber =
            getFormNumber(classItem);


        const classCode =
            getClassCode(
                classItem,
                formNumber
            );


        const className =
            getClassName(
                classItem,
                formNumber
            );


        if (updateUrl) {

            const url =
                new URL(
                    window.location.href
                );

            url.searchParams.set(
                "form",
                formNumber
            );

            window.history.pushState(
                {},
                "",
                url
            );

        }


        /*
           REQUIRED DISPLAY:

           FCA-F1
        */

        selectedClassName.textContent =
            classCode;


        /*
           Only "Students" here.
           No "Form 1 Students".
        */

        selectedClassTitle.textContent =
            "Students";


        selectedClassDescription.textContent =
            classItem.description || "";


        studentClassPreview.value =
            classCode;


        classesSection.hidden = true;

        studentsSection.hidden = false;


        showStudentsForClass();

    }


    /* =====================================================
       SHOW STUDENTS FOR SELECTED CLASS
    ===================================================== */

    function showStudentsForClass() {

        if (!selectedClass) {
            return;
        }


        const classStudents =
            students.filter(function (student) {

                if (
                    student.class_id &&
                    selectedClass.id
                ) {

                    return (
                        String(student.class_id) ===
                        String(selectedClass.id)
                    );

                }


                return (
                    Number(student.form_number) ===
                    Number(selectedClass.form_number)
                );

            });


        renderStudents(
            classStudents
        );


        updateStudentCount(
            classStudents
        );

    }


    /* =====================================================
       RENDER STUDENTS
    ===================================================== */

    function renderStudents(
        classStudents
    ) {

        studentsContainer.innerHTML = "";


        if (!classStudents.length) {

            studentsContainer.hidden = true;

            noStudentsState.hidden = false;

            return;
        }


        studentsContainer.hidden = false;

        noStudentsState.hidden = true;


        classStudents.forEach(
            function (student) {

                studentsContainer.appendChild(
                    createStudentCard(student)
                );

            }
        );

    }


    /* =====================================================
       CREATE STUDENT CARD
    ===================================================== */

    function createStudentCard(
        student
    ) {

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


        const password =
            student.access_password ||
            "Not assigned";


        const subjects =
            normalizeSubjects(
                student.subjects
            );


        const initials =
            getInitials(
                fullName
            );


        const formNumber =
            Number(
                student.form_number ||
                selectedClass?.form_number ||
                0
            );


        const className =
            selectedClass
                ? getClassName(
                    selectedClass,
                    formNumber
                )
                : `Form ${formNumber}`;


        const subjectHtml =
            subjects.length
                ? subjects.map(function (subject) {

                    return `
                        <span class="subject-tag">
                            ${escapeHtml(subject)}
                        </span>
                    `;

                }).join("")
                : `
                    <span class="no-subjects">
                        No subjects selected
                    </span>
                `;


        card.innerHTML = `

            <div class="student-card-top">

                <div class="student-avatar">
                    ${escapeHtml(initials)}
                </div>

                <div class="student-main-info">

                    <h3>
                        ${escapeHtml(fullName)}
                    </h3>

                    <span class="student-id-small">
                        ${escapeHtml(studentId)}
                    </span>

                </div>

            </div>


            <div class="student-details">

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

                <span class="student-subjects-title">
                    Subjects Taken
                </span>

                <div class="subject-tags">
                    ${subjectHtml}
                </div>

            </div>


            <div class="student-card-actions">

                <button
                    type="button"
                    class="student-edit-button"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="student-delete-button"
                >
                    Delete
                </button>

            </div>
        `;


        const editButton =
            card.querySelector(
                ".student-edit-button"
            );


        const deleteButton =
            card.querySelector(
                ".student-delete-button"
            );


        editButton.addEventListener(
            "click",
            function () {
                openEditStudentModal(
                    student
                );
            }
        );


        deleteButton.addEventListener(
            "click",
            function () {
                deleteStudent(
                    student
                );
            }
        );


        return card;

    }


    /* =====================================================
       UPDATE STUDENT COUNT
    ===================================================== */

    function updateStudentCount(
        classStudents
    ) {

        studentCount.textContent =
            classStudents.length;

    }


    /* =====================================================
       OPEN ADD MODAL
    ===================================================== */

    async function openAddStudentModal() {

        if (!selectedClass) {
            return;
        }


        addStudentForm.hidden = false;

        studentCreatedBox.hidden = true;

        addStudentError.hidden = true;

        addStudentError.textContent = "";


        studentFullName.value = "";

        studentClassPreview.value =
            getClassCode(
                selectedClass,
                getFormNumber(selectedClass)
            );


        clearSubjects(
            "studentSubjects"
        );


        studentIdPreview.value =
            "Generating...";


        studentPasswordPreview.value =
            generateAccessPassword();


        studentAddModal.hidden = false;


        studentFullName.focus();


        try {

            const generatedId =
                await generateStudentId(
                    ""
                );

            studentIdPreview.value =
                generatedId;

        } catch (error) {

            console.error(error);

            studentIdPreview.value =
                "Will generate on save";

        }

    }


    /* =====================================================
       CLOSE ADD MODAL
    ===================================================== */

    function closeAddModal() {

        studentAddModal.hidden = true;

        addStudentForm.reset();

        clearSubjects(
            "studentSubjects"
        );

        studentCreatedBox.hidden = true;

        addStudentForm.hidden = false;

    }


    /* =====================================================
       SAVE NEW STUDENT
    ===================================================== */

    async function saveNewStudent(
        event
    ) {

        event.preventDefault();


        if (!selectedClass) {
            return;
        }


        hideError(
            addStudentError
        );


        const fullName =
            studentFullName.value.trim();


        if (!fullName) {

            showError(
                addStudentError,
                "Please enter the student's full name."
            );

            return;
        }


        const selectedSubjects =
            getSelectedSubjects(
                "studentSubjects"
            );


        if (!selectedSubjects.length) {

            showError(
                addStudentError,
                "Please select at least one subject."
            );

            return;
        }


        saveStudentButton.disabled = true;

        saveStudentButton.textContent =
            "Creating...";


        try {

            const studentId =
                await generateStudentId(
                    fullName
                );


            const accessPassword =
                generateAccessPassword();


            const formNumber =
                getFormNumber(
                    selectedClass
                );


            const newStudent = {

                id:
                    crypto.randomUUID(),

                full_name:
                    fullName,

                student_id:
                    studentId,

                access_password:
                    accessPassword,

                class_id:
                    selectedClass.id,

                form_number:
                    formNumber,

                subjects:
                    selectedSubjects

            };


            const {
                data,
                error
            } = await supabase
                .from("students")
                .insert(
                    newStudent
                )
                .select()
                .single();


            if (error) {
                throw error;
            }


            students.push(
                data
            );


            showStudentsForClass();


            createdStudentId.textContent =
                studentId;


            createdStudentPassword.textContent =
                accessPassword;


            addStudentForm.hidden = true;

            studentCreatedBox.hidden = false;


        } catch (error) {

            console.error(
                "Create student error:",
                error
            );


            showError(
                addStudentError,
                getDatabaseErrorMessage(
                    error,
                    "Unable to create the student."
                )
            );

        } finally {

            saveStudentButton.disabled = false;

            saveStudentButton.textContent =
                "Create Student";

        }

    }


    /* =====================================================
       GENERATE STUDENT ID
       
       FORMAT:
       FCA-2026-NG-2

       NO ZERO PADDING
    ===================================================== */

    async function generateStudentId(
        fullName
    ) {

        const year =
            new Date().getFullYear();


        let surnameCode =
            getSurnameCode(
                fullName
            );


        if (!surnameCode) {

            surnameCode =
                "ST";

        }


        const prefix =
            `FCA-${year}-${surnameCode}-`;


        const {
            data,
            error
        } = await supabase
            .from("students")
            .select("student_id")
            .ilike(
                "student_id",
                `${prefix}%`
            );


        if (error) {
            throw error;
        }


        let highestNumber = 0;


        (data || []).forEach(
            function (student) {

                const id =
                    String(
                        student.student_id || ""
                    );


                if (
                    !id.startsWith(prefix)
                ) {
                    return;
                }


                const suffix =
                    id.substring(
                        prefix.length
                    );


                const number =
                    Number(suffix);


                if (
                    Number.isInteger(number) &&
                    number > highestNumber
                ) {

                    highestNumber =
                        number;

                }

            }
        );


        let nextNumber =
            highestNumber + 1;


        let candidate =
            createStudentId(
                year,
                surnameCode,
                nextNumber
            );


        /*
           Extra duplicate protection.
        */

        for (
            let attempt = 0;
            attempt < 20;
            attempt++
        ) {

            const {
                data: existing,
                error: existingError
            } = await supabase
                .from("students")
                .select("id")
                .eq(
                    "student_id",
                    candidate
                )
                .limit(1);


            if (existingError) {
                throw existingError;
            }


            if (!existing || !existing.length) {
                return candidate;
            }


            nextNumber++;


            candidate =
                createStudentId(
                    year,
                    surnameCode,
                    nextNumber
                );

        }


        throw new Error(
            "Could not generate a unique student ID."
        );

    }


    function createStudentId(
        year,
        surnameCode,
        number
    ) {

        /*
           IMPORTANT:
           No padStart().
           Therefore:

           1  -> FCA-2026-NG-1
           2  -> FCA-2026-NG-2
           10 -> FCA-2026-NG-10
        */

        return (
            `FCA-${year}-${surnameCode}-${number}`
        );

    }


    /* =====================================================
       SURNAME CODE
    ===================================================== */

    function getSurnameCode(
        fullName
    ) {

        const cleaned =
            String(
                fullName || ""
            )
                .trim()
                .replace(
                    /\s+/g,
                    " "
                );


        if (!cleaned) {
            return "";
        }


        const parts =
            cleaned.split(" ");


        const surname =
            parts[parts.length - 1];


        const letters =
            surname
                .replace(
                    /[^a-zA-Z]/g,
                    ""
                )
                .toUpperCase();


        if (!letters) {
            return "";
        }


        if (letters.length === 1) {
            return letters + "X";
        }


        return letters.substring(
            0,
            2
        );

    }


    /* =====================================================
       ACCESS PASSWORD
       
       FORMAT:
       fca@000aaa

       Length = 10
       
       fca@ = 4
       000 = 3
       aaa = 3
       TOTAL = 10
    ===================================================== */

    function generateAccessPassword() {

        const numbers =
            "0123456789";

        const letters =
            "abcdefghijklmnopqrstuvwxyz";


        let result =
            "fca@";


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            result +=
                numbers.charAt(
                    Math.floor(
                        Math.random() *
                        numbers.length
                    )
                );

        }


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            result +=
                letters.charAt(
                    Math.floor(
                        Math.random() *
                        letters.length
                    )
                );

        }


        return result;

    }


    /* =====================================================
       SUBJECT SELECTION
    ===================================================== */

    function getSelectedSubjects(
        inputName
    ) {

        const checked =
            document.querySelectorAll(
                `input[name="${inputName}"]:checked`
            );


        return Array.from(
            checked
        ).map(
            function (checkbox) {
                return checkbox.value;
            }
        );

    }


    function selectAllSubjects(
        inputName
    ) {

        const checkboxes =
            document.querySelectorAll(
                `input[name="${inputName}"]`
            );


        checkboxes.forEach(
            function (checkbox) {

                checkbox.checked = true;

            }
        );

    }


    function clearSubjects(
        inputName
    ) {

        const checkboxes =
            document.querySelectorAll(
                `input[name="${inputName}"]`
            );


        checkboxes.forEach(
            function (checkbox) {

                checkbox.checked = false;

            }
        );

    }


    /* =====================================================
       OPEN EDIT STUDENT MODAL
    ===================================================== */

    function openEditStudentModal(
        student
    ) {

        selectedEditStudent =
            student;


        editStudentError.hidden =
            true;

        editStudentError.textContent =
            "";


        editStudentFullName.value =
            student.full_name || "";


        editStudentId.value =
            student.student_id || "";


        editStudentPassword.value =
            student.access_password || "";


        const formNumber =
            Number(
                student.form_number ||
                selectedClass?.form_number ||
                0
            );


        editStudentClass.value =
            selectedClass
                ? getClassCode(
                    selectedClass,
                    formNumber
                )
                : `FCA-F${formNumber}`;


        clearSubjects(
            "editStudentSubjects"
        );


        const subjects =
            normalizeSubjects(
                student.subjects
            );


        const checkboxes =
            document.querySelectorAll(
                'input[name="editStudentSubjects"]'
            );


        checkboxes.forEach(
            function (checkbox) {

                checkbox.checked =
                    subjects.some(
                        function (subject) {

                            return (
                                subject.toLowerCase() ===
                                checkbox.value.toLowerCase()
                            );

                        }
                    );

            }
        );


        studentEditModal.hidden = false;

        editStudentFullName.focus();

    }


    /* =====================================================
       CLOSE EDIT MODAL
    ===================================================== */

    function closeEditModal() {

        studentEditModal.hidden = true;

        editStudentForm.reset();

        clearSubjects(
            "editStudentSubjects"
        );

        selectedEditStudent =
            null;

    }


    /* =====================================================
       UPDATE STUDENT
    ===================================================== */

    async function updateStudent(
        event
    ) {

        event.preventDefault();


        if (!selectedEditStudent) {
            return;
        }


        hideError(
            editStudentError
        );


        const fullName =
            editStudentFullName.value.trim();


        const password =
            editStudentPassword.value.trim();


        if (!fullName) {

            showError(
                editStudentError,
                "Please enter the student's full name."
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


        const selectedSubjects =
            getSelectedSubjects(
                "editStudentSubjects"
            );


        if (!selectedSubjects.length) {

            showError(
                editStudentError,
                "Please select at least one subject."
            );

            return;
        }


        updateStudentButton.disabled =
            true;

        updateStudentButton.textContent =
            "Updating...";


        try {

            const updates = {

                full_name:
                    fullName,

                access_password:
                    password,

                subjects:
                    selectedSubjects

            };


            const {
                data,
                error
            } = await supabase
                .from("students")
                .update(updates)
                .eq(
                    "id",
                    selectedEditStudent.id
                )
                .select()
                .single();


            if (error) {
                throw error;
            }


            const index =
                students.findIndex(
                    function (student) {

                        return (
                            String(student.id) ===
                            String(selectedEditStudent.id)
                        );

                    }
                );


            if (index !== -1) {

                students[index] =
                    data;

            }


            closeEditModal();

            showStudentsForClass();


        } catch (error) {

            console.error(
                "Update student error:",
                error
            );


            showError(
                editStudentError,
                getDatabaseErrorMessage(
                    error,
                    "Unable to update the student."
                )
            );

        } finally {

            updateStudentButton.disabled =
                false;

            updateStudentButton.textContent =
                "Update Student";

        }

    }


    /* =====================================================
       DELETE STUDENT
    ===================================================== */

    async function deleteStudent(
        student
    ) {

        const fullName =
            student.full_name ||
            "this student";


        const confirmed =
            window.confirm(
                `Delete ${fullName}?\n\nThis action cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        try {

            const {
                data,
                error
            } = await supabase
                .from("students")
                .delete()
                .eq(
                    "id",
                    student.id
                )
                .select("id");


            if (error) {
                throw error;
            }


            if (
                !data ||
                !data.length
            ) {

                throw new Error(
                    "The student was not deleted. Database permissions may be blocking the operation."
                );

            }


            students =
                students.filter(
                    function (item) {

                        return (
                            String(item.id) !==
                            String(student.id)
                        );

                    }
                );


            showStudentsForClass();


        } catch (error) {

            console.error(
                "Delete student error:",
                error
            );


            window.alert(
                getDatabaseErrorMessage(
                    error,
                    "Unable to delete the student."
                )
            );

        }

    }


    /* =====================================================
       BACK TO CLASSES
    ===================================================== */

    function backToClassesHandler() {

        selectedClass =
            null;


        studentsSection.hidden =
            true;

        classesSection.hidden =
            false;


        const url =
            new URL(
                window.location.href
            );


        url.searchParams.delete(
            "form"
        );


        window.history.pushState(
            {},
            "",
            url
        );

    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function getFormNumber(
        classItem
    ) {

        const number =
            Number(
                classItem?.form_number
            );


        if (
            Number.isInteger(number) &&
            number >= 1
        ) {

            return number;

        }


        const code =
            String(
                classItem?.class_code || ""
            );


        const match =
            code.match(
                /F(\d+)/i
            );


        if (match) {

            return Number(
                match[1]
            );

        }


        return 1;

    }


    function getClassCode(
        classItem,
        formNumber
    ) {

        const existing =
            String(
                classItem?.class_code || ""
            ).trim();


        if (existing) {
            return existing;
        }


        return `FCA-F${formNumber}`;

    }


    function getClassName(
        classItem,
        formNumber
    ) {

        const existing =
            String(
                classItem?.class_name || ""
            ).trim();


        if (existing) {
            return existing;
        }


        return `Form ${formNumber}`;

    }


    function getInitials(
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
            return "ST";
        }


        if (parts.length === 1) {

            return parts[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();

    }


    function normalizeSubjects(
        subjects
    ) {

        if (Array.isArray(subjects)) {

            return subjects
                .map(
                    function (subject) {

                        if (
                            typeof subject ===
                            "string"
                        ) {

                            return subject.trim();

                        }


                        if (
                            subject &&
                            typeof subject ===
                            "object"
                        ) {

                            return (
                                subject.name ||
                                subject.subject_name ||
                                subject.subject ||
                                ""
                            ).trim();

                        }


                        return "";

                    }
                )
                .filter(Boolean);

        }


        if (
            typeof subjects ===
            "string"
        ) {

            try {

                const parsed =
                    JSON.parse(subjects);


                if (
                    Array.isArray(parsed)
                ) {

                    return normalizeSubjects(
                        parsed
                    );

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


    function showError(
        element,
        message
    ) {

        element.textContent =
            message;

        element.hidden =
            false;

    }


    function hideError(
        element
    ) {

        element.textContent =
            "";

        element.hidden =
            true;

    }


    function getDatabaseErrorMessage(
        error,
        fallback
    ) {

        if (!error) {
            return fallback;
        }


        if (
            error.code ===
            "23505"
        ) {

            return (
                "This Student ID already exists. Please try again."
            );

        }


        return (
            error.message ||
            fallback
        );

    }


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

});