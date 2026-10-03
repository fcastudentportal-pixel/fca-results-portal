"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   FCA STUDENTS MANAGEMENT
   SUPABASE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("FCA Students: starting...");

    const supabase = window.fcaSupabase;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const databaseStatus =
        document.getElementById("databaseStatus");

    const classesContainer =
        document.getElementById("classesContainer");

    const studentsContainer =
        document.getElementById("studentsContainer");

    const classesSection =
        document.getElementById("classesSection");

    const studentsSection =
        document.getElementById("studentsSection");

    const selectedClassName =
        document.getElementById("selectedClassName");

    const selectedClassTitle =
        document.getElementById("selectedClassTitle");

    const selectedClassDescription =
        document.getElementById("selectedClassDescription");

    const selectedFormNumber =
        document.getElementById("selectedFormNumber");

    const studentCount =
        document.getElementById("studentCount");

    const backButton =
        document.getElementById("backToClasses");

    const refreshButton =
        document.getElementById("refreshStudentsButton");

    const addStudentButton =
        document.getElementById("addStudentButton");

    const emptyAddStudentButton =
        document.getElementById("emptyAddStudentButton");

    const noStudentsState =
        document.getElementById("noStudentsState");

    const noClassesState =
        document.getElementById("noClassesState");


    /* =====================================================
       STATE
    ===================================================== */

    let classes = [];

    let students = [];

    let selectedClass = null;


    /* =====================================================
       SUPABASE CHECK
    ===================================================== */

    if (!supabase) {

        setStatus(
            "Supabase is not connected. Check config.js.",
            "error"
        );

        return;
    }


    /* =====================================================
       START
    ===================================================== */

    initialize();


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initialize() {

        setStatus(
            "Checking FCA database...",
            "loading"
        );

        try {

            await loadClasses();

            await loadStudents();

            setStatus(
                "FCA database connected.",
                "success"
            );


            /*
             * IMPORTANT:
             *
             * Classes page sends:
             *
             * students.html?form=1
             *
             * students.html?form=2
             *
             * students.html?form=3
             *
             * students.html?form=4
             *
             * Automatically open that class.
             */

            const params =
                new URLSearchParams(
                    window.location.search
                );

            const formFromUrl =
                parseInt(
                    params.get("form"),
                    10
                );


            if (
                Number.isInteger(formFromUrl) &&
                formFromUrl >= 1 &&
                formFromUrl <= 4
            ) {

                openFormFromUrl(
                    formFromUrl
                );

            }

        }

        catch (error) {

            console.error(
                "FCA Students initialization error:",
                error
            );

            setStatus(
                "Database error: " +
                error.message,
                "error"
            );

        }

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
                .select("*");


        if (error) {
            throw error;
        }


        students =
            Array.isArray(data)
                ? data
                : [];


        updateStudentCount();

    }


    /* =====================================================
       RENDER CLASSES
    ===================================================== */

    function renderClasses() {

        if (!classesContainer) {
            return;
        }


        classesContainer.innerHTML = "";


        if (classes.length === 0) {

            if (noClassesState) {
                noClassesState.hidden = false;
            }

            return;

        }


        if (noClassesState) {
            noClassesState.hidden = true;
        }


        classes.forEach(function (classItem) {

            const form =
                getFormNumber(classItem);

            const name =
                getClassName(classItem);

            const card =
                document.createElement("button");


            card.type = "button";

            card.className =
                "student-class-card";


            card.innerHTML = `

                <div class="student-class-icon">
                    ${escapeHtml(
                        String(form || "?")
                    )}
                </div>


                <div class="student-class-info">

                    <small>
                        FCA CLASS
                    </small>

                    <h3>
                        ${escapeHtml(name)}
                    </h3>

                    <p>
                        ${escapeHtml(
                            classItem.class_code ||
                            "View students"
                        )}
                    </p>

                </div>


                <div class="student-class-arrow">
                    →
                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    openClass(
                        classItem
                    );

                }
            );


            classesContainer.appendChild(card);

        });

    }


    /* =====================================================
       OPEN FORM FROM URL
    ===================================================== */

    function openFormFromUrl(formNumber) {

        console.log(
            "FCA: Opening Form",
            formNumber,
            "from URL."
        );


        const classItem =
            classes.find(function (item) {

                return (
                    getFormNumber(item) ===
                    formNumber
                );

            });


        /*
         * The URL came from the Classes page,
         * so the class should exist in Supabase.
         */

        if (!classItem) {

            setStatus(
                "The requested class could not be found.",
                "error"
            );

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

        if (!classItem) {
            return;
        }


        selectedClass =
            classItem;


        const name =
            getClassName(
                classItem
            );


        const form =
            getFormNumber(
                classItem
            );


        console.log(
            "FCA: Opening class:",
            name,
            "Form:",
            form
        );


        /*
         * Update URL.
         */

        if (updateUrl) {

            const newUrl =
                "students.html?form=" +
                encodeURIComponent(form);


            window.history.replaceState(
                {},
                "",
                newUrl
            );

        }


        /*
         * Heading.
         */

        if (selectedClassName) {

            selectedClassName.textContent =
                (
                    "FCA " +
                    name
                ).toUpperCase();

        }


        if (selectedClassTitle) {

            selectedClassTitle.textContent =
                name +
                " Students";

        }


        if (selectedClassDescription) {

            selectedClassDescription.textContent =
                classItem.description ||
                "Students registered in " +
                name +
                ".";

        }


        if (selectedFormNumber) {

            selectedFormNumber.textContent =
                form || "—";

        }


        /*
         * Hide class selector.
         */

        if (classesSection) {

            classesSection.hidden =
                true;

        }


        /*
         * Show students.
         */

        if (studentsSection) {

            studentsSection.hidden =
                false;

        }


        showStudentsForClass(
            classItem
        );

    }


    /* =====================================================
       GET STUDENTS FOR CLASS
    ===================================================== */

    function getStudentsForClass(
        classItem
    ) {

        if (!classItem) {
            return [];
        }


        const formNumber =
            getFormNumber(
                classItem
            );


        const classId =
            classItem.id;


        return students.filter(
            function (student) {

                /*
                 * Prefer exact class_id.
                 */

                if (
                    classId &&
                    student.class_id
                ) {

                    return (
                        String(
                            student.class_id
                        ) ===
                        String(
                            classId
                        )
                    );

                }


                /*
                 * Fallback to form_number.
                 */

                return (
                    Number(
                        student.form_number
                    ) ===
                    Number(
                        formNumber
                    )
                );

            }
        );

    }


    /* =====================================================
       SHOW STUDENTS
    ===================================================== */

    function showStudentsForClass(
        classItem
    ) {

        const matched =
            getStudentsForClass(
                classItem
            );


        console.log(
            "FCA students found:",
            matched.length
        );


        if (studentCount) {

            studentCount.textContent =
                matched.length;

        }


        renderStudents(
            matched
        );

    }


    /* =====================================================
       RENDER STUDENTS
    ===================================================== */

    function renderStudents(list) {

        if (!studentsContainer) {
            return;
        }


        studentsContainer.innerHTML = "";


        if (
            !list ||
            list.length === 0
        ) {

            studentsContainer.hidden =
                true;


            if (noStudentsState) {
                noStudentsState.hidden = false;
            }


            return;

        }


        studentsContainer.hidden =
            false;


        if (noStudentsState) {
            noStudentsState.hidden = true;
        }


        list.forEach(function (student) {

            createStudentCard(
                student
            );

        });

    }


    /* =====================================================
       STUDENT CARD
    ===================================================== */

    function createStudentCard(student) {

        const card =
            document.createElement("article");


        card.className =
            "student-card";


        const name =
            getStudentName(
                student
            );


        const studentId =
            student.student_id ||
            "Not assigned";


        const password =
            student.access_password ||
            "Not assigned";


        const form =
            student.form_number ||
            getFormNumber(selectedClass);


        const className =
            selectedClass
                ? getClassName(selectedClass)
                : "Not assigned";


        const subjects =
            Array.isArray(student.subjects)
                ? student.subjects
                : [];


        card.innerHTML = `

            <div class="student-card-header">

                <div class="student-avatar">
                    ${escapeHtml(
                        getInitials(name)
                    )}
                </div>


                <div>

                    <h3>
                        ${escapeHtml(name)}
                    </h3>

                    <span>
                        ${escapeHtml(
                            String(studentId)
                        )}
                    </span>

                </div>

            </div>


            <div class="student-details">

                <div class="student-detail">

                    <small>
                        FULL NAME
                    </small>

                    <strong>
                        ${escapeHtml(name)}
                    </strong>

                </div>


                <div class="student-detail">

                    <small>
                        STUDENT ID
                    </small>

                    <strong>
                        ${escapeHtml(
                            String(studentId)
                        )}
                    </strong>

                </div>


                <div class="student-detail">

                    <small>
                        ACCESS PASSWORD
                    </small>

                    <strong>
                        ${escapeHtml(
                            String(password)
                        )}
                    </strong>

                </div>


                <div class="student-detail">

                    <small>
                        CLASS
                    </small>

                    <strong>
                        ${escapeHtml(className)}
                    </strong>

                </div>


                <div class="student-detail">

                    <small>
                        FORM
                    </small>

                    <strong>
                        Form ${escapeHtml(
                            String(form)
                        )}
                    </strong>

                </div>


                <div class="student-detail">

                    <small>
                        SUBJECTS TAKEN
                    </small>

                    <div class="subject-list">

                        ${renderSubjects(
                            subjects
                        )}

                    </div>

                </div>

            </div>


            <div class="student-actions">

                <button
                    type="button"
                    class="secondary-button"
                    data-action="edit"
                >
                    Edit
                </button>


                <button
                    type="button"
                    class="danger-button"
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


        if (editButton) {

            editButton.addEventListener(
                "click",
                function () {

                    editStudent(
                        student
                    );

                }
            );

        }


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function () {

                    deleteStudent(
                        student
                    );

                }
            );

        }


        studentsContainer.appendChild(
            card
        );

    }


    /* =====================================================
       ADD STUDENT BUTTONS
    ===================================================== */

    if (addStudentButton) {

        addStudentButton.addEventListener(
            "click",
            openAddStudentForm
        );

    }


    if (emptyAddStudentButton) {

        emptyAddStudentButton.addEventListener(
            "click",
            openAddStudentForm
        );

    }


    /* =====================================================
       OPEN ADD STUDENT FORM
    ===================================================== */

    function openAddStudentForm() {

        if (!selectedClass) {

            alert(
                "Please select a class first."
            );

            return;

        }


        const className =
            getClassName(
                selectedClass
            );


        const formNumber =
            getFormNumber(
                selectedClass
            );


        const modal =
            document.createElement(
                "div"
            );


        modal.className =
            "student-add-modal";


        modal.innerHTML = `

            <div class="student-add-overlay"></div>


            <div class="student-add-card">

                <button
                    type="button"
                    class="student-add-close"
                    id="closeAddStudent"
                    aria-label="Close"
                >
                    ×
                </button>


                <div class="student-add-header">

                    <small>
                        ADD STUDENT
                    </small>

                    <h2>
                        ${escapeHtml(
                            className
                        )}
                    </h2>

                    <p>
                        Add a new student to this class.
                    </p>

                </div>


                <form id="addStudentForm">

                    <div class="form-group">

                        <label for="newStudentName">
                            Full Name
                        </label>

                        <input
                            id="newStudentName"
                            type="text"
                            placeholder="Enter student's full name"
                            autocomplete="off"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Student ID
                        </label>

                        <input
                            type="text"
                            value="Generated automatically"
                            disabled
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Access Password
                        </label>

                        <input
                            type="text"
                            value="Generated automatically"
                            disabled
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Class
                        </label>

                        <input
                            type="text"
                            value="${escapeHtml(
                                className
                            )}"
                            disabled
                        >

                    </div>


                    <div
                        id="addStudentMessage"
                        class="student-add-message"
                    ></div>


                    <button
                        type="submit"
                        id="saveNewStudent"
                        class="primary-button"
                    >
                        Add Student
                    </button>

                </form>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const form =
            modal.querySelector(
                "#addStudentForm"
            );


        const nameInput =
            modal.querySelector(
                "#newStudentName"
            );


        const closeButton =
            modal.querySelector(
                "#closeAddStudent"
            );


        const overlay =
            modal.querySelector(
                ".student-add-overlay"
            );


        if (nameInput) {

            setTimeout(
                function () {

                    nameInput.focus();

                },
                100
            );

        }


        if (closeButton) {

            closeButton.onclick =
                function () {

                    modal.remove();

                };

        }


        if (overlay) {

            overlay.onclick =
                function () {

                    modal.remove();

                };

        }


        if (form) {

            form.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();

                    await saveNewStudent(
                        modal,
                        nameInput,
                        formNumber
                    );

                }
            );

        }

    }


    /* =====================================================
       SAVE NEW STUDENT
    ===================================================== */

    async function saveNewStudent(
        modal,
        nameInput,
        formNumber
    ) {

        const fullName =
            nameInput
                ? nameInput.value.trim()
                : "";


        const message =
            modal.querySelector(
                "#addStudentMessage"
            );


        const saveButton =
            modal.querySelector(
                "#saveNewStudent"
            );


        if (!fullName) {

            showAddMessage(
                message,
                "Please enter the student's full name.",
                "error"
            );

            return;

        }


        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Adding Student...";

        }


        showAddMessage(
            message,
            "Generating credentials...",
            "loading"
        );


        try {

            const studentId =
                await generateStudentId(
                    fullName
                );


            const accessPassword =
                generateAccessPassword();


            const student = {

                id:
                    generateUUID(),

                full_name:
                    fullName,

                student_id:
                    studentId,

                access_password:
                    accessPassword,

                class_id:
                    selectedClass &&
                    selectedClass.id
                        ? selectedClass.id
                        : null,

                form_number:
                    formNumber,

                subjects:
                    []

            };


            const {
                data,
                error
            } =
                await supabase
                    .from("students")
                    .insert(student)
                    .select()
                    .single();


            if (error) {
                throw error;
            }


            students.push(
                data
            );


            showStudentsForClass(
                selectedClass
            );


            showAddMessage(
                message,
                "Student added successfully.",
                "success"
            );


            message.innerHTML = `

                <div class="student-success">

                    <strong>
                        Student Added Successfully ✓
                    </strong>

                    <div>

                        <small>
                            Student ID
                        </small>

                        <b>
                            ${escapeHtml(
                                studentId
                            )}
                        </b>

                    </div>


                    <div>

                        <small>
                            Access Password
                        </small>

                        <b>
                            ${escapeHtml(
                                accessPassword
                            )}
                        </b>

                    </div>

                </div>

            `;


            if (saveButton) {

                saveButton.textContent =
                    "Student Added ✓";

            }


            setStatus(
                "Student added successfully.",
                "success"
            );


            const close =
                document.createElement(
                    "button"
                );


            close.type = "button";

            close.className =
                "secondary-button";

            close.style.width =
                "100%";

            close.style.marginTop =
                "12px";

            close.textContent =
                "Close";


            close.onclick =
                function () {

                    modal.remove();

                };


            modal
                .querySelector(
                    ".student-add-card"
                )
                .appendChild(close);

        }

        catch (error) {

            console.error(
                "Add student error:",
                error
            );


            showAddMessage(
                message,
                "Unable to add student: " +
                error.message,
                "error"
            );


            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "Add Student";

            }

        }

    }


    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    function editStudent(student) {

        if (!student) {
            return;
        }


        const subjects =
            Array.isArray(student.subjects)
                ? student.subjects
                : [];


        const modal =
            document.createElement(
                "div"
            );


        modal.className =
            "student-add-modal";


        modal.innerHTML = `

            <div class="student-add-overlay"></div>


            <div class="student-add-card">

                <button
                    type="button"
                    class="student-add-close"
                    id="closeEditStudent"
                    aria-label="Close"
                >
                    ×
                </button>


                <div class="student-add-header">

                    <small>
                        EDIT STUDENT
                    </small>

                    <h2>
                        Edit Student
                    </h2>

                    <p>
                        Update this student's information.
                    </p>

                </div>


                <form id="editStudentForm">

                    <div class="form-group">

                        <label for="editStudentName">
                            Full Name
                        </label>

                        <input
                            id="editStudentName"
                            type="text"
                            value="${escapeHtml(
                                student.full_name || ""
                            )}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Student ID
                        </label>

                        <input
                            type="text"
                            value="${escapeHtml(
                                student.student_id || ""
                            )}"
                            disabled
                        >

                    </div>


                    <div class="form-group">

                        <label for="editStudentPassword">
                            Access Password
                        </label>

                        <input
                            id="editStudentPassword"
                            type="text"
                            value="${escapeHtml(
                                student.access_password || ""
                            )}"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label>
                            Class
                        </label>

                        <input
                            type="text"
                            value="${escapeHtml(
                                selectedClass
                                    ? getClassName(selectedClass)
                                    : "Not assigned"
                            )}"
                            disabled
                        >

                    </div>


                    <div class="form-group">

                        <label for="editStudentSubjects">
                            Subjects
                        </label>

                        <textarea
                            id="editStudentSubjects"
                            placeholder="Example: Mathematics, English, Biology"
                        >${escapeHtml(
                            subjectsToText(subjects)
                        )}</textarea>

                    </div>


                    <div
                        id="editStudentMessage"
                        class="student-add-message"
                    ></div>


                    <div class="student-modal-actions">

                        <button
                            type="button"
                            id="cancelEditStudent"
                            class="secondary-button"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            id="saveEditedStudent"
                            class="primary-button"
                        >
                            Save Changes
                        </button>

                    </div>

                </form>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const form =
            modal.querySelector(
                "#editStudentForm"
            );


        const closeButton =
            modal.querySelector(
                "#closeEditStudent"
            );


        const cancelButton =
            modal.querySelector(
                "#cancelEditStudent"
            );


        const overlay =
            modal.querySelector(
                ".student-add-overlay"
            );


        if (closeButton) {

            closeButton.onclick =
                function () {

                    modal.remove();

                };

        }


        if (cancelButton) {

            cancelButton.onclick =
                function () {

                    modal.remove();

                };

        }


        if (overlay) {

            overlay.onclick =
                function () {

                    modal.remove();

                };

        }


        if (form) {

            form.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();


                    await saveEditedStudent(
                        modal,
                        student
                    );

                }
            );

        }

    }


    /* =====================================================
       SAVE EDITED STUDENT
    ===================================================== */

    async function saveEditedStudent(
        modal,
        student
    ) {

        const nameInput =
            modal.querySelector(
                "#editStudentName"
            );


        const passwordInput =
            modal.querySelector(
                "#editStudentPassword"
            );


        const subjectsInput =
            modal.querySelector(
                "#editStudentSubjects"
            );


        const message =
            modal.querySelector(
                "#editStudentMessage"
            );


        const saveButton =
            modal.querySelector(
                "#saveEditedStudent"
            );


        const fullName =
            nameInput
                ? nameInput.value.trim()
                : "";


        const password =
            passwordInput
                ? passwordInput.value.trim()
                : "";


        const subjects =
            subjectsInput
                ? textToSubjects(
                    subjectsInput.value
                )
                : [];


        if (!fullName) {

            showAddMessage(
                message,
                "Please enter the student's full name.",
                "error"
            );

            return;

        }


        if (!password) {

            showAddMessage(
                message,
                "Please enter an access password.",
                "error"
            );

            return;

        }


        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                "Saving...";

        }


        showAddMessage(
            message,
            "Updating student...",
            "loading"
        );


        try {

            const updates = {

                full_name:
                    fullName,

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
                    .update(updates)
                    .eq(
                        "id",
                        student.id
                    )
                    .select()
                    .single();


            if (error) {
                throw error;
            }


            const index =
                students.findIndex(
                    function (item) {

                        return String(item.id) ===
                            String(student.id);

                    }
                );


            if (index !== -1) {

                students[index] =
                    data;

            }


            showStudentsForClass(
                selectedClass
            );


            setStatus(
                "Student updated successfully.",
                "success"
            );


            modal.remove();

        }

        catch (error) {

            console.error(
                "Edit student error:",
                error
            );


            showAddMessage(
                message,
                "Unable to update student: " +
                error.message,
                "error"
            );


            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "Save Changes";

            }

        }

    }


    /* =====================================================
       DELETE STUDENT
    ===================================================== */

    async function deleteStudent(student) {

        if (
            !student ||
            !student.id
        ) {

            alert(
                "This student has no database ID."
            );

            return;

        }


        const confirmed =
            window.confirm(
                "Delete this student?\n\n" +
                getStudentName(student) +
                "\n\nStudent ID: " +
                (
                    student.student_id ||
                    "Not assigned"
                ) +
                "\n\nThis action cannot be undone."
            );


        if (!confirmed) {
            return;
        }


        setStatus(
            "Deleting student...",
            "loading"
        );


        const {
            data,
            error
        } =
            await supabase
                .from("students")
                .delete()
                .eq(
                    "id",
                    student.id
                )
                .select("id");


        if (error) {

            setStatus(
                "Unable to delete student: " +
                error.message,
                "error"
            );

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            setStatus(
                "Student was not deleted. Check Supabase DELETE policy.",
                "error"
            );

            return;

        }


        students =
            students.filter(
                function (item) {

                    return String(
                        item.id
                    ) !== String(
                        student.id
                    );

                }
            );


        showStudentsForClass(
            selectedClass
        );


        setStatus(
            "Student deleted successfully.",
            "success"
        );

    }


    /* =====================================================
       REFRESH
    ===================================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                if (!selectedClass) {
                    return;
                }


                setStatus(
                    "Refreshing students...",
                    "loading"
                );


                try {

                    await loadClasses();

                    await loadStudents();


                    /*
                     * Re-find the selected class
                     * from the latest database data.
                     */

                    const form =
                        getFormNumber(
                            selectedClass
                        );


                    const refreshedClass =
                        classes.find(
                            function (item) {

                                return (
                                    getFormNumber(item) ===
                                    form
                                );

                            }
                        );


                    if (refreshedClass) {

                        selectedClass =
                            refreshedClass;

                    }


                    showStudentsForClass(
                        selectedClass
                    );


                    setStatus(
                        "Students refreshed.",
                        "success"
                    );

                }

                catch (error) {

                    console.error(
                        "Refresh error:",
                        error
                    );


                    setStatus(
                        "Refresh failed: " +
                        error.message,
                        "error"
                    );

                }

            }
        );

    }


    /* =====================================================
       BACK
    ===================================================== */

    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                selectedClass =
                    null;


                if (studentsSection) {

                    studentsSection.hidden =
                        true;

                }


                if (classesSection) {

                    classesSection.hidden =
                        false;

                }


                window.history.replaceState(
                    {},
                    "",
                    "students.html"
                );


                setStatus(
                    "FCA database connected.",
                    "success"
                );

            }
        );

    }


    /* =====================================================
       GENERATE UUID
    ===================================================== */

    function generateUUID() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID ===
            "function"
        ) {

            return window.crypto.randomUUID();

        }


        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
            .replace(
                /[xy]/g,
                function (c) {

                    const r =
                        Math.random() * 16 | 0;


                    const v =
                        c === "x"
                            ? r
                            : (r & 0x3 | 0x8);


                    return v.toString(16);

                }
            );

    }


    /* =====================================================
       GENERATE STUDENT ID
    ===================================================== */

    async function generateStudentId(
        fullName
    ) {

        const parts =
            fullName
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        const surname =
            parts.length > 1
                ? parts[parts.length - 1]
                : parts[0];


        let surnameCode =
            surname
                .replace(
                    /[^a-zA-Z]/g,
                    ""
                )
                .substring(
                    0,
                    2
                )
                .toUpperCase();


        if (
            surnameCode.length === 1
        ) {

            surnameCode += "X";

        }


        if (!surnameCode) {

            surnameCode =
                "XX";

        }


        const year =
            new Date()
                .getFullYear();


        const prefix =
            "FCA-" +
            year +
            "-" +
            surnameCode +
            "-";


        const {
            data,
            error
        } =
            await supabase
                .from("students")
                .select("student_id")
                .like(
                    "student_id",
                    prefix + "%"
                );


        if (error) {
            throw error;
        }


        let highest = 0;


        if (Array.isArray(data)) {

            data.forEach(
                function (student) {

                    const id =
                        student.student_id;


                    if (!id) {
                        return;
                    }


                    const escapedPrefix =
                        prefix.replace(
                            /[.*+?^${}()|[\]\\]/g,
                            "\\$&"
                        );


                    const pattern =
                        new RegExp(
                            "^" +
                            escapedPrefix +
                            "(\\d+)$"
                        );


                    const match =
                        String(id).match(
                            pattern
                        );


                    if (match) {

                        const number =
                            parseInt(
                                match[1],
                                10
                            );


                        if (
                            !isNaN(number) &&
                            number > highest
                        ) {

                            highest =
                                number;

                        }

                    }

                }
            );

        }


        let number =
            highest + 1;


        let studentId =
            createStudentId(
                year,
                surnameCode,
                number
            );


        let attempts = 0;


        while (attempts < 10) {

            const {
                data: existing,
                error: existingError
            } =
                await supabase
                    .from("students")
                    .select("id")
                    .eq(
                        "student_id",
                        studentId
                    )
                    .maybeSingle();


            if (existingError) {
                throw existingError;
            }


            if (!existing) {

                return studentId;

            }


            number++;


            studentId =
                createStudentId(
                    year,
                    surnameCode,
                    number
                );


            attempts++;

        }


        throw new Error(
            "Unable to generate a unique Student ID."
        );

    }


    /* =====================================================
       CREATE STUDENT ID
    ===================================================== */

    function createStudentId(
        year,
        surnameCode,
        number
    ) {

        return (
            "FCA-" +
            year +
            "-" +
            surnameCode +
            "-" +
            String(number)
        );

    }


    /* =====================================================
       GENERATE ACCESS PASSWORD
    ===================================================== */

    function generateAccessPassword() {

        const numbers =
            "0123456789";

        const letters =
            "abcdefghijklmnopqrstuvwxyz";


        function randomCharacter(source) {

            return source[
                Math.floor(
                    Math.random() *
                    source.length
                )
            ];

        }


        let numberPart = "";

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            numberPart +=
                randomCharacter(
                    numbers
                );

        }


        let letterPart = "";

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            letterPart +=
                randomCharacter(
                    letters
                );

        }


        return (
            "fca@" +
            numberPart +
            letterPart
        );

    }


    /* =====================================================
       SUBJECT TEXT HELPERS
    ===================================================== */

    function subjectsToText(subjects) {

        if (
            !Array.isArray(subjects)
        ) {
            return "";
        }


        return subjects
            .map(function (subject) {

                if (
                    typeof subject ===
                    "object" &&
                    subject !== null
                ) {

                    return (
                        subject.name ||
                        subject.subject_name ||
                        subject.title ||
                        ""
                    );

                }


                return String(subject);

            })
            .filter(Boolean)
            .join(", ");

    }


    function textToSubjects(text) {

        if (!text) {
            return [];
        }


        return text
            .split(",")
            .map(function (item) {

                return item.trim();

            })
            .filter(Boolean);

    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function getFormNumber(item) {

        if (!item) {
            return 0;
        }


        const value =
            parseInt(
                item.form_number,
                10
            );


        if (!isNaN(value)) {

            return value;

        }


        const match =
            String(
                item.class_name || ""
            ).match(
                /\d+/
            );


        return match
            ? parseInt(
                match[0],
                10
            )
            : 0;

    }


    function getClassName(item) {

        if (
            item &&
            item.class_name
        ) {

            return String(
                item.class_name
            );

        }


        const form =
            getFormNumber(item);


        return form
            ? "Form " + form
            : "Class";

    }


    function getStudentName(student) {

        return String(
            student &&
            student.full_name
                ? student.full_name
                : "Unknown Student"
        );

    }


    function getInitials(name) {

        const parts =
            String(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!parts.length) {
            return "?";
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


    function renderSubjects(subjects) {

        if (
            !subjects ||
            subjects.length === 0
        ) {

            return `
                <span class="no-subjects">
                    No subjects assigned
                </span>
            `;

        }


        return subjects
            .map(function (subject) {

                let name =
                    subject;


                if (
                    typeof subject ===
                    "object" &&
                    subject !== null
                ) {

                    name =
                        subject.name ||
                        subject.subject_name ||
                        subject.title ||
                        "Subject";

                }


                return `
                    <span class="subject-tag">
                        ${escapeHtml(
                            String(name)
                        )}
                    </span>
                `;

            })
            .join("");

    }


    function updateStudentCount() {

        if (!studentCount) {
            return;
        }


        if (selectedClass) {

            const matched =
                getStudentsForClass(
                    selectedClass
                );


            studentCount.textContent =
                matched.length;

        }

        else {

            studentCount.textContent =
                students.length;

        }

    }


    function showAddMessage(
        element,
        message,
        type
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            message;


        element.className =
            "student-add-message";


        if (type) {

            element.classList.add(
                type
            );

        }

    }


    function setStatus(
        message,
        type
    ) {

        if (!databaseStatus) {
            return;
        }


        databaseStatus.textContent =
            message;


        databaseStatus.className =
            "database-status";


        if (type === "success") {

            databaseStatus.classList.add(
                "connected"
            );

        }


        if (type === "error") {

            databaseStatus.classList.add(
                "error"
            );

        }

    }


    function escapeHtml(value) {

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