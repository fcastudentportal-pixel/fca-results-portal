
"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const db = window.fcaSupabase;
  const $ = id => document.getElementById(id);

  const yearFilter = $("yearFilter");
  const termFilter = $("termFilter");
  const classFilter = $("classFilter");
  const searchInput = $("studentSearch");
  const tableBody = $("financeTableBody");
  const message = $("financeMessage");

  let students = [];
  let classes = [];
  let fees = [];

  const TERMS = ["Term 1", "Term 2", "Term 3"];

  const STATUS = {
    unpaid: "Not Paid",
    partial: "50% Paid",
    paid: "Complete"
  };

  function showMessage(text, type = "") {
    message.textContent = text;
    message.className = "finance-message " + type;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function selectedYear() {
    return Number(yearFilter.value);
  }

  function selectedTerm() {
    return termFilter.value;
  }

  function getFee(student, year, term) {
    return fees.find(f =>
      f.student_id === student.student_id &&
      Number(f.academic_year) === Number(year) &&
      f.term === term
    );
  }

  function getStatus(fee) {
    if (!fee) return STATUS.unpaid;
    return fee.fee_status;
  }

  async function loadData() {
    showMessage("Loading student records...");
    tableBody.innerHTML =
      '<tr><td colspan="5">Loading...</td></tr>';

    const [studentResult, classResult, feeResult] =
      await Promise.all([
        db.from("students")
          .select(
            "id,full_name,student_id,class_id,form_number,academic_year"
          )
          .order("full_name"),

        db.from("classes")
          .select("id,class_name,form_number")
          .order("form_number"),

        db.from("fees")
          .select(
            "id,student_id,academic_year,term,fee_status,updated_at"
          )
      ]);

    if (
      studentResult.error ||
      classResult.error ||
      feeResult.error
    ) {
      console.error(
        "Finance loading errors:",
        studentResult.error,
        classResult.error,
        feeResult.error
      );

      showMessage(
        "Could not load records. Check Supabase permissions, " +
        "RLS policies, and the fees.term column.",
        "error"
      );

      tableBody.innerHTML =
        '<tr><td colspan="5">Unable to load records.</td></tr>';
      return;
    }

    students = studentResult.data || [];
    classes = classResult.data || [];
    fees = feeResult.data || [];

    const years = new Set([
      new Date().getFullYear(),
      ...students
        .map(s => Number(s.academic_year))
        .filter(Boolean),
      ...fees
        .map(f => Number(f.academic_year))
        .filter(Boolean)
    ]);

    const previousYear = yearFilter.value;

    yearFilter.innerHTML = [...years]
      .sort((a, b) => b - a)
      .map(year =>
        `<option value="${year}">${year}</option>`
      )
      .join("");

    if (years.has(Number(previousYear))) {
      yearFilter.value = previousYear;
    }

    // Ensure the three terms exist in the HTML dropdown.
    termFilter.innerHTML = TERMS.map(term =>
      `<option value="${term}">${term}</option>`
    ).join("");

    classFilter.innerHTML =
      '<option value="">All classes</option>' +
      classes.map(c =>
        `<option value="${escapeHTML(c.id)}">` +
        `${escapeHTML(c.class_name)}</option>`
      ).join("");

    render();

    showMessage(
      `Loaded ${students.length} students.`,
      "success"
    );
  }

  function render() {
    const year = selectedYear();
    const term = selectedTerm();
    const selectedClass = classFilter.value;
    const query = searchInput.value.trim().toLowerCase();

    const visibleStudents = students.filter(student => {
      const matchesYear =
        Number(student.academic_year) === year;

      const matchesClass =
        !selectedClass ||
        student.class_id === selectedClass;

      const matchesSearch =
        !query ||
        String(student.full_name || "")
          .toLowerCase().includes(query) ||
        String(student.student_id || "")
          .toLowerCase().includes(query);

      return matchesYear && matchesClass && matchesSearch;
    });

    // Statistics apply to the selected year AND term.
    const allTermStudents = students.filter(
      student => Number(student.academic_year) === year
    );

    let unpaid = 0;
    let partial = 0;
    let paid = 0;

    allTermStudents.forEach(student => {
      const fee = getFee(student, year, term);
      const status = getStatus(fee);

      if (status === STATUS.unpaid) unpaid++;
      else if (status === STATUS.partial) partial++;
      else if (status === STATUS.paid) paid++;
    });

    $("unpaidCount").textContent = unpaid;
    $("partialCount").textContent = partial;
    $("paidCount").textContent = paid;

    if (!visibleStudents.length) {
      tableBody.innerHTML =
        '<tr><td colspan="5">' +
        'No students found for these filters.</td></tr>';
      return;
    }

    tableBody.innerHTML = visibleStudents.map(student => {
      const fee = getFee(student, year, term);
      const status = getStatus(fee);

      const classInfo = classes.find(
        c => c.id === student.class_id
      );

      const className = classInfo
        ? classInfo.class_name
        : (
            student.form_number
              ? `Form ${student.form_number}`
              : "Not assigned"
          );

      return `
        <tr>
          <td>${escapeHTML(student.full_name)}</td>
          <td>${escapeHTML(student.student_id)}</td>
          <td>${escapeHTML(className)}</td>
          <td>${year} — ${escapeHTML(term)}</td>
          <td>
            <select
              class="fee-status-select"
              data-student="${escapeHTML(student.student_id)}"
              aria-label="Fee status for ${escapeHTML(student.full_name)}"
            >
              <option value="Not Paid"
                ${status === "Not Paid" ? "selected" : ""}>
                Not Paid
              </option>

              <option value="50% Paid"
                ${status === "50% Paid" ? "selected" : ""}>
                50% Paid
              </option>

              <option value="Complete"
                ${status === "Complete" ? "selected" : ""}>
                100% Paid
              </option>
            </select>
          </td>
        </tr>
      `;
    }).join("");
  }

  async function saveStatus(studentId, status) {
    const year = selectedYear();
    const term = selectedTerm();

    const student = students.find(
      s => s.student_id === studentId
    );

    if (!student) {
      showMessage("Student not found.", "error");
      throw new Error("Student not found.");
    }

    if (!TERMS.includes(term)) {
      showMessage("Please select a valid term.", "error");
      throw new Error("Invalid academic term.");
    }

    showMessage(
      `Saving ${student.full_name} — ${year}, ${term}...`
    );

    const { data, error } = await db
      .from("fees")
      .upsert({
        student_id: studentId,
        academic_year: year,
        term: term,
        fee_status: status,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "student_id,academic_year,term"
      })
      .select(
        "id,student_id,academic_year,term,fee_status,updated_at"
      )
      .single();

    if (error) {
      console.error("Fee status save failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });

      showMessage(
        "Save failed: " + error.message +
        " | Code: " + (error.code || "unknown"),
        "error"
      );

      throw error;
    }

    const index = fees.findIndex(f =>
      f.student_id === studentId &&
      Number(f.academic_year) === year &&
      f.term === term
    );

    if (index >= 0) {
      fees[index] = data;
    } else {
      fees.push(data);
    }

    render();

    showMessage(
      `Saved: ${student.full_name} — ${year}, ${term}: ${status}.`,
      "success"
    );
  }

  tableBody.addEventListener("change", async event => {
    const select = event.target.closest(".fee-status-select");
    if (!select) return;

    const studentId = select.dataset.student;
    const status = select.value;

    select.disabled = true;

    try {
      await saveStatus(studentId, status);
    } catch (error) {
      console.error("Fee save error:", error);

      // Restore the displayed value to the last saved status.
      render();
    } finally {
      // render() may have replaced the original select element.
      // This still safely re-enables the original element.
      select.disabled = false;
    }
  });

  yearFilter.addEventListener("change", render);
  termFilter.addEventListener("change", render);
  classFilter.addEventListener("change", render);
  searchInput.addEventListener("input", render);

  $("refreshButton").addEventListener("click", loadData);

  if (!db) {
    showMessage(
      "Supabase is not initialized. Check config.js.",
      "error"
    );

    tableBody.innerHTML =
      '<tr><td colspan="5">' +
      'Database connection unavailable.</td></tr>';
    return;
  }

  if (typeof window.fcaRequireAdmin === "function") {
    const authorized = await window.fcaRequireAdmin();
    if (!authorized) return;
  } else {
    showMessage(
      "Admin authorization function is unavailable.",
      "error"
    );
    return;
  }

  await loadData();
});
