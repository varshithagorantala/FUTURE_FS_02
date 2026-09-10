const leadForm = document.getElementById("leadForm");
const leadTableBody = document.getElementById("leadTableBody");

let editingLeadId = null;

// Load leads when page opens
loadLeads();


// ================= LOAD LEADS =================

async function loadLeads() {

    const response = await fetch("/api/leads");
    const leads = await response.json();

    leadTableBody.innerHTML = "";

    leads.forEach(lead => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.source}</td>
            <td>${lead.status}</td>
            <td>${lead.notes || "-"}</td>
            <td>${lead.followUp || "-"}</td>

            <td>
                <button onclick="editLead(${lead.id})">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteLead(${lead.id})">
                    Delete
                </button>
            </td>
        `;

        leadTableBody.appendChild(row);
    });
}


// ================= ADD / UPDATE LEAD =================

leadForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const source = document.getElementById("source").value;
    const status = document.getElementById("status").value;
    const notes = document.getElementById("notes").value;
    const followUp = document.getElementById("followUp").value;


    const leadData = {
        name,
        email,
        source,
        status,
        notes,
        followUp
    };


    // UPDATE
    if (editingLeadId !== null) {

        await fetch(`/api/leads/${editingLeadId}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(leadData)

        });

        editingLeadId = null;

        document.querySelector("#leadForm button").textContent = "Add Lead";

    }

    // ADD
    else {

        await fetch("/api/leads", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(leadData)

        });

    }

    leadForm.reset();

    loadLeads();
});


// ================= EDIT LEAD =================

async function editLead(id) {

    const response = await fetch("/api/leads");

    const leads = await response.json();

    const lead = leads.find(lead => lead.id === id);

    if (!lead) {
        return;
    }

    document.getElementById("name").value = lead.name;
    document.getElementById("email").value = lead.email;
    document.getElementById("source").value = lead.source;
    document.getElementById("status").value = lead.status;
    document.getElementById("notes").value = lead.notes || "";
    document.getElementById("followUp").value = lead.followUp || "";

    editingLeadId = id;

    document.querySelector("#leadForm button").textContent = "Update Lead";
}


// ================= DELETE LEAD =================

async function deleteLead(id) {

    await fetch(`/api/leads/${id}`, {
        method: "DELETE"
    });

    loadLeads();
}