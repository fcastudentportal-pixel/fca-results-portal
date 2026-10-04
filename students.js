/* =========================================================
   FIRST CLASS ACADEMY
   FCA STUDENTS MANAGEMENT
   students.js

   EXISTING DATABASE STRUCTURE

   students:
   - id
   - name
   - student_number
   - access_password
   - class
   - created_at
   - gender

   This page intentionally does NOT use a database
   connection-status display.
========================================================= */

"use strict";


document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       SUPABASE
    ====================================================== */

    const supabase = window.fcaSupabase;


    if (!supabase) {

        console.error(
            "FCA Supabase client was not found."
        );

        showPageError(
            "FCA database connection is not available."
        );

        return;
    }


    /* =====================================================
       CONSTANTS
    ====================================================== */

    const CLASSES = [
        "Form 1",
        "Form 2",
        "Form 3",
        "Form 4"
    ];


    /* =====================================================
       STATE
    ====================================================== */

    let students = [];

    let selectedClass = null;

    let deleteStudentId = null;


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const classesGrid =
        document.getElementById(
            "classesGrid"
        );


    const studentsSection =
        document.getElementById(
            "studentsSection"
        );


    const studentsGrid =
        document.getElementById(
            "studentsGrid"
        );


    const noStudents =
        document.getElementById(
            "noStudents"
        );


    const selectedClassTitle =
        document.getElementById(
            "selectedClassTitle"
        );


    const studentCount =
        document.getElementById(
            "studentCount"
        );


    const addStudentTopBtn =
        document.getElementById(
            "addStudentTopBtn"
        );


    const addStudentBtn =
        document.getElementById(
            "addStudentBtn"
        );


    const emptyAddStudentBtn =
        document.getElementById(
            "emptyAddStudentBtn"
        );


    const studentModal =
        document.getElementById(
            "studentModal"
        );


    const studentModalOverlay =
        document.getElementById(
            "studentModalOverlay"
        );


    const closeStudentModal =
        document.getElementById(
            "closeStudentModal"
        );


    const cancelStudentBtn =
        document.getElementById(
            "cancelStudentBtn"
        );


    const studentForm =
        document.getElementById(
            "studentForm"
        );


    const studentModalTitle =
        document.getElementById(
            "studentModalTitle"
        );


    const editingStudentId =
        document.getElementById(
            "editingStudentId"
        );


    const studentNameInput =
        document.getElementById(
            "studentNameInput"
        );


    const studentGenderInput =
        document.getElementById(
            "studentGenderInput"
        );


    const studentNumberInput =
        document.getElementById(
            "studentNumberInput"
        );


    const studentPasswordInput =
        document.getElementById(
            "studentPasswordInput"
        );


    const studentClassInput =
        document.getElementById(
            "studentClassInput"
        );


    const generatePasswordBtn =
        document.getElementById(
            "generatePasswordBtn"
        );


    const saveStudentBtn =
        document.getElementById(
            "saveStudentBtn"
        );


    const formMessage =
        document.getElementById(
            "formMessage"
        );


    const deleteModal =
        document.getElementById(
            "deleteModal"
        );


    const deleteModalOverlay =
        document.getElementById(
            "deleteModalOverlay"
        );


    const closeDeleteModal =
        document.getElementById(
            "closeDeleteModal"
        );


    const cancelDeleteBtn =
        document.getElementById(
            "cancelDeleteBtn"
        );


    const confirmDeleteBtn =
        document.getElementById(
            "confirmDeleteBtn"
        );


    const deleteMessage =
        document.getElementById(
            "deleteMessage"
        );


    /* =====================================================
       GENERAL HELPERS
    ====================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function normalize(value) {

        return String(value ?? "")
            .trim()
            .toLowerCase();
    }


    function showPageError(message) {

        if (!classesGrid) {
            return;
        }

        classesGrid.innerHTML = `
            <div class="empty-state">
                <h4>Unable to Load Students</h4>
                <p>${escapeHTML(message)}</p>
            </div>
        `;
    }


    function showFormMessage(message) {

        if (formMessage) {

            formMessage.textContent =
                message || "";
        }
    }


    function clearFormMessage() {

        showFormMessage("");
    }


    /* =====================================================
       RENDER CLASSES
    ====================================================== */

    function renderClasses() {

        if (!classesGrid) {
            return;
        }


        classesGrid.innerHTML =
            CLASSES.map(
                (className) => {

                    const classStudents =
                        students.filter(
                            (student) =>
                                normalize(
                                    student.class
                                ) ===
                                normalize(
                                    className
                                )
                        );


                    const activeClass =
                        selectedClass ===
                        className
                            ? "active"
                            : "";


                    return `
                        <button
                            type="button"
                            class="class-card ${activeClass}"
                            data-class="${escapeHTML(className)}"
                        >

                            <div class="eyebrow">
                                FCA CLASS
                            </div>

                            <h4>
                                ${escapeHTML(className)}
                            </h4>

                            <p>
                                ${classStudents.length}
                                ${
                                    classStudents.length === 1
                                        ? "student"
                                        : "students"
                                }
                            </p>

                        </button>
                    `;
                }
            )
            .join("");
    }


    /* =====================================================
       SELECT CLASS
    ====================================================== */

    function selectClass(className) {

        selectedClass =
            className;


        renderClasses();


        if (studentsSection) {

            studentsSection.classList.remove(
                "hidden"
            );
        }


        if (selectedClassTitle) {

            selectedClassTitle.textContent =
                `${className} Students`;
        }


        renderStudents();


        if (studentsSection) {

            setTimeout(() => {

                studentsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 50);
        }
    }


    /* =====================================================
       RENDER STUDENTS
    ====================================================== */

    function renderStudents() {

        if (!studentsGrid) {
            return;
        }


        const filteredStudents =
            students.filter(
                (student) =>
                    normalize(
                        student.class
                    ) ===
                    normalize(
                        selectedClass
                    )
            );


        if (studentCount) {

            studentCount.textContent =
                `${filteredStudents.length} ${
                    filteredStudents.length === 1
                        ? "student"
                        : "students"
                }`;
        }


        if (
            filteredStudents.length === 0
        ) {

            studentsGrid.innerHTML = "";


            if (noStudents) {

                noStudents.classList.remove(
                    "hidden"
                );
            }

            return;
        }


        if (noStudents) {

            noStudents.classList.add(
                "hidden"
            );
        }


        studentsGrid.innerHTML =
            filteredStudents
                .map(
                    (student) =>
                        createStudentCard(
                            student
                        )
                )
                .join("");
    }


    /* =====================================================
       STUDENT CARD
    ====================================================== */

    function createStudentCard(student) {

        const gender =
            student.gender ||
            "Not specified";


        const password =
            student.access_password ||
            "Not set";


        return `
            <article class="student-card">

                <div class="student-card-header">

                    <h4>
                        ${escapeHTML(
                            student.name ||
                            "Unnamed Student"
                        )}
                    </h4>

                    <span class="student-class-badge">
                        ${escapeHTML(
                            student.class ||
                            "No class"
                        )}
                    </span>

                </div>


                <div class="student-details">

                    <div class="student-detail">

                        <span>
                            Gender
                        </span>

                        <span>
                            ${escapeHTML(
                                gender
                            )}
                        </span>

                    </div>


                    <div class="student-detail">

                        <span>
                            Student Number
                        </span>

                        <span>
                            ${escapeHTML(
                                student.student_number ||
                                "Not set"
                            )}
                        </span>

                    </div>


                    <div class="student-detail">

                        <span>
                            Access Password
                        </span>

                        <span>
                            ${escapeHTML(
                                password
                            )}
                        </span>

                    </div>

                </div>


                <div class="student-card-actions">

                    <button
                        type="button"
                        class="secondary edit-student-btn"
                        data-id="${escapeHTML(student.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="danger delete-student-btn"
                        data-id="${escapeHTML(student.id)}"
                    >
                        Delete
                    </button>

                </div>

            </article>
        `;
    }


    /* =====================================================
       LOAD STUDENTS
    ====================================================== */

    async function loadStudents() {

        try {

            const {
                data,
                error
            } = await supabase
                .from("students")
                .select(
                    "id,name,student_number,access_password,class,gender,created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (error) {

                console.error(
                    "FCA STUDENTS ERROR:",
                    error
                );

                showPageError(
                    error.message
                );

                return;
            }


            students =
                Array.isArray(data)
                    ? data
                    : [];


            renderClasses();


            if (selectedClass) {

                renderStudents();
            }

        } catch (error) {

            console.error(
                "Unexpected students error:",
                error
            );

            showPageError(
                error.message ||
                "Unable to load students."
            );
        }
    }


    /* =====================================================
       OPEN ADD MODAL
    ====================================================== */

    function openAddStudentModal() {

        if (!studentModal) {
            return;
        }


        studentForm.reset();


        editingStudentId.value = "";


        studentModalTitle.textContent =
            "Add Student";


        saveStudentBtn.textContent =
            "Save Student";


        clearFormMessage();


        if (selectedClass) {

            studentClassInput.value =
                selectedClass;
        }


        studentModal.classList.remove(
            "hidden"
        );


        studentModal.setAttribute(
            "aria-hidden",
            "false"
        );


        setTimeout(() => {

            studentNameInput.focus();

        }, 50);
    }


    /* =====================================================
       OPEN EDIT MODAL
    ====================================================== */

    function openEditStudentModal(
        studentId
    ) {

        const student =
            students.find(
                (item) =>
                    String(item.id) ===
                    String(studentId)
            );


        if (!student) {

            alert(
                "Student record could not be found."
            );

            return;
        }


        editingStudentId.value =
            student.id;


        studentNameInput.value =
            student.name || "";


        studentGenderInput.value =
            student.gender || "";


        studentNumberInput.value =
            student.student_number || "";


        studentPasswordInput.value =
            student.access_password || "";


        studentClassInput.value =
            student.class || "";


        studentModalTitle.textContent =
            "Edit Student";


        saveStudentBtn.textContent =
            "Update Student";


        clearFormMessage();


        studentModal.classList.remove(
            "hidden"
        );


        studentModal.setAttribute(
            "aria-hidden",
            "false"
        );


        setTimeout(() => {

            studentNameInput.focus();

        }, 50);
    }


    /* =====================================================
       CLOSE STUDENT MODAL
    ====================================================== */

    function closeStudentModalWindow() {

        if (!studentModal) {
            return;
        }


        studentModal.classList.add(
            "hidden"
        );


        studentModal.setAttribute(
            "aria-hidden",
            "true"
        );


        clearFormMessage();
    }


    /* =====================================================
       GENERATE PASSWORD
    ====================================================== */

    function generatePassword() {

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


        studentPasswordInput.value =
            `fca@${randomLetters}${numbers}`;
    }


    /* =====================================================
       GENERATE STUDENT NUMBER
    ====================================================== */

    function generateStudentNumber() {

        const year =
            new Date()
                .getFullYear();


        const surnameSource =
            studentNameInput.value
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .pop() || "STUDENT";


        const surnameLetters =
            surnameSource
                .replace(
                    /[^a-zA-Z]/g,
                    ""
                )
                .toUpperCase()
                .padEnd(2, "X")
                .substring(0, 2);


        let number;

        do {

            number =
                String(
                    Math.floor(
                        1 +
                        Math.random() *
                        999
                    )
                ).padStart(
                    3,
                    "0"
                );

        } while (
            students.some(
                (student) =>
                    normalize(
                        student.student_number
                    ) ===
                    normalize(
                        `FCA-${year}-${surnameLetters}-${number}`
                    )
            )
        );


        studentNumberInput.value =
            `FCA-${year}-${surnameLetters}-${number}`;
    }


    /* =====================================================
       SAVE STUDENT
    ====================================================== */

    async function saveStudent(
        event
    ) {

        event.preventDefault();


        clearFormMessage();


        const name =
            studentNameInput.value.trim();


        const gender =
            studentGenderInput.value.trim();


        const studentNumber =
            studentNumberInput.value.trim();


        const password =
            studentPasswordInput.value.trim();


        const className =
            studentClassInput.value.trim();


        if (!name) {

            showFormMessage(
                "Please enter the student's name."
            );

            studentNameInput.focus();

            return;
        }


        if (!studentNumber) {

            showFormMessage(
                "Please enter the student number."
            );

            studentNumberInput.focus();

            return;
        }


        if (!password) {

            showFormMessage(
                "Please enter an access password."
            );

            studentPasswordInput.focus();

            return;
        }


        if (!className) {

            showFormMessage(
                "Please select a class."
            );

            studentClassInput.focus();

            return;
        }


        const currentId =
            editingStudentId.value.trim();


        const duplicateStudent =
            students.find(
                (student) => {

                    if (
                        currentId &&
                        String(student.id) ===
                        String(currentId)
                    ) {

                        return false;
                    }


                    return (
                        normalize(
                            student.student_number
                        ) ===
                        normalize(
                            studentNumber
                        )
                    );
                }
            );


        if (duplicateStudent) {

            showFormMessage(
                "That student number is already in use."
            );

            studentNumberInput.focus();

            return;
        }


        saveStudentBtn.disabled =
            true;


        saveStudentBtn.textContent =
            currentId
                ? "Updating..."
                : "Saving...";


        try {

            const studentData = {

                name: name,

                gender:
                    gender || null,

                student_number:
                    studentNumber,

                access_password:
                    password,

                class:
                    className
            };


            if (currentId) {

                /* =====================================
                   UPDATE
                ====================================== */

                const {
                    error
                } = await supabase
                    .from("students")
                    .update(
                        studentData
                    )
                    .eq(
                        "id",
                        currentId
                    );


                if (error) {

                    console.error(
                        "UPDATE STUDENT ERROR:",
                        error
                    );

                    showFormMessage(
                        error.message
                    );

                    return;
                }


            } else {

                /* =====================================
                   INSERT
                ====================================== */

                const {
                    error
                } = await supabase
                    .from("students")
                    .insert(
                        studentData
                    );


                if (error) {

                    console.error(
                        "ADD STUDENT ERROR:",
                        error
                    );

                    showFormMessage(
                        error.message
                    );

                    return;
                }
            }


            closeStudentModalWindow();


            await loadStudents();


            selectClass(
                className
            );


        } catch (error) {

            console.error(
                "SAVE STUDENT ERROR:",
                error
            );

            showFormMessage(
                error.message ||
                "Unable to save student."
            );

        } finally {

            saveStudentBtn.disabled =
                false;

            saveStudentBtn.textContent =
                currentId
                    ? "Update Student"
                    : "Save Student";
        }
    }


    /* =====================================================
       OPEN DELETE MODAL
    ====================================================== */

    function openDeleteStudentModal(
        studentId
    ) {

        const student =
            students.find(
                (item) =>
                    String(item.id) ===
                    String(studentId)
            );


        if (!student) {
            return;
        }


        deleteStudentId =
            student.id;


        if (deleteMessage) {

            deleteMessage.textContent =
                `Are you sure you want to delete ${student.name || "this student"}?`;
        }


        deleteModal.classList.remove(
            "hidden"
        );


        deleteModal.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    /* =====================================================
       CLOSE DELETE MODAL
    ====================================================== */

    function closeDeleteStudentModal() {

        if (!deleteModal) {
            return;
        }


        deleteModal.classList.add(
            "hidden"
        );


        deleteModal.setAttribute(
            "aria-hidden",
            "true"
        );


        deleteStudentId = null;
    }


    /* =====================================================
       DELETE STUDENT
    ====================================================== */

    async function deleteStudent() {

        if (!deleteStudentId) {
            return;
        }


        confirmDeleteBtn.disabled =
            true;


        confirmDeleteBtn.textContent =
            "Deleting...";


        try {

            const {
                error
            } = await supabase
                .from("students")
                .delete()
                .eq(
                    "id",
                    deleteStudentId
                );


            if (error) {

                console.error(
                    "DELETE STUDENT ERROR:",
                    error
                );

                alert(
                    "Unable to delete student: " +
                    error.message
                );

                return;
            }


            const deletedClass =
                selectedClass;


            closeDeleteStudentModal();


            await loadStudents();


            if (deletedClass) {

                selectClass(
                    deletedClass
                );
            }


        } catch (error) {

            console.error(
                "DELETE STUDENT ERROR:",
                error
            );

            alert(
                error.message ||
                "Unable to delete student."
            );

        } finally {

            confirmDeleteBtn.disabled =
                false;

            confirmDeleteBtn.textContent =
                "Delete Student";
        }
    }


    /* =====================================================
       EVENT DELEGATION
    ====================================================== */

    if (classesGrid) {

        classesGrid.addEventListener(
            "click",
            (event) => {

                const card =
                    event.target.closest(
                        ".class-card"
                    );


                if (!card) {
                    return;
                }


                selectClass(
                    card.dataset.class
                );
            }
        );
    }


    if (studentsGrid) {

        studentsGrid.addEventListener(
            "click",
            (event) => {

                const editButton =
                    event.target.closest(
                        ".edit-student-btn"
                    );


                const deleteButton =
                    event.target.closest(
                        ".delete-student-btn"
                    );


                if (editButton) {

                    openEditStudentModal(
                        editButton.dataset.id
                    );

                    return;
                }


                if (deleteButton) {

                    openDeleteStudentModal(
                        deleteButton.dataset.id
                    );
                }
            }
        );
    }


    /* =====================================================
       BUTTON EVENTS
    ====================================================== */

    if (addStudentTopBtn) {

        addStudentTopBtn.addEventListener(
            "click",
            openAddStudentModal
        );
    }


    if (addStudentBtn) {

        addStudentBtn.addEventListener(
            "click",
            openAddStudentModal
        );
    }


    if (emptyAddStudentBtn) {

        emptyAddStudentBtn.addEventListener(
            "click",
            openAddStudentModal
        );
    }


    if (closeStudentModal) {

        closeStudentModal.addEventListener(
            "click",
            closeStudentModalWindow
        );
    }


    if (cancelStudentBtn) {

        cancelStudentBtn.addEventListener(
            "click",
            closeStudentModalWindow
        );
    }


    if (studentModalOverlay) {

        studentModalOverlay.addEventListener(
            "click",
            closeStudentModalWindow
        );
    }


    if (generatePasswordBtn) {

        generatePasswordBtn.addEventListener(
            "click",
            generatePassword
        );
    }


    if (studentNameInput) {

        studentNameInput.addEventListener(
            "blur",
            () => {

                if (
                    !editingStudentId.value &&
                    !studentNumberInput.value.trim()
                ) {

                    generateStudentNumber();
                }
            }
        );
    }


    if (studentForm) {

        studentForm.addEventListener(
            "submit",
            saveStudent
        );
    }


    if (closeDeleteModal) {

        closeDeleteModal.addEventListener(
            "click",
            closeDeleteStudentModal
        );
    }


    if (cancelDeleteBtn) {

        cancelDeleteBtn.addEventListener(
            "click",
            closeDeleteStudentModal
        );
    }


    if (deleteModalOverlay) {

        deleteModalOverlay.addEventListener(
            "click",
            closeDeleteStudentModal
        );
    }


    if (confirmDeleteBtn) {

        confirmDeleteBtn.addEventListener(
            "click",
            deleteStudent
        );
    }


    /* =====================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                if (
                    studentModal &&
                    !studentModal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeStudentModalWindow();
                }


                if (
                    deleteModal &&
                    !deleteModal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeDeleteStudentModal();
                }
            }
        }
    );


    /* =====================================================
       INITIAL LOAD
    ====================================================== */

    renderClasses();

    loadStudents();

});