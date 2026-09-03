"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   STUDENTS MANAGEMENT
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
        document.getElementById(
            "selectedClassDescription"
        );

    const selectedFormNumber =
        document.getElementById(
            "selectedFormNumber"
        );

    const studentCount =
        document.getElementById("studentCount");

    const backButton =
        document.getElementById("backToClasses");

    const refreshButton =
        document.getElementById(
            "refreshStudentsButton"
        );

    const addStudentButton =
        document.getElementById(
            "addStudentButton"
        );

    const emptyAddStudentButton =
        document.getElementById(
            "emptyAddStudentButton"
        );

    const noStudentsState =
        document.getElementById(
            "noStudentsState"
        );

    const noClassesState =
        document.getElementById(
            "noClassesState"
        );


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
                "✓ FCA database connected.",
                "success"
            );


            /*
             * IMPORTANT:
             *
             * If classes.js sent:
             *
             * students.html?form=1
             *
             * automatically open Form 1.
             */

            const urlParams =
                new URLSearchParams(
                    window.location.search
                );


            const formFromUrl =
                parseInt(
                    urlParams.get("form"),
                    10
                );


            if (
                !isNaN(formFromUrl) &&
                formFromUrl >= 1 &&
                formFromUrl <= 4
            ) {

                console.log(
                    "FCA: URL requested Form",
                    formFromUrl
                );


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


        /*
         * If no database classes exist,
         * show temporary Form 1-4 cards.
         */

        if (classes.length === 0) {

            classes = [
                {
                    id: null,
                    class_name: "Form 1",
                    class_code: "FORM1",
                    form_number: 1
                },
                {
                    id: null,
                    class_name: "Form 2",
                    class_code: "FORM2",
                    form_number: 2
                },
                {
                    id: null,
                    class_name: "Form 3",
                    class_code: "FORM3",
                    form_number: 3
                },
                {
                    id: null,
                    class_name: "Form 4",
                    class_code: "FORM4",
                    form_number: 4
                }
            ];

        }


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


        classesContainer.innerHTML =
            "";


        if (
            noClassesState &&
            classes.length === 0
        ) {

            noClassesState.hidden =
                false;

            return;

        }


        if (noClassesState) {

            noClassesState.hidden =
                true;

        }


        classes.forEach(
            function (classItem) {

                const form =
                    getFormNumber(
                        classItem
                    );


                const name =
                    getClassName(
                        classItem
                    );


                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";


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
                            Click to view students
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


                classesContainer.appendChild(
                    card
                );

            }
        );

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


        /*
         * Find actual class row.
         */

        let classItem =
            classes.find(
                function (item) {

                    return getFormNumber(item) ===
                        formNumber;

                }
            );


        /*
         * If it doesn't exist,
         * create temporary class object.
         */

        if (!classItem) {

            classItem = {

                id: null,

                class_name:
                    "Form " + formNumber,

                class_code:
                    "FORM" + formNumber,

                form_number:
                    formNumber

            };

        }


        openClass(
            classItem
        );

    }


    /* =====================================================
       OPEN CLASS
    ===================================================== */

    function openClass(classItem) {

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
            "FCA: Opening",
            name
        );


        /*
         * Update URL without reloading.
         */

        const newUrl =
            "students.html?form=" +
            encodeURIComponent(form);


        window.history.replaceState(
            {},
            "",
            newUrl
        );


        /*
         * Heading.
         */

        if (selectedClassName) {

            selectedClassName.textContent =
                "FCA " + name.toUpperCase();

        }


        if (selectedClassTitle) {

            selectedClassTitle.textContent =
                name + " Students";

        }


        if (selectedClassDescription) {

            selectedClassDescription.textContent =
                "Students registered in " +
                name +
                ".";

        }


        if (selectedFormNumber) {

            selectedFormNumber.textContent =
                form || "—";

        }


        /*
         * Hide classes.
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


        /*
         * Show Add Student button.
         */

        if (addStudentButton) {

            addStudentButton.hidden =
                false;

        }


        showStudentsForClass(
            classItem
        );

    }


    /* =====================================================
       SHOW STUDENTS
    ===================================================== */

    function showStudentsForClass(
        classItem
    ) {

        const formNumber =
            getFormNumber(
                classItem
            );


        const classId =
            classItem.id;


        const matched =
            students.filter(
                function (student) {

                    /*
                     * First preference:
                     * exact class_id.
                     */

                    if (
                        classId &&
                        student.class_id
                    ) {

                        return String(
                            student.class_id
                        ) === String(
                            classId
                        );

                    }


                    /*
                     * Fallback:
                     * form_number.
                     */

                    return Number(
                        student.form_number
                    ) === Number(
                        formNumber
                    );

                }
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


        studentsContainer.innerHTML =
            "";


        if (
            !list ||
            list.length === 0
        ) {

            studentsContainer.hidden =
                true;


            if (noStudentsState) {

                noStudentsState.hidden =
                    false;

            }


            return;

        }


        studentsContainer.hidden =
            false;


        if (noStudentsState) {

            noStudentsState.hidden =
                true;

        }


        list.forEach(
            function (student) {

                createStudentCard(
                    student
                );

            }
        );

    }


    /* =====================================================
       STUDENT CARD
    ===================================================== */

    function createStudentCard(student) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "student-card";


        const name =
            getStudentName(
                student
            );


        const id =
            student.student_id ||
            "Not assigned";


        const password =
            student.access_password ||
            "Not assigned";


        const subjects =
            Array.isArray(
                student.subjects
            )
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
                            String(id)
                        )}
                    </span>

                </div>

            </div>


            <div class="student-details">

                <div class="student-detail">

                    <small>
                        STUDENT ID
                    </small>

                    <strong>
                        ${escapeHtml(
                            String(id)
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
       ADD STUDENT
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

                        <label>
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
       SAVE STUDENT
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

            saveButton.disabled =
                true;

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


            updateStudentCount();


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
                "✓ Student added successfully.",
                "success"
            );


            /*
             * Add close button.
             */

            const close =
                document.createElement(
                    "button"
                );


            close.type =
                "button";


            close.className =
                "secondary-button";


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
                .appendChild(
                    close
                );

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


        let highest =
            0;


        students.forEach(
            function (student) {

                const id =
                    student.student_id;


                if (!id) {
                    return;
                }


                const match =
                    String(id).match(
                        /^FCA-\d{4}-[A-Z]{2}-(\d+)$/
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


        let number =
            highest + 1;


        let studentId =
            createStudentId(
                year,
                surnameCode,
                number
            );


        /*
         * Make sure ID doesn't already exist.
         */

        const {
            data,
            error
        } =
            await supabase
                .from("students")
                .select("id")
                .eq(
                    "student_id",
                    studentId
                )
                .maybeSingle();


        if (error) {

            throw error;

        }


        if (data) {

            number++;


            studentId =
                createStudentId(
                    year,
                    surnameCode,
                    number
                );

        }


        return studentId;

    }


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
            String(number).padStart(
                3,
                "0"
            )
        );

    }


    /* =====================================================
       PASSWORD
    ===================================================== */

    function generateAccessPassword() {

        const lower =
            "abcdefghijkmnopqrstuvwxyz";


        const upper =
            "ABCDEFGHJKLMNPQRSTUVWXYZ";


        const numbers =
            "23456789";


        function random(source) {

            return source[
                Math.floor(
                    Math.random() *
                    source.length
                )
            ];

        }


        let value = "";


        value += random(lower);

        value += random(upper);

        value += random(lower);

        value += random(numbers);

        value += random(lower);

        value += random(numbers);

        value += random(upper);

        value += random(lower);


        value =
            value
                .split("")
                .sort(
                    function () {

                        return Math.random() -
                            0.5;

                    }
                )
                .join("");


        return "fca@" + value;

    }


    /* =====================================================
       EDIT
    ===================================================== */

    function editStudent(student) {

        alert(
            "Edit Student\n\n" +
            getStudentName(student) +
            "\n" +
            student.student_id
        );

    }


    /* =====================================================
       DELETE
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


        updateStudentCount();


        if (selectedClass) {

            showStudentsForClass(
                selectedClass
            );

        }


        setStatus(
            "✓ Student deleted successfully.",
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

                    await loadStudents();


                    showStudentsForClass(
                        selectedClass
                    );


                    setStatus(
                        "✓ Students refreshed.",
                        "success"
                    );

                }

                catch (error) {

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


                /*
                 * Remove ?form=1 from URL.
                 */

                window.history.replaceState(
                    {},
                    "",
                    "students.html"
                );

            }
        );

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
            getFormNumber(
                item
            );


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
            .map(
                function (subject) {

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

                }
            )
            .join("");

    }


    function updateStudentCount() {

        if (studentCount) {

            if (selectedClass) {

                const form =
                    getFormNumber(
                        selectedClass
                    );


                const count =
                    students.filter(
                        function (student) {

                            return Number(
                                student.form_number
                            ) === Number(
                                form
                            );

                        }
                    ).length;


                studentCount.textContent =
                    count;

            }

            else {

                studentCount.textContent =
                    students.length;

            }

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


        if (type === "loading") {

            databaseStatus.classList.add(
                "loading"
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