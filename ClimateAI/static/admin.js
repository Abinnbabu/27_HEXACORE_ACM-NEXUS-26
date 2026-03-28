/**
 * DB Data for Registered Users
 */
let users = (window.dbUsers || []).map(u => ({
    id: u.id,
    name: u.fname + ' ' + (u.lname || ''),
    email: u.email,
    role: u.role,
    status: u.status || 'Active',
    joined: u.joined || 'Registered',
    risk_score: u.risk_score || 0,
    primary_threat: u.primary_threat || ''
}));

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
            actionButtons = `<button class="btn-action btn-promote" onclick="promoteUser('${user.id}')">Promote</button>`;
        } else if (user.role === 'Authority') {
            actionButtons = `<button class="btn-action btn-demote" onclick="demoteUser('${user.id}')">Demote</button>`;
        }

        tr.innerHTML = `
            <td>
                <div class="user-info">
                    <span class="user-name">${user.name}</span>
                    <span class="user-email">${user.email}</span>
                    ${user.risk_score >= 50 ? `<span style="font-size: 0.75rem; color: var(--text-red); margin-top: 4px; font-weight: 600;">⚠️ Auto-Alert: Severe ${user.primary_threat} (Risk: ${user.risk_score}/100)</span>` : ''}
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
 * @param {string} userId 
 */
window.promoteUser = function(userId) {
    fetch('/api/promote/' + userId, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                window.location.reload();
            } else {
                alert("Failed to promote user.");
            }
        });
};

/**
 * Demote a user from Authority to User
 * @param {string} userId 
 */
window.demoteUser = function(userId) {
    fetch('/api/demote/' + userId, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                window.location.reload();
            } else {
                alert("Failed to demote user.");
            }
        });
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
    
    const alertCount = users.filter(u => u.risk_score >= 50 || u.status === 'need_help' || u.status === 'evacuating').length;
    const statAlerts = document.getElementById('stat-active-alerts');
    if (statAlerts) {
        statAlerts.textContent = alertCount;
        statAlerts.style.color = alertCount > 0 ? "var(--text-red)" : "var(--icon-green-text)";
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
