document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("pageLoader");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => loader.remove(), 400);
        }, 350);
    }

    const form = document.getElementById("surveyForm");
    if (!form) return;

    const questions = [...document.querySelectorAll(".question")];
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const submitBtn = document.getElementById("submitBtn");
    const progressBar = document.getElementById("progressBar");
    const stepLabel = document.getElementById("stepLabel");
    const progressPercent = document.getElementById("progressPercent");
    const errorBox = document.getElementById("formError");
    const featureLimit = document.getElementById("featureLimit");

    let currentStep = 0;

    function update() {
        questions.forEach((q, i) => q.classList.toggle("active", i === currentStep));

        const percent = Math.round(((currentStep + 1) / questions.length) * 100);
        stepLabel.textContent = `Question ${currentStep + 1} of ${questions.length}`;
        progressPercent.textContent = `${percent}%`;
        progressBar.style.width = `${percent}%`;

        prevBtn.style.visibility = currentStep === 0 ? "hidden" : "visible";
        nextBtn.style.display = currentStep === questions.length - 1 ? "none" : "inline-flex";
        submitBtn.style.display = currentStep === questions.length - 1 ? "inline-flex" : "none";

        errorBox.style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = "block";
    }

    function validateStep() {
        const q = questions[currentStep];

        if (currentStep === 0) {
            if (!form.querySelector('input[name="flock_size"]:checked')) {
                showError("Please select your flock size.");
                return false;
            }
            if (!form.querySelector('input[name="poultry_type"]:checked')) {
                showError("Please select at least one type of poultry.");
                return false;
            }
        }

        if (currentStep === 1) {
            if (!form.querySelector('input[name="usage_frequency"]:checked')) {
                showError("Please tell us how often you use Poultry Tracker.");
                return false;
            }
        }

        if (currentStep === 2) {
            const selected = form.querySelectorAll('input[name="valuable_features"]:checked').length;
            if (selected === 0) {
                showError("Please choose at least one feature.");
                return false;
            }
            if (selected > 3) {
                showError("Please choose no more than 3 features.");
                return false;
            }
        }

        if (currentStep === 4 && !form.querySelector('input[name="pay_interest"]:checked')) {
            showError("Please choose an answer.");
            return false;
        }

        if (currentStep === 5 && !form.querySelector('input[name="price"]:checked')) {
            showError("Please choose a price option.");
            return false;
        }

        return true;
    }

    form.querySelectorAll('input[name="valuable_features"]').forEach(input => {
        input.addEventListener("change", () => {
            const count = form.querySelectorAll('input[name="valuable_features"]:checked').length;
            featureLimit.textContent = `${count}/3 selected`;
            featureLimit.classList.toggle("error", count > 3);
        });
    });

    nextBtn.addEventListener("click", () => {
        if (!validateStep()) return;
        currentStep++;
        update();
    });

    prevBtn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            update();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateStep()) return;

        const consent = document.getElementById("consent");
        if (!consent.checked) {
            showError("Please confirm that your answers may be used to improve Poultry Tracker.");
            return;
        }

        const data = {};
        const formData = new FormData(form);

        for (const [key, value] of formData.entries()) {
            if (key === "poultry_type" || key === "current_features" || key === "valuable_features") {
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        data.submitted_at = new Date().toISOString();

        /*
         * SUPABASE HOOK:
         * Replace this block with your Supabase REST/API call when your
         * survey_responses table is ready.
         *
         * Example fields to store:
         * flock_size, poultry_type, usage_frequency, current_features,
         * valuable_features, missing_feature, biggest_problem, pay_interest,
         * price, pay_reason, improvement, contact, submitted_at
         */

        try {
            // Temporary local confirmation so the site works immediately.
            console.log("Survey response:", data);

            // Remove this line when your real backend is connected.
            localStorage.setItem("poultry_tracker_survey_submitted", "true");

            window.location.href = "./thank-you.html";
        } catch (error) {
            console.error(error);
            showError("Something went wrong. Please try again.");
        }
    });

    update();
});
