document.addEventListener("DOMContentLoaded", () => {
    const dataList = document.getElementById("data-list");
    const dataForm = document.getElementById("data-form");
    const dataInput = document.getElementById("data-input");
  
    // Function to fetch data and display it
    const fetchData = async () => {
      try {
        const response = await fetch("/data"); // GET request to fetch data
        const data = await response.json(); // Parse the response JSON
        dataList.innerHTML = ""; // Clear the list before adding new items
        data.forEach((item) => {
          // Create a new list item for each task
          const li = document.createElement("li");
          li.textContent = item.description;
  
          // Create a delete button
          const deleteButton = document.createElement("button");
          deleteButton.classList.add("deleteBtn");
          deleteButton.textContent = "Delete";
  
          // Bind the delete button to the specific task
          deleteButton.onclick = async () => {
            try {
              const response = await deleteTask(item.id);
              if (response.ok) {
                fetchData();  // Refresh the list of tasks
              } else {
                console.error("Failed to delete task");
              }
            } catch (error) {
              console.error("Error deleting task:", error);
            }
          };
  
          // Create an update button
          const updateButton = document.createElement("button");
          updateButton.classList.add("updateBtn");
          updateButton.textContent = "Update";
  
          // Bind the update button to the specific task
          updateButton.onclick = async () => {
            if(!item.edited) {}
            if (li.classList.contains("editing")) {
              // Save the updated description
              const input = li.querySelector("input");
              item.description = input.value; // Get the updated description
  
              try {
                const response = await updateTask(item);
                if (response.ok) {
                  li.textContent = `${item.description}`; // Update the li text
                  li.appendChild(updateButton);
                  li.appendChild(deleteButton); // Re-append the buttons after updating
                  li.classList.remove("editing");
                } else {
                  console.error("Failed to update task");
                }
              } catch (error) {
                console.error("Error updating task:", error);
              }
            } else {
              // Set to editing mode by adding an input field
              const input = document.createElement("input");
              input.type = "text";
              input.value = item.description; // Set input value to the current description
              li.textContent = ''; // Clear the current text
              li.appendChild(input); // Append the input field
              li.appendChild(updateButton);
              li.appendChild(deleteButton); // Re-append the buttons
              li.classList.add("editing");
            }
          };
  
          // Append buttons to list item
          li.appendChild(updateButton);
          li.appendChild(deleteButton);
  
          // Append the list item to the data list
          dataList.appendChild(li);
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    // Call fetchData when the page loads to get existing data
    fetchData();
  
    // Handle form submission to add new data
    dataForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent the form from submitting normally
      const description = dataInput.value.trim(); // Get the input value
  
      if (!description) {
        console.error("Description is required");
        return;
      }
  
      try {
        // Send a POST request to save the new data
        const response = await fetch("/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description }), // Send description only
        });
  
        // Refresh the data list after adding a new task
        if (response.ok) {
          fetchData();
          dataInput.value = ""; // Clear input field after submission
        } else {
          console.error("Failed to add task");
        }
      } catch (error) {
        console.error("Error adding data:", error);
      }
    });
  
    // Function to delete a task
    const deleteTask = async (id) => {
      try {
        const response = await fetch(`/data/${id}`, { method: "DELETE" });
        return response;
      } catch (error) {
        console.error("Error deleting task:", error);
        return error;
      }
    };
  
    // Function to update a task
    const updateTask = async (item) => {
      try {
        const response = await fetch(`/data/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description: item.description }), // Send updated description
        });
  
        if (response.ok) {
          console.log("Task updated successfully");
        } else {
          console.error("Failed to update task");
        }
        return response;
      } catch (error) {
        console.error("Error updating task:", error);
      }
    };
  });
  
