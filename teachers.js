/* ============================================================
FCA TEACHERS
Frontend -> Termux Flask API -> SQLite
============================================================ */

/* ============================================================
API
============================================================ */

const FCA_API = "http://127.0.0.1:5000/api";

/* ============================================================
STATE
============================================================ */

let teachers = [];

let editingId = null;

/* ============================================================
ELEMENTS
============================================================ */

const teacherForm =
document.getElementById("teacherForm");

const teacherList =
document.getElementById("teacherList");

const teacherCount =
document.getElementById("teacherCount");

const subjectCount =
document.getElementById("subjectCount");

const classCount =
document.getElementById("classCount");

const teacherMessage =
document.getElementById("teacherMessage");

const formTitle =
document.getElementById("formTitle");

const firstName =
document.getElementById("firstName");

const lastName =
document.getElementById("lastName");

const username =
document.getElementById("username");

const password =
document.getElementById("password");

const cancelBtn =
document.getElementById("cancelBtn");

const selectAllSubjectsBtn =
document.getElementById("selectAllSubjectsBtn");

const clearSubjectsBtn =
document.getElementById("clearSubjectsBtn");

const selectAllClassesBtn =
document.getElementById("selectAllClassesBtn");

const clearClassesBtn =
document.getElementById("clearClassesBtn");

/* ============================================================
API REQUEST
============================================================ */

async function fcaAPI(endpoint, options = {}) {

const response = await fetch(
FCA_API + endpoint,
{
headers: {
"Content-Type": "application/json"
},
...options
}
);

let data;

try {

data = await response.json();

}

catch(error) {

throw new Error(
  "The FCA server returned an invalid response."
);

}

if(!response.ok) {

throw new Error(
  data.message ||
  `API request failed: ${response.status}`
);

}

return data;

}

/* ============================================================
LOAD TEACHERS
============================================================ */

async function loadTeachers() {

teacherList.innerHTML = `

<div class="empty-state">

  <div class="empty-icon">
    T
  </div>

  <strong>
    Loading teachers...
  </strong>

  <p>
    Connecting to FCA database.
  </p>

</div>

`;

try {

const data =
  await fcaAPI("/teachers");


teachers =
  Array.isArray(data.teachers)
  ? data.teachers
  : [];


displayTeachers();

}

catch(error) {

console.error(
  "Teacher loading error:",
  error
);


teacherList.innerHTML = `

  <div class="empty-state">

    <div class="empty-icon">
      !
    </div>

    <strong>
      Unable to connect to FCA database
    </strong>

    <p>
      ${escapeHTML(error.message)}
    </p>

    <button
      type="button"
      class="add-btn"
      id="retryTeachersBtn"
    >
      Try Again
    </button>

  </div>

`;


const retry =
  document.getElementById(
    "retryTeachersBtn"
  );


if(retry) {

  retry.addEventListener(
    "click",
    loadTeachers
  );

}

}

}

/* ============================================================
DISPLAY TEACHERS
============================================================ */

function displayTeachers() {

teacherCount.textContent =
teachers.length;

let subjectsTotal = 0;

let classesTotal = 0;

teachers.forEach(
teacher => {

  subjectsTotal +=
    Array.isArray(teacher.subjects)
    ? teacher.subjects.length
    : 0;


  classesTotal +=
    Array.isArray(teacher.classes)
    ? teacher.classes.length
    : 0;

}

);

subjectCount.textContent =
subjectsTotal;

classCount.textContent =
classesTotal;

if(teachers.length === 0) {

teacherList.innerHTML = `

  <div class="empty-state">

    <div class="empty-icon">
      T
    </div>

    <strong>
      No teachers added yet
    </strong>

    <p>
      Add your first teacher to begin
      managing classes and results.
    </p>

    <a
      href="#addTeacher"
      class="add-btn"
    >
      + Add Teacher
    </a>

  </div>

`;

return;

}

teacherList.innerHTML =
teachers.map(
teacher => {

    const subjects =
      Array.isArray(teacher.subjects)
      ? teacher.subjects
      : [];


    const classes =
      Array.isArray(teacher.classes)
      ? teacher.classes
      : [];


    const teacherNumber =
      teacher.teacher_number ||
      `FCA-T-${String(teacher.id).padStart(3,"0")}`;


    const displayUsername =
      teacher.username ||
      teacher.email ||
      "";


    return `

      <div class="teacher-card">

        <div class="teacher-main">

          <div class="teacher-avatar">

            ${
              escapeHTML(
                (teacher.first_name || "T")
                  .charAt(0)
                  .toUpperCase()
              )
            }

          </div>


          <div class="teacher-info">

            <div class="teacher-name-row">

              <h3>

                ${escapeHTML(
                  teacher.first_name || ""
                )}

                ${escapeHTML(
                  teacher.last_name || ""
                )}

              </h3>


              <span class="teacher-id">

                ${escapeHTML(
                  teacherNumber
                )}

              </span>

            </div>


            <p class="username">

              ${
                displayUsername
                ? "@" +
                  escapeHTML(
                    displayUsername
                  )
                : ""
              }

            </p>


            <div class="assignment-block">

              <strong>
                Subjects
              </strong>


              <div class="tags">

                ${
                  subjects.length

                  ?

                  subjects.map(
                    subject => `

                      <span
                        class="tag subject-tag"
                      >
                        ${escapeHTML(subject)}
                      </span>

                    `
                  ).join("")

                  :

                  `
                    <span class="none">
                      No subjects assigned
                    </span>
                  `
                }

              </div>

            </div>


            <div class="assignment-block">

              <strong>
                Classes
              </strong>


              <div class="tags">

                ${
                  classes.length

                  ?

                  classes.map(
                    className => `

                      <span
                        class="tag class-tag"
                      >
                        ${escapeHTML(className)}
                      </span>

                    `
                  ).join("")

                  :

                  `
                    <span class="none">
                      No classes assigned
                    </span>
                  `
                }

              </div>

            </div>

          </div>

        </div>


        <div class="teacher-actions">

          <button
            type="button"
            class="edit-btn"
            data-action="edit"
            data-id="${teacher.id}"
          >
            Edit
          </button>


          <button
            type="button"
            class="delete-btn"
            data-action="delete"
            data-id="${teacher.id}"
          >
            Delete
          </button>

        </div>

      </div>

    `;

  }
).join("");

attachTeacherActions();

}

/* ============================================================
ESCAPE HTML
============================================================ */

function escapeHTML(value) {

return String(value ?? "")
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");

}

/* ============================================================
TEACHER BUTTON ACTIONS
============================================================ */

function attachTeacherActions() {

document
.querySelectorAll(
'[data-action="edit"]'
)
.forEach(
button => {

    button.addEventListener(
      "click",
      () => {

        editTeacher(
          Number(button.dataset.id)
        );

      }
    );

  }
);

document
.querySelectorAll(
'[data-action="delete"]'
)
.forEach(
button => {

    button.addEventListener(
      "click",
      () => {

        deleteTeacher(
          Number(button.dataset.id)
        );

      }
    );

  }
);

}

/* ============================================================
SELECT SUBJECTS
============================================================ */

function getSelectedSubjects() {

return Array.from(
document.querySelectorAll(
'input[name="subjects"]:checked'
)
).map(
checkbox =>
checkbox.value
);

}

/* ============================================================
SELECT CLASSES
============================================================ */

function getSelectedClasses() {

return Array.from(
document.querySelectorAll(
'input[name="classes"]:checked'
)
).map(
checkbox =>
checkbox.value
);

}

/* ============================================================
SELECT ALL SUBJECTS
============================================================ */

function selectAllSubjects() {

document
.querySelectorAll(
'input[name="subjects"]'
)
.forEach(
checkbox => {

    checkbox.checked = true;

  }
);

}

/* ============================================================
CLEAR SUBJECTS
============================================================ */

function clearSubjects() {

document
.querySelectorAll(
'input[name="subjects"]'
)
.forEach(
checkbox => {

    checkbox.checked = false;

  }
);

}

/* ============================================================
SELECT ALL CLASSES
============================================================ */

function selectAllClasses() {

document
.querySelectorAll(
'input[name="classes"]'
)
.forEach(
checkbox => {

    checkbox.checked = true;

  }
);

}

/* ============================================================
CLEAR CLASSES
============================================================ */

function clearClasses() {

document
.querySelectorAll(
'input[name="classes"]'
)
.forEach(
checkbox => {

    checkbox.checked = false;

  }
);

}

/* ============================================================
SHOW MESSAGE
============================================================ */

function showMessage(
message,
type = "success"
) {

teacherMessage.textContent =
message;

teacherMessage.dataset.type =
type;

}

/* ============================================================
SAVE TEACHER
============================================================ */

teacherForm.addEventListener(
"submit",
async function(event) {

event.preventDefault();


showMessage(
  "",
  ""
);


const first =
  firstName.value.trim();


const last =
  lastName.value.trim();


const user =
  username.value.trim();


const pass =
  password.value;


const subjects =
  getSelectedSubjects();


const classes =
  getSelectedClasses();


if(!first || !last) {

  showMessage(
    "First name and last name are required.",
    "error"
  );

  return;

}


if(!user) {

  showMessage(
    "Username is required.",
    "error"
  );

  return;

}


if(!pass && editingId === null) {

  showMessage(
    "Password is required.",
    "error"
  );

  return;

}


if(subjects.length === 0) {

  showMessage(
    "Please select at least one subject.",
    "error"
  );

  return;

}


if(classes.length === 0) {

  showMessage(
    "Please assign the teacher to at least one class.",
    "error"
  );

  return;

}


const duplicate =
  teachers.some(
    teacher => {

      const existingUsername =
        String(
          teacher.username ||
          ""
        ).toLowerCase();


      return (
        existingUsername ===
        user.toLowerCase()
        &&
        Number(teacher.id) !==
        Number(editingId)
      );

    }
  );


if(duplicate) {

  showMessage(
    "That username is already being used.",
    "error"
  );

  return;

}


const saveButton =
  teacherForm.querySelector(
    ".save-btn"
  );


if(saveButton) {

  saveButton.disabled =
    true;

  saveButton.textContent =
    editingId === null
    ? "Saving..."
    : "Updating...";

}


try {

  let data;


  /* ======================================================
     NEW TEACHER
  ====================================================== */

  if(editingId === null) {

    data =
      await fcaAPI(
        "/teachers",
        {
          method: "POST",

          body: JSON.stringify({

            first_name: first,

            last_name: last,

            username: user,

            password: pass,

            subjects: subjects,

            classes: classes

          })

        }
      );

  }


  /* ======================================================
     EDIT TEACHER
  ====================================================== */

  else {

    data =
      await fcaAPI(
        `/teachers/${editingId}`,
        {
          method: "PUT",

          body: JSON.stringify({

            first_name: first,

            last_name: last,

            username: user,

            password: pass,

            subjects: subjects,

            classes: classes

          })

        }
      );

  }


  showMessage(
    data.message ||
    "Teacher saved successfully.",
    "success"
  );


  await loadTeachers();


  setTimeout(
    resetForm,
    800
  );


}

catch(error) {

  console.error(
    "Save teacher error:",
    error
  );


  showMessage(
    error.message ||
    "Unable to save teacher.",
    "error"
  );

}


finally {

  if(saveButton) {

    saveButton.disabled =
      false;

    saveButton.textContent =
      "Save Teacher";

  }

}

}
);

/* ============================================================
EDIT TEACHER
============================================================ */

function editTeacher(id) {

const teacher =
teachers.find(
item =>
Number(item.id) ===
Number(id)
);

if(!teacher) {

showMessage(
  "Teacher could not be found.",
  "error"
);

return;

}

editingId =
Number(teacher.id);

formTitle.textContent =
"Edit Teacher";

firstName.value =
teacher.first_name || "";

lastName.value =
teacher.last_name || "";

username.value =
teacher.username || "";

password.value =
teacher.password || "";

clearSubjects();

clearClasses();

const subjects =
Array.isArray(teacher.subjects)
? teacher.subjects
: [];

const classes =
Array.isArray(teacher.classes)
? teacher.classes
: [];

subjects.forEach(
subject => {

  const checkbox =
    Array.from(
      document.querySelectorAll(
        'input[name="subjects"]'
      )
    ).find(
      item =>
        item.value === subject
    );


  if(checkbox) {

    checkbox.checked =
      true;

  }

}

);

classes.forEach(
className => {

  const checkbox =
    Array.from(
      document.querySelectorAll(
        'input[name="classes"]'
      )
    ).find(
      item =>
        item.value === className
    );


  if(checkbox) {

    checkbox.checked =
      true;

  }

}

);

document
.getElementById("addTeacher")
.scrollIntoView({
behavior: "smooth"
});

}

/* ============================================================
DELETE TEACHER
============================================================ */

async function deleteTeacher(id) {

const teacher =
teachers.find(
item =>
Number(item.id) ===
Number(id)
);

if(!teacher) {

return;

}

const fullName =
"${teacher.first_name || ""} ${teacher.last_name || ""}"
.trim();

const confirmed =
confirm(
"Delete ${fullName}?\n\nThis will permanently remove the teacher from the FCA database."
);

if(!confirmed) {

return;

}

try {

await fcaAPI(
  `/teachers/${id}`,
  {
    method: "DELETE"
  }
);


showMessage(
  "Teacher deleted successfully.",
  "success"
);


await loadTeachers();


if(
  editingId !== null &&
  Number(editingId) ===
  Number(id)
) {

  resetForm();

}

}

catch(error) {

console.error(
  "Delete teacher error:",
  error
);


showMessage(
  error.message ||
  "Unable to delete teacher.",
  "error"
);

}

}

/* ============================================================
RESET FORM
============================================================ */

function resetForm() {

teacherForm.reset();

editingId =
null;

formTitle.textContent =
"Add Teacher";

teacherMessage.textContent =
"";

teacherMessage.dataset.type =
"";

clearSubjects();

clearClasses();

}

/* ============================================================
BUTTON EVENTS
============================================================ */

selectAllSubjectsBtn.addEventListener(
"click",
selectAllSubjects
);

clearSubjectsBtn.addEventListener(
"click",
clearSubjects
);

selectAllClassesBtn.addEventListener(
"click",
selectAllClasses
);

clearClassesBtn.addEventListener(
"click",
clearClasses
);

cancelBtn.addEventListener(
"click",
resetForm
);

/* ============================================================
START
============================================================ */

loadTeachers();