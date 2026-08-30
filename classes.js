/* ============================================================
   FCA CLASSES MANAGEMENT
   SUPABASE VERSION

   Requires:
   config.js

   config.js must create:

   window.fcaSupabase

============================================================ */


/* ============================================================
   FCA ADMIN
============================================================ */

const FCA_ADMIN_EMAIL =
    "fca.admin@gmail.com";


/* ============================================================
   SUPABASE CLIENT
============================================================ */

function getSupabaseClient(){

    if(!window.fcaSupabase){

        throw new Error(
            "FCA Supabase client is not available. Check config.js."
        );

    }

    return window.fcaSupabase;

}


/* ============================================================
   URL / FORM
============================================================ */

const params =
    new URLSearchParams(
        window.location.search
    );


const formNumber =
    params.get("form");


const validForms = [
    "1",
    "2",
    "3",
    "4"
];


if(
    formNumber &&
    !validForms.includes(formNumber)
){

    window.location.replace(
        "classes.html"
    );

}


/* ============================================================
   SUBJECTS
============================================================ */

const allSubjects = [

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


/* ============================================================
   STATE
============================================================ */

let students = [];

let results = [];

let teachers = [];

let selectedResultStudentId = null;

let editingStudentId = null;

let editingResultId = null;

let authorizedTeacher = null;


/* ============================================================
   ELEMENTS
============================================================ */

const selectedSection =
    document.getElementById(
        "selectedForm"
    );


const selectedFormTitle =
    document.getElementById(
        "selectedFormTitle"
    );


const studentsTitle =
    document.getElementById(
        "studentsTitle"
    );


const resultsTitle =
    document.getElementById(
        "resultsTitle"
    );


const studentsArea =
    document.getElementById(
        "studentsArea"
    );


const resultsArea =
    document.getElementById(
        "resultsArea"
    );


const studentsButton =
    document.getElementById(
        "studentsButton"
    );


const resultsButton =
    document.getElementById(
        "resultsButton"
    );


const addStudentButton =
    document.getElementById(
        "addStudentButton"
    );


const studentForm =
    document.getElementById(
        "studentForm"
    );


const studentFormTitle =
    document.getElementById(
        "studentFormTitle"
    );


const cancelStudent =
    document.getElementById(
        "cancelStudent"
    );


const studentList =
    document.getElementById(
        "studentList"
    );


const studentFirstName =
    document.getElementById(
        "studentFirstName"
    );


const studentLastName =
    document.getElementById(
        "studentLastName"
    );


const studentGender =
    document.getElementById(
        "studentGender"
    );


const studentClass =
    document.getElementById(
        "studentClass"
    );


const studentSubjectGrid =
    document.getElementById(
        "studentSubjectGrid"
    );


const resultsStudentList =
    document.getElementById(
        "resultsStudentList"
    );


const selectedStudentResults =
    document.getElementById(
        "selectedStudentResults"
    );


const selectedStudentName =
    document.getElementById(
        "selectedStudentName"
    );


const selectedStudentNumber =
    document.getElementById(
        "selectedStudentNumber"
    );


const addResultsButton =
    document.getElementById(
        "addResultsButton"
    );


const resultsForm =
    document.getElementById(
        "resultsForm"
    );


const resultFormTitle =
    document.getElementById(
        "resultFormTitle"
    );


const resultSubject =
    document.getElementById(
        "resultSubject"
    );


const resultMark =
    document.getElementById(
        "resultMark"
    );


const remarkMode =
    document.getElementById(
        "remarkMode"
    );


const resultRemark =
    document.getElementById(
        "resultRemark"
    );


const cancelResults =
    document.getElementById(
        "cancelResults"
    );


const resultsList =
    document.getElementById(
        "resultsList"
    );


/* ============================================================
   SAFE TEXT
============================================================ */

function safeText(value){

    return String(
        value ?? ""
    ).trim();

}


/* ============================================================
   HTML ESCAPE
============================================================ */

function escapeHtml(value){

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


/* ============================================================
   FORM HEADER
============================================================ */

function initializeFormHeader(){

    if(!formNumber){

        return;

    }


    const formName =
        `Form ${formNumber}`;


    if(selectedFormTitle){

        selectedFormTitle.textContent =
            formName;

    }


    if(studentsTitle){

        studentsTitle.textContent =
            `${formName} Students`;

    }


    if(resultsTitle){

        resultsTitle.textContent =
            `${formName} Results`;

    }


    if(selectedSection){

        selectedSection.classList.add(
            "visible"
        );

    }

}


/* ============================================================
   GET CURRENT USER
============================================================ */

async function getCurrentUser(){

    const supabase =
        getSupabaseClient();


    const {
        data,
        error
    } =
        await supabase.auth.getSession();


    if(error){

        throw new Error(
            error.message
        );

    }


    if(
        !data ||
        !data.session ||
        !data.session.user
    ){

        return null;

    }


    return data.session.user;

}


/* ============================================================
   CHECK ADMIN AUTHORIZATION
============================================================ */

async function checkAdminAuthorization(){

    try{

        const user =
            await getCurrentUser();


        if(!user){

            window.location.replace(
                "admin-login.html"
            );

            return false;

        }


        const email =
            safeText(
                user.email
            )
            .toLowerCase();


        if(
            email !==
            FCA_ADMIN_EMAIL.toLowerCase()
        ){

            console.warn(
                "Unauthorized FCA administrator:",
                email
            );


            await getSupabaseClient()
                .auth
                .signOut();


            window.location.replace(
                "admin-login.html"
            );

            return false;

        }


        return true;

    }

    catch(error){

        console.error(
            "FCA admin authorization error:",
            error
        );


        alert(
            "Unable to verify administrator session.\n\n" +
            error.message
        );


        window.location.replace(
            "admin-login.html"
        );


        return false;

    }

}


/* ============================================================
   AUTH STATE LISTENER
============================================================ */

function initializeAuthListener(){

    const supabase =
        getSupabaseClient();


    supabase.auth.onAuthStateChange(
        function(event, session){

            console.log(
                "FCA Classes Auth Event:",
                event
            );


            if(
                event === "SIGNED_OUT"
            ){

                window.location.replace(
                    "admin-login.html"
                );

                return;

            }


            if(
                event === "TOKEN_REFRESHED" &&
                !session
            ){

                window.location.replace(
                    "admin-login.html"
                );

            }

        }
    );

}


/* ============================================================
   LOAD TEACHERS
============================================================ */

async function loadTeachers(){

    const supabase =
        getSupabaseClient();


    const {
        data,
        error
    } =
        await supabase
            .from("teachers")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:false
                }
            );


    if(error){

        throw new Error(
            `Teachers: ${error.message}`
        );

    }


    teachers =
        Array.isArray(data)
            ? data
            : [];


    console.log(
        "FCA teachers loaded:",
        teachers.length
    );

}


/* ============================================================
   LOAD STUDENTS
============================================================ */

async function loadStudents(){

    const supabase =
        getSupabaseClient();


    let query =
        supabase
            .from("students")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:false
                }
            );


    if(formNumber){

        query =
            query.eq(
                "form",
                Number(formNumber)
            );

    }


    const {
        data,
        error
    } =
        await query;


    if(error){

        throw new Error(
            `Students: ${error.message}`
        );

    }


    students =
        Array.isArray(data)
            ? data
            : [];


    console.log(
        "FCA students loaded:",
        students.length
    );

}


/* ============================================================
   LOAD RESULTS
============================================================ */

async function loadResults(){

    const supabase =
        getSupabaseClient();


    const {
        data,
        error
    } =
        await supabase
            .from("results")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:false
                }
            );


    if(error){

        throw new Error(
            `Results: ${error.message}`
        );

    }


    results =
        Array.isArray(data)
            ? data
            : [];


    console.log(
        "FCA results loaded:",
        results.length
    );

}


/* ============================================================
   LOAD ALL DATA
============================================================ */

async function loadAllData(){

    try{

        if(!formNumber){

            return;

        }


        await Promise.all([

            loadTeachers(),

            loadStudents(),

            loadResults()

        ]);


        displayStudents();

        displayResultsStudents();


        console.log(
            "FCA Classes data loaded successfully."
        );

    }

    catch(error){

        console.error(
            "FCA Classes database error:",
            error
        );


        showDatabaseError(
            error.message
        );

    }

}


/* ============================================================
   DATABASE ERROR
============================================================ */

function showDatabaseError(message){

    const html = `

        <div class="empty-state">

            <div class="empty-icon">
                !
            </div>

            <strong>
                FCA database error
            </strong>

            <p>
                ${escapeHtml(message)}
            </p>

            <button
                type="button"
                class="primary-button"
                onclick="loadAllData()"
            >
                Retry
            </button>

        </div>

    `;


    if(studentList){

        studentList.innerHTML =
            html;

    }


    if(resultsStudentList){

        resultsStudentList.innerHTML =
            html;

    }

}


/* ============================================================
   TEACHER NAME
============================================================ */

function getTeacherName(teacher){

    if(!teacher){

        return "Teacher";

    }


    const fullName =
        safeText(
            teacher.full_name
        );


    if(fullName){

        return fullName;

    }


    const combined =
        `${safeText(teacher.first_name)} ${safeText(teacher.last_name)}`
            .trim();


    if(combined){

        return combined;

    }


    if(
        safeText(teacher.name)
    ){

        return safeText(
            teacher.name
        );

    }


    return "Teacher";

}


/* ============================================================
   HASH PASSWORD
============================================================ */

async function hashPassword(password){

    const encoder =
        new TextEncoder();


    const data =
        encoder.encode(
            String(password)
        );


    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );


    return Array.from(
        new Uint8Array(
            hashBuffer
        )
    )
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(
                        2,
                        "0"
                    )
        )
        .join("");

}


/* ============================================================
   VERIFY TEACHER PASSWORD
============================================================ */

async function verifyTeacherPassword(
    password,
    teacher
){

    if(
        password === null ||
        password === undefined ||
        !teacher
    ){

        return false;

    }


    const enteredPassword =
        String(password);


    /*
       Preferred:
       password_hash
    */

    if(
        teacher.password_hash
    ){

        const hash =
            await hashPassword(
                enteredPassword
            );


        return (
            hash ===
            String(
                teacher.password_hash
            )
        );

    }


    /*
       Legacy support
    */

    const oldPassword =
        teacher.password ||
        teacher.teacherPassword ||
        teacher.pass ||
        "";


    return (
        enteredPassword ===
        String(oldPassword)
    );

}


/* ============================================================
   NORMALIZE TEACHER CLASSES
============================================================ */

function normalizeClasses(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return [];

    }


    if(Array.isArray(value)){

        return value
            .flatMap(
                item => {

                    if(
                        typeof item ===
                        "string"
                    ){

                        return [item];

                    }


                    if(
                        item &&
                        typeof item ===
                        "object"
                    ){

                        return [

                            item.name,

                            item.class_name,

                            item.class,

                            item.form

                        ]
                            .filter(
                                Boolean
                            );

                    }


                    return [];

                }
            )
            .map(
                item =>
                    safeText(item)
            )
            .filter(Boolean);

    }


    if(
        typeof value ===
        "object"
    ){

        return [

            value.name,

            value.class_name,

            value.class,

            value.form

        ]
            .filter(Boolean)
            .map(
                item =>
                    safeText(item)
            );

    }


    if(
        typeof value ===
        "string"
    ){

        const text =
            value.trim();


        /*
           Try JSON
        */

        try{

            const parsed =
                JSON.parse(
                    text
                );


            if(
                Array.isArray(parsed) ||
                typeof parsed === "object"
            ){

                return normalizeClasses(
                    parsed
                );

            }

        }

        catch(error){

            /*
               Not JSON.
               Continue as comma-separated.
            */

        }


        return text
            .split(",")
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean);

    }


    return [];

}


/* ============================================================
   NORMALIZE FORM VALUE
============================================================ */

function normalizeFormValue(value){

    const text =
        safeText(value)
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            );


    if(
        text === "1" ||
        text === "form 1" ||
        text === "form1"
    ){

        return "1";

    }


    if(
        text === "2" ||
        text === "form 2" ||
        text === "form2"
    ){

        return "2";

    }


    if(
        text === "3" ||
        text === "form 3" ||
        text === "form3"
    ){

        return "3";

    }


    if(
        text === "4" ||
        text === "form 4" ||
        text === "form4"
    ){

        return "4";

    }


    return text;

}


/* ============================================================
   CHECK TEACHER CLASS
============================================================ */

function teacherHasForm(
    teacher,
    selectedForm
){

    if(!teacher){

        return false;

    }


    const target =
        normalizeFormValue(
            selectedForm
        );


    /*
       Normal classes field
    */

    const classes =
        normalizeClasses(
            teacher.classes
        );


    if(
        classes.some(
            className =>
                normalizeFormValue(
                    className
                ) === target
        )
    ){

        return true;

    }


    /*
       Support additional possible
       teacher assignment fields.
    */

    const possibleFields = [

        teacher.class,

        teacher.class_name,

        teacher.form,

        teacher.assigned_class,

        teacher.assigned_classes,

        teacher.forms

    ];


    for(
        const value of
        possibleFields
    ){

        const normalized =
            normalizeClasses(
                value
            );


        if(
            normalized.some(
                item =>
                    normalizeFormValue(
                        item
                    ) === target
            )
        ){

            return true;

        }


        if(
            normalizeFormValue(
                value
            ) === target
        ){

            return true;

        }

    }


    return false;

}


/* ============================================================
   TEACHER AUTHORIZATION
============================================================ */

async function requestTeacherAuthorization(
    action
){

    if(!formNumber){

        alert(
            "Please select a class first."
        );

        return null;

    }


    if(
        !Array.isArray(teachers) ||
        teachers.length === 0
    ){

        alert(
            "No teachers were found in the FCA database."
        );

        return null;

    }


    const classTeachers =
        teachers.filter(
            teacher =>
                teacherHasForm(
                    teacher,
                    formNumber
                )
        );


    if(
        classTeachers.length === 0
    ){

        alert(
            `No teacher is assigned to Form ${formNumber}.`
        );

        return null;

    }


    const names =
        classTeachers
            .map(
                teacher =>
                    getTeacherName(
                        teacher
                    )
            )
            .join(", ");


    const teacherName =
        prompt(

            `Teacher authorization required to ${action}.\n\n` +

            `Assigned teacher(s):\n` +

            `${names}\n\n` +

            `Enter teacher name:`

        );


    if(
        teacherName === null ||
        !safeText(teacherName)
    ){

        return null;

    }


    const teacher =
        classTeachers.find(
            item =>

                getTeacherName(
                    item
                )
                    .trim()
                    .toLowerCase() ===

                safeText(
                    teacherName
                )
                    .toLowerCase()
        );


    if(!teacher){

        alert(
            "Teacher not found or not assigned to this class."
        );

        return null;

    }


    const password =
        prompt(
            `Enter the password for ${getTeacherName(teacher)}:`
        );


    if(password === null){

        return null;

    }


    const valid =
        await verifyTeacherPassword(
            password,
            teacher
        );


    if(!valid){

        alert(
            "Incorrect teacher password."
        );

        return null;

    }


    authorizedTeacher =
        teacher;


    return teacher;

}


/* ============================================================
   SUBJECT CHECKBOXES
============================================================ */

function loadSubjectCheckboxes(){

    if(!studentSubjectGrid){

        return;

    }


    studentSubjectGrid.innerHTML =
        "";


    allSubjects.forEach(
        (subject,index) => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "subject-option";


            const id =
                `subject_${index}`;


            wrapper.innerHTML = `

                <input
                    type="checkbox"
                    id="${id}"
                    value="${escapeHtml(subject)}"
                >

                <label for="${id}">
                    ${escapeHtml(subject)}
                </label>

            `;


            studentSubjectGrid.appendChild(
                wrapper
            );

        }
    );

}


/* ============================================================
   GET SELECTED SUBJECTS
============================================================ */

function getSelectedSubjects(){

    if(!studentSubjectGrid){

        return [];

    }


    return Array.from(
        studentSubjectGrid.querySelectorAll(
            "input[type='checkbox']:checked"
        )
    )
        .map(
            checkbox =>
                checkbox.value
        )
        .filter(Boolean);

}


/* ============================================================
   SET SELECTED SUBJECTS
============================================================ */

function setSelectedSubjects(
    subjects
){

    if(!studentSubjectGrid){

        return;

    }


    const selected =
        Array.isArray(subjects)
            ? subjects
            : [];


    studentSubjectGrid
        .querySelectorAll(
            "input[type='checkbox']"
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    selected.includes(
                        checkbox.value
                    );

            }
        );

}


/* ============================================================
   GENERATE STUDENT NUMBER
============================================================ */

function generateStudentNumber(
    lastName
){

    const year =
        new Date()
            .getFullYear();


    const cleanLastName =
        String(
            lastName || ""
        )
            .replace(
                /[^a-zA-Z]/g,
                ""
            );


    const letters =
        cleanLastName
            .substring(
                0,
                2
            )
            .toUpperCase()
            .padEnd(
                2,
                "X"
            );


    let number = 1;


    while(number <= 9999){

        const studentNumber =
            `FCA-${year}-${letters}-${String(number).padStart(3,"0")}`;


        const exists =
            students.some(
                student =>

                    safeText(
                        student.student_number ||
                        student.studentNumber
                    )
                    .toUpperCase() ===

                    studentNumber.toUpperCase()
            );


        if(!exists){

            return studentNumber;

        }


        number++;

    }


    throw new Error(
        "Unable to generate a unique student number."
    );

}


/* ============================================================
   GENERATE RESULTS PASSWORD
============================================================ */

function generateResultsPassword(){

    let number = 1;


    while(number <= 999999){

        const password =
            `fca@hfh${String(number).padStart(3,"0")}`;


        const exists =
            students.some(
                student =>

                    safeText(
                        student.results_password ||
                        student.resultsPassword
                    ) === password
            );


        if(!exists){

            return password;

        }


        number++;

    }


    throw new Error(
        "Unable to generate a unique results password."
    );

}


/* ============================================================
   STUDENT FIELD HELPERS
============================================================ */

function getStudentNumber(student){

    if(!student){

        return "No student number";

    }


    return (

        student.student_number ||

        student.studentNumber ||

        "No student number"

    );

}


/* ============================================================
   STUDENT PASSWORD
============================================================ */

function getStudentPassword(student){

    if(!student){

        return "Not available";

    }


    return (

        student.results_password ||

        student.resultsPassword ||

        "Not available"

    );

}


/* ============================================================
   FIRST NAME
============================================================ */

function getStudentFirstName(student){

    if(!student){

        return "";

    }


    return (

        student.first_name ||

        student.firstName ||

        ""

    );

}


/* ============================================================
   LAST NAME
============================================================ */

function getStudentLastName(student){

    if(!student){

        return "";

    }


    return (

        student.last_name ||

        student.lastName ||

        ""

    );

}


/* ============================================================
   STUDENT SUBJECTS
============================================================ */

function getStudentSubjects(student){

    if(!student){

        return [];

    }


    const value =
        student.subjects;


    if(Array.isArray(value)){

        return value
            .map(
                item =>
                    safeText(item)
            )
            .filter(Boolean);

    }


    if(
        typeof value ===
        "string"
    ){

        const text =
            value.trim();


        if(!text){

            return [];

        }


        /*
           JSON array
        */

        try{

            const parsed =
                JSON.parse(
                    text
                );


            if(
                Array.isArray(parsed)
            ){

                return parsed
                    .map(
                        item =>
                            safeText(item)
                    )
                    .filter(Boolean);

            }

        }

        catch(error){

            /*
               Continue as comma-separated text.
            */

        }


        return text
            .split(",")
            .map(
                item =>
                    item.trim()
            )
            .filter(Boolean);

    }


    return [];

}


/* ============================================================
   GET FORM STUDENTS
============================================================ */

function getFormStudents(){

    if(!formNumber){

        return [];

    }


    return students.filter(
        student =>

            normalizeFormValue(
                student.form
            ) ===

            normalizeFormValue(
                formNumber
            )
    );

}


/* ============================================================
   DISPLAY STUDENTS
============================================================ */

function displayStudents(){

    if(!studentList){

        return;

    }


    const formStudents =
        getFormStudents();


    if(
        formStudents.length ===
        0
    ){

        studentList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    S
                </div>

                <strong>
                    No students added yet
                </strong>

                <p>
                    Students belonging to Form
                    ${escapeHtml(formNumber)}
                    will appear here.
                </p>

            </div>

        `;

        return;

    }


    studentList.innerHTML =
        formStudents
            .map(
                student => {

                    const firstName =
                        getStudentFirstName(
                            student
                        );


                    const lastName =
                        getStudentLastName(
                            student
                        );


                    const subjects =
                        getStudentSubjects(
                            student
                        );


                    const fullName =
                        `${firstName} ${lastName}`
                            .trim();


                    const avatar =
                        firstName
                            .charAt(0)
                            .toUpperCase() ||
                        "S";


                    return `

                        <div class="student-row">

                            <div class="student-avatar">

                                ${escapeHtml(
                                    avatar
                                )}

                            </div>


                            <div class="student-details">

                                <strong>
                                    ${escapeHtml(
                                        fullName ||
                                        "Unnamed Student"
                                    )}
                                </strong>

                                <span>
                                    Student No:
                                    ${escapeHtml(
                                        getStudentNumber(
                                            student
                                        )
                                    )}
                                </span>

                                <span>
                                    Results Password:
                                    ${escapeHtml(
                                        getStudentPassword(
                                            student
                                        )
                                    )}
                                </span>

                            </div>


                            <div class="student-subjects">

                                <strong>
                                    Subjects
                                </strong>

                                <br>

                                ${
                                    subjects.length

                                        ? subjects
                                            .map(
                                                subject =>
                                                    escapeHtml(
                                                        subject
                                                    )
                                            )
                                            .join(", ")

                                        : "No subjects selected"
                                }

                            </div>


                            <span class="student-class">

                                Form
                                ${escapeHtml(
                                    String(
                                        formNumber
                                    )
                                )}

                            </span>


                            <div class="student-actions">

                                <button
                                    type="button"
                                    class="edit-button"
                                    onclick="editStudent('${escapeHtml(student.id)}')"
                                >
                                    Edit
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* ============================================================
   ADD STUDENT BUTTON
============================================================ */

if(addStudentButton){

    addStudentButton.addEventListener(
        "click",
        async function(){

            /*
               Authorize teacher once when starting
               the Add Student operation.
            */

            const teacher =
                await requestTeacherAuthorization(
                    "add a student"
                );


            if(!teacher){

                return;

            }


            /*
               Store authorized teacher so the
               submit handler does NOT ask again.
            */

            authorizedTeacher =
                teacher;


            editingStudentId =
                null;


            if(studentFormTitle){

                studentFormTitle.textContent =
                    "Add Student";

            }


            if(studentForm){

                studentForm.reset();

            }


            /*
               Keep the current Form selected.
            */

            if(studentClass){

                studentClass.value =
                    formNumber;

            }


            /*
               Clear subjects.
            */

            setSelectedSubjects([]);


            /*
               Show form.
            */

            if(studentForm){

                studentForm.classList.add(
                    "show"
                );


                studentForm.scrollIntoView({

                    behavior:"smooth",

                    block:"center"

                });

            }

        }
    );

}


/* ============================================================
   CANCEL STUDENT
============================================================ */

if(cancelStudent){

    cancelStudent.addEventListener(
        "click",
        function(){

            if(studentForm){

                studentForm.reset();

                studentForm.classList.remove(
                    "show"
                );

            }


            editingStudentId =
                null;


            authorizedTeacher =
                null;


            if(studentFormTitle){

                studentFormTitle.textContent =
                    "Add Student";

            }


            setSelectedSubjects([]);

        }
    );

}


/* ============================================================
   SAVE STUDENT
============================================================ */

if(studentForm){

    studentForm.addEventListener(
        "submit",
        async function(event){

            event.preventDefault();


            const firstName =
                safeText(
                    studentFirstName?.value
                );


            const lastName =
                safeText(
                    studentLastName?.value
                );


            const gender =
                safeText(
                    studentGender?.value
                );


            const selectedClass =
                safeText(
                    studentClass?.value
                );


            const subjects =
                getSelectedSubjects();


            if(
                !firstName ||
                !lastName ||
                !gender ||
                !selectedClass
            ){

                alert(
                    "Please complete all student details."
                );

                return;

            }


            if(
                String(selectedClass) !==
                String(formNumber)
            ){

                alert(
                    `This page is for Form ${formNumber}.`
                );

                return;

            }


            if(
                subjects.length ===
                0
            ){

                alert(
                    "Please select at least one subject."
                );

                return;

            }


            try{

                const supabase =
                    getSupabaseClient();


                /* ========================================
                   EDIT STUDENT
                ======================================== */

                if(editingStudentId){

                    /*
                       Authorization is requested again
                       immediately before the database update.
                    */

                    const teacher =
                        await requestTeacherAuthorization(
                            "edit this student"
                        );


                    if(!teacher){

                        return;

                    }


                    const updateData = {

                        first_name:
                            firstName,

                        last_name:
                            lastName,

                        gender:
                            gender,

                        form:
                            Number(
                                selectedClass
                            ),

                        subjects:
                            subjects,

                        updated_at:
                            new Date()
                                .toISOString()

                    };


                    const {
                        error
                    } =
                        await supabase
                            .from("students")
                            .update(
                                updateData
                            )
                            .eq(
                                "id",
                                editingStudentId
                            );


                    if(error){

                        throw new Error(
                            error.message
                        );

                    }


                    alert(
                        "Student updated successfully."
                    );

                }


                /* ========================================
                   ADD STUDENT
                ======================================== */

                else{

                    const teacher =
                        authorizedTeacher ||
                        await requestTeacherAuthorization(
                            "add a student"
                        );


                    if(!teacher){

                        return;

                    }


                    const studentNumber =
                        generateStudentNumber(
                            lastName
                        );


                    const resultsPassword =
                        generateResultsPassword();


                    const insertData = {

                        student_number:
                            studentNumber,

                        first_name:
                            firstName,

                        last_name:
                            lastName,

                        gender:
                            gender,

                        form:
                            Number(
                                selectedClass
                            ),

                        subjects:
                            subjects,

                        results_password:
                            resultsPassword

                    };


                    console.log(
                        "FCA inserting student:",
                        insertData
                    );


                    const {
                        data,
                        error
                    } =
                        await supabase
                            .from("students")
                            .insert(
                                insertData
                            )
                            .select()
                            .single();


                    if(error){

                        throw new Error(
                            error.message
                        );

                    }


                    console.log(
                        "FCA student created:",
                        data
                    );


                    alert(

                        `Student saved successfully!\n\n` +

                        `Student Number:\n` +

                        `${studentNumber}\n\n` +

                        `Results Password:\n` +

                        `${resultsPassword}\n\n` +

                        `Give these login details to the student or parent.`

                    );

                }


                /*
                   Reset form
                */

                studentForm.reset();

                studentForm.classList.remove(
                    "show"
                );


                editingStudentId =
                    null;


                authorizedTeacher =
                    null;


                studentFormTitle.textContent =
                    "Add Student";


                setSelectedSubjects([]);


                /*
                   Reload data
                */

                await loadStudents();


                await loadResults();


                displayStudents();

                displayResultsStudents();

            }

            catch(error){

                console.error(
                    "FCA student save error:",
                    error
                );


                alert(

                    `Unable to save student.\n\n` +

                    `${error.message}`

                );

            }

        }
    );

}


/* ============================================================
   EDIT STUDENT
============================================================ */

async function editStudent(
    studentId
){

    const teacher =
        await requestTeacherAuthorization(
            "edit this student"
        );


    if(!teacher){

        return;

    }


    const student =
        students.find(
            item =>

                String(item.id) ===
                String(studentId)
        );


    if(!student){

        alert(
            "Student not found."
        );

        return;

    }


    editingStudentId =
        student.id;


    if(studentFormTitle){

        studentFormTitle.textContent =
            "Edit Student";

    }


    if(studentFirstName){

        studentFirstName.value =
            getStudentFirstName(
                student
            );

    }


    if(studentLastName){

        studentLastName.value =
            getStudentLastName(
                student
            );

    }


    if(studentGender){

        studentGender.value =
            student.gender ||
            "";

    }


    if(studentClass){

        studentClass.value =
            String(
                student.form ||
                formNumber
            );

    }


    setSelectedSubjects(
        getStudentSubjects(
            student
        )
    );


    if(studentForm){

        studentForm.classList.add(
            "show"
        );


        studentForm.scrollIntoView({

            behavior:"smooth",

            block:"center"

        });

    }

}


/* ============================================================
   RESULTS BUTTON
============================================================ */

if(resultsButton){

    resultsButton.addEventListener(
        "click",
        function(){

            if(studentsArea){

                studentsArea.classList.remove(
                    "show-area"
                );

            }


            if(resultsArea){

                resultsArea.classList.add(
                    "show-area"
                );

            }


            if(selectedStudentResults){

                selectedStudentResults.classList.remove(
                    "show"
                );

            }


            selectedResultStudentId =
                null;


            displayResultsStudents();

        }
    );

}


/* ============================================================
   STUDENTS BUTTON
============================================================ */

if(studentsButton){

    studentsButton.addEventListener(
        "click",
        function(){

            if(resultsArea){

                resultsArea.classList.remove(
                    "show-area"
                );

            }


            if(studentsArea){

                studentsArea.classList.add(
                    "show-area"
                );

            }


            displayStudents();

        }
    );

}


/* ============================================================
   DISPLAY RESULT STUDENTS
============================================================ */

function displayResultsStudents(){

    if(!resultsStudentList){

        return;

    }


    const formStudents =
        getFormStudents();


    if(
        formStudents.length ===
        0
    ){

        resultsStudentList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    R
                </div>

                <strong>
                    No students in this class
                </strong>

                <p>
                    Add students to Form
                    ${escapeHtml(formNumber)}
                    before entering results.
                </p>

            </div>

        `;

        return;

    }


    resultsStudentList.innerHTML =
        formStudents
            .map(
                student => {

                    const studentResults =
                        results.filter(
                            result =>

                                String(
                                    result.student_id
                                ) ===

                                String(
                                    student.id
                                )
                        );


                    const firstName =
                        getStudentFirstName(
                            student
                        );


                    const lastName =
                        getStudentLastName(
                            student
                        );


                    const avatar =
                        firstName
                            .charAt(0)
                            .toUpperCase() ||
                        "S";


                    return `

                        <button
                            type="button"
                            class="results-student-row ${
                                String(
                                    selectedResultStudentId
                                ) ===
                                String(student.id)
                                    ? "selected"
                                    : ""
                            }"
                            onclick="selectResultStudent('${escapeHtml(student.id)}')"
                        >

                            <div class="student-avatar">

                                ${escapeHtml(
                                    avatar
                                )}

                            </div>


                            <div class="results-student-info">

                                <strong>

                                    ${escapeHtml(
                                        firstName
                                    )}

                                    ${escapeHtml(
                                        lastName
                                    )}

                                </strong>

                                <span>

                                    ${escapeHtml(
                                        getStudentNumber(
                                            student
                                        )
                                    )}

                                </span>

                            </div>


                            <span class="results-count">

                                ${studentResults.length}

                                result${
                                    studentResults.length === 1
                                        ? ""
                                        : "s"
                                }

                            </span>


                            <b>
                                →
                            </b>

                        </button>

                    `;

                }
            )
            .join("");

}


/* ============================================================
   SELECT RESULT STUDENT
============================================================ */

function selectResultStudent(
    studentId
){

    selectedResultStudentId =
        studentId;


    const student =
        students.find(
            item =>

                String(item.id) ===
                String(studentId)
        );


    if(!student){

        alert(
            "Student not found."
        );

        return;

    }


    if(selectedStudentResults){

        selectedStudentResults.classList.add(
            "show"
        );

    }


    if(selectedStudentName){

        selectedStudentName.textContent =
            `${getStudentFirstName(student)} ${getStudentLastName(student)}`;

    }


    if(selectedStudentNumber){

        selectedStudentNumber.textContent =
            `Student Number: ${getStudentNumber(student)}`;

    }


    displayResultsForStudent();

    displayResultsStudents();

}


/* ============================================================
   LOAD RESULT SUBJECTS
============================================================ */

function loadResultSubjects(){

    if(!resultSubject){

        return;

    }


    resultSubject.innerHTML = `

        <option value="">
            Select Subject
        </option>

    `;


    const student =
        students.find(
            item =>

                String(item.id) ===
                String(selectedResultStudentId)
        );


    if(!student){

        return;

    }


    const subjects =
        getStudentSubjects(
            student
        );


    const existingResults =
        results.filter(
            result =>

                String(
                    result.student_id
                ) ===

                String(
                    student.id
                )
        );


    subjects.forEach(
        subject => {

            const alreadyExists =
                existingResults.some(
                    result =>

                        safeText(
                            result.subject
                        ).toLowerCase() ===

                        safeText(
                            subject
                        ).toLowerCase() &&

                        String(
                            result.id
                        ) !==

                        String(
                            editingResultId
                        )
                );


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                subject;


            option.textContent =
                alreadyExists

                    ? `${subject} — Result Saved`

                    : subject;


            option.disabled =
                alreadyExists;


            resultSubject.appendChild(
                option
            );

        }
    );

}


/* ============================================================
   ADD RESULTS BUTTON
============================================================ */

if(addResultsButton){

    addResultsButton.addEventListener(
        "click",
        async function(){

            if(!selectedResultStudentId){

                alert(
                    "Please select a student first."
                );

                return;

            }


            const teacher =
                await requestTeacherAuthorization(
                    "add results"
                );


            if(!teacher){

                return;

            }


            editingResultId =
                null;


            if(resultFormTitle){

                resultFormTitle.textContent =
                    "Add Result";

            }


            if(resultsForm){

                resultsForm.reset();

            }


            if(remarkMode){

                remarkMode.value =
                    "automatic";

            }


            if(resultRemark){

                resultRemark.readOnly =
                    true;


                resultRemark.placeholder =
                    "Automatic";


                resultRemark.value =
                    "";

            }


            loadResultSubjects();


            if(resultsForm){

                resultsForm.classList.add(
                    "show"
                );


                resultsForm.scrollIntoView({

                    behavior:"smooth",

                    block:"center"

                });

            }

        }
    );

}


/* ============================================================
   AUTOMATIC REMARK
============================================================ */

function getAutomaticRemark(
    mark
){

    const value =
        Number(mark);


    if(value >= 80){

        return "Excellent";

    }


    if(value >= 70){

        return "Very Good";

    }


    if(value >= 60){

        return "Good";

    }


    if(value >= 50){

        return "Average";

    }


    if(value >= 40){

        return "Pass";

    }


    return "Needs Improvement";

}


/* ============================================================
   REMARK MODE
============================================================ */

if(remarkMode){

    remarkMode.addEventListener(
        "change",
        function(){

            if(
                remarkMode.value ===
                "automatic"
            ){

                if(resultRemark){

                    resultRemark.readOnly =
                        true;


                    resultRemark.placeholder =
                        "Automatic";

                }


                if(
                    resultMark &&
                    resultMark.value !== ""
                ){

                    const mark =
                        Number(
                            resultMark.value
                        );


                    if(
                        !isNaN(mark) &&
                        mark >= 0 &&
                        mark <= 100
                    ){

                        resultRemark.value =
                            getAutomaticRemark(
                                mark
                            );

                    }
                    else{

                        resultRemark.value =
                            "";

                    }

                }
                else if(resultRemark){

                    resultRemark.value =
                        "";

                }

            }

            else{

                if(resultRemark){

                    resultRemark.readOnly =
                        false;


                    resultRemark.placeholder =
                        "Enter remark manually";

                }

            }

        }
    );

}


/* ============================================================
   MARK INPUT
============================================================ */

if(resultMark){

    resultMark.addEventListener(
        "input",
        function(){

            if(
                !remarkMode ||
                remarkMode.value !==
                "automatic"
            ){

                return;

            }


            if(
                resultMark.value ===
                ""
            ){

                if(resultRemark){

                    resultRemark.value =
                        "";

                }

                return;

            }


            const mark =
                Number(
                    resultMark.value
                );


            if(
                isNaN(mark) ||
                mark < 0 ||
                mark > 100
            ){

                if(resultRemark){

                    resultRemark.value =
                        "";

                }

                return;

            }


            if(resultRemark){

                resultRemark.value =
                    getAutomaticRemark(
                        mark
                    );

            }

        }
    );

}


/* ============================================================
   SAVE RESULT
============================================================ */

if(resultsForm){

    resultsForm.addEventListener(
        "submit",
        async function(event){

            event.preventDefault();


            if(!selectedResultStudentId){

                alert(
                    "Please select a student first."
                );

                return;

            }


            const student =
                students.find(
                    item =>

                        String(item.id) ===
                        String(
                            selectedResultStudentId
                        )
                );


            if(!student){

                alert(
                    "Student not found."
                );

                return;

            }


            const subject =
                safeText(
                    resultSubject?.value
                );


            const mark =
                Number(
                    resultMark?.value
                );


            const remark =
                safeText(
                    resultRemark?.value
                );


            if(!subject){

                alert(
                    "Please select a subject."
                );

                return;

            }


            if(
                isNaN(mark) ||
                mark < 0 ||
                mark > 100
            ){

                alert(
                    "Mark must be between 0 and 100."
                );

                return;

            }


            if(!remark){

                alert(
                    "Please enter a remark."
                );

                return;

            }


            try{

                const supabase =
                    getSupabaseClient();


                /*
                   Teacher authorization happens
                   immediately before saving.
                */

                const teacher =
                    await requestTeacherAuthorization(

                        editingResultId

                            ? "edit this result"

                            : "save this result"

                    );


                if(!teacher){

                    return;

                }


                /* ========================================
                   UPDATE RESULT
                ======================================== */

                if(editingResultId){

                    const updateData = {

                        subject:
                            subject,

                        mark:
                            mark,

                        remark:
                            remark,

                        remark_mode:
                            remarkMode.value,

                        updated_at:
                            new Date()
                                .toISOString()

                    };


                    const {
                        error
                    } =
                        await supabase
                            .from("results")
                            .update(
                                updateData
                            )
                            .eq(
                                "id",
                                editingResultId
                            );


                    if(error){

                        throw new Error(
                            error.message
                        );

                    }


                    alert(
                        "Result updated successfully."
                    );

                }


                /* ========================================
                   INSERT RESULT
                ======================================== */

                else{

                    const duplicate =
                        results.some(
                            result =>

                                String(
                                    result.student_id
                                ) ===

                                String(
                                    student.id
                                ) &&

                                safeText(
                                    result.subject
                                ).toLowerCase() ===

                                subject.toLowerCase()
                        );


                    if(duplicate){

                        alert(

                            "A result for this subject already exists for this student."

                        );

                        return;

                    }


                    const insertData = {

                        student_id:
                            student.id,

                        subject:
                            subject,

                        mark:
                            mark,

                        remark:
                            remark,

                        remark_mode:
                            remarkMode.value,

                        academic_year:
                            new Date()
                                .getFullYear(),

                        term:
                            "Term 1"

                    };


                    console.log(
                        "FCA inserting result:",
                        insertData
                    );


                    const {
                        data,
                        error
                    } =
                        await supabase
                            .from("results")
                            .insert(
                                insertData
                            )
                            .select()
                            .single();


                    if(error){

                        throw new Error(
                            error.message
                        );

                    }


                    console.log(
                        "FCA result created:",
                        data
                    );


                    alert(
                        "Result saved successfully."
                    );

                }


                /*
                   Reset
                */

                editingResultId =
                    null;


                resultsForm.reset();


                resultsForm.classList.remove(
                    "show"
                );


                if(resultFormTitle){

                    resultFormTitle.textContent =
                        "Add Result";

                }


                if(remarkMode){

                    remarkMode.value =
                        "automatic";

                }


                if(resultRemark){

                    resultRemark.readOnly =
                        true;


                    resultRemark.placeholder =
                        "Automatic";

                    resultRemark.value =
                        "";

                }


                /*
                   Reload database
                */

                await loadResults();


                displayResultsForStudent();

                displayResultsStudents();

            }

            catch(error){

                console.error(
                    "FCA result save error:",
                    error
                );


                alert(

                    `Unable to save result.\n\n` +

                    `${error.message}`

                );

            }

        }
    );

}


/* ============================================================
   CANCEL RESULT
============================================================ */

if(cancelResults){

    cancelResults.addEventListener(
        "click",
        function(){

            if(resultsForm){

                resultsForm.reset();

                resultsForm.classList.remove(
                    "show"
                );

            }


            editingResultId =
                null;


            if(resultFormTitle){

                resultFormTitle.textContent =
                    "Add Result";

            }


            if(remarkMode){

                remarkMode.value =
                    "automatic";

            }


            if(resultRemark){

                resultRemark.readOnly =
                    true;


                resultRemark.placeholder =
                    "Automatic";

                resultRemark.value =
                    "";

            }

        }
    );

}


/* ============================================================
   DISPLAY RESULTS FOR STUDENT
============================================================ */

function displayResultsForStudent(){

    if(!resultsList){

        return;

    }


    if(!selectedResultStudentId){

        resultsList.innerHTML =
            "";

        return;

    }


    const studentResults =
        results.filter(
            result =>

                String(
                    result.student_id
                ) ===

                String(
                    selectedResultStudentId
                )
        );


    if(
        studentResults.length ===
        0
    ){

        resultsList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    R
                </div>

                <strong>
                    No results entered yet
                </strong>

                <p>
                    Click "+ Add Results" to
                    enter this student's first result.
                </p>

            </div>

        `;

        return;

    }


    resultsList.innerHTML =
        studentResults
            .map(
                result => `

                    <div class="result-row">

                        <div class="result-info">

                            <strong>
                                ${escapeHtml(
                                    result.subject
                                )}
                            </strong>

                            <span>
                                Remark:
                                ${escapeHtml(
                                    result.remark
                                )}
                            </span>

                        </div>


                        <div class="result-mark">

                            <strong>
                                ${escapeHtml(
                                    String(
                                        result.mark
                                    )
                                )}
                            </strong>

                            <span>

                                ${
                                    result.remark_mode ===
                                    "manual"

                                        ? "Manual"

                                        : "Automatic"

                                }

                            </span>

                        </div>


                        <div class="result-actions">

                            <button
                                type="button"
                                class="edit-button"
                                onclick="editResult('${escapeHtml(result.id)}')"
                            >
                                Edit
                            </button>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* ============================================================
   EDIT RESULT
============================================================ */

async function editResult(
    resultId
){

    if(!selectedResultStudentId){

        alert(
            "Please select a student first."
        );

        return;

    }


    const teacher =
        await requestTeacherAuthorization(
            "edit this result"
        );


    if(!teacher){

        return;

    }


    const result =
        results.find(
            item =>

                String(item.id) ===
                String(resultId)
        );


    if(!result){

        alert(
            "Result not found."
        );

        return;

    }


    editingResultId =
        result.id;


    if(resultFormTitle){

        resultFormTitle.textContent =
            "Edit Result";

    }


    loadResultSubjects();


    if(resultSubject){

        resultSubject.value =
            result.subject ||
            "";

    }


    if(resultMark){

        resultMark.value =
            result.mark ??
            "";

    }


    if(remarkMode){

        remarkMode.value =
            result.remark_mode ||
            "automatic";

    }


    if(resultRemark){

        resultRemark.value =
            result.remark ||
            "";

    }


    if(
        remarkMode &&
        remarkMode.value ===
        "manual"
    ){

        if(resultRemark){

            resultRemark.readOnly =
                false;

            resultRemark.placeholder =
                "Enter remark manually";

        }

    }

    else{

        if(resultRemark){

            resultRemark.readOnly =
                true;

            resultRemark.placeholder =
                "Automatic";

        }

    }


    if(resultsForm){

        resultsForm.classList.add(
            "show"
        );


        resultsForm.scrollIntoView({

            behavior:"smooth",

            block:"center"

        });

    }

}


/* ============================================================
   GLOBAL FUNCTIONS
   Required because HTML onclick=""
   calls these functions.
============================================================ */

window.editStudent =
    editStudent;


window.selectResultStudent =
    selectResultStudent;


window.editResult =
    editResult;


window.loadAllData =
    loadAllData;


/* ============================================================
   INITIALIZE CLASSES PAGE
============================================================ */

async function initializeClassesPage(){

    console.log(
        "FCA Classes page initializing..."
    );


    /*
       A form is required.
    */

    if(!formNumber){

        console.warn(
            "FCA Classes: No form selected."
        );

        return;

    }


    /*
       Header
    */

    initializeFormHeader();


    /*
       Subjects
    */

    loadSubjectCheckboxes();


    /*
       Admin authentication
    */

    const authorized =
        await checkAdminAuthorization();


    if(!authorized){

        return;

    }


    /*
       Supabase authentication listener
    */

    initializeAuthListener();


    /*
       Load database
    */

    await loadAllData();


    console.log(
        `FCA Classes Form ${formNumber} page ready.`
    );

}


/* ============================================================
   START
============================================================ */

initializeClassesPage();