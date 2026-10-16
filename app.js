
/* =========================================================
   FIRST CLASS ACADEMY — STUDENT RESULTS PORTAL

   READ-ONLY OFFICIAL RESULTS

   Displays results saved by the FCA Results Management page.

   RPC:
   fca_student_get_assessment_results(
     p_student_id,
     p_access_password,
     p_academic_year,
     p_term,
     p_assessment_type
   )

   Assessment types:
   - Continuous Assessment
   - Mid-Term
   - End-of-Term

   SECURITY:
   Fee eligibility and result-release permissions must be
   enforced inside the Supabase RPC, not by this frontend.
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
  const resultsTable = $("resultsTable");
  const tbody = resultsTable?.querySelector("tbody");
  const submit = form?.querySelector('button[type="submit"]');
  const togglePassword = $("togglePassword");

  const SESSION_KEY = "fca_logged_in_student_id";
  const currentYear = new Date().getFullYear();

  const TERMS = [
    "Term 1",
    "Term 2",
    "Term 3"
  ];

  const ASSESSMENT_TYPES = [
    "Continuous Assessment",
    "Mid-Term",
    "End-of-Term"
  ];

  /* =========================================================
     PASSWORD VISIBILITY
  ========================================================= */

  if (togglePassword && passInput) {
    togglePassword.addEventListener("click", () => {
      const show = passInput.type === "password";

      passInput.type = show ? "text" : "password";

      togglePassword.classList.toggle("is-visible", show);

      togglePassword.setAttribute(
        "aria-label",
        show ? "Hide password" : "Show password"
      );

      togglePassword.setAttribute(
        "aria-pressed",
        String(show)
      );
    });
  }

  /* =========================================================
     GENERAL HELPERS
  ========================================================= */

  function message(text, type = "error") {
    let box = $("fcaMessage");

    if (!box) {
      box = document.createElement("div");
      box.id = "fcaMessage";
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");

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
    })[char]);
  }

  function hasValue(value) {
    return value !== undefined &&
      value !== null &&
      value !== "";
  }

  function val(object, keys, fallback = "—") {
    for (const key of keys) {
      if (object && hasValue(object[key])) {
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

  function normaliseAssessment(value) {
    const text = String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-");

    if (
      text === "continuous-assessment" ||
      text === "continuous-assessments"
    ) {
      return "Continuous Assessment";
    }

    if (
      text === "mid-term" ||
      text === "midterm"
    ) {
      return "Mid-Term";
    }

    if (
      text === "end-of-term" ||
      text === "end-term" ||
      text === "endterm"
    ) {
      return "End-of-Term";
    }

    return String(value ?? "").trim();
  }

  function normaliseTerm(value) {
    const match = String(value ?? "")
      .trim()
      .match(/^term\s*([123])$/i);

    return match ? `Term ${match[1]}` : "";
  }

  function normalisePayload(payload) {
    let value = payload;

    if (Array.isArray(value) && value.length === 1) {
      value = value[0];
    }

    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        throw new Error(
          "The results service returned invalid data."
        );
      }
    }

    if (Array.isArray(value)) {
      throw new Error(
        "The results service returned an unexpected response. " +
        "Please contact the school office."
      );
    }

    if (!value || typeof value !== "object") {
      throw new Error(
        "No valid results response was received."
      );
    }

    return value;
  }

  /* =========================================================
     FORM NUMBER — DISPLAY ONLY
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

    if (match) {
      return Number(match[1]);
    }

    const savedForm = Number(
      val(rows[0], ["form_number"], 0)
    );

    return savedForm >= 1 && savedForm <= 4
      ? savedForm
      : "—";
  }

  /* =========================================================
     ASSESSMENT CONTROLS
     Created automatically when missing from index.html.
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

      const passwordLabel = passInput?.closest("label");

      if (passwordLabel) {
        passwordLabel.insertAdjacentElement("afterend", host);
      } else if (submit) {
        form.insertBefore(host, submit);
      } else {
        form.appendChild(host);
      }
    }

    const definitions = [
      {
        id: "academicYear",
        label: "Academic Year",
        values: Array.from(
          { length: Math.max(1, currentYear - 2000 + 1) },
          (_, index) => String(currentYear - index)
        ),
        defaultValue: String(currentYear)
      },
      {
        id: "assessmentTerm",
        label: "Term",
        values: TERMS,
        defaultValue: "Term 1"
      },
      {
        id: "assessmentType",
        label: "Assessment",
        values: ASSESSMENT_TYPES,
        defaultValue: "Continuous Assessment"
      }
    ];

    for (const definition of definitions) {
      let select = $(definition.id);

      if (!select) {
        const wrapper = document.createElement("label");

        wrapper.style.cssText =
          "display:grid;gap:5px;font-weight:600;";

        wrapper.htmlFor = definition.id;
        wrapper.appendChild(
          document.createTextNode(definition.label)
        );

        select = document.createElement("select");
        select.id = definition.id;
        select.name = definition.id;
        select.required = true;

        select.style.cssText =
          "width:100%;padding:10px;border:1px solid #ccc;" +
          "border-radius:6px;font:inherit;background:white;";

        wrapper.appendChild(select);
        host.appendChild(wrapper);
      }

      const existingValue = select.value;

      select.replaceChildren();

      for (const value of definition.values) {
        select.add(new Option(value, value));
      }

      const preferredValue = definition.values.includes(existingValue)
        ? existingValue
        : definition.defaultValue;

      select.value = preferredValue;
    }

    $("academicYear")?.setAttribute(
      "aria-label",
      "Select academic year"
    );

    $("assessmentTerm")?.setAttribute(
      "aria-label",
      "Select term"
    );

    $("assessmentType")?.setAttribute(
      "aria-label",
      "Select assessment type"
    );
  }

  function selectedAssessment() {
    const year = Number($("academicYear")?.value);
    const term = normaliseTerm($("assessmentTerm")?.value);
    const assessmentType = normaliseAssessment(
      $("assessmentType")?.value
    );

    if (!Number.isInteger(year) || year < 2000 || year > currentYear) {
      throw new Error("Please select a valid academic year.");
    }

    if (!TERMS.includes(term)) {
      throw new Error("Please select a valid term.");
    }

    if (!ASSESSMENT_TYPES.includes(assessmentType)) {
      throw new Error("Please select a valid assessment.");
    }

    return { year, term, assessmentType };
  }

  /* =========================================================
     REPORT TABLE
     Display the official saved values; never derive grades.
  ========================================================= */

  function prepareResultsTable() {
    if (!resultsTable) return;

    const headRow = resultsTable.querySelector("thead tr");

    if (headRow) {
      headRow.innerHTML = `
        <th>Subject</th>
        <th>Saved Mark</th>
        <th>Saved Grade</th>
        <th>Teacher's Remark</th>
        <th>Paper Marks</th>
      `;
    }
  }

  function formatSavedMark(result) {
    const mark = val(
      result,
      ["mark", "percentage", "total", "score"],
      null
    );

    if (mark === null || mark === "—") {
      return "—";
    }

    // Display the saved mark as provided by the Results Management page.
    return String(mark);
  }

  function formatPaperMarks(value) {
    if (value === undefined || value === null) {
      return "—";
    }

    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        return value || "—";
      }
    }

    if (typeof value !== "object") {
      return String(value);
    }

    if (Array.isArray(value)) {
      if (!value.length) return "—";

      return value.map(item => {
        if (item && typeof item === "object") {
          const paper = val(
            item,
            ["paper_name", "name", "paper", "paper_number"],
            ""
          );

          const mark = val(
            item,
            ["mark", "marks", "score", "obtained"],
            "—"
          );

          return paper ? `${paper}: ${mark}` : String(mark);
        }

        return String(item);
      }).join(" | ");
    }

    const entries = Object.entries(value);

    if (!entries.length) return "—";

    return entries.map(([key, item]) => {
      if (item && typeof item === "object") {
        const mark = val(
          item,
          ["mark", "marks", "score", "obtained"],
          "—"
        );

        const name = val(
          item,
          ["paper_name", "name"],
          key
        );

        return `${name}: ${mark}`;
      }

      return `${key}: ${item}`;
    }).join(" | ");
  }

  function renderEmptyResults(text) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">${esc(text)}</td>
        </tr>
      `;
    }

    for (const id of [
      "studentAggregate",
      "aggregateFooter",
      "studentPosition"
    ]) {
      if ($(id)) $(id).textContent = "—";
    }

    if ($("overallResult")) {
      $("overallResult").textContent = "—";
      $("overallResult").className = "result-status";
    }
  }

  /* =========================================================
     RENDER OFFICIAL STUDENT PROFILE AND RESULTS

     Grades, remarks, marks and positions are read from saved
     result records. No grading or PASS/FAIL calculation here.
  ========================================================= */

  function render(payload, typedId, selection) {
    const student =
      payload.student ||
      payload.student_data ||
      payload.profile ||
      null;

    if (!student || typeof student !== "object") {
      throw new Error(
        "The saved student profile was not returned. " +
        "Please contact the school office."
      );
    }

    const rawRows = rowsOf(payload);

    // Refuse rows that do not match the requested assessment.
    // The RPC should already return the exact selection.
    const rows = rawRows.filter(result => {
      const rowYear = Number(
        val(result, ["academic_year"], NaN)
      );

      const rowTerm = normaliseTerm(
        val(result, ["term"], "")
      );

      const rowAssessment = normaliseAssessment(
        val(result, ["assessment_type"], "")
      );

      return rowYear === selection.year &&
        rowTerm === selection.term &&
        rowAssessment === selection.assessmentType;
    });

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

    if ($("studentInfo")) {
      $("studentInfo").textContent =
        `${studentId} · ${selection.year} · ` +
        `${selection.term} · ${selection.assessmentType}`;
    }

    if ($("summaryStudentId")) {
      $("summaryStudentId").textContent = studentId;
    }

    if ($("summaryClass")) {
      $("summaryClass").textContent = val(
        student,
        ["class_name", "class"],
        formNumber !== "—" ? `Form ${formNumber}` : "—"
      );
    }

    if ($("summaryGender")) {
      $("summaryGender").textContent = val(
        student,
        ["gender"]
      );
    }

    if ($("studentSubjectCount")) {
      $("studentSubjectCount").textContent = String(rows.length);
    }

    if ($("reportYear")) {
      $("reportYear").textContent = String(selection.year);
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

    if (!tbody) return;

    if (!rows.length) {
      renderEmptyResults(
        "No saved results were found for this student, " +
        "academic year, term and assessment."
      );

      return;
    }

    // Display only stored records. No local grade, mark,
    // aggregate, ranking or pass/fail calculation is performed.
    tbody.innerHTML = rows.map(result => {
      const subject = val(
        result,
        ["subject_name", "subject"],
        "—"
      );

      const mark = formatSavedMark(result);

      const grade = val(
        result,
        ["grade"],
        "—"
      );

      const remark = val(
        result,
        ["remark", "teacher_remark", "classification"],
        "—"
      );

      const paperMarks = formatPaperMarks(
        result.paper_marks
      );

      return `
        <tr>
          <td>${esc(subject)}</td>
          <td>${esc(mark)}</td>
          <td>
            <span class="grade-pill">${esc(grade)}</span>
          </td>
          <td>${esc(remark)}</td>
          <td>${esc(paperMarks)}</td>
        </tr>
      `;
    }).join("");

    // Use official overall-result values only when the RPC
    // returns them. Never derive an aggregate or status.
    const aggregate = val(
      payload,
      ["aggregate_points", "aggregate", "overall_aggregate"],
      val(student, ["aggregate_points", "aggregate"], "—")
    );

    if ($("studentAggregate")) {
      $("studentAggregate").textContent = String(aggregate);
    }

    if ($("aggregateFooter")) {
      $("aggregateFooter").textContent = String(aggregate);
    }

    const officialPosition = val(
      payload,
      ["class_position", "position_in_class", "student_position"],
      val(
        student,
        ["class_position", "position_in_class"],
        null
      )
    );

    const officialClassTotal = val(
      payload,
      ["class_total", "total_class_students"],
      val(student, ["class_total", "total_class_students"], null)
    );

    if ($("studentPosition")) {
      const rank = Number(officialPosition);
      const total = Number(officialClassTotal);

      $("studentPosition").textContent =
        Number.isInteger(rank) &&
        Number.isInteger(total) &&
        rank > 0 &&
        total > 0
          ? `${rank}/${total}`
          : "—";
    }

    const officialStatus = val(
      payload,
      ["overall_result", "overallResult", "result_status"],
      val(student, ["overall_result", "result_status"], "—")
    );

    if ($("overallResult")) {
      $("overallResult").textContent = String(officialStatus);

      const status = String(officialStatus).toUpperCase();

      $("overallResult").className =
        "result-status " +
        (status.startsWith("PASS")
          ? "pass"
          : status.startsWith("FAIL")
            ? "fail"
            : "");
    }
  }

  /* =========================================================
     FETCH SAVED RESULTS FROM SUPABASE
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
      console.error("FCA Supabase RPC error:", error);

      const serverMessage = String(error.message || "");

      if (/fee|payment|paid|balance/i.test(serverMessage)) {
        throw new Error(
          "Your fee payment does not meet the requirements " +
          "for this assessment. Please contact the school office."
        );
      }

      if (/release|published|available/i.test(serverMessage)) {
        throw new Error(
          "These results have not been released by the school yet."
        );
      }

      if (/invalid.*password|incorrect.*password|student.*not found/i.test(serverMessage)) {
        throw new Error(
          "Student ID or Access Password is incorrect."
        );
      }

      throw new Error(
        "Unable to retrieve results. Please try again or " +
        "contact the school office."
      );
    }

    const payload = normalisePayload(data);

    if (payload.success === false || payload.error) {
      const serverMessage = String(
        payload.message || payload.error || ""
      );

      if (/fee|payment|paid|balance/i.test(serverMessage)) {
        throw new Error(
          "Your fee payment does not meet the requirements " +
          "for this assessment. Please contact the school office."
        );
      }

      if (/release|published|not available/i.test(serverMessage)) {
        throw new Error(
          "These results have not been released by the school yet."
        );
      }

      if (/password|student.*not found|invalid.*student/i.test(serverMessage)) {
        throw new Error(
          "Student ID or Access Password is incorrect."
        );
      }

      throw new Error(
        serverMessage || "Results could not be retrieved."
      );
    }

    if (
      !payload.student &&
      !payload.student_data &&
      !payload.profile
    ) {
      throw new Error(
        "The server did not return a verified student profile."
      );
    }

    if (!Array.isArray(payload.results) &&
        !Array.isArray(payload.student_results) &&
        !Array.isArray(payload.data)) {
      throw new Error(
        "The results service did not return saved subject records. " +
        "Please check the student results RPC."
      );
    }

    return payload;
  }

  /* =========================================================
     INITIALISE
  ========================================================= */

  if (!db) {
    message(
      "Database connection is unavailable. " +
      "Check config.js and your internet connection."
    );

    if (submit) submit.disabled = true;

    return;
  }

  if (!form || !idInput || !passInput) {
    console.error(
      "FCA portal: Required login form elements were not found."
    );

    return;
  }

  ensureAssessmentControls();
  prepareResultsTable();

  /* =========================================================
     LOGIN AND VIEW SELECTED RESULTS
  ========================================================= */

  form.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    const studentId = idInput.value.trim();
    const password = passInput.value;

    if (!studentId || !password) {
      message("Enter your Student ID and Access Password.");
      return;
    }

    let selection;

    try {
      selection = selectedAssessment();
    } catch (error) {
      message(error.message);
      return;
    }

    const oldText = submit?.textContent || "View Results";

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

      sessionStorage.setItem(SESSION_KEY, studentId);

      passInput.value = "";
      showPortal(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } catch (error) {
      console.error("FCA results lookup:", error);

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
     PRINT REPORT CARD
  ========================================================= */

  $("printBtn")?.addEventListener("click", () => {
    window.print();
  });

  $("downloadPdfBtn")?.addEventListener("click", () => {
    window.print();
  });

  /* =========================================================
     EMAIL SUMMARY
  ========================================================= */

  $("emailBtn")?.addEventListener("click", () => {
    const studentName =
      $("studentName")?.textContent || "Student";

    const studentInfo =
      $("studentInfo")?.textContent || "";

    const subject =
      `FCA Results Summary - ${studentName}`;

    const lines = [];

    if (resultsTable) {
      const tableRows = Array.from(
        resultsTable.querySelectorAll("tbody tr")
      );

      for (const row of tableRows) {
        const cells = Array.from(row.cells).map(
          cell => cell.textContent.trim()
        );

        lines.push(cells.join(" | "));
      }
    }

    const body = [
      "FIRST CLASS ACADEMY",
      "STUDENT RESULTS SUMMARY",
      "",
      studentName,
      studentInfo,
      "",
      ...lines
    ].join("\n");

    window.location.href =
      "mailto:?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  });

  /* =========================================================
     LOGOUT
  ========================================================= */

  $("logoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);

    idInput.value = "";
    passInput.value = "";

    clearMessage();
    renderEmptyResults("Log in to view your official results.");
    showPortal(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  /* =========================================================
     START IN LOGIN VIEW
  ========================================================= */

  sessionStorage.removeItem(SESSION_KEY);
  showPortal(false);
});
