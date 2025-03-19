document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("category");
    const newCategoryInput = document.getElementById("new-category");
    const submitForm = document.getElementById("submit-form");
    const messageBox = document.getElementById("message-box");

    // ✅ Fetch and Populate Categories from Backend
    async function fetchCategories() {
        try {
            const response = await fetch("http://localhost:5001/categories");
            const categories = await response.json();
            categorySelect.innerHTML = '<option value="">Select a Category</option>';

            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    fetchCategories(); // Load categories when page loads

    // ✅ Handle Question Submission
    submitForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const questionText = document.getElementById("question").value.trim();
        const option1 = document.getElementById("option1").value.trim();
        const option2 = document.getElementById("option2").value.trim();
        const option3 = document.getElementById("option3").value.trim();
        const option4 = document.getElementById("option4").value.trim();
        const correctOptionInput = document.querySelector('input[name="correct-option"]:checked');

        if (!correctOptionInput) {
            showMessage("❌ Please select the correct answer.", "error");
            return;
        }

        const correctOption = correctOptionInput.value;
        const selectedCategory = categorySelect.value;
        const newCategory = newCategoryInput.value.trim();

        // Validate form values
        if (!questionText || !option1 || !option2 || !option3 || !option4 || !correctOption) {
            showMessage("❌ All fields are required.", "error");
            return;
        }

        // Determine the category_id: either selected or newly created
        let categoryId = selectedCategory;
        if (newCategory) {
            categoryId = await addNewCategory(newCategory);
            if (!categoryId) {
                showMessage("❌ Error adding new category.", "error");
                return;
            }
        }

        // Prepare the submission payload
        const payload = {
            category_id: categoryId,
            question_text: questionText,
            option_1: option1,
            option_2: option2,
            option_3: option3,
            option_4: option4,
            correct_option: correctOption,
        };

        try {
            const response = await fetch("http://localhost:5001/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok) {
                showMessage("✅ Question submitted successfully!", "success");
                submitForm.reset(); // Clear form
                fetchCategories(); // Refresh category list
            } else {
                showMessage(`❌ Error: ${result.error}`, "error");
            }
        } catch (error) {
            showMessage("❌ Server error. Try again later.", "error");
            console.error("Submission Error:", error);
        }
    });

    // Function to Add New Category
    async function addNewCategory(categoryName) {
        try {
            const response = await fetch("http://localhost:5001/add-category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: categoryName }),
            });

            const result = await response.json();
            if (response.ok) {
                return result.category_id;
            } else {
                console.error("Error adding new category:", result);
                return null;
            }
        } catch (error) {
            console.error("Category Error:", error);
            return null;
        }
    }

    // Function to Show Success/Error Messages
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message ${type}`;
        messageBox.style.display = "block";
        setTimeout(() => (messageBox.style.display = "none"), 3000);
    }
});
