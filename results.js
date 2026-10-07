"use strict";

/* =========================================================
   FIRST CLASS ACADEMY
   RESULTS MANAGEMENT

   CLASS
      ↓
   STUDENTS
      ↓
   ASSIGNED SUBJECTS ONLY
      ↓
   ENTER RESULTS
      ↓
   OVERALL RESULTS

   GRADING:
   FORMS 1–2 = A–F
   FORMS 3–4 = 1–9
========================================================= */


/* =========================================================
   FALLBACK SUBJECT NAMES
   Used only for displaying subject names when necessary.
   IMPORTANT:
   These are NEVER automatically assigned to a student.
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
   DEFAULT PAPER STRUCTURES
========================================================= */

const DEFAULT_PAPER_STRUCTURES = {

    "English": {
        junior: [
            { name: "Paper I", max: 50 },
            { name: "Paper II", max: 50 }
        ],
        senior: [
            { name: "Paper I", max: 70 },
            { name: "Paper II", max: 60 },
            { name: "Paper III", max: 70 }
        ]
    },

    "Chichewa": {
        junior: [
            { name: "Paper I", max: 50 },
            { name: "Paper II", max: 50 }
        ],
        senior: [
            { name: "Paper I", max: 70 },
            { name: "Paper II", max: 60 },
            { name: "Paper III", max: 70 }
        ]
    },

    "Mathematics": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 100 },
            { name: "Paper II", max: 100 }
        ]
    },

    "Geography": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 100 },
            { name: "Paper II", max: 100 }
        ]
    },

    "Biology": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 100 },
            { name: "Paper II", max: 40 }
        ]
    },

    "Agriculture": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 100 },
            { name: "Paper II", max: 40 }
        ]
    },

    "Chemistry": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 100 },
            { name: "Paper II", max: 40 }
        ]
    },

    "Physics": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 100 },
            { name: "Paper II", max: 40 }
        ]
    },

    "History": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 50 },
            { name: "Paper II", max: 120 }
        ]
    },

    "Bible Knowledge": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 50 },
            { name: "Paper II", max: 120 }
        ]
    },

    "Social Studies": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 50 },
            { name: "Paper II", max: 100 }
        ]
    },

    "Life Skills": {
        junior: [
            { name: "Paper I", max: 100 }
        ],
        senior: [
            { name: "Paper I", max: 50 },
            { name: "Paper II", max: 100 }
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

let dom = {};

let globalMessageTimer = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", init);


async function init() {

    console.log("FCA Results Management: starting...");

    cacheDom();

    db = window.fcaSupabase;

    if (!db) {
        console.error("FCA Supabase client not found.");

        setDatabaseStatus(
            "Database connection unavailable",
            "error"
        );

        showGlobalMessage(
            "Supabase client was not found. Check config.js.",
            "error"
        );

        return;
    }

    try {

        attachEvents();

        setDatabaseStatus(
            "Connecting to database...",
            "loading"
        );

        await testDatabase();

        setDatabaseStatus(
            "Database connected",
            "success"
        );

        await Promise.all([
            loadClasses(),
            loadStudents(),
            loadSubjects(),
            loadResults()
        ]);

        renderClasses();

        console.log("FCA Results Management: ready.");

    } catch (error) {

        console.error(
            "Results Management initialization error:",
            error
        );

        setDatabaseStatus(
            "Database error",
            "error"
        );

        showGlobalMessage(
            getErrorMessage(error),
            "error"
        );
    }
}


/* =========================================================
   DOM CACHE
========================================================= */

function cacheDom() {

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

function attachEvents() {

    document
        .getElementById("backToClassesBtn")
        ?.addEventListener("click", function () {
            showClasses();
        });

    document
        .getElementById("backToStudentsBtn")
        ?.addEventListener("click", function () {
            showStudents();
        });

    document
        .getElementById("backToStudentsFromOverallBtn")
        ?.addEventListener("click", function () {
            showStudents();
        });

    document
        .getElementById("backToEntryBtn")
        ?.addEventListener("click", function () {
            showEntry();
        });

    document
        .getElementById("viewOverallFromEntryBtn")
        ?.addEventListener("click", async function () {

            try {

                await saveResults(false);

                await openStudentOverall(
                    selectedStudent
                );

            } catch (error) {

                console.error(error);

            }
        });

    dom.saveResultsBtn
        ?.addEventListener("click", async function () {

            try {
                await saveResults(true);
            } catch (error) {
                console.error(error);
            }
        });

    document
        .getElementById("downloadResultBtn")
        ?.addEventListener("click", downloadResult);
}


/* =========================================================
   DATABASE TEST
========================================================= */

async function testDatabase() {

    const result = await db
        .from("classes")
        .select("id")
        .limit(1);

    if (result.error) {
        throw result.error;
    }

    return true;
}


/* =========================================================
   LOAD CLASSES
========================================================= */

async function loadClasses() {

    const { data, error } = await db
        .from("classes")
        .select("*")
        .order("form_number", {
            ascending: true,
            nullsFirst: false
        });

    if (error) {
        throw error;
    }

    allClasses = data || [];

    console.log(
        "FCA Results: classes loaded:",
        allClasses.length
    );
}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    const { data, error } = await db
        .from("students")
        .select("*");

    if (error) {
        throw error;
    }

    allStudents = data || [];

    console.log(
        "FCA Results: students loaded:",
        allStudents.length
    );
}


/* =========================================================
   LOAD SUBJECTS
========================================================= */

async function loadSubjects() {

    let result = await db
        .from("subjects")
        .select("*")
        .order("subject_name", {
            ascending: true
        });

    if (result.error) {

        console.warn(
            "Could not order subjects by subject_name.",
            result.error
        );

        result = await db
            .from("subjects")
            .select("*");
    }

    if (result.error) {
        throw result.error;
    }

    allSubjects = result.data || [];

    console.log(
        "FCA Results: subjects loaded:",
        allSubjects.length
    );
}


/* =========================================================
   LOAD RESULTS
========================================================= */

async function loadResults() {

    const { data, error } = await db
        .from("results")
        .select("*");

    if (error) {

        console.warn(
            "Results table could not be loaded:",
            error
        );

        allResults = [];

        return;
    }

    allResults = data || [];

    console.log(
        "FCA Results: results loaded:",
        allResults.length
    );
}


/* =========================================================
   RENDER CLASSES
========================================================= */

function renderClasses() {

    if (!dom.classesGrid) {
        return;
    }

    if (!allClasses.length) {

        dom.classesGrid.innerHTML = `
            <div class="empty-state">
                <h3>No Classes Found</h3>
                <p>Create classes from the Classes section first.</p>
            </div>
        `;

        return;
    }

    dom.classesGrid.innerHTML = allClasses
        .map(function (classItem) {

            const students =
                getStudentsForClass(classItem);

            const formNumber =
                getFormNumber(classItem);

            const className =
                getClassName(classItem);

            const classCode =
                classItem.class_code || "";

            return `
                <article
                    class="class-card"
                    data-class-id="${escapeAttribute(
                        getDatabaseId(classItem)
                    )}"
                >

                    <div class="class-card-icon">
                        ${escapeHtml(
                            formNumber
                                ? "Form " + formNumber
                                : "Class"
                        )}
                    </div>

                    <div class="class-card-content">

                        <h3>
                            ${escapeHtml(className)}
                        </h3>

                        ${
                            classCode
                                ? `
                                    <p class="class-code">
                                        ${escapeHtml(classCode)}
                                    </p>
                                `
                                : ""
                        }

                        <p class="class-student-count">
                            ${students.length}
                            ${
                                students.length === 1
                                    ? "student"
                                    : "students"
                            }
                        </p>

                    </div>

                    <button
                        type="button"
                        class="view-class-button"
                        data-class-id="${escapeAttribute(
                            getDatabaseId(classItem)
                        )}"
                    >
                        View Students →
                    </button>

                </article>
            `;
        })
        .join("");

    dom.classesGrid
        .querySelectorAll(".class-card")
        .forEach(function (card) {

            card.addEventListener("click", function (event) {

                if (
                    event.target.closest(
                        ".view-class-button"
                    )
                ) {
                    return;
                }

                const id =
                    card.dataset.classId;

                const classItem =
                    allClasses.find(function (item) {
                        return String(
                            getDatabaseId(item)
                        ) === String(id);
                    });

                if (classItem) {
                    openClass(classItem);
                }
            });
        });

    dom.classesGrid
        .querySelectorAll(".view-class-button")
        .forEach(function (button) {

            button.addEventListener("click", function (event) {

                event.stopPropagation();

                const id =
                    button.dataset.classId;

                const classItem =
                    allClasses.find(function (item) {
                        return String(
                            getDatabaseId(item)
                        ) === String(id);
                    });

                if (classItem) {
                    openClass(classItem);
                }
            });
        });
}


/* =========================================================
   OPEN CLASS
========================================================= */

function openClass(classItem) {

    selectedClass = classItem;

    const className =
        getClassName(classItem);

    if (dom.selectedClassTitle) {
        dom.selectedClassTitle.textContent =
            className;
    }

    if (dom.selectedClassDescription) {

        const students =
            getStudentsForClass(classItem);

        dom.selectedClassDescription.textContent =
            `${students.length} ${
                students.length === 1
                    ? "student"
                    : "students"
            }`;
    }

    renderStudents();

    showStudents();
}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents() {

    if (!dom.studentsGrid) {
        return;
    }

    if (!selectedClass) {
        dom.studentsGrid.innerHTML = "";
        return;
    }

    const students =
        getStudentsForClass(selectedClass);

    if (!students.length) {

        dom.studentsGrid.innerHTML = `
            <div class="empty-state">
                <h3>No Students Found</h3>
                <p>
                    There are no students assigned to this class.
                </p>
            </div>
        `;

        return;
    }

    dom.studentsGrid.innerHTML =
        students
            .map(function (student) {

                const name =
                    getStudentName(student);

                const id =
                    getStudentId(student);

                const gender =
                    getStudentGender(student);

                const initials =
                    getInitials(name);

                return `
                    <article
                        class="student-card"
                        data-student-id="${escapeAttribute(id)}"
                    >

                        <div class="student-avatar">
                            ${escapeHtml(initials)}
                        </div>

                        <div class="student-card-info">

                            <h3>
                                ${escapeHtml(name)}
                            </h3>

                            <p>
                                ${escapeHtml(id)}
                            </p>

                            <div class="student-card-meta">

                                ${
                                    gender
                                        ? `
                                            <span class="student-chip">
                                                ${escapeHtml(gender)}
                                            </span>
                                        `
                                        : ""
                                }

                                <span class="student-chip">
                                    ${escapeHtml(
                                        getClassName(selectedClass)
                                    )}
                                </span>

                            </div>

                        </div>

                        <div class="student-card-actions">

                            <button
                                type="button"
                                class="enter-results-button"
                                data-student-id="${escapeAttribute(id)}"
                            >
                                Enter Results
                            </button>

                            <button
                                type="button"
                                class="overall-results-button"
                                data-student-id="${escapeAttribute(id)}"
                            >
                                Overall Results
                            </button>

                        </div>

                    </article>
                `;
            })
            .join("");

    dom.studentsGrid
        .querySelectorAll(
            ".enter-results-button"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    const student =
                        findStudentById(
                            button.dataset.studentId
                        );

                    if (student) {
                        openStudentEntry(student);
                    }
                }
            );
        });

    dom.studentsGrid
        .querySelectorAll(
            ".overall-results-button"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                async function (event) {

                    event.stopPropagation();

                    const student =
                        findStudentById(
                            button.dataset.studentId
                        );

                    if (student) {
                        await openStudentOverall(student);
                    }
                }
            );
        });
}


/* =========================================================
   OPEN STUDENT ENTRY
========================================================= */

async function openStudentEntry(student) {

    selectedStudent = student;

    renderEntryStudentInformation();

    if (dom.resultsEntryBody) {

        dom.resultsEntryBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-cell">
                    Loading assigned subjects...
                </td>
            </tr>
        `;
    }

    showEntry();

    await loadStudentResults();

    renderResultEntry();
}


/* =========================================================
   STUDENT INFORMATION
========================================================= */

function renderEntryStudentInformation() {

    if (!selectedStudent) {
        return;
    }

    const name =
        getStudentName(selectedStudent);

    const id =
        getStudentId(selectedStudent);

    const gender =
        getStudentGender(selectedStudent);

    const formNumber =
        getStudentFormNumber(selectedStudent);

    if (dom.entryStudentAvatar) {
        dom.entryStudentAvatar.textContent =
            getInitials(name);
    }

    if (dom.entryStudentName) {
        dom.entryStudentName.textContent =
            name;
    }

    if (dom.entryStudentId) {
        dom.entryStudentId.textContent =
            id;
    }

    if (dom.entryStudentClass) {
        dom.entryStudentClass.textContent =
            `Form ${formNumber || "—"}`;
    }

    if (dom.entryStudentGender) {
        dom.entryStudentGender.textContent =
            gender || "—";
    }

    if (dom.entryStudentSubtitle) {
        dom.entryStudentSubtitle.textContent =
            "Enter results for assigned subjects only";
    }

    if (dom.gradingInformation) {

        if (formNumber >= 3) {

            dom.gradingInformation.innerHTML = `
                <strong>Senior grading:</strong>
                80–100 Grade 1,
                70–79 Grade 2,
                65–69 Grade 3,
                60–64 Grade 4,
                55–59 Grade 5,
                50–54 Grade 6,
                45–49 Grade 7,
                40–44 Grade 8,
                0–39 Grade 9.
                English must be passed.
            `;

        } else {

            dom.gradingInformation.innerHTML = `
                <strong>Junior grading:</strong>
                75–100 A,
                60–74 B,
                50–59 C,
                40–49 D,
                0–39 F.
                Overall pass requires at least six passed subjects
                and English must be passed.
            `;
        }
    }
}


/* =========================================================
   LOAD STUDENT RESULTS
========================================================= */

async function loadStudentResults() {

    if (!selectedStudent) {
        currentStudentResults = [];
        return;
    }

    const studentId =
        getStudentId(selectedStudent);

    currentStudentResults =
        allResults.filter(function (result) {

            return String(
                result.student_id
            ) === String(studentId);
        });

    try {

        const { data, error } = await db
            .from("results")
            .select("*")
            .eq("student_id", studentId);

        if (error) {
            throw error;
        }

        currentStudentResults =
            data || [];

        const otherResults =
            allResults.filter(function (result) {

                return String(
                    result.student_id
                ) !== String(studentId);
            });

        allResults = [
            ...otherResults,
            ...currentStudentResults
        ];

    } catch (error) {

        console.warn(
            "Could not refresh student results:",
            error
        );
    }
}


/* =========================================================
   IMPORTANT:
   GET ONLY SUBJECTS ASSIGNED TO THIS STUDENT
========================================================= */

function getSubjectsForStudent(student) {

    if (!student) {
        return [];
    }

    /*
       IMPORTANT CHANGE

       We DO NOT use allSubjects when a student has
       no assigned subjects.

       The student's own assignment is the source of truth.
    */

    const assignedValues =
        extractStudentSubjectAssignments(student);

    console.log(
        "Assigned subjects for student:",
        getStudentName(student),
        assignedValues
    );

    if (!assignedValues.length) {

        console.warn(
            "No subjects assigned to student:",
            getStudentName(student)
        );

        return [];
    }

    const matchedSubjects = [];

    assignedValues.forEach(function (assignment) {

        const subject =
            findAssignedSubject(
                assignment
            );

        if (
            subject &&
            !matchedSubjects.some(function (existing) {

                return String(
                    getDatabaseId(existing)
                ) === String(
                    getDatabaseId(subject)
                );

            })
        ) {
            matchedSubjects.push(subject);
        }
    });

    return sortSubjects(matchedSubjects);
}


/* =========================================================
   EXTRACT STUDENT SUBJECT ASSIGNMENTS
========================================================= */

function extractStudentSubjectAssignments(student) {

    /*
       Preferred field:
       students.subjects

       Compatibility fields:
       subject_ids
       selected_subjects
       subjects_taken
    */

    const possibleFields = [
        "subjects",
        "subject_ids",
        "selected_subjects",
        "subjects_taken"
    ];

    let raw = null;

    for (const field of possibleFields) {

        if (
            student[field] !== undefined &&
            student[field] !== null
        ) {

            raw = student[field];

            /*
               Prefer the first field that actually contains
               assignments.
            */
            const parsed =
                normalizeSubjectAssignments(raw);

            if (parsed.length) {
                return parsed;
            }
        }
    }

    return [];
}


/* =========================================================
   NORMALIZE SUBJECT ASSIGNMENTS
========================================================= */

function normalizeSubjectAssignments(raw) {

    if (
        raw === null ||
        raw === undefined ||
        raw === ""
    ) {
        return [];
    }

    if (typeof raw === "string") {

        const trimmed =
            raw.trim();

        if (!trimmed) {
            return [];
        }

        /*
           JSON array/object
        */
        if (
            trimmed.startsWith("[") ||
            trimmed.startsWith("{")
        ) {

            try {

                const parsed =
                    JSON.parse(trimmed);

                return normalizeSubjectAssignments(
                    parsed
                );

            } catch (error) {

                console.warn(
                    "Could not parse student subjects JSON:",
                    error
                );
            }
        }

        /*
           Comma-separated subject IDs/names
        */
        return trimmed
            .split(",")
            .map(function (value) {
                return value.trim();
            })
            .filter(Boolean);
    }

    if (Array.isArray(raw)) {

        return raw
            .flatMap(function (item) {

                if (
                    item === null ||
                    item === undefined ||
                    item === ""
                ) {
                    return [];
                }

                if (
                    typeof item === "string" ||
                    typeof item === "number"
                ) {
                    return [item];
                }

                if (typeof item === "object") {

                    return [
                        item.id ??
                        item.subject_id ??
                        item.subjectId ??
                        item.subject_name ??
                        item.name ??
                        item.title
                    ].filter(function (value) {
                        return (
                            value !== null &&
                            value !== undefined &&
                            value !== ""
                        );
                    });
                }

                return [];
            });
    }

    if (typeof raw === "object") {

        const value =
            raw.id ??
            raw.subject_id ??
            raw.subjectId ??
            raw.subject_name ??
            raw.name ??
            raw.title;

        return value !== undefined &&
               value !== null &&
               value !== ""
            ? [value]
            : [];
    }

    return [];
}


/* =========================================================
   FIND ASSIGNED SUBJECT
========================================================= */

function findAssignedSubject(assignment) {

    const value =
        String(assignment)
            .trim()
            .toLowerCase();

    if (!value) {
        return null;
    }

    /*
       First match by database ID.
    */

    let subject =
        allSubjects.find(function (item) {

            const id =
                getDatabaseId(item);

            return id !== null &&
                id !== undefined &&
                String(id)
                    .trim()
                    .toLowerCase() === value;
        });

    if (subject) {
        return subject;
    }

    /*
       Then match by subject name.
    */

    subject =
        allSubjects.find(function (item) {

            return getSubjectName(item)
                .trim()
                .toLowerCase() === value;
        });

    if (subject) {
        return subject;
    }

    /*
       Support an assignment such as:
       { id: "...", name: "English" }
    */

    if (
        typeof assignment === "object" &&
        assignment !== null
    ) {

        const possibleId =
            assignment.id ??
            assignment.subject_id;

        const possibleName =
            assignment.subject_name ??
            assignment.name ??
            assignment.title;

        if (possibleId !== undefined) {

            subject =
                allSubjects.find(function (item) {

                    return String(
                        getDatabaseId(item)
                    ) === String(
                        possibleId
                    );
                });

            if (subject) {
                return subject;
            }
        }

        if (possibleName) {

            subject =
                allSubjects.find(function (item) {

                    return getSubjectName(item)
                        .trim()
                        .toLowerCase() ===
                        String(possibleName)
                            .trim()
                            .toLowerCase();
                });

            if (subject) {
                return subject;
            }
        }
    }

    return null;
}


/* =========================================================
   RENDER RESULT ENTRY
========================================================= */

function renderResultEntry() {

    if (!dom.resultsEntryBody) {
        return;
    }

    const subjects =
        getSubjectsForStudent(
            selectedStudent
        );

    if (dom.subjectCount) {
        dom.subjectCount.textContent =
            subjects.length;
    }

    /*
       IMPORTANT:
       No assigned subjects = no subjects shown.
    */

    if (!subjects.length) {

        dom.resultsEntryBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-results-cell"
                >
                    <strong>No subjects assigned to this student.</strong>
                    <br>
                    <span>
                        Assign subjects to this student
                        before entering results.
                    </span>
                </td>
            </tr>
        `;

        return;
    }

    dom.resultsEntryBody.innerHTML =
        subjects
            .map(function (subject) {

                return renderSubjectResultRow(
                    subject
                );
            })
            .join("");

    attachResultInputEvents();
}


/* =========================================================
   RENDER SUBJECT ROW
========================================================= */

function renderSubjectResultRow(subject) {

    const subjectId =
        getDatabaseId(subject);

    const subjectName =
        getSubjectName(subject);

    const papers =
        getPaperStructure(
            subject,
            selectedStudent
        );

    const existing =
        findExistingResult(
            subjectId
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
        calculation.percentage !== null
            ? getSubjectGrading(
                calculation.percentage,
                selectedStudent
            )
            : null;

    const paperCells =
        papers
            .map(function (paper, index) {

                const value =
                    paperValues[index] ??
                    "";

                return `
                    <td>
                        <input
                            type="number"
                            class="paper-mark-input"
                            data-subject-id="${escapeAttribute(
                                subjectId
                            )}"
                            data-paper-index="${index}"
                            min="0"
                            max="${paper.max}"
                            step="1"
                            value="${escapeAttribute(value)}"
                            placeholder="0–${paper.max}"
                        >

                        <small>
                            Max ${paper.max}
                        </small>
                    </td>
                `;
            })
            .join("");

    const totalCells =
        papers.length === 1
            ? ""
            : `
                <td
                    class="subject-obtained"
                    data-subject-total="${escapeAttribute(
                        subjectId
                    )}"
                >
                    ${
                        calculation.obtained === null
                            ? "—"
                            : `${calculation.obtained}/${calculation.maximum}`
                    }
                </td>
            `;

    return `
        <tr
            class="result-subject-row"
            data-subject-id="${escapeAttribute(
                subjectId
            )}"
        >

            <td class="subject-name-cell">
                <strong>
                    ${escapeHtml(subjectName)}
                </strong>
            </td>

            ${paperCells}

            ${
                papers.length === 1
                    ? `
                        <td
                            class="subject-obtained"
                            data-subject-total="${escapeAttribute(
                                subjectId
                            )}"
                        >
                            ${
                                calculation.obtained === null
                                    ? "—"
                                    : `${calculation.obtained}/${calculation.maximum}`
                            }
                        </td>
                    `
                    : totalCells
            }

            <td
                class="subject-percentage"
                data-subject-percentage="${escapeAttribute(
                    subjectId
                )}"
            >
                ${
                    calculation.percentage === null
                        ? "—"
                        : `${calculation.percentage}%`
                }
            </td>

            <td
                class="subject-grade"
                data-subject-grade="${escapeAttribute(
                    subjectId
                )}"
            >
                ${
                    grading
                        ? escapeHtml(
                            String(grading.grade)
                        )
                        : "—"
                }
            </td>

            <td
                class="subject-remark"
                data-subject-remark="${escapeAttribute(
                    subjectId
                )}"
            >
                ${
                    grading
                        ? escapeHtml(
                            grading.remark
                        )
                        : "—"
                }
            </td>

            <td
                class="subject-status"
                data-subject-status="${escapeAttribute(
                    subjectId
                )}"
            >
                ${
                    grading
                        ? grading.passed
                            ? "PASS"
                            : "FAIL"
                        : "—"
                }
            </td>

        </tr>
    `;
}


/* =========================================================
   INPUT EVENTS
========================================================= */

function attachResultInputEvents() {

    document
        .querySelectorAll(
            ".paper-mark-input"
        )
        .forEach(function (input) {

            input.addEventListener(
                "input",
                function () {

                    updateSubjectRow(
                        input.dataset.subjectId
                    );
                }
            );

            input.addEventListener(
                "change",
                function () {

                    updateSubjectRow(
                        input.dataset.subjectId
                    );
                }
            );
        });
}


/* =========================================================
   UPDATE SUBJECT ROW
========================================================= */

function updateSubjectRow(subjectId) {

    const subject =
        findSubjectById(subjectId);

    if (!subject) {
        return;
    }

    const papers =
        getPaperStructure(
            subject,
            selectedStudent
        );

    const values =
        getPaperInputValues(
            subjectId,
            papers
        );

    const calculation =
        calculateSubjectPercentage(
            papers,
            values
        );

    const row =
        document.querySelector(
            `.result-subject-row[data-subject-id="${escapeAttribute(
                subjectId
            )}"]`
        );

    if (!row) {
        return;
    }

    const percentageElement =
        row.querySelector(
            `[data-subject-percentage="${escapeAttribute(
                subjectId
            )}"]`
        );

    const gradeElement =
        row.querySelector(
            `[data-subject-grade="${escapeAttribute(
                subjectId
            )}"]`
        );

    const remarkElement =
        row.querySelector(
            `[data-subject-remark="${escapeAttribute(
                subjectId
            )}"]`
        );

    const statusElement =
        row.querySelector(
            `[data-subject-status="${escapeAttribute(
                subjectId
            )}"]`
        );

    const totalElement =
        row.querySelector(
            `[data-subject-total="${escapeAttribute(
                subjectId
            )}"]`
        );

    const invalid =
        values.some(function (value, index) {

            if (
                value === "" ||
                value === null ||
                value === undefined
            ) {
                return false;
            }

            const number =
                Number(value);

            return (
                Number.isNaN(number) ||
                number < 0 ||
                number > papers[index].max
            );
        });

    if (invalid) {

        if (percentageElement) {
            percentageElement.textContent =
                "Invalid";
        }

        if (gradeElement) {
            gradeElement.textContent =
                "—";
        }

        if (remarkElement) {
            remarkElement.textContent =
                "Invalid mark";
        }

        if (statusElement) {
            statusElement.textContent =
                "—";
        }

        return;
    }

    if (totalElement) {

        if (calculation.obtained === null) {

            totalElement.textContent =
                "—";

        } else {

            totalElement.textContent =
                `${calculation.obtained}/${calculation.maximum}`;
        }
    }

    /*
       Incomplete papers:
       Do not calculate a final percentage.
    */

    if (
        calculation.percentage === null
    ) {

        if (percentageElement) {
            percentageElement.textContent =
                "—";
        }

        if (gradeElement) {
            gradeElement.textContent =
                "—";
        }

        if (remarkElement) {

            const hasSomeMarks =
                values.some(function (value) {
                    return value !== "";
                });

            remarkElement.textContent =
                hasSomeMarks
                    ? "Complete all papers"
                    : "—";
        }

        if (statusElement) {
            statusElement.textContent =
                "—";
        }

        return;
    }

    const grading =
        getSubjectGrading(
            calculation.percentage,
            selectedStudent
        );

    if (percentageElement) {

        percentageElement.textContent =
            `${calculation.percentage}%`;
    }

    if (gradeElement) {

        gradeElement.textContent =
            grading.grade;
    }

    if (remarkElement) {

        remarkElement.textContent =
            grading.remark;
    }

    if (statusElement) {

        statusElement.textContent =
            grading.passed
                ? "PASS"
                : "FAIL";
    }
}


/* =========================================================
   CALCULATE SUBJECT PERCENTAGE
========================================================= */

function calculateSubjectPercentage(
    papers,
    values
) {

    if (!papers.length) {

        return {
            obtained: null,
            maximum: 0,
            percentage: null
        };
    }

    let obtained = 0;

    let enteredCount = 0;

    let valid = true;

    papers.forEach(function (paper, index) {

        const value =
            values[index];

        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {
            return;
        }

        const number =
            Number(value);

        if (
            Number.isNaN(number) ||
            number < 0 ||
            number > paper.max
        ) {

            valid = false;

            return;
        }

        obtained += number;

        enteredCount++;
    });

    const maximum =
        papers.reduce(
            function (sum, paper) {
                return sum + Number(paper.max);
            },
            0
        );

    if (!valid) {

        return {
            obtained,
            maximum,
            percentage: null
        };
    }

    if (enteredCount === 0) {

        return {
            obtained: null,
            maximum,
            percentage: null
        };
    }

    /*
       Do not calculate until every paper
       for the subject has a mark.
    */

    if (enteredCount < papers.length) {

        return {
            obtained,
            maximum,
            percentage: null
        };
    }

    const rawPercentage =
        maximum > 0
            ? (obtained / maximum) * 100
            : 0;

    return {
        obtained,
        maximum,
        percentage:
            Math.round(rawPercentage)
    };
}


/* =========================================================
   SENIOR GRADING
========================================================= */

function getSeniorGrading(percentage) {

    if (percentage >= 80) {

        return {
            grade: 1,
            remark:
                "Pass with Distinction (Outstanding)",
            passed: true
        };
    }

    if (percentage >= 70) {

        return {
            grade: 2,
            remark:
                "Pass with Distinction (Excellent)",
            passed: true
        };
    }

    if (percentage >= 65) {

        return {
            grade: 3,
            remark:
                "Pass with Credit (Good)",
            passed: true
        };
    }

    if (percentage >= 60) {

        return {
            grade: 4,
            remark:
                "Pass with Credit (Competent)",
            passed: true
        };
    }

    if (percentage >= 55) {

        return {
            grade: 5,
            remark:
                "Pass with Credit (Satisfactory)",
            passed: true
        };
    }

    if (percentage >= 50) {

        return {
            grade: 6,
            remark:
                "Pass with Credit (Minimum Credit)",
            passed: true
        };
    }

    if (percentage >= 45) {

        return {
            grade: 7,
            remark:
                "Ordinary Pass",
            passed: true
        };
    }

    if (percentage >= 40) {

        return {
            grade: 8,
            remark:
                "Ordinary Pass",
            passed: true
        };
    }

    return {
        grade: 9,
        remark: "Fail",
        passed: false
    };
}


/* =========================================================
   JUNIOR GRADING
========================================================= */

function getJuniorGrading(percentage) {

    if (percentage >= 75) {

        return {
            grade: "A",
            remark:
                "Excellent / Distinction",
            passed: true
        };
    }

    if (percentage >= 60) {

        return {
            grade: "B",
            remark:
                "Very Good",
            passed: true
        };
    }

    if (percentage >= 50) {

        return {
            grade: "C",
            remark:
                "Good",
            passed: true
        };
    }

    if (percentage >= 40) {

        return {
            grade: "D",
            remark:
                "Average / Pass",
            passed: true
        };
    }

    return {
        grade: "F",
        remark: "Fail",
        passed: false
    };
}


/* =========================================================
   GET GRADING
========================================================= */

function getSubjectGrading(
    percentage,
    student
) {

    const form =
        getStudentFormNumber(student);

    if (form >= 3) {
        return getSeniorGrading(
            percentage
        );
    }

    return getJuniorGrading(
        percentage
    );
}


/* =========================================================
   PAPER STRUCTURE
========================================================= */

function getPaperStructure(
    subject,
    student
) {

    const stored =
        extractStoredPapers(subject);

    if (stored.length) {
        return stored;
    }

    const subjectName =
        getSubjectName(subject);

    const structure =
        DEFAULT_PAPER_STRUCTURES[
            subjectName
        ];

    if (structure) {

        const form =
            getStudentFormNumber(student);

        if (form >= 3) {
            return structure.senior;
        }

        return structure.junior;
    }

    return [
        {
            name: "Paper I",
            max: 100
        }
    ];
}


/* =========================================================
   EXTRACT STORED PAPER STRUCTURE
========================================================= */

function extractStoredPapers(subject) {

    const fields = [
        "papers",
        "paper_structure",
        "paper_marks",
        "mark_structure",
        "paper_config",
        "assessment_structure"
    ];

    for (const field of fields) {

        let value =
            subject[field];

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            continue;
        }

        if (typeof value === "string") {

            try {

                value =
                    JSON.parse(value);

            } catch (error) {

                continue;
            }
        }

        if (!Array.isArray(value)) {
            continue;
        }

        const papers =
            value
                .map(function (paper, index) {

                    if (
                        typeof paper === "number"
                    ) {

                        return {
                            name:
                                `Paper ${roman(index + 1)}`,
                            max:
                                Number(paper)
                        };
                    }

                    if (
                        typeof paper === "object" &&
                        paper !== null
                    ) {

                        const max =
                            paper.max_marks ??
                            paper.maximum_marks ??
                            paper.max ??
                            paper.marks ??
                            paper.total;

                        if (
                            max === undefined ||
                            max === null
                        ) {
                            return null;
                        }

                        return {
                            name:
                                paper.paper_name ??
                                paper.name ??
                                paper.paper ??
                                `Paper ${roman(index + 1)}`,
                            max:
                                Number(max)
                        };
                    }

                    return null;
                })
                .filter(function (paper) {

                    return (
                        paper &&
                        Number.isFinite(paper.max) &&
                        paper.max > 0
                    );
                });

        if (papers.length) {
            return papers;
        }
    }

    return [];
}


/* =========================================================
   EXISTING RESULT
========================================================= */

function findExistingResult(subjectId) {

    return currentStudentResults.find(
        function (result) {

            return String(
                result.subject_id
            ) === String(subjectId);
        }
    ) || null;
}


/* =========================================================
   EXISTING PAPER VALUES
========================================================= */

function getExistingPaperValues(
    result,
    papers
) {

    if (!result) {

        return papers.map(function () {
            return "";
        });
    }

    let raw =
        result.paper_marks ??
        result.papers ??
        result.marks_by_paper ??
        result.paper_results ??
        result.paper_scores;

    if (typeof raw === "string") {

        try {
            raw = JSON.parse(raw);
        } catch (error) {
            raw = null;
        }
    }

    if (Array.isArray(raw)) {

        return papers.map(
            function (_, index) {

                const value =
                    raw[index];

                if (
                    value === null ||
                    value === undefined
                ) {
                    return "";
                }

                if (
                    typeof value === "object"
                ) {

                    return (
                        value.mark ??
                        value.marks ??
                        value.score ??
                        value.value ??
                        ""
                    );
                }

                return value;
            }
        );
    }

    if (
        raw &&
        typeof raw === "object"
    ) {

        return papers.map(
            function (paper, index) {

                const keys = [
                    paper.name,
                    String(index),
                    String(index + 1),
                    `paper${index + 1}`,
                    `paper_${index + 1}`
                ];

                for (
                    const key of keys
                ) {

                    if (
                        raw[key] !== undefined
                    ) {

                        const value =
                            raw[key];

                        if (
                            typeof value === "object" &&
                            value !== null
                        ) {

                            return (
                                value.mark ??
                                value.marks ??
                                value.score ??
                                value.value ??
                                ""
                            );
                        }

                        return value;
                    }
                }

                return "";
            }
        );
    }

    /*
       Old single-paper results.
    */

    if (
        papers.length === 1 &&
        result.mark !== null &&
        result.mark !== undefined &&
        result.mark !== ""
    ) {

        return [
            result.mark
        ];
    }

    return papers.map(function () {
        return "";
    });
}


/* =========================================================
   GET PAPER INPUT VALUES
========================================================= */

function getPaperInputValues(
    subjectId,
    papers
) {

    const row =
        document.querySelector(
            `.result-subject-row[data-subject-id="${escapeAttribute(
                subjectId
            )}"]`
        );

    if (!row) {

        return papers.map(function () {
            return "";
        });
    }

    const inputs =
        Array.from(
            row.querySelectorAll(
                ".paper-mark-input"
            )
        );

    return papers.map(
        function (_, index) {

            const input =
                inputs[index];

            return input
                ? input.value.trim()
                : "";
        }
    );
}


/* =========================================================
   SAVE RESULTS
========================================================= */

async function saveResults(
    showMessage = true
) {

    if (!selectedStudent) {

        throw new Error(
            "No student selected."
        );
    }

    const subjects =
        getSubjectsForStudent(
            selectedStudent
        );

    /*
       Important safety check:
       Saving is impossible when no subjects
       are assigned.
    */

    if (!subjects.length) {

        const message =
            "This student has no assigned subjects.";

        if (showMessage) {
            showSaveMessage(
                message,
                "error"
            );
        }

        throw new Error(message);
    }

    const records = [];

    for (const subject of subjects) {

        const subjectId =
            getDatabaseId(subject);

        const subjectName =
            getSubjectName(subject);

        const papers =
            getPaperStructure(
                subject,
                selectedStudent
            );

        const values =
            getPaperInputValues(
                subjectId,
                papers
            );

        const hasAnyValue =
            values.some(function (value) {

                return (
                    value !== "" &&
                    value !== null &&
                    value !== undefined
                );
            });

        /*
           Completely empty assigned subjects
           are skipped.
        */

        if (!hasAnyValue) {
            continue;
        }

        /*
           Every paper must be completed.
        */

        if (
            values.some(function (value) {
                return value === "";
            })
        ) {

            throw new Error(
                `${subjectName}: complete all papers before saving.`
            );
        }

        /*
           Validate marks.
        */

        for (
            let index = 0;
            index < papers.length;
            index++
        ) {

            const value =
                Number(values[index]);

            if (
                Number.isNaN(value) ||
                value < 0 ||
                value > papers[index].max
            ) {

                throw new Error(
                    `${subjectName}: ${papers[index].name} must be between 0 and ${papers[index].max}.`
                );
            }
        }

        const calculation =
            calculateSubjectPercentage(
                papers,
                values
            );

        if (
            calculation.percentage === null
        ) {

            throw new Error(
                `${subjectName}: unable to calculate result.`
            );
        }

        const grading =
            getSubjectGrading(
                calculation.percentage,
                selectedStudent
            );

        records.push({

            student_id:
                getStudentId(selectedStudent),

            subject_id:
                subjectId,

            mark:
                calculation.percentage,

            grade:
                grading.grade,

            remark:
                grading.remark,

            paper_marks:
                values.map(function (value) {
                    return Number(value);
                })
        });
    }

    /*
       Nothing entered.
    */

    if (!records.length) {

        const message =
            "No results have been entered.";

        if (showMessage) {
            showSaveMessage(
                message,
                "error"
            );
        }

        throw new Error(message);
    }

    if (dom.saveResultsBtn) {
        dom.saveResultsBtn.disabled = true;
    }

    try {

        await upsertResults(records);

        await loadStudentResults();

        renderResultEntry();

        if (showMessage) {

            showSaveMessage(
                "Results saved successfully.",
                "success"
            );
        }

        return true;

    } catch (error) {

        if (showMessage) {

            showSaveMessage(
                getErrorMessage(error),
                "error"
            );
        }

        throw error;

    } finally {

        if (dom.saveResultsBtn) {
            dom.saveResultsBtn.disabled = false;
        }
    }
}


/* =========================================================
   UPSERT RESULTS
========================================================= */

async function upsertResults(records) {

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

    if (!result.error) {
        return;
    }

    console.warn(
        "Full results save failed. Retrying without paper_marks...",
        result.error
    );

    const withoutPaperMarks =
        records.map(function (record) {

            const copy = {
                ...record
            };

            delete copy.paper_marks;

            return copy;
        });

    result =
        await db
            .from("results")
            .upsert(
                withoutPaperMarks,
                {
                    onConflict:
                        "student_id,subject_id"
                }
            );

    if (!result.error) {

        showGlobalMessage(
            "Results saved, but paper marks could not be stored because the results table does not contain paper_marks.",
            "warning"
        );

        return;
    }

    console.warn(
        "Results save failed again. Retrying old schema...",
        result.error
    );

    const oldRecords =
        records.map(function (record) {

            return {
                student_id:
                    record.student_id,

                subject_id:
                    record.subject_id,

                mark:
                    record.mark
            };
        });

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

    if (result.error) {
        throw result.error;
    }

    showGlobalMessage(
        "Results saved using the existing results table structure.",
        "warning"
    );
}


/* =========================================================
   OPEN OVERALL RESULTS
========================================================= */

async function openStudentOverall(student) {

    selectedStudent = student;

    await loadStudentResults();

    renderOverallResults();

    showOverall();
}


/* =========================================================
   RENDER OVERALL RESULTS
========================================================= */

function renderOverallResults() {

    if (!selectedStudent) {
        return;
    }

    const subjects =
        getSubjectsForStudent(
            selectedStudent
        );

    if (dom.studentName) {
        dom.studentName.textContent =
            getStudentName(selectedStudent);
    }

    if (dom.studentId) {
        dom.studentId.textContent =
            getStudentId(selectedStudent);
    }

    if (dom.studentClass) {
        dom.studentClass.textContent =
            `Form ${getStudentFormNumber(
                selectedStudent
            ) || "—"}`;
    }

    if (dom.studentGender) {
        dom.studentGender.textContent =
            getStudentGender(selectedStudent) ||
            "—";
    }

    if (dom.studentSubjectCount) {
        dom.studentSubjectCount.textContent =
            subjects.length;
    }

    if (!subjects.length) {

        if (dom.overallResultsBody) {

            dom.overallResultsBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="empty-results-cell"
                    >
                        <strong>No subjects assigned to this student.</strong>
                        <br>
                        Assign subjects before viewing results.
                    </td>
                </tr>
            `;
        }

        if (dom.studentAverage) {
            dom.studentAverage.textContent =
                "—";
        }

        if (dom.overallResult) {
            dom.overallResult.textContent =
                "NO RESULTS";
        }

        if (dom.overallResultDetails) {
            dom.overallResultDetails.textContent =
                "This student has no assigned subjects.";
        }

        return;
    }

    let totalObtained = 0;
    let totalMaximum = 0;

    const rows = [];

    subjects.forEach(function (subject) {

        const subjectId =
            getDatabaseId(subject);

        const papers =
            getPaperStructure(
                subject,
                selectedStudent
            );

        const existing =
            findExistingResult(
                subjectId
            );

        const values =
            getExistingPaperValues(
                existing,
                papers
            );

        const calculation =
            calculateSubjectPercentage(
                papers,
                values
            );

        let grading = null;

        if (
            calculation.percentage !== null
        ) {

            grading =
                getSubjectGrading(
                    calculation.percentage,
                    selectedStudent
                );

            totalObtained +=
                calculation.obtained;

            totalMaximum +=
                calculation.maximum;
        }

        rows.push({
            subject,
            papers,
            values,
            calculation,
            grading
        });
    });

    if (dom.overallResultsBody) {

        dom.overallResultsBody.innerHTML =
            rows
                .map(function (item) {

                    const paperText =
                        item.papers
                            .map(function (paper, index) {

                                const value =
                                    item.values[index];

                                return `
                                    <span class="overall-paper-mark">
                                        ${escapeHtml(
                                            paper.name
                                        )}:
                                        ${
                                            value === ""
                                                ? "—"
                                                : `${escapeHtml(
                                                    String(value)
                                                )}/${paper.max}`
                                        }
                                    </span>
                                `;
                            })
                            .join("");

                    return `
                        <tr
                            class="overall-result"
                        >

                            <td>
                                <strong>
                                    ${escapeHtml(
                                        getSubjectName(
                                            item.subject
                                        )
                                    )}
                                </strong>

                                <div class="overall-paper-marks">
                                    ${paperText}
                                </div>
                            </td>

                            <td>
                                ${
                                    item.calculation.percentage === null
                                        ? "—"
                                        : `${item.calculation.percentage}%`
                                }
                            </td>

                            <td>
                                ${
                                    item.grading
                                        ? escapeHtml(
                                            String(
                                                item.grading.grade
                                            )
                                        )
                                        : "—"
                                }
                            </td>

                            <td>
                                ${
                                    item.grading
                                        ? escapeHtml(
                                            item.grading.remark
                                        )
                                        : "—"
                                }
                            </td>

                        </tr>
                    `;
                })
                .join("");
    }

    const average =
        totalMaximum > 0
            ? Math.round(
                (totalObtained /
                    totalMaximum) *
                100
            )
            : null;

    if (dom.studentAverage) {

        dom.studentAverage.textContent =
            average === null
                ? "—"
                : `${average}%`;
    }

    const overall =
        calculateOverall(
            rows,
            selectedStudent
        );

    renderOverallSummary(
        overall
    );
}


/* =========================================================
   SENIOR OVERALL
========================================================= */

function calculateSeniorOverall(
    resultRows
) {

    const completeRows =
        resultRows.filter(function (row) {

            return (
                row.calculation.percentage !== null &&
                row.grading !== null
            );
        });

    const englishRow =
        completeRows.find(function (row) {

            return isEnglishSubject(
                row.subject
            );
        });

    const englishPassed =
        !!(
            englishRow &&
            englishRow.grading &&
            englishRow.grading.passed
        );

    const passedRows =
        completeRows.filter(function (row) {

            return (
                row.grading &&
                row.grading.passed
            );
        });

    if (!englishRow) {

        return {
            valid: false,
            pass: false,
            aggregate: null,
            selectedSubjects: [],
            englishPassed: false,
            reason:
                "English result is required."
        };
    }

    if (!englishPassed) {

        return {
            valid: false,
            pass: false,
            aggregate: null,
            selectedSubjects: [],
            englishPassed: false,
            reason:
                "English must be passed."
        };
    }

    if (passedRows.length < 6) {

        return {
            valid: false,
            pass: false,
            aggregate: null,
            selectedSubjects: [],
            englishPassed: true,
            reason:
                "At least six passed subjects are required."
        };
    }

    const bestSix =
        [...passedRows]
            .sort(function (a, b) {

                return Number(
                    a.grading.grade
                ) -
                Number(
                    b.grading.grade
                );
            })
            .slice(0, 6);

    const aggregate =
        bestSix.reduce(
            function (sum, row) {

                return (
                    sum +
                    Number(
                        row.grading.grade
                    )
                );
            },
            0
        );

    return {
        valid: true,
        pass: true,
        aggregate,
        selectedSubjects: bestSix,
        englishPassed: true,
        reason: ""
    };
}


/* =========================================================
   JUNIOR OVERALL
========================================================= */

function calculateJuniorOverall(
    resultRows
) {

    const completeRows =
        resultRows.filter(function (row) {

            return (
                row.calculation.percentage !== null &&
                row.grading !== null
            );
        });

    const englishRow =
        completeRows.find(function (row) {

            return isEnglishSubject(
                row.subject
            );
        });

    const englishPassed =
        !!(
            englishRow &&
            englishRow.grading &&
            englishRow.grading.passed
        );

    const passedRows =
        completeRows.filter(function (row) {

            return (
                row.grading &&
                row.grading.passed
            );
        });

    if (!englishRow) {

        return {
            valid: false,
            pass: false,
            passedCount: passedRows.length,
            englishPassed: false,
            selectedSubjects: passedRows,
            reason:
                "English result is required."
        };
    }

    if (!englishPassed) {

        return {
            valid: false,
            pass: false,
            passedCount: passedRows.length,
            englishPassed: false,
            selectedSubjects: passedRows,
            reason:
                "English must be passed."
        };
    }

    if (passedRows.length < 6) {

        return {
            valid: false,
            pass: false,
            passedCount: passedRows.length,
            englishPassed: true,
            selectedSubjects: passedRows,
            reason:
                "At least six passed subjects are required."
        };
    }

    return {
        valid: true,
        pass: true,
        passedCount: passedRows.length,
        englishPassed: true,
        selectedSubjects: passedRows,
        reason: ""
    };
}


/* =========================================================
   CALCULATE OVERALL
========================================================= */

function calculateOverall(
    resultRows,
    student
) {

    const form =
        getStudentFormNumber(student);

    if (form >= 3) {

        return calculateSeniorOverall(
            resultRows
        );
    }

    return calculateJuniorOverall(
        resultRows
    );
}


/* =========================================================
   RENDER OVERALL SUMMARY
========================================================= */

function renderOverallSummary(
    overall
) {

    if (!dom.overallResult) {
        return;
    }

    if (overall.pass) {

        dom.overallResult.textContent =
            getStudentFormNumber(
                selectedStudent
            ) >= 3
                ? `PASS — AGGREGATE ${overall.aggregate}`
                : "PASS";

        if (
            dom.overallResultDetails
        ) {

            if (
                getStudentFormNumber(
                    selectedStudent
                ) >= 3
            ) {

                dom.overallResultDetails.textContent =
                    "Best six aggregate. English was passed and is included in the best six only when its grade is among the six best grades.";

            } else {

                dom.overallResultDetails.textContent =
                    `${overall.passedCount} subjects passed and English was passed.`;
            }
        }

        return;
    }

    dom.overallResult.textContent =
        getStudentFormNumber(
            selectedStudent
        ) >= 3
            ? "NOT QUALIFIED"
            : "FAIL";

    if (
        dom.overallResultDetails
    ) {

        dom.overallResultDetails.textContent =
            overall.reason ||
            "Overall requirements were not met.";
    }
}


/* =========================================================
   NAVIGATION
========================================================= */

function showClasses() {
    showView(dom.classesView);
}

function showStudents() {
    renderStudents();
    showView(dom.studentsView);
}

function showEntry() {
    showView(dom.entryView);
}

function showOverall() {
    showView(dom.overallView);
}


function showView(view) {

    const views = [
        dom.classesView,
        dom.studentsView,
        dom.entryView,
        dom.overallView
    ];

    views.forEach(function (item) {

        if (!item) {
            return;
        }

        item.hidden =
            item !== view;

        item.classList.toggle(
            "active-view",
            item === view
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   DATABASE / STUDENT HELPERS
========================================================= */

function getStudentsForClass(classItem) {

    if (!classItem) {
        return [];
    }

    const classId =
        getDatabaseId(classItem);

    const formNumber =
        getFormNumber(classItem);

    const className =
        getClassName(classItem);

    return allStudents.filter(
        function (student) {

            if (
                student.class_id !== undefined &&
                student.class_id !== null &&
                classId !== null &&
                classId !== undefined
            ) {

                return String(
                    student.class_id
                ) === String(classId);
            }

            if (
                student.form_number !== undefined &&
                student.form_number !== null &&
                formNumber
            ) {

                return Number(
                    student.form_number
                ) === Number(
                    formNumber
                );
            }

            if (
                student.class_name &&
                className
            ) {

                return String(
                    student.class_name
                ).toLowerCase() ===
                String(className)
                    .toLowerCase();
            }

            return false;
        }
    );
}


function findStudentById(id) {

    return allStudents.find(
        function (student) {

            return String(
                getStudentId(student)
            ) === String(id);
        }
    ) || null;
}


function findSubjectById(id) {

    return allSubjects.find(
        function (subject) {

            return String(
                getDatabaseId(subject)
            ) === String(id);
        }
    ) || null;
}


/* =========================================================
   CLASS HELPERS
========================================================= */

function getClassName(classItem) {

    return (
        classItem.class_name ||
        classItem.name ||
        classItem.title ||
        "Class"
    );
}


function getFormNumber(classItem) {

    const value =
        classItem?.form_number ??
        classItem?.form ??
        classItem?.formNumber;

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const match =
        String(value).match(/\d+/);

    return match
        ? Number(match[0])
        : null;
}


/* =========================================================
   STUDENT HELPERS
========================================================= */

function getStudentName(student) {

    if (
        student.first_name ||
        student.last_name
    ) {

        return [
            student.first_name,
            student.last_name
        ]
            .filter(Boolean)
            .join(" ");
    }

    return (
        student.full_name ||
        student.name ||
        student.student_name ||
        "Student"
    );
}


function getStudentId(student) {

    return (
        student.student_id ||
        student.student_number ||
        student.admission_number ||
        student.id ||
        "—"
    );
}


function getStudentGender(student) {

    return (
        student.gender ||
        student.sex ||
        ""
    );
}


function getStudentFormNumber(student) {

    const value =
        student?.form_number ??
        student?.form ??
        student?.formNumber;

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const match =
        String(value).match(/\d+/);

    return match
        ? Number(match[0])
        : 0;
}


/* =========================================================
   SUBJECT HELPERS
========================================================= */

function getSubjectName(subject) {

    if (typeof subject === "string") {
        return subject;
    }

    return (
        subject.subject_name ||
        subject.name ||
        subject.title ||
        "Subject"
    );
}


function isEnglishSubject(subject) {

    return getSubjectName(subject)
        .trim()
        .toLowerCase() === "english";
}


function sortSubjects(subjects) {

    return [...subjects].sort(
        function (a, b) {

            return getSubjectName(a)
                .localeCompare(
                    getSubjectName(b)
                );
        }
    );
}


/* =========================================================
   GENERAL HELPERS
========================================================= */

function getDatabaseId(record) {

    if (!record) {
        return null;
    }

    return (
        record.id ??
        record.student_id ??
        record.subject_id ??
        null
    );
}


function roman(number) {

    const values = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"]
    ];

    let result = "";
    let value = number;

    values.forEach(function ([amount, symbol]) {

        while (value >= amount) {

            result += symbol;
            value -= amount;
        }
    });

    return result;
}


function getInitials(name) {

    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (word) {

            return word.charAt(0);
        })
        .join("")
        .toUpperCase() || "S";
}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}


/* =========================================================
   DATABASE STATUS
========================================================= */

function setDatabaseStatus(
    message,
    type
) {

    if (!dom.databaseStatus) {
        return;
    }

    dom.databaseStatus.textContent =
        message;

    dom.databaseStatus.className =
        "database-status";

    if (type) {
        dom.databaseStatus.classList.add(
            type
        );
    }
}


/* =========================================================
   SAVE MESSAGE
========================================================= */

function showSaveMessage(
    message,
    type = "success"
) {

    if (!dom.saveMessage) {
        return;
    }

    dom.saveMessage.textContent =
        message;

    dom.saveMessage.className =
        "save-message";

    if (type) {
        dom.saveMessage.classList.add(
            type
        );
    }

    dom.saveMessage.hidden = false;

    setTimeout(function () {

        if (dom.saveMessage) {
            dom.saveMessage.hidden = true;
        }

    }, 5000);
}


/* =========================================================
   GLOBAL MESSAGE
========================================================= */

function showGlobalMessage(
    message,
    type = "success"
) {

    if (!dom.globalMessage) {
        return;
    }

    clearTimeout(
        globalMessageTimer
    );

    dom.globalMessage.textContent =
        message;

    dom.globalMessage.className =
        "global-message";

    if (type) {
        dom.globalMessage.classList.add(
            type
        );
    }

    dom.globalMessage.hidden = false;

    globalMessageTimer =
        setTimeout(function () {

            if (dom.globalMessage) {
                dom.globalMessage.hidden =
                    true;
            }

        }, 6000);
}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function getErrorMessage(error) {

    if (!error) {
        return "An unknown error occurred.";
    }

    if (
        typeof error === "string"
    ) {
        return error;
    }

    return (
        error.message ||
        error.error_description ||
        error.details ||
        "An unexpected error occurred."
    );
}


/* =========================================================
   DOWNLOAD RESULT PDF
========================================================= */

async function downloadResult() {

    if (
        typeof html2pdf ===
        "undefined"
    ) {

        showGlobalMessage(
            "PDF library is not available.",
            "error"
        );

        return;
    }

    const element =
        dom.overallView;

    if (!element) {
        return;
    }

    const actions =
        element.querySelector(
            ".results-actions"
        );

    const originalWidth =
        element.style.width;

    const originalMargin =
        element.style.margin;

    const originalBoxSizing =
        element.style.boxSizing;

    if (actions) {
        actions.style.display =
            "none";
    }

    element.style.width =
        "190mm";

    element.style.margin =
        "0 auto";

    element.style.boxSizing =
        "border-box";

    const studentName =
        getStudentName(
            selectedStudent
        )
            .replace(
                /[^a-z0-9]+/gi,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            );

    const filename =
        `${studentName || "Student"}-Result.pdf`;

    try {

        await html2pdf()
            .set({

                margin: 10,

                filename,

                image: {
                    type: "jpeg",
                    quality: 0.98
                },

                html2canvas: {
                    scale: 2,
                    useCORS: true
                },

                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait"
                },

                pagebreak: {
                    mode: [
                        "avoid-all",
                        "css",
                        "legacy"
                    ]
                }
            })
            .from(element)
            .save();

    } catch (error) {

        console.error(
            "PDF generation failed:",
            error
        );

        showGlobalMessage(
            "Could not generate PDF.",
            "error"
        );

    } finally {

        if (actions) {
            actions.style.display =
                "";
        }

        element.style.width =
            originalWidth;

        element.style.margin =
            originalMargin;

        element.style.boxSizing =
            originalBoxSizing;
    }
}