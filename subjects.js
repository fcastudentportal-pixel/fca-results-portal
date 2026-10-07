/* =========================================================
   FCA SUBJECTS MANAGEMENT
   SUPABASE VERSION

   Requires:
   config.js

   config.js must create:

   window.fcaSupabase
========================================================= */

"use strict";


/* =========================================================
   FCA ADMIN
========================================================= */

const FCA_ADMIN_EMAIL =
    "fca.admin@gmail.com";


/* =========================================================
   SUPABASE
========================================================= */

let db = null;


/* =========================================================
   DATA
========================================================= */

let subjects = [];

let editingSubjectId = null;

let selectedDeleteSubjectId = null;

let paperCounter = 0;


/* =========================================================
   DEFAULT SUBJECT CONFIGURATION
========================================================= */

const DEFAULT_SUBJECTS = [

    {
        name:"Agriculture",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",100],
                [2,"Paper II",40]
            ]
        }
    },

    {
        name:"Bible Knowledge",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",50],
                [2,"Paper II",120]
            ]
        }
    },

    {
        name:"Biology",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",100],
                [2,"Paper II",40]
            ]
        }
    },

    {
        name:"Chemistry",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",100],
                [2,"Paper II",40]
            ]
        }
    },

    {
        name:"Chichewa",
        junior:{
            papers:[
                [1,"Paper I",50],
                [2,"Paper II",50]
            ]
        },
        senior:{
            papers:[
                [1,"Paper I",70],
                [2,"Paper II",60],
                [3,"Paper III",70]
            ]
        }
    },

    {
        name:"English",
        junior:{
            papers:[
                [1,"Paper I",50],
                [2,"Paper II",50]
            ]
        },
        senior:{
            papers:[
                [1,"Paper I",70],
                [2,"Paper II",60],
                [3,"Paper III",70]
            ]
        }
    },

    {
        name:"Geography",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",100],
                [2,"Paper II",100]
            ]
        }
    },

    {
        name:"History",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",50],
                [2,"Paper II",120]
            ]
        }
    },

    {
        name:"Life Skills",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",50],
                [2,"Paper II",100]
            ]
        }
    },

    {
        name:"Mathematics",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",100],
                [2,"Paper II",100]
            ]
        }
    },

    {
        name:"Physics",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",100],
                [2,"Paper II",40]
            ]
        }
    },

    {
        name:"Social Studies",
        junior:true,
        senior:{
            papers:[
                [1,"Paper I",50],
                [2,"Paper II",100]
            ]
        }
    }

];


/* =========================================================
   SUPABASE CLIENT
========================================================= */

function getSupabaseClient(){

    if(!window.fcaSupabase){

        throw new Error(
            "FCA Supabase client is not available."
        );

    }

    return window.fcaSupabase;

}


/* =========================================================
   ELEMENTS
========================================================= */

function $(id){

    return document.getElementById(id);

}


/* =========================================================
   DATABASE STATUS
========================================================= */

function setDatabaseStatus(
    message,
    type
){

    const status =
        $("databaseStatus");

    const text =
        $("databaseStatusText");


    if(!status || !text){

        return;

    }


    status.className =
        "database-status " +
        type;


    text.textContent =
        message;

}


/* =========================================================
   CHECK ADMIN AUTHORIZATION
========================================================= */

async function checkAdminAuthorization(){

    try{

        db =
            getSupabaseClient();


        const {
            data,
            error
        } =
            await db
                .auth
                .getSession();


        if(error){

            throw error;

        }


        if(
            !data ||
            !data.session ||
            !data.session.user
        ){

            window.location.replace(
                "admin-login.html"
            );

            return false;

        }


        const email =
            data.session.user.email
                ?.trim()
                .toLowerCase();


        if(
            email !==
            FCA_ADMIN_EMAIL
        ){

            await db
                .auth
                .signOut();


            window.location.replace(
                "admin-login.html"
            );

            return false;

        }


        console.log(
            "FCA administrator authorized:",
            email
        );


        return true;

    }

    catch(error){

        console.error(
            "FCA authorization error:",
            error
        );


        setDatabaseStatus(
            "Unable to verify administrator account.",
            "error"
        );


        window.location.replace(
            "admin-login.html"
        );


        return false;

    }

}


/* =========================================================
   LOAD SUBJECTS
========================================================= */

async function loadSubjects(){

    try{

        const {
            data,
            error
        } =
        await db
            .from("subjects")
            .select(`
                id,
                subject_name,
                form_number,
                section,
                created_at,
                updated_at,
                subject_papers (
                    id,
                    paper_number,
                    paper_name,
                    max_marks,
                    created_at,
                    updated_at
                )
            `)
            .order(
                "form_number",
                {
                    ascending:true
                }
            )
            .order(
                "subject_name",
                {
                    ascending:true
                }
            );


        if(error){

            throw error;

        }


        subjects =
            data || [];


        subjects.forEach(
            subject => {

                if(
                    Array.isArray(
                        subject.subject_papers
                    )
                ){

                    subject.subject_papers.sort(
                        (
                            a,
                            b
                        ) =>
                            a.paper_number -
                            b.paper_number
                    );

                }

            }
        );


        renderSubjects();

        updateSummary();


        console.log(
            "FCA subjects loaded:",
            subjects
        );

    }

    catch(error){

        console.error(
            "FCA subject loading error:",
            error
        );


        subjects = [];


        renderSubjects();

        updateSummary();


        setDatabaseStatus(
            error.message ||
            "Unable to load subjects.",
            "error"
        );

    }

}


/* =========================================================
   RENDER SUBJECTS
========================================================= */

function renderSubjects(){

    const search =
        $("subjectSearch")
            .value
            .trim()
            .toLowerCase();


    const formFilter =
        $("formFilter")
            .value;


    for(
        let form = 1;
        form <= 4;
        form++
    ){

        const container =
            $("form" + form + "Subjects");


        if(container){

            container.innerHTML = "";

        }

    }


    const visibleByForm = {
        1:0,
        2:0,
        3:0,
        4:0
    };


    const filtered =
        subjects.filter(
            subject => {

                const matchesSearch =
                    !search ||
                    subject.subject_name
                        .toLowerCase()
                        .includes(search);


                const matchesForm =
                    formFilter === "all" ||
                    String(
                        subject.form_number
                    ) === formFilter;


                return (
                    matchesSearch &&
                    matchesForm
                );

            }
        );


    filtered.sort(
        (
            a,
            b
        ) => {

            if(
                a.form_number !==
                b.form_number
            ){

                return (
                    a.form_number -
                    b.form_number
                );

            }


            return a.subject_name
                .localeCompare(
                    b.subject_name
                );

        }
    );


    filtered.forEach(
        subject => {

            const form =
                Number(
                    subject.form_number
                );


            visibleByForm[form]++;


            const container =
                $("form" + form + "Subjects");


            if(container){

                container.appendChild(
                    createSubjectCard(
                        subject
                    )
                );

            }

        }
    );


    for(
        let form = 1;
        form <= 4;
        form++
    ){

        const container =
            $("form" + form + "Subjects");


        if(
            container &&
            visibleByForm[form] === 0
        ){

            container.innerHTML = `

                <div class="empty-state">

                    <strong>
                        No subjects found
                    </strong>

                    No subjects match the
                    current search or filter.

                </div>

            `;

        }


        const countElement =
            $("form" +
              form +
              "VisibleCount");


        if(countElement){

            countElement.textContent =
                visibleByForm[form] +
                (
                    visibleByForm[form] === 1
                        ? " subject"
                        : " subjects"
                );

        }

    }


    updateFormSectionVisibility();

}


/* =========================================================
   CREATE SUBJECT CARD
========================================================= */

function createSubjectCard(
    subject
){

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "subject-card";


    const papers =
        Array.isArray(
            subject.subject_papers
        )
            ? subject.subject_papers
            : [];


    const totalMarks =
        papers.reduce(
            (
                total,
                paper
            ) =>
                total +
                Number(
                    paper.max_marks
                ),
            0
        );


    const papersHTML =
        papers.length
            ? papers.map(
                paper => `

                    <div class="paper-row">

                        <span class="paper-name">
                            ${escapeHTML(
                                paper.paper_name
                            )}
                        </span>

                        <span class="paper-marks">
                            ${formatMarks(
                                paper.max_marks
                            )} marks
                        </span>

                    </div>

                `
            ).join("")
            : `

                <div class="empty-state">
                    No papers configured.
                </div>

            `;


    card.innerHTML = `

        <div class="subject-card-header">

            <h3>
                ${escapeHTML(
                    subject.subject_name
                )}
            </h3>

            <span class="section-badge">
                ${escapeHTML(
                    subject.section
                )}
            </span>

        </div>


        <div class="paper-list">

            ${papersHTML}

        </div>


        <div class="subject-total">

            <span>
                Total Maximum Marks
            </span>

            <strong>
                ${formatMarks(
                    totalMarks
                )}
            </strong>

        </div>


        <div class="subject-card-actions">

            <button
                type="button"
                class="edit-button"
                data-edit-id="${subject.id}"
            >
                Edit
            </button>


            <button
                type="button"
                class="card-delete-button"
                data-delete-id="${subject.id}"
            >
                Delete
            </button>

        </div>

    `;


    const editButton =
        card.querySelector(
            "[data-edit-id]"
        );


    const deleteButton =
        card.querySelector(
            "[data-delete-id]"
        );


    editButton.addEventListener(
        "click",
        function(){

            openEditSubjectModal(
                subject.id
            );

        }
    );


    deleteButton.addEventListener(
        "click",
        function(){

            openDeleteSubjectModal(
                subject.id
            );

        }
    );


    return card;

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary(){

    $("totalSubjects")
        .textContent =
        subjects.length;


    for(
        let form = 1;
        form <= 4;
        form++
    ){

        const count =
            subjects.filter(
                subject =>
                    Number(
                        subject.form_number
                    ) === form
            ).length;


        $("form" + form + "Count")
            .textContent =
            count;

    }

}


/* =========================================================
   SECTION VISIBILITY
========================================================= */

function updateFormSectionVisibility(){

    const formFilter =
        $("formFilter").value;


    for(
        let form = 1;
        form <= 4;
        form++
    ){

        const section =
            document.querySelector(
                `.form-section[data-form="${form}"]`
            );


        if(!section){

            continue;

        }


        if(
            formFilter === "all" ||
            formFilter === String(form)
        ){

            section.style.display =
                "";

        }

        else{

            section.style.display =
                "none";

        }

    }

}


/* =========================================================
   OPEN ADD MODAL
========================================================= */

function openAddSubjectModal(){

    editingSubjectId =
        null;


    $("subjectModalTitle")
        .textContent =
        "Add Subject";


    $("subjectForm")
        .reset();


    $("papersContainer")
        .innerHTML =
        "";


    $("subjectMessage")
        .className =
        "modal-message";


    paperCounter = 0;


    addPaper(
        "Paper I",
        100
    );


    $("subjectModal")
        .classList
        .add("open");


    $("subjectModal")
        .setAttribute(
            "aria-hidden",
            "false"
        );


    $("subjectName")
        .focus();

}


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditSubjectModal(
    subjectId
){

    const subject =
        subjects.find(
            item =>
                item.id ===
                subjectId
        );


    if(!subject){

        return;

    }


    editingSubjectId =
        subjectId;


    $("subjectModalTitle")
        .textContent =
        "Edit Subject";


    $("subjectName")
        .value =
        subject.subject_name;


    $("subjectFormNumber")
        .value =
        subject.form_number;


    $("subjectSection")
        .value =
        subject.section;


    $("papersContainer")
        .innerHTML =
        "";


    paperCounter = 0;


    const papers =
        Array.isArray(
            subject.subject_papers
        )
            ? subject.subject_papers
            : [];


    if(papers.length){

        papers.forEach(
            paper => {

                addPaper(
                    paper.paper_name,
                    paper.max_marks
                );

            }
        );

    }

    else{

        addPaper(
            "Paper I",
            100
        );

    }


    clearSubjectMessage();


    $("subjectModal")
        .classList
        .add("open");


    $("subjectModal")
        .setAttribute(
            "aria-hidden",
            "false"
        );


    $("subjectName")
        .focus();

}


/* =========================================================
   CLOSE SUBJECT MODAL
========================================================= */

function closeSubjectModal(){

    $("subjectModal")
        .classList
        .remove("open");


    $("subjectModal")
        .setAttribute(
            "aria-hidden",
            "true"
        );


    editingSubjectId =
        null;

}


/* =========================================================
   ADD PAPER
========================================================= */

function addPaper(
    paperName = "",
    maxMarks = ""
){

    const container =
        $("papersContainer");


    if(
        container.children.length >= 3
    ){

        showSubjectMessage(
            "A subject can have a maximum of three papers.",
            "error"
        );

        return;

    }


    paperCounter++;


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "paper-edit-row";


    row.dataset.paperId =
        paperCounter;


    const number =
        container.children.length +
        1;


    const defaultName =
        paperName ||
        (
            number === 1
                ? "Paper I"
                : number === 2
                    ? "Paper II"
                    : "Paper III"
        );


    row.innerHTML = `

        <div class="paper-edit-top">


            <label>

                Paper

                <input
                    type="text"
                    class="paper-name-input"
                    value="${escapeAttribute(
                        defaultName
                    )}"
                    maxlength="50"
                    required
                >

            </label>


            <label>

                Maximum Marks

                <input
                    type="number"
                    class="paper-marks-input"
                    value="${escapeAttribute(
                        maxMarks
                    )}"
                    min="1"
                    max="1000"
                    step="1"
                    required
                >

            </label>


        </div>


        <button
            type="button"
            class="paper-remove-button"
        >
            Remove this paper
        </button>

    `;


    const removeButton =
        row.querySelector(
            ".paper-remove-button"
        );


    removeButton.addEventListener(
        "click",
        function(){

            row.remove();

            renumberPapers();

            calculateModalTotal();

        }
    );


    const marksInput =
        row.querySelector(
            ".paper-marks-input"
        );


    marksInput.addEventListener(
        "input",
        calculateModalTotal
    );


    container.appendChild(
        row
    );


    renumberPapers();

    calculateModalTotal();

}


/* =========================================================
   RENUMBER PAPERS
========================================================= */

function renumberPapers(){

    const rows =
        document.querySelectorAll(
            ".paper-edit-row"
        );


    rows.forEach(
        (
            row,
            index
        ) => {

            const number =
                index + 1;


            const nameInput =
                row.querySelector(
                    ".paper-name-input"
                );


            if(
                !nameInput.value.trim()
            ){

                nameInput.value =
                    getDefaultPaperName(
                        number
                    );

            }

        }
    );

}


/* =========================================================
   DEFAULT PAPER NAME
========================================================= */

function getDefaultPaperName(
    number
){

    if(number === 1){

        return "Paper I";

    }


    if(number === 2){

        return "Paper II";

    }


    return "Paper III";

}


/* =========================================================
   CALCULATE TOTAL
========================================================= */

function calculateModalTotal(){

    const inputs =
        document.querySelectorAll(
            ".paper-marks-input"
        );


    let total = 0;


    inputs.forEach(
        input => {

            const value =
                Number(
                    input.value
                );


            if(
                Number.isFinite(value)
            ){

                total += value;

            }

        }
    );


    $("totalMaxMarks")
        .textContent =
        formatMarks(total);

}


/* =========================================================
   SAVE SUBJECT
========================================================= */

async function saveSubject(
    event
){

    event.preventDefault();


    clearSubjectMessage();


    const name =
        $("subjectName")
            .value
            .trim();


    const formNumber =
        Number(
            $("subjectFormNumber")
                .value
        );


    const section =
        $("subjectSection")
            .value;


    /* -----------------------------------------------
       VALIDATION
    ------------------------------------------------ */

    if(!name){

        showSubjectMessage(
            "Please enter a subject name.",
            "error"
        );

        return;

    }


    if(
        !formNumber ||
        formNumber < 1 ||
        formNumber > 4
    ){

        showSubjectMessage(
            "Please select a valid form.",
            "error"
        );

        return;

    }


    if(
        section !== "Junior" &&
        section !== "Senior"
    ){

        showSubjectMessage(
            "Please select a valid section.",
            "error"
        );

        return;

    }


    const rows =
        Array.from(
            document.querySelectorAll(
                ".paper-edit-row"
            )
        );


    if(rows.length < 1){

        showSubjectMessage(
            "A subject must have at least one paper.",
            "error"
        );

        return;

    }


    if(rows.length > 3){

        showSubjectMessage(
            "A subject can have a maximum of three papers.",
            "error"
        );

        return;

    }


    const papers = [];


    for(
        let index = 0;
        index < rows.length;
        index++
    ){

        const row =
            rows[index];


        const paperName =
            row.querySelector(
                ".paper-name-input"
            )
            .value
            .trim();


        const maxMarks =
            Number(
                row.querySelector(
                    ".paper-marks-input"
                ).value
            );


        if(!paperName){

            showSubjectMessage(
                `Please enter a name for Paper ${index + 1}.`,
                "error"
            );

            return;

        }


        if(
            !Number.isFinite(maxMarks) ||
            maxMarks <= 0
        ){

            showSubjectMessage(
                `Please enter valid maximum marks for Paper ${index + 1}.`,
                "error"
            );

            return;

        }


        papers.push({

            paper_number:
                index + 1,

            paper_name:
                paperName,

            max_marks:
                maxMarks

        });

    }


    /* -----------------------------------------------
       DUPLICATE CHECK
    ------------------------------------------------ */

    const duplicate =
        subjects.find(
            subject => {

                const sameName =
                    subject.subject_name
                        .trim()
                        .toLowerCase() ===
                    name.toLowerCase();


                const sameForm =
                    Number(
                        subject.form_number
                    ) ===
                    formNumber;


                const differentRecord =
                    subject.id !==
                    editingSubjectId;


                return (
                    sameName &&
                    sameForm &&
                    differentRecord
                );

            }
        );


    if(duplicate){

        showSubjectMessage(
            `${name} already exists for Form ${formNumber}.`,
            "error"
        );

        return;

    }


    const saveButton =
        $("saveSubjectButton");


    saveButton.disabled =
        true;


    saveButton.textContent =
        "Saving...";


    try{

        let subjectId =
            editingSubjectId;


        /* -------------------------------------------
           UPDATE
        ------------------------------------------- */

        if(editingSubjectId){

            const {
                error
            } =
            await db
                .from("subjects")
                .update({

                    subject_name:
                        name,

                    form_number:
                        formNumber,

                    section:
                        section,
                })
                .eq(
                    "id",
                    editingSubjectId
                );


            if(error){

                throw error;

            }


            /* ---------------------------------------
               DELETE OLD PAPERS
            --------------------------------------- */

            const {
                error:
                    deletePapersError
            } =
            await db
                .from("subject_papers")
                .delete()
                .eq(
                    "subject_id",
                    editingSubjectId
                );


            if(deletePapersError){

                throw deletePapersError;

            }

        }


        /* -------------------------------------------
           INSERT
        ------------------------------------------- */

        else{

            const {
                data,
                error
            } =
            await db
                .from("subjects")
                .insert({

                    subject_name:
                        name,

                    form_number:
                        formNumber,

                    section:
                        section,

                })
                .select(
                    "id"
                )
                .single();


            if(error){

                throw error;

            }


            subjectId =
                data.id;

        }


        /* -------------------------------------------
           INSERT PAPERS
        ------------------------------------------- */

        const paperRows =
            papers.map(
                paper => ({

                    subject_id:
                        subjectId,

                    paper_number:
                        paper.paper_number,

                    paper_name:
                        paper.paper_name,

                    max_marks:
                        paper.max_marks

                })
            );


        const {
            error:
                paperError
        } =
        await db
            .from("subject_papers")
            .insert(
                paperRows
            );


        if(paperError){

            throw paperError;

        }


        /* -------------------------------------------
           SUCCESS
        ------------------------------------------- */

        closeSubjectModal();


        await loadSubjects();


        console.log(
            "FCA subject saved successfully."
        );

    }

    catch(error){

        console.error(
            "FCA subject save error:",
            error
        );


        showSubjectMessage(
            error.message ||
            "Unable to save subject.",
            "error"
        );

    }

    finally{

        saveButton.disabled =
            false;


        saveButton.textContent =
            "Save Subject";

    }

}


/* =========================================================
   DELETE MODAL
========================================================= */

function openDeleteSubjectModal(
    subjectId
){

    const subject =
        subjects.find(
            item =>
                item.id ===
                subjectId
        );


    if(!subject){

        return;

    }


    selectedDeleteSubjectId =
        subjectId;


    $("deleteSubjectName")
        .textContent =
        `${subject.subject_name} — Form ${subject.form_number}`;


    $("deleteMessage")
        .className =
        "modal-message";


    $("deleteMessage")
        .textContent =
        "";


    $("deleteModal")
        .classList
        .add("open");


    $("deleteModal")
        .setAttribute(
            "aria-hidden",
            "false"
        );

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteModal(){

    $("deleteModal")
        .classList
        .remove("open");


    $("deleteModal")
        .setAttribute(
            "aria-hidden",
            "true"
        );


    selectedDeleteSubjectId =
        null;

}


/* =========================================================
   DELETE SUBJECT
========================================================= */

async function confirmDeleteSubject(){

    if(!selectedDeleteSubjectId){

        return;

    }


    const deleteButton =
        $("confirmDeleteButton");


    deleteButton.disabled =
        true;


    deleteButton.textContent =
        "Deleting...";


    clearDeleteMessage();


    try{

        const {
            error
        } =
        await db
            .from("subjects")
            .delete()
            .eq(
                "id",
                selectedDeleteSubjectId
            );


        if(error){

            throw error;

        }


        closeDeleteModal();


        await loadSubjects();


        console.log(
            "FCA subject deleted."
        );

    }

    catch(error){

        console.error(
            "FCA subject deletion error:",
            error
        );


        showDeleteMessage(
            error.message ||
            "Unable to delete subject.",
            "error"
        );

    }

    finally{

        deleteButton.disabled =
            false;


        deleteButton.textContent =
            "Delete Subject";

    }

}


/* =========================================================
   SUBJECT MESSAGE
========================================================= */

function showSubjectMessage(
    message,
    type
){

    const element =
        $("subjectMessage");


    if(!element){

        return;

    }


    element.textContent =
        message;


    element.className =
        "modal-message " +
        type;

}


function clearSubjectMessage(){

    const element =
        $("subjectMessage");


    if(!element){

        return;

    }


    element.textContent =
        "";


    element.className =
        "modal-message";

}


/* =========================================================
   DELETE MESSAGE
========================================================= */

function showDeleteMessage(
    message,
    type
){

    const element =
        $("deleteMessage");


    if(!element){

        return;

    }


    element.textContent =
        message;


    element.className =
        "modal-message " +
        type;

}


function clearDeleteMessage(){

    const element =
        $("deleteMessage");


    if(!element){

        return;

    }


    element.textContent =
        "";


    element.className =
        "modal-message";

}


/* =========================================================
   SEARCH
========================================================= */

function handleSearch(){

    renderSubjects();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
){

    return String(value ?? "")
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


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    value
){

    return escapeHTML(
        value
    );

}


/* =========================================================
   FORMAT MARKS
========================================================= */

function formatMarks(
    value
){

    const number =
        Number(value);


    if(
        !Number.isFinite(number)
    ){

        return "0";

    }


    return Number.isInteger(
        number
    )
        ? String(number)
        : number.toFixed(2);

}


/* =========================================================
   LOAD DEFAULT SUBJECTS
=========================================================

   This function does NOT automatically insert subjects.

   It is available if you want to populate the database
   with FCA's initial 12 subjects.

========================================================= */

async function seedDefaultSubjects(){

    if(!db){

        throw new Error(
            "Database is not connected."
        );

    }


    const existing =
        subjects.length;


    if(existing > 0){

        throw new Error(
            "Subjects already exist. Default subjects were not inserted."
        );

    }


    const records = [];


    for(
        let form = 1;
        form <= 4;
        form++
    ){

        const section =
            form <= 2
                ? "Junior"
                : "Senior";


        DEFAULT_SUBJECTS.forEach(
            subject => {

                let papers;


                if(
                    form <= 2
                ){

                    if(
                        subject.junior &&
                        typeof subject.junior === "object"
                    ){

                        papers =
                            subject.junior.papers;

                    }

                    else{

                        papers = [

                            [
                                1,
                                "Paper I",
                                100
                            ]

                        ];

                    }

                }

                else{

                    papers =
                        subject.senior.papers;

                }


                records.push({

                    subject_name:
                        subject.name,

                    form_number:
                        form,

                    section:
                        section,

                    papers:
                        papers

                });

            }
        );

    }


    for(
        const record of records
    ){

        const {
            data,
            error
        } =
        await db
            .from("subjects")
            .insert({

                subject_name:
                    record.subject_name,

                form_number:
                    record.form_number,

                section:
                    record.section,

            })
            .select(
                "id"
            )
            .single();


        if(error){

            throw error;

        }


        const paperRows =
            record.papers.map(
                paper => ({

                    subject_id:
                        data.id,

                    paper_number:
                        paper[0],

                    paper_name:
                        paper[1],

                    max_marks:
                        paper[2]

                })
            );


        const {
            error:
                paperError
        } =
        await db
            .from("subject_papers")
            .insert(
                paperRows
            );


        if(paperError){

            throw paperError;

        }

    }


    await loadSubjects();

}


/* =========================================================
   ATTACH EVENTS
========================================================= */

function attachEvents(){

    $("addSubjectButton")
        .addEventListener(
            "click",
            openAddSubjectModal
        );


    $("closeSubjectModal")
        .addEventListener(
            "click",
            closeSubjectModal
        );


    $("cancelSubjectButton")
        .addEventListener(
            "click",
            closeSubjectModal
        );


    $("subjectForm")
        .addEventListener(
            "submit",
            saveSubject
        );


    $("addPaperButton")
        .addEventListener(
            "click",
            function(){

                const number =
                    document.querySelectorAll(
                        ".paper-edit-row"
                    ).length + 1;


                addPaper(
                    getDefaultPaperName(
                        number
                    ),
                    ""
                );

            }
        );


    $("cancelDeleteButton")
        .addEventListener(
            "click",
            closeDeleteModal
        );


    $("confirmDeleteButton")
        .addEventListener(
            "click",
            confirmDeleteSubject
        );


    $("subjectSearch")
        .addEventListener(
            "input",
            handleSearch
        );


    $("formFilter")
        .addEventListener(
            "change",
            handleSearch
        );


    $("subjectModal")
        .addEventListener(
            "click",
            function(event){

                if(
                    event.target ===
                    $("subjectModal")
                ){

                    closeSubjectModal();

                }

            }
        );


    $("deleteModal")
        .addEventListener(
            "click",
            function(event){

                if(
                    event.target ===
                    $("deleteModal")
                ){

                    closeDeleteModal();

                }

            }
        );


    document.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Escape"
            ){

                closeSubjectModal();

                closeDeleteModal();

            }

        }
    );

}


/* =========================================================
   SESSION MONITOR
========================================================= */

function startSessionMonitor(){

    db.auth.onAuthStateChange(
        function(
            event,
            session
        ){

            console.log(
                "FCA Auth Event:",
                event
            );


            if(
                event ===
                "SIGNED_OUT"
            ){

                window.location.replace(
                    "admin-login.html"
                );

                return;

            }


            if(!session){

                window.location.replace(
                    "admin-login.html"
                );

            }

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeSubjects(){

    console.log(
        "FCA Subjects initializing..."
    );


    try{

        const authorized =
            await checkAdminAuthorization();


        if(!authorized){

            return;

        }


        attachEvents();


        startSessionMonitor();


        await loadSubjects();


        console.log(
            "FCA Subjects initialized successfully."
        );

    }

    catch(error){

        console.error(
            "FCA Subjects initialization error:",
            error
        );


        setDatabaseStatus(
            error.message ||
            "Subjects page failed to initialize.",
            "error"
        );

    }

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeSubjects
);