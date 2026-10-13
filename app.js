
/* =========================================================
   FIRST CLASS ACADEMY — STUDENT RESULTS PORTAL
   Assessment-aware version

   Uses:
   fca_student_get_assessment_results(
     p_student_id,
     p_access_password,
     p_academic_year,
     p_term,
     p_assessment_type
   )
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const db = window.fcaSupabase;
  const $ = id => document.getElementById(id);

  const loginView = $("loginView");
  const portalView = $("portalView");
  const form = $("studentLoginForm");
  const idInput = $("studentId");
  const passInput = $("studentPassword");
  const tbody = $("resultsTable")?.querySelector("tbody");
  const submit = form?.querySelector('button[type="submit"]');

  const SESSION_KEY = "fca_logged_in_student_id";
  const currentYear = new Date().getFullYear();

  const TERMS = ["Term 1", "Term 2", "Term 3"];

  const ASSESSMENT_TYPES = [
    "Continuous Assessment",
    "Mid-Term",
    "End-of-Term"
  ];

  if ($("currentYear")) {
    $("currentYear").textContent = currentYear;
  }

  /* =========================================================
     MESSAGES AND GENERAL HELPERS
  ========================================================= */

  function message(text, type = "error") {
    let box = $("fcaMessage");

    if (!box) {
      box = document.createElement("div");
      box.id = "fcaMessage";
      box.className = "error";
      box.setAttribute("role", "status");

      (form || loginView || document.body).appendChild(box);
    }

    box.className = type;
    box.textContent = text;
  }

  function clearMessage() {
    $("fcaMessage")?.remove();
  }

  function showPortal(show) {
    loginView?.classList.toggle("hidden", show);
    portalView?.classList.toggle("hidden", !show);
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function val(object, keys, fallback = "—") {
    for (const key of keys) {
      if (
        object &&
        object[key] !== undefined &&
        object[key] !== null &&
        object[key] !== ""
      ) {
        return object[key];
      }
    }

    return fallback;
  }

  function rowsOf(payload) {
    if (Array.isArray(payload?.results)) {
      return payload.results;
    }

    if (Array.isArray(payload?.student_results)) {
      return payload.student_results;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  }

  /* =========================================================
     FORM NUMBER
  ========================================================= */

  function formNo(student, rows) {
    const number = Number(
      val(student, ["form_number"], 0)
    );

    if (number >= 1 && number <= 4) {
      return number;
    }

    const className = String(
      val(student, ["class_name", "class"], "")
    );

    const match =
      className.match(/(?:form|f)\s*([1-4])/i) ||
      className.match(/\b([1-4])\b/);

    return match
      ? Number(match[1])
      : Number(val(rows[0], ["form_number"], 1));
  }

  /* =========================================================
     MARKS, GRADES AND CLASSIFICATIONS
  ========================================================= */

  function markOf(result) {
    const raw = val(
      result,
      ["percentage", "mark", "total", "score"],
      null
    );

    if (raw === null) {
      return null;
    }

    const number = Number(raw);

    return Number.isFinite(number) ? number : null;
  }

  function gradeOf(mark, formNumber, storedGrade) {
    if (
      storedGrade !== "—" &&
      storedGrade !== undefined &&
      storedGrade !== null &&
      String(storedGrade) !== ""
    ) {
      return String(storedGrade);
    }

    if (mark === null) {
      return "—";
    }

    // Forms 1 and 2: A–F grading
    if (formNumber <= 2) {
      return mark >= 75 ? "A"
        : mark >= 60 ? "B"
        : mark >= 50 ? "C"
        : mark >= 40 ? "D"
        : "F";
    }

    // Forms 3 and 4: Grades 1–9
    return mark >= 80 ? "1"
      : mark >= 70 ? "2"
      : mark >= 65 ? "3"
      : mark >= 60 ? "4"
      : mark >= 55 ? "5"
      : mark >= 50 ? "6"
      : mark >= 45 ? "7"
      : mark >= 40 ? "8"
      : "9";
  }

  function classOf(grade, formNumber, stored) {
    if (stored && stored !== "—") {
      return String(stored);
    }

    if (formNumber <= 2) {
      return ({
        A: "Distinction",
        B: "Credit",
        C: "Credit",
        D: "Pass",
        F: "Fail"
      })[grade] || "—";
    }

    const number = Number(grade);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return number <= 2 ? "Distinction"
      : number <= 4 ? "Credit"
      : number <= 6 ? "Competent"
      : number <= 8 ? "Ordinary Pass"
      : "Fail";
  }

  /* =========================================================
     POSITIONS
     Example: 1/80 or 5/40
  ========================================================= */

  function positionText(rank, total) {
    if (
      rank === undefined ||
      rank === null ||
      rank === "" ||
      total === undefined ||
      total === null ||
      total === ""
    ) {
      return "—";
    }

    const r = Number(rank);
    const t = Number(total);

    if (
      !Number.isInteger(r) ||
      !Number.isInteger(t) ||
      r < 1 ||
      t < 1
    ) {
      return "—";
    }

    return `${r}/${t}`;
  }

  /* =========================================================
     ASSESSMENT SELECTORS
     Create them if index.html does not already contain them.
  ========================================================= */

  function ensureAssessmentControls() {
    if (!form) return;

    let host = $("assessmentControls");

    if (!host) {
      host = document.createElement("div");
      host.id = "assessmentControls";
      host.className = "assessment-controls";

      host.style.cssText =
        "display:grid;gap:10px;margin:12px 0;text-align:left;";

      const anchor =
        passInput?.closest(".form-group") ||
        passInput?.parentElement ||
        submit;

      if (anchor && anchor !== submit) {
        anchor.insertAdjacentElement("afterend", host);
      } else {
        form.insertBefore(host, submit || null);
      }
    }

    const definitions = [
      {
        id: "academicYear",
        label: "Academic Year",
        type: "year"
      },
      {
        id: "assessmentTerm",
        label: "Term",
        type: "term"
      },
      {
        id: "assessmentType",
        label: "Assessment",
        type: "assessment"
      }
    ];

    for (const definition of definitions) {
      if ($(definition.id)) {
        continue;
      }

      const wrapper = document.createElement("label");

      wrapper.style.cssText =
        "display:grid;gap:5px;font-weight:600;";

      wrapper.htmlFor = definition.id;
      wrapper.appendChild(
        document.createTextNode(definition.label)
      );

      const select = document.createElement("select");

      select.id = definition.id;
      select.name = definition.id;
      select.required = true;

      select.style.cssText =
        "width:100%;padding:10px;border:1px solid #ccc;" +
        "border-radius:6px;font:inherit;background:white;";

      if (definition.type === "year") {
        for (
          let year = currentYear;
          year >= currentYear - 5;
          year--
        ) {
          const option = new Option(
            String(year),
            String(year),
            year === currentYear,
            year === currentYear
          );

          select.add(option);
        }
      } else {
        const options = definition.type === "term"
          ? TERMS
          : ASSESSMENT_TYPES;

        const defaultValue = definition.type === "term"
          ? "Term 1"
          : "End-of-Term";

        for (const value of options) {
          select.add(
            new Option(
              value,
              value,
              false,
              value === defaultValue
            )
          );
        }
      }

      wrapper.appendChild(select);
      host.appendChild(wrapper);
    }
  }

  function selectedAssessment() {
    const year = Number(
      $("academicYear")?.value || currentYear
    );

    const term =
      $("assessmentTerm")?.value || "Term 1";

    const assessmentType =
      $("assessmentType")?.value || "End-of-Term";

    if (!Number.isInteger(year) || year < 2000) {
      throw new Error("Choose a valid academic year.");
    }

    if (!TERMS.includes(term)) {
      throw new Error("Choose a valid term.");
    }

    if (!ASSESSMENT_TYPES.includes(assessmentType)) {
      throw new Error("Choose a valid assessment.");
    }

    return {
      year,
      term,
      assessmentType
    };
  }

  /* =========================================================
     RENDER STUDENT RESULTS
  ========================================================= */

  function render(payload, typedId, selection) {
    const student =
      payload.student ||
      payload.student_data ||
      payload.profile ||
      payload;

    const rows = rowsOf(payload);
    const formNumber = formNo(student, rows);

    const name = val(
      student,
      ["full_name", "name", "student_name"],
      "Student"
    );

    const studentId = val(
      student,
      ["student_id", "student_number"],
      typedId
    );

    if ($("studentName")) {
      $("studentName").textContent = name;
    }

    if ($("summaryStudentId")) {
      $("summaryStudentId").textContent = studentId;
    }

    if ($("summaryClass")) {
      $("summaryClass").textContent = val(
        student,
        ["class_name", "class"],
        `Form ${formNumber}`
      );
    }

    if ($("summaryGender")) {
      $("summaryGender").textContent = val(
        student,
        ["gender"]
      );
    }

    if ($("studentSubjectCount")) {
      $("studentSubjectCount").textContent =
        String(rows.length);
    }

    const classRank = val(
      payload,
      [
        "class_position",
        "position_in_class",
        "student_position"
      ],
      val(
        student,
        ["class_position", "position_in_class"],
        null
      )
    );

    const classTotal = val(
      payload,
      ["class_total", "total_class_students"],
      val(
        student,
        ["class_total", "total_class_students"],
        null
      )
    );

    if ($("studentPosition")) {
      $("studentPosition").textContent =
        positionText(classRank, classTotal);
    }

    if ($("reportYear")) {
      $("reportYear").textContent = String(
        val(rows[0], ["academic_year"], selection.year)
      );
    }

    if ($("termLabel")) {
      $("termLabel").textContent =
        `${selection.term} — ${selection.assessmentType}`;
    }

    if ($("assessmentLabel")) {
      $("assessmentLabel").textContent =
        `${selection.year} · ${selection.term} · ` +
        selection.assessmentType;
    }

    if (!tbody) {
      return;
    }

    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="6">' +
        "No subject results were found for this assessment." +
        "</td></tr>";

      if ($("studentAggregate")) {
        $("studentAggregate").textContent = "—";
      }

      if ($("aggregateFooter")) {
        $("aggregateFooter").textContent = "—";
      }

      if ($("overallResult")) {
        $("overallResult").textContent = "NOT AVAILABLE";
        $("overallResult").className = "result-status";
      }

      return;
    }

    const prepared = rows.map(result => {
      const mark = markOf(result);

      const grade = gradeOf(
        mark,
        formNumber,
        result.grade
      );

      return {
        result,
        mark,
        grade,
        subject: String(
          val(result, ["subject", "subject_name"], "—")
        )
      };
    }).sort((a, b) =>
      a.subject.localeCompare(b.subject)
    );

    tbody.innerHTML = prepared.map((item, index) => {
      const result = item.result;

      const subjectPosition = positionText(
        val(result, ["subject_position", "position"], null),
        val(
          result,
          ["subject_total", "total_subject_students"],
          null
        )
      );

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${esc(item.subject)}</td>
          <td>${
            item.mark === null
              ? "—"
              : esc(Number(item.mark.toFixed(1)) + "%")
          }</td>
          <td>${esc(subjectPosition)}</td>
          <td>
            <span class="grade-pill">
              ${esc(item.grade)}
            </span>
          </td>
          <td>${esc(classOf(
            item.grade,
            formNumber,
            val(result, ["classification", "remark"], "—")
          ))}</td>
        </tr>
      `;
    }).join("");

    /* =======================================================
       AGGREGATE AND PASS/FAIL
    ======================================================= */

    let aggregate = "—";
    let passed = false;

    if (formNumber >= 3) {
      const validGrades = prepared
        .map(item => Number(item.grade))
        .filter(number =>
          Number.isInteger(number) &&
          number >= 1 &&
          number <= 9
        )
        .sort((a, b) => a - b);

      aggregate = validGrades.length
        ? String(
            validGrades
              .slice(0, 6)
              .reduce((a, b) => a + b, 0)
          )
        : "—";

      const english = prepared.find(item =>
        /english/i.test(item.subject)
      );

      passed =
        validGrades.length >= 6 &&
        validGrades
          .slice(0, 6)
          .every(point => point <= 8) &&
        (!english || Number(english.grade) <= 8);

    } else {
      const passing = prepared.filter(item =>
        item.grade !== "F" &&
        item.grade !== "—"
      ).length;

      const english = prepared.find(item =>
        /english/i.test(item.subject)
      );

      passed =
        passing >= 6 &&
        (!english || english.grade !== "F");
    }

    // Prefer official values when the server provides them.
    aggregate = val(
      payload,
      ["aggregate_points", "aggregate", "aggregatePoints"],
      aggregate
    );

    if ($("studentAggregate")) {
      $("studentAggregate").textContent = String(aggregate);
    }

    if ($("aggregateFooter")) {
      $("aggregateFooter").textContent = String(aggregate);
    }

    const override = val(
      payload,
      ["overall_result", "overallResult", "result_status"],
      ""
    );

    const overall =
      override && override !== "—"
        ? String(override).toUpperCase()
        : passed
          ? "PASS"
          : "FAIL";

    if ($("overallResult")) {
      $("overallResult").textContent = overall;

      $("overallResult").className =
        "result-status " +
        (/^PASS/.test(overall) ? "pass" : "fail");
    }
  }

  /* =========================================================
     FETCH RESULTS THROUGH THE NEW SUPABASE RPC
  ========================================================= */

  async function fetchResults(studentId, password, selection) {
    const { data, error } = await db.rpc(
      "fca_student_get_assessment_results",
      {
        p_student_id: studentId,
        p_access_password: password,
        p_academic_year: selection.year,
        p_term: selection.term,
        p_assessment_type: selection.assessmentType
      }
    );

    if (error) {
      throw error;
    }

    let payload = data;

    if (
      Array.isArray(payload) &&
      payload.length === 1
    ) {
      payload = payload[0];
    }

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        // Keep the original payload for validation below.
      }
    }

    if (payload?.success === false) {
      const serverMessage = String(
        payload.message || ""
      );

      if (/fee|school fees/i.test(serverMessage)) {
        throw new Error(
          "Your school fees are not marked complete for " +
          "this academic year. Please contact the school office."
        );
      }

      if (/not.*released|not been released/i.test(serverMessage)) {
        throw new Error(
          "This assessment has not been released by the school yet."
        );
      }

      throw new Error(
        serverMessage ||
        "Student ID or Access Password is incorrect."
      );
    }

    if (!payload) {
      throw new Error(
        "No response was received. Please try again."
      );
    }

    if (
      !payload.student &&
      !Array.isArray(payload.results)
    ) {
      throw new Error(
        "The database returned an unexpected response. " +
        "Please contact the school office."
      );
    }

    return payload;
  }

  /* =========================================================
     INITIALISE PORTAL
  ========================================================= */

  if (!db) {
    message(
      "Database connection is unavailable. " +
      "Check config.js and your internet connection."
    );

    if (submit) {
      submit.disabled = true;
    }

    return;
  }

  if (!form || !idInput || !passInput) {
    console.error(
      "FCA portal: Required login form elements were not found."
    );

    return;
  }

  ensureAssessmentControls();

  /* =========================================================
     LOGIN AND LOAD SELECTED RESULTS
  ========================================================= */

  form.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    const studentId = idInput.value.trim();
    const password = passInput.value.trim();

    if (!studentId || !password) {
      message(
        "Enter both your Student ID and Access Password."
      );
      return;
    }

    let selection;

    try {
      selection = selectedAssessment();
    } catch (error) {
      message(error.message);
      return;
    }

    const oldText =
      submit?.textContent || "View Results";

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Checking...";
    }

    try {
      const payload = await fetchResults(
        studentId,
        password,
        selection
      );

      render(payload, studentId, selection);

      sessionStorage.setItem(
        SESSION_KEY,
        studentId
      );

      passInput.value = "";
      showPortal(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } catch (error) {
      console.error(
        "FCA results lookup:",
        error
      );

      showPortal(false);

      message(
        error?.message ||
        "Unable to load results. Please try again."
      );

    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = oldText;
      }
    }
  });

  /* =========================================================
     PRINT / SAVE PDF
  ========================================================= */

  $("downloadPdfBtn")?.addEventListener(
    "click",
    () => window.print()
  );

  /* =========================================================
     LOGOUT
  ========================================================= */

  $("logoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);

    idInput.value = "";
    passInput.value = "";

    clearMessage();
    showPortal(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // Require credentials again whenever the page is loaded.
  sessionStorage.removeItem(SESSION_KEY);
  showPortal(false);
});
