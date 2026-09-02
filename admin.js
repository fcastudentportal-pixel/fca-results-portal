/* =========================================================
   FIRST CLASS ACADEMY
   FCA ADMIN DASHBOARD
   SUPABASE CONNECTION
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

  console.log("FCA Admin Dashboard starting...");


  /* =======================================================
     ELEMENTS
  ======================================================= */

  const databaseStatus =
    document.getElementById("databaseStatus");

  const teacherCount =
    document.getElementById("dashboardTeacherCount");

  const classCount =
    document.getElementById("dashboardClassCount");

  const studentCount =
    document.getElementById("dashboardStudentCount");


  /* =======================================================
     CHECK SUPABASE
  ======================================================= */

  if (!window.fcaSupabase) {

    console.error(
      "FCA Supabase client was not created."
    );

    if (databaseStatus) {

      databaseStatus.textContent =
        "❌ FCA database is not connected.";

    }

    return;
  }


  console.log(
    "FCA Supabase client loaded successfully."
  );


  /* =======================================================
     DATABASE STATUS
  ======================================================= */

  if (databaseStatus) {

    databaseStatus.textContent =
      "Connecting to FCA database...";

  }


  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  try {

    /* -------------------------------------------------------
       TEACHERS
    ------------------------------------------------------- */

    const {
      count: teachers,
      error: teachersError
    } =
      await window.fcaSupabase
        .from(window.FCA_TABLES.teachers)
        .select("*", {
          count: "exact",
          head: true
        });


    if (teachersError) {

      throw new Error(
        "Teachers: " +
        teachersError.message
      );

    }


    /* -------------------------------------------------------
       CLASSES
    ------------------------------------------------------- */

    const {
      count: classes,
      error: classesError
    } =
      await window.fcaSupabase
        .from(window.FCA_TABLES.classes)
        .select("*", {
          count: "exact",
          head: true
        });


    if (classesError) {

      throw new Error(
        "Classes: " +
        classesError.message
      );

    }


    /* -------------------------------------------------------
       STUDENTS
    ------------------------------------------------------- */

    const {
      count: students,
      error: studentsError
    } =
      await window.fcaSupabase
        .from(window.FCA_TABLES.students)
        .select("*", {
          count: "exact",
          head: true
        });


    if (studentsError) {

      throw new Error(
        "Students: " +
        studentsError.message
      );

    }


    /* =======================================================
       UPDATE DASHBOARD
    ======================================================= */

    if (teacherCount) {

      teacherCount.textContent =
        teachers ?? 0;

    }


    if (classCount) {

      classCount.textContent =
        classes ?? 0;

    }


    if (studentCount) {

      studentCount.textContent =
        students ?? 0;

    }


    /* =======================================================
       SUCCESS
    ======================================================= */

    if (databaseStatus) {

      databaseStatus.textContent =
        "FCA database connected";

      databaseStatus.classList.add(
        "connected"
      );

    }


    console.log(
      "FCA dashboard loaded successfully."
    );

    console.log(
      "Teachers:",
      teachers
    );

    console.log(
      "Classes:",
      classes
    );

    console.log(
      "Students:",
      students
    );

  }


  /* =======================================================
     DATABASE ERROR
  ======================================================= */

  catch (error) {

    console.error(
      "FCA database error:",
      error
    );


    if (databaseStatus) {

      databaseStatus.textContent =
        "❌ Database connection failed: " +
        error.message;

      databaseStatus.classList.add(
        "error"
      );

    }

  }

});