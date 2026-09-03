/* =========================================================
   FIRST CLASS ACADEMY
   FCA ADMIN DASHBOARD
   SUPABASE DASHBOARD
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    console.log("FCA Admin Dashboard starting...");


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const databaseStatus =
        document.getElementById("databaseStatus");

    const teacherCount =
        document.getElementById("dashboardTeacherCount");

    const classCount =
        document.getElementById("dashboardClassCount");

    const studentCount =
        document.getElementById("dashboardStudentCount");

    const form1Count =
        document.getElementById("form1StudentCount");

    const form2Count =
        document.getElementById("form2StudentCount");

    const form3Count =
        document.getElementById("form3StudentCount");

    const form4Count =
        document.getElementById("form4StudentCount");


    /* =====================================================
       CHECK SUPABASE
    ===================================================== */

    if (!window.fcaSupabase) {

        console.error(
            "FCA Supabase client was not created."
        );

        if (databaseStatus) {

            databaseStatus.textContent =
                "❌ FCA database is not connected.";

            databaseStatus.classList.add(
                "error"
            );
        }

        return;
    }


    console.log(
        "FCA Supabase client loaded successfully."
    );


    if (databaseStatus) {

        databaseStatus.textContent =
            "Connecting to FCA database...";

        databaseStatus.classList.remove(
            "connected",
            "error"
        );
    }


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    try {

        const supabase =
            window.fcaSupabase;


        /* =================================================
           TEACHERS
        ================================================= */

        const {
            count: teachers,
            error: teachersError
        } =
            await supabase
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


        /* =================================================
           CLASSES
        ================================================= */

        const {
            data: classes,
            error: classesError
        } =
            await supabase
                .from(window.FCA_TABLES.classes)
                .select(
                    "id, class_name, form_number"
                );


        if (classesError) {

            throw new Error(
                "Classes: " +
                classesError.message
            );
        }


        const allClasses =
            Array.isArray(classes)
                ? classes
                : [];


        /* =================================================
           STUDENTS
           
           NEW STUDENTS TABLE:

           id
           full_name
           student_id
           access_password
           class_id
           form_number
           subjects
        ================================================= */

        const {
            data: students,
            error: studentsError
        } =
            await supabase
                .from(window.FCA_TABLES.students)
                .select(
                    "id, full_name, student_id, class_id, form_number"
                );


        if (studentsError) {

            throw new Error(
                "Students: " +
                studentsError.message
            );
        }


        const allStudents =
            Array.isArray(students)
                ? students
                : [];


        /* =================================================
           NORMALIZE FORM
        ================================================= */

        function normalizeForm(value) {

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return null;
            }


            const text =
                String(value)
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "");


            if (
                text === "1" ||
                text === "form1"
            ) {

                return 1;
            }


            if (
                text === "2" ||
                text === "form2"
            ) {

                return 2;
            }


            if (
                text === "3" ||
                text === "form3"
            ) {

                return 3;
            }


            if (
                text === "4" ||
                text === "form4"
            ) {

                return 4;
            }


            const number =
                Number(text);


            if (
                number >= 1 &&
                number <= 4
            ) {

                return number;
            }


            return null;
        }


        /* =================================================
           FORM COUNTS
           
           IMPORTANT:
           students.form_number
        ================================================= */

        const form1Students =
            allStudents.filter(
                student =>
                    normalizeForm(
                        student.form_number
                    ) === 1
            );


        const form2Students =
            allStudents.filter(
                student =>
                    normalizeForm(
                        student.form_number
                    ) === 2
            );


        const form3Students =
            allStudents.filter(
                student =>
                    normalizeForm(
                        student.form_number
                    ) === 3
            );


        const form4Students =
            allStudents.filter(
                student =>
                    normalizeForm(
                        student.form_number
                    ) === 4
            );


        /* =================================================
           CLASS COUNT
           
           Use actual classes in database.
        ================================================= */

        const actualClassCount =
            allClasses.length;


        /* =================================================
           UPDATE TEACHER COUNT
        ================================================= */

        if (teacherCount) {

            teacherCount.textContent =
                teachers ?? 0;
        }


        /* =================================================
           UPDATE CLASS COUNT
        ================================================= */

        if (classCount) {

            classCount.textContent =
                actualClassCount;
        }


        /* =================================================
           UPDATE TOTAL STUDENTS
        ================================================= */

        if (studentCount) {

            studentCount.textContent =
                allStudents.length;
        }


        /* =================================================
           UPDATE FORM 1
        ================================================= */

        if (form1Count) {

            form1Count.textContent =
                form1Students.length;
        }


        /* =================================================
           UPDATE FORM 2
        ================================================= */

        if (form2Count) {

            form2Count.textContent =
                form2Students.length;
        }


        /* =================================================
           UPDATE FORM 3
        ================================================= */

        if (form3Count) {

            form3Count.textContent =
                form3Students.length;
        }


        /* =================================================
           UPDATE FORM 4
        ================================================= */

        if (form4Count) {

            form4Count.textContent =
                form4Students.length;
        }


        /* =================================================
           DATABASE CONNECTED
        ================================================= */

        if (databaseStatus) {

            databaseStatus.textContent =
                "FCA database connected";

            databaseStatus.classList.remove(
                "error"
            );

            databaseStatus.classList.add(
                "connected"
            );
        }


        /* =================================================
           CONSOLE INFORMATION
        ================================================= */

        console.log(
            "FCA Dashboard loaded successfully."
        );

        console.log(
            "Teachers:",
            teachers
        );

        console.log(
            "Classes:",
            actualClassCount
        );

        console.log(
            "Total Students:",
            allStudents.length
        );

        console.log(
            "Form 1:",
            form1Students.length
        );

        console.log(
            "Form 2:",
            form2Students.length
        );

        console.log(
            "Form 3:",
            form3Students.length
        );

        console.log(
            "Form 4:",
            form4Students.length
        );

    }


    /* =====================================================
       DATABASE ERROR
    ===================================================== */

    catch (error) {

        console.error(
            "FCA dashboard database error:",
            error
        );


        if (databaseStatus) {

            databaseStatus.textContent =
                "❌ Database error: " +
                error.message;

            databaseStatus.classList.remove(
                "connected"
            );

            databaseStatus.classList.add(
                "error"
            );
        }

    }

});