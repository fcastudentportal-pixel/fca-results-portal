"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   RESULTS MANAGEMENT
   CLASS → STUDENTS → RESULTS → OVERALL RESULTS
========================================================= */


/* =========================================================
   GLOBAL CONFIGURATION
========================================================= */

const SUBJECTS_FALLBACK = [
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


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let db = null;

let allClasses = [];
let allStudents = [];
let allSubjects = [];
let allResults = [];

let selectedClass = null;
let selectedStudent = null;

let currentStudentResults = [];


/* =========================================================
   DOM
========================================================= */

const dom = {};


document.addEventListener("DOMContentLoaded", init);


/* =========================================================
   INITIALIZATION
========================================================= */

async function init(){

  cacheDom();

  console.log("FCA Results: starting...");

  db = window.fcaSupabase;

  if(!db){

    setDatabaseStatus(
      "error",
      "Supabase client not found"
    );

    showGlobalMessage(
      "FCA Supabase client was not found. Check config.js.",
      "error"
    );

    return;
  }


  setDatabaseStatus(
    "checking",
    "Connecting to database..."
  );


  attachEvents();


  try{

    await testDatabase();

    setDatabaseStatus(
      "connected",
      "Database connected"
    );

    await loadInitialData();

  }catch(error){

    console.error(
      "FCA Results initialization error:",
      error
    );

    setDatabaseStatus(
      "error",
      "Database connection failed"
    );

    showGlobalMessage(
      getErrorMessage(error),
      "error"
    );

  }

}


/* =========================================================
   CACHE DOM
========================================================= */

function cacheDom(){

  dom.databaseStatus =
    document.getElementById("databaseStatus");

  dom.classesView =
    document.getElementById("classesView");

  dom.studentsView =
    document.getElementById("studentsView");

  dom.entryView =
    document.getElementById("entryView");

  dom.overallView =
    document.getElementById("overallView");


  dom.classesGrid =
    document.getElementById("classesGrid");

  dom.studentsGrid =
    document.getElementById("studentsGrid");


  dom.selectedClassTitle =
    document.getElementById("selectedClassTitle");

  dom.selectedClassDescription =
    document.getElementById(
      "selectedClassDescription"
    );


  dom.entryStudentAvatar =
    document.getElementById(
      "entryStudentAvatar"
    );

  dom.entryStudentName =
    document.getElementById(
      "entryStudentName"
    );

  dom.entryStudentId =
    document.getElementById(
      "entryStudentId"
    );

  dom.entryStudentClass =
    document.getElementById(
      "entryStudentClass"
    );

  dom.entryStudentGender =
    document.getElementById(
      "entryStudentGender"
    );

  dom.entryStudentSubtitle =
    document.getElementById(
      "entryStudentSubtitle"
    );


  dom.resultsEntryBody =
    document.getElementById(
      "resultsEntryBody"
    );

  dom.subjectCount =
    document.getElementById(
      "subjectCount"
    );


  dom.studentName =
    document.getElementById(
      "studentName"
    );

  dom.studentId =
    document.getElementById(
      "studentId"
    );

  dom.studentClass =
    document.getElementById(
      "studentClass"
    );

  dom.studentGender =
    document.getElementById(
      "studentGender"
    );

  dom.studentSubjectCount =
    document.getElementById(
      "studentSubjectCount"
    );

  dom.studentAverage =
    document.getElementById(
      "studentAverage"
    );

  dom.overallResultsBody =
    document.getElementById(
      "overallResultsBody"
    );

  dom.overallResult =
    document.getElementById(
      "overallResult"
    );


  dom.saveResultsBtn =
    document.getElementById(
      "saveResultsBtn"
    );

  dom.saveMessage =
    document.getElementById(
      "saveMessage"
    );

  dom.globalMessage =
    document.getElementById(
      "globalMessage"
    );

}


/* =========================================================
   EVENTS
========================================================= */

function attachEvents(){

  document
    .getElementById("backToClassesBtn")
    .addEventListener(
      "click",
      showClasses
    );


  document
    .getElementById("backToStudentsBtn")
    .addEventListener(
      "click",
      showStudents
    );


  document
    .getElementById("backToEntryBtn")
    .addEventListener(
      "click",
      showEntry
    );


  document
    .getElementById(
      "backToStudentsFromOverallBtn"
    )
    .addEventListener(
      "click",
      showStudents
    );


  document
    .getElementById("overallBackBtn")
    .addEventListener(
      "click",
      showStudents
    );


  document
    .getElementById(
      "viewOverallFromEntryBtn"
    )
    .addEventListener(
      "click",
      async function(){

        try{

          await saveResults(false);

          showOverall();

        }catch(error){

          console.error(error);

        }

      }
    );


  dom.saveResultsBtn.addEventListener(
    "click",
    function(){
      saveResults(true);
    }
  );


  document
    .getElementById("downloadPdfBtn")
    .addEventListener(
      "click",
      downloadResult
    );

}


/* =========================================================
   DATABASE TEST
========================================================= */

async function testDatabase(){

  const result = await db
    .from("classes")
    .select("id")
    .limit(1);

  if(result.error){

    throw result.error;

  }

}


/* =========================================================
   LOAD INITIAL DATA
========================================================= */

async function loadInitialData(){

  await Promise.all([
    loadClasses(),
    loadStudents(),
    loadSubjects(),
    loadResults()
  ]);

  renderClasses();

}


/* =========================================================
   LOAD CLASSES
========================================================= */

async function loadClasses(){

  const result = await db
    .from("classes")
    .select("*")
    .order(
      "form_number",
      {
        ascending:true,
        nullsFirst:false
      }
    );


  if(result.error){

    throw result.error;

  }


  allClasses = result.data || [];

  console.log(
    "FCA Results classes:",
    allClasses
  );

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents(){

  const result = await db
    .from("students")
    .select("*");


  if(result.error){

    throw result.error;

  }


  allStudents = result.data || [];

  console.log(
    "FCA Results students:",
    allStudents
  );

}


/* =========================================================
   LOAD SUBJECTS
========================================================= */

async function loadSubjects(){

  const result = await db
    .from("subjects")
    .select("*")
    .order("subject_name", {
      ascending:true
    });


  if(result.error){

    /*
      Some installations may use "name"
      rather than "subject_name".
    */

    console.warn(
      "Could not load subjects using subject_name.",
      result.error
    );

    const fallback =
      await db
        .from("subjects")
        .select("*")
        .order("name", {
          ascending:true
        });


    if(fallback.error){

      console.warn(
        "Subjects table could not be loaded.",
        fallback.error
      );

      allSubjects = [];

      return;
    }


    allSubjects = fallback.data || [];

    return;
  }


  allSubjects = result.data || [];

}


/* =========================================================
   LOAD RESULTS
========================================================= */

async function loadResults(){

  const result = await db
    .from("results")
    .select("*");


  if(result.error){

    /*
      Results table may not exist yet.
      We keep the interface usable and allow
      saving once the table is created.
    */

    console.warn(
      "Results could not be loaded:",
      result.error
    );

    allResults = [];

    return;
  }


  allResults = result.data || [];

}


/* =========================================================
   RENDER CLASSES
========================================================= */

function renderClasses(){

  dom.classesGrid.innerHTML = "";


  if(!allClasses.length){

    dom.classesGrid.innerHTML = `
      <div class="empty-state">

        <h3>No Classes Found</h3>

        <p>
          Create classes from the FCA Classes page
          before entering student results.
        </p>

      </div>
    `;

    return;
  }


  allClasses.forEach(function(classItem){

    const students =
      getStudentsForClass(classItem);


    const card =
      document.createElement("article");


    card.className =
      "class-result-card";


    card.innerHTML = `

      <div class="class-card-top">

        <div class="class-icon">
          ${escapeHtml(
            getClassInitial(classItem)
          )}
        </div>

        <div class="class-form">
          ${escapeHtml(
            getClassFormLabel(classItem)
          )}
        </div>

      </div>


      <h3>
        ${escapeHtml(
          getClassName(classItem)
        )}
      </h3>


      <div class="class-code">
        ${escapeHtml(
          getClassCode(classItem)
        )}
      </div>


      <div class="class-card-bottom">

        <span class="student-count">
          ${students.length}
          ${students.length === 1 ? "Student" : "Students"}
        </span>

        <span class="open-class">
          View Students →
        </span>

      </div>

    `;


    card.addEventListener(
      "click",
      function(){

        openClass(classItem);

      }
    );


    dom.classesGrid.appendChild(card);

  });

}


/* =========================================================
   OPEN CLASS
========================================================= */

function openClass(classItem){

  selectedClass = classItem;

  dom.selectedClassTitle.textContent =
    getClassName(classItem);

  dom.selectedClassDescription.textContent =
    "Students in " +
    getClassName(classItem);


  renderStudents();

  showView("students");

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents(){

  dom.studentsGrid.innerHTML = "";


  if(!selectedClass){

    return;
  }


  const students =
    getStudentsForClass(selectedClass);


  if(!students.length){

    dom.studentsGrid.innerHTML = `

      <div class="empty-state">

        <h3>No Students Found</h3>

        <p>
          There are currently no students registered
          in ${escapeHtml(
            getClassName(selectedClass)
          )}.
        </p>

      </div>

    `;

    return;
  }


  students.forEach(function(student){

    const card =
      document.createElement("article");

    card.className =
      "student-result-card";


    const name =
      getStudentName(student);

    const initials =
      getInitials(name);


    card.innerHTML = `

      <div class="student-card-main">

        <div class="student-avatar">
          ${escapeHtml(initials)}
        </div>

        <div>

          <h3>
            ${escapeHtml(name)}
          </h3>

          <div class="student-id">
            ${escapeHtml(
              getStudentId(student)
            )}
          </div>

        </div>

      </div>


      <div class="student-card-details">

        <span class="student-chip">
          Gender:
          ${escapeHtml(
            getStudentGender(student)
          )}
        </span>

        <span class="student-chip">
          Class:
          ${escapeHtml(
            getClassName(selectedClass)
          )}
        </span>

      </div>


      <div class="student-card-actions">

        <button
          type="button"
          class="primary-button enter-results-btn"
        >
          Enter Results
        </button>

        <button
          type="button"
          class="secondary-button overall-results-btn"
        >
          Overall Results
        </button>

      </div>

    `;


    const enterButton =
      card.querySelector(
        ".enter-results-btn"
      );


    const overallButton =
      card.querySelector(
        ".overall-results-btn"
      );


    enterButton.addEventListener(
      "click",
      function(event){

        event.stopPropagation();

        openStudentEntry(student);

      }
    );


    overallButton.addEventListener(
      "click",
      function(event){

        event.stopPropagation();

        openStudentOverall(student);

      }
    );


    dom.studentsGrid.appendChild(card);

  });

}


/* =========================================================
   OPEN STUDENT ENTRY
========================================================= */

async function openStudentEntry(student){

  selectedStudent = student;


  renderEntryStudentInformation();


  dom.resultsEntryBody.innerHTML = `

    <tr>
      <td colspan="5">
        <div class="table-loading">
          Loading subjects...
        </div>
      </td>
    </tr>

  `;


  showView("entry");


  try{

    await loadStudentResults();

    renderResultEntry();

  }catch(error){

    console.error(error);

    dom.resultsEntryBody.innerHTML = `

      <tr>
        <td colspan="5">
          <div class="table-loading">
            Could not load student results.
          </div>
        </td>
      </tr>

    `;

    showGlobalMessage(
      getErrorMessage(error),
      "error"
    );

  }

}


/* =========================================================
   STUDENT INFORMATION
========================================================= */

function renderEntryStudentInformation(){

  if(!selectedStudent){

    return;
  }


  const name =
    getStudentName(selectedStudent);


  dom.entryStudentName.textContent =
    name;

  dom.entryStudentId.textContent =
    getStudentId(selectedStudent);

  dom.entryStudentGender.textContent =
    getStudentGender(selectedStudent);

  dom.entryStudentClass.textContent =
    getClassName(selectedClass);

  dom.entryStudentSubtitle.textContent =
    "Enter academic results for " +
    name;


  dom.entryStudentAvatar.textContent =
    getInitials(name);

}


/* =========================================================
   LOAD CURRENT STUDENT RESULTS
========================================================= */

async function loadStudentResults(){

  if(!selectedStudent){

    return;
  }


  const studentId =
    getDatabaseId(selectedStudent);


  const localResults =
    allResults.filter(function(result){

      return String(
        result.student_id
      ) === String(studentId);

    });


  currentStudentResults =
    localResults;


  /*
    Refresh from Supabase so the page sees
    the latest saved values.
  */

  const result =
    await db
      .from("results")
      .select("*")
      .eq("student_id", studentId);


  if(result.error){

    console.warn(
      "Could not refresh results:",
      result.error
    );

    return;
  }


  currentStudentResults =
    result.data || [];


  /*
    Keep local cache updated.
  */

  allResults =
    allResults.filter(function(item){

      return String(
        item.student_id
      ) !== String(studentId);

    }).concat(
      currentStudentResults
    );

}


/* =========================================================
   RENDER RESULT ENTRY
========================================================= */

function renderResultEntry(){

  const subjects =
    getSubjectsForStudent(
      selectedStudent
    );


  dom.subjectCount.textContent =
    subjects.length;


  dom.resultsEntryBody.innerHTML = "";


  if(!subjects.length){

    dom.resultsEntryBody.innerHTML = `

      <tr>
        <td colspan="5">
          <div class="table-loading">
            No subjects have been assigned to this student.
          </div>
        </td>
      </tr>

    `;

    return;
  }


  subjects.forEach(function(subject,index){

    const subjectId =
      getDatabaseId(subject);


    const existing =
      currentStudentResults.find(
        function(result){

          return String(
            result.subject_id
          ) === String(subjectId);

        }
      );


    const mark =
      existing &&
      existing.mark !== null &&
      existing.mark !== undefined
        ? existing.mark
        : "";


    const remark =
      existing &&
      existing.remark
        ? existing.remark
        : "";


    const status =
      mark === ""
        ? "—"
        : Number(mark) >= 50
          ? "Pass"
          : "Fail";


    const row =
      document.createElement("tr");


    row.dataset.subjectId =
      subjectId;


    row.innerHTML = `

      <td>
        ${index + 1}
      </td>

      <td>
        <strong>
          ${escapeHtml(
            getSubjectName(subject)
          )}
        </strong>
      </td>

      <td>

        <input
          type="number"
          class="mark-input"
          min="0"
          max="100"
          step="1"
          value="${escapeAttribute(mark)}"
          placeholder="0-100"
          aria-label="Mark"
        >

      </td>

      <td>

        <input
          type="text"
          class="remark-input"
          value="${escapeAttribute(remark)}"
          placeholder="Remark"
          aria-label="Remark"
        >

      </td>

      <td>

        <span
          class="result-status ${
            status === "Pass"
              ? "status-pass"
              : status === "Fail"
                ? "status-fail"
                : "status-empty"
          }"
        >
          ${status}
        </span>

      </td>

    `;


    const markInput =
      row.querySelector(
        ".mark-input"
      );


    const remarkInput =
      row.querySelector(
        ".remark-input"
      );


    const statusElement =
      row.querySelector(
        ".result-status"
      );


    markInput.addEventListener(
      "input",
      function(){

        updateRemarkAndStatus(
          markInput,
          remarkInput,
          statusElement
        );

      }
    );


    /*
      If a mark already exists but the
      remark is empty, generate one.
    */

    if(
      mark !== "" &&
      !remark
    ){

      updateRemarkAndStatus(
        markInput,
        remarkInput,
        statusElement
      );

    }


    dom.resultsEntryBody.appendChild(row);

  });

}


/* =========================================================
   UPDATE REMARK + STATUS
========================================================= */

function updateRemarkAndStatus(
  markInput,
  remarkInput,
  statusElement
){

  const value =
    markInput.value.trim();


  if(value === ""){

    statusElement.textContent =
      "—";

    statusElement.className =
      "result-status status-empty";

    return;
  }


  const mark =
    Number(value);


  if(
    Number.isNaN(mark) ||
    mark < 0 ||
    mark > 100
  ){

    statusElement.textContent =
      "Invalid";

    statusElement.className =
      "result-status status-fail";

    return;
  }


  const generated =
    getRemark(mark);


  /*
    Automatically fill the remark when
    the field is empty.

    If the administrator has already
    manually changed the remark,
    leave it unchanged.
  */

  if(
    !remarkInput.value.trim()
  ){

    remarkInput.value =
      generated;
  }


  if(mark >= 50){

    statusElement.textContent =
      "Pass";

    statusElement.className =
      "result-status status-pass";

  }else{

    statusElement.textContent =
      "Fail";

    statusElement.className =
      "result-status status-fail";

  }

}


/* =========================================================
   SAVE RESULTS
========================================================= */

async function saveResults(showMessage = true){

  if(!selectedStudent){

    throw new Error(
      "No student has been selected."
    );

  }


  const rows =
    Array.from(
      dom.resultsEntryBody.querySelectorAll("tr[data-subject-id]")
    );


  if(!rows.length){

    if(showMessage){

      showSaveMessage(
        "There are no subjects to save.",
        "error"
      );

    }

    return;

  }


  dom.saveResultsBtn.disabled =
    true;

  dom.saveResultsBtn.textContent =
    "Saving...";


  const studentId =
    getDatabaseId(selectedStudent);


  const records = [];


  for(const row of rows){

    const subjectId =
      row.dataset.subjectId;


    const markInput =
      row.querySelector(
        ".mark-input"
      );


    const remarkInput =
      row.querySelector(
        ".remark-input"
      );


    const rawMark =
      markInput.value.trim();


    const remark =
      remarkInput.value.trim();


    /*
      Empty mark = no result for that subject.
      We do not insert an empty result.
    */

    if(rawMark === ""){

      continue;

    }


    const mark =
      Number(rawMark);


    if(
      Number.isNaN(mark) ||
      mark < 0 ||
      mark > 100
    ){

      dom.saveResultsBtn.disabled =
        false;

      dom.saveResultsBtn.textContent =
        "Save Results";


      showSaveMessage(
        "Every mark must be between 0 and 100.",
        "error"
      );


      throw new Error(
        "Invalid mark entered."
      );

    }


    records.push({

      student_id: studentId,

      subject_id: subjectId,

      mark: mark,

      remark:
        remark ||
        getRemark(mark)

    });

  }


  try{

    /*
      Save each subject using upsert.

      This assumes the results table has
      a unique constraint for:
      student_id + subject_id
    */

    if(records.length){

      const result =
        await db
          .from("results")
          .upsert(
            records,
            {
              onConflict:
                "student_id,subject_id"
            }
          );


      if(result.error){

        throw result.error;

      }

    }


    /*
      Refresh results after saving.
    */

    await loadStudentResults();


    if(showMessage){

      showSaveMessage(
        "Student results saved successfully.",
        "success"
      );

      showGlobalMessage(
        "Results saved successfully.",
        "success"
      );

    }


    return true;

  }catch(error){

    console.error(
      "Save results error:",
      error
    );


    if(showMessage){

      showSaveMessage(
        getErrorMessage(error),
        "error"
      );

    }


    throw error;

  }finally{

    dom.saveResultsBtn.disabled =
      false;

    dom.saveResultsBtn.textContent =
      "Save Results";

  }

}


/* =========================================================
   OPEN OVERALL RESULTS
========================================================= */

async function openStudentOverall(student){

  selectedStudent =
    student;


  try{

    await loadStudentResults();

  }catch(error){

    console.error(error);

  }


  renderOverallResults();

  showView("overall");

}


/* =========================================================
   RENDER OVERALL RESULTS
========================================================= */

function renderOverallResults(){

  if(!selectedStudent){

    return;
  }


  const name =
    getStudentName(selectedStudent);


  const subjects =
    getSubjectsForStudent(
      selectedStudent
    );


  const resultRows =
    subjects.map(function(subject){

      const subjectId =
        getDatabaseId(subject);


      return {

        subject:subject,

        result:
          currentStudentResults.find(
            function(item){

              return String(
                item.subject_id
              ) === String(subjectId);

            }
          )

      };

    });


  dom.studentName.textContent =
    name;

  dom.studentId.textContent =
    getStudentId(selectedStudent);

  dom.studentClass.textContent =
    getClassName(selectedClass);

  dom.studentGender.textContent =
    getStudentGender(selectedStudent);

  dom.studentSubjectCount.textContent =
    subjects.length;


  const marks =
    resultRows
      .map(function(item){

        return item.result
          ? Number(item.result.mark)
          : null;

      })
      .filter(function(mark){

        return (
          mark !== null &&
          !Number.isNaN(mark)
        );

      });


  const average =
    marks.length
      ? (
          marks.reduce(
            function(total,mark){
              return total + mark;
            },
            0
          ) / marks.length
        ).toFixed(1)
      : "—";


  dom.studentAverage.textContent =
    average === "—"
      ? "—"
      : average + "%";


  dom.overallResultsBody.innerHTML =
    "";


  if(!resultRows.length){

    dom.overallResultsBody.innerHTML = `

      <tr>
        <td colspan="4">
          <div class="table-loading">
            No subjects found.
          </div>
        </td>
      </tr>

    `;

    dom.overallResult.textContent =
      "NO RESULTS";

    return;
  }


  resultRows.forEach(
    function(item,index){

      const result =
        item.result;


      const mark =
        result &&
        result.mark !== null &&
        result.mark !== undefined
          ? result.mark
          : "—";


      const remark =
        result &&
        result.remark
          ? result.remark
          : "Not entered";


      const row =
        document.createElement("tr");


      row.innerHTML = `

        <td>
          ${index + 1}
        </td>

        <td>
          ${escapeHtml(
            getSubjectName(item.subject)
          )}
        </td>

        <td>
          ${escapeHtml(
            String(mark)
          )}
        </td>

        <td class="remark">
          ${escapeHtml(
            remark
          )}
        </td>

      `;


      dom.overallResultsBody.appendChild(
        row
      );

    }
  );


  const overall =
    calculateOverallResult(
      marks,
      resultRows
    );


  dom.overallResult.textContent =
    overall;

}


/* =========================================================
   CALCULATE OVERALL RESULT
========================================================= */

function calculateOverallResult(
  marks,
  resultRows
){

  if(!marks.length){

    return "NO RESULTS";

  }


  /*
    If at least one entered subject is
    below 50, overall result is FAIL.
  */

  const hasFail =
    marks.some(function(mark){

      return mark < 50;

    });


  if(hasFail){

    return "FAIL";

  }


  /*
    All entered subjects have passed.
  */

  return "PASS";

}


/* =========================================================
   SUBJECTS FOR STUDENT
========================================================= */

function getSubjectsForStudent(student){

  if(!student){

    return [];

  }


  /*
    Preferred approach:
    students has a subjects / subject_ids /
    selected_subjects field containing
    subject IDs.

    The code supports several possible
    column names so it works with the
    existing FCA student setup.
  */

  const selectedIds =
    extractStudentSubjectIds(student);


  if(
    selectedIds &&
    selectedIds.length
  ){

    const filtered =
      allSubjects.filter(
        function(subject){

          return selectedIds.some(
            function(id){

              return String(id) ===
                String(
                  getDatabaseId(subject)
                );

            }
          );

        }
      );


    if(filtered.length){

      return filtered;

    }

  }


  /*
    If there is no subject assignment
    stored on the student, use all FCA
    subjects as the available subjects.
  */

  if(allSubjects.length){

    return allSubjects;

  }


  /*
    Final fallback if subjects table
    has not been populated.
  */

  return SUBJECTS_FALLBACK.map(
    function(name,index){

      return {
        id:"fallback-" + index,
        subject_name:name,
        name:name
      };

    }
  );

}


/* =========================================================
   EXTRACT STUDENT SUBJECT IDS
========================================================= */

function extractStudentSubjectIds(student){

  const possibleFields = [
    "subject_ids",
    "subjects",
    "selected_subjects",
    "subjects_taken"
  ];


  for(
    const field of possibleFields
  ){

    if(
      student[field] === null ||
      student[field] === undefined
    ){

      continue;

    }


    let value =
      student[field];


    /*
      JSON stored as text.
    */

    if(typeof value === "string"){

      try{

        value =
          JSON.parse(value);

      }catch(error){

        /*
          Could be a comma-separated list.
        */

        value =
          value
            .split(",")
            .map(function(item){
              return item.trim();
            })
            .filter(Boolean);

      }

    }


    if(Array.isArray(value)){

      return value
        .map(function(item){

          /*
            Supports:
            ["1","2"]
            [{id:1},{id:2}]
          */

          if(
            item &&
            typeof item === "object"
          ){

            return (
              item.id ||
              item.subject_id
            );

          }

          return item;

        })
        .filter(Boolean);

    }

  }


  return [];

}


/* =========================================================
   CLASS HELPERS
========================================================= */

function getStudentsForClass(classItem){

  if(!classItem){

    return [];

  }


  const classId =
    getDatabaseId(classItem);


  const formNumber =
    classItem.form_number;


  return allStudents.filter(
    function(student){

      /*
        First preference:
        class_id relationship.
      */

      if(
        student.class_id !== undefined &&
        student.class_id !== null
      ){

        return String(
          student.class_id
        ) === String(classId);

      }


      /*
        Fallback:
        form_number.
      */

      if(
        student.form_number !== undefined &&
        student.form_number !== null
      ){

        return String(
          student.form_number
        ) === String(formNumber);

      }


      /*
        Additional fallback:
        class_name.
      */

      if(
        student.class_name &&
        getClassName(classItem)
      ){

        return (
          String(student.class_name)
            .toLowerCase()
            ===
          String(getClassName(classItem))
            .toLowerCase()
        );

      }


      return false;

    }
  );

}


function getClassName(classItem){

  if(!classItem){

    return "Class";

  }


  return (
    classItem.class_name ||
    classItem.name ||
    (
      classItem.form_number
        ? "Form " + classItem.form_number
        : "Class"
    )
  );

}


function getClassCode(classItem){

  if(!classItem){

    return "";

  }


  return (
    classItem.class_code ||
    classItem.code ||
    ""
  );

}


function getClassFormLabel(classItem){

  if(
    classItem &&
    classItem.form_number
  ){

    return "FORM " +
      classItem.form_number;

  }


  return "CLASS";

}


function getClassInitial(classItem){

  const form =
    classItem &&
    classItem.form_number;


  if(form){

    return String(form);

  }


  return "C";

}


/* =========================================================
   STUDENT HELPERS
========================================================= */

function getStudentName(student){

  if(!student){

    return "Student";

  }


  if(student.full_name){

    return student.full_name;

  }


  const first =
    student.first_name ||
    "";

  const last =
    student.last_name ||
    "";


  const combined =
    (
      first +
      " " +
      last
    ).trim();


  if(combined){

    return combined;

  }


  return (
    student.name ||
    "Student"
  );

}


function getStudentId(student){

  if(!student){

    return "—";

  }


  return (
    student.student_number ||
    student.student_id ||
    student.admission_number ||
    student.registration_number ||
    student.id ||
    "—"
  );

}


function getStudentGender(student){

  if(!student){

    return "—";

  }


  return (
    student.gender ||
    "—"
  );

}


/* =========================================================
   SUBJECT HELPERS
========================================================= */

function getSubjectName(subject){

  if(!subject){

    return "Subject";

  }


  return (
    subject.subject_name ||
    subject.name ||
    subject.title ||
    "Subject"
  );

}


/* =========================================================
   DATABASE ID
========================================================= */

function getDatabaseId(record){

  if(!record){

    return null;

  }


  return (
    record.id ||
    record.student_id ||
    record.subject_id
  );

}


/* =========================================================
   REMARK SYSTEM
========================================================= */

function getRemark(mark){

  const value =
    Number(mark);


  if(value >= 80){

    return "Distinction";

  }

  if(value >= 70){

    return "Strong Credit";

  }

  if(value >= 60){

    return "Credit";

  }

  if(value >= 50){

    return "Pass";

  }

  return "Fail";

}


/* =========================================================
   SHOW VIEW
========================================================= */

function showView(view){

  dom.classesView.classList.add(
    "hidden"
  );

  dom.studentsView.classList.add(
    "hidden"
  );

  dom.entryView.classList.add(
    "hidden"
  );

  dom.overallView.classList.add(
    "hidden"
  );


  if(view === "classes"){

    dom.classesView.classList.remove(
      "hidden"
    );

  }


  if(view === "students"){

    dom.studentsView.classList.remove(
      "hidden"
    );

  }


  if(view === "entry"){

    dom.entryView.classList.remove(
      "hidden"
    );

  }


  if(view === "overall"){

    dom.overallView.classList.remove(
      "hidden"
    );

  }


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


/* =========================================================
   NAVIGATION
========================================================= */

function showClasses(){

  showView("classes");

}


function showStudents(){

  if(selectedClass){

    renderStudents();

  }

  showView("students");

}


function showEntry(){

  if(selectedStudent){

    renderEntryStudentInformation();

    renderResultEntry();

  }

  showView("entry");

}


function showOverall(){

  renderOverallResults();

  showView("overall");

}


/* =========================================================
   SAVE MESSAGE
========================================================= */

function showSaveMessage(
  message,
  type
){

  dom.saveMessage.textContent =
    message;

  dom.saveMessage.className =
    "save-message " +
    type;

}


/* =========================================================
   GLOBAL MESSAGE
========================================================= */

let globalMessageTimer = null;


function showGlobalMessage(
  message,
  type
){

  clearTimeout(
    globalMessageTimer
  );


  dom.globalMessage.textContent =
    message;


  dom.globalMessage.className =
    "global-message " +
    type;


  dom.globalMessage.classList.remove(
    "hidden"
  );


  globalMessageTimer =
    setTimeout(
      function(){

        dom.globalMessage.classList.add(
          "hidden"
        );

      },
      4000
    );

}


/* =========================================================
   DATABASE STATUS
========================================================= */

function setDatabaseStatus(
  type,
  message
){

  dom.databaseStatus.className =
    "database-status " +
    type;


  dom.databaseStatus.innerHTML = `

    <span class="status-dot"></span>

    ${escapeHtml(message)}

  `;

}


/* =========================================================
   DOWNLOAD PDF
========================================================= */

function downloadResult(){

  if(
    typeof html2pdf ===
    "undefined"
  ){

    showGlobalMessage(
      "PDF library could not be loaded.",
      "error"
    );

    return;

  }


  const result =
    document.getElementById(
      "printableResult"
    );


  const actions =
    result.querySelector(
      ".results-actions"
    );


  const studentName =
    document
      .getElementById(
        "studentName"
      )
      .textContent
      .trim();


  const safeName =
    studentName
      .replace(
        /[^a-z0-9]/gi,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );


  const fileName =
    (
      safeName ||
      "Student"
    ) +
    "-Result.pdf";


  if(actions){

    actions.style.display =
      "none";

  }


  const originalWidth =
    result.style.width;

  const originalMargin =
    result.style.margin;

  const originalBoxSizing =
    result.style.boxSizing;


  result.style.width =
    "190mm";

  result.style.margin =
    "0 auto";

  result.style.boxSizing =
    "border-box";


  const options = {

    margin:[
      10,
      10,
      10,
      10
    ],

    filename:fileName,

    image:{
      type:"jpeg",
      quality:.98
    },

    html2canvas:{
      scale:2,

      useCORS:true,

      scrollX:0,

      scrollY:0
    },

    jsPDF:{
      unit:"mm",

      format:"a4",

      orientation:"portrait"
    },

    pagebreak:{
      mode:[
        "css",
        "legacy"
      ],

      avoid:[
        "tr",
        ".overall-result"
      ]
    }

  };


  showGlobalMessage(
    "Preparing PDF...",
    "success"
  );


  html2pdf()
    .set(options)
    .from(result)
    .save()
    .then(
      function(){

        restorePdfStyles();

        showGlobalMessage(
          "Results PDF created successfully.",
          "success"
        );

      }
    )
    .catch(
      function(error){

        console.error(
          "PDF error:",
          error
        );

        restorePdfStyles();

        showGlobalMessage(
          "Could not create the PDF.",
          "error"
        );

      }
    );


  function restorePdfStyles(){

    result.style.width =
      originalWidth;

    result.style.margin =
      originalMargin;

    result.style.boxSizing =
      originalBoxSizing;


    if(actions){

      actions.style.display =
        "";

    }

  }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value){

  if(
    value === null ||
    value === undefined
  ){

    return "";

  }


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


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value){

  if(
    value === null ||
    value === undefined
  ){

    return "";

  }


  return escapeHtml(
    String(value)
  );

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name){

  const words =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if(!words.length){

    return "ST";

  }


  if(words.length === 1){

    return words[0]
      .substring(0,2)
      .toUpperCase();

  }


  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function getErrorMessage(error){

  if(!error){

    return "An unexpected error occurred.";

  }


  if(error.message){

    return error.message;

  }


  if(error.error_description){

    return error.error_description;

  }


  return String(error);

}