
/* FCA Student Results Portal — positions displayed as rank/total */
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

  if ($("currentYear")) {
    $("currentYear").textContent = new Date().getFullYear();
  }

  function message(text) {
    let box = $("fcaMessage");

    if (!box) {
      box = document.createElement("div");
      box.id = "fcaMessage";
      box.className = "error";
      box.setAttribute("role", "status");
      form?.appendChild(box);
    }

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
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c]));
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
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.student_results)) {
      return payload.student_results;
    }
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  }

  function formNo(student, rows) {
    const number = Number(val(student, ["form_number"], 0));

    if (number >= 1 && number <= 4) return number;

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

  function markOf(result) {
    const raw = val(
      result,
      ["percentage", "mark", "total", "score"],
      null
    );

    if (raw === null) return null;

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

    if (mark === null) return "—";

    if (formNumber <= 2) {
      return mark >= 75 ? "A"
        : mark >= 60 ? "B"
        : mark >= 50 ? "C"
        : mark >= 40 ? "D"
        : "F";
    }

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
    if (stored && stored !== "—") return String(stored);

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

    if (!Number.isFinite(number)) return "—";

    return number <= 2 ? "Distinction"
      : number <= 4 ? "Credit"
      : number <= 6 ? "Competent"
      : number <= 8 ? "Ordinary Pass"
      : "Fail";
  }

  // Display rank and total, for example 1/80 or 5/40.
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

  function render(payload, typedId) {
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

    $("studentName").textContent = name;
    $("summaryStudentId").textContent = studentId;
    $("summaryClass").textContent = val(
      student,
      ["class_name", "class"],
      `Form ${formNumber}`
    );
    $("summaryGender").textContent = val(student, ["gender"]);
    $("studentSubjectCount").textContent = rows.length;

    // Class position: use rank and enrolled class total.
    const classRank = val(
      payload,
      ["class_position", "position_in_class", "student_position"],
      val(student, ["class_position", "position_in_class"], null)
    );

    const classTotal = val(
      payload,
      ["class_total", "total_class_students"],
      val(student, ["class_total", "total_class_students"], null)
    );

    $("studentPosition").textContent = positionText(
      classRank,
      classTotal
    );

    $("reportYear").textContent = val(
      rows[0],
      ["academic_year"],
      new Date().getFullYear()
    );

    $("termLabel").textContent = val(
      rows[0],
      ["term"],
      "Released Results"
    );

    if (!tbody) return;

    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="6">No released subject results were found.</td></tr>';

      $("studentAggregate").textContent = "—";
      $("aggregateFooter").textContent = "—";
      $("overallResult").textContent = "NOT AVAILABLE";
      $("overallResult").className = "result-status";
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
    }).sort((a, b) => a.subject.localeCompare(b.subject));

    tbody.innerHTML = prepared.map((item, index) => {
      const result = item.result;

      // Each subject has its own rank and enrolled-student total.
      const subjectPosition = positionText(
        val(result, ["subject_position", "position"], null),
        val(result, ["subject_total", "total_subject_students"], null)
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
          <td><span class="grade-pill">${esc(item.grade)}</span></td>
          <td>${esc(classOf(
            item.grade,
            formNumber,
            val(result, ["classification", "remark"], "—")
          ))}</td>
        </tr>
      `;
    }).join("");

    let aggregate = "—";
    let passed = false;

    if (formNumber >= 3) {
      const points = prepared
        .map(item => Number(item.grade))
        .filter(number =>
          Number.isInteger(number) &&
          number >= 1 &&
          number <= 9
        )
        .sort((a, b) => a - b);

      aggregate = points.length
        ? String(points.slice(0, 6).reduce((a, b) => a + b, 0))
        : "—";

      const english = prepared.find(item =>
        /english/i.test(item.subject)
      );

      passed =
        points.length >= 6 &&
        points.slice(0, 6).every(point => point <= 8) &&
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

    aggregate = val(
      payload,
      ["aggregate_points", "aggregate", "aggregatePoints"],
      aggregate
    );

    $("studentAggregate").textContent = aggregate;
    $("aggregateFooter").textContent = aggregate;

    const override = val(
      payload,
      ["overall_result", "overallResult", "result_status"],
      ""
    );

    const overall = override && override !== "—"
      ? String(override).toUpperCase()
      : passed ? "PASS" : "FAIL";

    $("overallResult").textContent = overall;
    $("overallResult").className =
      "result-status " +
      (/^PASS/.test(overall) ? "pass" : "fail");
  }

  async function fetchResults(studentId, password) {
    const { data, error } = await db.rpc(
      "fca_student_get_released_results",
      {
        p_student_id: studentId,
        p_access_password: password
      }
    );

    if (error) throw error;

    let payload = data;

    if (Array.isArray(payload) && payload.length === 1) {
      payload = payload[0];
    }

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {}
    }

    if (payload?.success === false) {
      if (/not.*released/i.test(payload.message || "")) {
        throw new Error(
          "Results have not been released by the school yet."
        );
      }

      throw new Error(
        payload.message ||
        "Student ID or Access Password is incorrect."
      );
    }

    if (!payload) {
      throw new Error(
        "Student ID or Access Password is incorrect."
      );
    }

    return payload;
  }

  if (!db) {
    message(
      "Database connection is unavailable. Check config.js and internet access."
    );

    if (submit) submit.disabled = true;
    return;
  }

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    const studentId = idInput.value.trim();
    const password = passInput.value.trim();

    if (!studentId || !password) {
      message("Enter both your Student ID and Access Password.");
      return;
    }

    const oldText = submit?.textContent || "View Results";

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Checking...";
    }

    try {
      const payload = await fetchResults(studentId, password);

      render(payload, studentId);

      sessionStorage.setItem(SESSION_KEY, studentId);
      passInput.value = "";
      showPortal(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("FCA results lookup:", error);
      showPortal(false);
      message(
        error.message ||
        "Unable to load results. Please try again."
      );
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = oldText;
      }
    }
  });

  $("downloadPdfBtn")?.addEventListener(
    "click",
    () => window.print()
  );

  $("logoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    idInput.value = "";
    passInput.value = "";
    clearMessage();
    showPortal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Require credentials again whenever the page is loaded.
  sessionStorage.removeItem(SESSION_KEY);
  showPortal(false);
});
