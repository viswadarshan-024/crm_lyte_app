// Lyte.Router.configureDefaults({ baseURL: '/', history : "html5" });
Lyte.Router.configureRoutes(function() {

	this.route('logger', { path: '/logger', component: 'logger-comp' });
    this.route('login', { path: '/login', component: 'login-comp' });

	this.route('crm-app', { path: '/', component: 'crm-app' }, function() {

		// Dashboard

		this.route('crm-dashboard', { path: 'dashboard', component: 'crm-dashboard' });

		// Contacts

		this.route('contact-list', { path: 'contacts', component: 'contact-list' });

		this.route('contact-create', { path: 'contacts/create', component: 'contact-create' });

		this.route('contact-view', { path: 'contacts/:id', component: 'contact-view' });

		// Companies

		this.route('company-list', { path: 'companies', component: 'company-list' });

		// Deals

		this.route('deal-list', { path: 'deals', component: 'deal-list' });

		this.route('deal-view', { path: 'deals/:id', component: 'deal-view' });

		this.route('deal-create', { path: 'deals/create', component: 'deal-create' });

		// Activities

		this.route('activity-list', { path: 'activities', component: 'activity-list' });

		// Users

		this.route('user-list', { path: 'users', component: 'user-list' });

		// Profiles

		this.route('profile-list', { path: 'profiles', component: 'profile-list' });

		// Roles

		this.route('role-list', { path: 'roles', component: 'role-list' });
	});
});
Lyte.Mixin.register("api-mixin", {

    apiRequest: function(endpoint, options) {
        var API_BASE_URL = 'http://localhost:8181/mini_crm';
        options = options || {};

        if (endpoint.charAt(0) === '/') endpoint = endpoint.substring(1);

        let url = API_BASE_URL + '/' + endpoint;
        let method = (options.method || "GET").toUpperCase();
        let headers = options.headers || { 'Accept': 'application/json' };

        // Default Content-Type for write operations
        if (method !== 'GET' && method !== 'HEAD' && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        let fetchConfig = {
            method: method,
            headers: headers,
            credentials: 'include'
        };

        // --- Body / Query handling (unchanged) ---
        if (options.body) {
            if (method === 'GET' || method === 'HEAD') {
                let params = options.body;
                let queryString = Object.keys(params).map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');

                if (queryString) {
                    url += (url.includes('?') ? '&' : '?') + queryString;
                }
            } else {
                if (headers['Content-Type'] && headers['Content-Type'].includes('json')) {
                    fetchConfig.body = JSON.stringify(options.body);
                } else {
                    fetchConfig.body = options.body;
                }
            }
        }

        return fetch(url, fetchConfig)
            .then(async function(response) {

                if (response.status === 401) {
                    localStorage.removeItem('user');
                    window.location.href = "/";
                    throw new Error("Unauthorized");
                }

                if (!response.ok) {
                    const text = await response.text();
                    let errData;
                    try { errData = text ? JSON.parse(text) : {}; }
                    catch (e) { errData = { message: text }; }
                    let error = new Error(errData.message || "API Error");
                    error.data = errData;
                    throw error;
                }

                // --------- ONLY FIX: SAFE JSON PARSING ---------
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    return response.json();
                } else {
                    const text = await response.text();
                    throw new Error("Expected JSON but received HTML:\n" + text.substring(0, 300));
                }
            })
            .then(function(data) {
                if (data && data.responseData !== undefined && data.data === undefined) {
                    data.data = data.responseData;
                }
                return data;
            });
    }
});

Lyte.Mixin.register("auth-mixin", {

    // 1. Move PERMISSIONS to a helper method to guarantee access
    // This avoids "data merging" conflicts with components.
    getPermissionConstants: function() {
        return {
            COMPANY_CREATE: 'COMPANY_CREATE',
            COMPANY_UPDATE: 'COMPANY_UPDATE',
            COMPANY_DELETE: 'COMPANY_DELETE',
            CONTACT_CREATE: 'CONTACT_CREATE',
            CONTACT_UPDATE: 'CONTACT_UPDATE',
            CONTACT_DELETE: 'CONTACT_DELETE',
            CONTACT_VIEW_SELF: 'CONTACT_VIEW_SELF',
            DEAL_CREATE: 'DEAL_CREATE',
            DEAL_UPDATE: 'DEAL_UPDATE',
            DEAL_DELETE: 'DEAL_DELETE',
            DEAL_VIEW_ALL: 'DEAL_VIEW_ALL',
            DEAL_VIEW_TEAM: 'DEAL_VIEW_TEAM',
            DEAL_VIEW_SELF: 'DEAL_VIEW_SELF',
            DEAL_CHANGE_STATUS: 'DEAL_CHANGE_STATUS',
            ACTIVITY_CREATE: 'ACTIVITY_CREATE',
            ACTIVITY_UPDATE: 'ACTIVITY_UPDATE',
            ACTIVITY_DELETE: 'ACTIVITY_DELETE',
            ACTIVITY_VIEW_ALL: 'ACTIVITY_VIEW_ALL',
            ACTIVITY_VIEW_TEAM: 'ACTIVITY_VIEW_TEAM',
            ACTIVITY_VIEW_SELF: 'ACTIVITY_VIEW_SELF',
            USER_MANAGE: 'USER_MANAGE'
        };
    },

    // --- LOGIC FUNCTIONS ---

    getAuthUser: function () {
        let stored = localStorage.getItem('user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Invalid user data");
                this.logoutUser();
            }
        }
        return null;
    },

    setAuthUser: function (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
    },

    getAuthPermissions: function () {
        let user = this.getAuthUser();
        return (user && user.permissions) ? user.permissions : [];
    },

    isAuthenticated: function () {
        return !!this.getAuthUser();
    },

    getRoleName: function () {
        let user = this.getAuthUser();
        return (user && user.roleName) ? user.roleName : '';
    },

    loginUser: function (username, password) {
        let self = this;
        return this.crmLogin(username, password).then(function (response) {
            let userData = response.data;

            if (userData && userData.userContext) {
                userData = userData.userContext;
            }

            if (userData) {
                self.setAuthUser(userData);
                return response;
            } else {
                throw new Error("Invalid response from server");
            }
        });
    },

    logoutUser: function () {
        localStorage.removeItem('user');
        if (Lyte.Router) {
            Lyte.Router.transitionTo('login');
        } else {
            window.location.href = "/";
        }
    },

    hasPermission: function (permissionCode) {
        if (!permissionCode) return false;
        let perms = this.getAuthPermissions();
        return perms.indexOf(permissionCode) !== -1;
    },

    hasAnyPermission: function () {
        let codes = Array.prototype.slice.call(arguments);
        let codeList = Array.isArray(codes[0]) ? codes[0] : codes;
        let perms = this.getAuthPermissions();

        return codeList.some(function (code) {
            return perms.indexOf(code) !== -1;
        });
    },

    hasAllPermissions: function () {
        let codes = Array.prototype.slice.call(arguments);
        let codeList = Array.isArray(codes[0]) ? codes[0] : codes;
        let perms = this.getAuthPermissions();

        return codeList.every(function (code) {
            return perms.indexOf(code) !== -1;
        });
    },

    canAccess: function (module) {
        if (!this.isAuthenticated()) return false;

        // FIX: Access permissions via the helper method on 'this'
        let P = this.getPermissionConstants();

        switch (module) {
            case 'dashboard':
                return true;
            case 'companies':
                return this.hasAnyPermission(P.COMPANY_CREATE, P.COMPANY_UPDATE, P.COMPANY_DELETE);
            case 'contacts':
                return this.hasAnyPermission(P.CONTACT_CREATE, P.CONTACT_UPDATE, P.CONTACT_DELETE, P.CONTACT_VIEW_SELF);
            case 'deals':
                return this.hasAnyPermission(P.DEAL_VIEW_ALL, P.DEAL_VIEW_TEAM, P.DEAL_VIEW_SELF, P.DEAL_CREATE, P.DEAL_CHANGE_STATUS);
            case 'activities':
                return this.hasAnyPermission(P.ACTIVITY_VIEW_ALL, P.ACTIVITY_VIEW_TEAM, P.ACTIVITY_VIEW_SELF, P.ACTIVITY_CREATE);
            case 'users':
            case 'roles':
            case 'profiles':
                return this.hasPermission(P.USER_MANAGE);
            case 'settings':
                return true;
            default:
                return false;
        }
    }
});
Lyte.Mixin.register("crm-api-mixin", {
    // 1. Dependency: Include api-mixin to use 'this.apiRequest'
    // mixins: ["api-mixin"],

    // methods: {
        // ================= DASHBOARD =================
        crmGetDashboard: function (limit) {
            limit = limit || 5;
            return this.apiRequest('dashboard.action', {
                method: 'GET',
                body: {recentLimit: limit}
            });
        },

        // ================= AUTHENTICATION =================
        // FIX: Added login/logout here as requested
        crmLogin: function (username, password) {
            return this.apiRequest('login.action', {
                method: 'POST',
                body: {username: username, password: password}
            });
        },

        crmLogout: function () {
            // Usually logout is just a client-side cleanup,
            // but if there is a server endpoint:
            return this.apiRequest('logout.action', {method: 'POST'});
        },

        // ================= COMPANIES =================
        crmGetCompanies: function (params) {
            return this.apiRequest('company.action', {
                method: 'GET',
                body: params
            });
        },

        crmGetCompany: function (id) {
            return this.apiRequest('company-view.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmAddCompany: function () {
            return this.apiRequest('company-add.action', {method: 'GET'});
        },

        crmEditCompany: function (id) {
            return this.apiRequest('company-edit.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmSaveCompany: function (data) {
            // Handles both Save and Update based on your legacy code
            return this.apiRequest('company-save.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteCompany: function (id) {
            return this.apiRequest('company-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        crmPreviewCompanyEnrichment: function (data) {
            return this.apiRequest('company-preview-enrichment.action', {
                method: 'POST',
                body: data
            });
        },

        // ================= CONTACTS =================
        crmGetContacts: function (params) {
            // FIX: Convert params object to query string (e.g. ?companyId=1)
            let queryString = "";

            // Check if params exist and are not empty
            if (params && Object.keys(params).length > 0) {
                // URLSearchParams automatically handles keys, values, and encoding
                queryString = "?" + new URLSearchParams(params).toString();
            }

            console.log("contact.action" + queryString);
            // Append queryString to the URL
            return this.apiRequest('contact.action' + queryString, {
                method: 'GET'
                // REMOVE 'body': params (GET requests cannot have a body)
            });
        },

// You can apply the same logic here if needed, or just rely on crmGetContacts logic
        crmGetContactsByCompany: function (companyId) {
            return this.crmGetContacts({ companyId: companyId });
        },

        crmGetContact: function (id) {
            return this.apiRequest('contact-view.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmAddContact: function () {
            return this.apiRequest('contact-add.action', {method: 'GET'});
        },

        crmEditContact: function (id) {
            return this.apiRequest('contact-edit.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmSaveContact: function (data) {
            return this.apiRequest('contact-save.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteContact: function (id) {
            return this.apiRequest('contact-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        // ================= DEALS =================

        crmGetDeals: function (params) {
            let queryString = "";
            if (params && Object.keys(params).length > 0) {
                queryString = "?" + new URLSearchParams(params).toString();
            }
            return this.apiRequest('deal.action' + queryString, {
                method: 'GET'
                // NO BODY for GET
            });
        },

        // GET: View Single Deal
        crmGetDeal: function (id) {
            return this.apiRequest('deal-view.action?id=' + id, {
                method: 'GET'
            });
        },

        // GET: Add Screen (Usually returns schema/metadata)
        crmAddDeal: function () {
            return this.apiRequest('deal-add.action', {
                method: 'GET'
            });
        },

        // GET: Edit Screen
        crmEditDeal: function (id) {
            return this.apiRequest('deal-edit.action?id=' + id, {
                method: 'GET'
            });
        },

        // POST: Save (Body is OK here)
        crmSaveDeal: function (data) {
            return this.apiRequest('deal-save.action', {
                method: 'POST',
                body: data
            });
        },

        // POST: Delete (Body is OK here)
        crmDeleteDeal: function (id) {
            return this.apiRequest('deal-delete.action', {
                method: 'POST',
                body: { id: id }
            });
        },

        // POST: Update Status (Body is OK here)
        crmUpdateDealStatus: function (data) {
            return this.apiRequest('deal-changeStatus.action', {
                method: 'POST',
                body: data
            });
        },
        // },
        // crmGetDeals: function (params) {
        //     return this.apiRequest('deal.action', {
        //         method: 'GET',
        //         body: params
        //     });
        // },
        //
        // crmGetDeal: function (id) {
        //     return this.apiRequest('deal-view.action', {
        //         method: 'GET',
        //         body: {id: id}
        //     });
        // },
        //
        // crmAddDeal: function () {
        //     return this.apiRequest('deal-add.action', {method: 'GET'});
        // },
        //
        // crmEditDeal: function (id) {
        //     return this.apiRequest('deal-edit.action', {
        //         method: 'GET',
        //         body: {id: id}
        //     });
        // },
        //
        // crmSaveDeal: function (data) {
        //     return this.apiRequest('deal-save.action', {
        //         method: 'POST',
        //         body: data
        //     });
        // },
        //
        // crmDeleteDeal: function (id) {
        //     return this.apiRequest('deal-delete.action', {
        //         method: 'POST',
        //         body: {id: id}
        //     });
        // },
        //
        // crmUpdateDealStatus: function (data) {
        //     return this.apiRequest('deal-changeStatus.action', {
        //         method: 'POST',
        //         body: data
        //     });
        // },

        // ================= ACTIVITIES =================
        crmGetActivities: function (params) {
            return this.apiRequest('activity.action', {
                method: 'GET',
                body: params
            });
        },

        crmGetActivity: function (id) {
            return this.apiRequest('activity-view.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmSaveActivity: function (data) {
            return this.apiRequest('activity-save.action', {
                method: 'POST',
                body: data
            });
        },

        crmUpdateActivity: function (data) {
            return this.apiRequest('activity-update.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteActivity: function (id) {
            return this.apiRequest('activity-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        crmUpdateActivityStatus: function (data) {
            return this.apiRequest('activity-status.action', {
                method: 'POST',
                body: data
            });
        },

        crmGetActivityStatusOptions: function (type, statusCode) {
            return this.apiRequest('activity-status-options.action', {
                method: 'GET',
                body: {type: type, statusCode: statusCode}
            });
        },

        // ================= USERS =================
        crmGetUsers: function () {
            return this.apiRequest('user.action', {method: 'GET'});
        },

        crmGetUser: function (id) {
            return this.apiRequest('user-view-detail.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmAddUser: function () {
            return this.apiRequest('user-add.action', {method: 'GET'});
        },

        crmUpdateUser: function (data) {
            return this.apiRequest('user-update.action', {
                method: 'POST',
                body: data
            });
        },

        crmSaveUser: function (data) {
            return this.apiRequest('user-save.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteUser: function (id) {
            return this.apiRequest('user-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        // ================= ROLES =================
        crmGetRoles: function () {
            return this.apiRequest('role.action', {method: 'GET'});
        },

        crmGetRole: function (roleId) {
            return this.apiRequest('role-view.action', {
                method: 'GET',
                body: {roleId: roleId}
            });
        },

        crmCreateRole: function (data) {
            return this.apiRequest('role-create.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteRole: function (roleId) {
            return this.apiRequest('role-delete.action', {
                method: 'POST',
                body: {roleId: roleId}
            });
        },

        crmAssignRoleToUser: function (userId, roleId) {
            return this.apiRequest('user-assign-role.action', {
                method: 'POST',
                body: {userId: userId, roleId: roleId}
            });
        },

        // ================= PROFILES & PERMISSIONS =================
        crmGetProfiles: function () {
            return this.apiRequest('profile-list.action', {method: 'GET'});
        },

        crmGetProfile: function (id) {
            return this.apiRequest('profile-view.action', {
                method: 'GET',
                body: {id: id}
            });
        },

        crmCreateProfile: function (data) {
            return this.apiRequest('profile-create.action', {
                method: 'POST',
                body: data
            });
        },

        crmUpdateProfile: function (id, data) {
            // Merging ID into data as per your API
            data = data || {};
            data.id = id;
            return this.apiRequest('profile-update.action', {
                method: 'POST',
                body: data
            });
        },

        crmDeleteProfile: function (id) {
            return this.apiRequest('profile-delete.action', {
                method: 'POST',
                body: {id: id}
            });
        },

        crmGetPermissions: function () {
            return this.apiRequest('role-permissions.action', {method: 'GET'});
        }
    // }
    },
// { "mixins" : [ "api-mixin" ]}
);
Lyte.Mixin.register("utils-mixin", {

    // --- Date Formatting ---

    actions: {
        // Generates 2 initials (e.g., "John Doe" -> "JD")
        utilGetInitials: function(name) {
            if (!name || typeof name !== 'string') return "??";
            let parts = name.trim().split(" ");
            if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        },

        // Returns a consistent color based on the name string
        utilGetAvatarColor: function(name) {
            if (!name) return "#64748b"; // Default Grey

            let colors = [
                "#ef4444", "#f97316", "#f59e0b", "#84cc16",
                "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
                "#8b5cf6", "#d946ef", "#f43f5e"
            ];

            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }

            let index = Math.abs(hash % colors.length);
            return colors[index];
        }
    },
    /**
     * Format date from Java LocalDateTime JSON format
     */
    utilFormatDate: function(d, format) {
        format = format || 'short';
        if (!d) return '-';

        let date;

        // Handle Java LocalDateTime JSON format
        if (typeof d === 'object' && d.year) {
            date = new Date(
                d.year,
                (d.monthValue || d.month) - 1,
                d.dayOfMonth || d.day,
                d.hour || 0,
                d.minute || 0,
                d.second || 0
            );
        } else if (typeof d === 'string') {
            date = new Date(d);
        } else if (d instanceof Date) {
            date = d;
        } else {
            return '-';
        }

        if (isNaN(date.getTime())) return '-';

        switch (format) {
            case 'short':
                return date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            case 'long':
                return date.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
            case 'datetime':
                return date.toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'relative':
                return this.utilGetRelativeTime(date);
            case 'iso':
                return date.toISOString().split('T')[0];
            default:
                return date.toLocaleDateString('en-IN');
        }
    },

    utilFormatLocalDate: function(d) {
        if (!d) return '-';

        if (typeof d === 'object' && d.year) {
            const day = String(d.dayOfMonth || d.day).padStart(2, '0');
            const month = String(d.monthValue || d.month).padStart(2, '0');
            const year = d.year;
            return day + '/' + month + '/' + year;
        }

        return this.utilFormatDate(d);
    },

    utilGetRelativeTime: function(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return diffMins + 'm ago';
        if (diffHours < 24) return diffHours + 'h ago';
        if (diffDays < 7) return diffDays + 'd ago';

        return this.utilFormatDate(date, 'short');
    },

    // --- Currency & Numbers ---

    utilFormatCurrency: function(amount, compact) {
        compact = compact || false;
        if (amount == null || isNaN(amount)) return '-';

        const options = {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        };

        if (compact && Math.abs(amount) >= 100000) {
            if (Math.abs(amount) >= 10000000) {
                return '₹' + (amount / 10000000).toFixed(1) + ' Cr';
            }
            return '₹' + (amount / 100000).toFixed(1) + ' L';
        }

        return new Intl.NumberFormat('en-IN', options).format(amount);
    },

    utilFormatNumber: function(num) {
        if (num == null || isNaN(num)) return '-';
        return new Intl.NumberFormat('en-IN').format(num);
    },

    // --- UI Helpers ---

    utilGetInitials: function(name) {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },

    utilGetAvatarColor: function(name) {
        const colors = [
            '#1a73e8', '#7c3aed', '#ea580c', '#16a34a',
            '#0891b2', '#dc2626', '#ca8a04', '#4f46e5'
        ];
        if (!name) return colors[0];
        const hash = name.split('').reduce(function(acc, char) {
            return acc + char.charCodeAt(0);
        }, 0);
        return colors[hash % colors.length];
    },

    utilTruncate: function(text, maxLength) {
        maxLength = maxLength || 50;
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    utilEscapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // --- Status & Enums ---

    utilGetStatusBadgeClass: function(status) {
        switch (status) {
            case 'WON':
            case 'CLOSED':
            case 'COMPLETED':
            case 'DONE':
            case 'HELD':
            case 'POSTED':
            case 'SENT':
                return 'badge-success';
            case 'IN_PROGRESS':
            case 'QUALIFIED':
            case 'DELIVERED':
                return 'badge-warning';
            case 'LOST':
            case 'MISSED':
            case 'CANCELLED':
            case 'FAILED':
                return 'badge-danger';
            case 'NEW':
            case 'PROPOSAL':
            case 'OPEN':
            default:
                return 'badge-primary';
        }
    },

    utilFormatStatus: function(status) {
        if (!status) return '-';
        return status.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    },

    utilGetActivityTypeIcon: function(type) {
        // SVG strings...
        const icons = {
            TASK: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
            CALL: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
            MEETING: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            EMAIL: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
            LETTER: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
            SOCIAL_MEDIA: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>'
        };
        return icons[type] || icons.TASK;
    },

    utilIsOverdue: function(dueDate) {
        if (!dueDate) return false;
        let date;
        if (typeof dueDate === 'object' && dueDate.year) {
            date = new Date(dueDate.year, (dueDate.monthValue || dueDate.month) - 1, dueDate.dayOfMonth || dueDate.day);
        } else {
            date = new Date(dueDate);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }
});
Lyte.Router.registerRoute("crm-app", {

    beforeModel: function(transition) {
        let user = localStorage.getItem('user');
        if (!user) {
            this.replaceWith('login');
            return;
        }
        if (transition.targetName === 'crm-app' || transition.targetName === 'crm-app.index') {
            this.replaceWith('crm-app.crm-dashboard');
        }
    },

    renderTemplate: function() {
        return { outlet: "#outlet", component: "crm-app" };
    }
});
Lyte.Router.registerRoute('index',{
// 	getResources  : function (paramsObject ){ 
//         /* View related files should be returned as resources(HTML, CSS, components etc). It will be available before 'renderTemplate' hook. */
// },
// getDependencies  : function (paramsObject ){ 
//         /* Files returned as dependencies will be downloaded at once and will be available before 'beforeModel' hook. */
// },
// beforeModel  : function (paramsObject ){ 
//         /* Pre processing stage where you can decide whether to abort/redirect the current transition(e.g Permission check). */
// },
    beforeModel: function() {
        this.replaceWith('crm-app.crm-dashboard');
    },
// afterModel  : function (model, paramsObject ){
//         /* Manipulating data before returning data to component. */
// },
// redirect  : function (model, paramsObject ){ 
//         /* Redirections based on data fetched. */
// },
	renderTemplate : function()	{
		return {outlet : "#outlet",component : "crm-app"}
	}
// afterRender  : function (model, paramsObject ){ 
//         /* Post processing of rendered page. */
// },
// beforeExit  : function (model, paramsObject ){ 
//         /* Will be invoked before a route is removed from view. */
// },
// didDestroy  : function (model, paramsObject ){ 
//         /* Will be invoked when a route is completly destroyed(remove residues of route. eg: file cache removal). */
// },
// actions  : { 
//        onBeforeLoad  : function (paramsObject ){ 
//                 /* Triggered once route transition starts. */
//         },
//        onError  : function (error, pausedTrans, paramsObject ){ 
//                 /* Triggered by error on file load or on data request. */
//         },
//        willTransition  : function (transition ){ 
//                 /* Triggered before a transition is going to change. */
//         },
//        didTransition  : function (paramsObject ){ 
//                 /* Triggered after completion of transition. */
//         },
// }	
});

Lyte.Router.registerRoute("logger", {
    model: function() {
        return {};
    },
//     renderTemplate : function()	{
//         return {component : "contact-create"};
//     }
});

Lyte.Router.registerRoute('login', {
    beforeModel: function() {
        // Check if user is already logged in
        let user = localStorage.getItem('user');

        if (user) {
            this.transitionTo('dashboard');
        }
    },
    renderTemplate : function()	{
        return {outlet : "#outlet",component : "login-comp"};
    }
});

Lyte.Router.registerRoute("crm-app.contact-create", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "contact-create"};
    }
});
Lyte.Router.registerRoute("crm-app.contact-list", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "contact-list"
        };
    }
});
Lyte.Component.register("contact-create", {
_template:"<template tag-name=\"contact-create\"> <div class=\"page-content\"> <div class=\"card form-container\"> <div class=\"card-body\"> <h2 class=\"form-title\">Create New Contact</h2> <template is=\"if\" value=\"{{errorMessage}}\"> <div class=\"alert alert-error\">{{errorMessage}}</div> </template> <div class=\"form-section\"> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" lyte-model=\"contactName\" class=\"form-input\" placeholder=\"Contact Name\"> </div> <div class=\"form-row\"> <div class=\"form-group\"> <label>Email</label> <input type=\"email\" lyte-model=\"contactEmail\" class=\"form-input\" placeholder=\"email@example.com\"> </div> <div class=\"form-group\"> <label>Phone</label> <input type=\"tel\" lyte-model=\"contactPhone\" class=\"form-input\" placeholder=\"+91 9999999999\"> </div> </div> </div> <div class=\"form-section\"> <div class=\"form-group\"> <label>Company <span class=\"required\">*</span></label> <select lyte-model=\"selectedCompany\" class=\"form-select\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companyList}}\" item=\"company\" index=\"i\"></option> </select> </div> <div class=\"form-group\"> <label>Designation</label> <input type=\"text\" lyte-model=\"contactDesignation\" class=\"form-input\" placeholder=\"e.g. CEO\"> </div> </div> <div class=\"form-actions\"> <button class=\"btn btn-primary\" onclick=\"{{action('createContact')}}\" disabled=\"{{isLoading}}\"> <template is=\"if\" value=\"{{isLoading}}\"> Creating... </template> <template is=\"else\"> Create Contact </template> </button> <a href=\"#/contacts\" class=\"btn btn-secondary\">Cancel</a> </div> </div> </div> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,3]},{"type":"if","position":[1,1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,1,1,7,1,3,3]},{"type":"for","position":[1,1,1,7,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companyList}}\" item=\"company\" index=\"i\"> <option value=\"{{company.id}}\">{{company.name}}</option> </template>"},{"type":"attr","position":[1,1,1,9,1]},{"type":"attr","position":[1,1,1,9,1,1]},{"type":"if","position":[1,1,1,9,1,1],"cases":{},"default":{}}],
_observedAttributes :["contactName","contactEmail","contactPhone","contactDesignation","selectedCompany","companyList","isLoading","errorMessage"],

		// 1. Remove 'services' property

		data: function() {
			return {
				contactName: Lyte.attr("string"),
				contactEmail: Lyte.attr("string"),
				contactPhone: Lyte.attr("string"),
				contactDesignation: Lyte.attr("string"),
				selectedCompany: Lyte.attr("string", { default: "" }),

				companyList: Lyte.attr("array", { default: [] }),

				isLoading: Lyte.attr("boolean", { default: false }),
				errorMessage: Lyte.attr("string", { default: "" })
			}
		},

		didConnect: function() {
			// 2. Use the helper from auth-mixin (if available)
			// if (this.hasPermission && !this.hasPermission('CONTACT_CREATE')) { ... }

			// 3. Load Companies using the MIXIN method (Same as contact-list)
			this.crmGetCompanies()
				.then((res) => {
					// Use the same safe data extraction as contact-list
					let list = [];
					if(res && Array.isArray(res.data)){
						list = res.data;
					} else if(res && res.data && Array.isArray(res.data.data)){
						list = res.data.data;
					}
					this.setData('companyList', list);

					// Handle Pre-selection from URL
					const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
					const preSelected = urlParams.get('companyId');
					if(preSelected) {
						this.setData('selectedCompany', preSelected);
					}
				})
				.catch(error => {
					console.error("Failed to load companies", error);
				});
		},

		actions: {
			createContact: function() {
				let name = this.getData('contactName');
				let companyId = this.getData('selectedCompany');

				if (!name || !companyId) {
					this.setData('errorMessage', "Please fill in Name and Company.");
					return;
				}

				this.setData('isLoading', true);
				this.setData('errorMessage', "");

				let payload = {
					name: name,
					email: this.getData('contactEmail'),
					phone: this.getData('contactPhone'),
					designation: this.getData('contactDesignation'),
					companyId: companyId
				};

				// 4. Use Mixin method for creation
				// Note: Ensure 'crmCreateContact' exists in your crm-api-mixin.js file!
				this.crmCreateContact(payload)
					.then((response) => {
						// Check success based on your API structure
						if (response && (response.success || response.id)) {
							alert("Contact Created Successfully!");
							window.location.hash = "/contacts"; // Use hash for redirection
						} else {
							this.setData('errorMessage', (response.message || "Unknown error"));
						}
					})
					.catch((error) => {
						this.setData('errorMessage', error.message || "Network Error");
					})
					.finally(() => {
						this.setData('isLoading', false);
					});
			}
		}
	},
// 5. REGISTER MIXINS HERE
	{
		mixins: ["api-mixin", "crm-api-mixin", "auth-mixin", "utils-mixin"]
	});
Lyte.Component.register("crm-app", {
_template:"<template tag-name=\"crm-app\"> <div class=\"app-container\" style=\"display: flex; height: 100vh; overflow: hidden;\"> <crm-sidebar></crm-sidebar> <div class=\"main-content\" style=\"flex-grow: 1; overflow-y: auto; background-color: #f4f7f6; position: relative;\"> <div id=\"crm_inner_outlet\"></div> </div> </div> </template>\n<style>/* ========================================\n   APP CONTAINER\n   ======================================== */\n.app-container {\n    display: flex;\n    min-height: 100vh;\n    width: 100%;\n    overflow: hidden; /* Prevent double scrollbars */\n}\n\n/* ========================================\n   SIDEBAR (The Component Wrapper)\n   ======================================== */\n/* This targets the <crm-sidebar> tag directly */\ncrm-sidebar.sidebar {\n    width: 260px;\n    height: 100vh;\n    background-color: #ffffff;\n    border-right: 1px solid #e2e8f0;\n    flex-shrink: 0;\n    transition: width 0.3s ease;\n    display: flex;\n    flex-direction: column;\n}\n\n/* Inner wrapper styles */\n.sidebar-inner {\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    width: 100%;\n}\n\n/* Collapse Logic */\ncrm-sidebar.sidebar.collapsed {\n    width: 80px;\n}\n\n/* ========================================\n   MAIN CONTENT\n   ======================================== */\n.main-content {\n    flex: 1;\n    /* Removed margin-left because Flexbox handles the positioning automatically now */\n    height: 100vh;\n    overflow-y: auto;\n    background-color: #f8fafc;\n    padding: 0; /* Let children handle padding */\n}</style>",
_dynamicNodes : [{"type":"componentDynamic","position":[1,1]}],

	// mixins: ["auth-mixin"],

	beforeModel: function(transition) {
		// 1. Security Check
		if (!this.isAuthenticated()) {
			Lyte.Router.transitionTo('login');
			return;
		}

		// 2. SMART REDIRECT
		// Only redirect to dashboard if the user is at the Root ('crm-app')
		// or the Index ('crm-app.index').
		// If they are going to 'crm-app.contact-list', this block will skipped.
		if (transition.targetName === 'crm-app' || transition.targetName === 'crm-app.index') {
			Lyte.Router.transitionTo('crm-app.crm-dashboard');
		}
	}
},
{mixins: ["auth-mixin"]}
);
Lyte.Component.register("crm-sidebar", {
_template:"<template tag-name=\"crm-sidebar\"> <div class=\"sidebar-inner {{expHandlers(isCollapsed,'?:','collapsed','')}}\"> <div class=\"sidebar-header\"> <div class=\"logo\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path><path d=\"M2 12l10 5 10-5\"></path></svg> </div> <span class=\"logo-text\" onclick=\"{{action('toggleSidebar')}}\">Mini CRM</span> </div> <nav class=\"sidebar-nav\"> <a href=\"#/dashboard\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect></svg> </span> <span class=\"text\">Dashboard</span> </a> <template is=\"if\" value=\"{{canViewCompanies}}\"><template case=\"true\"> <a href=\"#/companies\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4\"></path></svg> </span> <span class=\"text\">Companies</span> </a> </template></template> <template is=\"if\" value=\"{{canViewContacts}}\"><template case=\"true\"> <a href=\"#/contacts\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Contacts</span> </a> </template></template> <template is=\"if\" value=\"{{canViewDeals}}\"><template case=\"true\"> <a href=\"#/deals\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Deals</span> </a> </template></template> <template is=\"if\" value=\"{{canViewActivities}}\"><template case=\"true\"> <a href=\"#/activities\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Activities</span> </a> </template></template> <template is=\"if\" value=\"{{canViewUsers}}\"><template case=\"true\"> <a href=\"#/users\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Users</span> </a> </template></template> <template is=\"if\" value=\"{{canViewRoles}}\"><template case=\"true\"> <a href=\"#/roles\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Roles</span> </a> </template></template> <template is=\"if\" value=\"{{canViewProfiles}}\"><template case=\"true\"> <a href=\"#/profiles\" class=\"nav-item\"> <span class=\"icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </span> <span class=\"text\">Profiles</span> </a> </template></template> </nav> <div class=\"sidebar-footer\"> <div class=\"user-info\"> <div class=\"avatar\">{{userInitials}}</div> <div class=\"details\"> <span class=\"name\">{{userName}}</span> <span class=\"role\">{{userRole}}</span> </div> </div> <button onclick=\"{{action('logout')}}\" class=\"logout-btn\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path><polyline points=\"16 17 21 12 16 7\"></polyline><line x1=\"21\" y1=\"12\" x2=\"9\" y2=\"12\"></line></svg> </button> </div> </div> </template>\n<style>/* CONTAINER */\n.sidebar-inner {\n    width: 260px;\n    height: 100vh;\n    background-color: #1e293b; /* Dark Blue Background */\n    color: #f1f5f9;\n    display: flex;\n    flex-direction: column;\n    transition: width 0.3s;\n    border-right: 1px solid #334155;\n}\n\n.sidebar-inner.collapsed {\n    width: 70px;\n}\n\n/* HEADER */\n.sidebar-header {\n    height: 64px;\n    display: flex;\n    align-items: center;\n    padding: 0 20px;\n    border-bottom: 1px solid #334155;\n    white-space: nowrap;\n    overflow: hidden;\n}\n.logo { min-width: 24px; margin-right: 12px; color: #3b82f6; }\n.logo-text { font-weight: bold; font-size: 18px; cursor: pointer; }\n\n/* NAV LINKS */\n.sidebar-nav {\n    flex-grow: 1;\n    padding: 20px 10px;\n    overflow-y: auto;\n    display: flex;       /* CRITICAL for spacing */\n    flex-direction: column;\n    gap: 5px;           /* Replaces <br> */\n}\n\n.nav-item {\n    display: flex;\n    align-items: center;\n    padding: 10px 15px;\n    color: #94a3b8;\n    text-decoration: none;\n    border-radius: 6px;\n    transition: all 0.2s;\n    white-space: nowrap;\n    overflow: hidden;\n}\n\n.nav-item:hover, .nav-item.active {\n    background-color: #334155;\n    color: white;\n}\n\n.icon {\n    min-width: 20px;\n    height: 20px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    margin-right: 12px;\n}\n\n/* FOOTER */\n.sidebar-footer {\n    padding: 20px;\n    border-top: 1px solid #334155;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n}\n.user-info { display: flex; align-items: center; overflow: hidden; }\n.avatar {\n    width: 32px; height: 32px; background: #3b82f6; border-radius: 50%;\n    display: flex; align-items: center; justify-content: center;\n    font-weight: bold; font-size: 14px; margin-right: 10px; flex-shrink: 0;\n}\n.details { display: flex; flex-direction: column; }\n.name { font-size: 14px; font-weight: 500; }\n.role { font-size: 12px; color: #94a3b8; }\n.logout-btn {\n    background: none; border: none; color: #94a3b8; cursor: pointer;\n    padding: 5px; transition: color 0.2s;\n}\n.logout-btn:hover { color: #ef4444; }\n\n/* Collapsed State Handling */\n.sidebar-inner.collapsed .text,\n.sidebar-inner.collapsed .logo-text,\n.sidebar-inner.collapsed .details {\n    opacity: 0;\n    pointer-events: none;\n    display: none; /* Hide text when collapsed */\n}\n.sidebar-inner.collapsed .sidebar-header,\n.sidebar-inner.collapsed .nav-item {\n    justify-content: center;\n    padding-left: 0; padding-right: 0;\n}\n.sidebar-inner.collapsed .icon { margin-right: 0; }</style>",
_dynamicNodes : [{"type":"attr","position":[1]},{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,3,3]},{"type":"if","position":[1,3,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,7]},{"type":"if","position":[1,3,7],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,9]},{"type":"if","position":[1,3,9],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,11]},{"type":"if","position":[1,3,11],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,13]},{"type":"if","position":[1,3,13],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,15]},{"type":"if","position":[1,3,15],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,5,1,1,0]},{"type":"text","position":[1,5,1,3,1,0]},{"type":"text","position":[1,5,1,3,3,0]},{"type":"attr","position":[1,5,3]}],
_observedAttributes :["isCollapsed","userName","userRole","userInitials","canViewCompanies","canViewContacts","canCreateContacts","canViewDeals","canViewActivities","canViewUsers","canViewProfiles","canViewRoles"],

	// 1. Ensure mixin is loaded
	// mixins: ["auth-mixin"],

	data: function() {
		return {
			isCollapsed: Lyte.attr("boolean", { default: false }),
			userName: Lyte.attr("string", { default: "User" }),
			userRole: Lyte.attr("string", { default: "Guest" }),
			userInitials: Lyte.attr("string", { default: "U" }),

			canViewCompanies: Lyte.attr("boolean", { default: false }),
			canViewContacts: Lyte.attr("boolean", { default: false }),
			canCreateContacts: Lyte.attr("boolean", { default: false }),
			canViewDeals: Lyte.attr("boolean", { default: false }),
			canViewActivities: Lyte.attr("boolean", { default: false }),
			canViewUsers: Lyte.attr("boolean", { default: false }),
			canViewProfiles: Lyte.attr("boolean", { default: false }),
			canViewRoles: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		let user = this.getAuthUser();
		console.log("Sidebar User Data:", user);

		if (user) {
			this.setData('userName', user.fullName);
			this.setData('userRole', user.roleName);
			this.setData('userInitials', user.fullName ? user.fullName.charAt(0) : "U");

			// Debug Permissions
			console.log("Checking Permissions...");
			let contactAccess = this.canAccess('contacts');
			console.log("Can Access Contacts?", contactAccess);

			this.setData('canViewCompanies', this.canAccess('companies'));
			this.setData('canViewContacts', contactAccess);
			this.setData('canCreateContacts', this.canAccess('contacts'));
			this.setData('canViewDeals', this.canAccess('deals'));
			this.setData('canViewActivities', this.canAccess('activities'));
			this.setData('canViewUsers', this.canAccess('users'));
			this.setData('canViewProfiles', this.canAccess('profiles'));
			this.setData('canViewRoles', this.canAccess('roles'));
		}
	},

	actions: {
		toggleSidebar: function() {
			this.setData('isCollapsed', !this.getData('isCollapsed'));
		},
		logout: function() {
			this.logoutUser();
		}
	},
	// Note: We removed the 'methods' block because 'canAccess'
	// is already provided by the auth-mixin.
}, { mixins: ["auth-mixin"] });
Lyte.Component.register("logger-comp",{
_template:"<template tag-name=\"logger-comp\"> <h1>Logging</h1> </template>",
_dynamicNodes : [],

	init:function(){
		this.logger.log("test");
		this.log1.log("test-1");
	}
},{
	services: ["logger", {service:"logger", as:"log1"}, {service:"logger", as:"log2", scope:"static"}, {service:"logger", as:"log3", scope: "instance"}]
});
Lyte.Component.register("login-comp", {
_template:"<template tag-name=\"login-comp\"> <div class=\"login-wrapper\" style=\"display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f7f6;\"> <div class=\"card form-container\" style=\"width: 100%; max-width: 400px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\"> <div class=\"card-body\"> <h2 class=\"form-title\" style=\"text-align: center; margin-bottom: 2rem; color: #333;\">Login</h2> <template is=\"if\" value=\"{{error}}\"> <div class=\"alert alert-error\" style=\"background-color: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 1rem;\">{{error}}</div> </template> <div class=\"form-group\" style=\"margin-bottom: 1rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Username</label> <input type=\"text\" lyte-model=\"username\" class=\"form-input\" placeholder=\"Username\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-group\" style=\"margin-bottom: 1.5rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Password</label> <input type=\"password\" lyte-model=\"password\" class=\"form-input\" placeholder=\"Password\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-actions\"> <button class=\"btn btn-primary\" onclick=\"{{action('login')}}\" disabled=\"{{isLoading}}\" style=\"width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;\"> <template is=\"if\" value=\"{{isLoading}}\">Loading...</template> <template is=\"else\">Login</template> </button> </div> </div> </div> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,3]},{"type":"if","position":[1,1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,1,1,9,1]},{"type":"attr","position":[1,1,1,9,1,1]},{"type":"if","position":[1,1,1,9,1,1],"cases":{},"default":{}}],
_observedAttributes :["username","password","error","isLoading"],

    data : function(){
        return {
            username : Lyte.attr("string", { default: "" }),
            password : Lyte.attr("string", { default: "" }),
            error : Lyte.attr("string", { default: "" }),
            isLoading : Lyte.attr("boolean", { default: false })
        }
    },

    actions : {
        login : function() {
            let self = this;
            let username = this.getData('username');
            let password = this.getData('password');

            console.log("Login attempt:", username);

            if(!username || !password) {
                this.setData('error', 'Please enter username and password');
                return;
            }

            this.setData('isLoading', true);
            this.setData('error', '');

            this.loginUser(username, password)
                .then(function(res) {
                    console.log("Login successful", res);
                    self.setData('isLoading', false);
                    Lyte.Router.transitionTo('crm-app.crm-dashboard');
                })
                .catch(function(err) {
                    console.error("Login rejected", err);
                    self.setData('isLoading', false);

                    let msg = "Invalid Credentials";
                    if(err && err.data && err.data.message) {
                        msg = err.data.message;
                    } else if (err.message) {
                        msg = err.message;
                    }
                    self.setData('error', msg);
                });
        }
    }
},
    { mixins: ["api-mixin", "crm-api-mixin", "auth-mixin"]}
);
Lyte.Component.register("welcome-comp",{
_template:"<template tag-name=\"welcome-comp\"> <h1>Available features of LYTE</h1> <ul> <template items=\"{{features}}\" item=\"item\" index=\"index\" is=\"for\"><li> <a href=\"{{item.url}}\" target=\"_blank\">{{item.module}}</a> </li></template> </ul> </template>",
_dynamicNodes : [{"type":"attr","position":[3,1]},{"type":"for","position":[3,1],"dynamicNodes":[{"type":"attr","position":[0,1]},{"type":"text","position":[0,1,0]}]}],
_observedAttributes :["features"],

	data : function(){
		return {
			features : Lyte.attr("array")
		}
	},
	actions : {
		// Functions for event handling
	},
	methods : {
		// Functions which can be used as callback in the component.
	}
});

Lyte.Router.registerRoute("crm-app.crm-dashboard", {
    model: function() {
        return {};
    },
    renderTemplate: function() {
        return {
            outlet: "#crm_inner_outlet",
            component: "crm-dashboard"
        };
    }
});
Lyte.Component.register("contact-view", {
_template:"<template tag-name=\"contact-view\"> <div class=\"page-container\"> <header class=\"view-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Contact Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-container\"> <div class=\"spinner\"></div> <p>Loading details...</p> </div> </template></template> <template is=\"if\" value=\"{{errorMsg}}\"><template case=\"true\"> <div class=\"error-container\"> <p class=\"error-text\">{{errorMsg}}</p> <button onclick=\"{{action('goBack')}}\" class=\"btn-primary\">Back to List</button> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(expHandlers(isLoading,'!'),'&amp;&amp;',expHandlers(errorMsg,'!'))}}\"><template case=\"true\"> <div class=\"content-card\"> <div class=\"contact-profile\"> <div class=\"profile-avatar\"> <span>{{contact.initials}}</span> </div> <div class=\"profile-info\"> <h2 class=\"profile-name\">{{contact.name}}</h2> <div class=\"profile-meta\"> <span>{{contact.designation}}</span> <template is=\"if\" value=\"{{company}}\"><template case=\"true\"> <span> at <span class=\"link-text\">{{company.name}}</span></span> </template></template> </div> </div> <div class=\"profile-actions\"> <template is=\"if\" value=\"{{canEdit}}\"><template case=\"true\"> <button onclick=\"{{action('editContact')}}\" class=\"btn-secondary\">Edit</button> </template></template> <template is=\"if\" value=\"{{canDelete}}\"><template case=\"true\"> <button onclick=\"{{action('deleteContact')}}\" class=\"btn-danger-ghost\">Delete</button> </template></template> </div> </div> <div class=\"info-grid\"> <div class=\"info-item\"> <label>Email</label> <div class=\"value\">{{contact.email}}</div> </div> <div class=\"info-item\"> <label>Phone</label> <div class=\"value\">{{contact.phone}}</div> </div> <div class=\"info-item\"> <label>Company</label> <div class=\"value\">{{expHandlers(company,'?:',company.name,'-')}}</div> </div> <div class=\"info-item\"> <label>Designation</label> <div class=\"value\">{{contact.designation}}</div> </div> </div> <div class=\"tabs-nav\"> <div class=\"tab-item {{expHandlers(expHandlers(currentTab,'==','deals'),'?:','active','')}}\" onclick=\"{{action('switchTab','deals')}}\"> Deals ({{deals.length}}) </div> <div class=\"tab-item {{expHandlers(expHandlers(currentTab,'==','activities'),'?:','active','')}}\" onclick=\"{{action('switchTab','activities')}}\"> Activities ({{activities.length}}) </div> </div> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','deals')}}\"><template case=\"true\"> <div class=\"tab-panel\"> <template is=\"if\" value=\"{{expHandlers(deals.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No deals linked to this contact.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{deals}}\" item=\"deal\" index=\"i\"> <div class=\"list-row\"> <div class=\"row-icon blue\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path></svg> </div> <div class=\"row-content\"> <div class=\"row-title\">{{deal.title}}</div> <div class=\"row-sub\"> {{deal.amount}} <span style=\"margin: 0 5px; color: #cbd5e1;\">•</span> {{deal.date}} </div> </div> <div class=\"row-badge\">{{deal.status}}</div> </div> </template> </template></template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','activities')}}\"><template case=\"true\"> <div class=\"tab-panel\"> <template is=\"if\" value=\"{{expHandlers(activities.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No activities recorded.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{activities}}\" item=\"act\" index=\"i\"> <div class=\"list-row\"> <div class=\"row-icon gray\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg> </div> <div class=\"row-content\"> <div class=\"row-title\">{{act.description}}</div> <div class=\"row-sub\"> {{act.type}} <span style=\"margin: 0 5px; color: #cbd5e1;\">•</span> {{act.date}} </div> </div> <div class=\"row-badge\">{{act.status}}</div> </div> </template> </template></template> </div> </template></template> </div> </template></template> </div> </template>\n<style>/* CONTAINER & HEADER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    overflow-y: auto;\n}\n\n.view-header {\n    display: flex;\n    align-items: center;\n    margin-bottom: 20px;\n}\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; color: #1e293b; margin: 0; font-weight: 600; }\n\n.btn-icon {\n    background: none; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 6px; cursor: pointer; color: #64748b; background: white;\n    display: flex; align-items: center;\n}\n.btn-icon:hover { background: #f1f5f9; color: #0f172a; }\n\n/* MAIN CARD */\n.content-card {\n    background: white;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n    overflow: hidden;\n}\n\n/* PROFILE HEADER */\n.contact-profile {\n    padding: 24px;\n    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);\n    border-bottom: 1px solid #e2e8f0;\n    display: flex;\n    align-items: center;\n    gap: 20px;\n}\n.profile-avatar {\n    width: 64px; height: 64px;\n    border-radius: 50%;\n    background-color: #3b82f6;\n    color: white;\n    font-size: 24px; font-weight: bold;\n    display: flex; align-items: center; justify-content: center;\n    flex-shrink: 0;\n}\n.profile-info { flex-grow: 1; }\n.profile-name { margin: 0 0 4px 0; font-size: 24px; color: #0f172a; }\n.profile-meta { color: #64748b; font-size: 14px; }\n.link-text { color: #2563eb; font-weight: 500; cursor: pointer; }\n\n/* ACTION BUTTONS */\n.profile-actions { display: flex; gap: 10px; }\n.btn-secondary {\n    padding: 8px 16px; border: 1px solid #cbd5e1; background: white;\n    border-radius: 6px; cursor: pointer; font-weight: 500; color: #334155;\n}\n.btn-danger-ghost {\n    padding: 8px 16px; border: none; background: transparent;\n    cursor: pointer; font-weight: 500; color: #ef4444;\n}\n.btn-secondary:hover { background: #f8fafc; }\n.btn-danger-ghost:hover { background: #fee2e2; }\n\n/* INFO GRID */\n.info-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 20px;\n    padding: 24px;\n    border-bottom: 1px solid #f1f5f9;\n}\n.info-item label {\n    display: block; font-size: 11px; text-transform: uppercase;\n    color: #94a3b8; margin-bottom: 4px; letter-spacing: 0.5px;\n}\n.info-item .value { font-size: 14px; color: #0f172a; font-weight: 500; }\n\n/* TABS */\n.tabs-nav {\n    display: flex;\n    border-bottom: 1px solid #e2e8f0;\n    padding: 0 24px;\n}\n.tab-item {\n    padding: 12px 20px;\n    cursor: pointer;\n    color: #64748b;\n    border-bottom: 2px solid transparent;\n    font-weight: 500;\n    font-size: 14px;\n}\n.tab-item:hover { color: #334155; }\n.tab-item.active {\n    color: #2563eb;\n    border-bottom-color: #2563eb;\n}\n\n/* TAB PANELS & LISTS */\n.tab-panel { padding: 0; }\n.empty-tab { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }\n\n.list-row {\n    display: flex; align-items: center;\n    padding: 16px 24px;\n    border-bottom: 1px solid #f1f5f9;\n}\n.list-row:last-child { border-bottom: none; }\n\n.row-icon {\n    width: 36px; height: 36px; border-radius: 6px;\n    display: flex; align-items: center; justify-content: center;\n    margin-right: 15px;\n}\n.row-icon.blue { background: #e0f2fe; color: #0284c7; }\n.row-icon.gray { background: #f1f5f9; color: #64748b; }\n\n.row-content { flex-grow: 1; }\n.row-title { font-weight: 500; color: #0f172a; font-size: 14px; }\n.row-sub { color: #64748b; font-size: 12px; margin-top: 2px; }\n\n.row-badge {\n    font-size: 11px; padding: 2px 8px; border-radius: 10px;\n    background: #f1f5f9; color: #475569; font-weight: 600;\n    text-transform: uppercase;\n}\n\n/* LOADING / ERROR */\n.loading-container, .error-container {\n    padding: 50px; text-align: center; color: #64748b;\n}\n.spinner {\n    width: 30px; height: 30px; border: 3px solid #cbd5e1;\n    border-top-color: #2563eb; border-radius: 50%;\n    margin: 0 auto 15px; animation: spin 1s infinite linear;\n}\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,0]},{"type":"attr","position":[1,3]}]}},"default":{}},{"type":"attr","position":[1,7]},{"type":"if","position":[1,7],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,1,1,0]},{"type":"text","position":[1,1,3,1,0]},{"type":"text","position":[1,1,3,3,1,0]},{"type":"attr","position":[1,1,3,3,3]},{"type":"if","position":[1,1,3,3,3],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,0]}]}},"default":{}},{"type":"attr","position":[1,1,5,1]},{"type":"if","position":[1,1,5,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,5,3]},{"type":"if","position":[1,1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"text","position":[1,3,1,3,0]},{"type":"text","position":[1,3,3,3,0]},{"type":"text","position":[1,3,5,3,0]},{"type":"text","position":[1,3,7,3,0]},{"type":"attr","position":[1,5,1]},{"type":"text","position":[1,5,1,1]},{"type":"attr","position":[1,5,3]},{"type":"text","position":[1,5,3,1]},{"type":"attr","position":[1,7]},{"type":"if","position":[1,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,1]},{"type":"text","position":[1,3,3,5]},{"type":"text","position":[1,5,0]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,9]},{"type":"if","position":[1,9],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,1]},{"type":"text","position":[1,3,3,5]},{"type":"text","position":[1,5,0]}]}]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["contactId","contact","company","deals","activities","isLoading","errorMsg","currentTab","canEdit","canDelete"],

	data: function() {
		return {
			contactId: Lyte.attr("string", { default: "" }),
			contact: Lyte.attr("object", { default: {} }),
			company: Lyte.attr("object", { default: {} }),
			deals: Lyte.attr("array", { default: [] }),
			activities: Lyte.attr("array", { default: [] }),
			isLoading: Lyte.attr("boolean", { default: true }),
			errorMsg: Lyte.attr("string", { default: "" }),
			currentTab: Lyte.attr("string", { default: "deals" }),
			canEdit: Lyte.attr("boolean", { default: false }),
			canDelete: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];
		if (!id || id === "contacts") {
			window.location.hash = "#/contacts";
			return;
		}
		this.setData('contactId', id);
		this.setData('canEdit', this.hasPermission('CONTACT_UPDATE'));
		this.setData('canDelete', this.hasPermission('CONTACT_DELETE'));
		this.loadContactDetails(id);
	},

	loadContactDetails: function(id) {
		this.setData('isLoading', true);

		this.crmGetContact(id)
			.then((res) => {
				console.log("API RAW RESPONSE:", res);

				// --- 1. ROBUST DATA EXTRACTION ---
				let rootData = {};

				// Case A: Axios/HTTP Wrapper -> { data: { data: { ... } } }
				if (res && res.data && res.data.data) {
					rootData = res.data.data;
				}
				// Case B: Standard JSON -> { data: { ... }, success: true }
				else if (res && res.data) {
					rootData = res.data;
				}
					// Case C: Already Unwrapped -> { contact: ..., deals: ... }
				// (This catches mixins that return response.data automatically)
				else if (res && (res.contact || res.deals)) {
					rootData = res;
				}

				console.log("FINAL ROOT DATA:", rootData);

				// --- 2. NORMALIZE DATA ---

				// Contact
				let c = rootData.contact || {};
				this.setData('contact', {
					id: c.id,
					name: c.name || "Unknown",
					email: c.email || "",
					phone: c.phone || "",
					designation: c.jobTitle || c.designation || "-",
					initials: (c.name || "U").substring(0, 2).toUpperCase()
				});

				// Company
				this.setData('company', rootData.company || null);

				// Deals
				let rawDeals = Array.isArray(rootData.deals) ? rootData.deals : [];
				let cleanDeals = rawDeals.map(d => {
					return {
						id: d.id,
						title: d.title,
						// Safe check for status
						status: (d.status || "NEW").replace("_", " "),
						// Call helper methods via 'this'
						amount: this.formatMoney(d.amount),
						date: this.formatJavaDate(d.createdAt)
					};
				});
				this.setData('deals', cleanDeals);

				// Activities
				let rawActivities = Array.isArray(rootData.activities) ? rootData.activities : [];
				let cleanActivities = rawActivities.map(a => {
					return {
						id: a.id,
						description: a.description,
						type: a.type || "ACTIVITY",
						status: a.statusCode || "PENDING",
						date: this.formatJavaDate(a.createdAt)
					};
				});
				this.setData('activities', cleanActivities);

			})
			.catch((err) => {
				console.error("View Error:", err);
				this.setData('errorMsg', "Failed to load data.");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- HELPER FUNCTIONS (Must be strictly defined) ---

	formatJavaDate: function(dateObj) {
		if (!dateObj || !dateObj.year) return "";
		let months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		let mIndex = months.indexOf(dateObj.month);
		let mStr = mIndex > -1 ? shortMonths[mIndex] : dateObj.month;

		return mStr + " " + dateObj.dayOfMonth + ", " + dateObj.year;
	},

	formatMoney: function(amount) {
		if (amount === undefined || amount === null) return "$0.00";
		return "$" + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	actions: {
		switchTab: function(tabName) {
			this.setData('currentTab', tabName);
		},
		goBack: function() {
			window.location.hash = "#/contacts";
		},
		editContact: function() {
			alert("Edit feature coming soon");
		},
		deleteContact: function() {
			if (confirm("Delete this contact?")) {
				let id = this.getData('contactId');
				this.crmDeleteContact(id).then(() => {
					alert("Deleted");
					this.executeAction('goBack');
				});
			}
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Router.registerRoute("crm-app.contact-view", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "contact-view"
        };
    }
});
Lyte.Component.register("contact-list", {
_template:"<template tag-name=\"contact-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Contacts</h1> <template is=\"if\" value=\"{{canCreate}}\"> <a href=\"#/contacts/create\" class=\"add-btn\"> <span>+ Add Contact</span> </a> </template> </header> <div class=\"search-bar\"> <div class=\"input-group\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearch')}}\" placeholder=\"Search contacts...\" class=\"clean-input\"> </div> <div class=\"select-group\"> <select lyte-model=\"selectedCompany\" onchange=\"{{action('onCompanyFilter',this)}}\" class=\"clean-select\"> <option value=\"\">All Companies</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companyList}}\" item=\"comp\" index=\"i\"></option> </select> </div> </div> <div class=\"list-card\"> <div style=\"padding: 10px; color: #888; font-size: 12px; border-bottom: 1px solid #eee;\"> Debug: Found {{displayedContacts.length}} contacts. </div> <div class=\"list-scroll-area\"> <template is=\"for\" items=\"{{displayedContacts}}\" item=\"contact\" index=\"i\"> <div class=\"list-item\" onclick=\"{{action('viewContact',contact.id)}}\"> <div class=\"item-avatar\"> <span style=\"font-size: 14px; font-weight: bold;\"> {{contact.name.0}} </span> </div> <div class=\"item-details\"> <div class=\"item-name\">{{contact.name}}</div> <div class=\"item-meta\"> <span>{{contact.email}}</span> <span class=\"dot\">•</span> <span>{{contact.phone}}</span> </div> <div class=\"item-company\">{{contact.companyName}}</div> </div> <div class=\"item-action\">›</div> </div> </template> </div> </div> </div> </template>\n<style>.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh; /* Full Height */\n    display: flex;\n    flex-direction: column;\n}\n\n.page-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 20px;\n}\n\n.title { margin: 0; color: #1e293b; font-size: 24px; }\n\n.add-btn {\n    background: #2563eb; color: white; padding: 8px 16px;\n    border-radius: 6px; text-decoration: none; display: inline-block;\n}\n\n.search-bar { display: flex; gap: 15px; margin-bottom: 20px; }\n\n.input-group {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 8px 12px; display: flex; align-items: center; flex-grow: 1;\n}\n.clean-input { border: none; outline: none; width: 100%; }\n\n.clean-select {\n    padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;\n    background: white; min-width: 180px; height: 100%;\n}\n\n/* LIST STYLES */\n.list-card {\n    background: white;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n    flex-grow: 1;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden; /* Contains the scroll area */\n}\n\n.list-scroll-area {\n    overflow-y: auto;\n    flex-grow: 1;\n    height: 100%; /* Force height */\n}\n\n.list-item {\n    display: flex;\n    align-items: center;\n    padding: 15px 20px;\n    border-bottom: 1px solid #f1f5f9;\n    cursor: pointer;\n}\n.list-item:hover { background-color: #f8fafc; }\n\n.item-avatar {\n    width: 40px; height: 40px; border-radius: 50%;\n    background-color: #e2e8f0; color: #64748b;\n    display: flex; align-items: center; justify-content: center;\n    margin-right: 15px;\n}\n\n.item-details { flex-grow: 1; }\n.item-name { font-weight: 600; color: #0f172a; }\n.item-meta { font-size: 13px; color: #64748b; }\n.dot { margin: 0 5px; }\n.item-company { font-size: 12px; color: #3b82f6; font-weight: 500; }\n.item-action { color: #cbd5e1; font-size: 20px; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,3,1,3]},{"type":"attr","position":[1,3,3,1]},{"type":"attr","position":[1,3,3,1,3]},{"type":"for","position":[1,3,3,1,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companyList}}\" item=\"comp\" index=\"i\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"text","position":[1,5,1,1]},{"type":"attr","position":[1,5,3,1]},{"type":"for","position":[1,5,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,1,1]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,1,0]},{"type":"text","position":[1,3,3,5,0]},{"type":"text","position":[1,3,5,0]}]}],
_observedAttributes :["allContacts","displayedContacts","companyList","searchTerm","selectedCompany","isLoading","canCreate"],

		data: function() {
			return {
				allContacts: Lyte.attr("array", { default: [] }),
				displayedContacts: Lyte.attr("array", { default: [] }),
				companyList: Lyte.attr("array", { default: [] }),
				searchTerm: Lyte.attr("string", { default: "" }),
				selectedCompany: Lyte.attr("string", { default: "" }),
				isLoading: Lyte.attr("boolean", { default: true }),
				canCreate: Lyte.attr("boolean", { default: false })
			}
		},

		didConnect: function() {
			this.setData('canCreate', this.hasPermission('CONTACT_CREATE'));
			this.loadCompanies();
			this.loadContacts();
		},

		// --- LOGIC FUNCTIONS ---

		loadCompanies: function() {
			this.crmGetCompanies()
				.then((res) => {
					// handle different response structures safely
					let list = [];
					if(res && Array.isArray(res.data)){
						list = res.data;
					} else if(res && res.data && Array.isArray(res.data.data)){
						list = res.data.data;
					}
					this.setData('companyList', list);
				})
				.catch(e => console.error("Error loading companies", e));
		},

		loadContacts: function() {
			this.setData('isLoading', true);

			// 1. Prepare Query Parameters
			let params = {};
			let compId = this.getData('selectedCompany');

			// Only add if compId is valid (not null/empty)
			if (compId) {
				params.companyId = compId;
			}

			// 2. Call API
			this.crmGetContacts(params)
				.then((res) => {
					// 3. Extract Data Directly
					// Your API returns: { data: [Array], success: true }
					// So we simply access res.data. If it's null/undefined, default to []
					let rawContacts = (res && Array.isArray(res.data)) ? res.data : [];

					// 4. Normalize Data (Best Practice)
					// This prevents crashes if a specific field (like phone) is missing in the DB
					let cleanContacts = rawContacts.map(item => ({
						id: item.id,
						name: item.name || "Unknown",
						email: item.email || "",
						phone: item.phone || "",
						companyName: item.companyName || ""
					}));

					// 5. Update UI
					this.setData('allContacts', cleanContacts);
					this.applyClientFilter(); // Refresh the list view
				})
				.catch(e => {
					console.error("Failed to load contacts", e);
					this.setData('allContacts', []); // Clear list on error
					this.applyClientFilter();
				})
				.finally(() => {
					this.setData('isLoading', false);
				});
		},


		applyClientFilter: function() {
			// Always get a fresh copy of the master list
			let all = this.getData('allContacts');
			let term = this.getData('searchTerm'); // Get raw value first

			// Safety check
			if(!all) all = [];
			if(!term) term = "";

			term = term.toLowerCase().trim();

			if (term === "") {
				// Use slice() to create a new array reference.
				// This is CRITICAL for Lyte to detect the change.
				this.setData('displayedContacts', all.slice());
				return;
			}

			let filtered = all.filter(function(c) {
				let name = (c.name || "").toLowerCase();
				let email = (c.email || "").toLowerCase();
				let phone = (c.phone || "").toString();

				return name.includes(term) || email.includes(term) || phone.includes(term);
			});

			this.setData('displayedContacts', filtered);
		},

		actions: {
			onSearch: function() {
				this.applyClientFilter();
			},

			onCompanyFilter: function(element) {
				// 1. Get the value directly from the Select Element
				let selectedValue = element.value;

				console.log("UI Selected Value:", selectedValue);

				// 2. Manually update the data (Bypassing lyte-model delay)
				this.setData('selectedCompany', selectedValue);

				// 3. Now loadContacts will definitely see the new ID
				this.loadContacts();
			},

			viewContact: function(id) {
				window.location.hash = "/contacts/" + id;
			}
		}
	},
	{
		mixins: ["api-mixin", "crm-api-mixin", "auth-mixin", "utils-mixin"]
	});
Lyte.Router.registerRoute("crm-app.deal-list", {
    model: function() {
        return {};
    },
    renderTemplate: function() {
        return {
            outlet: "#crm_inner_outlet",
            component: "deal-list"
        };
    }
});
Lyte.Component.register("deal-list", {
_template:"<template tag-name=\"deal-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Deals Board</h1> <template is=\"if\" value=\"{{canCreate}}\"><template case=\"true\"> <button onclick=\"{{action('createDeal')}}\" class=\"add-btn\"> <span>+ New Deal</span> </button> </template></template> </header> <div class=\"controls-bar\"> <div class=\"search-wrapper\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearch')}}\" placeholder=\"Search deals...\" class=\"search-input\"> </div> <div class=\"view-toggles\"> <button class=\"toggle-btn {{expHandlers(expHandlers(viewType,'==','kanban'),'?:','active','')}}\" onclick=\"{{action('setView','kanban')}}\" title=\"Kanban View\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"></rect><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"></rect><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"></rect></svg> </button> <button class=\"toggle-btn {{expHandlers(expHandlers(viewType,'==','list'),'?:','active','')}}\" onclick=\"{{action('setView','list')}}\" title=\"List View\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"8\" y1=\"6\" x2=\"21\" y2=\"6\"></line><line x1=\"8\" y1=\"12\" x2=\"21\" y2=\"12\"></line><line x1=\"8\" y1=\"18\" x2=\"21\" y2=\"18\"></line><line x1=\"3\" y1=\"6\" x2=\"3.01\" y2=\"6\"></line><line x1=\"3\" y1=\"12\" x2=\"3.01\" y2=\"12\"></line><line x1=\"3\" y1=\"18\" x2=\"3.01\" y2=\"18\"></line></svg> </button> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading pipeline...</p> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(isLoading,'!')}}\"><template case=\"true\"> <template is=\"if\" value=\"{{expHandlers(viewType,'==','kanban')}}\"><template case=\"true\"> <div class=\"kanban-container\"> <template is=\"for\" items=\"{{kanbanData}}\" item=\"column\" index=\"i\"> <div class=\"kanban-column {{column.cssClass}}\"> <div class=\"column-header\"> <span class=\"col-title\">{{column.label}}</span> <span class=\"col-count\">{{column.count}}</span> </div> <div class=\"column-body\"> <template is=\"if\" value=\"{{expHandlers(column.count,'===',0)}}\"><template case=\"true\"> <div class=\"empty-col\">No deals</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{column.items}}\" item=\"deal\" index=\"j\"> <div class=\"kanban-card\" onclick=\"{{action('viewDeal',deal.id)}}\"> <div class=\"card-title\">{{deal.title}}</div> <div class=\"card-company\">{{deal.companyName}}</div> <div class=\"card-footer\"> <span class=\"amount\">{{deal.formattedAmount}}</span> <span class=\"date\">{{deal.date}}</span> </div> </div> </template> </template></template> </div> </div> </template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(viewType,'==','list')}}\"><template case=\"true\"> <div class=\"list-container\"> <template is=\"if\" value=\"{{expHandlers(displayedDeals.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No deals found matching your search.</div> </template><template case=\"false\"> <div class=\"deal-table\"> <template is=\"for\" items=\"{{displayedDeals}}\" item=\"deal\" index=\"k\"> <div class=\"deal-row\" onclick=\"{{action('viewDeal',deal.id)}}\"> <div class=\"deal-info\"> <div class=\"row-title\">{{deal.title}}</div> <div class=\"row-company\">{{deal.companyName}}</div> </div> <div class=\"deal-status\"> <span class=\"badge {{deal.status}}\">{{deal.status}}</span> </div> <div class=\"deal-amount\">{{deal.formattedAmount}}</div> <div class=\"deal-arrow\">›</div> </div> </template> </div> </template></template> </div> </template></template> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 20px;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    background-color: #f4f7f6;\n    overflow: hidden; /* Prevent double scrollbars */\n}\n\n/* HEADER & CONTROLS */\n.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }\n.title { margin: 0; color: #1e293b; font-size: 24px; }\n.add-btn { background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; border:none; cursor: pointer; }\n\n.controls-bar { display: flex; gap: 15px; margin-bottom: 20px; }\n.search-wrapper {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 8px 12px; display: flex; align-items: center; flex-grow: 1;\n}\n.search-input { border: none; outline: none; width: 100%; font-size: 14px; }\n.view-toggles { display: flex; gap: 5px; }\n.toggle-btn {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 6px 10px; cursor: pointer; color: #64748b;\n}\n.toggle-btn.active { background: #2563eb; color: white; border-color: #2563eb; }\n\n/* KANBAN BOARD */\n.kanban-container {\n    display: flex;\n    gap: 15px;\n    overflow-x: auto; /* Horizontal Scroll */\n    padding-bottom: 15px;\n    flex-grow: 1;\n    height: 100%;\n}\n\n.kanban-column {\n    min-width: 280px;\n    max-width: 280px;\n    background: #f1f5f9;\n    border-radius: 8px;\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n}\n\n.column-header {\n    padding: 12px 15px;\n    background: white;\n    border-radius: 8px 8px 0 0;\n    border-bottom: 1px solid #e2e8f0;\n    border-top: 3px solid transparent; /* Colored top border */\n    display: flex; justify-content: space-between; align-items: center;\n}\n.col-title { font-weight: 600; font-size: 14px; color: #334155; }\n.col-count { background: #f1f5f9; padding: 2px 8px; border-radius: 10px; font-size: 11px; }\n\n/* Column Colors */\n.kanban-column.new .column-header { border-top-color: #3b82f6; } /* Blue */\n.kanban-column.qualified .column-header { border-top-color: #0ea5e9; } /* Cyan */\n.kanban-column.proposal .column-header { border-top-color: #6366f1; } /* Indigo */\n.kanban-column.in-progress .column-header { border-top-color: #f59e0b; } /* Orange */\n.kanban-column.delivered .column-header { border-top-color: #8b5cf6; } /* Purple */\n.kanban-column.closed .column-header { border-top-color: #10b981; } /* Green */\n\n.column-body {\n    padding: 10px;\n    overflow-y: auto; /* Vertical Scroll per column */\n    flex-grow: 1;\n}\n\n/* KANBAN CARD */\n/* KANBAN COLUMN FIXES */\n.kanban-container {\n    display: flex;\n    gap: 15px;\n    overflow-x: auto;\n    padding-bottom: 15px;\n    height: 100%;\n}\n\n.kanban-column {\n    min-width: 280px;\n    max-width: 280px;\n    background: #f1f5f9; /* Light Grey Background */\n    border-radius: 8px;\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    border: 1px solid #e2e8f0; /* Ensure visibility */\n}\n\n.column-header {\n    padding: 12px;\n    background: white;\n    border-radius: 8px 8px 0 0;\n    border-bottom: 1px solid #e2e8f0;\n    font-weight: bold;\n    display: flex;\n    justify-content: space-between;\n}\n\n.column-body {\n    padding: 10px;\n    overflow-y: auto;\n    flex-grow: 1;\n    min-height: 100px; /* Force height so you can see it */\n}\n\n.kanban-card {\n    background: white;\n    padding: 12px;\n    border-radius: 6px;\n    box-shadow: 0 1px 2px rgba(0,0,0,0.05);\n    margin-bottom: 10px;\n    cursor: pointer;\n    border: 1px solid transparent;\n}\n.kanban-card:hover { border-color: #cbd5e1; }\n\n.card-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }\n.card-company { font-size: 12px; color: #64748b; margin-bottom: 8px; }\n.card-footer { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }\n.amount { color: #10b981; font-weight: 600; }\n/* LIST VIEW */\n.list-container {\n    background: white;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n    overflow: hidden;\n    flex-grow: 1;\n    overflow-y: auto;\n}\n.deal-row {\n    display: flex; align-items: center; padding: 15px 20px;\n    border-bottom: 1px solid #f1f5f9; cursor: pointer;\n}\n.deal-row:hover { background: #f8fafc; }\n.deal-info { flex-grow: 1; }\n.row-title { font-weight: 600; color: #0f172a; }\n.row-company { font-size: 12px; color: #64748b; }\n.deal-status { width: 120px; }\n.deal-amount { width: 100px; font-weight: 600; color: #0f172a; text-align: right; margin-right: 20px; }\n.deal-arrow { color: #cbd5e1; font-weight: bold; }\n\n.badge { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: #f1f5f9; color: #475569; font-weight: 600; }\n.badge.CLOSED { background: #dcfce7; color: #166534; }\n.badge.NEW { background: #dbeafe; color: #1e40af; }\n\n/* LOADING/EMPTY */\n.loading-state, .empty-state, .empty-col { text-align: center; color: #94a3b8; padding: 20px; font-size: 13px; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s infinite linear; margin: 0 auto 10px; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,1,3]},{"type":"attr","position":[1,3,3,1]},{"type":"attr","position":[1,3,3,3]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,7]},{"type":"if","position":[1,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3,1]},{"type":"if","position":[1,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,0]},{"type":"text","position":[1,3,0]},{"type":"text","position":[1,5,1,0]},{"type":"text","position":[1,5,3,0]}]}]}},"default":{}}]}]}},"default":{}},{"type":"attr","position":[3]},{"type":"if","position":[3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3,1]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,5,0]}]}]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["allDeals","displayedDeals","kanbanData","viewType","searchTerm","isLoading","canCreate","stages","stageLabels"],

	data: function() {
		return {
			// Master Data
			allDeals: Lyte.attr("array", { default: [] }),

			// UI Data (Derived from allDeals)
			displayedDeals: Lyte.attr("array", { default: [] }), // For List View
			kanbanData: Lyte.attr("array", { default: [] }),     // For Kanban View

			// Configuration
			viewType: Lyte.attr("string", { default: "kanban" }),
			searchTerm: Lyte.attr("string", { default: "" }),
			isLoading: Lyte.attr("boolean", { default: true }),
			canCreate: Lyte.attr("boolean", { default: false }),

			// Constants
			stages: Lyte.attr("array", {
				default: ['NEW', 'QUALIFIED', 'PROPOSAL', 'IN_PROGRESS', 'DELIVERED', 'CLOSED']
			}),
			stageLabels: Lyte.attr("object", {
				default: {
					NEW: 'New', QUALIFIED: 'Qualified', PROPOSAL: 'Proposal',
					IN_PROGRESS: 'In Progress', DELIVERED: 'Delivered', CLOSED: 'Closed'
				}
			})
		}
	},

	didConnect: function() {
		this.setData('canCreate', this.hasPermission('DEAL_CREATE'));
		this.loadDeals();
	},

	// --- MAIN LOGIC ---

	loadDeals: function() {
		this.setData('isLoading', true);

		// 1. USE THE MIXIN METHOD (Fixed)
		this.crmGetDeals()
			.then((res) => {
				console.log("Deals API Response:", res);

				let rawData = [];

				// 2. ROBUST DATA EXTRACTION (Same logic as Contact List)
				// Check if 'res' is the array (rare)
				if (Array.isArray(res)) {
					rawData = res;
				}
				// Check if 'res.data' is the array (Standard JSON)
				else if (res && Array.isArray(res.data)) {
					rawData = res.data;
				}
				// Check if 'res.data.data' is the array (Axios/HTTP Wrapper)
				else if (res && res.data && Array.isArray(res.data.data)) {
					rawData = res.data.data;
				}
				// Check for 'responseData' (Lyte specific cases)
				else if (res && res.responseData) {
					rawData = res.responseData;
				}

				console.log("Extracted Deals Count:", rawData.length);

				// 3. NORMALIZE DATA
				let cleanDeals = rawData.map(d => ({
					id: d.id,
					title: d.title,
					companyName: d.companyName || "No Company",
					status: d.status || "NEW",
					amount: d.amount, // Keep number for sorting if needed
					formattedAmount: this.formatMoney(d.amount),
					date: this.formatJavaDate(d.createdAt),
					assignedTo: d.assignedUserName || "Unassigned"
				}));

				this.setData('allDeals', cleanDeals);
				this.organizeDeals(); // Build the views
			})
			.catch(e => {
				console.error("Error loading deals", e);
				this.setData('allDeals', []); // Clear to prevent stale state
				this.organizeDeals();
			})
			.finally(() => this.setData('isLoading', false));
	},

	// This function filters data AND rebuilds the Kanban columns
	organizeDeals: function() {
		let term = this.getData('searchTerm'); // Get raw value
		if (!term) term = "";
		term = term.toLowerCase().trim();

		let all = this.getData('allDeals') || [];
		let stages = this.getData('stages');
		let labels = this.getData('stageLabels');

		// 1. Filter
		let filtered = all;
		if (term) {
			filtered = all.filter(d =>
				(d.title && d.title.toLowerCase().includes(term)) ||
				(d.companyName && d.companyName.toLowerCase().includes(term))
			);
		}

		// 2. Update List View Data
		this.setData('displayedDeals', filtered);

		// 3. Build Kanban Groups
		let groups = {};
		stages.forEach(s => groups[s] = []);

		filtered.forEach(d => {
			// Determine status (handle unknown statuses safely)
			let status = d.status;
			if (!groups[status]) {
				status = 'NEW'; // Fallback
			}
			groups[status].push(d);
		});

		// Convert to Array for Template Loop
		let kanbanArray = stages.map(status => ({
			id: status,
			label: labels[status] || status,
			items: groups[status],
			count: groups[status].length,
			cssClass: status.toLowerCase().replace('_', '-') // e.g. "in-progress"
		}));

		this.setData('kanbanData', kanbanArray);
	},

	// --- HELPER FUNCTIONS ---

	formatMoney: function(amount) {
		if (amount === undefined || amount === null) return "₹ 0.00";
		return "₹ " + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	formatJavaDate: function(dateObj) {
		if (!dateObj || !dateObj.year) return "";
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		// Adjust monthValue (1-12) to index (0-11)
		let mStr = shortMonths[dateObj.monthValue - 1] || "";
		return mStr + " " + dateObj.dayOfMonth + ", " + dateObj.year;
	},

	actions: {
		setView: function(type) {
			this.setData('viewType', type);
		},

		onSearch: function() {
			this.organizeDeals();
		},

		viewDeal: function(id) {
			// Consistent routing using hash
			window.location.hash = "/deals/" + id;
		},

		createDeal: function() {
			window.location.hash = "/deals/create";
		}
	}
}, {
	// CRITICAL: Added 'crm-api-mixin' here so this.crmGetDeals() works
	mixins: ["api-mixin", "crm-api-mixin", "auth-mixin", "utils-mixin"]
});
Lyte.Router.registerRoute("crm-app.deal-view", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "deal-view"
        };
    }
});
Lyte.Component.register("deal-view", {
_template:"<template tag-name=\"deal-view\"> <div class=\"page-container\"> <header class=\"view-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"> <polyline points=\"15 18 9 12 15 6\"></polyline> </svg> </button> <h1 class=\"header-title\">Deal Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-container\"> <div class=\"spinner\"></div> <p>Loading deal...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{errorMsg}}\"><template case=\"true\"> <div class=\"error-container\"> <p class=\"error-text\">{{errorMsg}}</p> <button onclick=\"{{action('goBack')}}\" class=\"btn-primary\">Back to Board</button> </div> </template><template case=\"false\"> <div class=\"content-card\"> <div class=\"deal-highlight\"> <div class=\"deal-header-top\"> <div class=\"deal-icon {{deal.cssClass}}\"> <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"> <path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path> <path d=\"M2 17l10 5 10-5\"></path> </svg> </div> <div class=\"deal-info\"> <h2>{{deal.title}}</h2> <div class=\"deal-amount\">{{deal.amount}}</div> </div> <div class=\"deal-actions\"> <template is=\"if\" value=\"{{canEdit}}\"><template case=\"true\"> <button onclick=\"{{action('editDeal')}}\" class=\"btn-secondary\">Edit</button> </template></template> <template is=\"if\" value=\"{{canDelete}}\"><template case=\"true\"> <button onclick=\"{{action('deleteDeal')}}\" class=\"btn-danger-ghost\">Delete</button> </template></template> </div> </div> <div class=\"status-pipeline\"> <template is=\"for\" items=\"{{pipelineSteps}}\" item=\"step\" index=\"i\"> <template is=\"if\" value=\"{{step.isClickable}}\"><template case=\"true\"> <div class=\"status-step {{step.cssClass}}\" onclick=\"{{action('updateStatus',step.id)}}\" style=\"cursor:pointer\"> {{step.label}} </div> </template><template case=\"false\"> <div class=\"status-step {{step.cssClass}}\" style=\"cursor:default\"> {{step.label}} </div> </template></template> </template> </div> </div> <div class=\"info-grid\"> <div class=\"info-item\"> <label>Company</label> <div class=\"value link-text\">{{companyName}}</div> </div> <div class=\"info-item\"> <label>Amount</label> <div class=\"value highlight\">{{deal.amount}}</div> </div> <div class=\"info-item\"> <label>Owner</label> <div class=\"value\">{{deal.owner}}</div> </div> <div class=\"info-item\"> <label>Created</label> <div class=\"value\">{{deal.date}}</div> </div> </div> <div class=\"section-container\"> <h3 class=\"section-title\">Contacts ({{contacts.length}})</h3> <template is=\"if\" value=\"{{expHandlers(contacts.length,'>',0)}}\"><template case=\"true\"> <div class=\"list-card\"> <template is=\"for\" items=\"{{contacts}}\" item=\"c\" index=\"i\"> <div class=\"list-row\"> <div class=\"avatar-circle\">{{c.initials}}</div> <div class=\"row-content\"> <div class=\"row-title\">{{c.name}}</div> <div class=\"row-sub\">{{c.job}}</div> </div> </div> </template> </div> </template></template> </div> <div class=\"section-container\"> <h3 class=\"section-title\">Activities ({{activities.length}})</h3> <template is=\"if\" value=\"{{expHandlers(activities.length,'>',0)}}\"><template case=\"true\"> <div class=\"list-card\"> <template is=\"for\" items=\"{{activities}}\" item=\"a\" index=\"i\"> <div class=\"list-row\"> <div class=\"row-content\"> <div class=\"row-title\">{{a.description}}</div> <div class=\"row-sub\"> {{a.date}} <span class=\"dot\">•</span> <span class=\"badge\">{{a.status}}</span> </div> </div> </div> </template> </div> </template><template case=\"false\"> <p class=\"empty-text\">No activities linked.</p> </template></template> </div> </div> </template></template> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow-y: auto;\n}\n.view-header { display: flex; align-items: center; margin-bottom: 20px; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; color: #1e293b; margin: 0; font-weight: 600; }\n.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px; cursor: pointer; display: flex; }\n\n/* MAIN CARD */\n.content-card {\n    background: white; border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;\n}\n\n/* DEAL HIGHLIGHT (Header + Pipeline) */\n.deal-highlight {\n    padding: 24px;\n    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);\n    border-bottom: 1px solid #e2e8f0;\n}\n.deal-header-top { display: flex; gap: 20px; align-items: center; margin-bottom: 24px; }\n\n/* ICON STYLES */\n.deal-icon {\n    width: 56px; height: 56px; border-radius: 12px;\n    display: flex; align-items: center; justify-content: center;\n    color: white; background: #cbd5e1; /* Default */\n}\n.deal-icon.new { background: #3b82f6; }\n.deal-icon.qualified { background: #0ea5e9; }\n.deal-icon.proposal { background: #6366f1; }\n.deal-icon.in-progress { background: #f59e0b; }\n.deal-icon.closed { background: #10b981; }\n\n.deal-info h2 { font-size: 24px; margin: 0 0 5px 0; color: #0f172a; }\n.deal-amount { font-size: 20px; font-weight: bold; color: #10b981; }\n.deal-actions { margin-left: auto; display: flex; gap: 10px; }\n\n/* PIPELINE STEPPER */\n.status-pipeline { display: flex; gap: 8px; margin-top: 10px; }\n.status-step {\n    flex: 1; text-align: center; padding: 10px;\n    border-radius: 6px; background: white;\n    border: 2px solid #e2e8f0; color: #94a3b8;\n    font-size: 13px; font-weight: 500;\n    transition: all 0.2s;\n}\n.status-step.active { background: #2563eb; border-color: #2563eb; color: white; }\n.status-step.completed { background: #e0f2fe; border-color: #2563eb; color: #2563eb; }\n.status-step.won { background: #10b981; border-color: #10b981; color: white; }\n.status-step:hover:not(.active) { border-color: #94a3b8; }\n\n/* INFO GRID */\n.info-grid {\n    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 20px; padding: 24px; border-bottom: 1px solid #f1f5f9;\n}\n.info-item label { display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }\n.info-item .value { font-size: 15px; color: #0f172a; font-weight: 500; }\n.link-text { color: #2563eb; cursor: pointer; }\n\n/* SUB SECTIONS */\n.section-container { padding: 24px; border-bottom: 1px solid #f1f5f9; }\n.section-title { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 15px 0; }\n.list-card { border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }\n\n.list-row {\n    display: flex; align-items: center; padding: 12px 16px;\n    border-bottom: 1px solid #f1f5f9;\n}\n.list-row:last-child { border-bottom: none; }\n.avatar-circle {\n    width: 32px; height: 32px; border-radius: 50%; background: #3b82f6;\n    color: white; display: flex; align-items: center; justify-content: center;\n    font-size: 12px; margin-right: 12px;\n}\n.row-content { flex-grow: 1; }\n.row-title { font-weight: 500; font-size: 14px; }\n.row-sub { font-size: 12px; color: #64748b; }\n.badge { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }\n.empty-text { color: #94a3b8; font-style: italic; }\n\n/* LOADING/ERROR */\n.loading-container, .error-container { padding: 50px; text-align: center; color: #64748b; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,0]},{"type":"attr","position":[1,3]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1]},{"type":"text","position":[1,1,1,3,1,0]},{"type":"text","position":[1,1,1,3,3,0]},{"type":"attr","position":[1,1,1,5,1]},{"type":"if","position":[1,1,1,5,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,1,5,3]},{"type":"if","position":[1,1,1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,3,1]},{"type":"for","position":[1,1,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1]}]}},"default":{}}]},{"type":"text","position":[1,3,1,3,0]},{"type":"text","position":[1,3,3,3,0]},{"type":"text","position":[1,3,5,3,0]},{"type":"text","position":[1,3,7,3,0]},{"type":"text","position":[1,5,1,1]},{"type":"attr","position":[1,5,3]},{"type":"if","position":[1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"text","position":[1,1,0]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]}]}]}},"default":{}},{"type":"text","position":[1,7,1,1]},{"type":"attr","position":[1,7,3]},{"type":"if","position":[1,7,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,1]},{"type":"text","position":[1,1,3,5,0]}]}]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["dealId","deal","companyName","companyId","contacts","activities","pipelineSteps","isLoading","errorMsg","canEdit","canDelete","canChangeStatus","STAGES","STAGE_LABELS"],


	data: function () {
		return {
			dealId: Lyte.attr("string", { default: "" }),
			deal: Lyte.attr("object", { default: {} }),
			companyName: Lyte.attr("string", { default: "-" }),
			companyId: Lyte.attr("string", { default: "" }),
			contacts: Lyte.attr("array", { default: [] }),
			activities: Lyte.attr("array", { default: [] }),
			pipelineSteps: Lyte.attr("array", { default: [] }),
			isLoading: Lyte.attr("boolean", { default: true }),
			errorMsg: Lyte.attr("string", { default: "" }),
			canEdit: Lyte.attr("boolean", { default: false }),
			canDelete: Lyte.attr("boolean", { default: false }),
			canChangeStatus: Lyte.attr("boolean", { default: false }),

			STAGES: Lyte.attr("array", { default: ['NEW','QUALIFIED','PROPOSAL','IN_PROGRESS','DELIVERED','CLOSED'] }),
			STAGE_LABELS: Lyte.attr("object", {
				default: {
					NEW:'New', QUALIFIED:'Qualified', PROPOSAL:'Proposal',
					IN_PROGRESS:'In Progress', DELIVERED:'Delivered', CLOSED:'Closed'
				}
			})
		};
	},

	didConnect: function () {
		const id = window.location.hash.split('/').pop();
		if (!id || id === "deals") return Lyte.Router.transitionTo("deals");

		this.setData('dealId', id);
		this.setData('canEdit', this.hasPermission('DEAL_UPDATE'));
		this.setData('canDelete', this.hasPermission('DEAL_DELETE'));
		this.setData('canChangeStatus', this.hasPermission('DEAL_CHANGE_STATUS'));
		this.loadDealDetails(id);
	},

	loadDealDetails: function (id) {
		this.setData('isLoading', true);

		this.crmGetDeal(id).then(res => {
			const data = res?.data?.data || res?.data || {};
			const d = data.deal || {};

			const status = String(d.status || "NEW");

			const cleanDeal = {
				id: String(d.id || ""),
				title: d.title || "Untitled Deal",
				amount: this.formatMoney(d.amount),
				status: status,
				owner: d.assignedUserName || "Unassigned",
				date: this.formatJavaDate(d.createdAt),
				cssClass: status.toLowerCase().replace(/_/g, '-')
			};

			const company = data.company || {};
			const contacts = (data.contacts || []).map(c => {
				const name = c?.name || "Unknown";
				return {
					id: String(c?.id || ""),
					name: name,
					job: c?.jobTitle || "N/A",
					initials: name.substring(0,2).toUpperCase()
				};
			});

			const activities = (data.activities || []).map(a => ({
				id: String(a?.id || ""),
				description: a?.description || "No Description",
				status: a?.statusCode || "PENDING",
				date: this.formatJavaDate(a?.dueDate || a?.createdAt)
			}));

			this.setData('deal', cleanDeal);
			this.setData('companyName', String(company?.name || "-"));
			this.setData('companyId', String(company?.id || ""));
			this.setData('contacts', contacts);
			this.setData('activities', activities);
			this.buildPipeline(status);
		})
			.catch(() => this.setData('errorMsg', "Failed to load deal."))
			.finally(() => this.setData('isLoading', false));
	},

	buildPipeline: function (currentStatus) {
		const stages = this.getData('STAGES');
		const labels = this.getData('STAGE_LABELS');
		const canChange = this.getData('canChangeStatus');
		const index = Math.max(0, stages.indexOf(currentStatus));

		const pipeline = stages.map((s, i) => ({
			id: s,
			label: labels[s] || s,
			cssClass: s === currentStatus ? "active" : (i < index ? "completed" : ""),
			isClickable: canChange && s !== currentStatus
		}));

		this.setData('pipelineSteps', pipeline);
	},

	formatMoney: function (amt) {
		return "₹" + Number(amt || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	formatJavaDate: function (d) {
		if (!d || !d.year || !d.monthValue || !d.dayOfMonth) return "";
		const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		return `${m[d.monthValue-1]} ${d.dayOfMonth}, ${d.year}`;
	},

	actions: {
		goBack: function () { Lyte.Router.transitionTo("deals"); },
		editDeal: function () { alert("Edit coming soon"); },
		updateStatus: function (s) {
			const deal = this.getData('deal');
			if (s === deal.status) return;
			this.buildPipeline(s);
			this.crmUpdateDealStatus({ id: this.getData('dealId'), status: s });
		},
		deleteDeal: function () {
			if (confirm("Delete this deal?")) {
				this.crmDeleteDeal(this.getData('dealId')).then(() => this.executeAction('goBack'));
			}
		}
	}

}, { mixins: ["auth-mixin","crm-api-mixin","utils-mixin","api-mixin"] });

Lyte.Router.registerRoute("crm-app.deal-create", {
    model: function() {
        return {};
    },
    renderTemplate: function() {
        return {
            outlet: "#crm_inner_outlet",
            component: "deal-create"
        };
    }
});
Lyte.Component.register("deal-create", {
_template:"<template tag-name=\"deal-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">New Deal</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-container\"> <div class=\"spinner\"></div> <p>Loading configuration...</p> </div> </template><template case=\"false\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Deal Details</h3> <div class=\"form-group\"> <label>Deal Title <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_title\" lyte-model=\"title\" class=\"form-input\" placeholder=\"e.g. Acme Corp Enterprise License\" maxlength=\"150\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Amount ($) <span class=\"required\">*</span></label> <input type=\"number\" id=\"inp_amount\" lyte-model=\"amount\" class=\"form-input\" step=\"0.01\" min=\"0.01\" placeholder=\"0.00\"> </div> <div class=\"form-group half\"> <label>Order Type <span class=\"required\">*</span></label> <select lyte-model=\"orderType\" class=\"form-select\"> <option is=\"for\" lyte-for=\"true\" items=\"{{orderTypes}}\" item=\"type\"></option> </select> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Ownership</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Company <span class=\"required\">*</span></label> <select id=\"sel_company\" lyte-model=\"selectedCompany\" onchange=\"{{action('onCompanySelect',event)}}\" class=\"form-select\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companies}}\" item=\"comp\"></option> </select> </div> <div class=\"form-group half\"> <label>Assigned To <span class=\"required\">*</span></label> <select lyte-model=\"assignedUserId\" class=\"form-select\"> <option is=\"for\" lyte-for=\"true\" items=\"{{users}}\" item=\"u\"></option> </select> </div> </div> <div class=\"form-group\"> <label>Contacts <span class=\"hint-text\">(Select company to view)</span></label> <div class=\"contacts-box\"> <template is=\"if\" value=\"{{expHandlers(selectedCompany,'!')}}\"><template case=\"true\"> <div class=\"empty-msg\">Please select a company first.</div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(filteredContacts.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-msg\">No contacts found.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{filteredContacts}}\" item=\"c\"> <label class=\"contact-row\"> <input type=\"checkbox\" onchange=\"{{action('toggleContact',c.id,event)}}\"> <div class=\"contact-text\"> <div class=\"c-name\">{{c.name}}</div> <div class=\"c-job\">{{c.jobTitle}}</div> </div> </label> </template> </template></template> </template></template> </div> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createDeal')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Create Deal</template></template> </button> </div> </form> </div> </template></template> </div> </template>\n<style>.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    overflow-y: auto;\n}\n\n.form-card {\n    background: white;\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 30px;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n}\n\n.form-section { margin-bottom: 30px; }\n.section-title {\n    font-size: 12px; font-weight: bold; text-transform: uppercase;\n    color: #94a3b8; border-bottom: 1px solid #e2e8f0;\n    padding-bottom: 8px; margin-bottom: 15px;\n}\n\n.form-row { display: flex; gap: 20px; }\n.half { flex: 1; }\n\n.form-group { margin-bottom: 15px; }\n.form-group label {\n    display: block; font-size: 14px; font-weight: 500;\n    color: #334155; margin-bottom: 5px;\n}\n.required { color: #ef4444; }\n.hint-text { font-weight: normal; font-size: 12px; color: #94a3b8; margin-left: 5px; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px; border: 1px solid #cbd5e1;\n    border-radius: 6px; font-size: 14px; box-sizing: border-box; /* Fix width issues */\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; }\n\n/* CONTACTS BOX */\n.contacts-box {\n    border: 1px solid #cbd5e1; border-radius: 6px;\n    background: #f8fafc;\n    height: 200px; overflow-y: auto;\n}\n.empty-msg {\n    padding: 20px; text-align: center; color: #94a3b8; font-size: 13px;\n    display: flex; align-items: center; justify-content: center; height: 100%;\n}\n\n.contact-row {\n    display: flex; align-items: center; gap: 10px;\n    padding: 10px 15px; border-bottom: 1px solid #e2e8f0;\n    cursor: pointer; background: white;\n}\n.contact-row:hover { background: #f1f5f9; }\n.contact-row input { cursor: pointer; }\n\n.c-name { font-size: 14px; font-weight: 500; color: #1e293b; }\n.c-job { font-size: 12px; color: #64748b; }\n\n/* ACTIONS */\n.form-actions {\n    display: flex; justify-content: flex-end; gap: 10px;\n    padding-top: 20px; border-top: 1px solid #e2e8f0;\n}\n.btn-primary, .btn-secondary {\n    padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 14px;\n}\n.btn-primary { background: #2563eb; color: white; border: none; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; }\n.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,5,3,3,1]},{"type":"for","position":[1,1,1,5,3,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{orderTypes}}\" item=\"type\"> <option value=\"{{type}}\">{{type}}</option> </template>"},{"type":"attr","position":[1,1,3,3,1,3]},{"type":"attr","position":[1,1,3,3,1,3,3]},{"type":"for","position":[1,1,3,3,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companies}}\" item=\"comp\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"attr","position":[1,1,3,3,3,3,1]},{"type":"for","position":[1,1,3,3,3,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]},{"type":"text","position":[1,2]}],"actualTemplate":"<template is=\"for\" items=\"{{users}}\" item=\"u\"> <option value=\"{{u.id}}\">{{u.fullName}} ({{u.roleName}})</option> </template>"},{"type":"attr","position":[1,1,3,5,3,1]},{"type":"if","position":[1,1,3,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,1,5,3]},{"type":"attr","position":[1,1,5,3,1]},{"type":"if","position":[1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companies","users","orderTypes","allContacts","filteredContacts","selectedContactIds","title","amount","orderType","selectedCompany","assignedUserId","isLoading","isSaving"],

	// ... (keep data and didConnect the same) ...
	data: function() {
		return {
			companies: Lyte.attr("array", { default: [] }),
			users: Lyte.attr("array", { default: [] }),
			orderTypes: Lyte.attr("array", { default: [] }),
			allContacts: Lyte.attr("array", { default: [] }),
			filteredContacts: Lyte.attr("array", { default: [] }),
			selectedContactIds: Lyte.attr("array", { default: [] }),

			title: Lyte.attr("string", { default: "" }),
			amount: Lyte.attr("string", { default: "" }),
			orderType: Lyte.attr("string", { default: "STANDARD" }),
			selectedCompany: Lyte.attr("string", { default: "" }),
			assignedUserId: Lyte.attr("string", { default: "" }),

			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('DEAL_CREATE')) {
			alert("Permission denied");
			window.location.hash = "#/deals";
			return;
		}
		this.loadInitialData();
	},

	loadInitialData: function() {
		this.setData('isLoading', true);
		Promise.all([
			this.crmAddDeal(),
			this.crmGetContacts({})
		]).then((responses) => {
			const [metaRes, contactRes] = responses;
			if (metaRes.success && metaRes.data) {
				this.setData('companies', metaRes.data.companies || []);
				this.setData('users', metaRes.data.users || []);
				this.setData('orderTypes', metaRes.data.orderTypes || []);
				const currentUser = this.getAuthUser();
				if (currentUser && currentUser.userId) {
					this.setData('assignedUserId', currentUser.userId);
				}
			}
			let contacts = [];
			if (contactRes && contactRes.data && Array.isArray(contactRes.data.data)) {
				contacts = contactRes.data.data;
			} else if (contactRes && Array.isArray(contactRes.data)) {
				contacts = contactRes.data;
			}
			this.setData('allContacts', contacts);
		}).catch(err => {
			console.error(err);
			alert("Error loading form data");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	actions: {
		onCompanySelect: function(event) {
			const element = event.target;
			const compId = element.value;

			this.setData('selectedCompany', compId);
			this.setData('selectedContactIds', []); // Reset contacts

			if (!compId) {
				this.setData('filteredContacts', []);
				return;
			}

			const all = this.getData('allContacts');
			const relevant = all.filter(c => String(c.companyId) === String(compId));
			this.setData('filteredContacts', relevant);
		},

		toggleContact: function(contactId, event) {
			let selected = this.getData('selectedContactIds') || [];
			if (event.target.checked) {
				selected.push(contactId);
			} else {
				selected = selected.filter(id => id !== contactId);
			}
			this.setData('selectedContactIds', selected);
		},

		createDeal: function() {
			// 1. Get Elements
			const titleInput = document.getElementById('inp_title');
			const amountInput = document.getElementById('inp_amount');
			const companySelect = document.getElementById('sel_company'); // FIX: Get Select Element

			// 2. Read Values Directly
			const rawTitle = titleInput ? titleInput.value : "";
			const rawAmount = amountInput ? amountInput.value : "";
			const rawCompId = companySelect ? companySelect.value : ""; // FIX: Read Value

			console.log("DOM Read - Title:", rawTitle, "Amount:", rawAmount, "Company:", rawCompId);

			// 3. Validation
			if (!rawTitle || rawTitle.trim() === "") {
				alert("Please enter a Deal Title");
				return;
			}

			const amountVal = parseFloat(rawAmount);
			if (isNaN(amountVal) || amountVal <= 0) {
				alert("Please enter a valid Amount");
				return;
			}

			// Check if Company ID exists
			if (!rawCompId || rawCompId === "") {
				alert("Please select a Company");
				return;
			}

			this.setData('isSaving', true);

			// 4. Payload
			const payload = {
				title: rawTitle.trim(),
				amount: Number(amountVal),
				orderType: this.getData('orderType'),
				companyId: Number(rawCompId),
				assignedUserId: Number(this.getData('assignedUserId')),
				contactIds: this.getData('selectedContactIds')
			};


			this.crmSaveDeal(payload)
				.then((res) => {
					if (res.success) {
						alert("Deal created successfully!");
						window.location.hash = "#/deals";
					} else {
						throw new Error(res.message || "Creation failed");
					}
				})
				.catch((err) => {
					alert("Error: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/deals";
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("activity-list", {
_template:"<template tag-name=\"activity-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Activities</h1> <template is=\"if\" value=\"{{canCreate}}\"><template case=\"true\"> <button onclick=\"{{action('createActivity')}}\" class=\"add-btn\"> <span>+ New Activity</span> </button> </template></template> </header> <div class=\"filter-bar\"> <div class=\"status-tabs\"> <button class=\"status-tab {{expHandlers(expHandlers(currentStatusFilter,'==','all'),'?:','active','')}}\" onclick=\"{{action('filterStatus','all')}}\"> All <span class=\"count\">{{counts.all}}</span> </button> <button class=\"status-tab {{expHandlers(expHandlers(currentStatusFilter,'==','pending'),'?:','active','')}}\" onclick=\"{{action('filterStatus','pending')}}\"> Pending <span class=\"count\">{{counts.pending}}</span> </button> <button class=\"status-tab {{expHandlers(expHandlers(currentStatusFilter,'==','overdue'),'?:','active','')}}\" onclick=\"{{action('filterStatus','overdue')}}\"> Overdue <span class=\"count\">{{counts.overdue}}</span> </button> <button class=\"status-tab {{expHandlers(expHandlers(currentStatusFilter,'==','completed'),'?:','active','')}}\" onclick=\"{{action('filterStatus','completed')}}\"> Completed <span class=\"count\">{{counts.completed}}</span> </button> </div> <div class=\"type-filters\"> <template is=\"for\" items=\"{{ACTIVITY_TYPES}}\" item=\"type\" index=\"k\"> <button class=\"type-btn {{expHandlers(expHandlers(currentTypeFilter,'==',type),'?:','active','')}}\" onclick=\"{{action('filterType',type)}}\" title=\"{{type}}\"> <span class=\"type-icon {{type}}\"></span> </button> </template> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading activities...</p> </div> </template><template case=\"false\"> <div class=\"activities-card\"> <template is=\"if\" value=\"{{expHandlers(groupedActivities.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No activities found matching your filters.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{groupedActivities}}\" item=\"group\" index=\"i\"> <div class=\"group-section\"> <div class=\"group-header\">{{group.title}} ({{group.count}})</div> <template is=\"for\" items=\"{{group.items}}\" item=\"act\" index=\"j\"> <div class=\"activity-row {{expHandlers(act.isOverdue,'?:','overdue','')}}\" onclick=\"{{action('viewActivity',act.id)}}\"> <div class=\"row-icon-box {{act.type}}\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline></svg> </div> <div class=\"row-content\"> <div class=\"row-header\"> <span class=\"type-label\">{{act.type}}</span> <span class=\"status-badge\" style=\"color: {{act.statusColor}}\">{{act.statusCode}}</span> </div> <div class=\"row-desc\">{{act.description}}</div> <div class=\"row-meta\"> <span class=\"{{expHandlers(act.isOverdue,'?:','text-danger','')}}\">{{act.formattedDate}}</span> <template is=\"if\" value=\"{{act.dealTitle}}\"><template case=\"true\"> <span class=\"dot\">•</span> <span class=\"deal-link\">{{act.dealTitle}}</span> </template></template> </div> </div> <div class=\"row-action\">›</div> </div> </template> </div> </template> </template></template> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden; /* FIX: Stop the whole page from scrolling */\n}\n\n/* HEADER */\n.page-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 20px;\n    flex-shrink: 0; /* Prevent header from squishing */\n}\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n/* FILTERS */\n.filter-bar {\n    display: flex;\n    flex-wrap: wrap;\n    gap: 15px;\n    margin-bottom: 20px;\n    flex-shrink: 0; /* Prevent filters from squishing */\n}\n/* ... (Keep existing status-tabs and type-filters styles) ... */\n.status-tabs { display: flex; gap: 10px; }\n.status-tab {\n    padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0;\n    background: white; color: #64748b; font-size: 13px; font-weight: 500; cursor: pointer;\n}\n.status-tab.active { background: #2563eb; color: white; border-color: #2563eb; }\n.count { background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 5px; }\n\n.type-filters { margin-left: auto; display: flex; gap: 5px; }\n.type-btn {\n    width: 32px; height: 32px; border: 1px solid #e2e8f0; background: white;\n    border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;\n}\n.type-btn.active { background: #cbd5e1; border-color: #94a3b8; }\n.type-icon { width: 12px; height: 12px; background: #64748b; border-radius: 50%; }\n\n/* LIST CARD - SCROLL FIX IS HERE */\n.activities-card {\n    background: white;\n    border-radius: 8px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n\n    /* FIX: Make this element fill space and scroll */\n    flex-grow: 1;\n    overflow-y: auto;\n    min-height: 0; /* Crucial for flex child scrolling */\n\n    display: flex;\n    flex-direction: column;\n}\n\n/* ... (Keep existing row styles) ... */\n.group-header {\n    background: #f8fafc; padding: 10px 20px; border-bottom: 1px solid #f1f5f9;\n    font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;\n    position: sticky; top: 0; z-index: 1; /* Bonus: Sticky Group Headers */\n}\n\n.activity-row {\n    display: flex; gap: 15px; padding: 15px 20px;\n    border-bottom: 1px solid #f1f5f9; cursor: pointer;\n}\n.activity-row:hover { background: #fdfdfd; }\n.activity-row.overdue { border-left: 3px solid #ef4444; }\n\n.row-icon-box {\n    width: 40px; height: 40px; border-radius: 8px;\n    display: flex; align-items: center; justify-content: center;\n    color: white; flex-shrink: 0;\n}\n.row-icon-box.TASK { background: #3b82f6; }\n.row-icon-box.CALL { background: #10b981; }\n.row-icon-box.MEETING { background: #8b5cf6; }\n.row-icon-box.EMAIL { background: #f59e0b; }\n.row-icon-box.LETTER { background: #64748b; }\n.row-icon-box.SOCIAL_MEDIA { background: #ec4899; }\n\n.row-content { flex-grow: 1; }\n.row-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }\n.type-label { font-size: 11px; font-weight: bold; color: #64748b; }\n.status-badge { font-size: 11px; font-weight: bold; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }\n\n.row-desc { font-size: 14px; font-weight: 500; color: #1e293b; margin-bottom: 4px; }\n.row-meta { font-size: 12px; color: #94a3b8; }\n.text-danger { color: #ef4444; font-weight: 500; }\n.row-action { color: #cbd5e1; font-weight: bold; }\n\n.loading-state, .empty-state { padding: 40px; text-align: center; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,1,1]},{"type":"text","position":[1,3,1,1,1,0]},{"type":"attr","position":[1,3,1,3]},{"type":"text","position":[1,3,1,3,1,0]},{"type":"attr","position":[1,3,1,5]},{"type":"text","position":[1,3,1,5,1,0]},{"type":"attr","position":[1,3,1,7]},{"type":"text","position":[1,3,1,7,1,0]},{"type":"attr","position":[1,3,3,1]},{"type":"for","position":[1,3,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1]}]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,1,0]},{"type":"text","position":[1,1,2]},{"type":"attr","position":[1,3]},{"type":"for","position":[1,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1]},{"type":"text","position":[1,3,1,1,0]},{"type":"attr","position":[1,3,1,3],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'color: '","act.statusColor"]}}}},{"type":"text","position":[1,3,1,3,0]},{"type":"text","position":[1,3,3,0]},{"type":"attr","position":[1,3,5,1]},{"type":"text","position":[1,3,5,1,0]},{"type":"attr","position":[1,3,5,3]},{"type":"if","position":[1,3,5,3],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[3,0]}]}},"default":{}}]}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["allActivities","groupedActivities","groupOrder","currentStatusFilter","currentTypeFilter","counts","isLoading","canCreate","ACTIVITY_TYPES","TERMINAL_STATUSES"],

	data: function() {
		return {
			// Data
			allActivities: Lyte.attr("array", { default: [] }),
			// FIX 1: Change to array so .length check works in template
			groupedActivities: Lyte.attr("array", { default: [] }),
			groupOrder: Lyte.attr("array", { default: [] }),

			// Filters
			currentStatusFilter: Lyte.attr("string", { default: "all" }),
			currentTypeFilter: Lyte.attr("string", { default: null }),

			// Counts
			counts: Lyte.attr("object", {
				default: { all: 0, pending: 0, overdue: 0, completed: 0 }
			}),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			canCreate: Lyte.attr("boolean", { default: false }),

			// Constants
			ACTIVITY_TYPES: Lyte.attr("array", {
				default: ['TASK', 'CALL', 'MEETING', 'EMAIL', 'LETTER', 'SOCIAL_MEDIA']
			}),
			TERMINAL_STATUSES: Lyte.attr("object", {
				default: {
					TASK: ['DONE'],
					CALL: ['COMPLETED', 'MISSED'],
					MEETING: ['HELD', 'CANCELLED'],
					EMAIL: ['SENT', 'FAILED'],
					LETTER: ['SENT', 'CANCELLED'],
					SOCIAL_MEDIA: ['POSTED']
				}
			})
		}
	},

	didConnect: function() {
		this.setData('canCreate', this.hasPermission('ACTIVITY_CREATE'));
		this.loadActivities();
	},

	loadActivities: function() {
		this.setData('isLoading', true);

		this.crmGetActivities()
			.then((res) => {
				let rawList = [];

				// 1. EXTRACTION (Matches your API: { data: [...] })
				if (res && Array.isArray(res.data)) {
					rawList = res.data;
				} else if (Array.isArray(res)) {
					rawList = res;
				} else if (res && res.data && Array.isArray(res.data.data)) {
					rawList = res.data.data;
				}

				// 2. NORMALIZE
				const cleanList = rawList.map(a => {
					let type = a.type || 'TASK';
					let status = a.statusCode || 'PENDING';
					// Handles your API where date is an object inside 'dueDate' or 'createdAt'
					let targetDate = a.dueDate || a.createdAt;

					return {
						id: a.id,
						description: a.description || "No description",
						type: type,
						statusCode: status,
						dealTitle: a.dealTitle, // API has this field

						// Helper booleans
						isCompleted: this.checkIfCompleted(type, status),
						isOverdue: this.checkIfOverdue(targetDate, type, status),

						// Formatted Strings
						formattedDate: this.formatJavaDate(targetDate),
						relativeLabel: this.getRelativeDateLabel(targetDate),

						// UI Helpers
						iconClass: type.toLowerCase(),
						statusColor: this.getStatusColor(status)
					};
				});

				this.setData('allActivities', cleanList);
				this.updateCounts();
				this.applyFilters();
			})
			.catch(err => {
				console.error("Activity load error", err);
				this.setData('allActivities', []); // Ensure empty state on error
				this.applyFilters();
			})
			.finally(() => this.setData('isLoading', false));
	},

	// ... (Your Filter/Group Logic is Correct) ...

	applyFilters: function() {
		const all = this.getData('allActivities');
		const statusFilter = this.getData('currentStatusFilter');
		const typeFilter = this.getData('currentTypeFilter');

		let filtered = all.filter(a => {
			if (typeFilter && a.type !== typeFilter) return false;

			if (statusFilter === 'pending') return !a.isCompleted && !a.isOverdue;
			if (statusFilter === 'overdue') return a.isOverdue;
			if (statusFilter === 'completed') return a.isCompleted;

			return true;
		});

		this.groupByDate(filtered);
	},

	groupByDate: function(list) {
		const groups = { 'Overdue': [], 'Today': [], 'Tomorrow': [], 'This Week': [], 'Later': [], 'Completed': [] };

		list.forEach(a => {
			if (a.isCompleted) {
				groups['Completed'].push(a);
			} else if (a.isOverdue) {
				groups['Overdue'].push(a);
			} else {
				const label = a.relativeLabel || 'Later';
				if (groups[label]) groups[label].push(a);
				else groups['Later'].push(a);
			}
		});

		let finalGroups = [];
		let order = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'Later', 'Completed'];

		order.forEach(key => {
			if (groups[key].length > 0) {
				finalGroups.push({
					title: key,
					count: groups[key].length,
					items: groups[key]
				});
			}
		});

		this.setData('groupedActivities', finalGroups);
	},

	updateCounts: function() {
		const all = this.getData('allActivities');
		const typeFilter = this.getData('currentTypeFilter');

		const base = typeFilter ? all.filter(a => a.type === typeFilter) : all;

		const overdue = base.filter(a => a.isOverdue).length;
		const completed = base.filter(a => a.isCompleted).length;
		const total = base.length;
		const pending = total - overdue - completed;

		this.setData('counts', { all: total, pending: pending, overdue: overdue, completed: completed });
	},

	// --- HELPER LOGIC (Correct) ---
	checkIfCompleted: function(type, status) {
		const terminals = this.getData('TERMINAL_STATUSES');
		const doneStates = terminals[type] || [];
		return doneStates.includes(status);
	},

	checkIfOverdue: function(dateObj, type, status) {
		if (this.checkIfCompleted(type, status)) return false;
		if (!dateObj || !dateObj.year) return false;

		const d = new Date(dateObj.year, dateObj.monthValue - 1, dateObj.dayOfMonth);
		const today = new Date();
		today.setHours(0,0,0,0);

		return d < today;
	},

	getRelativeDateLabel: function(dateObj) {
		if (!dateObj || !dateObj.year) return 'Later';

		const d = new Date(dateObj.year, dateObj.monthValue - 1, dateObj.dayOfMonth);
		const today = new Date();
		today.setHours(0,0,0,0);

		const diffTime = d - today;
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Tomorrow';
		if (diffDays > 1 && diffDays <= 7) return 'This Week';

		return 'Later';
	},

	formatJavaDate: function(dateObj) {
		if (!dateObj || !dateObj.year) return "";
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let mStr = shortMonths[dateObj.monthValue - 1] || "";
		return mStr + " " + dateObj.dayOfMonth + ", " + dateObj.year;
	},

	getStatusColor: function(status) {
		if (['DONE', 'COMPLETED', 'HELD', 'SENT', 'POSTED'].includes(status)) return '#10b981';
		if (['MISSED', 'CANCELLED', 'FAILED'].includes(status)) return '#ef4444';
		return '#64748b';
	},

	actions: {
		filterStatus: function(status) {
			this.setData('currentStatusFilter', status);
			this.applyFilters();
		},
		filterType: function(type) {
			let current = this.getData('currentTypeFilter');
			let newFilter = (current === type) ? null : type;
			this.setData('currentTypeFilter', newFilter);
			this.applyFilters();
			this.updateCounts();
		},
		createActivity: function() { window.location.hash = "#/activities/create"; },
		viewActivity: function(id) { window.location.hash = "#/activities/" + id; }
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Router.registerRoute("crm-app.activity-list", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "activity-list"};
    }
});
Lyte.Component.register("company-list", {
_template:"<template tag-name=\"company-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Companies</h1> <template is=\"if\" value=\"{{canCreate}}\"><template case=\"true\"> <button onclick=\"{{action('createCompany')}}\" class=\"add-btn\"> <span>+ Add Company</span> </button> </template></template> </header> <div class=\"controls-bar\"> <div class=\"search-wrapper full-width\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearchInput')}}\" placeholder=\"Search companies...\" class=\"search-input\"> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading companies...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(companyList.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\"> <div class=\"empty-icon\">🏢</div> <h3>No companies found</h3> <p>Create your first company to get started</p> </div> </template><template case=\"false\"> <div class=\"companies-grid\"> <template is=\"for\" items=\"{{companyList}}\" item=\"comp\"> <div class=\"company-card\" onclick=\"{{action('viewCompany',comp.id)}}\"> <div class=\"company-avatar\" style=\"background-color: {{comp.avatarColor}}\"> {{comp.initials}} </div> <div class=\"company-info\"> <div class=\"company-name\">{{comp.name}}</div> <div class=\"company-meta\"> <template is=\"if\" value=\"{{comp.email}}\"><template case=\"true\"> <div class=\"meta-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg> <span>{{comp.email}}</span> </div> </template></template> <template is=\"if\" value=\"{{comp.phone}}\"><template case=\"true\"> <div class=\"meta-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path></svg> <span>{{comp.phone}}</span> </div> </template></template> <template is=\"if\" value=\"{{comp.industry}}\"><template case=\"true\"> <div class=\"meta-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 21h18\"></path><path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16\"></path></svg> <span>{{comp.industry}}</span> </div> </template></template> </div> </div> </div> </template> </div> </template></template> </template></template> </div> </template><style>/* 1. LOCK THE PAGE CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh; /* Force full viewport height */\n    display: flex;\n    flex-direction: column;\n    overflow: hidden; /* Stop main page scroll */\n}\n\n/* 2. PREVENT HEADER SHRINKING */\n.page-header {\n    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;\n    flex-shrink: 0;\n}\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n.controls-bar {\n    margin-bottom: 25px;\n    flex-shrink: 0;\n}\n.search-wrapper {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 10px 12px; display: flex; align-items: center;\n}\n.search-input { border: none; outline: none; width: 100%; font-size: 14px; margin-left: 8px; }\n\n/* 3. MAKE THE GRID SCROLLABLE */\n.companies-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));\n    gap: 20px;\n\n    /* SCROLL PROPERTIES */\n    flex-grow: 1;         /* Fill remaining space */\n    overflow-y: auto;     /* Scroll internally */\n    min-height: 0;        /* Flexbox fix */\n    padding-bottom: 20px; /* Padding for bottom of scroll */\n    align-content: start; /* Keep items at top even if few */\n}\n\n/* 4. CENTER LOADING/EMPTY STATES */\n.loading-state, .empty-state {\n    flex-grow: 1; /* Fill space */\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    color: #94a3b8;\n    text-align: center;\n}\n.empty-icon { font-size: 40px; margin-bottom: 10px; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }\n\n\n/* CARD STYLES (Unchanged) */\n.company-card {\n    background: white;\n    border-radius: 8px;\n    padding: 20px;\n    display: flex;\n    gap: 15px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n    border: 1px solid #e2e8f0;\n    cursor: pointer;\n    transition: transform 0.1s, box-shadow 0.1s;\n    height: fit-content; /* Don't stretch vertically in grid */\n}\n\n.company-card:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n    border-color: #cbd5e1;\n}\n\n.company-avatar {\n    width: 48px; height: 48px; border-radius: 8px;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-weight: bold; font-size: 18px;\n    flex-shrink: 0;\n}\n\n.company-info { flex: 1; min-width: 0; }\n.company-name { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }\n\n.company-meta { display: flex; flex-direction: column; gap: 5px; }\n.meta-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; }\n.meta-item svg { color: #94a3b8; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,1,3]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","comp.avatarColor"]}}}},{"type":"text","position":[1,1,1]},{"type":"text","position":[1,3,1,0]},{"type":"attr","position":[1,3,3,1]},{"type":"if","position":[1,3,3,1],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,3,0]}]}},"default":{}},{"type":"attr","position":[1,3,3,3]},{"type":"if","position":[1,3,3,3],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,3,0]}]}},"default":{}},{"type":"attr","position":[1,3,3,5]},{"type":"if","position":[1,3,3,5],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,3,0]}]}},"default":{}}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companyList","searchTerm","isLoading","canCreate","searchTimer"],

	data: function() {
		return {
			companyList: Lyte.attr("array", { default: [] }),
			searchTerm: Lyte.attr("string", { default: "" }),

			isLoading: Lyte.attr("boolean", { default: true }),
			canCreate: Lyte.attr("boolean", { default: false }),

			// Search Debounce Timer
			searchTimer: Lyte.attr("number", { default: null })
		}
	},

	didConnect: function() {
		this.setData('canCreate', this.hasPermission('COMPANY_CREATE'));
		this.loadCompanies();
	},

	loadCompanies: function() {
		this.setData('isLoading', true);

		// Prepare Params
		let term = this.getData('searchTerm');
		let params = {};
		if (term) {
			params.keyword = term;
		}

		this.crmGetCompanies(params)
			.then((res) => {
				let rawData = [];

				// Robust Extraction
				if (res && Array.isArray(res.data)) {
					rawData = res.data;
				} else if (Array.isArray(res)) {
					rawData = res;
				} else if (res && res.data && Array.isArray(res.data.data)) {
					rawData = res.data.data;
				}

				// Normalize for UI (Add Avatar props)
				let cleanList = rawData.map(c => ({
					id: c.id,
					name: c.name,
					email: c.email,
					phone: c.phone,
					industry: c.industry,
					// Pre-calculate visuals
					initials: this.getInitials(c.name),
					avatarColor: this.getAvatarColor(c.name)
				}));

				this.setData('companyList', cleanList);
			})
			.catch(err => {
				console.error("Error loading companies", err);
				this.setData('companyList', []);
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- HELPERS (Ported from your Utils) ---
	getInitials: function(name) {
		if (!name) return "";
		return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	},

	getAvatarColor: function(name) {
		if (!name) return '#cbd5e1';
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	},

	actions: {
		// Debounced Search Action
		onSearchInput: function() {
			// Clear existing timer
			let timer = this.getData('searchTimer');
			if (timer) clearTimeout(timer);

			// Set new timer
			let newTimer = setTimeout(() => {
				this.loadCompanies();
			}, 300); // 300ms delay

			this.setData('searchTimer', newTimer);
		},

		createCompany: function() {
			window.location.hash = "#/companies/create";
		},

		viewCompany: function(id) {
			window.location.hash = "#/companies/" + id;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Router.registerRoute("crm-app.company-list", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "company-list"
        };
    }
});
Lyte.Component.register("user-list", {
_template:"<template tag-name=\"user-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Users</h1> <template is=\"if\" value=\"{{canManage}}\"><template case=\"true\"> <button onclick=\"{{action('createUser')}}\" class=\"add-btn\"> <span>+ Add User</span> </button> </template></template> </header> <div class=\"controls-bar\"> <div class=\"search-wrapper full-width\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearchInput')}}\" placeholder=\"Search users...\" class=\"search-input\"> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading users...</p> </div> </template><template case=\"false\"> <div class=\"users-list-container\"> <template is=\"if\" value=\"{{expHandlers(groupedUsers.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No users found.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{groupedUsers}}\" item=\"group\" index=\"i\"> <div class=\"role-section\"> <div class=\"role-header\"> <div class=\"role-title\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> {{group.roleName}} </div> <span class=\"role-count\">{{group.count}} user(s)</span> </div> <div class=\"role-users\"> <template is=\"for\" items=\"{{group.users}}\" item=\"u\" index=\"j\"> <div class=\"user-card {{expHandlers(u.active,'?:','','user-inactive')}}\"> <div class=\"user-avatar\" style=\"background-color: {{u.avatarColor}}\"> {{u.initials}} </div> <div class=\"user-info\"> <div class=\"user-name-row\"> <span class=\"u-name\">{{u.fullName}}</span> <template is=\"if\" value=\"{{u.active}}\"><template case=\"true\"> <span class=\"badge badge-success\">Active</span> </template><template case=\"false\"> <span class=\"badge badge-danger\">Inactive</span> </template></template> </div> <div class=\"user-meta\"> <span class=\"meta-item\"> <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94\"></path></svg> {{u.username}} </span> <span class=\"meta-item\"> <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg> {{u.email}} </span> </div> </div> <template is=\"if\" value=\"{{u.profileName}}\"><template case=\"true\"> <div class=\"user-badges\"> <span class=\"badge badge-profile\">{{u.profileName}}</span> </div> </template></template> <div class=\"user-actions\"> <button onclick=\"{{action('viewUser',u.id)}}\" class=\"btn-icon-sm\" title=\"View\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg> </button> <button onclick=\"{{action('deleteUser',u.id,u.fullName)}}\" class=\"btn-icon-sm text-danger\" title=\"Delete\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg> </button> </div> </div> </template> </div> </div> </template> </template></template> </div> </template></template> </div> </template><style>/* 1. LAYOUT & SCROLLING */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n}\n\n.page-header, .controls-bar {\n    flex-shrink: 0;\n}\n.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n.controls-bar { margin-bottom: 25px; }\n.search-wrapper {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 10px 12px; display: flex; align-items: center;\n}\n.search-input { border: none; outline: none; width: 100%; font-size: 14px; margin-left: 8px; }\n\n/* 2. MAIN LIST SCROLL */\n.users-list-container {\n    flex-grow: 1;\n    overflow-y: auto;\n    min-height: 0;\n    padding-bottom: 20px;\n}\n\n/* 3. ROLES & CARDS */\n.role-section { margin-bottom: 20px; }\n\n.role-header {\n    display: flex; align-items: center; justify-content: space-between;\n    padding: 10px 15px; background-color: #f1f5f9;\n    border-radius: 8px 8px 0 0; border: 1px solid #e2e8f0; border-bottom: none;\n}\n.role-title { font-size: 13px; font-weight: 600; color: #334155; display: flex; gap: 8px; align-items: center; }\n.role-count { font-size: 11px; background: white; padding: 2px 8px; border-radius: 10px; color: #64748b; }\n\n.role-users {\n    border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;\n    background: white;\n}\n\n.user-card {\n    display: flex; align-items: center; gap: 15px;\n    padding: 15px; border-bottom: 1px solid #f1f5f9;\n}\n.user-card:last-child { border-bottom: none; }\n.user-card:hover { background-color: #f8fafc; }\n.user-inactive { background-color: #f9fafb; opacity: 0.8; }\n\n/* 4. USER DETAILS */\n.user-avatar {\n    width: 42px; height: 42px; border-radius: 50%;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-weight: 600; font-size: 14px; flex-shrink: 0;\n}\n.user-info { flex: 1; min-width: 0; }\n.user-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }\n.u-name { font-weight: 600; color: #1e293b; font-size: 14px; }\n\n.user-meta { display: flex; gap: 15px; font-size: 12px; color: #64748b; }\n.meta-item { display: flex; align-items: center; gap: 4px; }\n\n/* 5. BADGES & ACTIONS */\n.badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }\n.badge-success { background: #dcfce7; color: #166534; }\n.badge-danger { background: #fee2e2; color: #991b1b; }\n.badge-profile { background: #e0e7ff; color: #4338ca; }\n\n.user-actions { display: flex; gap: 5px; }\n.btn-icon-sm {\n    background: transparent; border: 1px solid transparent;\n    width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;\n    border-radius: 4px; cursor: pointer; color: #64748b;\n}\n.btn-icon-sm:hover { background: #f1f5f9; color: #1e293b; }\n.btn-icon-sm.text-danger:hover { background: #fee2e2; color: #ef4444; }\n\n.loading-state, .empty-state { text-align: center; color: #94a3b8; padding: 40px; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,1,3]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,1,1,3]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3,1]},{"type":"for","position":[1,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","u.avatarColor"]}}}},{"type":"text","position":[1,1,1]},{"type":"text","position":[1,3,1,1,0]},{"type":"attr","position":[1,3,1,3]},{"type":"if","position":[1,3,1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,3,3,1,3]},{"type":"text","position":[1,3,3,3,3]},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1,0]}]}},"default":{}},{"type":"attr","position":[1,7,1]},{"type":"attr","position":[1,7,3]}]}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["allUsers","groupedUsers","searchTerm","isLoading","canManage"],

	data: function() {
		return {
			// Data
			allUsers: Lyte.attr("array", { default: [] }),
			groupedUsers: Lyte.attr("array", { default: [] }), // The render target

			// Search
			searchTerm: Lyte.attr("string", { default: "" }),

			// State
			isLoading: Lyte.attr("boolean", { default: true }),
			canManage: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		// Permission Check
		if (!this.hasPermission('USER_MANAGE')) {
			alert("You do not have permission to access this page");
			window.location.hash = "#/dashboard"; // Redirect
			return;
		}

		this.setData('canManage', true);
		this.loadUsers();
	},

	loadUsers: function() {
		this.setData('isLoading', true);

		this.crmGetUsers()
			.then((res) => {
				let rawList = [];
				// 1. ROBUST EXTRACTION
				if (Array.isArray(res)) { rawList = res; }
				else if (res && Array.isArray(res.data)) { rawList = res.data; }
				else if (res && res.data && Array.isArray(res.data.data)) { rawList = res.data.data; }

				// 2. NORMALIZE
				const cleanList = rawList.map(u => {
					let name = u.fullName || u.username || "Unknown";
					return {
						id: u.id,
						fullName: name,
						username: u.username || "",
						email: u.email || "",
						roleName: u.roleName || "No Role",
						profileName: u.profileName || "", // e.g. "Standard Profile"
						active: !!u.active, // Force boolean

						// Pre-calculate Visuals
						initials: this.getInitials(name),
						avatarColor: this.getAvatarColor(name)
					};
				});

				this.setData('allUsers', cleanList);
				this.groupUsers(); // Initial Grouping
			})
			.catch(err => {
				console.error("User load error", err);
				this.setData('allUsers', []);
				this.groupUsers();
			})
			.finally(() => this.setData('isLoading', false));
	},

	// --- GROUPING & FILTERING ---

	groupUsers: function() {
		const all = this.getData('allUsers');
		const term = (this.getData('searchTerm') || "").toLowerCase().trim();

		// 1. Filter First
		let filtered = all;
		if (term) {
			filtered = all.filter(u =>
				u.fullName.toLowerCase().includes(term) ||
				u.username.toLowerCase().includes(term) ||
				u.email.toLowerCase().includes(term) ||
				u.roleName.toLowerCase().includes(term)
			);
		}

		// 2. Group by Role
		const groups = {};
		filtered.forEach(u => {
			const role = u.roleName;
			if (!groups[role]) groups[role] = [];
			groups[role].push(u);
		});

		// 3. Convert to Array for Template
		let finalGroups = [];
		// Optional: Sort roles alphabetically or specific order
		Object.keys(groups).sort().forEach(role => {
			finalGroups.push({
				roleName: role,
				count: groups[role].length,
				users: groups[role]
			});
		});

		this.setData('groupedUsers', finalGroups);
	},

	// --- HELPERS ---
	getInitials: function(name) {
		if (!name) return "";
		return String(name).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	},

	getAvatarColor: function(name) {
		if (!name) return '#cbd5e1';
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	},

	actions: {
		onSearchInput: function() {
			// Debounce or immediate? Immediate is fine for local lists
			this.groupUsers();
		},

		createUser: function() {
			window.location.hash = "#/users/create";
		},

		viewUser: function(id) {
			window.location.hash = "#/users/" + id;
		},

		deleteUser: function(id, name) {
			// Use browser confirm or custom modal
			if (confirm("Are you sure you want to delete " + name + "? This cannot be undone.")) {
				this.crmDeleteUser(id).then((res) => {
					if (res.success) {
						alert("User deleted");
						this.loadUsers(); // Refresh list
					} else {
						alert(res.message || "Failed to delete user");
					}
				});
			}
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Router.registerRoute("crm-app.user-list", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "user-list"
        };
    }
});
Lyte.Router.registerRoute("crm-app.profile-list", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "profile-list"
        };
    }
});
Lyte.Component.register("profile-list", {
_template:"<template tag-name=\"profile-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Profiles</h1> <template is=\"if\" value=\"{{canManage}}\"><template case=\"true\"> <button onclick=\"{{action('createProfile')}}\" class=\"add-btn\"> <span>+ Create Profile</span> </button> </template></template> </header> <div class=\"info-banner\"> <div class=\"banner-icon\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg> </div> <div class=\"banner-content\"> <p class=\"banner-title\">What are Profiles?</p> <p class=\"banner-text\">Profiles define what features users can access. Assign a profile to a user to grant them permissions.</p> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading profiles...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(profiles.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No profiles found.</div> </template><template case=\"false\"> <div class=\"profiles-grid\"> <template is=\"for\" items=\"{{profiles}}\" item=\"profile\"> <div class=\"profile-card\"> <div class=\"card-header\"> <div class=\"profile-icon\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><line x1=\"19\" y1=\"8\" x2=\"19\" y2=\"14\"></line><line x1=\"22\" y1=\"11\" x2=\"16\" y2=\"11\"></line></svg> </div> <div class=\"dropdown-wrapper\"> <button class=\"btn-icon-dots\" onclick=\"{{action('toggleDropdown',profile.id,event)}}\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"12\" cy=\"5\" r=\"1\"></circle><circle cx=\"12\" cy=\"19\" r=\"1\"></circle></svg> </button> <template is=\"if\" value=\"{{expHandlers(openDropdownId,'==',profile.id)}}\"><template case=\"true\"> <div class=\"dropdown-menu\"> <a onclick=\"{{action('viewProfile',profile.id)}}\" class=\"menu-item\">View Details</a> <a onclick=\"{{action('editProfile',profile.id)}}\" class=\"menu-item\">Edit Profile</a> <div class=\"divider\"></div> <a onclick=\"{{action('deleteProfile',profile.id,profile.name)}}\" class=\"menu-item text-danger\">Delete</a> </div> </template></template> </div> </div> <h3 class=\"profile-name\">{{profile.name}}</h3> <p class=\"profile-desc\">{{profile.description}}</p> <div class=\"perm-count\">{{profile.totalCount}} permission(s)</div> <template is=\"if\" value=\"{{expHandlers(profile.totalCount,'>',0)}}\"><template case=\"true\"> <div class=\"perm-section\"> <div class=\"perm-label\">Permissions</div> <div class=\"tags-container\"> <template is=\"for\" items=\"{{profile.visiblePermissions}}\" item=\"perm\"> <span class=\"tag\">{{perm}}</span> </template> <template is=\"if\" value=\"{{expHandlers(profile.remainingCount,'>',0)}}\"><template case=\"true\"> <span class=\"tag more\">+{{profile.remainingCount}} more</span> </template></template> </div> </div> </template></template> <div class=\"card-footer\"> <button onclick=\"{{action('viewProfile',profile.id)}}\" class=\"btn-sm\">View</button> <button onclick=\"{{action('editProfile',profile.id)}}\" class=\"btn-sm ghost\">Edit</button> </div> </div> </template> </div> </template></template> </template></template> </div> </template><style>/* CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n/* INFO BANNER */\n.info-banner {\n    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);\n    border: 1px solid #bae6fd; border-radius: 8px;\n    padding: 15px; display: flex; gap: 15px; margin-bottom: 25px; flex-shrink: 0;\n}\n.banner-icon { color: #0284c7; }\n.banner-title { font-weight: bold; color: #0369a1; font-size: 14px; margin: 0 0 4px 0; }\n.banner-text { color: #475569; font-size: 13px; margin: 0; }\n\n/* GRID */\n.profiles-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));\n    gap: 20px;\n\n    /* Scroll Logic */\n    flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 20px;\n}\n\n/* CARD */\n.profile-card {\n    background: white; border-radius: 8px; padding: 20px;\n    border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\n    display: flex; flex-direction: column;\n}\n.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }\n\n.profile-icon {\n    width: 48px; height: 48px; border-radius: 8px;\n    background: #dbeafe; color: #2563eb;\n    display: flex; align-items: center; justify-content: center;\n}\n\n.profile-name { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 5px 0; }\n.profile-desc { font-size: 13px; color: #64748b; margin: 0 0 15px 0; line-height: 1.4; flex-grow: 1; }\n.perm-count { font-size: 12px; color: #94a3b8; margin-bottom: 15px; }\n\n/* PERMISSIONS TAGS */\n.perm-section { margin-top: auto; border-top: 1px solid #f1f5f9; padding-top: 15px; }\n.perm-label { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #94a3b8; margin-bottom: 8px; }\n.tags-container { display: flex; flex-wrap: wrap; gap: 6px; }\n\n.tag {\n    font-size: 11px; padding: 4px 8px; border-radius: 4px;\n    background: #f1f5f9; color: #475569;\n}\n.tag.more { background: #dbeafe; color: #1e40af; font-weight: 600; }\n\n/* FOOTER & BUTTONS */\n.card-footer { margin-top: 20px; display: flex; gap: 10px; }\n.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 4px; cursor: pointer; border: none; background: #2563eb; color: white; }\n.btn-sm.ghost { background: white; border: 1px solid #cbd5e1; color: #475569; }\n\n/* DROPDOWN */\n.dropdown-wrapper { position: relative; }\n.btn-icon-dots { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 5px; }\n.btn-icon-dots:hover { color: #1e293b; background: #f1f5f9; border-radius: 50%; }\n\n.dropdown-menu {\n    position: absolute; right: 0; top: 30px;\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\n    min-width: 140px; z-index: 10;\n}\n.menu-item {\n    display: block; padding: 8px 12px; font-size: 13px; color: #334155;\n    cursor: pointer; text-decoration: none;\n}\n.menu-item:hover { background: #f8fafc; }\n.menu-item.text-danger { color: #ef4444; }\n.menu-item.text-danger:hover { background: #fef2f2; }\n.divider { height: 1px; background: #e2e8f0; margin: 4px 0; }\n\n.loading-state, .empty-state { text-align: center; color: #94a3b8; padding: 40px; margin: auto; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1,1,3,1]},{"type":"attr","position":[1,1,3,3]},{"type":"if","position":[1,1,3,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"attr","position":[1,3]},{"type":"attr","position":[1,7]}]}},"default":{}},{"type":"text","position":[1,3,0]},{"type":"text","position":[1,5,0]},{"type":"text","position":[1,7,0]},{"type":"attr","position":[1,9]},{"type":"if","position":[1,9],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,3,1]},{"type":"for","position":[1,3,1],"dynamicNodes":[{"type":"text","position":[1,0]}]},{"type":"attr","position":[1,3,3]},{"type":"if","position":[1,3,3],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,1]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,11,1]},{"type":"attr","position":[1,11,3]}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["profiles","isLoading","openDropdownId","canManage"],

	data: function() {
		return {
			// Data
			profiles: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			openDropdownId: Lyte.attr("string", { default: null }), // Tracks which menu is open
			canManage: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		// Permission Check
		if (!this.hasPermission('USER_MANAGE')) {
			alert("You do not have permission to access this page");
			window.location.hash = "#/dashboard";
			return;
		}

		this.setData('canManage', true);

		// Close dropdowns when clicking anywhere else
		document.addEventListener('click', this.closeAllDropdowns.bind(this));

		this.loadProfiles();
	},

	didDestroy: function() {
		document.removeEventListener('click', this.closeAllDropdowns.bind(this));
	},

	// Helper to close menus
	closeAllDropdowns: function() {
		this.setData('openDropdownId', null);
	},

	loadProfiles: function() {
		this.setData('isLoading', true);

		this.crmGetProfiles()
			.then((res) => {
				let rawList = [];
				// 1. EXTRACTION
				if (Array.isArray(res)) { rawList = res; }
				else if (res && Array.isArray(res.data)) { rawList = res.data; }
				else if (res && res.data && Array.isArray(res.data.data)) { rawList = res.data.data; }

				// 2. NORMALIZE
				const cleanList = rawList.map(p => {
					let perms = p.permissions || [];

					// Logic for "First 5 + More"
					const maxVisible = 5;
					const visibleRaw = perms.slice(0, maxVisible);
					const remaining = perms.length - maxVisible;

					// Format strings (DEAL_CREATE -> Deal Create)
					const formattedVisible = visibleRaw.map(code => this.formatPermString(code));

					return {
						id: p.id,
						name: p.name,
						description: p.description || "",
						totalCount: perms.length,
						visiblePermissions: formattedVisible,
						remainingCount: remaining > 0 ? remaining : 0
					};
				});

				this.setData('profiles', cleanList);
			})
			.catch(err => {
				console.error("Profile load error", err);
				this.setData('profiles', []);
			})
			.finally(() => this.setData('isLoading', false));
	},

	// Helper: Formats "DEAL_CREATE" -> "Deal Create"
	formatPermString: function(code) {
		if (!code) return "";
		return code.split('_')
			.map(word => word.charAt(0) + word.slice(1).toLowerCase())
			.join(' ');
	},

	actions: {
		createProfile: function() {
			window.location.hash = "#/profiles/create";
		},

		viewProfile: function(id) {
			window.location.hash = "#/profiles/" + id;
		},

		editProfile: function(id) {
			window.location.hash = "#/profiles/edit/" + id;
		},

		// Dropdown Logic
		toggleDropdown: function(id, event) {
			event.stopPropagation(); // Stop document click from firing immediately
			let current = this.getData('openDropdownId');

			if (current === String(id)) {
				this.setData('openDropdownId', null); // Close if same
			} else {
				this.setData('openDropdownId', String(id)); // Open new
			}
		},

		deleteProfile: function(id, name) {
			if (confirm("Are you sure you want to delete profile: " + name + "? Users with this profile will lose permissions.")) {
				this.crmDeleteProfile(id).then((res) => {
					if (res.success) {
						alert("Profile deleted");
						this.loadProfiles();
					} else {
						alert(res.message || "Failed to delete");
					}
				});
			}
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("role-list", {
_template:"<template tag-name=\"role-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <h1 class=\"title\">Roles</h1> <p class=\"subtitle\">Manage organizational hierarchy and reporting lines.</p> </div> <template is=\"if\" value=\"{{canManage}}\"><template case=\"true\"> <button onclick=\"{{action('openCreateModal')}}\" class=\"btn-primary\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg> <span>Create Role</span> </button> </template></template> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading structure...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(roles.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\"> <div class=\"empty-icon-bg\"> <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </div> <h3>No roles defined</h3> <p>Create your first role to establish the hierarchy.</p> <button onclick=\"{{action('openCreateModal')}}\" class=\"btn-secondary\">Create First Role</button> </div> </template><template case=\"false\"> <div class=\"roles-grid\"> <template is=\"for\" items=\"{{roles}}\" item=\"role\"> <div class=\"role-card\"> <div class=\"card-top\"> <div class=\"role-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> </div> <div class=\"badge-id\">ID: {{role.id}}</div> </div> <div class=\"card-main\"> <h3 class=\"role-title\">{{role.roleName}}</h3> <div class=\"hierarchy-info\"> <template is=\"if\" value=\"{{role.parentName}}\"><template case=\"true\"> <div class=\"report-line\"> <span class=\"icon-arrow\">↳</span> <span class=\"label\">Reports to:</span> <span class=\"value\">{{role.parentName}}</span> </div> </template><template case=\"false\"> <div class=\"report-line top\"> <span class=\"icon-crown\">👑</span> <span class=\"value\">Top Level Role</span> </div> </template></template> </div> <div class=\"sub-count\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg> {{role.subordinateCount}} direct reports </div> </div> <div class=\"card-footer\"> <button onclick=\"{{action('viewRole',role.id)}}\" class=\"btn-text\">View Details</button> <button onclick=\"{{action('deleteRole',role.id,role.roleName)}}\" class=\"btn-icon-danger\" title=\"Delete\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg> </button> </div> </div> </template> </div> </template></template> </template></template> <template is=\"if\" value=\"{{showCreateModal}}\"><template case=\"true\"> <div class=\"modal-backdrop\"> <div class=\"modal-window\"> <div class=\"modal-head\"> <h3>Create New Role</h3> <button onclick=\"{{action('closeCreateModal')}}\" class=\"btn-close\">×</button> </div> <form onsubmit=\"{{action('createRole',event)}}\"> <div class=\"modal-content\"> <div class=\"form-group\"> <label>Role Name <span class=\"required\">*</span></label> <input type=\"text\" lyte-model=\"newRoleName\" class=\"clean-input\" placeholder=\"e.g. Sales Manager\" autofocus=\"\"> </div> <div class=\"form-group\"> <label>Reports To</label> <div class=\"select-wrapper\"> <select lyte-model=\"newRoleParentId\" class=\"clean-select\"> <option value=\"\">No Parent (Top Level)</option> <option is=\"for\" lyte-for=\"true\" items=\"{{roles}}\" item=\"r\"></option> </select> <span class=\"select-arrow\">▼</span> </div> <p class=\"input-hint\">Defines who this role reports to in the hierarchy.</p> </div> </div> <div class=\"modal-foot\"> <button type=\"button\" onclick=\"{{action('closeCreateModal')}}\" class=\"btn-ghost\">Cancel</button> <button type=\"submit\" class=\"btn-primary\" disabled=\"{{isCreating}}\"> <template is=\"if\" value=\"{{isCreating}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Role</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* --- LAYOUT --- */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc; /* Very light blue-grey */\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n    box-sizing: border-box;\n}\n\n/* --- HEADER --- */\n.page-header {\n    display: flex; justify-content: space-between; align-items: center;\n    margin-bottom: 24px; flex-shrink: 0;\n}\n.title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }\n.subtitle { font-size: 13px; color: #64748b; margin: 4px 0 0 0; }\n\n.btn-primary {\n    background: #2563eb; color: white; border: none;\n    padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500;\n    cursor: pointer; display: flex; align-items: center; gap: 6px;\n    transition: background 0.2s;\n}\n.btn-primary:hover { background: #1d4ed8; }\n.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }\n\n/* --- GRID --- */\n.roles-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n    gap: 20px;\n    padding-bottom: 40px;\n    flex-grow: 1; overflow-y: auto; min-height: 0;\n}\n\n/* --- CARD DESIGN --- */\n.role-card {\n    background: white; border-radius: 12px;\n    border: 1px solid #e2e8f0;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n    display: flex; flex-direction: column;\n    transition: transform 0.2s, box-shadow 0.2s;\n    overflow: hidden;\n}\n.role-card:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);\n    border-color: #cbd5e1;\n}\n\n/* Card Top */\n.card-top {\n    padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;\n}\n.role-icon {\n    width: 36px; height: 36px; border-radius: 8px;\n    background: #eff6ff; color: #3b82f6;\n    display: flex; align-items: center; justify-content: center;\n}\n.badge-id {\n    font-size: 11px; font-weight: 600; color: #64748b;\n    background: #f1f5f9; padding: 2px 8px; border-radius: 12px;\n}\n\n/* Card Main */\n.card-main { padding: 0 20px 20px 20px; flex-grow: 1; }\n.role-title { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1e293b; }\n\n.hierarchy-info {\n    margin-bottom: 12px; font-size: 13px;\n    background: #f8fafc; padding: 8px 12px; border-radius: 6px;\n}\n.report-line { display: flex; align-items: center; gap: 6px; }\n.icon-arrow { color: #94a3b8; font-size: 14px; }\n.icon-crown { font-size: 14px; }\n.label { color: #64748b; }\n.value { color: #334155; font-weight: 500; }\n\n.sub-count {\n    font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px;\n}\n\n/* Card Footer */\n.card-footer {\n    padding: 12px 20px; border-top: 1px solid #f1f5f9;\n    display: flex; justify-content: space-between; align-items: center;\n    background: #fff;\n}\n.btn-text { background: none; border: none; color: #2563eb; font-size: 13px; font-weight: 500; cursor: pointer; padding: 0; }\n.btn-text:hover { text-decoration: underline; }\n\n.btn-icon-danger {\n    background: none; border: none; color: #cbd5e1; cursor: pointer;\n    padding: 4px; border-radius: 4px; transition: all 0.2s;\n}\n.btn-icon-danger:hover { color: #ef4444; background: #fee2e2; }\n\n/* --- MODAL --- */\n.modal-backdrop {\n    position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n    background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(2px);\n    display: flex; align-items: center; justify-content: center; z-index: 50;\n}\n.modal-window {\n    background: white; width: 420px; border-radius: 12px;\n    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);\n    animation: slideUp 0.3s ease-out;\n}\n@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }\n\n.modal-head {\n    padding: 20px; border-bottom: 1px solid #f1f5f9;\n    display: flex; justify-content: space-between; align-items: center;\n}\n.modal-head h3 { margin: 0; font-size: 18px; color: #0f172a; }\n.btn-close { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }\n\n.modal-content { padding: 24px; }\n.form-group { margin-bottom: 20px; }\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.clean-input, .clean-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px;\n    font-size: 14px; box-sizing: border-box; transition: border-color 0.2s;\n}\n.clean-input:focus, .clean-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n.select-wrapper { position: relative; }\n.select-arrow { position: absolute; right: 12px; top: 12px; font-size: 10px; color: #64748b; pointer-events: none; }\n.clean-select { appearance: none; background: white; }\n\n.input-hint { font-size: 12px; color: #94a3b8; margin: 6px 0 0 0; }\n\n.modal-foot {\n    padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9;\n    border-radius: 0 0 12px 12px; display: flex; justify-content: flex-end; gap: 12px;\n}\n.btn-ghost { background: white; border: 1px solid #e2e8f0; color: #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }\n.btn-ghost:hover { background: #f1f5f9; }\n\n/* LOADING & EMPTY */\n.loading-state, .empty-state { text-align: center; color: #64748b; padding-top: 60px; }\n.spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s infinite linear; }\n.empty-icon-bg { width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #94a3b8; }\n.empty-state h3 { margin: 0 0 8px 0; color: #1e293b; }\n.empty-state p { margin: 0 0 24px 0; font-size: 14px; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,7]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"text","position":[1,1,3,1]},{"type":"text","position":[1,3,1,0]},{"type":"attr","position":[1,3,3,1]},{"type":"if","position":[1,3,3,1],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,5,0]}]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,3,5,3]},{"type":"attr","position":[1,5,1]},{"type":"attr","position":[1,5,3]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3]},{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,1,3,1,3,3,1,3]},{"type":"for","position":[1,1,3,1,3,3,1,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{roles}}\" item=\"r\"> <option value=\"{{r.id}}\">{{r.roleName}}</option> </template>"},{"type":"attr","position":[1,1,3,3,1]},{"type":"attr","position":[1,1,3,3,3]},{"type":"attr","position":[1,1,3,3,3,1]},{"type":"if","position":[1,1,3,3,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["roles","isLoading","canManage","showCreateModal","isCreating","newRoleName","newRoleParentId"],

	data: function() {
		return {
			// Data
			roles: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			canManage: Lyte.attr("boolean", { default: false }),

			// Modal State
			showCreateModal: Lyte.attr("boolean", { default: false }),
			isCreating: Lyte.attr("boolean", { default: false }),

			// New Role Form Data
			newRoleName: Lyte.attr("string", { default: "" }),
			newRoleParentId: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: function() {
		// Permission Check
		if (!this.hasPermission('USER_MANAGE')) {
			alert("You do not have permission to access this page");
			window.location.hash = "#/dashboard";
			return;
		}

		this.setData('canManage', true);
		this.loadRoles();
	},

	loadRoles: function() {
		this.setData('isLoading', true);

		this.crmGetRoles()
			.then((res) => {
				let rawList = [];
				// Robust Extraction
				if (Array.isArray(res)) { rawList = res; }
				else if (res && Array.isArray(res.data)) { rawList = res.data; }
				else if (res && res.data && Array.isArray(res.data.data)) { rawList = res.data.data; }

				// Normalize Data
				// The API returns 'reportsTo' as an object {id, name} or null
				const cleanList = rawList.map(r => ({
					id: r.id,
					roleName: r.roleName,
					// Safe access to nested object
					parentName: (r.reportsTo && r.reportsTo.name) ? r.reportsTo.name : null,
					parentId: (r.reportsTo && r.reportsTo.id) ? r.reportsTo.id : null,
					subordinateCount: (r.subordinates || []).length
				}));

				this.setData('roles', cleanList);
			})
			.catch(err => {
				console.error("Role load error", err);
				this.setData('roles', []);
			})
			.finally(() => this.setData('isLoading', false));
	},

	actions: {
		// --- MODAL ACTIONS ---
		openCreateModal: function() {
			this.setData('newRoleName', "");
			this.setData('newRoleParentId', "");
			this.setData('showCreateModal', true);
		},

		closeCreateModal: function() {
			this.setData('showCreateModal', false);
		},

		// --- CRUD ACTIONS ---
		createRole: function(e) {
			e.preventDefault();

			const name = this.getData('newRoleName');
			const parentId = this.getData('newRoleParentId');

			if (!name || name.trim() === "") {
				alert("Role name is required");
				return;
			}

			this.setData('isCreating', true);

			const payload = {
				roleName: name,
				parentRoleId: parentId ? parseInt(parentId) : null
			};

			this.crmCreateRole(payload)
				.then((res) => {
					if (res.success) {
						alert("Role created successfully");
						this.setData('showCreateModal', false);
						this.loadRoles(); // Refresh list
					} else {
						alert(res.message || "Failed to create role");
					}
				})
				.catch(err => alert("Error: " + err.message))
				.finally(() => this.setData('isCreating', false));
		},

		deleteRole: function(id, name) {
			if (confirm("Are you sure you want to delete role: " + name + "?")) {
				this.crmDeleteRole(id).then((res) => {
					if (res.success) {
						alert("Role deleted");
						this.loadRoles();
					} else {
						alert(res.message || "Failed to delete role");
					}
				});
			}
		},

		viewRole: function(id) {
			window.location.hash = "#/roles/" + id;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Router.registerRoute("crm-app.role-list", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "role-list"
        };
    }
});
Lyte.Component.register("crm-dashboard", {
_template:"<template tag-name=\"crm-dashboard\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <h1 class=\"title\">Dashboard</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading dashboard...</p> </div> </template><template case=\"false\"> <div class=\"dashboard-content\"> <div class=\"welcome-banner\"> <h1>Welcome back, {{currentUser.fullName}}!</h1> <p>Here's what's happening with your CRM today.</p> </div> <div class=\"quick-actions\"> <template is=\"if\" value=\"{{perms.DEAL_CREATE}}\"><template case=\"true\"> <button onclick=\"{{action('navigateTo','#/deals/create')}}\" class=\"quick-btn\"> <div class=\"icon-box blue\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path></svg></div> New Deal </button> </template></template> <template is=\"if\" value=\"{{perms.ACTIVITY_CREATE}}\"><template case=\"true\"> <button onclick=\"{{action('navigateTo','#/activities/create')}}\" class=\"quick-btn\"> <div class=\"icon-box yellow\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"></line><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"></line><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"></line></svg></div> New Activity </button> </template></template> <template is=\"if\" value=\"{{perms.COMPANY_CREATE}}\"><template case=\"true\"> <button onclick=\"{{action('navigateTo','#/companies/create')}}\" class=\"quick-btn\"> <div class=\"icon-box green\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 21h18\"></path><path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16\"></path></svg></div> New Company </button> </template></template> <template is=\"if\" value=\"{{perms.CONTACT_CREATE}}\"><template case=\"true\"> <button onclick=\"{{action('navigateTo','#/contacts/create')}}\" class=\"quick-btn\"> <div class=\"icon-box purple\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path></svg></div> New Contact </button> </template></template> </div> <div class=\"stats-grid\"> <template is=\"for\" items=\"{{summaryStats}}\" item=\"stat\"> <div class=\"stat-card\" onclick=\"{{action('navigateTo',stat.link)}}\"> <div class=\"stat-header\"> <div class=\"stat-icon {{stat.icon}}\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg> </div> </div> <div class=\"stat-value\">{{stat.value}}</div> <div class=\"stat-label\">{{stat.label}}</div> </div> </template> </div> <template is=\"if\" value=\"{{perms.VIEW_DEALS}}\"><template case=\"true\"> <div class=\"widget-card\"> <div class=\"widget-header\"> <h3 class=\"widget-title\">Deal Pipeline</h3> <button onclick=\"{{action('navigateTo','#/deals')}}\" class=\"btn-text\">View All</button> </div> <div class=\"widget-body\"> <div class=\"pipeline-grid\"> <template is=\"for\" items=\"{{pipelineStages}}\" item=\"stage\"> <div class=\"pipeline-stage {{stage.cssClass}}\"> <div class=\"stage-val\">{{stage.count}}</div> <div class=\"stage-lbl\">{{stage.label}}</div> </div> </template> </div> <div class=\"pipeline-footer\"> <span class=\"label\">Total Pipeline Value</span> <span class=\"value\">{{totalPipelineValue}}</span> </div> </div> </div> </template></template> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden; /* Stop main page scroll */\n    box-sizing: border-box;\n}\n\n/* HEADER */\n.page-header {\n    margin-bottom: 20px;\n    flex-shrink: 0; /* Keep header fixed size */\n}\n.title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; }\n\n/* SCROLLABLE WRAPPER (This fixes the scroll) */\n.dashboard-content {\n    flex-grow: 1;         /* Take up remaining space */\n    overflow-y: auto;     /* Enable Vertical Scroll */\n    min-height: 0;        /* Flexbox fix for scrolling */\n    padding-bottom: 40px; /* Space at bottom */\n\n    /* Hide scrollbar for cleaner look (optional) */\n    scrollbar-width: thin;\n}\n\n/* BANNER */\n.welcome-banner {\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    border-radius: 12px; padding: 24px; color: white;\n    margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\n}\n.welcome-banner h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 700; }\n.welcome-banner p { margin: 0; opacity: 0.9; font-size: 14px; }\n\n/* QUICK ACTIONS */\n.quick-actions { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }\n.quick-btn {\n    background: white; border: 1px solid #e2e8f0; border-radius: 8px;\n    padding: 12px 20px; display: flex; align-items: center; gap: 10px;\n    font-size: 14px; font-weight: 600; color: #334155; cursor: pointer;\n    transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\n}\n.quick-btn:hover { border-color: #cbd5e1; transform: translateY(-1px); }\n\n.icon-box { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }\n.icon-box.blue { background: #dbeafe; color: #2563eb; }\n.icon-box.yellow { background: #fef3c7; color: #d97706; }\n.icon-box.green { background: #dcfce7; color: #166534; }\n.icon-box.purple { background: #f3e8ff; color: #9333ea; }\n\n/* STATS GRID */\n/* STATS GRID */\n.stats-grid {\n    display: grid;\n    /* CHANGE: Force 5 equal columns. */\n    grid-template-columns: repeat(5, 1fr);\n    gap: 20px;\n    margin-bottom: 30px;\n\n    /* OPTIONAL: Ensure it doesn't break on very small screens */\n    min-width: 800px;\n}\n.stat-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 20px; cursor: pointer; transition: all 0.2s;\n}\n.stat-card:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-color: #cbd5e1; }\n\n.stat-header { margin-bottom: 15px; }\n.stat-icon {\n    width: 40px; height: 40px; border-radius: 10px;\n    display: flex; align-items: center; justify-content: center;\n}\n.stat-icon.deals { background: #dbeafe; color: #2563eb; }\n.stat-icon.activities { background: #fef3c7; color: #d97706; }\n.stat-icon.companies { background: #dcfce7; color: #166534; }\n.stat-icon.contacts { background: #f3e8ff; color: #9333ea; }\n.stat-icon.users { background: #fce7f3; color: #db2777; }\n\n.stat-value { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }\n.stat-label { font-size: 13px; color: #64748b; }\n\n/* PIPELINE WIDGET */\n.widget-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    overflow: hidden; margin-bottom: 30px;\n}\n.widget-header {\n    padding: 16px 24px; border-bottom: 1px solid #f1f5f9;\n    display: flex; justify-content: space-between; align-items: center;\n}\n.widget-title { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0; }\n.btn-text { background: none; border: none; color: #2563eb; font-size: 13px; font-weight: 500; cursor: pointer; }\n\n.widget-body { padding: 24px; }\n.pipeline-grid {\n    display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));\n    gap: 12px;\n}\n.pipeline-stage {\n    background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;\n    border-top: 4px solid #cbd5e1; /* Ensured border thickness */\n}\n.pipeline-stage.open { border-color: #3b82f6; }\n.pipeline-stage.in-progress { border-color: #f59e0b; }\n.pipeline-stage.won { border-color: #10b981; }\n.pipeline-stage.lost { border-color: #ef4444; }\n\n.stage-val { font-size: 20px; font-weight: 700; color: #0f172a; }\n.stage-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 4px; }\n\n.pipeline-footer {\n    margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;\n    text-align: center;\n}\n.pipeline-footer .label { font-size: 13px; color: #64748b; display: block; margin-bottom: 4px; }\n.pipeline-footer .value { font-size: 24px; font-weight: 700; color: #10b981; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"text","position":[1,1,1,1]},{"type":"attr","position":[1,3,1]},{"type":"if","position":[1,3,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,3]},{"type":"if","position":[1,3,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,7]},{"type":"if","position":[1,3,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,5,1]},{"type":"for","position":[1,5,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1,1]},{"type":"text","position":[1,3,0]},{"type":"text","position":[1,5,0]}]},{"type":"attr","position":[1,7]},{"type":"if","position":[1,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,3,1,1]},{"type":"for","position":[1,3,1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1,0]},{"type":"text","position":[1,3,0]}]},{"type":"text","position":[1,3,3,3,0]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["currentUser","summaryStats","pipelineStages","perms","isLoading","totalPipelineValue"],

	data: function() {
		return {
			currentUser: Lyte.attr("object", { default: {} }),

			summaryStats: Lyte.attr("array", { default: [] }),
			pipelineStages: Lyte.attr("array", { default: [] }),

			// FIX 1: Initialize specific keys to ensure reactivity
			perms: Lyte.attr("object", {
				default: {
					VIEW_DEALS: false,
					DEAL_CREATE: false,
					ACTIVITY_CREATE: false,
					COMPANY_CREATE: false,
					CONTACT_CREATE: false
				}
			}),

			isLoading: Lyte.attr("boolean", { default: true }),
			totalPipelineValue: Lyte.attr("string", { default: "₹0.00" })
		}
	},

	didConnect: function() {
		this.loadDashboard();
	},

	loadDashboard: function() {
		this.setData('isLoading', true);

		this.crmGetDashboard()
			.then((res) => {
				console.log("Dashboard API Response:", res); // Debug Log

				const data = res.data || {};

				// 1. User Context
				if (data.userContext) {
					this.setData('currentUser', data.userContext);
					this.setupPermissions(data.userContext.permissions || []);
				}

				// 2. Summary
				this.buildSummary(data.summary || {});

				// 3. Pipeline (Check if data exists)
				if (data.dealWidget) {
					console.log("Building Pipeline with:", data.dealWidget); // Debug Log
					this.buildPipeline(data.dealWidget);
				} else {
					console.warn("No dealWidget data found in response");
				}

			})
			.catch(err => {
				console.error("Dashboard error", err);
			})
			.finally(() => this.setData('isLoading', false));
	},

	setupPermissions: function(permArray) {
		console.log("User Permissions:", permArray);

		let p = {
			DEAL_CREATE: permArray.includes('DEAL_CREATE'),
			ACTIVITY_CREATE: permArray.includes('ACTIVITY_CREATE'),
			COMPANY_CREATE: permArray.includes('COMPANY_CREATE'),
			CONTACT_CREATE: permArray.includes('CONTACT_CREATE'),

			// View Logic
			VIEW_DEALS: permArray.includes('DEAL_VIEW_ALL') ||
				permArray.includes('DEAL_VIEW_TEAM') ||
				permArray.includes('DEAL_VIEW_SELF')
		};

		console.log("Calculated Perms Object:", p);
		this.setData('perms', p);
	},

	buildSummary: function(summary) {
		let stats = [];
		const add = (key, label, icon, link) => {
			if (summary[key] !== undefined) {
				stats.push({ value: summary[key], label: label, icon: icon, link: link });
			}
		};

		add('totalDeals', 'Total Deals', 'deals', '#/deals');
		add('pendingActivities', 'Pending Activities', 'activities', '#/activities');
		add('totalCompanies', 'Companies', 'companies', '#/companies');
		add('totalContacts', 'Contacts', 'contacts', '#/contacts');
		add('totalUsers', 'Users', 'users', '#/users');

		this.setData('summaryStats', stats);
	},

	buildPipeline: function(widget) {
		// Map API keys to Display Labels
		const stages = [
			{ key: 'newDeals', label: 'New Lead', css: 'open' },
			{ key: 'qualifiedDeals', label: 'Qualified', css: 'open' },
			{ key: 'proposalSentDeals', label: 'Proposal', css: 'in-progress' },
			{ key: 'inProgressDeals', label: 'In Progress', css: 'in-progress' },
			{ key: 'deliveredDeals', label: 'Delivered', css: 'won' },
			{ key: 'closedDeals', label: 'Closed', css: 'lost' }
		];

		let result = stages.map(s => ({
			label: s.label,
			count: widget[s.key] || 0,
			cssClass: s.css
		}));

		this.setData('pipelineStages', result);
		this.setData('totalPipelineValue', this.formatMoney(widget.totalPipelineAmount));
	},

	formatMoney: function(amount) {
		if (!amount) return "₹0.00";
		return "₹" + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	actions: {
		navigateTo: function(hash) {
			window.location.hash = hash;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });