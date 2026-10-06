"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   RESULTS MANAGEMENT

   CLASS
      ↓
   STUDENTS
      ↓
   ENTER RESULTS
      ↓
   OVERALL RESULTS

   GRADING:
   FORMS 1–2 = A–F
   FORMS 3–4 = 1–9
========================================================= */


/* =========================================================
   FALLBACK SUBJECTS
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
   DEFAULT PAPER STRUCTURE
========================================================= */

const DEFAULT_PAPER_STRUCTURES = {

  "English":{
    junior:[
      {name:"Paper I",max:50},
      {name:"Paper II",max:50}
    ],
    senior:[
      {name:"Paper I",max:70},
      {name:"Paper II",max:60},
      {name:"Paper III",max:70}
    ]
  },

  "Chichewa":{
    junior:[
      {name:"Paper I",max:50},
      {name:"Paper II",max:50}
    ],
    senior:[
      {name:"Paper I",max:70},
      {name:"Paper II",max:60},
      {name:"Paper III",max:70}
    ]
  },

  "Mathematics":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:100},
      {name:"Paper II",max:100}
    ]
  },

  "Geography":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:100},
      {name:"Paper II",max:100}
    ]
  },

  "Biology":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:100},
      {name:"Paper II",max:40}
    ]
  },

  "Agriculture":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:100},
      {name:"Paper II",max:40}
    ]
  },

  "Chemistry":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:100},
      {name:"Paper II",max:40}
    ]
  },

  "Physics":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:100},
      {name:"Paper II",max:40}
    ]
  },

  "History":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:50},
      {name:"Paper II",max:120}
    ]
  },

  "Bible Knowledge":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:50},
      {name:"Paper II",max:120}
    ]
  },

  "Social Studies":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:50},
      {name:"Paper II",max:100}
    ]
  },

  "Life Skills":{
    junior:[
      {name:"Paper I",max:100}
    ],
    senior:[
      {name:"Paper I",max:50},
      {name:"Paper II",max:100}
    ]
  }

};


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

const dom = {};

let globalMessageTimer = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);


/* =========================================================
   INIT
========================================================= */

async function init(){

  cacheDom();

  console.log(
    "FCA Results: starting..."
  );


  db =
    window.fcaSupabase;


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
    document.getElementById("selectedClassDescription");


  dom.entryStudentAvatar =
    document.getElementById("entryStudentAvatar");

  dom.entryStudentName =
    document.getElementById("entryStudentName");

  dom.entryStudentId =
    document.getElementById("entryStudentId");

  dom.entryStudentClass =
    document.getElementById("entryStudentClass");

  dom.entryStudentGender =
    document.getElementById("entryStudentGender");

  dom.entryStudentSubtitle =
    document.getElementById("entryStudentSubtitle");

  dom.gradingInformation =
    document.getElementById("gradingInformation");


  dom.resultsEntryBody =
    document.getElementById("resultsEntryBody");

  dom.subjectCount =
    document.getElementById("subjectCount");


  dom.studentName =
    document.getElementById("studentName");

  dom.studentId =
    document.getElementById("studentId");

  dom.studentClass =
    document.getElementById("studentClass");

  dom.studentGender =
    document.getElementById("studentGender");

  dom.studentSubjectCount =
    document.getElementById("studentSubjectCount");

  dom.studentAverage =
    document.getElementById("studentAverage");

  dom.overallResultsBody =
    document.getElementById("overallResultsBody");

  dom.overallResult =
    document.getElementById("overallResult");

  dom.overallResultDetails =
    document.getElementById("overallResultDetails");


  dom.saveResultsBtn =
    document.getElementById("saveResultsBtn");

  dom.saveMessage =
    document.getElementById("saveMessage");

  dom.globalMessage =
    document.getElementById("globalMessage");

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
    .getElementById("backToStudentsFromOverallBtn")
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
    .getElementById("viewOverallFromEntryBtn")
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

  const result =
    await db
      .from("classes")
      .select("id")
      .limit(1);


  if(result.error){

    throw result.error;

  }

}


/* =========================================================
   INITIAL DATA
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

  const result =
    await db
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


  allClasses =
    result.data || [];

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents(){

  const result =
    await db
      .from("students")
      .select("*");


  if(result.error){

    throw result.error;

  }


  allStudents =
    result.data || [];

}


/* =========================================================
   LOAD SUBJECTS
========================================================= */

async function loadSubjects(){

  const result =
    await db
      .from("subjects")
      .select("*")
      .order(
        "subject_name",
        {
          ascending:true
        }
      );


  if(!result.error){

    allSubjects =
      result.data || [];

    return;

  }


  const fallback =
    await db
      .from("subjects")
      .select("*");


  if(fallback.error){

    console.warn(
      "Subjects table could not be loaded.",
      fallback.error
    );

    allSubjects = [];

    return;

  }


  allSubjects =
    (fallback.data || [])
      .sort(
        function(a,b){

          return getSubjectName(a)
            .localeCompare(
              getSubjectName(b)
            );

        }
      );

}


/* =========================================================
   LOAD RESULTS
========================================================= */

async function loadResults(){

  const result =
    await db
      .from("results")
      .select("*");


  if(result.error){

    console.warn(
      "Results could not be loaded:",
      result.error
    );

    allResults = [];

    return;

  }


  allResults =
    result.data || [];

}


/* =========================================================
   RENDER CLASSES
========================================================= */

function renderClasses(){

  dom.classesGrid.innerHTML = "";


  if(!allClasses.length){

    dom.classesGrid.innerHTML = `

      <div class="empty-state">

        <h3>
          No Classes Found
        </h3>

        <p>
          Create classes from the FCA Classes page
          before entering student results.
        </p>

      </div>

    `;

    return;

  }


  allClasses.forEach(
    function(classItem){

      const students =
        getStudentsForClass(
          classItem
        );


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "class-result-card";


      card.innerHTML = `

        <div class="class-card-top">

          <div class="class-icon">
            ${escapeHtml(
              getClassInitial(
                classItem
              )
            )}
          </div>

          <div class="class-form">
            ${escapeHtml(
              getClassFormLabel(
                classItem
              )
            )}
          </div>

        </div>


        <h3>
          ${escapeHtml(
            getClassName(
              classItem
            )
          )}
        </h3>


        <div class="class-code">
          ${escapeHtml(
            getClassCode(
              classItem
            )
          )}
        </div>


        <div class="class-card-bottom">

          <span class="student-count">

            ${students.length}

            ${
              students.length === 1
                ? "Student"
                : "Students"
            }

          </span>


          <span class="open-class">
            View Students →
          </span>

        </div>

      `;


      card.addEventListener(
        "click",
        function(){

          openClass(
            classItem
          );

        }
      );


      dom.classesGrid.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   OPEN CLASS
========================================================= */

function openClass(classItem){

  selectedClass =
    classItem;


  dom.selectedClassTitle.textContent =
    getClassName(
      classItem
    );


  dom.selectedClassDescription.textContent =
    "Students in " +
    getClassName(
      classItem
    );


  renderStudents();


  showView(
    "students"
  );

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents(){

  dom.studentsGrid.innerHTML =
    "";


  if(!selectedClass){

    return;

  }


  const students =
    getStudentsForClass(
      selectedClass
    );


  if(!students.length){

    dom.studentsGrid.innerHTML = `

      <div class="empty-state">

        <h3>
          No Students Found
        </h3>

        <p>
          There are currently no students registered
          in ${escapeHtml(
            getClassName(
              selectedClass
            )
          )}.
        </p>

      </div>

    `;

    return;

  }


  students.forEach(
    function(student){

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "student-result-card";


      const name =
        getStudentName(
          student
        );


      const initials =
        getInitials(
          name
        );


      card.innerHTML = `

        <div class="student-card-main">

          <div class="student-avatar">
            ${escapeHtml(
              initials
            )}
          </div>

          <div>

            <h3>
              ${escapeHtml(
                name
              )}
            </h3>

            <div class="student-id">
              ${escapeHtml(
                getStudentId(
                  student
                )
              )}
            </div>

          </div>

        </div>


        <div class="student-card-details">

          <span class="student-chip">
            Gender:
            ${escapeHtml(
              getStudentGender(
                student
              )
            )}
          </span>

          <span class="student-chip">
            Class:
            ${escapeHtml(
              getClassName(
                selectedClass
              )
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


      card
        .querySelector(
          ".enter-results-btn"
        )
        .addEventListener(
          "click",
          function(event){

            event.stopPropagation();

            openStudentEntry(
              student
            );

          }
        );


      card
        .querySelector(
          ".overall-results-btn"
        )
        .addEventListener(
          "click",
          function(event){

            event.stopPropagation();

            openStudentOverall(
              student
            );

          }
        );


      dom.studentsGrid.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   OPEN STUDENT ENTRY
========================================================= */

async function openStudentEntry(
  student
){

  selectedStudent =
    student;


  renderEntryStudentInformation();


  dom.resultsEntryBody.innerHTML = `

    <tr>

      <td colspan="7">

        <div class="table-loading">
          Loading subjects...
        </div>

      </td>

    </tr>

  `;


  showView(
    "entry"
  );


  try{

    await loadStudentResults();

    renderResultEntry();

  }catch(error){

    console.error(error);


    dom.resultsEntryBody.innerHTML = `

      <tr>

        <td colspan="7">

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
    getStudentName(
      selectedStudent
    );


  const form =
    getStudentFormNumber(
      selectedStudent
    );


  dom.entryStudentName.textContent =
    name;


  dom.entryStudentId.textContent =
    getStudentId(
      selectedStudent
    );


  dom.entryStudentGender.textContent =
    getStudentGender(
      selectedStudent
    );


  dom.entryStudentClass.textContent =
    getClassName(
      selectedClass
    );


  dom.entryStudentSubtitle.textContent =
    "Enter academic results for " +
    name;


  dom.entryStudentAvatar.textContent =
    getInitials(
      name
    );


  if(form >= 3){

    dom.gradingInformation.textContent =
      "Senior grading: 80–100 Grade 1, 70–79 Grade 2, 65–69 Grade 3, 60–64 Grade 4, 55–59 Grade 5, 50–54 Grade 6, 45–49 Grade 7, 40–44 Grade 8, 0–39 Grade 9. English must be passed but is not forced into the best-six aggregate.";

  }else{

    dom.gradingInformation.textContent =
      "Junior grading: 75–100 A, 60–74 B, 50–59 C, 40–49 D, 0–39 F. Overall pass requires at least six passed subjects and English must be passed.";

  }

}


/* =========================================================
   LOAD STUDENT RESULTS
========================================================= */

async function loadStudentResults(){

  if(!selectedStudent){

    return;

  }


  const studentId =
    getDatabaseId(
      selectedStudent
    );


  const localResults =
    allResults.filter(
      function(result){

        return String(
          result.student_id
        ) === String(
          studentId
        );

      }
    );


  currentStudentResults =
    localResults;


  const result =
    await db
      .from("results")
      .select("*")
      .eq(
        "student_id",
        studentId
      );


  if(result.error){

    console.warn(
      "Could not refresh results:",
      result.error
    );

    return;

  }


  currentStudentResults =
    result.data || [];


  allResults =
    allResults
      .filter(
        function(item){

          return String(
            item.student_id
          ) !== String(
            studentId
          );

        }
      )
      .concat(
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


  dom.resultsEntryBody.innerHTML =
    "";


  if(!subjects.length){

    dom.resultsEntryBody.innerHTML = `

      <tr>

        <td colspan="7">

          <div class="table-loading">
            No subjects have been assigned to this student.
          </div>

        </td>

      </tr>

    `;

    return;

  }


  subjects.forEach(
    function(subject,index){

      const subjectId =
        getDatabaseId(
          subject
        );


      const existing =
        currentStudentResults.find(
          function(result){

            return String(
              result.subject_id
            ) === String(
              subjectId
            );

          }
        );


      const papers =
        getPaperStructure(
          subject,
          selectedStudent
        );


      const paperValues =
        getExistingPaperValues(
          existing,
          papers
        );


      const calculation =
        calculateSubjectPercentage(
          papers,
          paperValues
        );


      const grading =
        getSubjectGrading(
          calculation.percentage,
          selectedStudent
        );


      const row =
        document.createElement(
          "tr"
        );


      row.dataset.subjectId =
        subjectId;


      row.innerHTML = `

        <td>
          ${index + 1}
        </td>


        <td class="subject-name">

          ${escapeHtml(
            getSubjectName(
              subject
            )
          )}

        </td>


        <td>

          <div class="paper-list">

            ${papers
              .map(
                function(paper,paperIndex){

                  const value =
                    paperValues[
                      paperIndex
                    ] ?? "";

                  return `

                    <div class="paper-row">

                      <span class="paper-label">
                        ${escapeHtml(
                          paper.name
                        )}
                      </span>

                      <span class="paper-max">
                        / ${paper.max}
                      </span>

                      <input
                        type="number"
                        class="paper-mark-input"
                        data-paper-index="${paperIndex}"
                        min="0"
                        max="${paper.max}"
                        step="1"
                        value="${escapeAttribute(
                          value
                        )}"
                        placeholder="0"
                        aria-label="${escapeAttribute(
                          paper.name +
                          " mark"
                        )}"
                      >

                    </div>

                  `;

                }
              )
              .join("")}


            <div class="paper-total">

              Total:
              <span class="paper-obtained">
                ${calculation.obtained}
              </span>
              /
              <span class="paper-maximum">
                ${calculation.maximum}
              </span>

            </div>

          </div>

        </td>


        <td class="percentage-cell">

          <div class="percentage-value">

            ${
              calculation.percentage === null
                ? "—"
                : calculation.percentage + "%"
            }

          </div>


          <div class="percentage-detail">

            ${
              calculation.percentage === null
                ? "No complete marks"
                : calculation.obtained +
                  " / " +
                  calculation.maximum
            }

          </div>

        </td>


        <td>

          <div class="grade-value">
            ${
              grading
                ? escapeHtml(
                    String(
                      grading.grade
                    )
                  )
                : "—"
            }
          </div>

        </td>


        <td>

          <div class="classification-value">

            ${
              grading
                ? escapeHtml(
                    grading.remark
                  )
                : "—"
            }

          </div>

        </td>


        <td>

          <span
            class="result-status ${
              grading
                ? grading.passed
                  ? "status-pass"
                  : "status-fail"
                : "status-empty"
            }"
          >

            ${
              grading
                ? grading.passed
                  ? "Pass"
                  : "Fail"
                : "—"
            }

          </span>

        </td>

      `;


      const paperInputs =
        Array.from(
          row.querySelectorAll(
            ".paper-mark-input"
          )
        );


      const percentageElement =
        row.querySelector(
          ".percentage-value"
        );


      const percentageDetail =
        row.querySelector(
          ".percentage-detail"
        );


      const obtainedElement =
        row.querySelector(
          ".paper-obtained"
        );


      const maximumElement =
        row.querySelector(
          ".paper-maximum"
        );


      const gradeElement =
        row.querySelector(
          ".grade-value"
        );


      const classificationElement =
        row.querySelector(
          ".classification-value"
        );


      const statusElement =
        row.querySelector(
          ".result-status"
        );


      paperInputs.forEach(
        function(input){

          input.addEventListener(
            "input",
            function(){

              updateSubjectRow(
                row,
                papers,
                paperInputs,
                percentageElement,
                percentageDetail,
                obtainedElement,
                maximumElement,
                gradeElement,
                classificationElement,
                statusElement
              );

            }
          );

        }
      );


      dom.resultsEntryBody.appendChild(
        row
      );

    }
  );

}


/* =========================================================
   UPDATE SUBJECT ROW
========================================================= */

function updateSubjectRow(
  row,
  papers,
  paperInputs,
  percentageElement,
  percentageDetail,
  obtainedElement,
  maximumElement,
  gradeElement,
  classificationElement,
  statusElement
){

  let hasInvalid =
    false;


  const values =
    paperInputs.map(
      function(input,index){

        const raw =
          input.value.trim();


        if(raw === ""){

          input.classList.remove(
            "invalid"
          );

          return null;

        }


        const value =
          Number(raw);


        if(
          Number.isNaN(value) ||
          value < 0 ||
          value > papers[index].max
        ){

          input.classList.add(
            "invalid"
          );

          hasInvalid = true;

          return null;

        }


        input.classList.remove(
          "invalid"
        );


        return value;

      }
    );


  if(hasInvalid){

    percentageElement.textContent =
      "Invalid";

    percentageDetail.textContent =
      "Check paper marks";

    obtainedElement.textContent =
      "—";

    maximumElement.textContent =
      "—";

    gradeElement.textContent =
      "—";

    classificationElement.textContent =
      "Invalid";

    statusElement.textContent =
      "Invalid";

    statusElement.className =
      "result-status status-invalid";

    return;

  }


  const calculation =
    calculateSubjectPercentage(
      papers,
      values
    );


  obtainedElement.textContent =
    calculation.obtained;


  maximumElement.textContent =
    calculation.maximum;


  if(
    calculation.percentage === null
  ){

    percentageElement.textContent =
      "—";

    percentageDetail.textContent =
      "Complete all papers";

    gradeElement.textContent =
      "—";

    classificationElement.textContent =
      "—";

    statusElement.textContent =
      "—";

    statusElement.className =
      "result-status status-empty";

    return;

  }


  percentageElement.textContent =
    calculation.percentage +
    "%";


  percentageDetail.textContent =
    calculation.obtained +
    " / " +
    calculation.maximum;


  const grading =
    getSubjectGrading(
      calculation.percentage,
      selectedStudent
    );


  gradeElement.textContent =
    grading
      ? grading.grade
      : "—";


  classificationElement.textContent =
    grading
      ? grading.remark
      : "—";


  if(grading && grading.passed){

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
   CALCULATE SUBJECT PERCENTAGE
========================================================= */

function calculateSubjectPercentage(
  papers,
  values
){

  const maximum =
    papers.reduce(
      function(total,paper){

        return total +
          Number(
            paper.max
          );

      },
      0
    );


  const enteredValues =
    values.filter(
      function(value){

        return (
          value !== null &&
          value !== undefined &&
          !Number.isNaN(
            Number(value)
          )
        );

      }
    );


  if(!enteredValues.length){

    return {

      obtained:0,

      maximum:maximum,

      percentage:null

    };

  }


  const obtained =
    enteredValues.reduce(
      function(total,value){

        return total +
          Number(value);

      },
      0
    );


  if(
    enteredValues.length !==
    papers.length
  ){

    return {

      obtained:obtained,

      maximum:maximum,

      percentage:null

    };

  }


  const rawPercentage =
    maximum > 0
      ? obtained /
        maximum *
        100
      : 0;


  /*
    IMPORTANT:
    Subject percentage is rounded
    to the nearest whole number
    BEFORE grading.
  */

  const percentage =
    Math.round(
      rawPercentage
    );


  return {

    obtained:obtained,

    maximum:maximum,

    percentage:percentage

  };

}


/* =========================================================
   SENIOR GRADING
========================================================= */

function getSeniorGrade(
  percentage
){

  const value =
    Number(
      percentage
    );


  if(value >= 80){

    return {

      grade:1,

      remark:
        "Pass with Distinction (Outstanding)",

      passed:true

    };

  }


  if(value >= 70){

    return {

      grade:2,

      remark:
        "Pass with Distinction (Excellent)",

      passed:true

    };

  }


  if(value >= 65){

    return {

      grade:3,

      remark:
        "Pass with Credit (Good)",

      passed:true

    };

  }


  if(value >= 60){

    return {

      grade:4,

      remark:
        "Pass with Credit (Competent)",

      passed:true

    };

  }


  if(value >= 55){

    return {

      grade:5,

      remark:
        "Pass with Credit (Satisfactory)",

      passed:true

    };

  }


  if(value >= 50){

    return {

      grade:6,

      remark:
        "Pass with Credit (Minimum Credit)",

      passed:true

    };

  }


  if(value >= 45){

    return {

      grade:7,

      remark:
        "Ordinary Pass",

      passed:true

    };

  }


  if(value >= 40){

    return {

      grade:8,

      remark:
        "Ordinary Pass",

      passed:true

    };

  }


  return {

    grade:9,

    remark:
      "Fail",

    passed:false

  };

}


/* =========================================================
   JUNIOR GRADING
========================================================= */

function getJuniorGrade(
  percentage
){

  const value =
    Number(
      percentage
    );


  if(value >= 75){

    return {

      grade:"A",

      remark:
        "Excellent / Distinction",

      passed:true

    };

  }


  if(value >= 60){

    return {

      grade:"B",

      remark:
        "Very Good",

      passed:true

    };

  }


  if(value >= 50){

    return {

      grade:"C",

      remark:
        "Good",

      passed:true

    };

  }


  if(value >= 40){

    return {

      grade:"D",

      remark:
        "Average / Pass",

      passed:true

    };

  }


  return {

    grade:"F",

    remark:
      "Fail",

    passed:false

  };

}


/* =========================================================
   GET SUBJECT GRADING
========================================================= */

function getSubjectGrading(
  percentage,
  student
){

  if(
    percentage === null ||
    percentage === undefined
  ){

    return null;

  }


  const form =
    getStudentFormNumber(
      student
    );


  if(form >= 3){

    return getSeniorGrade(
      percentage
    );

  }


  return getJuniorGrade(
    percentage
  );

}


/* =========================================================
   GET PAPER STRUCTURE
========================================================= */

function getPaperStructure(
  subject,
  student
){

  const stored =
    extractStoredPapers(
      subject
    );


  if(stored.length){

    return stored;

  }


  const subjectName =
    getSubjectName(
      subject
    );


  const form =
    getStudentFormNumber(
      student
    );


  const structure =
    DEFAULT_PAPER_STRUCTURES[
      subjectName
    ];


  if(structure){

    if(form >= 3){

      return structure.senior;

    }


    return structure.junior;

  }


  return [

    {
      name:"Paper I",
      max:100
    }

  ];

}


/* =========================================================
   EXTRACT STORED PAPERS
========================================================= */

function extractStoredPapers(
  subject
){

  if(!subject){

    return [];

  }


  const possibleFields = [

    "papers",
    "paper_structure",
    "paper_marks",
    "mark_structure",
    "paper_config",
    "assessment_structure"

  ];


  for(
    const field of possibleFields
  ){

    if(
      subject[field] === null ||
      subject[field] === undefined
    ){

      continue;

    }


    let value =
      subject[field];


    if(typeof value === "string"){

      try{

        value =
          JSON.parse(value);

      }catch(error){

        continue;

      }

    }


    if(!Array.isArray(value)){

      continue;

    }


    const normalized =
      value
        .map(
          function(item,index){

            if(
              item === null ||
              item === undefined
            ){

              return null;

            }


            if(
              typeof item === "number"
            ){

              return {

                name:
                  "Paper " +
                  romanNumber(
                    index + 1
                  ),

                max:
                  item

              };

            }


            if(
              typeof item === "object"
            ){

              const max =
                Number(
                  item.max_marks ??
                  item.maximum_marks ??
                  item.max ??
                  item.marks ??
                  item.total ??
                  100
                );


              return {

                name:
                  item.paper_name ||
                  item.name ||
                  item.paper ||
                  (
                    "Paper " +
                    romanNumber(
                      index + 1
                    )
                  ),

                max:
                  Number.isFinite(max)
                    ? max
                    : 100

              };

            }


            return null;

          }
        )
        .filter(Boolean);


    if(normalized.length){

      return normalized;

    }

  }


  return [];

}


/* =========================================================
   EXISTING PAPER VALUES
========================================================= */

function getExistingPaperValues(
  result,
  papers
){

  if(!result){

    return papers.map(
      function(){

        return "";

      }
    );

  }


  const possibleFields = [

    "paper_marks",
    "papers",
    "marks_by_paper",
    "paper_results",
    "paper_scores"

  ];


  for(
    const field of possibleFields
  ){

    if(
      result[field] === null ||
      result[field] === undefined
    ){

      continue;

    }


    let value =
      result[field];


    if(typeof value === "string"){

      try{

        value =
          JSON.parse(value);

      }catch(error){

        continue;

      }

    }


    if(Array.isArray(value)){

      return papers.map(
        function(paper,index){

          const item =
            value[index];


          if(
            item === null ||
            item === undefined
          ){

            return "";

          }


          if(
            typeof item === "number"
          ){

            return item;

          }


          if(
            typeof item === "object"
          ){

            return (
              item.mark ??
              item.value ??
              ""
            );

          }


          return "";

        }
      );

    }


    if(
      value &&
      typeof value === "object"
    ){

      return papers.map(
        function(paper,index){

          const possibleKeys = [

            paper.name,

            String(index),

            String(index + 1),

            "paper" +
              (index + 1)

          ];


          for(
            const key of possibleKeys
          ){

            if(
              value[key] !== undefined
            ){

              return value[key];

            }

          }


          return "";

        }
      );

    }

  }


  if(
    result.mark !== null &&
    result.mark !== undefined
  ){

    const oldMark =
      Number(
        result.mark
      );


    if(
      !Number.isNaN(oldMark) &&
      papers.length === 1
    ){

      return [
        oldMark
      ];

    }

  }


  return papers.map(
    function(){

      return "";

    }
  );

}


/* =========================================================
   GET SUBJECTS FOR STUDENT
========================================================= */

function getSubjectsForStudent(
  student
){

  if(!student){

    return [];

  }


  const studentForm =
    getStudentFormNumber(
      student
    );


  const selectedIds =
    extractStudentSubjectIds(
      student
    );


  if(
    selectedIds &&
    selectedIds.length
  ){

    const filtered =
      allSubjects.filter(
        function(subject){

          const matchesStudentSelection =
            selectedIds.some(
              function(id){

                return String(id) ===
                  String(
                    getDatabaseId(
                      subject
                    )
                  );

              }
            );


          if(!matchesStudentSelection){

            return false;

          }


          const subjectForm =
            getSubjectFormNumber(
              subject
            );


          if(
            subjectForm &&
            studentForm
          ){

            return (
              subjectForm ===
              studentForm
            );

          }


          return true;

        }
      );


    if(filtered.length){

      return sortSubjects(
        filtered
      );

    }

  }


  if(allSubjects.length){

    const formSubjects =
      allSubjects.filter(
        function(subject){

          const subjectForm =
            getSubjectFormNumber(
              subject
            );


          if(
            subjectForm &&
            studentForm
          ){

            return (
              subjectForm ===
              studentForm
            );

          }


          return !subjectForm;

        }
      );


    if(formSubjects.length){

      return sortSubjects(
        formSubjects
      );

    }


    return sortSubjects(
      allSubjects
    );

  }


  return SUBJECTS_FALLBACK.map(
    function(name,index){

      return {

        id:
          "fallback-" +
          index,

        subject_name:
          name,

        name:
          name

      };

    }
  );

}


/* =========================================================
   SORT SUBJECTS
========================================================= */

function sortSubjects(
  subjects
){

  return [...subjects].sort(
    function(a,b){

      return getSubjectName(a)
        .localeCompare(
          getSubjectName(b)
        );

    }
  );

}


/* =========================================================
   STUDENT SUBJECT IDS
========================================================= */

function extractStudentSubjectIds(
  student
){

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


    if(typeof value === "string"){

      try{

        value =
          JSON.parse(value);

      }catch(error){

        value =
          value
            .split(",")
            .map(
              function(item){

                return item.trim();

              }
            )
            .filter(Boolean);

      }

    }


    if(Array.isArray(value)){

      return value
        .map(
          function(item){

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

          }
        )
        .filter(Boolean);

    }

  }


  return [];

}


/* =========================================================
   SENIOR OVERALL CALCULATION
========================================================= */

function calculateSeniorOverall(
  resultRows
){

  /*
    Only completed and passed subjects
    can contribute to the best-six aggregate.

    English must be passed.

    IMPORTANT:
    English is NOT forced into the best six.
    It is included only if its grade naturally
    falls among the six best grade numbers.
  */

  const english =
    resultRows.find(
      function(item){

        return isEnglishSubject(
          item.subject
        );

      }
    );


  const completeRows =
    resultRows.filter(
      function(item){

        return (
          item.calculation.percentage !== null
        );

      }
    );


  const gradedRows =
    completeRows
      .map(
        function(item){

          const grading =
            getSeniorGrade(
              item.calculation.percentage
            );


          return {

            ...item,

            grading:grading

          };

        }
      );


  const englishGrading =
    english &&
    english.calculation.percentage !== null
      ? getSeniorGrade(
          english.calculation.percentage
        )
      : null;


  const englishPassed =
    Boolean(
      englishGrading &&
      englishGrading.passed
    );


  if(!english){

    return {

      valid:false,

      passed:false,

      reason:
        "English result is required.",

      aggregate:null,

      selectedSubjects:[],

      englishPassed:false

    };

  }


  if(!englishGrading){

    return {

      valid:false,

      passed:false,

      reason:
        "English must be completed.",

      aggregate:null,

      selectedSubjects:[],

      englishPassed:false

    };

  }


  if(!englishPassed){

    return {

      valid:false,

      passed:false,

      reason:
        "English must be passed.",

      aggregate:null,

      selectedSubjects:[],

      englishPassed:false

    };

  }


  const passedRows =
    gradedRows.filter(
      function(item){

        return item.grading.passed;

      }
    );


  if(passedRows.length < 6){

    return {

      valid:false,

      passed:false,

      reason:
        "At least six passed subjects are required for the best-six aggregate.",

      aggregate:null,

      selectedSubjects:[],

      englishPassed:true

    };

  }


  /*
    Sort every passed subject by grade number.
    Lower number = better result.
  */

  const bestSix =
    [...passedRows]
      .sort(
        function(a,b){

          return (
            Number(a.grading.grade) -
            Number(b.grading.grade)
          );

        }
      )
      .slice(0,6);


  const aggregate =
    bestSix.reduce(
      function(total,item){

        return total +
          Number(
            item.grading.grade
          );

      },
      0
    );


  return {

    valid:true,

    passed:true,

    reason:
      "English passed.",

    aggregate:aggregate,

    selectedSubjects:bestSix,

    englishPassed:true

  };

}


/* =========================================================
   JUNIOR OVERALL CALCULATION
========================================================= */

function calculateJuniorOverall(
  resultRows
){

  const english =
    resultRows.find(
      function(item){

        return isEnglishSubject(
          item.subject
        );

      }
    );


  const completeRows =
    resultRows.filter(
      function(item){

        return (
          item.calculation.percentage !== null
        );

      }
    );


  const gradedRows =
    completeRows.map(
      function(item){

        return {

          ...item,

          grading:
            getJuniorGrade(
              item.calculation.percentage
            )

        };

      }
    );


  const passedRows =
    gradedRows.filter(
      function(item){

        return item.grading.passed;

      }
    );


  const englishGrading =
    english &&
    english.calculation.percentage !== null
      ? getJuniorGrade(
          english.calculation.percentage
        )
      : null;


  const englishPassed =
    Boolean(
      englishGrading &&
      englishGrading.passed
    );


  const passedCount =
    passedRows.length;


  const valid =
    passedCount >= 6 &&
    englishPassed;


  let reason;


  if(!englishGrading){

    reason =
      "English must be completed.";

  }else if(!englishPassed){

    reason =
      "English must be passed.";

  }else if(passedCount < 6){

    reason =
      "At least six subjects must be passed.";

  }else{

    reason =
      "Minimum junior pass requirements met.";

  }


  return {

    valid:valid,

    passed:valid,

    reason:reason,

    passedCount:passedCount,

    englishPassed:englishPassed,

    selectedSubjects:passedRows

  };

}


/* =========================================================
   CALCULATE OVERALL
========================================================= */

function calculateOverall(
  resultRows,
  student
){

  const form =
    getStudentFormNumber(
      student
    );


  if(form >= 3){

    return {

      type:"senior",

      ...calculateSeniorOverall(
        resultRows
      )

    };

  }


  return {

    type:"junior",

    ...calculateJuniorOverall(
      resultRows
    )

  };

}


/* =========================================================
   RENDER OVERALL RESULTS
========================================================= */

function renderOverallResults(){

  if(!selectedStudent){

    return;

  }


  const name =
    getStudentName(
      selectedStudent
    );


  const subjects =
    getSubjectsForStudent(
      selectedStudent
    );


  const resultRows =
    subjects.map(
      function(subject){

        const subjectId =
          getDatabaseId(
            subject
          );


        const result =
          currentStudentResults.find(
            function(item){

              return String(
                item.subject_id
              ) === String(
                subjectId
              );

            }
          );


        const papers =
          getPaperStructure(
            subject,
            selectedStudent
          );


        const values =
          getExistingPaperValues(
            result,
            papers
          );


        const calculation =
          calculateSubjectPercentage(
            papers,
            values
          );


        const grading =
          getSubjectGrading(
            calculation.percentage,
            selectedStudent
          );


        return {

          subject:subject,

          result:result,

          papers:papers,

          values:values,

          calculation:calculation,

          grading:grading

        };

      }
    );


  dom.studentName.textContent =
    name;


  dom.studentId.textContent =
    getStudentId(
      selectedStudent
    );


  dom.studentClass.textContent =
    getClassName(
      selectedClass
    );


  dom.studentGender.textContent =
    getStudentGender(
      selectedStudent
    );


  dom.studentSubjectCount.textContent =
    subjects.length;


  /*
    Average percentage remains a weighted
    average of completed papers.
  */

  const completeRows =
    resultRows.filter(
      function(item){

        return (
          item.calculation.percentage !== null
        );

      }
    );


  let overallPercentage =
    null;


  if(completeRows.length){

    let totalObtained = 0;
    let totalMaximum = 0;


    completeRows.forEach(
      function(item){

        totalObtained +=
          item.calculation.obtained;

        totalMaximum +=
          item.calculation.maximum;

      }
    );


    if(totalMaximum > 0){

      overallPercentage =
        Math.round(
          totalObtained /
          totalMaximum *
          100
        );

    }

  }


  dom.studentAverage.textContent =
    overallPercentage === null
      ? "—"
      : overallPercentage +
        "%";


  dom.overallResultsBody.innerHTML =
    "";


  if(!resultRows.length){

    dom.overallResultsBody.innerHTML = `

      <tr>

        <td colspan="6">

          <div class="table-loading">
            No subjects found.
          </div>

        </td>

      </tr>

    `;


    dom.overallResult.textContent =
      "NO RESULTS";

    dom.overallResultDetails.textContent =
      "No subjects are available.";

    return;

  }


  resultRows.forEach(
    function(item,index){

      const grading =
        item.grading;


      const row =
        document.createElement(
          "tr"
        );


      const papersHtml =
        item.papers
          .map(
            function(paper,paperIndex){

              const value =
                item.values[
                  paperIndex
                ];


              return `

                <div class="overall-paper">

                  <strong>
                    ${escapeHtml(
                      paper.name
                    )}
                  </strong>

                  <span>
                    ${
                      value === "" ||
                      value === null ||
                      value === undefined
                        ? "—"
                        : escapeHtml(
                            String(value)
                          )
                    }
                    /
                    ${paper.max}
                  </span>

                </div>

              `;

            }
          )
          .join("");


      row.innerHTML = `

        <td>
          ${index + 1}
        </td>


        <td>

          <strong>
            ${escapeHtml(
              getSubjectName(
                item.subject
              )
            )}
          </strong>

        </td>


        <td>

          <div class="overall-paper-list">
            ${papersHtml}
          </div>

        </td>


        <td class="overall-percentage">

          ${
            item.calculation.percentage === null
              ? "—"
              : item.calculation.percentage +
                "%"
          }

        </td>


        <td class="overall-grade">

          ${
            grading
              ? escapeHtml(
                  String(
                    grading.grade
                  )
                )
              : "—"
          }

        </td>


        <td class="overall-classification">

          ${
            grading
              ? escapeHtml(
                  grading.remark
                )
              : "Not entered"
          }

        </td>

      `;


      dom.overallResultsBody.appendChild(
        row
      );

    }
  );


  const overall =
    calculateOverall(
      resultRows,
      selectedStudent
    );


  renderOverallSummary(
    overall,
    overallPercentage
  );

}


/* =========================================================
   RENDER OVERALL SUMMARY
========================================================= */

function renderOverallSummary(
  overall,
  average
){

  if(overall.type === "senior"){

    if(
      overall.valid &&
      overall.aggregate !== null
    ){

      dom.overallResult.textContent =
        "PASS — AGGREGATE " +
        overall.aggregate;


      dom.overallResultDetails.textContent =
        "Best six aggregate. English passed and was included only if it was among the six best grades.";

      return;

    }


    dom.overallResult.textContent =
      "NOT QUALIFIED";


    dom.overallResultDetails.textContent =
      overall.reason;

    return;

  }


  /*
    Junior.
  */

  if(overall.valid){

    dom.overallResult.textContent =
      "PASS";


    dom.overallResultDetails.textContent =
      overall.passedCount +
      " subjects passed and English passed.";

    return;

  }


  dom.overallResult.textContent =
    "FAIL";


  dom.overallResultDetails.textContent =
    overall.reason;

}


/* =========================================================
   SAVE RESULTS
========================================================= */

async function saveResults(
  showMessage = true
){

  if(!selectedStudent){

    throw new Error(
      "No student has been selected."
    );

  }


  const rows =
    Array.from(
      dom.resultsEntryBody
        .querySelectorAll(
          "tr[data-subject-id]"
        )
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
    getDatabaseId(
      selectedStudent
    );


  const records = [];


  for(
    const row of rows
  ){

    const subjectId =
      row.dataset.subjectId;


    const subject =
      findSubjectById(
        subjectId
      );


    const papers =
      getPaperStructure(
        subject,
        selectedStudent
      );


    const paperInputs =
      Array.from(
        row.querySelectorAll(
          ".paper-mark-input"
        )
      );


    const values = [];


    let invalid =
      false;


    let hasAnyMark =
      false;


    paperInputs.forEach(
      function(input,index){

        const raw =
          input.value.trim();


        if(raw === ""){

          values.push(null);

          return;

        }


        hasAnyMark = true;


        const value =
          Number(raw);


        if(
          Number.isNaN(value) ||
          value < 0 ||
          value > papers[index].max
        ){

          invalid = true;

          input.classList.add(
            "invalid"
          );

          return;

        }


        input.classList.remove(
          "invalid"
        );


        values.push(
          value
        );

      }
    );


    if(invalid){

      dom.saveResultsBtn.disabled =
        false;

      dom.saveResultsBtn.textContent =
        "Save Results";


      showSaveMessage(
        "One or more paper marks are invalid. Check the maximum mark shown for each paper.",
        "error"
      );


      throw new Error(
        "Invalid paper mark."
      );

    }


    /*
      Completely empty subject:
      do not save it.
    */

    if(!hasAnyMark){

      continue;

    }


    /*
      Every paper must be completed.
    */

    if(
      values.some(
        function(value){

          return (
            value === null ||
            value === undefined
          );

        }
      )
    ){

      dom.saveResultsBtn.disabled =
        false;

      dom.saveResultsBtn.textContent =
        "Save Results";


      showSaveMessage(
        "Please enter marks for every paper before saving the subject.",
        "error"
      );


      throw new Error(
        "Incomplete paper marks."
      );

    }


    const calculation =
      calculateSubjectPercentage(
        papers,
        values
      );


    if(
      calculation.percentage === null
    ){

      throw new Error(
        "Could not calculate subject percentage."
      );

    }


    const grading =
      getSubjectGrading(
        calculation.percentage,
        selectedStudent
      );


    const remark =
      grading
        ? grading.remark
        : "";


    /*
      Store the rounded percentage.

      The grade is also included in the
      preferred record. If the existing
      results table does not have a grade
      column, the compatibility fallback
      below saves without it.
    */

    records.push({

      student_id:
        studentId,

      subject_id:
        subjectId,

      mark:
        calculation.percentage,

      grade:
        grading
          ? grading.grade
          : null,

      remark:
        remark,

      paper_marks:
        values

    });

  }


  try{

    if(records.length){

      await upsertResults(
        records
      );

    }


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
   UPSERT RESULTS
========================================================= */

async function upsertResults(
  records
){

  /*
    First attempt:
    grade + paper_marks.
  */

  let result =
    await db
      .from("results")
      .upsert(
        records,
        {
          onConflict:
            "student_id,subject_id"
        }
      );


  if(!result.error){

    return;

  }


  console.warn(
    "Full result save failed. Trying compatibility save:",
    result.error
  );


  /*
    Second attempt:
    grade without paper_marks.
  */

  const gradeRecords =
    records.map(
      function(record){

        return {

          student_id:
            record.student_id,

          subject_id:
            record.subject_id,

          mark:
            record.mark,

          grade:
            record.grade,

          remark:
            record.remark

        };

      }
    );


  result =
    await db
      .from("results")
      .upsert(
        gradeRecords,
        {
          onConflict:
            "student_id,subject_id"
        }
      );


  if(!result.error){

    showGlobalMessage(
      "Results saved. Paper marks could not be stored because the results table does not have the paper_marks column.",
      "error"
    );

    return;

  }


  /*
    Third attempt:
    original compatible schema.
  */

  const oldRecords =
    records.map(
      function(record){

        return {

          student_id:
            record.student_id,

          subject_id:
            record.subject_id,

          mark:
            record.mark,

          remark:
            record.remark

        };

      }
    );


  result =
    await db
      .from("results")
      .upsert(
        oldRecords,
        {
          onConflict:
            "student_id,subject_id"
        }
      );


  if(result.error){

    throw result.error;

  }


  showGlobalMessage(
    "Results saved using the existing results table structure.",
    "success"
  );

}


/* =========================================================
   OPEN OVERALL
========================================================= */

async function openStudentOverall(
  student
){

  selectedStudent =
    student;


  try{

    await loadStudentResults();

  }catch(error){

    console.error(error);

  }


  renderOverallResults();

  showView(
    "overall"
  );

}


/* =========================================================
   NAVIGATION
========================================================= */

function showClasses(){

  showView(
    "classes"
  );

}


function showStudents(){

  if(selectedClass){

    renderStudents();

  }


  showView(
    "students"
  );

}


function showEntry(){

  if(selectedStudent){

    renderEntryStudentInformation();

    renderResultEntry();

  }


  showView(
    "entry"
  );

}


function showOverall(){

  renderOverallResults();

  showView(
    "overall"
  );

}


/* =========================================================
   SHOW VIEW
========================================================= */

function showView(
  view
){

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
      5000
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

    ${escapeHtml(
      message
    )}

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

    filename:
      fileName,

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
   SUBJECT HELPERS
========================================================= */

function isEnglishSubject(
  subject
){

  return (
    getSubjectName(
      subject
    )
      .trim()
      .toLowerCase()
      ===
    "english"
  );

}


function findSubjectById(
  subjectId
){

  return allSubjects.find(
    function(subject){

      return String(
        getDatabaseId(
          subject
        )
      ) === String(
        subjectId
      );

    }
  );

}


/* =========================================================
   CLASS HELPERS
========================================================= */

function getStudentsForClass(
  classItem
){

  if(!classItem){

    return [];

  }


  const classId =
    getDatabaseId(
      classItem
    );


  const formNumber =
    classItem.form_number;


  return allStudents.filter(
    function(student){

      if(
        student.class_id !== undefined &&
        student.class_id !== null
      ){

        return String(
          student.class_id
        ) === String(
          classId
        );

      }


      if(
        student.form_number !== undefined &&
        student.form_number !== null
      ){

        return String(
          student.form_number
        ) === String(
          formNumber
        );

      }


      if(
        student.class_name &&
        getClassName(
          classItem
        )
      ){

        return (
          String(
            student.class_name
          )
            .toLowerCase()
            ===
          String(
            getClassName(
              classItem
            )
          )
            .toLowerCase()
        );

      }


      return false;

    }
  );

}


function getClassName(
  classItem
){

  if(!classItem){

    return "Class";

  }


  return (
    classItem.class_name ||
    classItem.name ||
    (
      classItem.form_number
        ? "Form " +
          classItem.form_number
        : "Class"
    )
  );

}


function getClassCode(
  classItem
){

  if(!classItem){

    return "";

  }


  return (
    classItem.class_code ||
    classItem.code ||
    ""
  );

}


function getClassFormLabel(
  classItem
){

  if(
    classItem &&
    classItem.form_number
  ){

    return (
      "FORM " +
      classItem.form_number
    );

  }


  return "CLASS";

}


function getClassInitial(
  classItem
){

  const form =
    classItem &&
    classItem.form_number;


  if(form){

    return String(
      form
    );

  }


  return "C";

}


/* =========================================================
   STUDENT HELPERS
========================================================= */

function getStudentName(
  student
){

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


function getStudentId(
  student
){

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


function getStudentGender(
  student
){

  if(!student){

    return "—";

  }


  return (
    student.gender ||
    "—"
  );

}


/* =========================================================
   FORM HELPERS
========================================================= */

function getStudentFormNumber(
  student
){

  if(!student){

    return null;

  }


  const value =
    student.form_number ??
    student.form ??
    student.class_form;


  const number =
    Number(
      value
    );


  return Number.isFinite(number)
    ? number
    : null;

}


function getSubjectFormNumber(
  subject
){

  if(!subject){

    return null;

  }


  const value =
    subject.form_number ??
    subject.form ??
    subject.class_form;


  const number =
    Number(
      value
    );


  return Number.isFinite(number)
    ? number
    : null;

}


/* =========================================================
   SUBJECT HELPERS
========================================================= */

function getSubjectName(
  subject
){

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

function getDatabaseId(
  record
){

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
   ROMAN NUMBERS
========================================================= */

function romanNumber(
  number
){

  const values = [

    [10,"X"],

    [9,"IX"],

    [5,"V"],

    [4,"IV"],

    [1,"I"]

  ];


  let result = "";

  let value =
    Number(number);


  values.forEach(
    function(item){

      while(
        value >= item[0]
      ){

        result +=
          item[1];

        value -=
          item[0];

      }

    }
  );


  return result;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
  value
){

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

function escapeAttribute(
  value
){

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

function getInitials(
  name
){

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
    words[
      words.length - 1
    ][0]
  ).toUpperCase();

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function getErrorMessage(
  error
){

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