const itemForm = document.getElementById("itemForm");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const tableBody = document.getElementById("itemTableBody");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
const cancelBtn = document.getElementById("cancelBtn");
const message = document.getElementById("message");

let editingId = null;

// Display a message
function showMessage(text) {
    message.textContent = text;
}

// READ: Fetch and display all items
async function loadItems() {
    try {
        const response = await fetch("/api/items");

        if (!response.ok) {
            throw new Error("Unable to fetch items.");
        }

        const items = await response.json();

        tableBody.replaceChildren();

        if (items.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.textContent = "No items available.";

            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        items.forEach(item => {
            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            idCell.textContent = item.id;

            const nameCell = document.createElement("td");
            nameCell.textContent = item.name;

            const priceCell = document.createElement("td");
            priceCell.textContent = item.price;

            const actionCell = document.createElement("td");

            // Edit button
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "edit-btn";

            editBtn.addEventListener("click", () => {
                editItem(item);
            });

            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "delete-btn";

            deleteBtn.addEventListener("click", () => {
                deleteItem(item.id);
            });

            actionCell.append(editBtn, deleteBtn);

            row.append(
                idCell,
                nameCell,
                priceCell,
                actionCell
            );

            tableBody.appendChild(row);
        });

    } catch (error) {
        showMessage("Error loading items. Check the server.");
    }
}

// CREATE and UPDATE: Submit the form
itemForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const price = priceInput.value;

    if (
        !name ||
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
    ) {
        showMessage("Please enter a valid name and price.");
        return;
    }

    const isEditing = editingId !== null;

    const url = isEditing
        ? `/api/items/${editingId}`
        : "/api/items";

    const method = isEditing ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                price: Number(price)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Operation failed.");
        }

        showMessage(
            isEditing
                ? "Item updated successfully!"
                : "Item added successfully!"
        );

        resetForm();
        await loadItems();

    } catch (error) {
        showMessage(error.message);
    }
});

// Fill the form with the selected item's details
function editItem(item) {
    editingId = item.id;

    nameInput.value = item.name;
    priceInput.value = item.price;

    formTitle.textContent = "Edit Item";
    submitBtn.textContent = "Update";
    cancelBtn.hidden = false;

    showMessage("Edit the details and click Update.");

    nameInput.focus();

    document.querySelector(".form-container").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// DELETE: Remove an item
async function deleteItem(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this item?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/items/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed.");
        }

        if (editingId === id) {
            resetForm();
        }

        showMessage("Item deleted successfully!");

        await loadItems();

    } catch (error) {
        showMessage(error.message);
    }
}

// Reset the form
function resetForm() {
    itemForm.reset();

    editingId = null;

    formTitle.textContent = "Add Item";
    submitBtn.textContent = "Submit";
    cancelBtn.hidden = true;
}

// Cancel editing
cancelBtn.addEventListener("click", () => {
    resetForm();
    showMessage("Editing cancelled.");
});

// Load items when the page opens
loadItems();