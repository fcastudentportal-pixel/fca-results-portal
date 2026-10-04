"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   STUDENTS MANAGEMENT
   SUPABASE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("FCA Students: starting...");

    const supabase = window.fcaSupabase;

    if (!supabase) {
        console.error(
            "FCA Students: window.fcaSupabase was not found."
        );

        showFatalError(
            "The FCA database configuration could not be loaded."
        );

        return;
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const addStudentButton =
        document.getElementById("addStudentButton");

    const addStudentFromListButton =
        document.getElementById(
            "addStudentFromListButton"
        );

    const emptyAddStudentButton =
        document.getElementById(
            "emptyAddStudentButton"
        );

    const backToClassesButton =
        document.getElementById(
            "backToClassesButton"
        );

    const studentsListSection =
        document.getElementById(
            "studentsListSection"
        );

    const studentsGrid =
        document.getElementById("studentsGrid");

    const emptyStudents =
        document.getElementById("emptyStudents");

    const selectedClassTitle =
        document.getElementById(
            "selectedClassTitle"
        );

    const selectedClassDescription =
        document.getElementById(
            "selectedClassDescription"
        );

    const studentModal =
        document.getElementById("studentModal");

    const deleteModal =
        document.getElementById("deleteModal");

    const closeStudentModal =
        document.getElementById(
            "closeStudentModal"
        );

    const cancelStudentButton =
        document.getElementById(
            "cancelStudentButton"
        );

    const closeDeleteModal =
        document.getElementById(
            "closeDeleteModal"
        );

    const cancelDeleteButton =
        document.getElementById(
            "cancelDeleteButton"
        );

    const studentForm =
        document.getElementById("studentForm");

    const studentModalTitle =
        document.getElementById(
            "studentModalTitle"
        );

    const editingStudentId =
        document.getElementById(
            "editingStudentId"
        );

    const studentFullName =
        document.getElementById(
            "studentFullName"
        );

    const studentGender =
        document.getElementById(
            "studentGender"
        );

    const studentId =
        document.getElementById(
            "studentId"
        );

    const accessPassword =
        document.getElementById(
            "accessPassword"
        );

    const studentFormNumber =
        document.getElementById(
            "studentFormNumber"
        );

    const studentFormMessage =
        document.getElementById(
            "studentFormMessage"
        );

    const saveStudentButton =
        document.getElementById(
            "saveStudentButton"
        );

    const generateStudentIdButton =
        document.getElementById(
            "generateStudentIdButton"
        );

    const generatePasswordButton =
        document.getElementById(
            "generatePasswordButton"
        );

    const studentPasswordToggle =
        document.getElementById(
            "studentPasswordToggle"
        );

    const deleteStudentMessage =
        document.getElementById(
            "deleteStudentMessage"
        );

    const confirmDeleteButton =
        document.getElementById(
            "confirmDeleteButton"
        );


    /* =====================================================
       STATE
    ===================================================== */

    let students = [];

    let selectedForm = null;

    let studentToDelete = null;


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadStudents();


    /* =====================================================
       LOAD STUDENTS
    ===================================================== */

    async function loadStudents() {

        try {

            const {
                data,
                error
            } = await supabase
                .from("students")
                .select(
                    `
                    id,
                    full_name,
                    student_id,
                    access_password,
                    class_id,
                    form_number,
                    subjects,
                    gender
                    `
                )
                .order(
                    "full_name",
                    {
                        ascending: true
                    }
                );


            if (error) {
                throw error;
            }


            students = data || [];

            console.log(
                "FCA Students: loaded",
                students.length,
                "students"
            );


            updateClassCounts();


            if (selectedForm !== null) {
                renderStudentsForForm(
                    selectedForm
                );
            }

        } catch (error) {

            console.error(
                "FCA Students: unable to load students:",
                error
            );

            showFatalError(
                getSupabaseErrorMessage(error)
            );
        }
    }


    /* =====================================================
       UPDATE CLASS COUNTS
    ===================================================== */

    function updateClassCounts() {

        for (let form = 1; form <= 4; form++) {

            const count =
                students.filter(function (student) {
                    return Number(
                        student.form_number
                    ) === form;
                }).length;


            const countElement =
                document.getElementById(
                    `count-form-${form}`
                );


            if (!countElement) {
                continue;
            }


            countElement.textContent =
                count === 1
                    ? "1 Student"
                    : `${count} Students`;
        }
    }


    /* =====================================================
       VIEW CLASS
    ===================================================== */

    document
        .querySelectorAll(".view-class-button")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const form =
                        Number(
                            button.dataset.form
                        );

                    openClass(form);
                }
            );
        });


    function openClass(form) {

        selectedForm = form;

        const count =
            students.filter(function (student) {
                return Number(
                    student.form_number
                ) === form;
            }).length;


        selectedClassTitle.textContent =
            `Form ${form}`;

        selectedClassDescription.textContent =
            `${count === 1 ? "1 student" : `${count} students`} registered in Form ${form}.`;


        document
            .querySelector(".classes-section")
            .classList.add("hidden");

        document
            .querySelector(".students-intro")
            .classList.add("hidden");


        studentsListSection
            .classList.remove("hidden");


        renderStudentsForForm(form);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =====================================================
       RENDER STUDENTS
    ===================================================== */

    function renderStudentsForForm(form) {

        studentsGrid.innerHTML = "";


        const classStudents =
            students
                .filter(function (student) {

                    return Number(
                        student.form_number
                    ) === Number(form);

                })
                .sort(function (a, b) {

                    return String(
                        a.full_name || ""
                    ).localeCompare(
                        String(
                            b.full_name || ""
                        )
                    );

                });


        if (classStudents.length === 0) {

            studentsGrid.classList.add(
                "hidden"
            );

            emptyStudents.classList.remove(
                "hidden"
            );

            return;
        }


        studentsGrid.classList.remove(
            "hidden"
        );

        emptyStudents.classList.add(
            "hidden"
        );


        classStudents.forEach(function (student) {

            studentsGrid.appendChild(
                createStudentCard(student)
            );

        });
    }


    /* =====================================================
       CREATE STUDENT CARD
    ===================================================== */

    function createStudentCard(student) {

        const card =
            document.createElement("article");

        card.className =
            "student-card";


        const name =
            student.full_name ||
            "Unnamed Student";


        const gender =
            student.gender ||
            "Not specified";


        const studentNumber =
            student.student_id ||
            "Not assigned";


        const password =
            student.access_password ||
            "Not assigned";


        const form =
            Number(student.form_number) || "";


        card.innerHTML = `

            <div class="student-card-header">

                <h3 class="student-card-name">
                    ${escapeHTML(name)}
                </h3>

                <span class="class-badge">
                    Form ${escapeHTML(String(form))}
                </span>

            </div>


            <div class="student-details">

                <div class="student-detail">

                    <span class="student-detail-label">
                        Gender
                    </span>

                    <span class="student-detail-value">
                        ${escapeHTML(gender)}
                    </span>

                </div>


                <div class="student-detail">

                    <span class="student-detail-label">
                        Student Number
                    </span>

                    <span class="student-detail-value">
                        ${escapeHTML(studentNumber)}
                    </span>

                </div>


                <div class="student-detail">

                    <span class="student-detail-label">
                        Access Password
                    </span>

                    <span class="student-detail-value password-value">
                        ${escapeHTML(password)}
                    </span>

                </div>

            </div>


            <div class="student-card-actions">

                <button
                    type="button"
                    class="edit-student-button"
                    data-action="edit"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="delete-student-button"
                    data-action="delete"
                >
                    Delete
                </button>

            </div>
        `;


        const editButton =
            card.querySelector(
                '[data-action="edit"]'
            );


        const deleteButton =
            card.querySelector(
                '[data-action="delete"]'
            );


        editButton.addEventListener(
            "click",
            function () {
                openEditStudent(student);
            }
        );


        deleteButton.addEventListener(
            "click",
            function () {
                openDeleteModal(student);
            }
        );


        return card;
    }


    /* =====================================================
       ADD STUDENT
    ===================================================== */

    addStudentButton.addEventListener(
        "click",
        function () {
            openAddStudent();
        }
    );


    addStudentFromListButton.addEventListener(
        "click",
        function () {
            openAddStudent();
        }
    );


    emptyAddStudentButton.addEventListener(
        "click",
        function () {
            openAddStudent();
        }
    );


    function openAddStudent() {

        studentForm.reset();

        editingStudentId.value = "";

        studentModalTitle.textContent =
            "Add Student";

        saveStudentButton.textContent =
            "Save Student";

        studentFormMessage.textContent =
            "";


        if (selectedForm !== null) {

            studentFormNumber.value =
                String(selectedForm);

        }


        studentModal.classList.remove(
            "hidden"
        );


        setTimeout(function () {

            studentFullName.focus();

        }, 50);
    }


    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    function openEditStudent(student) {

        editingStudentId.value =
            student.id;

        studentFullName.value =
            student.full_name || "";

        studentGender.value =
            student.gender || "";

        studentId.value =
            student.student_id || "";

        accessPassword.value =
            student.access_password || "";

        studentFormNumber.value =
            student.form_number
                ? String(student.form_number)
                : "";


        studentModalTitle.textContent =
            "Edit Student";

        saveStudentButton.textContent =
            "Update Student";

        studentFormMessage.textContent =
            "";


        studentModal.classList.remove(
            "hidden"
        );


        setTimeout(function () {

            studentFullName.focus();

        }, 50);
    }


    /* =====================================================
       SAVE STUDENT
    ===================================================== */

    studentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            studentFormMessage.textContent =
                "";


            const fullName =
                studentFullName.value.trim();


            const gender =
                studentGender.value.trim();


            const studentNumber =
                studentId.value.trim();


            const password =
                accessPassword.value.trim();


            const formNumber =
                Number(
                    studentFormNumber.value
                );


            if (!fullName) {

                showFormMessage(
                    "Please enter the student's name."
                );

                return;
            }


            if (!studentNumber) {

                showFormMessage(
                    "Please enter or generate a student number."
                );

                return;
            }


            if (!password) {

                showFormMessage(
                    "Please enter an access password."
                );

                return;
            }


            if (
                !Number.isInteger(formNumber) ||
                formNumber < 1 ||
                formNumber > 4
            ) {

                showFormMessage(
                    "Please select Form 1, Form 2, Form 3 or Form 4."
                );

                return;
            }


            saveStudentButton.disabled =
                true;

            saveStudentButton.textContent =
                editingStudentId.value
                    ? "Updating..."
                    : "Saving...";


            try {

                const editingId =
                    editingStudentId.value.trim();


                /* =========================================
                   CHECK DUPLICATE STUDENT NUMBER
                ========================================== */

                let duplicateQuery =
                    supabase
                        .from("students")
                        .select("id")
                        .eq(
                            "student_id",
                            studentNumber
                        )
                        .limit(1);


                if (editingId) {

                    duplicateQuery =
                        duplicateQuery.neq(
                            "id",
                            editingId
                        );
                }


                const {
                    data: duplicateStudents,
                    error: duplicateError
                } = await duplicateQuery;


                if (duplicateError) {
                    throw duplicateError;
                }


                if (
                    duplicateStudents &&
                    duplicateStudents.length > 0
                ) {

                    showFormMessage(
                        "That student number is already in use."
                    );

                    return;
                }


                /* =========================================
                   DATA MATCHING REAL SUPABASE SCHEMA
                ========================================== */

                const studentData = {

                    full_name: fullName,

                    gender:
                        gender || null,

                    student_id:
                        studentNumber,

                    access_password:
                        password,

                    form_number:
                        formNumber,

                    /*
                       class_id is intentionally kept null here.

                       The page is built around the real
                       form_number field because the requested
                       interface is Form 1–4.

                       If your classes table requires class_id,
                       it can be connected separately without
                       changing the student UI.
                    */

                };


                /* =========================================
                   UPDATE
                ========================================== */

                if (editingId) {

                    const {
                        error
                    } = await supabase
                        .from("students")
                        .update(studentData)
                        .eq(
                            "id",
                            editingId
                        );


                    if (error) {
                        throw error;
                    }

                }

                /* =========================================
                   INSERT
                ========================================== */

                else {

                    const {
                        error
                    } = await supabase
                        .from("students")
                        .insert(
                            studentData
                        );


                    if (error) {
                        throw error;
                    }
                }


                closeStudentModal();

                await loadStudents();


                if (selectedForm !== null) {

                    renderStudentsForForm(
                        selectedForm
                    );
                }


            } catch (error) {

                console.error(
                    "FCA Students: save error:",
                    error
                );


                showFormMessage(
                    getSupabaseErrorMessage(
                        error
                    )
                );

            } finally {

                saveStudentButton.disabled =
                    false;

                saveStudentButton.textContent =
                    editingStudentId.value
                        ? "Update Student"
                        : "Save Student";
            }

        }
    );


    /* =====================================================
       GENERATE STUDENT NUMBER
    ===================================================== */

    generateStudentIdButton.addEventListener(
        "click",
        async function () {

            const form =
                Number(
                    studentFormNumber.value
                );


            if (
                !Number.isInteger(form) ||
                form < 1 ||
                form > 4
            ) {

                showFormMessage(
                    "Select a class first."
                );

                studentFormNumber.focus();

                return;
            }


            studentId.value =
                await generateUniqueStudentNumber(
                    form
                );

            studentFormMessage.textContent =
                "";
        }
    );


    async function generateUniqueStudentNumber(
        form
    ) {

        const year =
            new Date().getFullYear();


        let attempts = 0;


        while (attempts < 50) {

            attempts++;


            const number =
                Math.floor(
                    Math.random() * 999
                ) + 1;


            const suffix =
                String(number)
                    .padStart(3, "0");


            const generated =
                `FCA-${year}-${String(form).padStart(2, "0")}-${suffix}`;


            const {
                data,
                error
            } = await supabase
                .from("students")
                .select("id")
                .eq(
                    "student_id",
                    generated
                )
                .limit(1);


            if (error) {
                console.error(
                    "Student number check failed:",
                    error
                );

                return generated;
            }


            if (!data || data.length === 0) {

                return generated;
            }
        }


        return `FCA-${year}-${String(form).padStart(2, "0")}-${Date.now().toString().slice(-3)}`;
    }


    /* =====================================================
       GENERATE PASSWORD
    ===================================================== */

    generatePasswordButton.addEventListener(
        "click",
        function () {

            accessPassword.value =
                generateAccessPassword();

        }
    );


    function generateAccessPassword() {

        const digits =
            "0123456789";

        const letters =
            "abcdefghijklmnopqrstuvwxyz";


        let result =
            "fca@";


        for (let i = 0; i < 3; i++) {

            result +=
                digits[
                    Math.floor(
                        Math.random() *
                        digits.length
                    )
                ];
        }


        for (let i = 0; i < 3; i++) {

            result +=
                letters[
                    Math.floor(
                        Math.random() *
                        letters.length
                    )
                ];
        }


        return result;
    }


    /* =====================================================
       PASSWORD TOGGLE
    ===================================================== */

    studentPasswordToggle.addEventListener(
        "click",
        function () {

            const eyeOpen =
                studentPasswordToggle.querySelector(
                    ".eye-open"
                );

            const eyeClosed =
                studentPasswordToggle.querySelector(
                    ".eye-closed"
                );


            if (
                accessPassword.type ===
                "password"
            ) {

                accessPassword.type =
                    "text";

                eyeOpen.classList.add(
                    "hidden"
                );

                eyeClosed.classList.remove(
                    "hidden"
                );

                studentPasswordToggle
                    .setAttribute(
                        "aria-label",
                        "Hide password"
                    );

            } else {

                accessPassword.type =
                    "password";

                eyeOpen.classList.remove(
                    "hidden"
                );

                eyeClosed.classList.add(
                    "hidden"
                );

                studentPasswordToggle
                    .setAttribute(
                        "aria-label",
                        "Show password"
                    );
            }
        }
    );


    /* =====================================================
       DELETE STUDENT
    ===================================================== */

    function openDeleteModal(student) {

        studentToDelete =
            student;


        deleteStudentMessage.textContent =
            `Are you sure you want to delete ${student.full_name || "this student"}? This action cannot be undone.`;


        deleteModal.classList.remove(
            "hidden"
        );
    }


    confirmDeleteButton.addEventListener(
        "click",
        async function () {

            if (!studentToDelete) {
                return;
            }


            confirmDeleteButton.disabled =
                true;

            confirmDeleteButton.textContent =
                "Deleting...";


            try {

                const {
                    error
                } = await supabase
                    .from("students")
                    .delete()
                    .eq(
                        "id",
                        studentToDelete.id
                    );


                if (error) {
                    throw error;
                }


                closeDeleteModal();

                studentToDelete =
                    null;


                await loadStudents();


                if (selectedForm !== null) {

                    renderStudentsForForm(
                        selectedForm
                    );
                }


            } catch (error) {

                console.error(
                    "FCA Students: delete error:",
                    error
                );


                alert(
                    getSupabaseErrorMessage(
                        error
                    )
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
       BACK TO CLASSES
    ===================================================== */

    backToClassesButton.addEventListener(
        "click",
        function () {

            selectedForm = null;

            studentsListSection
                .classList.add("hidden");

            document
                .querySelector(".classes-section")
                .classList.remove("hidden");

            document
                .querySelector(".students-intro")
                .classList.remove("hidden");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );


    /* =====================================================
       MODAL CLOSE
    ===================================================== */

    closeStudentModal.addEventListener(
        "click",
        closeStudentModalFunction
    );

    cancelStudentButton.addEventListener(
        "click",
        closeStudentModalFunction
    );


    function closeStudentModalFunction() {

        studentModal.classList.add(
            "hidden"
        );

        studentFormMessage.textContent =
            "";
    }


    closeDeleteModal.addEventListener(
        "click",
        closeDeleteModalFunction
    );

    cancelDeleteButton.addEventListener(
        "click",
        closeDeleteModalFunction
    );


    function closeDeleteModalFunction() {

        deleteModal.classList.add(
            "hidden"
        );

        studentToDelete =
            null;
    }


    /* =====================================================
       CLOSE MODALS BY BACKDROP
    ===================================================== */

    studentModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                studentModal
            ) {

                closeStudentModalFunction();
            }
        }
    );


    deleteModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                deleteModal
            ) {

                closeDeleteModalFunction();
            }
        }
    );


    /* =====================================================
       ESCAPE KEY
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
                !studentModal.classList.contains(
                    "hidden"
                )
            ) {

                closeStudentModalFunction();
            }


            if (
                !deleteModal.classList.contains(
                    "hidden"
                )
            ) {

                closeDeleteModalFunction();
            }
        }
    );


    /* =====================================================
       FORM MESSAGE
    ===================================================== */

    function showFormMessage(message) {

        studentFormMessage.textContent =
            message;
    }


    /* =====================================================
       FATAL ERROR
    ===================================================== */

    function showFatalError(message) {

        if (studentsGrid) {

            studentsGrid.innerHTML = `

                <div
                    style="
                        grid-column: 1 / -1;
                        background:#ffffff;
                        border:1px solid #ddd8d2;
                        border-radius:16px;
                        padding:30px;
                        text-align:center;
                        color:#b42318;
                    "
                >
                    ${escapeHTML(message)}
                </div>
            `;
        }
    }


    /* =====================================================
       SUPABASE ERROR MESSAGE
    ===================================================== */

    function getSupabaseErrorMessage(error) {

        if (!error) {
            return "Something went wrong.";
        }


        if (
            error.code ===
            "23505"
        ) {

            return "This student number is already in use.";
        }


        if (
            error.code ===
            "23503"
        ) {

            return "This student cannot be changed because it is linked to another record.";
        }


        if (
            error.message
        ) {

            return error.message;
        }


        return "Unable to complete the request.";
    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
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