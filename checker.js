// ==========================================
// COURSEPATH - COURSE CHECKER
// ==========================================


// ------------------------------------------
// ELEMENTS
// ------------------------------------------

const courseSelect =
    document.getElementById("course");

const prerequisiteBox =
    document.getElementById("prerequisiteBox");

const prerequisiteContent =
    document.getElementById("prerequisiteContent");

const checkboxes =
    document.querySelectorAll(".completed-course");

const selectedCount =
    document.getElementById("selectedCount");

const result =
    document.getElementById("result");


// ------------------------------------------
// UPDATE COMPLETED COURSE COUNT
// ------------------------------------------

function updateSelectedCount() {

    const selected =
        document.querySelectorAll(
            ".completed-course:checked"
        ).length;

    selectedCount.textContent = selected;
}


checkboxes.forEach(function (checkbox) {

    checkbox.addEventListener(
        "change",
        updateSelectedCount
    );

});


// ------------------------------------------
// SHOW PREREQUISITES
// ------------------------------------------

function showPrerequisites() {

    const selectedCourse =
        courseSelect.value;


    // Nothing selected

    if (selectedCourse === "") {

        prerequisiteBox.classList.add("hidden");

        prerequisiteContent.innerHTML = "";

        return;
    }


    const prerequisites =
        courseGraph[selectedCourse] || [];


    prerequisiteBox.classList.remove("hidden");


    // No prerequisites

    if (prerequisites.length === 0) {

        prerequisiteContent.innerHTML = `
            <div class="prerequisite-item">
                <span>✓</span>
                No prerequisites required
            </div>
        `;

        return;
    }


    // Show required prerequisites

    let html = "";

    prerequisites.forEach(function (prerequisite) {

        html += `
            <div class="prerequisite-item">
                <span>→</span>
                ${prerequisite}
            </div>
        `;

    });


    prerequisiteContent.innerHTML = html;
}


// Course selection event

courseSelect.addEventListener(
    "change",
    showPrerequisites
);


// ------------------------------------------
// CHECK ELIGIBILITY
// ------------------------------------------

async function checkEligibility() {

    const course =
        courseSelect.value;


    const selectedCourses =
        document.querySelectorAll(
            ".completed-course:checked"
        );


    const completed = [];


    selectedCourses.forEach(function (checkbox) {

        completed.push(checkbox.value);

    });


    // --------------------------------------
    // COURSE NOT SELECTED
    // --------------------------------------

    if (course === "") {

        result.className = "error";

        result.innerHTML = `
            <strong>⚠ Please select a target course.</strong>
            <br>
            Choose the course you want to analyse.
        `;

        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;
    }


    // --------------------------------------
    // LOADING
    // --------------------------------------

    result.className = "";

    result.style.display = "block";

    result.innerHTML = `
        <strong>⏳ Analysing...</strong>
        <br>
        Checking prerequisite relationships.
    `;


    try {

        const response = await fetch(
            "/check",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    course: course,

                    completed: completed

                })
            }
        );


        const data =
            await response.json();


        // ----------------------------------
        // ELIGIBLE
        // ----------------------------------

        if (data.eligible) {

            result.className = "success";

            result.innerHTML = `
                <strong>✓ YOU ARE ELIGIBLE</strong>
                <br><br>

                You are eligible to take
                <strong>${data.course}</strong>.

                <br><br>

                All required prerequisites
                have been completed successfully.
            `;

        }


        // ----------------------------------
        // NOT ELIGIBLE
        // ----------------------------------

        else {

            result.className = "error";


            let missingHTML = "";


            data.missing.forEach(
                function (item) {

                    missingHTML += `
                        <div style="
                            margin-top:7px;
                            font-weight:600;
                        ">
                            → ${item}
                        </div>
                    `;

                }
            );


            result.innerHTML = `
                <strong>
                    ✕ PREREQUISITE REQUIRED
                </strong>

                <br><br>

                You are not eligible to take
                <strong>${data.course}</strong> yet.

                <br><br>

                <strong>
                    Missing prerequisite(s):
                </strong>

                ${missingHTML}
            `;

        }


        // Scroll to result

        result.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    // --------------------------------------
    // SERVER ERROR
    // --------------------------------------

    catch (error) {

        result.className = "error";

        result.innerHTML = `
            <strong>⚠ Server Connection Error</strong>

            <br><br>

            Please make sure the Flask server
            is running.
        `;

    }

}