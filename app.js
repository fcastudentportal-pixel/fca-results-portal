/* =========================================================
   FIRST CLASS ACADEMY
   FCA STUDENT RESULTS PORTAL
   app.js

   DATABASE STRUCTURE

   students:
   - id
   - name
   - student_number
   - access_password
   - class
   - created_at

   results:
   - id
   - student_id
   - subject
   - mark
   - remark
   - remark_mode
   - academic_year
   - term
   - created_at
   - updated_at
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     SUPABASE
  ======================================================= */

  const supabase = window.fcaSupabase;

  if (!supabase) {

    console.error(
      "FCA Supabase client was not found."
    );

    alert(
      "FCA database connection is not available. Please check config.js."
    );

    return;
  }


  /* =======================================================
     ELEMENTS
  ======================================================= */

  const loginView =
    document.getElementById("loginView");

  const portalView =
    document.getElementById("portalView");

  const studentLoginForm =
    document.getElementById("studentLoginForm");

  const studentIdInput =
    document.getElementById("studentId");

  const studentPasswordInput =
    document.getElementById("studentPassword");

  const studentName =
    document.getElementById("studentName");

  const studentInfo =
    document.getElementById("studentInfo");

  const resultsTable =
    document.getElementById("resultsTable");

  const printBtn =
    document.getElementById("printBtn");

  const emailBtn =
    document.getElementById("emailBtn");

  const logoutBtn =
    document.getElementById("logoutBtn");


  /* =======================================================
     SESSION KEY
  ======================================================= */

  const STUDENT_SESSION_KEY =
    "fca_logged_in_student";


  /* =======================================================
     HELPERS
  ======================================================= */

  function normalize(value) {

    return String(value ?? "")
      .trim()
      .toLowerCase();
  }


  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function showMessage(
    message,
    type = "error"
  ) {

    let box =
      document.getElementById(
        "fcaMessage"
      );


    if (!box) {

      box =
        document.createElement(
          "div"
        );

      box.id =
        "fcaMessage";

      box.style.marginTop =
        "15px";

      box.style.padding =
        "12px 15px";

      box.style.borderRadius =
        "10px";

      box.style.fontSize =
        "14px";

      box.style.lineHeight =
        "1.5";

      if (studentLoginForm) {

        studentLoginForm.appendChild(
          box
        );
      }
    }


    box.textContent =
      message;


    if (type === "success") {

      box.style.background =
        "#e8f7ef";

      box.style.color =
        "#16794c";

    } else {

      box.style.background =
        "#fdebec";

      box.style.color =
        "#9d1c32";
    }
  }


  function clearMessage() {

    const box =
      document.getElementById(
        "fcaMessage"
      );

    if (box) {
      box.remove();
    }
  }


  /* =======================================================
     SESSION
  ======================================================= */

  function saveStudentSession(
    student
  ) {

    const safeStudent = {

      id:
        student.id ?? null,

      name:
        student.name ?? "",

      student_number:
        student.student_number ?? "",

      class:
        student.class ?? ""
    };


    sessionStorage.setItem(
      STUDENT_SESSION_KEY,
      JSON.stringify(
        safeStudent
      )
    );
  }


  function getStudentSession() {

    try {

      const saved =
        sessionStorage.getItem(
          STUDENT_SESSION_KEY
        );


      if (!saved) {
        return null;
      }


      return JSON.parse(
        saved
      );

    } catch (error) {

      console.error(
        "Session error:",
        error
      );

      return null;
    }
  }


  function clearStudentSession() {

    sessionStorage.removeItem(
      STUDENT_SESSION_KEY
    );
  }


  /* =======================================================
     STUDENT LOGIN
  ======================================================= */

  if (studentLoginForm) {

    studentLoginForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        clearMessage();


        const studentNumber =
          studentIdInput
            ? studentIdInput.value.trim()
            : "";


        const accessPassword =
          studentPasswordInput
            ? studentPasswordInput.value.trim()
            : "";


        /* ===============================================
           VALIDATION
        =============================================== */

        if (!studentNumber) {

          showMessage(
            "Please enter your Student ID."
          );

          if (studentIdInput) {
            studentIdInput.focus();
          }

          return;
        }


        if (!accessPassword) {

          showMessage(
            "Please enter your Access Password."
          );

          if (studentPasswordInput) {
            studentPasswordInput.focus();
          }

          return;
        }


        /* ===============================================
           BUTTON
        =============================================== */

        const button =
          studentLoginForm.querySelector(
            'button[type="submit"]'
          );


        const originalText =
          button
            ? button.textContent
            : "View Results";


        if (button) {

          button.disabled =
            true;

          button.textContent =
            "Checking...";
        }


        try {

          /* =============================================
             FIND STUDENT

             students.student_number
          ============================================= */

          const {
            data,
            error
          } =
            await supabase
              .from("students")
              .select(
                "id,name,student_number,access_password,class"
              )
              .eq(
                "student_number",
                studentNumber
              )
              .limit(1);


          /* =============================================
             DATABASE ERROR
          ============================================= */

          if (error) {

            console.error(
              "STUDENT DATABASE ERROR:",
              error
            );

            showMessage(
              "Database error: " +
              error.message
            );

            return;
          }


          /* =============================================
             STUDENT NOT FOUND
          ============================================= */

          if (
            !data ||
            data.length === 0
          ) {

            showMessage(
              "Student ID or Access Password is incorrect."
            );

            return;
          }


          const student =
            data[0];


          /* =============================================
             CHECK PASSWORD

             Example:
             fca@aaa000
             fca@fdn750
          ============================================= */

          const storedPassword =
            student.access_password;


          if (!storedPassword) {

            showMessage(
              "This student does not have an Access Password."
            );

            return;
          }


          if (
            normalize(
              storedPassword
            ) !==
            normalize(
              accessPassword
            )
          ) {

            showMessage(
              "Student ID or Access Password is incorrect."
            );

            return;
          }


          /* =============================================
             LOGIN SUCCESS
          ============================================= */

          saveStudentSession(
            student
          );


          if (studentPasswordInput) {

            studentPasswordInput.value =
              "";
          }


          await openStudentPortal(
            student
          );


        } catch (error) {

          console.error(
            "LOGIN ERROR:",
            error
          );

          showMessage(
            "Unexpected error: " +
            error.message
          );


        } finally {

          if (button) {

            button.disabled =
              false;

            button.textContent =
              originalText;
          }
        }
      }
    );
  }


  /* =======================================================
     OPEN STUDENT PORTAL
  ======================================================= */

  async function openStudentPortal(
    student
  ) {

    /* -----------------------------------------------
       HIDE LOGIN
    ------------------------------------------------ */

    if (loginView) {

      loginView.classList.add(
        "hidden"
      );
    }


    /* -----------------------------------------------
       SHOW PORTAL
    ------------------------------------------------ */

    if (portalView) {

      portalView.classList.remove(
        "hidden"
      );
    }


    /* -----------------------------------------------
       STUDENT NAME
    ------------------------------------------------ */

    if (studentName) {

      studentName.textContent =
        student.name ||
        "Student";
    }


    /* -----------------------------------------------
       STUDENT INFORMATION
    ------------------------------------------------ */

    if (studentInfo) {

      let info =
        "Student ID: " +
        (
          student.student_number ||
          ""
        );


      if (student.class) {

        info +=
          " • Class: " +
          student.class;
      }


      studentInfo.textContent =
        info;
    }


    /* -----------------------------------------------
       LOAD RESULTS

       IMPORTANT:
       results.student_id = students.id
    ------------------------------------------------ */

    await loadStudentResults(
      student.id
    );
  }


  /* =======================================================
     LOAD STUDENT RESULTS
  ======================================================= */

  async function loadStudentResults(
    studentUUID
  ) {

    if (!resultsTable) {
      return;
    }


    const tbody =
      resultsTable.querySelector(
        "tbody"
      );


    if (!tbody) {
      return;
    }


    tbody.innerHTML = `
      <tr>
        <td
          colspan="5"
          style="text-align:center;"
        >
          Loading results...
        </td>
      </tr>
    `;


    try {

      /* =============================================
         GET RESULTS

         results.student_id
         points to
         students.id
      ============================================= */

      const {
        data,
        error
      } =
        await supabase
          .from("results")
          .select(
            "id,student_id,subject,mark,remark,remark_mode,academic_year,term,created_at"
          )
          .eq(
            "student_id",
            studentUUID
          )
          .order(
            "created_at",
            {
              ascending: true
            }
          );


      /* =============================================
         DATABASE ERROR
      ============================================= */

      if (error) {

        console.error(
          "RESULTS DATABASE ERROR:",
          error
        );


        tbody.innerHTML = `
          <tr>
            <td
              colspan="5"
              style="text-align:center;"
            >
              Database error:
              ${escapeHTML(
                error.message
              )}
            </td>
          </tr>
        `;

        return;
      }


      /* =============================================
         NO RESULTS
      ============================================= */

      if (
        !data ||
        data.length === 0
      ) {

        tbody.innerHTML = `
          <tr>
            <td
              colspan="5"
              style="text-align:center;"
            >
              No results have been added yet.
            </td>
          </tr>
        `;

        return;
      }


      /* =============================================
         DISPLAY RESULTS
      ============================================= */

      tbody.innerHTML =
        data
          .map(
            (result) => {

              const subject =
                result.subject ??
                "-";


              const mark =
                result.mark ??
                "-";


              const remark =
                result.remark ??
                "-";


              return `
                <tr>

                  <td>
                    ${escapeHTML(
                      subject
                    )}
                  </td>

                  <td>
                    ${escapeHTML(
                      mark
                    )}
                  </td>

                  <td>
                    -
                  </td>

                  <td>
                    ${escapeHTML(
                      mark
                    )}
                  </td>

                  <td>
                    ${escapeHTML(
                      remark
                    )}
                  </td>

                </tr>
              `;
            }
          )
          .join("");


    } catch (error) {

      console.error(
        "UNEXPECTED RESULTS ERROR:",
        error
      );


      tbody.innerHTML = `
        <tr>
          <td
            colspan="5"
            style="text-align:center;"
          >
            Unable to load results.
          </td>
        </tr>
      `;
    }
  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      () => {

        clearStudentSession();


        if (portalView) {

          portalView.classList.add(
            "hidden"
          );
        }


        if (loginView) {

          loginView.classList.remove(
            "hidden"
          );
        }


        if (studentIdInput) {

          studentIdInput.value =
            "";
        }


        if (studentPasswordInput) {

          studentPasswordInput.value =
            "";
        }


        clearMessage();


        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
    );
  }


  /* =======================================================
     PRINT REPORT CARD
  ======================================================= */

  if (printBtn) {

    printBtn.addEventListener(
      "click",
      () => {

        window.print();

      }
    );
  }


  /* =======================================================
     EMAIL SUMMARY
  ======================================================= */

  if (emailBtn) {

    emailBtn.addEventListener(
      "click",
      () => {

        alert(
          "Email Summary is not connected yet."
        );

      }
    );
  }


  /* =======================================================
     RESTORE SESSION
  ======================================================= */

  const existingStudent =
    getStudentSession();


  if (
    existingStudent &&
    existingStudent.id &&
    existingStudent.student_number
  ) {

    openStudentPortal(
      existingStudent
    );
  }


  /* =======================================================
     ANNOUNCEMENTS
     Results-only portal
  ======================================================= */

  const announcementList =
    document.getElementById(
      "announcementList"
    );


  if (announcementList) {

    announcementList.innerHTML =
      "";
  }


  /* =======================================================
     ACADEMIC CALENDAR
     Results-only portal
  ======================================================= */

  const calendarList =
    document.getElementById(
      "calendarList"
    );


  if (calendarList) {

    calendarList.innerHTML =
      "";
  }


  const calendarAlert =
    document.getElementById(
      "calendarAlert"
    );


  if (calendarAlert) {

    calendarAlert.classList.add(
      "hidden"
    );
  }

});