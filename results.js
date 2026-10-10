
"use strict";

/* =========================================================
   FIRST CLASS ACADEMY — RESULTS MANAGEMENT

   CLASS → STUDENTS → ENTER RESULTS → OVERALL RESULTS

   Forms 1–2: A–F
   Forms 3–4: Grades 1–9
========================================================= */

const SUBJECTS_FALLBACK = [
  "Agriculture", "Bible Knowledge", "Biology", "Chemistry",
  "Chichewa", "English", "Geography", "History", "Life Skills",
  "Mathematics", "Physics", "Social Studies"
];

const DEFAULT_PAPER_STRUCTURES = {
  English: {
    junior: [{name:"Paper I",max:50},{name:"Paper II",max:50}],
    senior: [{name:"Paper I",max:70},{name:"Paper II",max:60},{name:"Paper III",max:70}]
  },
  Chichewa: {
    junior: [{name:"Paper I",max:50},{name:"Paper II",max:50}],
    senior: [{name:"Paper I",max:70},{name:"Paper II",max:60},{name:"Paper III",max:70}]
  },
  Mathematics: {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:100},{name:"Paper II",max:100}]
  },
  Geography: {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:100},{name:"Paper II",max:100}]
  },
  Biology: {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:100},{name:"Paper II",max:40}]
  },
  Agriculture: {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:100},{name:"Paper II",max:40}]
  },
  Chemistry: {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:100},{name:"Paper II",max:40}]
  },
  Physics: {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:100},{name:"Paper II",max:40}]
  },
  History: {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:50},{name:"Paper II",max:120}]
  },
  "Bible Knowledge": {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:50},{name:"Paper II",max:120}]
  },
  "Social Studies": {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:50},{name:"Paper II",max:100}]
  },
  "Life Skills": {
    junior: [{name:"Paper I",max:100}],
    senior: [{name:"Paper I",max:50},{name:"Paper II",max:100}]
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

document.addEventListener("DOMContentLoaded", init);

/* =========================================================
   INITIALIZATION
========================================================= */

async function init() {
  cacheDom();
  db = window.fcaSupabase;

  if (!db) {
    showGlobalMessage(
      "FCA Supabase client was not found. Check config.js.",
      "error"
    );
    return;
  }

  attachEvents();

  try {
    await loadInitialData();
  } catch (error) {
    console.error("FCA Results initialization error:", error);
    showGlobalMessage(getErrorMessage(error), "error");
  }
}

function cacheDom() {
  [
    "classesView", "studentsView", "entryView", "overallView",
    "classesGrid", "studentsGrid", "selectedClassTitle",
    "selectedClassDescription", "entryStudentAvatar",
    "entryStudentName", "entryStudentId", "entryStudentClass",
    "entryStudentGender", "entryStudentSubtitle",
    "gradingInformation", "resultsEntryBody",
    "resultsEntrySection", "addResultsBtn", "subjectCount",
    "studentName", "studentId", "studentClass", "studentGender",
    "studentSubjectCount", "studentPosition", "overallResultsBody",
    "overallResult", "overallResultDetails", "saveResultsBtn",
    "saveMessage", "globalMessage"
  ].forEach(id => {
    dom[id] = document.getElementById(id);
  });
}

/* =========================================================
   SHOW / HIDE RESULTS ENTRY
========================================================= */

function hideResultsEntry() {
  dom.resultsEntrySection?.classList.add("hidden");

  if (dom.addResultsBtn) {
    dom.addResultsBtn.classList.remove("hidden");
    dom.addResultsBtn.textContent = "Add Results";
  }
}

function showResultsEntry() {
  dom.resultsEntrySection?.classList.remove("hidden");
  dom.addResultsBtn?.classList.add("hidden");
}

/* =========================================================
   EVENTS
========================================================= */

function attachEvents() {
  document.getElementById("backToClassesBtn")
    ?.addEventListener("click", showClasses);

  document.getElementById("backToStudentsBtn")
    ?.addEventListener("click", showStudents);

  document.getElementById("backToEntryBtn")
    ?.addEventListener("click", showEntry);

  document.getElementById("backToStudentsFromOverallBtn")
    ?.addEventListener("click", showStudents);

  document.getElementById("overallBackBtn")
    ?.addEventListener("click", showStudents);

  document.getElementById("viewOverallFromEntryBtn")
    ?.addEventListener("click", async () => {
      const saved = await saveResults(false);
      if (saved) {
        await loadStudentResults();
        showOverall();
      }
    });

  dom.addResultsBtn?.addEventListener("click", showResultsEntry);

  dom.saveResultsBtn?.addEventListener("click", () => {
    saveResults(true);
  });

  document.getElementById("downloadPdfBtn")
    ?.addEventListener("click", downloadResult);
}

/* =========================================================
   LOAD DATA
========================================================= */

async function loadInitialData() {
  await loadClasses();
  renderClasses();

  await Promise.all([
    loadStudents(),
    loadSubjects(),
    loadResults()
  ]);

  renderClasses();
}

async function loadClasses() {
  const {data,error} = await db
    .from("classes")
    .select("*")
    .order("form_number", {ascending:true,nullsFirst:false});

  if (error) throw error;
  allClasses = data || [];
}

async function loadStudents() {
  const {data,error} = await db.from("students").select("*");
  if (error) throw error;
  allStudents = data || [];
}

async function loadSubjects() {
  let result = await db
    .from("subjects")
    .select("*")
    .order("subject_name", {ascending:true});

  if (result.error) {
    result = await db.from("subjects").select("*");
  }

  if (result.error) {
    console.warn("Subjects could not be loaded.", result.error);
    allSubjects = [];
    return;
  }

  allSubjects = (result.data || []).sort((a,b) =>
    getSubjectName(a).localeCompare(getSubjectName(b))
  );
}

async function loadResults() {
  const {data,error} = await db.from("results").select("*");

  if (error) {
    console.warn("Results could not be loaded:", error);
    allResults = [];
    return;
  }

  allResults = data || [];
}

/* =========================================================
   RENDER CLASSES
========================================================= */

function renderClasses() {
  if (!dom.classesGrid) return;
  dom.classesGrid.innerHTML = "";

  if (!allClasses.length) {
    dom.classesGrid.innerHTML = `
      <div class="empty-state">
        <h3>No Classes Found</h3>
        <p>Create classes from the FCA Classes page before entering results.</p>
      </div>`;
    return;
  }

  allClasses.forEach(classItem => {
    const students = getStudentsForClass(classItem);
    const card = document.createElement("article");
    card.className = "class-result-card";

    card.innerHTML = `
      <div class="class-card-top">
        <div class="class-icon">${escapeHtml(getClassInitial(classItem))}</div>
        <div class="class-form">${escapeHtml(getClassFormLabel(classItem))}</div>
      </div>
      <h3>${escapeHtml(getClassName(classItem))}</h3>
      <div class="class-code">${escapeHtml(getClassCode(classItem))}</div>
      <div class="class-card-bottom">
        <span class="student-count">${students.length}
          ${students.length === 1 ? "Student" : "Students"}</span>
        <span class="open-class">View Students →</span>
      </div>`;

    card.addEventListener("click", () => openClass(classItem));
    dom.classesGrid.appendChild(card);
  });
}

function openClass(classItem) {
  selectedClass = classItem;
  dom.selectedClassTitle.textContent = getClassName(classItem);
  dom.selectedClassDescription.textContent =
    "Students in " + getClassName(classItem);

  renderStudents();
  showView("students");
}

/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents() {
  if (!dom.studentsGrid) return;
  dom.studentsGrid.innerHTML = "";
  if (!selectedClass) return;

  const students = getStudentsForClass(selectedClass);

  if (!students.length) {
    dom.studentsGrid.innerHTML = `
      <div class="empty-state">
        <h3>No Students Found</h3>
        <p>There are currently no students registered in
          ${escapeHtml(getClassName(selectedClass))}.</p>
      </div>`;
    return;
  }

  students.forEach(student => {
    const card = document.createElement("article");
    card.className = "student-result-card";

    card.innerHTML = `
      <div class="student-card-main">
        <div class="student-avatar">${escapeHtml(getInitials(getStudentName(student)))}</div>
        <div>
          <h3>${escapeHtml(getStudentName(student))}</h3>
          <div class="student-id">${escapeHtml(getStudentId(student))}</div>
        </div>
      </div>
      <div class="student-card-details">
        <span class="student-chip">Gender: ${escapeHtml(getStudentGender(student))}</span>
        <span class="student-chip">Class: ${escapeHtml(getClassName(selectedClass))}</span>
      </div>
      <div class="student-card-actions">
        <button type="button" class="primary-button enter-results-btn">Enter Results</button>
        <button type="button" class="secondary-button overall-results-btn">Overall Results</button>
      </div>`;

    card.querySelector(".enter-results-btn").addEventListener("click", event => {
      event.stopPropagation();
      openStudentEntry(student);
    });

    card.querySelector(".overall-results-btn").addEventListener("click", event => {
      event.stopPropagation();
      openStudentOverall(student);
    });

    dom.studentsGrid.appendChild(card);
  });
}

/* =========================================================
   STUDENT ENTRY
========================================================= */

async function openStudentEntry(student) {
  selectedStudent = student;
  showResultsEntry();
  renderEntryStudentInformation();

  dom.resultsEntryBody.innerHTML = `
    <tr><td colspan="7"><div class="table-loading">Loading subjects...</div></td></tr>`;

  showView("entry");

  try {
    await loadStudentResults();
    renderResultEntry();
  } catch (error) {
    console.error(error);
    dom.resultsEntryBody.innerHTML = `
      <tr><td colspan="7"><div class="table-loading">Could not load student results.</div></td></tr>`;
    showGlobalMessage(getErrorMessage(error), "error");
  }
}

function renderEntryStudentInformation() {
  if (!selectedStudent) return;

  const name = getStudentName(selectedStudent);
  const form = getEffectiveFormNumber(selectedStudent);

  dom.entryStudentName.textContent = name;
  dom.entryStudentId.textContent = getStudentId(selectedStudent);
  dom.entryStudentGender.textContent = getStudentGender(selectedStudent);
  dom.entryStudentClass.textContent = getClassName(selectedClass);
  dom.entryStudentSubtitle.textContent = "Enter academic results for " + name;
  dom.entryStudentAvatar.textContent = getInitials(name);

  dom.gradingInformation.textContent = form >= 3
    ? "Senior grading: 80–100 Grade 1, 70–79 Grade 2, 65–69 Grade 3, 60–64 Grade 4, 55–59 Grade 5, 50–54 Grade 6, 45–49 Grade 7, 40–44 Grade 8, 0–39 Grade 9. English must be passed but is not forced into the best-six aggregate."
    : "Junior grading: 75–100 A, 60–74 B, 50–59 C, 40–49 D, 0–39 F. Overall pass requires at least six passed subjects and English must be passed.";
}

async function loadStudentResults() {
  if (!selectedStudent) return;

  const studentId = getDatabaseId(selectedStudent);

  currentStudentResults = allResults.filter(result =>
    String(result.student_id) === String(studentId)
  );

  const {data,error} = await db
    .from("results")
    .select("*")
    .eq("student_id", studentId);

  if (error) {
    console.warn("Could not refresh results:", error);
    return;
  }

  currentStudentResults = data || [];

  allResults = allResults.filter(item =>
    String(item.student_id) !== String(studentId)
  ).concat(currentStudentResults);
}

/* =========================================================
   RENDER RESULT ENTRY
========================================================= */

function renderResultEntry() {
  const subjects = getSubjectsForStudent(selectedStudent);
  dom.subjectCount.textContent = subjects.length;
  dom.resultsEntryBody.innerHTML = "";

  if (!subjects.length) {
    dom.resultsEntryBody.innerHTML = `
      <tr><td colspan="7"><div class="table-loading">
        No subjects have been assigned to this student.
      </div></td></tr>`;
    return;
  }

  subjects.forEach((subject,index) => {
    const subjectId = getDatabaseId(subject);
    const existing = currentStudentResults.find(result =>
      String(result.subject_id) === String(subjectId)
    );

    const papers = getPaperStructure(subject, selectedStudent);
    const paperValues = getExistingPaperValues(existing, papers);
    const calculation = calculateSubjectPercentage(papers, paperValues);
    const grading = getSubjectGrading(calculation.percentage, selectedStudent);

    const row = document.createElement("tr");
    row.dataset.subjectId = subjectId;

    row.innerHTML = `
      <td>${index + 1}</td>
      <td class="subject-name">${escapeHtml(getSubjectName(subject))}</td>
      <td>
        <div class="paper-list">
          ${papers.map((paper,paperIndex) => `
            <div class="paper-row">
              <span class="paper-label">${escapeHtml(paper.name)}</span>
              <span class="paper-max">/ ${paper.max}</span>
              <input type="number" class="paper-mark-input"
                data-paper-index="${paperIndex}" min="0"
                max="${paper.max}" step="1"
                value="${escapeAttribute(paperValues[paperIndex] ?? "")}"
                placeholder="0"
                aria-label="${escapeAttribute(paper.name + " mark")}">
            </div>`).join("")}
          <div class="paper-total">Total:
            <span class="paper-obtained">${calculation.obtained}</span> /
            <span class="paper-maximum">${calculation.maximum}</span>
          </div>
        </div>
      </td>
      <td class="percentage-cell">
        <div class="percentage-value">${calculation.percentage === null ? "—" : calculation.percentage + "%"}</div>
        <div class="percentage-detail">${calculation.percentage === null ? "No complete marks" : calculation.obtained + " / " + calculation.maximum}</div>
      </td>
      <td><div class="grade-value">${grading ? escapeHtml(String(grading.grade)) : "—"}</div></td>
      <td><div class="classification-value">${grading ? escapeHtml(grading.remark) : "—"}</div></td>
      <td><span class="result-status ${!grading ? "status-empty" : grading.passed ? "status-pass" : "status-fail"}">${!grading ? "—" : grading.passed ? "Pass" : "Fail"}</span></td>`;

    const inputs = Array.from(row.querySelectorAll(".paper-mark-input"));
    const els = {
      percentage:row.querySelector(".percentage-value"),
      detail:row.querySelector(".percentage-detail"),
      obtained:row.querySelector(".paper-obtained"),
      maximum:row.querySelector(".paper-maximum"),
      grade:row.querySelector(".grade-value"),
      classification:row.querySelector(".classification-value"),
      status:row.querySelector(".result-status")
    };

    inputs.forEach(input => input.addEventListener("input", () => {
      updateSubjectRow(row, papers, inputs, els);
    }));

    dom.resultsEntryBody.appendChild(row);
  });
}

function updateSubjectRow(row,papers,inputs,els) {
  let invalid = false;

  const values = inputs.map((input,index) => {
    const raw = input.value.trim();
    if (raw === "") {
      input.classList.remove("invalid");
      return null;
    }

    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 ||
        value > papers[index].max) {
      input.classList.add("invalid");
      invalid = true;
      return null;
    }

    input.classList.remove("invalid");
    return value;
  });

  if (invalid) {
    els.percentage.textContent = "Invalid";
    els.detail.textContent = "Check paper marks";
    els.obtained.textContent = "—";
    els.maximum.textContent = "—";
    els.grade.textContent = "—";
    els.classification.textContent = "Invalid";
    els.status.textContent = "Invalid";
    els.status.className = "result-status status-invalid";
    return;
  }

  const calculation = calculateSubjectPercentage(papers, values);
  els.obtained.textContent = calculation.obtained;
  els.maximum.textContent = calculation.maximum;

  if (calculation.percentage === null) {
    els.percentage.textContent = "—";
    els.detail.textContent = "Complete all papers";
    els.grade.textContent = "—";
    els.classification.textContent = "—";
    els.status.textContent = "—";
    els.status.className = "result-status status-empty";
    return;
  }

  els.percentage.textContent = calculation.percentage + "%";
  els.detail.textContent = calculation.obtained + " / " + calculation.maximum;

  const grading = getSubjectGrading(calculation.percentage, selectedStudent);
  els.grade.textContent = grading ? grading.grade : "—";
  els.classification.textContent = grading ? grading.remark : "—";
  els.status.textContent = grading ? (grading.passed ? "Pass" : "Fail") : "—";
  els.status.className = "result-status " +
    (grading ? (grading.passed ? "status-pass" : "status-fail") : "status-empty");
}

/* =========================================================
   SUBJECT PERCENTAGE AND GRADING
========================================================= */

function calculateSubjectPercentage(papers,values) {
  const maximum = papers.reduce((sum,paper) => sum + Number(paper.max), 0);
  const entered = values.filter(value =>
    value !== null && value !== undefined && value !== "" &&
    Number.isFinite(Number(value))
  );

  const obtained = entered.reduce((sum,value) => sum + Number(value), 0);

  if (!entered.length || entered.length !== papers.length) {
    return {obtained,maximum,percentage:null};
  }

  return {
    obtained,
    maximum,
    percentage:maximum > 0 ? Math.round(obtained / maximum * 100) : 0
  };
}

function getSeniorGrade(percentage) {
  const value = Number(percentage);

  if (value >= 80) return {grade:1,remark:"Pass with Distinction (Outstanding)",passed:true};
  if (value >= 70) return {grade:2,remark:"Pass with Distinction (Excellent)",passed:true};
  if (value >= 65) return {grade:3,remark:"Pass with Credit (Good)",passed:true};
  if (value >= 60) return {grade:4,remark:"Pass with Credit (Competent)",passed:true};
  if (value >= 55) return {grade:5,remark:"Pass with Credit (Satisfactory)",passed:true};
  if (value >= 50) return {grade:6,remark:"Pass with Credit (Minimum Credit)",passed:true};
  if (value >= 45) return {grade:7,remark:"Ordinary Pass",passed:true};
  if (value >= 40) return {grade:8,remark:"Ordinary Pass",passed:true};
  return {grade:9,remark:"Fail",passed:false};
}

function getJuniorGrade(percentage) {
  const value = Number(percentage);

  if (value >= 75) return {grade:"A",remark:"Excellent / Distinction",passed:true};
  if (value >= 60) return {grade:"B",remark:"Very Good",passed:true};
  if (value >= 50) return {grade:"C",remark:"Good",passed:true};
  if (value >= 40) return {grade:"D",remark:"Average / Pass",passed:true};
  return {grade:"F",remark:"Fail",passed:false};
}

function getSubjectGrading(percentage,student) {
  if (percentage === null || percentage === undefined) return null;
  return getEffectiveFormNumber(student) >= 3
    ? getSeniorGrade(percentage)
    : getJuniorGrade(percentage);
}

function getPaperStructure(subject,student) {
  const stored = extractStoredPapers(subject);
  if (stored.length) return stored;

  const structure = DEFAULT_PAPER_STRUCTURES[getSubjectName(subject)];
  if (!structure) return [{name:"Paper I",max:100}];

  return getEffectiveFormNumber(student) >= 3
    ? structure.senior
    : structure.junior;
}

function extractStoredPapers(subject) {
  if (!subject) return [];

  const fields = [
    "papers","paper_structure","paper_marks","mark_structure",
    "paper_config","assessment_structure"
  ];

  for (const field of fields) {
    let value = subject[field];
    if (value === null || value === undefined) continue;

    if (typeof value === "string") {
      try { value = JSON.parse(value); } catch { continue; }
    }

    if (!Array.isArray(value)) continue;

    const normalized = value.map((item,index) => {
      if (typeof item === "number") {
        return {name:"Paper " + romanNumber(index + 1),max:item};
      }

      if (item && typeof item === "object") {
        const max = Number(
          item.max_marks ?? item.maximum_marks ?? item.max ??
          item.marks ?? item.total ?? 100
        );

        return {
          name:item.paper_name || item.name || item.paper ||
            ("Paper " + romanNumber(index + 1)),
          max:Number.isFinite(max) ? max : 100
        };
      }

      return null;
    }).filter(Boolean);

    if (normalized.length) return normalized;
  }

  return [];
}

function getExistingPaperValues(result,papers) {
  if (!result) return papers.map(() => "");

  for (const field of [
    "paper_marks","papers","marks_by_paper","paper_results","paper_scores"
  ]) {
    let value = result[field];
    if (value === null || value === undefined) continue;

    if (typeof value === "string") {
      try { value = JSON.parse(value); } catch { continue; }
    }

    if (Array.isArray(value)) {
      return papers.map((paper,index) => {
        const item = value[index];
        if (item === null || item === undefined) return "";
        if (typeof item === "number") return item;
        if (typeof item === "object") return item.mark ?? item.value ?? "";
        return "";
      });
    }

    if (value && typeof value === "object") {
      return papers.map((paper,index) => {
        for (const key of [
          paper.name,String(index),String(index + 1),"paper" + (index + 1)
        ]) {
          if (value[key] !== undefined) return value[key];
        }
        return "";
      });
    }
  }

  if (result.mark !== null && result.mark !== undefined && papers.length === 1) {
    const mark = Number(result.mark);
    if (Number.isFinite(mark)) return [mark];
  }

  return papers.map(() => "");
}

/* =========================================================
   STUDENT SUBJECT ASSIGNMENTS
========================================================= */

function getSubjectsForStudent(student) {
  if (!student) return [];

  const selectedValues = extractStudentSubjectIds(student);
  if (!selectedValues.length) return [];

  const studentForm = getEffectiveFormNumber(student);

  const assigned = allSubjects.filter(subject => {
    const subjectForm = getSubjectFormNumber(subject);

    if (subjectForm !== null && Number(subjectForm) !== studentForm) {
      return false;
    }

    const subjectId = getDatabaseId(subject);
    const subjectName = getSubjectName(subject).trim().toLowerCase();

    return selectedValues.some(value => {
      if (value && typeof value === "object") {
        const valueId = value.id || value.subject_id;
        const valueName = value.subject_name || value.name || value.subject;

        if (valueId && subjectId && String(valueId) === String(subjectId)) {
          return true;
        }

        return valueName
          ? String(valueName).trim().toLowerCase() === subjectName
          : false;
      }

      if (subjectId && String(value) === String(subjectId)) return true;
      return String(value).trim().toLowerCase() === subjectName;
    });
  });

  const seen = new Set();

  return assigned.filter(subject => {
    const key = getSubjectName(subject).trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a,b) => getSubjectName(a).localeCompare(getSubjectName(b)));
}

function extractStudentSubjectIds(student) {
  for (const field of [
    "subject_ids","subjects","selected_subjects","subjects_taken"
  ]) {
    let value = student[field];
    if (value === null || value === undefined) continue;

    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        value = value.split(",").map(item => item.trim()).filter(Boolean);
      }
    }

    if (Array.isArray(value)) {
      return value.map(item => {
        if (item && typeof item === "object") {
          return item.id || item.subject_id || item.subject_name ||
            item.name || item.subject;
        }
        return item;
      }).filter(Boolean);
    }
  }

  return [];
}

/* =========================================================
   OVERALL CALCULATIONS
========================================================= */

function isEnglishSubject(subject) {
  return getSubjectName(subject).trim().toLowerCase() === "english";
}

function calculateSeniorOverall(resultRows) {
  const english = resultRows.find(item => isEnglishSubject(item.subject));

  if (!english || english.calculation.percentage === null) {
    return {
      valid:false,passed:false,
      reason:english ? "English must be completed." : "English result is required.",
      aggregate:null,selectedSubjects:[],englishPassed:false
    };
  }

  const englishGrade = getSeniorGrade(english.calculation.percentage);

  if (!englishGrade.passed) {
    return {
      valid:false,passed:false,reason:"English must be passed.",
      aggregate:null,selectedSubjects:[],englishPassed:false
    };
  }

  const passedRows = resultRows
    .filter(item => item.calculation.percentage !== null)
    .map(item => ({
      ...item,
      grading:getSeniorGrade(item.calculation.percentage)
    }))
    .filter(item => item.grading.passed);

  if (passedRows.length < 6) {
    return {
      valid:false,passed:false,
      reason:"At least six passed subjects are required for the best-six aggregate.",
      aggregate:null,selectedSubjects:[],englishPassed:true
    };
  }

  const selectedSubjects = [...passedRows]
    .sort((a,b) => Number(a.grading.grade) - Number(b.grading.grade))
    .slice(0,6);

  const aggregate = selectedSubjects.reduce(
    (sum,item) => sum + Number(item.grading.grade),0
  );

  return {
    valid:true,passed:true,reason:"English passed.",
    aggregate,selectedSubjects,englishPassed:true
  };
}

function calculateJuniorOverall(resultRows) {
  const english = resultRows.find(item => isEnglishSubject(item.subject));

  const gradedRows = resultRows
    .filter(item => item.calculation.percentage !== null)
    .map(item => ({
      ...item,
      grading:getJuniorGrade(item.calculation.percentage)
    }));

  const passedRows = gradedRows.filter(item => item.grading.passed);

  const englishGrade = english && english.calculation.percentage !== null
    ? getJuniorGrade(english.calculation.percentage)
    : null;

  const englishPassed = Boolean(englishGrade && englishGrade.passed);
  const valid = passedRows.length >= 6 && englishPassed;

  let reason = "Minimum junior pass requirements met.";
  if (!englishGrade) reason = "English must be completed.";
  else if (!englishPassed) reason = "English must be passed.";
  else if (passedRows.length < 6) reason = "At least six subjects must be passed.";

  return {
    valid,passed:valid,reason,
    passedCount:passedRows.length,
    englishPassed,
    selectedSubjects:passedRows
  };
}

function calculateOverall(resultRows,student) {
  if (getEffectiveFormNumber(student) >= 3) {
    return {type:"senior",...calculateSeniorOverall(resultRows)};
  }

  return {type:"junior",...calculateJuniorOverall(resultRows)};
}

/* =========================================================
   RENDER OVERALL RESULTS
========================================================= */

function renderOverallResults() {
  if (!selectedStudent) return;

  const subjects = getSubjectsForStudent(selectedStudent);

  const resultRows = subjects.map(subject => {
    const subjectId = getDatabaseId(subject);
    const result = currentStudentResults.find(item =>
      String(item.subject_id) === String(subjectId)
    );

    const papers = getPaperStructure(subject,selectedStudent);
    const values = getExistingPaperValues(result,papers);
    const calculation = calculateSubjectPercentage(papers,values);
    const grading = getSubjectGrading(calculation.percentage,selectedStudent);

    return {subject,result,papers,values,calculation,grading};
  });

  dom.studentName.textContent = getStudentName(selectedStudent);
  dom.studentId.textContent = getStudentId(selectedStudent);
  dom.studentClass.textContent = getClassName(selectedClass);
  dom.studentGender.textContent = getStudentGender(selectedStudent);
  dom.studentSubjectCount.textContent = subjects.length;

  dom.overallResultsBody.innerHTML = "";

  if (!resultRows.length) {
    dom.overallResultsBody.innerHTML = `
      <tr><td colspan="6"><div class="table-loading">No subjects found.</div></td></tr>`;
    dom.overallResult.textContent = "NO RESULTS";
    dom.overallResultDetails.textContent = "No subjects are available.";
    if (dom.studentPosition) {
      dom.studentPosition.textContent =
        "—/" + getStudentsForClass(selectedClass).length;
    }
    return;
  }

  resultRows.forEach((item,index) => {
    const row = document.createElement("tr");

    const papersHtml = item.papers.map((paper,paperIndex) => {
      const value = item.values[paperIndex];
      return `
        <div class="overall-paper">
          <strong>${escapeHtml(paper.name)}</strong>
          <span>${value === "" || value === null || value === undefined
            ? "—" : escapeHtml(String(value))}/${paper.max}</span>
        </div>`;
    }).join("");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${escapeHtml(getSubjectName(item.subject))}</strong></td>
      <td><div class="overall-paper-list">${papersHtml}</div></td>
      <td class="overall-percentage">${item.calculation.percentage === null
        ? "—" : item.calculation.percentage + "%"}</td>
      <td class="overall-grade">${item.grading
        ? escapeHtml(String(item.grading.grade)) : "—"}</td>
      <td class="overall-classification">${item.grading
        ? escapeHtml(item.grading.remark) : "Not entered"}</td>`;

    dom.overallResultsBody.appendChild(row);
  });

  const overall = calculateOverall(resultRows,selectedStudent);
  renderOverallSummary(overall);
  renderStudentPosition();
}

function renderOverallSummary(overall) {
  if (overall.type === "senior") {
    if (overall.valid && overall.aggregate !== null) {
      dom.overallResult.textContent =
        "PASS — " + overall.aggregate + " POINTS";
      dom.overallResultDetails.textContent = "Best six aggregate.";
      return;
    }

    dom.overallResult.textContent = "NOT QUALIFIED";
    dom.overallResultDetails.textContent = overall.reason;
    return;
  }

  if (overall.valid) {
    dom.overallResult.textContent = "PASS";
    dom.overallResultDetails.textContent =
      overall.passedCount + " subjects passed.";
    return;
  }

  dom.overallResult.textContent = "FAIL";
  dom.overallResultDetails.textContent = overall.reason;
}

/* =========================================================
   POSITION IN CLASS
========================================================= */

function getRankingGradeValue(grade,formNumber) {
  if (formNumber >= 3) {
    const value = Number(grade);
    return Number.isFinite(value) ? value : 99;
  }

  const order = {A:1,B:2,C:3,D:4,F:5};
  return order[String(grade).toUpperCase()] ?? 99;
}

function compareGradeLists(a,b,formNumber) {
  const length = Math.min(a.length,b.length);

  for (let i = 0; i < length; i++) {
    const difference =
      getRankingGradeValue(a[i],formNumber) -
      getRankingGradeValue(b[i],formNumber);

    if (difference !== 0) return difference;
  }

  return b.length - a.length;
}

function buildStudentRankingRecord(student) {
  const formNumber = getEffectiveFormNumber(student);
  const subjects = getSubjectsForStudent(student);
  const studentId = getDatabaseId(student);

  if (!subjects.length || studentId === null || studentId === undefined) {
    return null;
  }

  const savedResults = allResults.filter(result =>
    String(result.student_id) === String(studentId)
  );

  const rows = subjects.map(subject => {
    const subjectId = getDatabaseId(subject);

    const saved = savedResults.find(result =>
      String(result.subject_id) === String(subjectId)
    );

    const papers = getPaperStructure(subject,{
      ...student,
      form_number:formNumber
    });

    const values = getExistingPaperValues(saved,papers);
    const calculation = calculateSubjectPercentage(papers,values);

    if (calculation.percentage === null) return null;

    const grading = formNumber >= 3
      ? getSeniorGrade(calculation.percentage)
      : getJuniorGrade(calculation.percentage);

    return {subject,calculation,grading};
  }).filter(Boolean);

  // A student needs at least six completed subjects to be ranked.
  if (rows.length < 6) return null;

  if (formNumber >= 3) {
    const overall = calculateSeniorOverall(rows);

    // Senior students must have passed English and have six passed subjects.
    if (!overall.valid || overall.aggregate === null) return null;

    const bestSix = overall.selectedSubjects;
    const bestSixIds = new Set(
      bestSix.map(row => String(getDatabaseId(row.subject)))
    );

    const remainingGrades = rows
      .filter(row => !bestSixIds.has(String(getDatabaseId(row.subject))))
      .map(row => row.grading.grade)
      .sort((a,b) => Number(a) - Number(b));

    return {
      studentId:String(studentId),
      formNumber,
      aggregate:overall.aggregate,
      bestGrades:bestSix.map(row => row.grading.grade)
        .sort((a,b) => Number(a) - Number(b)),
      remainingGrades,
      overallPercentage:calculateRankingPercentage(rows)
    };
  }

  // Junior overall ranking requires English passed and at least six passes.
  const juniorOverall = calculateJuniorOverall(rows);

  if (!juniorOverall.valid) return null;

  const passedRows = rows.filter(row => row.grading.passed);

  const bestSix = [...passedRows]
    .sort((a,b) =>
      getRankingGradeValue(a.grading.grade,formNumber) -
      getRankingGradeValue(b.grading.grade,formNumber)
    )
    .slice(0,6);

  const bestIds = new Set(
    bestSix.map(row => String(getDatabaseId(row.subject)))
  );

  const remainingGrades = rows
    .filter(row => !bestIds.has(String(getDatabaseId(row.subject))))
    .map(row => row.grading.grade)
    .sort((a,b) =>
      getRankingGradeValue(a,formNumber) -
      getRankingGradeValue(b,formNumber)
    );

  return {
    studentId:String(studentId),
    formNumber,
    bestGrades:bestSix.map(row => row.grading.grade)
      .sort((a,b) =>
        getRankingGradeValue(a,formNumber) -
        getRankingGradeValue(b,formNumber)
      ),
    remainingGrades,
    overallPercentage:calculateRankingPercentage(rows)
  };
}

function calculateRankingPercentage(rows) {
  let obtained = 0;
  let maximum = 0;

  rows.forEach(row => {
    obtained += row.calculation.obtained;
    maximum += row.calculation.maximum;
  });

  return maximum > 0 ? obtained / maximum * 100 : 0;
}

function compareRankingRecords(a,b) {
  const senior = a.formNumber >= 3;

  if (senior && a.aggregate !== b.aggregate) {
    return a.aggregate - b.aggregate;
  }

  // When senior aggregates tie, compare grades in other subjects first.
  if (senior) {
    const remainingDifference =
      compareGradeLists(a.remainingGrades,b.remainingGrades,a.formNumber);

    if (remainingDifference !== 0) return remainingDifference;

    const bestDifference =
      compareGradeLists(a.bestGrades,b.bestGrades,a.formNumber);

    if (bestDifference !== 0) return bestDifference;
  } else {
    const bestDifference =
      compareGradeLists(a.bestGrades,b.bestGrades,a.formNumber);

    if (bestDifference !== 0) return bestDifference;

    const remainingDifference =
      compareGradeLists(a.remainingGrades,b.remainingGrades,a.formNumber);

    if (remainingDifference !== 0) return remainingDifference;
  }

  return b.overallPercentage - a.overallPercentage;
}

function renderStudentPosition() {
  if (!dom.studentPosition || !selectedStudent || !selectedClass) return;

  const classStudents = getStudentsForClass(selectedClass);
  const totalStudents = classStudents.length;
  const currentId = String(getDatabaseId(selectedStudent));

  const rankedStudents = classStudents
    .map(buildStudentRankingRecord)
    .filter(Boolean)
    .sort(compareRankingRecords);

  const currentIndex = rankedStudents.findIndex(record =>
    record.studentId === currentId
  );

  if (currentIndex === -1) {
    dom.studentPosition.textContent = "—/" + totalStudents;
    return;
  }

  // Competition ranking: tied students share a position.
  let position = 1;

  for (let i = 1; i <= currentIndex; i++) {
    if (compareRankingRecords(
      rankedStudents[i - 1],
      rankedStudents[currentIndex]
    ) !== 0) {
      position = i + 1;
    }
  }

  dom.studentPosition.textContent = position + "/" + totalStudents;
}

/* =========================================================
   SAVE RESULTS
========================================================= */

async function saveResults(showMessage = true) {
  if (!selectedStudent) {
    if (showMessage) showSaveMessage("No student has been selected.","error");
    return false;
  }

  const rows = Array.from(
    dom.resultsEntryBody.querySelectorAll("tr[data-subject-id]")
  );

  if (!rows.length) {
    if (showMessage) showSaveMessage("There are no subjects to save.","error");
    return false;
  }

  dom.saveResultsBtn.disabled = true;
  dom.saveResultsBtn.textContent = "Saving...";

  try {
    const studentId = getDatabaseId(selectedStudent);
    const records = [];

    for (const row of rows) {
      const subjectId = row.dataset.subjectId;
      const subject = findSubjectById(subjectId);
      const papers = getPaperStructure(subject,selectedStudent);
      const inputs = Array.from(row.querySelectorAll(".paper-mark-input"));

      const values = [];
      let invalid = false;
      let hasAnyMark = false;

      inputs.forEach((input,index) => {
        const raw = input.value.trim();

        if (raw === "") {
          values.push(null);
          return;
        }

        hasAnyMark = true;
        const value = Number(raw);

        if (!Number.isFinite(value) || value < 0 || value > papers[index].max) {
          invalid = true;
          input.classList.add("invalid");
          values.push(null);
        } else {
          input.classList.remove("invalid");
          values.push(value);
        }
      });

      if (invalid) {
        showSaveMessage(
          "One or more paper marks are invalid. Check the maximum mark for each paper.",
          "error"
        );
        return false;
      }

      if (!hasAnyMark) continue;

      if (values.some(value => value === null || value === undefined)) {
        showSaveMessage(
          "Please enter marks for every paper before saving the subject.",
          "error"
        );
        return false;
      }

      const calculation = calculateSubjectPercentage(papers,values);

      if (calculation.percentage === null) {
        showSaveMessage("Could not calculate the subject percentage.","error");
        return false;
      }

      const grading = getSubjectGrading(calculation.percentage,selectedStudent);

      records.push({
        student_id:studentId,
        subject_id:subjectId,
        mark:calculation.percentage,
        grade:grading ? grading.grade : null,
        remark:grading ? grading.remark : "",
        paper_marks:values
      });
    }

    if (!records.length) {
      if (showMessage) {
        showSaveMessage("Enter at least one subject's marks before saving.","error");
        return false;
      }

      await loadStudentResults();
      return true;
    }

    await upsertResults(records);
    await loadStudentResults();

    // Re-render ranking data using the newly saved marks.
    if (showMessage) {
      showSaveMessage("Results saved successfully.","success");
      hideResultsEntry();
    }

    return true;
  } catch (error) {
    console.error("Save results error:",error);
    if (showMessage) showSaveMessage(getErrorMessage(error),"error");
    return false;
  } finally {
    dom.saveResultsBtn.disabled = false;
    dom.saveResultsBtn.textContent = "Save Results";
  }
}

async function upsertResults(records) {
  let result = await db.from("results").upsert(records,{
    onConflict:"student_id,subject_id"
  });

  if (!result.error) return;

  console.warn("Full result save failed. Trying compatibility save:",result.error);

  const gradeRecords = records.map(record => ({
    student_id:record.student_id,
    subject_id:record.subject_id,
    mark:record.mark,
    grade:record.grade,
    remark:record.remark
  }));

  result = await db.from("results").upsert(gradeRecords,{
    onConflict:"student_id,subject_id"
  });

  if (!result.error) {
    showGlobalMessage(
      "Results saved, but paper marks could not be stored. Check whether the results table has a paper_marks column.",
      "error"
    );
    return;
  }

  const oldRecords = records.map(record => ({
    student_id:record.student_id,
    subject_id:record.subject_id,
    mark:record.mark,
    remark:record.remark
  }));

  result = await db.from("results").upsert(oldRecords,{
    onConflict:"student_id,subject_id"
  });

  if (result.error) throw result.error;

  showGlobalMessage(
    "Results saved using the existing results table structure.",
    "success"
  );
}

/* =========================================================
   OVERALL NAVIGATION
========================================================= */

async function openStudentOverall(student) {
  selectedStudent = student;

  try {
    await loadStudentResults();
  } catch (error) {
    console.error(error);
  }

  renderOverallResults();
  showView("overall");
}

function showClasses() {
  showView("classes");
}

function showStudents() {
  if (selectedClass) renderStudents();
  showView("students");
}

function showEntry() {
  if (selectedStudent) {
    renderEntryStudentInformation();
    renderResultEntry();
  }
  showView("entry");
}

function showOverall() {
  renderOverallResults();
  showView("overall");
}

function showView(view) {
  [
    dom.classesView,dom.studentsView,dom.entryView,dom.overallView
  ].forEach(element => element?.classList.add("hidden"));

  const views = {
    classes:dom.classesView,
    students:dom.studentsView,
    entry:dom.entryView,
    overall:dom.overallView
  };

  views[view]?.classList.remove("hidden");

  window.scrollTo({top:0,behavior:"smooth"});
}

/* =========================================================
   MESSAGES
========================================================= */

function showSaveMessage(message,type) {
  if (!dom.saveMessage) return;
  dom.saveMessage.textContent = message;
  dom.saveMessage.className = "save-message " + type;
}

function showGlobalMessage(message,type) {
  if (!dom.globalMessage) return;

  clearTimeout(globalMessageTimer);
  dom.globalMessage.textContent = message;
  dom.globalMessage.className = "global-message " + type;
  dom.globalMessage.classList.remove("hidden");

  globalMessageTimer = setTimeout(() => {
    dom.globalMessage.classList.add("hidden");
  },5000);
}

/* =========================================================
   DOWNLOAD PDF
========================================================= */

function downloadResult() {
  if (typeof html2pdf === "undefined") {
    showGlobalMessage("PDF library could not be loaded.","error");
    return;
  }

  const result = document.getElementById("printableResult");
  if (!result) {
    showGlobalMessage("Printable results section was not found.","error");
    return;
  }

  const actions = result.querySelector(".results-actions");
  const studentName = document.getElementById("studentName").textContent.trim();
  const safeName = studentName.replace(/[^a-z0-9]/gi,"-").replace(/-+/g,"-");
  const fileName = (safeName || "Student") + "-Result.pdf";

  if (actions) actions.style.display = "none";

  const original = {
    width:result.style.width,
    margin:result.style.margin,
    boxSizing:result.style.boxSizing
  };

  result.style.width = "190mm";
  result.style.margin = "0 auto";
  result.style.boxSizing = "border-box";

  const restore = () => {
    result.style.width = original.width;
    result.style.margin = original.margin;
    result.style.boxSizing = original.boxSizing;
    if (actions) actions.style.display = "";
  };

  showGlobalMessage("Preparing PDF...","success");

  html2pdf().set({
    margin:[10,10,10,10],
    filename:fileName,
    image:{type:"jpeg",quality:0.98},
    html2canvas:{scale:2,useCORS:true,scrollX:0,scrollY:0},
    jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},
    pagebreak:{mode:["css","legacy"],avoid:["tr",".overall-result"]}
  }).from(result).save()
    .then(() => {
      restore();
      showGlobalMessage("Results PDF created successfully.","success");
    })
    .catch(error => {
      console.error("PDF error:",error);
      restore();
      showGlobalMessage("Could not create the PDF.","error");
    });
}

/* =========================================================
   HELPERS
========================================================= */

function findSubjectById(subjectId) {
  return allSubjects.find(subject =>
    String(getDatabaseId(subject)) === String(subjectId)
  );
}

function getStudentsForClass(classItem) {
  if (!classItem) return [];

  const classId = getDatabaseId(classItem);
  const formNumber = classItem.form_number;

  return allStudents.filter(student => {
    if (student.class_id !== undefined && student.class_id !== null) {
      return String(student.class_id) === String(classId);
    }

    if (student.form_number !== undefined && student.form_number !== null) {
      return String(student.form_number) === String(formNumber);
    }

    if (student.class_name) {
      return String(student.class_name).toLowerCase() ===
        String(getClassName(classItem)).toLowerCase();
    }

    return false;
  });
}

function getClassName(item) {
  if (!item) return "Class";
  return item.class_name || item.name ||
    (item.form_number ? "Form " + item.form_number : "Class");
}

function getClassCode(item) {
  return item ? (item.class_code || item.code || "") : "";
}

function getClassFormLabel(item) {
  return item && item.form_number ? "FORM " + item.form_number : "CLASS";
}

function getClassInitial(item) {
  return item && item.form_number ? String(item.form_number) : "C";
}

function getStudentName(student) {
  if (!student) return "Student";
  if (student.full_name) return student.full_name;

  const combined = (
    (student.first_name || "") + " " + (student.last_name || "")
  ).trim();

  return combined || student.name || "Student";
}

function getStudentId(student) {
  if (!student) return "—";
  return student.student_number || student.student_id ||
    student.admission_number || student.registration_number ||
    student.id || "—";
}

function getStudentGender(student) {
  return student ? (student.gender || "—") : "—";
}

function getStudentFormNumber(student) {
  if (!student) return null;

  const value = student.form_number ?? student.form ?? student.class_form;
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getEffectiveFormNumber(student) {
  const studentForm = getStudentFormNumber(student);
  if (studentForm !== null) return studentForm;

  const classForm = getStudentFormNumber(selectedClass);
  return classForm !== null ? classForm : 1;
}

function getSubjectFormNumber(subject) {
  if (!subject) return null;

  const value = subject.form_number ?? subject.form ?? subject.class_form;
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getSubjectName(subject) {
  if (!subject) return "Subject";
  return subject.subject_name || subject.name || subject.title || "Subject";
}

function getDatabaseId(record) {
  if (!record) return null;
  return record.id ?? record.student_id ?? record.subject_id ?? null;
}

function romanNumber(number) {
  const values = [[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let result = "";
  let value = Number(number);

  values.forEach(item => {
    while (value >= item[0]) {
      result += item[1];
      value -= item[0];
    }
  });

  return result;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function escapeAttribute(value) {
  return value === null || value === undefined ? "" : escapeHtml(String(value));
}

function getInitials(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "ST";
  if (words.length === 1) return words[0].substring(0,2).toUpperCase();

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getErrorMessage(error) {
  if (!error) return "An unexpected error occurred.";
  return error.message || error.error_description || String(error);
}
