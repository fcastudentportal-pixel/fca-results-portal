
"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  const db = window.fcaSupabase;
  const $ = id => document.getElementById(id);

  const yearFilter = $("yearFilter");
  const classFilter = $("classFilter");
  const searchInput = $("studentSearch");
  const tableBody = $("financeTableBody");
  const message = $("financeMessage");

  let students = [];
  let classes = [];
  let fees = [];

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

  function getFee(student, year) {
    return fees.find(f =>
      f.student_id === student.student_id &&
      Number(f.academic_year) === Number(year)
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

    const [studentResult, classResult, feeResult] = await Promise.all([
      db.from("students")
        .select("id,full_name,student_id,class_id,form_number,academic_year")
        .order("full_name"),
      db.from("classes")
        .select("id,class_name,form_number")
        .order("form_number"),
      db.from("fees")
        .select("id,student_id,academic_year,fee_status,updated_at")
    ]);

    if (studentResult.error || classResult.error || feeResult.error) {
      console.error(
        studentResult.error,
        classResult.error,
        feeResult.error
      );
      showMessage(
        "Could not load records. Check Supabase permissions and RLS policies.",
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
      ...students.map(s => Number(s.academic_year)).filter(Boolean),
      ...fees.map(f => Number(f.academic_year)).filter(Boolean)
    ]);

    const previousYear = yearFilter.value;
    yearFilter.innerHTML = [...years]
      .sort((a, b) => b - a)
      .map(year =>
        `<option value="${year}">${year}</option>`
      ).join("");

    if (years.has(Number(previousYear))) {
      yearFilter.value = previousYear;
    }

    classFilter.innerHTML =
      '<option value="">All classes</option>' +
      classes.map(c =>
        `<option value="${escapeHTML(c.id)}">${escapeHTML(c.class_name)}</option>`
      ).join("");

    render();
    showMessage(`Loaded ${students.length} students.`);
  }

  function render() {
    const year = selectedYear();
    const selectedClass = classFilter.value;
    const query = searchInput.value.trim().toLowerCase();

    const visibleStudents = students.filter(student => {
      const matchesYear =
        Number(student.academic_year) === year;

      const matchesClass =
        !selectedClass || student.class_id === selectedClass;

      const matchesSearch =
        !query ||
        String(student.full_name || "").toLowerCase().includes(query) ||
        String(student.student_id || "").toLowerCase().includes(query);

      return matchesYear && matchesClass && matchesSearch;
    });

    const allYearStudents = students.filter(
      student => Number(student.academic_year) === year
    );

    let unpaid = 0;
    let partial = 0;
    let paid = 0;

    allYearStudents.forEach(student => {
      const status = getStatus(getFee(student, year));
      if (status === STATUS.unpaid) unpaid++;
      else if (status === STATUS.partial) partial++;
      else if (status === STATUS.paid) paid++;
    });

    $("unpaidCount").textContent = unpaid;
    $("partialCount").textContent = partial;
    $("paidCount").textContent = paid;

    if (!visibleStudents.length) {
      tableBody.innerHTML =
        '<tr><td colspan="5">No students found for these filters.</td></tr>';
      return;
    }

    tableBody.innerHTML = visibleStudents.map(student => {
      const fee = getFee(student, year);
      const status = getStatus(fee);
      const classInfo = classes.find(c => c.id === student.class_id);
      const className = classInfo
        ? classInfo.class_name
        : (student.form_number ? `Form ${student.form_number}` : "Not assigned");

      return `
        <tr>
          <td>${escapeHTML(student.full_name)}</td>
          <td>${escapeHTML(student.student_id)}</td>
          <td>${escapeHTML(className)}</td>
          <td>${year}</td>
          <td>
            <select
              class="fee-status-select"
              data-student="${escapeHTML(student.student_id)}"
              aria-label="Fee status for ${escapeHTML(student.full_name)}"
            >
              <option value="Not Paid" ${status === "Not Paid" ? "selected" : ""}>Not Paid</option>
              <option value="50% Paid" ${status === "50% Paid" ? "selected" : ""}>50% Paid</option>
              <option value="Complete" ${status === "Complete" ? "selected" : ""}>100% Paid</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");
  }

  async function saveStatus(studentId, status) {
    const year = selectedYear();
    const student = students.find(s => s.student_id === studentId);

    if (!student) {
      showMessage("Student not found.", "error");
      return;
    }

    showMessage(`Saving fee status for ${student.full_name}...`);

    const { data, error } = await db
      .from("fees")
      .upsert({
        student_id: studentId,
        academic_year: year,
        fee_status: status,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "student_id,academic_year"
      })
      .select("id,student_id,academic_year,fee_status,updated_at")
      .single();

    if (error) {
      console.error("Fee status save failed:", error);
      showMessage(
        "Save failed. Check admin login and Supabase RLS policies.",
        "error"
      );
      await loadData();
      return;
    }

    const index = fees.findIndex(f =>
      f.student_id === studentId &&
      Number(f.academic_year) === year
    );

    if (index >= 0) fees[index] = data;
    else fees.push(data);

    render();
    showMessage(`Saved: ${student.full_name} — ${status}.`, "success");
  }

  tableBody.addEventListener("change", async event => {
    const select = event.target.closest(".fee-status-select");
    if (!select) return;

    const studentId = select.dataset.student;
    const status = select.value;

    select.disabled = true;
    try {
      await saveStatus(studentId, status);
    } finally {
      select.disabled = false;
    }
  });

  yearFilter.addEventListener("change", render);
  classFilter.addEventListener("change", render);
  searchInput.addEventListener("input", render);
  $("refreshButton").addEventListener("click", loadData);

  if (!db) {
    showMessage("Supabase is not initialized. Check config.js.", "error");
    tableBody.innerHTML =
      '<tr><td colspan="5">Database connection unavailable.</td></tr>';
    return;
  }

  if (typeof window.fcaRequireAdmin === "function") {
    const authorized = await window.fcaRequireAdmin();
    if (!authorized) return;
  } else {
    showMessage("Admin authorization function is unavailable.", "error");
    return;
  }

  await loadData();
});
