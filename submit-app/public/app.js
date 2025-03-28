document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("category"); // Dropdown for selecting category
    const newCategoryInput = document.getElementById("new-category"); // Input for new category
    const submitForm = document.getElementById("submit-form"); // Form for submitting a new question
    const messageBox = document.getElementById("message-box"); // Box to display success or error messages

    // ✅ Fetch and Populate Categories from Backend
    async function fetchCategories() {
        try {
            // Fetch categories from the backend API
            const response = await fetch("http://localhost:5001/categories");
            const categories = await response.json(); // Parse the response into a JSON array
            categorySelect.innerHTML = '<option value="">Select a Category</option>'; // Clear the existing categories

            // Loop through the categories and populate the dropdown
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id; // Set the value to the category ID
                option.textContent = category.name; // Set the display name to the category name
                categorySelect.appendChild(option); // Add the option to the dropdown
            });
        } catch (error) {
            console.error("Error fetching categories:", error); // Log any errors
        }
    }

    fetchCategories(); // Load categories as soon as the page loads

    // ✅ Handle Question Submission
    submitForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Get form data values
        const questionText = document.getElementById("question").value.trim();
        const option1 = document.getElementById("option1").value.trim();
        const option2 = document.getElementById("option2").value.trim();
        const option3 = document.getElementById("option3").value.trim();
        const option4 = document.getElementById("option4").value.trim();
        const correctOptionInput = document.querySelector('input[name="correct-option"]:checked'); // Get the selected correct answer option

        // Validate if the correct option is selected
        if (!correctOptionInput) {
            showMessage("❌ Please select the correct answer.", "error");
            return; // Exit if no correct answer is selected
        }

        const correctOption = correctOptionInput.value; // Get the value of the correct option
        const selectedCategory = categorySelect.value; // Get the selected category
        const newCategory = newCategoryInput.value.trim(); // Get the value of the new category input

        // Validate that all form fields are filled out
        if (!questionText || !option1 || !option2 || !option3 || !option4 || !correctOption) {
            showMessage("❌ All fields are required.", "error");
            return; // Exit if any field is empty
        }

        // Determine the category ID: either use the selected category or create a new one
        let categoryId = selectedCategory;
        if (newCategory) {
            categoryId = await addNewCategory(newCategory); // Call function to add the new category
            if (!categoryId) {
                showMessage("❌ Error adding new category.", "error");
                return; // Exit if the new category couldn't be added
            }
        }

        // Prepare the payload to be sent to the backend
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
            // Send the question submission request to the backend
            const response = await fetch("http://localhost:5001/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload), // Send form data as JSON
            });

            const result = await response.json(); // Parse the response from the backend
            if (response.ok) {
                showMessage("✅ Question submitted successfully!", "success"); // Show success message
                submitForm.reset(); // Reset the form after successful submission
                fetchCategories(); // Refresh the category list to include any new categories
            } else {
                showMessage(`❌ Error: ${result.error}`, "error"); // Show error message if submission failed
            }
        } catch (error) {
            showMessage("❌ Server error. Try again later.", "error"); // Show error if there was a server issue
            console.error("Submission Error:", error); // Log the error for debugging
        }
    });

    // Function to Add New Category
    async function addNewCategory(categoryName) {
        try {
            // Send a request to the backend to add a new category
            const response = await fetch("http://localhost:5001/add-category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: categoryName }), // Send the new category name as JSON
            });

            const result = await response.json(); // Parse the response
            if (response.ok) {
                return result.category_id; // Return the new category ID
            } else {
                console.error("Error adding new category:", result); // Log any errors
                return null; // Return null if there was an error
            }
        } catch (error) {
            console.error("Category Error:", error); // Log any errors
            return null; // Return null if there was an error
        }
    }

    // Function to Show Success/Error Messages
    function showMessage(message, type) {
        messageBox.textContent = message; // Set the message text
        messageBox.className = `message ${type}`; // Set the message class based on the type (success or error)
        messageBox.style.display = "block"; // Display the message box
        setTimeout(() => (messageBox.style.display = "none"), 3000); // Hide the message box after 3 seconds
    }
});
