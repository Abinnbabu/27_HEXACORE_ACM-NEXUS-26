/**
 * Mock Data for Registered Users
 */
let users = [
    { id: 1, name: "Joel Kurian", email: "joel@bluedb.com", role: "Authority", status: "Active", joined: "Just now" },
    { id: 2, name: "Alice Smith", email: "alice.smith@example.com", role: "User", status: "Active", joined: "5 mins ago" },
    { id: 3, name: "Bob Johnson", email: "bob.j@example.com", role: "User", status: "Banned", joined: "1 hour ago" },
    { id: 4, name: "Charlie Davis", email: "charlie@bluedb.com", role: "Authority", status: "Active", joined: "3 hours ago" },
    { id: 5, name: "Diana Prince", email: "diana.prince@startup.io", role: "User", status: "Active", joined: "1 day ago" },
    { id: 6, name: "Evan Wright", email: "evan.w@techcorp.net", role: "User", status: "Active", joined: "2 days ago" }
];

// DOM Elements
const tableBody = document.getElementById('user-table-body');
const searchInput = document.getElementById('user-search');
const statTotalUsers = document.getElementById('stat-total-users');
const statAuthorities = document.getElementById('stat-authorities');

/**
 * Initialize application
 */
function init() {
    renderTable(users);
    updateStats();

    // Event Listener for Search
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredUsers = users.filter(user => 
            user.email.toLowerCase().includes(searchTerm) || 
            user.name.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredUsers);
    });
}

/**
 * Render the table with given data
 * @param {Array} data Data to render
 */
function renderTable(data) {
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" class="empty-state">No users found matching that criteria.</td>`;
        tableBody.appendChild(tr);
        return;
    }

    data.forEach(user => {
        const tr = document.createElement('tr');
        
        // Define role badge styles
        let roleClass = user.role === 'Authority' ? 'badge-authority' : 
                        user.role === 'Admin' ? 'badge-admin' : 'badge-user';

        // Define status badge styles
        let statusClass = user.status === 'Active' ? 'badge-active' : 'badge-banned';
        
        // Actions conditional rendering
        let actionButtons = '';
        if (user.role === 'User') {
            actionButtons = `<button class="btn-action btn-promote" onclick="promoteUser(${user.id})">Promote</button>`;
        } else if (user.role === 'Authority') {
            actionButtons = `<button class="btn-action btn-demote" onclick="demoteUser(${user.id})">Demote</button>`;
        }

        tr.innerHTML = `
            <td>
                <div class="user-info">
                    <span class="user-name">${user.name}</span>
                    <span class="user-email">${user.email}</span>
                </div>
            </td>
            <td><span class="badge ${roleClass}">${user.role}</span></td>
            <td><span class="badge ${statusClass}">${user.status}</span></td>
            <td class="joined-cell" style="padding-right: 4rem;">${user.joined}</td>
            <td class="actions-cell" style="padding-left: 2rem;">${actionButtons}</td>
        `;

        tableBody.appendChild(tr);
    });
}

/**
 * Promote a user to Authority
 * @param {number} userId 
 */
window.promoteUser = function(userId) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].role = 'Authority';
        reRender();
    }
};

/**
 * Demote a user from Authority to User
 * @param {number} userId 
 */
window.demoteUser = function(userId) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].role = 'User';
        reRender();
    }
};

/**
 * Refresh UI states after data mutation
 */
function reRender() {
    // Re-apply any active search filter during rerender
    const searchTerm = searchInput.value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm) || 
        user.name.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredUsers);
    
    updateStats();
}

/**
 * Update statistic counters in the UI
 */
function updateStats() {
    statTotalUsers.textContent = users.length;
    
    const authorityCount = users.filter(u => u.role === 'Authority').length;
    statAuthorities.textContent = authorityCount;
}

// Start app
document.addEventListener('DOMContentLoaded', init);
