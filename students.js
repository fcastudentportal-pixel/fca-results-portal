/* =========================================================
   FIRST CLASS ACADEMY
   STUDENTS MANAGEMENT
   SUPABASE
========================================================= */

"use strict";


/* =========================================================
   FCA STUDENTS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  console.log("FCA Students: page starting...");


  /* =======================================================
     SUPABASE
  ======================================================= */

  const supabase = window.fcaSupabase;


  if (!supabase) {

    console.error(
      "FCA Students: Supabase client missing."
    );

    showStatus(
      "Supabase is not connected. Check config.js.",
      "error"
    );

    return;
  }


  console.log(
    "FCA Students: Supabase client found."
  );


  /* =======================================================
     ELEMENTS
  ======================================================= */

  const databaseStatus =
    document.getElementById("databaseStatus");

  const classCount =
    document.getElementById("classCount");

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

  const backButton =
    document.getElementById("backToClasses");


  /* =======================================================
     STATE
  ======================================================= */

  let classes = [];

  let students = [];

  let selectedClass = null;


  /* =======================================================
     STATUS
  ======================================================= */

  function showStatus(message, type) {

    if (!databaseStatus) {
      return;
    }

    databaseStatus.textContent =
      message;

    databaseStatus.className =
      "database-status";

    if (type) {

      databaseStatus.classList.add(
        type
      );

    }

  }


  /* =======================================================
     START
  ======================================================= */

  initialize();


  async function initialize() {

    showStatus(
      "Checking FCA database...",
      "loading"
    );


    try {

      /*
       * First check that the classes table
       * can actually be reached.
       */

      const test =
        await supabase
          .from("classes")
          .select("*")
          .limit(1);


      if (test.error) {

        console.error(
          "FCA classes database error:",
          test.error
        );

        showStatus(
          "Database error: " +
          test.error.message,
          "error"
        );

        return;
      }


      console.log(
        "FCA classes table connected."
      );


      /*
       * Load classes.
       */

      await loadClasses();


      showStatus(
        "FCA database connected.",
        "success"
      );

    }

    catch (error) {

      console.error(
        "FCA initialization error:",
        error
      );

      showStatus(
        "Database error: " +
        error.message,
        "error"
      );

    }

  }


  /* =======================================================
     LOAD CLASSES
  ======================================================= */

  async function loadClasses() {

    console.log(
      "FCA Students: loading classes..."
    );


    const response =
      await supabase
        .from("classes")
        .select("*");


    if (response.error) {

      console.error(
        "FCA load classes error:",
        response.error
      );

      showStatus(
        "Unable to load classes: " +
        response.error.message,
        "error"
      );

      return;
    }


    classes =
      Array.isArray(response.data)
        ? response.data
        : [];


    console.log(
      "FCA classes loaded:",
      classes
    );


    /*
     * Sort Form 1, Form 2, Form 3, Form 4.
     */

    classes.sort(function (a, b) {

      return getFormNumber(a) -
             getFormNumber(b);

    });


    renderClasses();

  }


  /* =======================================================
     GET FORM NUMBER
  ======================================================= */

  function getFormNumber(item) {

    if (!item) {
      return 0;
    }


    /*
     * If form_number exists.
     */

    if (
      item.form_number !== undefined &&
      item.form_number !== null
    ) {

      const number =
        Number(
          item.form_number
        );


      if (!isNaN(number)) {
        return number;
      }

    }


    /*
     * Otherwise get number from class name.
     *
     * Example:
     * Form 1
     * Form 2
     * Form 3
     * Form 4
     */

    const name =
      String(
        item.name || ""
      );


    const match =
      name.match(/\d+/);


    if (match) {

      return Number(
        match[0]
      );

    }


    return 0;

  }


  /* =======================================================
     GET CLASS NAME
  ======================================================= */

  function getClassName(item) {

    if (!item) {
      return "Class";
    }


    if (item.name) {

      return String(
        item.name
      );

    }


    const number =
      getFormNumber(item);


    if (number) {

      return "Form " + number;

    }


    return "Class";

  }


  /* =======================================================
     RENDER CLASSES
  ======================================================= */

  function renderClasses() {

    if (!classesContainer) {

      console.error(
        "FCA Students: classesContainer not found."
      );

      return;
    }


    classesContainer.innerHTML = "";


    if (classCount) {

      classCount.textContent =
        classes.length;

    }


    if (!classes.length) {

      classesContainer.innerHTML = `

        <div class="students-empty">

          <div class="empty-icon">
            +
          </div>

          <h3>
            No Classes Created
          </h3>

          <p>
            Create classes from the Classes page first.
          </p>

        </div>

      `;

      return;

    }


    /*
     * CREATE EACH CLASS
     */

    classes.forEach(function (item, index) {

      const number =
        getFormNumber(item);

      const name =
        getClassName(item);


      /*
       * IMPORTANT:
       * Use a DIV rather than relying on
       * a button inside another form.
       */

      const card =
        document.createElement("div");


      card.className =
        "student-class-card";


      /*
       * Store the array index on the card.
       */

      card.dataset.classIndex =
        String(index);


      /*
       * Make the whole card clickable.
       */

      card.style.cursor =
        "pointer";


      card.setAttribute(
        "role",
        "button"
      );


      card.setAttribute(
        "tabindex",
        "0"
      );


      card.innerHTML = `

        <div class="student-class-icon">

          ${escapeHtml(
            number
              ? String(number)
              : "?"
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


      /*
       * CLICK
       */

      card.addEventListener(
        "click",
        function (event) {

          event.preventDefault();
          event.stopPropagation();

          console.log(
            "FCA: Class clicked:",
            item
          );

          openClass(item);

        }
      );


      /*
       * KEYBOARD
       */

      card.addEventListener(
        "keydown",
        function (event) {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {

            event.preventDefault();

            openClass(item);

          }

        }
      );


      classesContainer.appendChild(
        card
      );

    });


    console.log(
      "FCA: class cards created:",
      classesContainer.children.length
    );

  }


  /* =======================================================
     OPEN CLASS
  ======================================================= */

  async function openClass(classItem) {

    if (!classItem) {
      return;
    }


    selectedClass =
      classItem;


    const name =
      getClassName(classItem);


    console.log(
      "FCA: opening:",
      name,
      classItem
    );


    /*
     * Change heading.
     */

    if (selectedClassName) {

      selectedClassName.textContent =
        name;

    }


    /*
     * Hide classes.
     */

    if (classesSection) {

      classesSection.hidden =
        true;

      classesSection.style.display =
        "none";

    }


    /*
     * Show students.
     */

    if (studentsSection) {

      studentsSection.hidden =
        false;

      studentsSection.style.display =
        "";

    }


    /*
     * Loading message.
     */

    if (studentsContainer) {

      studentsContainer.innerHTML = `

        <div class="students-loading">

          Loading students in
          ${escapeHtml(name)}...

        </div>

      `;

    }


    /*
     * Load students.
     */

    await loadStudents(
      classItem
    );

  }


  /* =======================================================
     LOAD STUDENTS
  ======================================================= */

  async function loadStudents(classItem) {

    console.log(
      "FCA: loading students for:",
      classItem
    );


    /*
     * -----------------------------------------------------
     * METHOD 1
     * class_id
     * -----------------------------------------------------
     */

    if (
      classItem.id !== undefined &&
      classItem.id !== null
    ) {

      try {

        const response =
          await supabase
            .from("students")
            .select("*")
            .eq(
              "class_id",
              classItem.id
            );


        if (!response.error) {

          students =
            Array.isArray(response.data)
              ? response.data
              : [];


          console.log(
            "FCA: students found by class_id:",
            students.length
          );


          renderStudents();

          return;

        }


        console.warn(
          "class_id is not available or failed:",
          response.error.message
        );

      }

      catch (error) {

        console.warn(
          "class_id query failed:",
          error
        );

      }

    }


    /*
     * -----------------------------------------------------
     * METHOD 2
     * form_number
     * -----------------------------------------------------
     */

    const formNumber =
      getFormNumber(classItem);


    if (formNumber) {

      try {

        const response =
          await supabase
            .from("students")
            .select("*")
            .eq(
              "form_number",
              formNumber
            );


        if (!response.error) {

          students =
            Array.isArray(response.data)
              ? response.data
              : [];


          console.log(
            "FCA: students found by form_number:",
            students.length
          );


          renderStudents();

          return;

        }


        console.warn(
          "form_number query failed:",
          response.error.message
        );

      }

      catch (error) {

        console.warn(
          "form_number query failed:",
          error
        );

      }

    }


    /*
     * -----------------------------------------------------
     * METHOD 3
     * class_name
     * -----------------------------------------------------
     */

    const className =
      getClassName(classItem);


    try {

      const response =
        await supabase
          .from("students")
          .select("*")
          .eq(
            "class_name",
            className
          );


      if (!response.error) {

        students =
          Array.isArray(response.data)
            ? response.data
            : [];


        console.log(
          "FCA: students found by class_name:",
          students.length
        );


        renderStudents();

        return;

      }


      console.warn(
        "class_name query failed:",
        response.error.message
      );

    }

    catch (error) {

      console.warn(
        "class_name query failed:",
        error
      );

    }


    /*
     * If none of the class relationship
     * columns exist, show a useful message.
     */

    students = [];


    if (studentsContainer) {

      studentsContainer.innerHTML = `

        <div class="students-empty">

          <h3>
            Students could not be matched to this class
          </h3>

          <p>
            The class opened correctly, but the
            students table does not appear to have
            a matching class_id, form_number, or
            class_name field.
          </p>

        </div>

      `;

    }

  }


  /* =======================================================
     RENDER STUDENTS
  ======================================================= */

  function renderStudents() {

    if (!studentsContainer) {
      return;
    }


    studentsContainer.innerHTML = "";


    if (!students.length) {

      studentsContainer.innerHTML = `

        <div class="students-empty">

          <div class="empty-icon">
            👤
          </div>

          <h3>
            No Students Yet
          </h3>

          <p>
            There are no students registered in this class.
          </p>

        </div>

      `;

      return;

    }


    students.forEach(function (student) {

      const card =
        document.createElement("div");


      card.className =
        "student-card";


      const fullName =
        getStudentName(student);


      const studentId =
        getStudentId(student);


      const password =
        getStudentPassword(student);


      const subjects =
        getStudentSubjects(student);


      card.innerHTML = `

        <div class="student-card-header">

          <div class="student-avatar">

            ${escapeHtml(
              getInitials(fullName)
            )}

          </div>


          <div>

            <h3>
              ${escapeHtml(fullName)}
            </h3>

            <span>
              ${escapeHtml(studentId)}
            </span>

          </div>

        </div>


        <div class="student-details">


          <div class="student-detail">

            <small>
              STUDENT ID
            </small>

            <strong>
              ${escapeHtml(studentId)}
            </strong>

          </div>


          <div class="student-detail">

            <small>
              ACCESS PASSWORD
            </small>

            <strong>
              ${escapeHtml(password)}
            </strong>

          </div>


          <div class="student-detail student-subjects">

            <small>
              SUBJECTS TAKEN
            </small>

            <div class="subject-list">

              ${renderSubjects(subjects)}

            </div>

          </div>


        </div>


        <div class="student-actions">

          <button
            type="button"
            class="secondary-button edit-student-button"
          >
            Edit
          </button>


          <button
            type="button"
            class="danger-button delete-student-button"
          >
            Delete
          </button>

        </div>

      `;


      /*
       * EDIT
       */

      const editButton =
        card.querySelector(
          ".edit-student-button"
        );


      if (editButton) {

        editButton.addEventListener(
          "click",
          function (event) {

            event.preventDefault();
            event.stopPropagation();

            editStudent(student);

          }
        );

      }


      /*
       * DELETE
       */

      const deleteButton =
        card.querySelector(
          ".delete-student-button"
        );


      if (deleteButton) {

        deleteButton.addEventListener(
          "click",
          function (event) {

            event.preventDefault();
            event.stopPropagation();

            deleteStudent(student);

          }
        );

      }


      studentsContainer.appendChild(
        card
      );

    });


    console.log(
      "FCA: rendered students:",
      students.length
    );

  }


  /* =======================================================
     STUDENT NAME
  ======================================================= */

  function getStudentName(student) {

    if (!student) {
      return "Unknown Student";
    }


    if (student.full_name) {

      return String(
        student.full_name
      );

    }


    if (student.name) {

      return String(
        student.name
      );

    }


    const first =
      String(
        student.first_name || ""
      ).trim();


    const middle =
      String(
        student.middle_name || ""
      ).trim();


    const last =
      String(
        student.last_name || ""
      ).trim();


    const result =
      [
        first,
        middle,
        last
      ]
        .filter(Boolean)
        .join(" ");


    return result ||
      "Unknown Student";

  }


  /* =======================================================
     STUDENT ID
  ======================================================= */

  function getStudentId(student) {

    if (!student) {
      return "Not assigned";
    }


    return String(

      student.student_id ||

      student.student_number ||

      student.student_no ||

      "Not assigned"

    );

  }


  /* =======================================================
     ACCESS PASSWORD
  ======================================================= */

  function getStudentPassword(student) {

    if (!student) {
      return "Not assigned";
    }


    return String(

      student.access_password ||

      student.results_password ||

      student.password ||

      "Not assigned"

    );

  }


  /* =======================================================
     SUBJECTS
  ======================================================= */

  function getStudentSubjects(student) {

    if (!student) {
      return [];
    }


    let subjects =
      student.subjects;


    /*
     * JSON string
     */

    if (
      typeof subjects === "string"
    ) {

      try {

        const parsed =
          JSON.parse(subjects);


        if (
          Array.isArray(parsed)
        ) {

          subjects =
            parsed;

        }

      }

      catch (error) {

        subjects =
          subjects
            .split(",")
            .map(function (item) {

              return item.trim();

            })
            .filter(Boolean);

      }

    }


    if (
      Array.isArray(subjects)
    ) {

      return subjects;

    }


    if (
      Array.isArray(
        student.subject_names
      )
    ) {

      return student.subject_names;

    }


    return [];

  }


  /* =======================================================
     RENDER SUBJECTS
  ======================================================= */

  function renderSubjects(subjects) {

    if (!subjects.length) {

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
          typeof subject === "object" &&
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


  /* =======================================================
     INITIALS
  ======================================================= */

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

      parts[
        parts.length - 1
      ][0]

    ).toUpperCase();

  }


  /* =======================================================
     EDIT STUDENT
  ======================================================= */

  function editStudent(student) {

    console.log(
      "FCA edit student:",
      student
    );


    /*
     * Temporary working edit action.
     *
     * We can connect this to a proper
     * edit modal after confirming the
     * exact students table columns.
     */

    const name =
      getStudentName(student);


    const id =
      getStudentId(student);


    alert(
      "Edit Student\n\n" +
      "Name: " +
      name +
      "\nStudent ID: " +
      id
    );

  }


  /* =======================================================
     DELETE STUDENT
  ======================================================= */

  async function deleteStudent(student) {

    if (!student || !student.id) {

      alert(
        "This student does not have a database ID."
      );

      return;

    }


    const name =
      getStudentName(student);


    const confirmed =
      window.confirm(

        "Delete this student?\n\n" +

        name +

        "\n\nThis action cannot be undone."

      );


    if (!confirmed) {
      return;
    }


    showStatus(
      "Deleting student...",
      "loading"
    );


    try {

      const response =
        await supabase
          .from("students")
          .delete()
          .eq(
            "id",
            student.id
          );


      if (response.error) {

        console.error(
          "FCA delete student error:",
          response.error
        );


        showStatus(
          "Unable to delete student: " +
          response.error.message,
          "error"
        );

        return;

      }


      /*
       * Remove from local array.
       */

      students =
        students.filter(function (item) {

          return String(item.id) !==
            String(student.id);

        });


      renderStudents();


      showStatus(
        "Student deleted successfully.",
        "success"
      );


      console.log(
        "FCA student deleted:",
        student
      );

    }

    catch (error) {

      console.error(
        "FCA delete exception:",
        error
      );


      showStatus(
        "Delete error: " +
        error.message,
        "error"
      );

    }

  }


  /* =======================================================
     BACK TO CLASSES
  ======================================================= */

  if (backButton) {

    backButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        selectedClass =
          null;


        if (studentsSection) {

          studentsSection.hidden =
            true;

          studentsSection.style.display =
            "none";

        }


        if (classesSection) {

          classesSection.hidden =
            false;

          classesSection.style.display =
            "";

        }


        renderClasses();

      }
    );

  }


  /* =======================================================
     ESCAPE HTML
  ======================================================= */

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