"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   STUDENTS MANAGEMENT
   SUPABASE VERSION
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const FCA_ADMIN_EMAIL = "fca.admin@gmail.com";

const DEFAULT_ACADEMIC_YEAR = new Date().getFullYear();

let db = null;

let currentClass = null;
let currentFormNumber = null;

let students = [];
let subjects = [];

let editingStudentId = null;
let selectedDeleteStudentId = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function(){

  console.log("FCA Students: starting...");

  db = window.fcaSupabase;

  if(!db){

    console.error("FCA Supabase client not found.");

    showDatabaseError(
      "The FCA database connection could not be found."
    );

    return;
  }


  setupPage();

});


/* =========================================================
   PAGE SETUP
========================================================= */

async function setupPage(){

  setupEvents();

  setAcademicYear();

  currentFormNumber = getFormNumberFromURL();


  if(!currentFormNumber){

    showPageError(
      "No class was selected. Please return to Classes and select a class."
    );

    return;
  }


  await loadClass();

  await loadSubjects();

  await loadStudents();

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents(){

  const addStudentBtn =
    document.getElementById("addStudentBtn");

  const studentForm =
    document.getElementById("studentForm");

  const cancelBtn =
    document.getElementById("cancelBtn");

  const selectAllSubjectsBtn =
    document.getElementById("selectAllSubjectsBtn");

  const clearSubjectsBtn =
    document.getElementById("clearSubjectsBtn");

  const passwordToggle =
    document.getElementById("passwordToggle");

  const adminPasswordToggle =
    document.getElementById("adminPasswordToggle");

  const deleteCancelBtn =
    document.getElementById("deleteCancelBtn");

  const deleteConfirmBtn =
    document.getElementById("deleteConfirmBtn");


  if(addStudentBtn){

    addStudentBtn.addEventListener(
      "click",
      function(){

        resetStudentForm();

        const panel =
          document.getElementById("studentFormPanel");

        if(panel){

          panel.scrollIntoView({
            behavior:"smooth",
            block:"start"
          });

        }

      }
    );

  }


  if(studentForm){

    studentForm.addEventListener(
      "submit",
      handleStudentSubmit
    );

  }


  if(cancelBtn){

    cancelBtn.addEventListener(
      "click",
      resetStudentForm
    );

  }


  if(selectAllSubjectsBtn){

    selectAllSubjectsBtn.addEventListener(
      "click",
      selectAllSubjects
    );

  }


  if(clearSubjectsBtn){

    clearSubjectsBtn.addEventListener(
      "click",
      clearSubjects
    );

  }


  if(passwordToggle){

    passwordToggle.addEventListener(
      "click",
      toggleStudentPassword
    );

  }


  if(adminPasswordToggle){

    adminPasswordToggle.addEventListener(
      "click",
      toggleAdminDeletePassword
    );

  }


  if(deleteCancelBtn){

    deleteCancelBtn.addEventListener(
      "click",
      closeDeleteModal
    );

  }


  if(deleteConfirmBtn){

    deleteConfirmBtn.addEventListener(
      "click",
      confirmDeleteStudent
    );

  }


  const deleteModal =
    document.getElementById("deleteModal");

  if(deleteModal){

    deleteModal.addEventListener(
      "click",
      function(event){

        if(event.target === deleteModal){

          closeDeleteModal();

        }

      }
    );

  }


  document.addEventListener(
    "keydown",
    function(event){

      if(event.key === "Escape"){

        closeDeleteModal();

      }

    }
  );

}


/* =========================================================
   GET FORM NUMBER
========================================================= */

function getFormNumberFromURL(){

  const params =
    new URLSearchParams(window.location.search);

  const form =
    params.get("form");

  if(!form){

    return null;

  }


  const number =
    Number(form);

  if(
    !Number.isInteger(number) ||
    number < 1 ||
    number > 4
  ){

    return null;

  }


  return number;

}


/* =========================================================
   LOAD CLASS
========================================================= */

async function loadClass(){

  try{

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
          form_number,
          academic_year
        `)
        .eq("form_number", currentFormNumber)
        .maybeSingle();


    if(error){

      console.error(
        "Class loading error:",
        error
      );

      showPageError(
        "Unable to load the selected class."
      );

      return;

    }


    if(!data){

      showPageError(
        "This class does not exist in the FCA database."
      );

      return;

    }


    currentClass = data;


    const className =
      data.class_name ||
      `Form ${currentFormNumber}`;


    document.title =
      `FCA | ${className} Students`;


    const pageTitle =
      document.getElementById("pageTitle");

    const pageDescription =
      document.getElementById("pageDescription");

    const classNameStat =
      document.getElementById("classNameStat");

    const studentClass =
      document.getElementById("studentClass");

    const studentListDescription =
      document.getElementById(
        "studentListDescription"
      );


    if(pageTitle){

      pageTitle.textContent =
        `${className} Students`;

    }


    if(pageDescription){

      pageDescription.textContent =
        `Manage students registered in ${className}.`;

    }


    if(classNameStat){

      classNameStat.textContent =
        className;

    }


    if(studentClass){

      studentClass.value =
        className;

    }


    if(studentListDescription){

      studentListDescription.textContent =
        `Students registered in ${className}.`;

    }


    const academicYear =
      getAcademicYear();


    if(data.academic_year){

      setAcademicYear(
        data.academic_year
      );

    }


  }catch(error){

    console.error(
      "Unexpected class error:",
      error
    );

    showPageError(
      "An unexpected error occurred while loading the class."
    );

  }

}


/* =========================================================
   LOAD SUBJECTS
========================================================= */

async function loadSubjects(){

  const container =
    document.getElementById(
      "subjectCheckboxes"
    );


  try{

    const { data, error } =
      await db
        .from("subjects")
        .select("*")
        .order("name", {
          ascending:true
        });


    if(error){

      console.warn(
        "Subjects table query failed:",
        error
      );

      /*
         Fallback to FCA's standard subject list.
      */

      subjects =
        getDefaultSubjects();

    }else{

      subjects =
        normalizeSubjects(data);

      if(!subjects.length){

        subjects =
          getDefaultSubjects();

      }

    }


    renderSubjectCheckboxes();


  }catch(error){

    console.error(
      "Subject loading error:",
      error
    );

    subjects =
      getDefaultSubjects();

    renderSubjectCheckboxes();

  }

}


/* =========================================================
   DEFAULT SUBJECTS
========================================================= */

function getDefaultSubjects(){

  return [

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

}


/* =========================================================
   NORMALIZE SUBJECTS
========================================================= */

function normalizeSubjects(data){

  if(!Array.isArray(data)){

    return [];

  }


  return data
    .map(function(subject){

      if(typeof subject === "string"){

        return subject;

      }


      return (
        subject.name ||
        subject.subject_name ||
        subject.title ||
        subject.subject ||
        ""
      );

    })
    .filter(Boolean)
    .sort(function(a,b){

      return a.localeCompare(b);

    });

}


/* =========================================================
   RENDER SUBJECTS
========================================================= */

function renderSubjectCheckboxes(
  selectedSubjects = []
){

  const container =
    document.getElementById(
      "subjectCheckboxes"
    );


  if(!container){

    return;

  }


  container.innerHTML = "";


  if(!subjects.length){

    container.innerHTML = `
      <div class="subjects-loading">
        No subjects are available.
      </div>
    `;

    return;

  }


  subjects.forEach(function(subject, index){

    const safeId =
      `subject_${index}`;


    const label =
      document.createElement("label");

    label.className =
      "check-option";


    const input =
      document.createElement("input");

    input.type =
      "checkbox";

    input.name =
      "subjects";

    input.value =
      subject;

    input.id =
      safeId;


    if(
      selectedSubjects.includes(subject)
    ){

      input.checked = true;

    }


    const span =
      document.createElement("span");

    span.textContent =
      subject;


    label.htmlFor =
      safeId;


    label.appendChild(input);

    label.appendChild(span);

    container.appendChild(label);

  });

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents(){

  const list =
    document.getElementById(
      "studentList"
    );


  if(!list){

    return;

  }


  list.innerHTML = `
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


  try{

    /*
      We first try form_number because this matches
      the existing FCA Classes structure.
    */

    let result =
      await db
        .from("students")
        .select("*")
        .eq(
          "form_number",
          currentFormNumber
        )
        .order(
          "last_name",
          {
            ascending:true
          }
        );


    /*
      If the existing students table does not have
      form_number, try class_id.
    */

    if(
      result.error &&
      currentClass &&
      currentClass.id
    ){

      console.warn(
        "form_number student query failed. Trying class_id."
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
            "last_name",
            {
              ascending:true
            }
          );

    }


    if(result.error){

      console.error(
        "Student loading error:",
        result.error
      );

      showStudentDatabaseError(
        result.error.message
      );

      return;

    }


    students =
      Array.isArray(result.data)
        ? result.data
        : [];


    renderStudents();


  }catch(error){

    console.error(
      "Unexpected student loading error:",
      error
    );

    showStudentDatabaseError(
      "Unable to load students."
    );

  }

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents(){

  const list =
    document.getElementById(
      "studentList"
    );


  const count =
    document.getElementById(
      "studentCount"
    );


  if(count){

    count.textContent =
      students.length;

  }


  if(!list){

    return;

  }


  if(!students.length){

    list.innerHTML = `
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


  list.innerHTML = "";


  students.forEach(function(student){

    list.appendChild(
      createStudentCard(student)
    );

  });

}


/* =========================================================
   CREATE STUDENT CARD
========================================================= */

function createStudentCard(student){

  const card =
    document.createElement("div");

  card.className =
    "student-card";


  const firstName =
    getStudentFirstName(student);

  const lastName =
    getStudentLastName(student);

  const fullName =
    `${firstName} ${lastName}`.trim();


  const studentId =
    getStudentId(student) ||
    "Not assigned";


  const gender =
    getStudentGender(student) ||
    "Not specified";


  const academicYear =
    getStudentAcademicYear(student);


  const password =
    getStudentPassword(student) ||
    "Not assigned";


  const studentSubjects =
    getStudentSubjects(student);


  const initials =
    getInitials(
      firstName,
      lastName
    );


  card.innerHTML = `

    <div class="student-main">

      <div class="student-avatar">
        ${escapeHTML(initials)}
      </div>


      <div class="student-info">

        <div class="student-name-row">

          <h3>
            ${escapeHTML(fullName)}
          </h3>

          <span class="student-id">
            ${escapeHTML(studentId)}
          </span>

        </div>


        <div class="student-details">

          <div class="detail-item">

            <span>
              Gender
            </span>

            <strong>
              ${escapeHTML(gender)}
            </strong>

          </div>


          <div class="detail-item">

            <span>
              Class
            </span>

            <strong>
              ${escapeHTML(
                getCurrentClassName()
              )}
            </strong>

          </div>


          <div class="detail-item">

            <span>
              Academic Year
            </span>

            <strong>
              ${escapeHTML(
                String(academicYear)
              )}
            </strong>

          </div>


          <div class="detail-item">

            <span>
              Access Password
            </span>

            <strong class="password-value">
              ${escapeHTML(password)}
            </strong>

          </div>

        </div>


        <div class="student-subjects">

          <strong>
            Subjects Taken
          </strong>

          <div class="tags">

            ${
              studentSubjects.length
                ? studentSubjects
                    .map(function(subject){

                      return `
                        <span class="tag subject-tag">
                          ${escapeHTML(subject)}
                        </span>
                      `;

                    })
                    .join("")
                : `
                    <span class="none">
                      No subjects assigned
                    </span>
                  `
            }

          </div>

        </div>

      </div>

    </div>


    <div class="student-actions">

      <button
        type="button"
        class="edit-btn"
        data-action="edit"
      >
        Edit
      </button>

      <button
        type="button"
        class="delete-btn"
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


  if(editButton){

    editButton.addEventListener(
      "click",
      function(){

        editStudent(
          student
        );

      }
    );

  }


  if(deleteButton){

    deleteButton.addEventListener(
      "click",
      function(){

        openDeleteModal(
          student
        );

      }
    );

  }


  return card;

}


/* =========================================================
   GET STUDENT FIELDS
========================================================= */

function getStudentFirstName(student){

  return (
    student.first_name ||
    student.firstname ||
    student.firstName ||
    ""
  );

}


function getStudentLastName(student){

  return (
    student.last_name ||
    student.lastname ||
    student.lastName ||
    ""
  );

}


function getStudentGender(student){

  return (
    student.gender ||
    ""
  );

}


function getStudentId(student){

  return (
    student.student_id ||
    student.studentId ||
    student.student_number ||
    student.admission_number ||
    ""
  );

}


function getStudentPassword(student){

  return (
    student.access_password ||
    student.accessPassword ||
    student.password ||
    ""
  );

}


function getStudentAcademicYear(student){

  return (
    student.academic_year ||
    student.academicYear ||
    getAcademicYear()
  );

}


function getStudentSubjects(student){

  const value =
    student.subjects ||
    student.subjects_taken ||
    student.subjectsTaken ||
    [];


  if(Array.isArray(value)){

    return value;

  }


  if(typeof value === "string"){

    try{

      const parsed =
        JSON.parse(value);

      if(Array.isArray(parsed)){

        return parsed;

      }

    }catch(error){

      return value
        .split(",")
        .map(function(item){

          return item.trim();

        })
        .filter(Boolean);

    }

  }


  return [];

}


/* =========================================================
   EDIT STUDENT
========================================================= */

function editStudent(student){

  editingStudentId =
    student.id;


  const firstName =
    document.getElementById(
      "firstName"
    );

  const lastName =
    document.getElementById(
      "lastName"
    );

  const gender =
    document.getElementById(
      "gender"
    );

  const studentId =
    document.getElementById(
      "studentId"
    );

  const accessPassword =
    document.getElementById(
      "accessPassword"
    );

  const generatedStudentId =
    document.getElementById(
      "generatedStudentId"
    );

  const formTitle =
    document.getElementById(
      "formTitle"
    );


  if(firstName){

    firstName.value =
      getStudentFirstName(student);

  }


  if(lastName){

    lastName.value =
      getStudentLastName(student);

  }


  if(gender){

    gender.value =
      getStudentGender(student);

  }


  if(studentId){

    studentId.value =
      getStudentId(student);

  }


  if(generatedStudentId){

    generatedStudentId.textContent =
      getStudentId(student) ||
      "Not assigned";

  }


  if(accessPassword){

    accessPassword.value =
      getStudentPassword(student);

  }


  if(formTitle){

    formTitle.textContent =
      "Edit Student";

  }


  renderSubjectCheckboxes(
    getStudentSubjects(student)
  );


  const panel =
    document.getElementById(
      "studentFormPanel"
    );


  if(panel){

    panel.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

  }

}


/* =========================================================
   RESET STUDENT FORM
========================================================= */

function resetStudentForm(){

  editingStudentId =
    null;


  const form =
    document.getElementById(
      "studentForm"
    );


  if(form){

    form.reset();

  }


  const formTitle =
    document.getElementById(
      "formTitle"
    );


  if(formTitle){

    formTitle.textContent =
      "Add Student";

  }


  const studentClass =
    document.getElementById(
      "studentClass"
    );


  if(studentClass){

    studentClass.value =
      getCurrentClassName();

  }


  const academicYear =
    document.getElementById(
      "academicYear"
    );


  if(academicYear){

    academicYear.value =
      getAcademicYear();

  }


  const studentId =
    document.getElementById(
      "studentId"
    );


  if(studentId){

    studentId.value = "";

  }


  const generatedStudentId =
    document.getElementById(
      "generatedStudentId"
    );


  if(generatedStudentId){

    generatedStudentId.textContent =
      "Will be generated automatically";

  }


  const accessPassword =
    document.getElementById(
      "accessPassword"
    );


  if(accessPassword){

    accessPassword.value = "";

  }


  const passwordToggle =
    document.getElementById(
      "passwordToggle"
    );


  if(passwordToggle){

    passwordToggle.classList.remove(
      "is-visible"
    );

    passwordToggle.setAttribute(
      "aria-pressed",
      "false"
    );

    passwordToggle.setAttribute(
      "aria-label",
      "Show password"
    );

    passwordToggle.setAttribute(
      "title",
      "Show password"
    );

  }


  renderSubjectCheckboxes();


  showMessage(
    "",
    ""
  );

}


/* =========================================================
   HANDLE STUDENT SUBMIT
========================================================= */

async function handleStudentSubmit(event){

  event.preventDefault();


  if(!currentClass){

    showMessage(
      "The class has not loaded yet.",
      "error"
    );

    return;

  }


  const firstName =
    document.getElementById(
      "firstName"
    ).value.trim();


  const lastName =
    document.getElementById(
      "lastName"
    ).value.trim();


  const gender =
    document.getElementById(
      "gender"
    ).value;


  const academicYear =
    Number(
      document.getElementById(
        "academicYear"
      ).value
    );


  const selectedSubjects =
    getSelectedSubjects();


  if(!firstName || !lastName){

    showMessage(
      "Please enter the student's first and last name.",
      "error"
    );

    return;

  }


  if(!gender){

    showMessage(
      "Please select the student's gender.",
      "error"
    );

    return;

  }


  if(
    !academicYear ||
    academicYear < 2000
  ){

    showMessage(
      "Please enter a valid academic year.",
      "error"
    );

    return;

  }


  const saveButton =
    document.querySelector(
      ".save-btn"
    );


  if(saveButton){

    saveButton.disabled =
      true;

    saveButton.textContent =
      editingStudentId
        ? "Updating..."
        : "Saving...";

  }


  try{

    if(editingStudentId){

      await updateStudent({
        firstName,
        lastName,
        gender,
        academicYear,
        subjects:selectedSubjects
      });

    }else{

      await createStudent({
        firstName,
        lastName,
        gender,
        academicYear,
        subjects:selectedSubjects
      });

    }


  }catch(error){

    console.error(
      "Student save error:",
      error
    );

    showMessage(
      error.message ||
      "Unable to save student.",
      "error"
    );

  }finally{

    if(saveButton){

      saveButton.disabled =
        false;

      saveButton.textContent =
        "Save Student";

    }

  }

}


/* =========================================================
   CREATE STUDENT
========================================================= */

async function createStudent(studentData){

  /*
    Generate the access password automatically.
  */

  const accessPassword =
    generateAccessPassword();


  /*
    Generate a temporary student ID.
    The correct alphabetical number is calculated
    from students sharing the same surname prefix.
  */

  const studentId =
    await generateStudentId(
      studentData.lastName,
      studentData.academicYear
    );


  const payload =
    buildStudentPayload(
      studentData,
      studentId,
      accessPassword
    );


  console.log(
    "Creating student:",
    payload
  );


  const { data, error } =
    await db
      .from("students")
      .insert(payload)
      .select()
      .single();


  if(error){

    console.error(
      "Create student error:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(error)
    );

  }


  /*
    Recalculate the surname-prefix numbering after
    insertion so the numbers follow alphabetical order.
  */

  await recalculateStudentIds(
    studentData.academicYear,
    getSurnamePrefix(
      studentData.lastName
    )
  );


  showMessage(
    "Student saved successfully.",
    "success"
  );


  resetStudentForm();

  await loadStudents();

}


/* =========================================================
   UPDATE STUDENT
========================================================= */

async function updateStudent(studentData){

  const oldStudent =
    students.find(function(student){

      return String(student.id) ===
        String(editingStudentId);

    });


  if(!oldStudent){

    throw new Error(
      "The student could not be found."
    );

  }


  const oldPrefix =
    getSurnamePrefix(
      getStudentLastName(oldStudent)
    );


  const newPrefix =
    getSurnamePrefix(
      studentData.lastName
    );


  /*
    Keep the existing access password when editing.
    It is only generated when the student is first created.
  */

  const existingPassword =
    getStudentPassword(
      oldStudent
    );


  const existingId =
    getStudentId(
      oldStudent
    );


  const newId =
    existingId ||
    await generateStudentId(
      studentData.lastName,
      studentData.academicYear
    );


  const payload =
    buildStudentPayload(
      studentData,
      newId,
      existingPassword
    );


  const { error } =
    await db
      .from("students")
      .update(payload)
      .eq(
        "id",
        editingStudentId
      );


  if(error){

    console.error(
      "Update student error:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(error)
    );

  }


  /*
    If surname prefix changed, both the old and new
    groups need their IDs recalculated.
  */

  await recalculateStudentIds(
    studentData.academicYear,
    newPrefix
  );


  if(oldPrefix !== newPrefix){

    await recalculateStudentIds(
      studentData.academicYear,
      oldPrefix
    );

  }


  showMessage(
    "Student updated successfully.",
    "success"
  );


  resetStudentForm();

  await loadStudents();

}


/* =========================================================
   BUILD STUDENT PAYLOAD
========================================================= */

function buildStudentPayload(
  studentData,
  studentId,
  accessPassword
){

  /*
    These are the standard FCA student columns.

    If your existing Supabase students table uses
    different column names, the error returned by
    Supabase will identify the exact column.
  */

  return {

    first_name:
      studentData.firstName,

    last_name:
      studentData.lastName,

    gender:
      studentData.gender,

    student_id:
      studentId,

    access_password:
      accessPassword,

    subjects:
      studentData.subjects,

    academic_year:
      studentData.academicYear,

    class_id:
      currentClass.id,

    form_number:
      currentFormNumber

  };

}


/* =========================================================
   GENERATE STUDENT ID
========================================================= */

async function generateStudentId(
  surname,
  academicYear
){

  const prefix =
    getSurnamePrefix(
      surname
    );


  /*
    Find all students with the same surname prefix
    in this academic year.
  */

  const matchingStudents =
    students
      .filter(function(student){

        return (
          String(
            getStudentAcademicYear(student)
          ) ===
          String(academicYear)
        );

      })
      .filter(function(student){

        return (
          getSurnamePrefix(
            getStudentLastName(student)
          ) === prefix
        );

      })
      .slice();


  /*
    Sort alphabetically by surname.
  */

  matchingStudents.sort(
    compareStudentsAlphabetically
  );


  /*
    Determine where the new student would appear.
  */

  const temporaryStudent = {

    last_name:
      surname,

    first_name:
      ""

  };


  matchingStudents.push(
    temporaryStudent
  );


  matchingStudents.sort(
    compareStudentsAlphabetically
  );


  const position =
    matchingStudents.indexOf(
      temporaryStudent
    ) + 1;


  return (
    `FCA-${academicYear}-${prefix}-${position}`
  );

}


/* =========================================================
   RECALCULATE STUDENT IDS
========================================================= */

async function recalculateStudentIds(
  academicYear,
  surnamePrefix
){

  /*
    This ensures:
      Banda -> BA-1
      Banda -> BA-2
      Banda -> BA-3

    based on alphabetical surname order.
  */


  let group =
    students.filter(function(student){

      return (
        String(
          getStudentAcademicYear(student)
        ) === String(academicYear)
      );

    });


  /*
    Include the newest database records by reloading
    before calculating if possible.
  */

  try{

    let result =
      await db
        .from("students")
        .select("*")
        .eq(
          "academic_year",
          academicYear
        );


    if(
      result.error
    ){

      console.warn(
        "Unable to refresh students for ID calculation.",
        result.error
      );

    }else if(
      Array.isArray(result.data)
    ){

      group =
        result.data;

    }

  }catch(error){

    console.warn(
      "ID recalculation refresh failed.",
      error
    );

  }


  group =
    group.filter(function(student){

      return (
        getSurnamePrefix(
          getStudentLastName(student)
        ) === surnamePrefix
      );

    });


  group.sort(
    compareStudentsAlphabetically
  );


  for(
    let index = 0;
    index < group.length;
    index++
  ){

    const student =
      group[index];


    const newId =
      `FCA-${academicYear}-${surnamePrefix}-${index + 1}`;


    if(
      getStudentId(student) === newId
    ){

      continue;

    }


    const { error } =
      await db
        .from("students")
        .update({
          student_id:newId
        })
        .eq(
          "id",
          student.id
        );


    if(error){

      console.error(
        "Student ID update failed:",
        error
      );

    }

  }

}


/* =========================================================
   ALPHABETICAL COMPARISON
========================================================= */

function compareStudentsAlphabetically(a,b){

  const lastA =
    getStudentLastName(a)
      .trim()
      .toLowerCase();


  const lastB =
    getStudentLastName(b)
      .trim()
      .toLowerCase();


  const lastCompare =
    lastA.localeCompare(
      lastB
    );


  if(lastCompare !== 0){

    return lastCompare;

  }


  const firstA =
    getStudentFirstName(a)
      .trim()
      .toLowerCase();


  const firstB =
    getStudentFirstName(b)
      .trim()
      .toLowerCase();


  return firstA.localeCompare(
    firstB
  );

}


/* =========================================================
   SURNAME PREFIX
========================================================= */

function getSurnamePrefix(surname){

  const clean =
    String(surname || "")
      .trim()
      .replace(
        /[^a-zA-Z]/g,
        ""
      )
      .toUpperCase();


  if(!clean){

    return "XX";

  }


  if(clean.length === 1){

    return `${clean}X`;

  }


  return clean.substring(
    0,
    2
  );

}


/* =========================================================
   GENERATE ACCESS PASSWORD
========================================================= */

function generateAccessPassword(){

  const letters =
    "abcdefghijklmnopqrstuvwxyz";

  const numbers =
    "0123456789";


  let randomLetters = "";

  let randomNumbers = "";


  for(
    let i = 0;
    i < 3;
    i++
  ){

    randomLetters +=
      letters[
        Math.floor(
          Math.random() *
          letters.length
        )
      ];

  }


  for(
    let i = 0;
    i < 3;
    i++
  ){

    randomNumbers +=
      numbers[
        Math.floor(
          Math.random() *
          numbers.length
        )
      ];

  }


  /*
    fca@ = 4 characters
    abc = 3 characters
    123 = 3 characters

    Total = 10 characters
  */

  return (
    `fca@${randomLetters}${randomNumbers}`
  );

}


/* =========================================================
   SELECTED SUBJECTS
========================================================= */

function getSelectedSubjects(){

  const checkboxes =
    document.querySelectorAll(
      'input[name="subjects"]:checked'
    );


  return Array.from(
    checkboxes
  ).map(function(input){

    return input.value;

  });

}


/* =========================================================
   SELECT ALL SUBJECTS
========================================================= */

function selectAllSubjects(){

  const checkboxes =
    document.querySelectorAll(
      'input[name="subjects"]'
    );


  checkboxes.forEach(function(input){

    input.checked =
      true;

  });

}


/* =========================================================
   CLEAR SUBJECTS
========================================================= */

function clearSubjects(){

  const checkboxes =
    document.querySelectorAll(
      'input[name="subjects"]'
    );


  checkboxes.forEach(function(input){

    input.checked =
      false;

  });

}


/* =========================================================
   STUDENT PASSWORD TOGGLE
========================================================= */

function toggleStudentPassword(){

  const input =
    document.getElementById(
      "accessPassword"
    );


  const button =
    document.getElementById(
      "passwordToggle"
    );


  if(!input || !button){

    return;

  }


  const visible =
    input.type === "text";


  input.type =
    visible
      ? "password"
      : "text";


  button.classList.toggle(
    "is-visible",
    !visible
  );


  button.setAttribute(
    "aria-pressed",
    String(!visible)
  );


  button.setAttribute(
    "aria-label",
    visible
      ? "Show password"
      : "Hide password"
  );


  button.setAttribute(
    "title",
    visible
      ? "Show password"
      : "Hide password"
  );

}


/* =========================================================
   DELETE MODAL
========================================================= */

function openDeleteModal(student){

  selectedDeleteStudentId =
    student.id;


  const name =
    `${getStudentFirstName(student)} ${getStudentLastName(student)}`.trim();


  const deleteStudentName =
    document.getElementById(
      "deleteStudentName"
    );


  if(deleteStudentName){

    deleteStudentName.textContent =
      `Delete ${name}?`;

  }


  const password =
    document.getElementById(
      "adminDeletePassword"
    );


  if(password){

    password.value = "";

  }


  const error =
    document.getElementById(
      "deleteError"
    );


  if(error){

    error.textContent =
      "";

  }


  const toggle =
    document.getElementById(
      "adminPasswordToggle"
    );


  if(toggle){

    toggle.classList.remove(
      "is-visible"
    );

    toggle.setAttribute(
      "aria-pressed",
      "false"
    );

    toggle.setAttribute(
      "aria-label",
      "Show password"
    );

    toggle.setAttribute(
      "title",
      "Show password"
    );

  }


  const modal =
    document.getElementById(
      "deleteModal"
    );


  if(modal){

    modal.classList.add(
      "show"
    );

  }

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteModal(){

  selectedDeleteStudentId =
    null;


  const modal =
    document.getElementById(
      "deleteModal"
    );


  if(modal){

    modal.classList.remove(
      "show"
    );

  }

}


/* =========================================================
   ADMIN PASSWORD TOGGLE
========================================================= */

function toggleAdminDeletePassword(){

  const input =
    document.getElementById(
      "adminDeletePassword"
    );


  const button =
    document.getElementById(
      "adminPasswordToggle"
    );


  if(!input || !button){

    return;

  }


  const visible =
    input.type === "text";


  input.type =
    visible
      ? "password"
      : "text";


  button.classList.toggle(
    "is-visible",
    !visible
  );


  button.setAttribute(
    "aria-pressed",
    String(!visible)
  );


  button.setAttribute(
    "aria-label",
    visible
      ? "Show password"
      : "Hide password"
  );


  button.setAttribute(
    "title",
    visible
      ? "Show password"
      : "Hide password"
  );

}


/* =========================================================
   CONFIRM DELETE STUDENT
========================================================= */

async function confirmDeleteStudent(){

  if(!selectedDeleteStudentId){

    return;

  }


  const passwordInput =
    document.getElementById(
      "adminDeletePassword"
    );


  const errorElement =
    document.getElementById(
      "deleteError"
    );


  const confirmButton =
    document.getElementById(
      "deleteConfirmBtn"
    );


  const password =
    passwordInput
      ? passwordInput.value
      : "";


  if(!password){

    if(errorElement){

      errorElement.textContent =
        "Administrator password is required.";

    }

    return;

  }


  if(confirmButton){

    confirmButton.disabled =
      true;

    confirmButton.textContent =
      "Deleting...";

  }


  try{

    /*
      Authenticate the administrator by signing in
      with the FCA administrator account.
    */

    const { data:authData, error:authError } =
      await db.auth.signInWithPassword({

        email:FCA_ADMIN_EMAIL,

        password:password

      });


    if(authError){

      throw new Error(
        "Administrator password is incorrect."
      );

    }


    if(
      !authData ||
      !authData.user
    ){

      throw new Error(
        "Administrator authentication failed."
      );

    }


    /*
      Delete the student.
    */

    const { error } =
      await db
        .from("students")
        .delete()
        .eq(
          "id",
          selectedDeleteStudentId
        );


    if(error){

      throw new Error(
        getDatabaseErrorMessage(error)
      );

    }


    closeDeleteModal();

    showMessage(
      "Student deleted successfully.",
      "success"
    );


    await loadStudents();


  }catch(error){

    console.error(
      "Delete student error:",
      error
    );


    if(errorElement){

      errorElement.textContent =
        error.message ||
        "Unable to delete student.";

    }

  }finally{

    if(confirmButton){

      confirmButton.disabled =
        false;

      confirmButton.textContent =
        "Delete Student";

    }

  }

}


/* =========================================================
   ACADEMIC YEAR
========================================================= */

function setAcademicYear(value){

  const year =
    Number(
      value ||
      DEFAULT_ACADEMIC_YEAR
    );


  const input =
    document.getElementById(
      "academicYear"
    );


  const stat =
    document.getElementById(
      "academicYearStat"
    );


  if(input){

    input.value =
      year;

  }


  if(stat){

    stat.textContent =
      year;

  }

}


function getAcademicYear(){

  const input =
    document.getElementById(
      "academicYear"
    );


  if(
    input &&
    input.value
  ){

    return Number(
      input.value
    );

  }


  if(
    currentClass &&
    currentClass.academic_year
  ){

    return Number(
      currentClass.academic_year
    );

  }


  return DEFAULT_ACADEMIC_YEAR;

}


/* =========================================================
   CURRENT CLASS NAME
========================================================= */

function getCurrentClassName(){

  if(!currentClass){

    return (
      currentFormNumber
        ? `Form ${currentFormNumber}`
        : "—"
    );

  }


  return (
    currentClass.class_name ||
    `Form ${currentFormNumber}`
  );

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  firstName,
  lastName
){

  const first =
    String(firstName || "")
      .trim()
      .charAt(0);


  const last =
    String(lastName || "")
      .trim()
      .charAt(0);


  return (
    `${first}${last}` ||
    "S"
  ).toUpperCase();

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
  message,
  type
){

  const element =
    document.getElementById(
      "studentMessage"
    );


  if(!element){

    return;

  }


  element.textContent =
    message || "";


  if(type === "error"){

    element.style.color =
      "#b42318";

  }else if(type === "success"){

    element.style.color =
      "#18794e";

  }else{

    element.style.color =
      "";

  }

}


/* =========================================================
   PAGE ERROR
========================================================= */

function showPageError(message){

  const list =
    document.getElementById(
      "studentList"
    );


  if(list){

    list.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          !
        </div>

        <strong>
          Unable to load class
        </strong>

        <p>
          ${escapeHTML(message)}
        </p>

      </div>
    `;

  }


  const addButton =
    document.getElementById(
      "addStudentBtn"
    );


  if(addButton){

    addButton.disabled =
      true;

    addButton.style.opacity =
      ".5";

    addButton.style.cursor =
      "not-allowed";

  }

}


/* =========================================================
   DATABASE ERROR
========================================================= */

function showDatabaseError(message){

  showPageError(
    message ||
    "Database connection unavailable."
  );

}


function showStudentDatabaseError(message){

  const list =
    document.getElementById(
      "studentList"
    );


  if(!list){

    return;

  }


  list.innerHTML = `
    <div class="empty-state">

      <div class="empty-icon">
        !
      </div>

      <strong>
        Unable to load students
      </strong>

      <p>
        ${escapeHTML(
          message ||
          "There was a problem connecting to the database."
        )}
      </p>

    </div>
  `;

}


/* =========================================================
   DATABASE ERROR MESSAGE
========================================================= */

function getDatabaseErrorMessage(error){

  if(!error){

    return "Database operation failed.";

  }


  if(
    error.code === "23505"
  ){

    return "A student with this information already exists.";

  }


  if(
    error.code === "23503"
  ){

    return "This student is linked to another FCA record and cannot be saved.";

  }


  if(
    error.code === "42501"
  ){

    return "You do not have permission to perform this operation.";

  }


  return (
    error.message ||
    "Database operation failed."
  );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value){

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