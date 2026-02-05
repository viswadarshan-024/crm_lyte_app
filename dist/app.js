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

		this.route('contact-edit', { path: 'contacts/edit/:id', component: 'contact-edit' });

		// Companies

		this.route('company-list', { path: 'companies', component: 'company-list' });

		this.route('company-view', { path: 'companies/:id', component: 'company-view' });

		this.route('company-create', { path: 'companies/create', component: 'company-create' });

		this.route('company-edit', { path: 'companies/edit/:id', component: 'company-edit' });

		// Deals

		this.route('deal-list', { path: 'deals', component: 'deal-list' });

		this.route('deal-view', { path: 'deals/:id', component: 'deal-view' });

		this.route('deal-create', { path: 'deals/create', component: 'deal-create' });

		this.route('deal-edit', { path: 'deals/edit/:id', component: 'deal-edit' });

		// Activities

		this.route('activity-list', { path: 'activities', component: 'activity-list' });

		this.route('activity-view', { path: 'activities/:id', component: 'activity-view' });

		this.route('activity-create', { path: 'activities/create', component: 'activity-create' });

		this.route('activity-edit', { path: 'activities/edit/:id', component: 'activity-edit' });

		// Users

		this.route('user-list', { path: 'users', component: 'user-list' });

		this.route('user-view', { path: 'users/:id', component: 'user-view' });

		this.route('user-create', { path: 'users/create', component: 'user-create' });

		this.route('user-edit', { path: 'users/edit/:id', component: 'user-edit' });

		// Profiles

		this.route('profile-list', { path: 'profiles', component: 'profile-list' });

		this.route('profile-view', { path: 'profiles/:id', component: 'profile-view' });

		this.route('profile-create', { path: 'profiles/create', component: 'profile-create' });

		this.route('profile-edit', { path: 'profiles/edit/:id', component: 'profile-edit' });

		// Roles

		this.route('role-list', { path: 'roles', component: 'role-list' });

		this.route('role-view', { path: 'roles/:id', component: 'role-view' });
	});
});
Lyte.Mixin.register("api-mixin", {

    apiRequest: function(endpoint, options) {
        var API_BASE_URL = 'http://localhost:8181/mini_crm';
        options = options || {};

        if (endpoint.charAt(0) === '/') endpoint = endpoint.substring(1);

        let url = API_BASE_URL + '/' + endpoint;
        let method = (options.method || "GET").toUpperCase();

        // Default Headers
        let headers = options.headers || {};
        if (!headers['Accept']) {
            headers['Accept'] = 'application/json';
        }

        let fetchConfig = {
            method: method,
            headers: headers,
            credentials: 'include'
        };

        // --- Body Handling ---
        if (options.body) {
            if (method === 'GET' || method === 'HEAD') {
                // GET: Convert body to Query String
                let params = options.body;
                let queryString = Object.keys(params).map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');

                if (queryString) {
                    url += (url.includes('?') ? '&' : '?') + queryString;
                }
            } else {
                // POST/PUT/DELETE: Handle Payload

                // 1. If sending raw FormData (e.g. file uploads)
                if (options.body instanceof FormData) {
                    fetchConfig.body = options.body;
                    // Note: Content-Type header is NOT set here; browser sets it automatically with boundary
                }
                    // 2. Default: Convert Object -> URLSearchParams (x-www-form-urlencoded)
                // This matches your working Vanilla JS logic
                else {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';

                    const params = new URLSearchParams();
                    const data = options.body;

                    // Loop keys to handle Arrays (e.g., permissionIds) correctly for Struts2
                    Object.keys(data).forEach(function(key) {
                        const value = data[key];
                        if (value !== null && value !== undefined) {
                            if (Array.isArray(value)) {
                                // Append same key multiple times: ids=1&ids=2
                                value.forEach(function(v) {
                                    params.append(key, v);
                                });
                            } else {
                                params.append(key, value);
                            }
                        }
                    });

                    fetchConfig.body = params; // Fetch API handles stringifying this
                }
            }
        }

        // --- Execute Request ---
        return fetch(url, fetchConfig)
            .then(async function(response) {

                // 1. Handle 401 Unauthorized
                if (response.status === 401) {
                    localStorage.removeItem('user');
                    // Optional: Redirect to login
                    // window.location.href = "/";
                    throw new Error("Unauthorized");
                }

                // 2. Handle Non-200 Errors
                if (!response.ok) {
                    const text = await response.text();
                    let errData;
                    try { errData = text ? JSON.parse(text) : {}; }
                    catch (e) { errData = { message: text }; }

                    let error = new Error(errData.message || "API Error (" + response.status + ")");
                    error.data = errData;
                    throw error;
                }

                // 3. Verify JSON Content-Type
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    return response.json();
                } else {
                    // Server returned HTML (e.g., standard error page or login page)
                    const text = await response.text();
                    console.error("API Error: Received HTML instead of JSON", text.substring(0, 200));
                    throw new Error("Server returned HTML format. Check authentication or server logs.");
                }
            })
            .then(function(data) {
                // Normalize Struts2 JSON Plugin wrapper
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

            console.log(userData);
            console.log("response", response.data);
            console.log("response - ", response);

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

        // crmLogin: function (credentials) {
        //     // FIX: Just pass the plain object.
        //     // Our updated apiRequest will automatically convert this to
        //     // application/x-www-form-urlencoded because it's a POST request.
        //     return this.apiRequest('login.action', {
        //         method: 'POST',
        //         body: credentials
        //     });
        // },

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

Lyte.Router.registerRoute("logger", {
    model: function() {
        return {};
    },
//     renderTemplate : function()	{
//         return {component : "contact-create"};
//     }
});

Lyte.Router.registerRoute("crm-app.activity-create", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "activity-create"};
    }
});
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
Lyte.Router.registerRoute("crm-app.activity-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "activity-edit"};
    }
});
Lyte.Router.registerRoute("crm-app.company-create", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "company-create"};
    }
});
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
Lyte.Router.registerRoute("crm-app.company-view", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "company-view"
        };
    }
});
Lyte.Router.registerRoute("crm-app.activity-view", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "activity-view"
        };
    }
});
Lyte.Router.registerRoute("crm-app.contact-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "contact-edit"};
    }
});
Lyte.Router.registerRoute("crm-app.company-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "company-edit"};
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
Lyte.Router.registerRoute("crm-app.deal-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "deal-edit"};
    }
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
Lyte.Router.registerRoute("crm-app.profile-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "profile-edit"};
    }
});
Lyte.Router.registerRoute("crm-app.profile-create", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "profile-create"};
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
Lyte.Router.registerRoute("crm-app.role-view", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "role-view"
        };
    }
});
Lyte.Router.registerRoute("crm-app.user-create", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "user-create"};
    }
});
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
Lyte.Router.registerRoute("crm-app.user-view", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "user-view"
        };
    }
});
Lyte.Router.registerRoute("crm-app.profile-view", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "profile-view"
        };
    }
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
Lyte.Component.register("activity-create", {
_template:"<template tag-name=\"activity-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Create Activity</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading deals...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Activity Type</h3> <div class=\"type-grid\"> <template is=\"for\" items=\"{{activityTypes}}\" item=\"type\"> <div class=\"type-option {{expHandlers(expHandlers(selectedType,'==',type.id),'?:','selected','')}}\" onclick=\"{{action('selectType',type.id,type.defaultStatus)}}\"> <div class=\"type-icon {{type.id}}\"> <template is=\"if\" value=\"{{expHandlers(type.id,'==','TASK')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M9 11l3 3L22 4\"></path><path d=\"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11\"></path></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','CALL')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','MEETING')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"></line><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"></line><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"></line></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','EMAIL')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','LETTER')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"></path><polyline points=\"14 2 14 8 20 8\"></polyline><line x1=\"16\" y1=\"13\" x2=\"8\" y2=\"13\"></line><line x1=\"16\" y1=\"17\" x2=\"8\" y2=\"17\"></line><polyline points=\"10 9 9 9 8 9\"></polyline></svg></template></template> <template is=\"if\" value=\"{{expHandlers(type.id,'==','SOCIAL_MEDIA')}}\"><template case=\"true\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"></line><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"></path></svg></template></template> </div> <span class=\"type-name\">{{type.label}}</span> </div> </template> </div> <div class=\"status-hint\"> <strong>Initial Status:</strong> {{currentStatusHint}} </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Activity Details</h3> <div class=\"form-group\"> <label>Related Deal <span class=\"required\">*</span></label> <select id=\"sel_deal\" class=\"form-select\" lyte-model=\"selectedDealId\"> <option value=\"\">Select a Deal...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{deals}}\" item=\"deal\"></option> </select> </div> <div class=\"form-group\"> <label>Description</label> <textarea id=\"inp_desc\" class=\"form-textarea\" rows=\"3\" placeholder=\"What needs to be done?\"></textarea> </div> <div class=\"form-group\"> <label>Due Date <span class=\"required\">*</span></label> <input type=\"date\" id=\"inp_date\" class=\"form-input\" min=\"{{todayDate}}\"> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createActivity')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Activity</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 640px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n/* TYPE SELECTOR GRID */\n.type-grid {\n    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 15px;\n}\n.type-option {\n    display: flex; flex-direction: column; align-items: center; gap: 8px;\n    padding: 16px; border: 2px solid #e2e8f0; border-radius: 8px;\n    cursor: pointer; transition: all 0.2s;\n}\n.type-option:hover { border-color: #cbd5e1; background: #f8fafc; }\n.type-option.selected { border-color: #2563eb; background: #eff6ff; }\n\n.type-icon {\n    width: 40px; height: 40px; border-radius: 8px;\n    display: flex; align-items: center; justify-content: center;\n    color: white;\n}\n/* Colors */\n.type-icon.TASK { background: #3b82f6; }\n.type-icon.CALL { background: #10b981; }\n.type-icon.MEETING { background: #8b5cf6; }\n.type-icon.EMAIL { background: #f59e0b; }\n.type-icon.LETTER { background: #64748b; }\n.type-icon.SOCIAL_MEDIA { background: #ec4899; }\n\n.type-name { font-size: 13px; font-weight: 600; color: #334155; }\n\n/* STATUS HINT */\n.status-hint {\n    background: #f8fafc; padding: 10px; border-radius: 6px;\n    font-size: 13px; color: #64748b; text-align: center; border: 1px solid #f1f5f9;\n}\n\n/* FORM FIELDS */\n.form-group { margin-bottom: 20px; }\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select, .form-textarea {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus, .form-textarea:focus {\n    outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1);\n}\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }\n\n/* Mobile Response */\n@media (max-width: 600px) {\n    .type-grid { grid-template-columns: repeat(2, 1fr); }\n}</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1,3,1]},{"type":"for","position":[1,1,1,1,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1]},{"type":"attr","position":[1,1,1]},{"type":"if","position":[1,1,1],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,5]},{"type":"if","position":[1,1,5],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,7]},{"type":"if","position":[1,1,7],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,9]},{"type":"if","position":[1,1,9],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,1,11]},{"type":"if","position":[1,1,11],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,3,0]}]},{"type":"text","position":[1,1,1,1,5,3]},{"type":"attr","position":[1,1,1,3,3,3,3]},{"type":"for","position":[1,1,1,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{deals}}\" item=\"deal\"> <option value=\"{{deal.id}}\">{{deal.title}}</option> </template>"},{"type":"attr","position":[1,1,1,3,7,3]},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["deals","selectedType","selectedDealId","currentStatusHint","activityTypes","isLoading","isSaving","todayDate"],

	data: function() {
		return {
			// Dropdown Data
			deals: Lyte.attr("array", { default: [] }),

			// UI State
			selectedType: Lyte.attr("string", { default: "TASK" }),
			selectedDealId: Lyte.attr("string", { default: "" }),
			currentStatusHint: Lyte.attr("string", { default: "PENDING" }),

			// Visual Config (Types)
			activityTypes: Lyte.attr("array", { default: [
					{ id: 'TASK', label: 'Task', defaultStatus: 'PENDING', icon: 'task' },
					{ id: 'CALL', label: 'Call', defaultStatus: 'SCHEDULED', icon: 'call' },
					{ id: 'MEETING', label: 'Meeting', defaultStatus: 'SCHEDULED', icon: 'meeting' },
					{ id: 'EMAIL', label: 'Email', defaultStatus: 'DRAFT', icon: 'email' },
					{ id: 'LETTER', label: 'Letter', defaultStatus: 'DRAFT', icon: 'letter' },
					{ id: 'SOCIAL_MEDIA', label: 'Social Media', defaultStatus: 'DRAFT', icon: 'social' }
				]}),

			// Loading
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false }),
			todayDate: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('ACTIVITY_CREATE')) {
			alert("Permission denied");
			window.location.hash = "#/activities";
			return;
		}

		// Set Min Date to Today
		this.setData('todayDate', new Date().toISOString().split('T')[0]);

		// Check for URL param (pre-select deal)
		const params = this.getData('params') || {};
		// If your router passes query params differently, adjust here.
		// Assuming standard Lyte routing or URL parsing:
		const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
		const dealId = urlParams.get('dealId');
		if (dealId) {
			this.setData('selectedDealId', dealId);
		}

		this.loadDeals();
	},

	loadDeals: function() {
		this.setData('isLoading', true);
		this.crmGetDeals()
			.then((res) => {
				const list = res.data || [];
				// API returns flat deal objects
				this.setData('deals', list);
			})
			.catch(err => {
				console.error("Deals Load Error", err);
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	actions: {
		selectType: function(typeId, defaultStatus) {
			this.setData('selectedType', typeId);
			this.setData('currentStatusHint', defaultStatus.replace('_', ' '));
		},

		createActivity: function() {
			// 1. Direct DOM Reading
			const type = this.getData('selectedType'); // This is safe from state
			const dealId = document.getElementById('sel_deal').value;
			const description = document.getElementById('inp_desc').value.trim();
			const dueDate = document.getElementById('inp_date').value;

			// 2. Validation
			if (!dealId) {
				alert("Please select a Related Deal");
				return;
			}
			if (!dueDate) {
				alert("Please select a Due Date");
				return;
			}

			this.setData('isSaving', true);

			// 3. Payload
			const payload = {
				dealId: parseInt(dealId),
				type: type,
				description: description,
				dueDate: dueDate
			};

			this.crmSaveActivity(payload)
				.then((res) => {
					if (res.success) {
						alert("Activity created successfully!");
						window.location.hash = "#/activities";
					} else {
						alert("Error: " + (res.message || "Creation failed"));
					}
				})
				.catch(err => {
					alert("Submission error: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/activities";
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
Lyte.Component.register("activity-edit", {
_template:"<template tag-name=\"activity-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit Activity</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading activity...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Activity Type</h3> <div class=\"activity-display\"> <div class=\"type-icon {{activity.type}}\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg> </div> <div class=\"act-meta\"> <div class=\"act-type\">{{activity.type}}</div> <div class=\"act-id\">ID: #{{activity.id}}</div> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Details</h3> <div class=\"form-group\"> <label>Related Deal <span class=\"required\">*</span></label> <select id=\"sel_deal\" class=\"form-select\" lyte-model=\"selectedDealId\"> <option value=\"\">Select Deal...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{deals}}\" item=\"d\"></option> </select> </div> <div class=\"form-group\"> <label>Description</label> <textarea id=\"inp_desc\" class=\"form-textarea\" rows=\"4\" lyte-model=\"description\"></textarea> </div> <div class=\"form-group\"> <label>Due Date <span class=\"required\">*</span></label> <input type=\"date\" id=\"inp_date\" class=\"form-input\" lyte-model=\"dueDate\"> </div> <div class=\"form-group\"> <label>Status</label> <template is=\"if\" value=\"{{isTerminal}}\"><template case=\"true\"> <div class=\"status-badge\" style=\"background-color: {{statusBg}}; color: {{statusColor}}\"> {{currentStatusLabel}} </div> </template><template case=\"false\"> <select id=\"sel_status\" class=\"form-select\" lyte-model=\"selectedStatus\"> <option is=\"for\" lyte-for=\"true\" items=\"{{statusOptions}}\" item=\"opt\"></option> </select> </template></template> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateActivity')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 640px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n/* ACTIVITY TYPE HEADER */\n.activity-display { display: flex; align-items: center; gap: 15px; }\n.type-icon {\n    width: 48px; height: 48px; border-radius: 10px; background: #e0f2fe; color: #0284c7;\n    display: flex; align-items: center; justify-content: center;\n}\n/* Color overrides if needed */\n.type-icon.CALL { background: #dcfce7; color: #166534; }\n.type-icon.TASK { background: #dbeafe; color: #1e40af; }\n\n.act-type { font-weight: 700; color: #334155; font-size: 16px; }\n.act-id { font-size: 13px; color: #94a3b8; }\n\n/* FORMS */\n.form-group { margin-bottom: 20px; }\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select, .form-textarea {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n.status-badge {\n    display: inline-block; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600;\n}\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1,3,1]},{"type":"text","position":[1,1,1,1,3,3,1,0]},{"type":"text","position":[1,1,1,1,3,3,3,1]},{"type":"attr","position":[1,1,1,3,3,3,3]},{"type":"for","position":[1,1,1,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{deals}}\" item=\"d\"> <option value=\"{{d.id}}\">{{d.title}}</option> </template>"},{"type":"attr","position":[1,1,1,3,9,3]},{"type":"if","position":[1,1,1,3,9,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","statusBg","'; color: '","statusColor"]}}}},{"type":"text","position":[1,1]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{statusOptions}}\" item=\"opt\"> <option value=\"{{opt.code}}\">{{opt.label}}</option> </template>"}]}},"default":{}},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["activityId","activity","deals","statusOptions","isLoading","isSaving","isTerminal","currentStatusLabel","statusColor","statusBg"],

	data: function() {
		return {
			activityId: Lyte.attr("string", { default: "" }),

			// Data Models
			activity: Lyte.attr("object", { default: {} }),
			deals: Lyte.attr("array", { default: [] }),
			statusOptions: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false }),
			isTerminal: Lyte.attr("boolean", { default: false }),
			currentStatusLabel: Lyte.attr("string", { default: "" }),
			statusColor: Lyte.attr("string", { default: "" }),
			statusBg: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('ACTIVITY_UPDATE')) {
			alert("Permission denied");
			window.location.hash = "#/activities";
			return;
		}

		// Robust ID Extraction
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/activities";
			return;
		}

		this.setData('activityId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('activityId');

		Promise.all([
			this.crmGetActivity(id),
			this.crmGetDeals()
		]).then((responses) => {
			const [actRes, dealsRes] = responses;

			if (!actRes.success) throw new Error(actRes.message);

			// 1. Setup Data
			const actData = actRes.data || {};
			const activity = actData.activity || {};
			this.setData('activity', activity);
			this.setData('deals', dealsRes.data || []);

			// 2. Status Logic
			if (actData.statusOptions) {
				this.processStatusOptions(actData.statusOptions, activity.statusCode);
			} else {
				this.crmGetActivityStatusOptions(activity.type, activity.statusCode)
					.then((sRes) => this.processStatusOptions(sRes.data || {}, activity.statusCode));
			}

			// 3. FORCE POPULATE FORM (FIXED)
			// Use setTimeout to ensure DOM is rendered before setting values
			setTimeout(() => {
				this.populateForm(activity, actData.deal);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load data.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	// --- MANUALLY SET INPUT VALUES ---
	populateForm: function(activity, deal) {
		// 1. Description
		const descEl = document.getElementById('inp_desc');
		if (descEl) descEl.value = activity.description || "";

		// 2. Deal Selector
		const dealId = activity.dealId || (deal ? deal.id : "");
		const dealEl = document.getElementById('sel_deal');
		if (dealEl) dealEl.value = dealId;

		// 3. Date
		const dateEl = document.getElementById('inp_date');
		if (dateEl) dateEl.value = this.parseDateForInput(activity.dueDate);

		// 4. Status (if dropdown exists)
		const statusEl = document.getElementById('sel_status');
		if (statusEl) statusEl.value = activity.statusCode;
	},

	// Helper: Format Date for Input
	parseDateForInput: function(dateObj) {
		if (!dateObj) return "";
		if (typeof dateObj === 'string') return dateObj.split('T')[0];

		if (typeof dateObj === 'object' && dateObj.year) {
			const y = dateObj.year;
			const m = String(dateObj.monthValue).padStart(2, '0');
			const d = String(dateObj.dayOfMonth).padStart(2, '0');
			return `${y}-${m}-${d}`;
		}
		return "";
	},

	processStatusOptions: function(options, currentCode) {
		const allowed = options.allowedNext || [];
		const isTerminal = !!options.terminal;

		this.setData('isTerminal', isTerminal);

		if (!isTerminal) {
			const currentLabel = this.formatStatus(currentCode) + " (Current)";
			const dropdownList = [
				{ code: currentCode, label: currentLabel },
				...allowed
			];
			this.setData('statusOptions', dropdownList);
		} else {
			this.setData('currentStatusLabel', this.formatStatus(currentCode));
			const colorMap = { 'COMPLETED': '#10b981', 'MISSED': '#ef4444', 'CANCELLED': '#64748b' };
			const bgMap = { 'COMPLETED': '#dcfce7', 'MISSED': '#fee2e2', 'CANCELLED': '#f1f5f9' };

			this.setData('statusColor', colorMap[currentCode] || '#64748b');
			this.setData('statusBg', bgMap[currentCode] || '#f1f5f9');
		}
	},

	formatStatus: function(code) {
		if(!code) return "";
		return code.charAt(0) + code.slice(1).toLowerCase().replace('_', ' ');
	},

	actions: {
		updateActivity: function() {
			// Direct DOM Reading
			const dealId = document.getElementById('sel_deal').value;
			const description = document.getElementById('inp_desc').value.trim();
			const dueDate = document.getElementById('inp_date').value;
			const statusSelect = document.getElementById('sel_status');
			const statusCode = statusSelect ? statusSelect.value : this.getData('activity').statusCode;

			if (!dealId) { alert("Please select a Deal"); return; }
			if (!dueDate) { alert("Please select a Due Date"); return; }

			this.setData('isSaving', true);

			const payload = {
				id: parseInt(this.getData('activityId')),
				type: this.getData('activity').type,
				dealId: parseInt(dealId),
				description: description,
				dueDate: dueDate,
				statusCode: statusCode
			};

			this.crmUpdateActivity(payload)
				.then((res) => {
					if (res.success) {
						alert("Activity updated successfully!");
						window.location.hash = "#/activities/view/" + this.getData('activityId');
					} else {
						alert("Error: " + (res.message || "Update failed"));
					}
				})
				.catch(err => {
					alert("Submission error: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/activities/" + this.getData('activityId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("activity-view", {
_template:"<template tag-name=\"activity-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Activity Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading activity...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"activity-header-card\"> <div class=\"header-top\"> <div class=\"type-icon {{activity.type}}\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline></svg> </div> <div class=\"header-info\"> <h2>{{activity.type}}</h2> <div class=\"meta\">ID: #{{activity.id}}</div> </div> <div class=\"actions\"> <template is=\"if\" value=\"{{canEdit}}\"><template case=\"true\"> <button onclick=\"{{action('editActivity')}}\" class=\"btn-secondary\">Edit</button> </template></template> <template is=\"if\" value=\"{{canDelete}}\"><template case=\"true\"> <button onclick=\"{{action('deleteActivity')}}\" class=\"btn-danger-ghost\">Delete</button> </template></template> </div> </div> </div> <div class=\"status-box\"> <div class=\"status-label\">Current Status</div> <div class=\"current-status\" style=\"background-color: {{statusBg}}; color: {{statusColor}}\"> {{expHandlers(activity.statusLabel,'||',activity.statusCode)}} <template is=\"if\" value=\"{{isTerminal}}\"><template case=\"true\"> ✓</template></template> </div> <template is=\"if\" value=\"{{canChangeStatus}}\"><template case=\"true\"> <template is=\"if\" value=\"{{expHandlers(statusOptions.length,'>',0)}}\"><template case=\"true\"> <div class=\"transition-row\"> <span class=\"move-label\">Move to:</span> <template is=\"for\" items=\"{{statusOptions}}\" item=\"opt\"> <button class=\"status-btn\" onclick=\"{{action('changeStatus',opt.code)}}\"> {{opt.label}} </button> </template> </div> </template></template> </template></template> </div> <div class=\"activity-body\"> <h3 class=\"section-title\">Details</h3> <div class=\"info-grid\"> <div class=\"info-item\"> <div class=\"label\">Due Date</div> <div class=\"value {{expHandlers(isOverdue,'?:','text-danger','')}}\"> {{formattedDueDate}} <template is=\"if\" value=\"{{isOverdue}}\"><template case=\"true\"> (Overdue)</template></template> </div> </div> <div class=\"info-item\"> <div class=\"label\">Owner</div> <div class=\"value\">User #{{activity.ownerUserId}}</div> </div> </div> <h3 class=\"section-title\">Description</h3> <div class=\"desc-box\"> {{activity.description}} </div> <template is=\"if\" value=\"{{deal}}\"><template case=\"true\"> <h3 class=\"section-title\">Linked Deal</h3> <div class=\"linked-card\" onclick=\"{{action('viewDeal',deal.id)}}\"> <div class=\"card-icon deal\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path></svg> </div> <div class=\"card-info\"> <div class=\"card-title\">{{deal.title}}</div> <div class=\"card-sub\">{{deal.status}}</div> </div> <div class=\"card-arrow\">›</div> </div> </template></template> <template is=\"if\" value=\"{{company}}\"><template case=\"true\"> <h3 class=\"section-title\">Related Company</h3> <div class=\"linked-card\" onclick=\"{{action('viewCompany',company.id)}}\"> <div class=\"card-icon company\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 21h18\"></path><path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16\"></path></svg> </div> <div class=\"card-info\"> <div class=\"card-title\">{{company.name}}</div> </div> </div> </template></template> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.activity-header-card {\n    background: white; border-bottom: 1px solid #e2e8f0;\n    padding: 24px; border-radius: 12px 12px 0 0;\n}\n.header-top { display: flex; gap: 20px; align-items: center; }\n\n.type-icon {\n    width: 56px; height: 56px; border-radius: 12px;\n    display: flex; align-items: center; justify-content: center;\n    color: white;\n}\n/* Type Colors */\n.type-icon.CALL { background: #10b981; }\n.type-icon.MEETING { background: #8b5cf6; }\n.type-icon.TASK { background: #3b82f6; }\n.type-icon.EMAIL { background: #f59e0b; }\n\n.header-info h2 { font-size: 18px; font-weight: 700; margin: 0 0 4px 0; color: #1e293b; }\n.meta { font-size: 13px; color: #64748b; }\n.actions { margin-left: auto; display: flex; gap: 10px; }\n\n.btn-secondary { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* STATUS SECTION */\n.status-box {\n    background: #f8fafc; padding: 20px 24px; border-bottom: 1px solid #e2e8f0;\n}\n.status-label { font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; font-weight: 600; }\n\n.current-status {\n    display: inline-block; padding: 8px 16px; border-radius: 6px;\n    font-size: 14px; font-weight: 600;\n}\n\n.transition-row { margin-top: 15px; display: flex; align-items: center; gap: 10px; }\n.move-label { font-size: 13px; color: #64748b; }\n.status-btn {\n    background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px;\n    font-size: 13px; cursor: pointer; transition: all 0.2s;\n}\n.status-btn:hover { border-color: #3b82f6; background: #eff6ff; color: #1e40af; }\n\n/* BODY */\n.activity-body { background: white; padding: 24px; border-radius: 0 0 12px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }\n.section-title { font-size: 14px; font-weight: 700; color: #1e293b; margin: 24px 0 12px 0; }\n.section-title:first-child { margin-top: 0; }\n\n.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }\n.info-item { background: #f8fafc; padding: 12px; border-radius: 6px; }\n.info-item .label { font-size: 12px; color: #64748b; margin-bottom: 4px; }\n.info-item .value { font-size: 14px; color: #1e293b; font-weight: 500; }\n.text-danger { color: #ef4444; }\n\n.desc-box { background: #f8fafc; padding: 15px; border-radius: 6px; color: #334155; font-size: 14px; line-height: 1.5; }\n\n/* LINKED CARDS */\n.linked-card {\n    display: flex; align-items: center; gap: 15px; padding: 15px;\n    background: #f8fafc; border-radius: 8px; cursor: pointer; transition: background 0.2s;\n}\n.linked-card:hover { background: #f1f5f9; }\n\n.card-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }\n.card-icon.deal { background: #dbeafe; color: #2563eb; }\n.card-icon.company { background: #dcfce7; color: #166534; }\n\n.card-info { flex: 1; }\n.card-title { font-size: 14px; font-weight: 600; color: #1e293b; }\n.card-sub { font-size: 12px; color: #64748b; }\n.card-arrow { color: #cbd5e1; font-weight: bold; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1]},{"type":"text","position":[1,1,1,3,1,0]},{"type":"text","position":[1,1,1,3,3,1]},{"type":"attr","position":[1,1,1,5,1]},{"type":"if","position":[1,1,1,5,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,1,5,3]},{"type":"if","position":[1,1,1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,3,3],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","statusBg","'; color: '","statusColor"]}}}},{"type":"text","position":[1,3,3,1]},{"type":"attr","position":[1,3,3,3]},{"type":"if","position":[1,3,3,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"if","position":[1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,3]},{"type":"for","position":[1,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,5,3,1,3]},{"type":"text","position":[1,5,3,1,3,1]},{"type":"attr","position":[1,5,3,1,3,3]},{"type":"if","position":[1,5,3,1,3,3],"cases":{"true":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,5,3,3,3,1]},{"type":"text","position":[1,5,7,1]},{"type":"attr","position":[1,5,9]},{"type":"if","position":[1,5,9],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[3]},{"type":"text","position":[3,3,1,0]},{"type":"text","position":[3,3,3,0]}]}},"default":{}},{"type":"attr","position":[1,5,11]},{"type":"if","position":[1,5,11],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[3]},{"type":"text","position":[3,3,1,0]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["activityId","activity","deal","company","statusOptions","isTerminal","statusColor","statusBg","formattedDueDate","isOverdue","isLoading","canEdit","canDelete","canChangeStatus"],

	data: function() {
		return {
			activityId: Lyte.attr("string", { default: "" }),

			// Data Models
			activity: Lyte.attr("object", { default: {} }),
			deal: Lyte.attr("object", { default: null }), // Can be null
			company: Lyte.attr("object", { default: null }), // Can be null

			// Status Logic
			statusOptions: Lyte.attr("array", { default: [] }), // List of next allowed states
			isTerminal: Lyte.attr("boolean", { default: false }),

			// Visuals
			statusColor: Lyte.attr("string", { default: "#cbd5e1" }),
			statusBg: Lyte.attr("string", { default: "#f1f5f9" }),
			formattedDueDate: Lyte.attr("string", { default: "" }),
			isOverdue: Lyte.attr("boolean", { default: false }),

			// State
			isLoading: Lyte.attr("boolean", { default: true }),
			canEdit: Lyte.attr("boolean", { default: false }),
			canDelete: Lyte.attr("boolean", { default: false }),
			canChangeStatus: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		const params = this.getData('params');
		// Fallback if router doesn't pass params directly
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];

		if (!id) {
			window.location.hash = "#/activities";
			return;
		}

		this.setData('activityId', id);

		// Permissions
		this.setData('canEdit', this.hasPermission('ACTIVITY_UPDATE'));
		this.setData('canDelete', this.hasPermission('ACTIVITY_DELETE'));
		this.setData('canChangeStatus', this.hasPermission('ACTIVITY_CHANGE_STATUS'));

		this.loadActivity();
	},

	loadActivity: function() {
		this.setData('isLoading', true);
		const id = this.getData('activityId');

		this.crmGetActivity(id)
			.then((res) => {
				const data = res.data || {};
				const act = data.activity || {};

				// 1. Core Data
				this.setData('activity', act);
				this.setData('deal', data.deal || null);
				this.setData('company', data.company || null);

				// 2. Status Options (Next Steps)
				const opts = data.statusOptions || {};
				this.setData('statusOptions', opts.allowedNext || []);
				this.setData('isTerminal', !!opts.terminal);

				// 3. Visuals & Formatting
				this.calculateStatusVisuals(act.statusCode, act.type);
				this.calculateDates(act.dueDate, opts.terminal);

			})
			.catch(err => {
				console.error("Activity Load Error", err);
				alert("Failed to load activity.");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- LOGIC HELPERS ---

	calculateStatusVisuals: function(status, type) {
		// Simple color mapping
		const colors = {
			'COMPLETED': { text: '#10b981', bg: '#dcfce7' }, // Green
			'DONE': { text: '#10b981', bg: '#dcfce7' },
			'MISSED': { text: '#ef4444', bg: '#fee2e2' },    // Red
			'CANCELLED': { text: '#64748b', bg: '#f1f5f9' }, // Gray
			'SCHEDULED': { text: '#3b82f6', bg: '#dbeafe' }, // Blue
			'PENDING': { text: '#f59e0b', bg: '#fef3c7' }    // Orange
		};

		const theme = colors[status] || colors['PENDING'];
		this.setData('statusColor', theme.text);
		this.setData('statusBg', theme.bg);
	},

	calculateDates: function(dateObj, isTerminal) {
		if (!dateObj || !dateObj.year) {
			this.setData('formattedDueDate', '-');
			this.setData('isOverdue', false);
			return;
		}

		// Format
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let str = shortMonths[dateObj.monthValue - 1] + " " + dateObj.dayOfMonth + ", " + dateObj.year;
		this.setData('formattedDueDate', str);

		// Overdue Check
		if (isTerminal) {
			this.setData('isOverdue', false);
		} else {
			const d = new Date(dateObj.year, dateObj.monthValue - 1, dateObj.dayOfMonth);
			const today = new Date();
			today.setHours(0,0,0,0);
			this.setData('isOverdue', d < today);
		}
	},

	actions: {
		goBack: function() {
			window.location.hash = "#/activities";
		},

		editActivity: function() {
			// window.location.hash = "#/activities/:id/edit".replace(':id', this.getData('activityId'));
			window.location.hash = "#/activities/edit/" + this.getData('activityId');
		},

		deleteActivity: function() {
			if (confirm("Delete this activity? This cannot be undone.")) {
				this.crmDeleteActivity(this.getData('activityId')).then((res) => {
					if (res.success) {
						alert("Activity deleted");
						window.location.hash = "#/activities";
					} else {
						alert(res.message || "Failed to delete");
					}
				});
			}
		},

		changeStatus: function(newCode) {
			this.crmUpdateActivityStatus({
				id: this.getData('activityId'),
				statusCode: newCode
			}).then((res) => {
				if (res.success) {
					// Reload to get new allowed options
					this.loadActivity();
				} else {
					alert("Status update failed: " + res.message);
				}
			});
		},

		viewDeal: function(id) {
			window.location.hash = "#/deals/" + id;
		},

		viewCompany: function(id) {
			window.location.hash = "#/companies/" + id;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("company-create", {
_template:"<template tag-name=\"company-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Add Company</h1> </div> </header> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Basic Information</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Company Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" class=\"form-input\" placeholder=\"Acme Corp\"> </div> <div class=\"form-group half\"> <label>Domain</label> <input type=\"text\" id=\"inp_domain\" class=\"form-input\" placeholder=\"acme.com\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Email</label> <input type=\"email\" id=\"inp_email\" class=\"form-input\" placeholder=\"info@acme.com\"> </div> <div class=\"form-group half\"> <label>Phone</label> <input type=\"text\" id=\"inp_phone\" class=\"form-input\" placeholder=\"+1 555-0199\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Industry</label> <input type=\"text\" id=\"inp_industry\" class=\"form-input\" placeholder=\"Technology\"> </div> <div class=\"form-group half\"> <label>Company Size</label> <select id=\"sel_size\" class=\"form-select\"> <option value=\"\">Select size...</option> <option value=\"1-10\">1-10 employees</option> <option value=\"11-50\">11-50 employees</option> <option value=\"51-200\">51-200 employees</option> <option value=\"201-500\">201-500 employees</option> <option value=\"501+\">501+ employees</option> </select> </div> </div> <button type=\"button\" class=\"btn-secondary mt-4\" onclick=\"{{action('previewEnrichment')}}\" disabled=\"{{isEnriching}}\"> <template is=\"if\" value=\"{{isEnriching}}\"><template case=\"true\"> <div class=\"spinner-sm inline\"></div> Enriching... </template><template case=\"false\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"mr-2\"><path d=\"M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83\"></path></svg> AI Enrich Data </template></template> </button> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Address</h3> <div class=\"form-group\"> <label>Address Line 1</label> <input type=\"text\" id=\"inp_addr1\" class=\"form-input\" placeholder=\"Street Address\"> </div> <div class=\"form-group\"> <label>Address Line 2</label> <input type=\"text\" id=\"inp_addr2\" class=\"form-input\" placeholder=\"Suite, Floor\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>City</label> <input type=\"text\" id=\"inp_city\" class=\"form-input\" placeholder=\"City\"> </div> <div class=\"form-group half\"> <label>State</label> <input type=\"text\" id=\"inp_state\" class=\"form-input\" placeholder=\"State\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Country</label> <input type=\"text\" id=\"inp_country\" class=\"form-input\" placeholder=\"Country\"> </div> <div class=\"form-group half\"> <label>Postal Code</label> <input type=\"text\" id=\"inp_zip\" class=\"form-input\" placeholder=\"Zip Code\"> </div> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createCompany')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Company</template></template> </button> </div> </form> </div> </div> <template is=\"if\" value=\"{{showEnrichPreview}}\"><template case=\"true\"> <div class=\"modal-backdrop\"> <div class=\"modal-card\"> <div class=\"modal-header\"> <h3>Enrichment Preview</h3> <button onclick=\"{{action('closePreview')}}\" class=\"close-btn\">×</button> </div> <div class=\"modal-body\"> <div class=\"enrich-grid\"> <div class=\"enrich-item\"> <span class=\"lbl\">Domain:</span> <span class=\"val\">{{enrichedData.proposedDomain.value}}</span> </div> <div class=\"enrich-item\"> <span class=\"lbl\">Industry:</span> <span class=\"val\">{{enrichedData.proposedIndustry.value}}</span> </div> <div class=\"enrich-item\"> <span class=\"lbl\">Size:</span> <span class=\"val\">{{enrichedData.proposedCompanySize.value}}</span> </div> <div class=\"enrich-item\"> <span class=\"lbl\">City:</span> <span class=\"val\">{{enrichedData.proposedAddress.value.city}}</span> </div> </div> <p class=\"enrich-note\">Apply this data to auto-fill the form fields?</p> </div> <div class=\"modal-footer\"> <button onclick=\"{{action('closePreview')}}\" class=\"btn-secondary\">Cancel</button> <button onclick=\"{{action('applyEnrichment')}}\" class=\"btn-primary\">Apply Data</button> </div> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 720px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n.form-row { display: flex; gap: 20px; margin-bottom: 20px; }\n.form-group { margin-bottom: 20px; }\n.form-group.half { flex: 1; margin-bottom: 0; }\n\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n/* ACTIONS & BUTTONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.mt-4 { margin-top: 16px; }\n.mr-2 { margin-right: 8px; }\n.inline { display: inline-block; vertical-align: middle; }\n\n.spinner-sm { width: 14px; height: 14px; border: 2px solid #334155; border-top-color: transparent; border-radius: 50%; animation: spin 1s infinite linear; }\n\n/* MODAL */\n.modal-backdrop {\n    position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n    background: rgba(0,0,0,0.5); z-index: 100;\n    display: flex; align-items: center; justify-content: center;\n}\n.modal-card { background: white; border-radius: 12px; width: 400px; padding: 0; overflow: hidden; }\n.modal-header { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }\n.modal-header h3 { margin: 0; font-size: 16px; }\n.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; }\n\n.modal-body { padding: 20px; }\n.enrich-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; }\n.enrich-item { display: flex; justify-content: space-between; font-size: 14px; }\n.enrich-item .lbl { color: #64748b; }\n.enrich-item .val { font-weight: 600; color: #1e293b; }\n.enrich-note { font-size: 13px; color: #334155; text-align: center; }\n\n.modal-footer { padding: 16px 20px; background: #f8fafc; display: flex; justify-content: flex-end; gap: 10px; }\n\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3,1,1,1,9]},{"type":"attr","position":[1,3,1,1,1,9,1]},{"type":"if","position":[1,3,1,1,1,9,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,1,1,5,1]},{"type":"attr","position":[1,3,1,1,5,3]},{"type":"attr","position":[1,3,1,1,5,3,1]},{"type":"if","position":[1,3,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,5]},{"type":"if","position":[1,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3]},{"type":"text","position":[1,1,3,1,1,3,0]},{"type":"text","position":[1,1,3,1,3,3,0]},{"type":"text","position":[1,1,3,1,5,3,0]},{"type":"text","position":[1,1,3,1,7,3,0]},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,1,5,3]}]}},"default":{}}],
_observedAttributes :["isEnriching","showEnrichPreview","enrichedData","isSaving"],

	data: function() {
		return {
			// Enrichment State
			isEnriching: Lyte.attr("boolean", { default: false }),
			showEnrichPreview: Lyte.attr("boolean", { default: false }),
			enrichedData: Lyte.attr("object", { default: null }),

			// Submission State
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('COMPANY_CREATE')) {
			alert("Permission denied");
			window.location.hash = "#/companies";
		}
	},

	actions: {
		// 1. TRIGGER ENRICHMENT PREVIEW
		previewEnrichment: function() {
			const name = document.getElementById('inp_name').value.trim();
			const domain = document.getElementById('inp_domain').value.trim();

			if (!name && !domain) {
				alert("Please enter a Company Name or Domain first.");
				return;
			}

			this.setData('isEnriching', true);

			const payload = { name: name, domain: domain };

			this.crmPreviewCompanyEnrichment(payload)
				.then((res) => {
					if (res.success && res.data) {
						this.setData('enrichedData', res.data);
						this.setData('showEnrichPreview', true);
					} else {
						alert(res.message || "No enrichment data found.");
					}
				})
				.catch(err => {
					console.error("Enrichment Error", err);
					alert("Enrichment failed.");
				})
				.finally(() => {
					this.setData('isEnriching', false);
				});
		},

		// 2. APPLY ENRICHED DATA TO FORM (FIXED)
		applyEnrichment: function() {
			const data = this.getData('enrichedData');
			if (!data) return;

			// --- SAFE VALUE EXTRACTOR ---
			const getVal = (key) => {
				const item = data[key];
				if (item === null || item === undefined) return "";
				// If it's a wrapper object like { value: "Tech" }, return .value
				if (typeof item === 'object') {
					return item.value || "";
				}
				// Otherwise return it as a string
				return String(item);
			};

			const setEl = (id, val) => {
				if(val) document.getElementById(id).value = val;
			};

			// 1. Domain
			setEl('inp_domain', getVal('proposedDomain'));

			// 2. Industry (Fix for .includes error)
			let industry = getVal('proposedIndustry');
			if (industry) {
				// Force String to be safe
				industry = String(industry);
				if (industry.includes(',')) {
					industry = industry.split(',')[0].trim();
				}
				setEl('inp_industry', industry);
			}

			// 3. Company Size
			const sizeRaw = getVal('proposedCompanySize');
			if (sizeRaw) {
				const range = this.mapCompanySize(sizeRaw);
				setEl('sel_size', range);
			}

			// 4. Address
			// Safe extraction for nested address object
			const addrWrapper = data.proposedAddress;
			const addr = (addrWrapper && addrWrapper.value) ? addrWrapper.value : (addrWrapper || {});

			setEl('inp_addr1', addr.line1 || addr.addressLine1);
			setEl('inp_addr2', addr.line2 || addr.addressLine2);
			setEl('inp_city', addr.city);
			setEl('inp_state', addr.state);
			setEl('inp_country', addr.country);
			setEl('inp_zip', addr.postalCode);

			// Close Modal
			this.setData('showEnrichPreview', false);
		},

		closePreview: function() {
			this.setData('showEnrichPreview', false);
		},

		// 3. CREATE COMPANY
		createCompany: function() {
			const name = document.getElementById('inp_name').value.trim();

			if (!name) {
				alert("Company Name is required");
				return;
			}

			this.setData('isSaving', true);

			const payload = {
				name: name,
				domain: document.getElementById('inp_domain').value.trim(),
				email: document.getElementById('inp_email').value.trim(),
				phone: document.getElementById('inp_phone').value.trim(),
				industry: document.getElementById('inp_industry').value.trim(),
				companySize: document.getElementById('sel_size').value,

				addressLine1: document.getElementById('inp_addr1').value.trim(),
				addressLine2: document.getElementById('inp_addr2').value.trim(),
				city: document.getElementById('inp_city').value.trim(),
				state: document.getElementById('inp_state').value.trim(),
				country: document.getElementById('inp_country').value.trim(),
				postalCode: document.getElementById('inp_zip').value.trim(),

				isEnriched: !!this.getData('enrichedData')
			};

			this.crmSaveCompany(payload)
				.then((res) => {
					if (res.success) {
						alert("Company created successfully!");
						window.location.hash = "#/companies";
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Submission failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/companies";
		}
	},

	// Helper: Map raw size string/number to dropdown range
	mapCompanySize: function(input) {
		if (!input) return "";
		// Handle "190,167" -> 190167
		const num = parseInt(String(input).replace(/[^0-9]/g, ''));
		if (isNaN(num)) return "";

		if (num <= 10) return "1-10";
		if (num <= 50) return "11-50";
		if (num <= 200) return "51-200";
		if (num <= 500) return "201-500";
		return "501+";
	}

}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("company-edit", {
_template:"<template tag-name=\"company-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit Company</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading company...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Basic Information</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Company Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Domain</label> <input type=\"text\" id=\"inp_domain\" class=\"form-input\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Email</label> <input type=\"email\" id=\"inp_email\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Phone</label> <input type=\"text\" id=\"inp_phone\" class=\"form-input\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Industry</label> <input type=\"text\" id=\"inp_industry\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Company Size</label> <select id=\"sel_size\" class=\"form-select\"> <option value=\"\">Select size...</option> <option value=\"1-10\">1-10 employees</option> <option value=\"11-50\">11-50 employees</option> <option value=\"51-200\">51-200 employees</option> <option value=\"201-500\">201-500 employees</option> <option value=\"501+\">501+ employees</option> </select> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Address</h3> <div class=\"form-group\"> <label>Address Line 1</label> <input type=\"text\" id=\"inp_addr1\" class=\"form-input\"> </div> <div class=\"form-group\"> <label>Address Line 2</label> <input type=\"text\" id=\"inp_addr2\" class=\"form-input\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>City</label> <input type=\"text\" id=\"inp_city\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>State</label> <input type=\"text\" id=\"inp_state\" class=\"form-input\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Country</label> <input type=\"text\" id=\"inp_country\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Postal Code</label> <input type=\"text\" id=\"inp_zip\" class=\"form-input\"> </div> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateCompany')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companyId","company","isLoading","isSaving"],

	data: function() {
		return {
			companyId: Lyte.attr("string", { default: "" }),

			// Data Model
			company: Lyte.attr("object", { default: {} }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('COMPANY_UPDATE')) {
			alert("Permission denied");
			window.location.hash = "#/companies";
			return;
		}

		// Robust ID Parsing
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/companies";
			return;
		}

		this.setData('companyId', id);
		this.loadCompany();
	},

	loadCompany: function() {
		this.setData('isLoading', true);
		const id = this.getData('companyId');

		this.crmEditCompany(id)
			.then((res) => {
				if (!res.success) throw new Error(res.message);

				const data = res.data || {};
				this.setData('company', data);

				// FORCE POPULATE INPUTS
				setTimeout(() => {
					this.populateForm(data);
				}, 100);
			})
			.catch(err => {
				console.error("Load Error", err);
				alert("Failed to load company.");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	populateForm: function(data) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};

		setVal('inp_name', data.name);
		setVal('inp_domain', data.domain);
		setVal('inp_email', data.email);
		setVal('inp_phone', data.phone);
		setVal('inp_industry', data.industry);

		// Handle Company Size dropdown
		const sizeEl = document.getElementById('sel_size');
		if (sizeEl && data.companySize) {
			sizeEl.value = data.companySize;
		}

		// Address (flat structure in API response based on action class)
		// Check if API returns nested address object or flat fields
		// Based on action: response returns CompanyResponse which likely has nested AddressDto or flat fields.
		// Let's handle both for safety.
		const addr = data.address || data;

		setVal('inp_addr1', addr.addressLine1 || addr.line1);
		setVal('inp_addr2', addr.addressLine2 || addr.line2);
		setVal('inp_city', addr.city);
		setVal('inp_state', addr.state);
		setVal('inp_country', addr.country);
		setVal('inp_zip', addr.postalCode);
	},

	actions: {
		updateCompany: function() {
			// Direct DOM Reading
			const name = document.getElementById('inp_name').value.trim();
			if (!name) { alert("Company Name is required"); return; }

			this.setData('isSaving', true);

			const payload = {
				id: parseInt(this.getData('companyId')), // Important for Update
				name: name,
				domain: document.getElementById('inp_domain').value.trim(),
				email: document.getElementById('inp_email').value.trim(),
				phone: document.getElementById('inp_phone').value.trim(),
				industry: document.getElementById('inp_industry').value.trim(),
				companySize: document.getElementById('sel_size').value,

				addressLine1: document.getElementById('inp_addr1').value.trim(),
				addressLine2: document.getElementById('inp_addr2').value.trim(),
				city: document.getElementById('inp_city').value.trim(),
				state: document.getElementById('inp_state').value.trim(),
				country: document.getElementById('inp_country').value.trim(),
				postalCode: document.getElementById('inp_zip').value.trim()
			};

			this.crmSaveCompany(payload)
				.then((res) => {
					if (res.success) {
						alert("Company updated successfully!");
						window.location.hash = "#/companies/view/" + this.getData('companyId');
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Update failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/companies/" + this.getData('companyId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("company-view", {
_template:"<template tag-name=\"company-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Company Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading details...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"company-header-card\"> <div class=\"company-avatar\" style=\"background-color: {{avatarColor}}\"> {{initials}} </div> <div class=\"company-info\"> <h2>{{company.name}}</h2> <div class=\"company-meta\"> <template is=\"if\" value=\"{{company.industry}}\"><template case=\"true\"> <span>{{company.industry}}</span> • </template></template> <span>{{company.companySize}}</span> </div> </div> <div class=\"company-actions\"> <template is=\"if\" value=\"{{canEdit}}\"><template case=\"true\"> <button onclick=\"{{action('editCompany')}}\" class=\"btn-secondary\">Edit</button> </template></template> <template is=\"if\" value=\"{{canDelete}}\"><template case=\"true\"> <button onclick=\"{{action('deleteCompany')}}\" class=\"btn-danger-ghost\">Delete</button> </template></template> </div> </div> <div class=\"company-body\"> <h3 class=\"section-title\">Company Information</h3> <div class=\"info-grid\"> <div class=\"info-item\"> <div class=\"label\">Email</div> <div class=\"value\">{{company.email}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Phone</div> <div class=\"value\">{{company.phone}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Domain</div> <div class=\"value link\">{{company.domain}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Industry</div> <div class=\"value\">{{company.industry}}</div> </div> </div> <template is=\"if\" value=\"{{fullAddress}}\"><template case=\"true\"> <h3 class=\"section-title\">Address</h3> <div class=\"info-box\"> {{fullAddress}} </div> </template></template> <div class=\"tabs-container\"> <div class=\"tabs-header\"> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','contacts'),'?:','active','')}}\" onclick=\"{{action('switchTab','contacts')}}\"> Contacts ({{contacts.length}}) </div> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','deals'),'?:','active','')}}\" onclick=\"{{action('switchTab','deals')}}\"> Deals ({{deals.length}}) </div> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','activities'),'?:','active','')}}\" onclick=\"{{action('switchTab','activities')}}\"> Activities ({{activities.length}}) </div> </div> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','contacts')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(contacts.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No contacts linked to this company.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{contacts}}\" item=\"c\"> <div class=\"list-item\"> <div class=\"item-main\"> <div class=\"item-title\">{{c.name}}</div> <div class=\"item-sub\">{{c.jobTitle}}</div> </div> <button onclick=\"{{action('viewRelated','contacts',c.id)}}\" class=\"btn-sm\">View</button> </div> </template> </template></template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','deals')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(deals.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No deals found.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{deals}}\" item=\"d\"> <div class=\"list-item\"> <div class=\"item-icon deal\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path></svg> </div> <div class=\"item-main\"> <div class=\"item-title\">{{d.title}}</div> <div class=\"item-sub\">{{d.formattedAmount}} • {{d.assignedUserName}}</div> </div> <span class=\"badge {{d.statusClass}}\">{{d.status}}</span> <button onclick=\"{{action('viewRelated','deals',d.id)}}\" class=\"btn-sm ml-2\">View</button> </div> </template> </template></template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','activities')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(activities.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No activities recorded.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{activities}}\" item=\"a\"> <div class=\"list-item\"> <div class=\"item-icon activity\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><polyline points=\"12 6 12 12 16 14\"></polyline></svg> </div> <div class=\"item-main\"> <div class=\"item-title\">{{a.description}}</div> <div class=\"item-sub\">{{a.formattedDate}} • {{a.statusCode}}</div> </div> <button onclick=\"{{action('viewRelated','activities',a.id)}}\" class=\"btn-sm\">View</button> </div> </template> </template></template> </div> </template></template> </div> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n/* CONTENT WRAPPER */\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.company-header-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 24px; display: flex; align-items: center; gap: 20px;\n    margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n}\n.company-avatar {\n    width: 64px; height: 64px; border-radius: 12px;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-size: 24px; font-weight: 700;\n}\n.company-info h2 { margin: 0 0 4px 0; font-size: 24px; color: #1e293b; }\n.company-meta { color: #64748b; font-size: 14px; }\n.company-actions { margin-left: auto; display: flex; gap: 10px; }\n\n.btn-secondary { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* INFO BODY */\n.company-body { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }\n.section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n.info-grid {\n    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 20px; margin-bottom: 30px;\n}\n.info-item .label { font-size: 12px; color: #64748b; margin-bottom: 4px; }\n.info-item .value { font-size: 14px; color: #1e293b; font-weight: 500; }\n.info-item .value.link { color: #2563eb; cursor: pointer; }\n\n.info-box { background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 14px; color: #334155; margin-bottom: 30px; }\n\n/* TABS */\n.tabs-header { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; }\n.tab {\n    padding: 10px 20px; cursor: pointer; font-size: 14px; color: #64748b; border-bottom: 2px solid transparent; margin-bottom: -1px;\n}\n.tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }\n.tab:hover:not(.active) { color: #1e293b; }\n\n.tab-pane { min-height: 100px; }\n.empty-tab { text-align: center; color: #94a3b8; padding: 20px; font-style: italic; }\n\n/* LIST ITEMS */\n.list-item {\n    display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;\n}\n.list-item:last-child { border-bottom: none; }\n.item-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }\n.item-icon.deal { background: #e0f2fe; color: #0284c7; }\n.item-icon.activity { background: #f3f4f6; color: #4b5563; }\n\n.item-main { flex: 1; }\n.item-title { font-size: 14px; font-weight: 500; color: #1e293b; }\n.item-sub { font-size: 12px; color: #64748b; }\n\n.badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }\n.badge-blue { background: #dbeafe; color: #1e40af; }\n.badge-green { background: #dcfce7; color: #166534; }\n.badge-yellow { background: #fef9c3; color: #854d0e; }\n.badge-gray { background: #f1f5f9; color: #475569; }\n\n.btn-sm { padding: 4px 10px; border: 1px solid #e2e8f0; background: white; border-radius: 4px; font-size: 12px; cursor: pointer; }\n.ml-2 { margin-left: 8px; }\n\n/* LOADING */\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","avatarColor"]}}}},{"type":"text","position":[1,1,1,1]},{"type":"text","position":[1,1,3,1,0]},{"type":"attr","position":[1,1,3,3,1]},{"type":"if","position":[1,1,3,3,1],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[1,0]}]}},"default":{}},{"type":"text","position":[1,1,3,3,3,0]},{"type":"attr","position":[1,1,5,1]},{"type":"if","position":[1,1,5,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"attr","position":[1,1,5,3]},{"type":"if","position":[1,1,5,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]}]}},"default":{}},{"type":"text","position":[1,3,3,1,3,0]},{"type":"text","position":[1,3,3,3,3,0]},{"type":"text","position":[1,3,3,5,3,0]},{"type":"text","position":[1,3,3,7,3,0]},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{"true":{"dynamicNodes":[{"type":"text","position":[3,1]}]}},"default":{}},{"type":"attr","position":[1,3,7,1,1]},{"type":"text","position":[1,3,7,1,1,1]},{"type":"attr","position":[1,3,7,1,3]},{"type":"text","position":[1,3,7,1,3,1]},{"type":"attr","position":[1,3,7,1,5]},{"type":"text","position":[1,3,7,1,5,1]},{"type":"attr","position":[1,3,7,3]},{"type":"if","position":[1,3,7,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,3,7,5]},{"type":"if","position":[1,3,7,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]},{"type":"text","position":[1,3,3,2]},{"type":"attr","position":[1,5]},{"type":"text","position":[1,5,0]},{"type":"attr","position":[1,7]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,3,7,7]},{"type":"if","position":[1,3,7,7],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]},{"type":"text","position":[1,3,3,2]},{"type":"attr","position":[1,5]}]}]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companyId","company","contacts","deals","activities","isLoading","currentTab","canEdit","canDelete","avatarColor","initials","fullAddress"],

	data: function() {
		return {
			// ID from URL
			companyId: Lyte.attr("string", { default: "" }),

			// Data Models
			company: Lyte.attr("object", { default: {} }),
			contacts: Lyte.attr("array", { default: [] }),
			deals: Lyte.attr("array", { default: [] }),
			activities: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			currentTab: Lyte.attr("string", { default: "contacts" }), // 'contacts', 'deals', 'activities'

			// Permissions & Visuals
			canEdit: Lyte.attr("boolean", { default: false }),
			canDelete: Lyte.attr("boolean", { default: false }),
			avatarColor: Lyte.attr("string", { default: "#cbd5e1" }),
			initials: Lyte.attr("string", { default: "" }),
			fullAddress: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: function() {
		// 1. Get ID from Router Param
		// In Lyte, params are usually available via this.getData('params') or routed directly
		// Assuming standard Lyte routing where :id is passed to the component
		const params = this.getData('params'); // Check your router config if this differs

		// Fallback: Parse URL hash manually if needed
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];

		if (!id) {
			window.location.hash = "#/companies";
			return;
		}

		this.setData('companyId', id);

		// 2. Set Permissions
		this.setData('canEdit', this.hasPermission('COMPANY_UPDATE'));
		this.setData('canDelete', this.hasPermission('COMPANY_DELETE'));

		this.loadCompany();
	},

	loadCompany: function() {
		this.setData('isLoading', true);
		const id = this.getData('companyId');

		this.crmGetCompany(id)
			.then((res) => {
				// 1. Robust Extraction
				// API structure: { data: { company: {}, contacts: [], ... } }
				let data = res.data || {};

				// 2. Extract Company
				let comp = data.company || {};
				this.setData('company', comp);

				// 3. Visual Helpers
				this.setData('initials', this.getInitials(comp.name));
				this.setData('avatarColor', this.getAvatarColor(comp.name));

				// Construct Address String
				const addrParts = [comp.addressLine1, comp.addressLine2, comp.city, comp.state, comp.country, comp.postalCode];
				this.setData('fullAddress', addrParts.filter(Boolean).join(', ') || "");

				// 4. Extract Related Lists (Safe defaults)
				this.setData('contacts', data.contacts || []);
				this.setData('deals', this.normalizeDeals(data.deals || []));
				this.setData('activities', this.normalizeActivities(data.activities || []));

			})
			.catch(err => {
				console.error("View Error:", err);
				alert("Failed to load company details");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- NORMALIZATION HELPERS ---

	normalizeDeals: function(list) {
		return list.map(d => ({
			...d,
			formattedAmount: this.formatMoney(d.amount),
			statusClass: this.getStatusClass(d.status)
		}));
	},

	normalizeActivities: function(list) {
		return list.map(a => ({
			...a,
			formattedDate: this.formatJavaDate(a.createdAt),
			iconClass: (a.type || 'TASK').toUpperCase()
		}));
	},

	// --- UTILS ---
	getInitials: function(name) {
		if (!name) return "";
		return String(name).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	},

	getAvatarColor: function(name) {
		if (!name) return '#cbd5e1';
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
		let hash = 0;
		for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
		return colors[Math.abs(hash) % colors.length];
	},

	formatMoney: function(amount) {
		if (amount == null) return "$0.00";
		return "$" + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	formatJavaDate: function(dateObj) {
		if (!dateObj || !dateObj.year) return "";
		let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return shortMonths[dateObj.monthValue - 1] + " " + dateObj.dayOfMonth + ", " + dateObj.year;
	},

	getStatusClass: function(status) {
		if(!status) return "badge-gray";
		const map = { NEW: 'badge-blue', WON: 'badge-green', LOST: 'badge-red', IN_PROGRESS: 'badge-yellow' };
		return map[status] || "badge-gray";
	},

	actions: {
		switchTab: function(tabName) {
			this.setData('currentTab', tabName);
		},

		goBack: function() {
			window.location.hash = "#/companies";
		},

		editCompany: function() {
			// Implement edit route later
			// alert("Edit feature coming soon");
			window.location.hash = "#/companies/edit/:id".replace(":id", this.getData('companyId'));
		},

		deleteCompany: function() {
			if (confirm("Delete this company?")) {
				this.crmDeleteCompany(this.getData('companyId')).then((res) => {
					if (res.success) {
						alert("Company deleted");
						window.location.hash = "#/companies";
					} else {
						alert("Failed to delete: " + res.message);
					}
				});
			}
		},

		viewRelated: function(type, id) {
			window.location.hash = `#/${type}/${id}`;
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("company-list", {
_template:"<template tag-name=\"company-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Companies</h1> <template is=\"if\" value=\"{{canCreate}}\"><template case=\"true\"> <button onclick=\"{{action('createCompany')}}\" class=\"add-btn\"> <span>+ Add Company</span> </button> </template></template> </header> <div class=\"controls-bar\"> <div class=\"search-wrapper full-width\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearchInput')}}\" placeholder=\"Search companies...\" class=\"search-input\"> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading companies...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(companyList.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\"> <div class=\"empty-icon\">🏢</div> <h3>No companies found</h3> <p>Create your first company to get started</p> </div> </template><template case=\"false\"> <div class=\"companies-grid\"> <template is=\"for\" items=\"{{companyList}}\" item=\"comp\"> <div class=\"company-card\" onclick=\"{{action('viewCompany',comp.id)}}\"> <div class=\"company-avatar\" style=\"background-color: {{comp.avatarColor}}\"> {{comp.initials}} </div> <div class=\"company-info\"> <div class=\"company-name\">{{comp.name}}</div> <div class=\"company-meta\"> <template is=\"if\" value=\"{{comp.email}}\"><template case=\"true\"> <div class=\"meta-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg> <span>{{comp.email}}</span> </div> </template></template> <template is=\"if\" value=\"{{comp.phone}}\"><template case=\"true\"> <div class=\"meta-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path></svg> <span>{{comp.phone}}</span> </div> </template></template> <template is=\"if\" value=\"{{comp.industry}}\"><template case=\"true\"> <div class=\"meta-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M3 21h18\"></path><path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16\"></path></svg> <span>{{comp.industry}}</span> </div> </template></template> </div> </div> </div> </template> </div> </template></template> </template></template> </div> </template>\n<style>/* 1. LOCK THE PAGE CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh; /* Force full viewport height */\n    display: flex;\n    flex-direction: column;\n    overflow: hidden; /* Stop main page scroll */\n}\n\n/* 2. PREVENT HEADER SHRINKING */\n.page-header {\n    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;\n    flex-shrink: 0;\n}\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n.controls-bar {\n    margin-bottom: 25px;\n    flex-shrink: 0;\n}\n.search-wrapper {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 10px 12px; display: flex; align-items: center;\n}\n.search-input { border: none; outline: none; width: 100%; font-size: 14px; margin-left: 8px; }\n\n/* 3. MAKE THE GRID SCROLLABLE */\n.companies-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));\n    gap: 20px;\n\n    /* SCROLL PROPERTIES */\n    flex-grow: 1;         /* Fill remaining space */\n    overflow-y: auto;     /* Scroll internally */\n    min-height: 0;        /* Flexbox fix */\n    padding-bottom: 20px; /* Padding for bottom of scroll */\n    align-content: start; /* Keep items at top even if few */\n}\n\n/* 4. CENTER LOADING/EMPTY STATES */\n.loading-state, .empty-state {\n    flex-grow: 1; /* Fill space */\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    color: #94a3b8;\n    text-align: center;\n}\n.empty-icon { font-size: 40px; margin-bottom: 10px; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }\n\n\n/* CARD STYLES (Unchanged) */\n.company-card {\n    background: white;\n    border-radius: 8px;\n    padding: 20px;\n    display: flex;\n    gap: 15px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n    border: 1px solid #e2e8f0;\n    cursor: pointer;\n    transition: transform 0.1s, box-shadow 0.1s;\n    height: fit-content; /* Don't stretch vertically in grid */\n}\n\n.company-card:hover {\n    transform: translateY(-2px);\n    box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n    border-color: #cbd5e1;\n}\n\n.company-avatar {\n    width: 48px; height: 48px; border-radius: 8px;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-weight: bold; font-size: 18px;\n    flex-shrink: 0;\n}\n\n.company-info { flex: 1; min-width: 0; }\n.company-name { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }\n\n.company-meta { display: flex; flex-direction: column; gap: 5px; }\n.meta-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; }\n.meta-item svg { color: #94a3b8; }</style>",
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
Lyte.Component.register("contact-edit", {
_template:"<template tag-name=\"contact-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit Contact</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading contact...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Contact Information</h3> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" class=\"form-input\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Email</label> <input type=\"email\" id=\"inp_email\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Phone</label> <input type=\"text\" id=\"inp_phone\" class=\"form-input\"> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Professional Details</h3> <div class=\"form-group\"> <label>Company</label> <select id=\"sel_company\" class=\"form-select\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companies}}\" item=\"comp\"></option> </select> </div> <div class=\"form-group\"> <label>Job Title</label> <input type=\"text\" id=\"inp_job\" class=\"form-input\"> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateContact')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3,3,3,3]},{"type":"for","position":[1,1,1,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companies}}\" item=\"comp\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["contactId","contact","companies","isLoading","isSaving"],

	data: function() {
		return {
			contactId: Lyte.attr("string", { default: "" }),

			// Data Models
			contact: Lyte.attr("object", { default: {} }),
			companies: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('CONTACT_UPDATE')) {
			alert("Permission denied");
			window.location.hash = "#/contacts";
			return;
		}

		// Robust ID Parsing
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/contacts";
			return;
		}

		this.setData('contactId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('contactId');

		Promise.all([
			this.crmEditContact(id),
			this.crmGetCompanies()
		]).then((responses) => {
			const [contactRes, compRes] = responses;

			if (!contactRes.success) throw new Error(contactRes.message);

			// 1. Process Contact
			const contactData = contactRes.data || {};
			this.setData('contact', contactData);

			// 2. Process Companies
			this.setData('companies', compRes.data || []);

			// 3. Force Populate Form
			setTimeout(() => {
				this.populateForm(contactData);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load contact.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	populateForm: function(data) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};

		setVal('inp_name', data.name);
		setVal('inp_email', data.email);
		setVal('inp_phone', data.phone);
		// API returns jobTitle, sometimes mapped to designation in older UIs
		setVal('inp_job', data.jobTitle || data.designation);

		// Select Company
		const compEl = document.getElementById('sel_company');
		if (compEl && data.companyId) {
			compEl.value = data.companyId;
		}
	},

	actions: {
		updateContact: function() {
			// Direct DOM Reading
			const name = document.getElementById('inp_name').value.trim();
			if (!name) { alert("Contact Name is required"); return; }

			const companyId = document.getElementById('sel_company').value;

			this.setData('isSaving', true);

			const payload = {
				id: parseInt(this.getData('contactId')),
				name: name,
				email: document.getElementById('inp_email').value.trim(),
				phone: document.getElementById('inp_phone').value.trim(),
				jobTitle: document.getElementById('inp_job').value.trim(),
				companyId: companyId ? parseInt(companyId) : null
			};

			this.crmSaveContact(payload)
				.then((res) => {
					if (res.success) {
						alert("Contact updated successfully!");
						window.location.hash = "#/contacts/view/" + this.getData('contactId');
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Update failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/contacts/" + this.getData('contactId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("contact-create", {
_template:"<template tag-name=\"contact-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Add Contact</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading form...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Contact Information</h3> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" class=\"form-input\" placeholder=\"e.g. Jane Doe\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Email</label> <input type=\"email\" id=\"inp_email\" class=\"form-input\" placeholder=\"jane@example.com\"> </div> <div class=\"form-group half\"> <label>Phone</label> <input type=\"text\" id=\"inp_phone\" class=\"form-input\" placeholder=\"+1 555-0123\"> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Professional Details</h3> <div class=\"form-group\"> <label>Company <span class=\"required\">*</span></label> <select id=\"sel_company\" class=\"form-select\" lyte-model=\"selectedCompanyId\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companies}}\" item=\"comp\"></option> </select> </div> <div class=\"form-group\"> <label>Job Title</label> <input type=\"text\" id=\"inp_job\" class=\"form-input\" placeholder=\"e.g. Purchasing Manager\"> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createContact')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Contact</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 640px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n.form-row { display: flex; gap: 20px; margin-bottom: 20px; }\n.form-group { margin-bottom: 20px; }\n.form-group.half { flex: 1; margin-bottom: 0; }\n\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3,3,3,3]},{"type":"for","position":[1,1,1,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companies}}\" item=\"comp\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["companies","selectedCompanyId","isLoading","isSaving"],

    data: function() {
        return {
            companies: Lyte.attr("array", { default: [] }),
            selectedCompanyId: Lyte.attr("string", { default: "" }),
            
            isLoading: Lyte.attr("boolean", { default: true }),
            isSaving: Lyte.attr("boolean", { default: false })
        }
    },

    didConnect: function() {
        if (!this.hasPermission('CONTACT_CREATE')) {
            alert("Permission denied");
            window.location.hash = "#/contacts";
            return;
        }

        // Check for pre-selected company in URL
        // Example: #/contacts/create?companyId=5
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const preId = urlParams.get('companyId');
        if (preId) {
            this.setData('selectedCompanyId', preId);
        }

        this.loadCompanies();
    },

    loadCompanies: function() {
        this.setData('isLoading', true);
        
        // Reuse existing method from Company List logic
        this.crmGetCompanies()
            .then((res) => {
                const list = res.data || [];
                this.setData('companies', list);
            })
            .catch(err => {
                console.error("Companies Load Error", err);
                alert("Failed to load companies list");
            })
            .finally(() => {
                this.setData('isLoading', false);
            });
    },

    actions: {
        createContact: function() {
            // 1. Direct DOM Reading
            const name = document.getElementById('inp_name').value.trim();
            const email = document.getElementById('inp_email').value.trim();
            const phone = document.getElementById('inp_phone').value.trim();
            const jobTitle = document.getElementById('inp_job').value.trim();
            const companyId = document.getElementById('sel_company').value;

            // 2. Validation
            if (!name) {
                alert("Contact Name is required");
                return;
            }
            if (!companyId) {
                alert("Please select a Company");
                return;
            }

            this.setData('isSaving', true);

            // 3. Payload
            const payload = {
                name: name,
                email: email,
                phone: phone,
                jobTitle: jobTitle, // Maps to 'designation' in UI concept, but 'jobTitle' in API
                companyId: parseInt(companyId)
            };

            this.crmSaveContact(payload)
                .then((res) => {
                    if (res.success) {
                        alert("Contact created successfully!");
                        window.location.hash = "#/contacts";
                    } else {
                        alert("Error: " + (res.message || "Creation failed"));
                    }
                })
                .catch(err => {
                    alert("Submission error: " + err.message);
                })
                .finally(() => {
                    this.setData('isSaving', false);
                });
        },

        cancel: function() {
            window.location.hash = "#/contacts";
        }
    }
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
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
			window.location.hash = "contacts/edit/:id".replace(":id", this.getData('contactId'));
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
Lyte.Component.register("crm-app", {
_template:"<template tag-name=\"crm-app\"> <div class=\"app-container\" style=\"display: flex; height: 100vh; overflow: hidden;\"> <crm-sidebar></crm-sidebar> <div class=\"main-content\" style=\"flex-grow: 1; overflow-y: auto; background-color: #f4f7f6; position: relative;\"> <div id=\"crm_inner_outlet\"></div> </div> </div> </template>\n<style>/* ========================================\n   APP CONTAINER\n   ======================================== */\n.app-container {\n    display: flex;\n    min-height: 100vh;\n    width: 100%;\n    overflow: hidden; /* Prevent double scrollbars */\n}\n\n/* ========================================\n   SIDEBAR (The Component Wrapper)\n   ======================================== */\n/* This targets the <crm-sidebar> tag directly */\ncrm-sidebar.sidebar {\n    width: 260px;\n    height: 100vh;\n    background-color: #ffffff;\n    border-right: 1px solid #e2e8f0;\n    flex-shrink: 0;\n    transition: width 0.3s ease;\n    display: flex;\n    flex-direction: column;\n}\n\n/* Inner wrapper styles */\n.sidebar-inner {\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    width: 100%;\n}\n\n/* Collapse Logic */\ncrm-sidebar.sidebar.collapsed {\n    width: 80px;\n}\n\n/* ========================================\n   MAIN CONTENT\n   ======================================== */\n.main-content {\n    flex: 1;\n    /* Removed margin-left because Flexbox handles the positioning automatically now */\n    height: 100vh;\n    overflow-y: auto;\n    background-color: #f8fafc;\n    padding: 0; /* Let children handle padding */\n}</style>",
_dynamicNodes : [{"type":"componentDynamic","position":[1,1]}],

	// mixins: ["auth-mixin"],

	beforeModel: function(transition) {
		// 1. Security Check
		if (!this.isAuthenticated()) {
			Lyte.Router.transitionTo('login-comp');
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
Lyte.Component.register("deal-edit", {
_template:"<template tag-name=\"deal-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit Deal</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading deal...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Deal Details</h3> <div class=\"form-group\"> <label>Deal Title <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_title\" class=\"form-input\"> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Amount ($) <span class=\"required\">*</span></label> <input type=\"number\" id=\"inp_amount\" class=\"form-input\" step=\"0.01\"> </div> <div class=\"form-group half\"> <label>Order Type</label> <select id=\"sel_type\" class=\"form-select\"> <option is=\"for\" lyte-for=\"true\" items=\"{{orderTypes}}\" item=\"type\"></option> </select> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Ownership</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Company <span class=\"required\">*</span></label> <select id=\"sel_company\" class=\"form-select\" onchange=\"{{action('onCompanyChange',event)}}\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companies}}\" item=\"comp\"></option> </select> </div> <div class=\"form-group half\"> <label>Assigned User <span class=\"required\">*</span></label> <select id=\"sel_user\" class=\"form-select\"> <option is=\"for\" lyte-for=\"true\" items=\"{{users}}\" item=\"u\"></option> </select> </div> </div> <div class=\"form-group\"> <label>Contacts <span class=\"hint\">(Select company to view)</span></label> <div class=\"contacts-box\"> <template is=\"if\" value=\"{{expHandlers(filteredContacts.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-msg\">No contacts found for this company.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{filteredContacts}}\" item=\"c\"> <label class=\"contact-row\"> <input type=\"checkbox\" checked=\"{{c.isSelected}}\" onchange=\"{{action('toggleContact',c.id,event)}}\"> <div class=\"contact-text\"> <div class=\"c-name\">{{c.name}}</div> <div class=\"c-job\">{{c.jobTitle}}</div> </div> </label> </template> </template></template> </div> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateDeal')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1,5,3,3,1]},{"type":"for","position":[1,1,1,1,5,3,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{orderTypes}}\" item=\"type\"> <option value=\"{{type}}\">{{type}}</option> </template>"},{"type":"attr","position":[1,1,1,3,3,1,3]},{"type":"attr","position":[1,1,1,3,3,1,3,3]},{"type":"for","position":[1,1,1,3,3,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companies}}\" item=\"comp\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"attr","position":[1,1,1,3,3,3,3,1]},{"type":"for","position":[1,1,1,3,3,3,3,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]},{"type":"text","position":[1,2]}],"actualTemplate":"<template is=\"for\" items=\"{{users}}\" item=\"u\"> <option value=\"{{u.id}}\">{{u.fullName}} ({{u.roleName}})</option> </template>"},{"type":"attr","position":[1,1,1,3,5,3,1]},{"type":"if","position":[1,1,1,3,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]}]}]}},"default":{}},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["dealId","deal","companies","users","orderTypes","allContacts","filteredContacts","selectedContactIds","isLoading","isSaving"],

	data: function() {
		return {
			dealId: Lyte.attr("string", { default: "" }),

			// Data Models
			deal: Lyte.attr("object", { default: {} }),
			companies: Lyte.attr("array", { default: [] }),
			users: Lyte.attr("array", { default: [] }),
			orderTypes: Lyte.attr("array", { default: [] }),
			allContacts: Lyte.attr("array", { default: [] }),

			// Filtered Contacts Logic
			filteredContacts: Lyte.attr("array", { default: [] }),
			selectedContactIds: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('DEAL_UPDATE')) {
			alert("Permission denied");
			window.location.hash = "#/deals";
			return;
		}

		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/deals";
			return;
		}

		this.setData('dealId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('dealId');

		// Parallel Fetch: Deal Details + Metadata + All Contacts (for client-side filtering)
		Promise.all([
			this.crmEditDeal(id),
			this.crmGetContacts({}) // Fetch all contacts to filter manually
		]).then((responses) => {
			const [dealRes, contactRes] = responses;

			if (!dealRes.success) throw new Error(dealRes.message);

			const data = dealRes.data || {};
			const deal = data.deal || {};

			// 1. Set Base Data
			this.setData('deal', deal);
			this.setData('companies', data.companies || []);
			this.setData('users', data.users || []);
			this.setData('orderTypes', data.orderTypes || []);

			// 2. Set Contacts Data
			let contacts = [];
			if (contactRes.success) {
				contacts = Array.isArray(contactRes.data) ? contactRes.data : (contactRes.data.data || []);
			}
			this.setData('allContacts', contacts);

			// 3. Set Selected Contacts from Deal
			// deal.contactIds comes from API
			this.setData('selectedContactIds', deal.contactIds || []);

			// 4. Force Populate Form
			setTimeout(() => {
				this.populateForm(deal);
				// Trigger contact filtering based on the initial company
				this.filterContacts(deal.companyId);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load deal.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	populateForm: function(deal) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};

		setVal('inp_title', deal.title);
		setVal('inp_amount', deal.amount);
		setVal('sel_type', deal.orderType);

		const compEl = document.getElementById('sel_company');
		if (compEl) compEl.value = deal.companyId;

		const userEl = document.getElementById('sel_user');
		if (userEl) userEl.value = deal.assignedUserId;
	},

	filterContacts: function(companyId) {
		if (!companyId) {
			this.setData('filteredContacts', []);
			return;
		}

		const all = this.getData('allContacts');
		const selected = this.getData('selectedContactIds') || [];

		const relevant = all
			.filter(c => String(c.companyId) === String(companyId))
			.map(c => ({
				...c,
				// Add explicit property for template binding
				isSelected: selected.includes(c.id)
			}));

		this.setData('filteredContacts', relevant);
	},

	actions: {
		onCompanyChange: function(event) {
			const compId = event.target.value;
			// Clear contacts when company changes
			this.setData('selectedContactIds', []);
			this.filterContacts(compId);
		},

		toggleContact: function(contactId, event) {
			let selected = this.getData('selectedContactIds') || [];
			// Ensure ID type consistency
			const id = typeof contactId === 'string' ? parseInt(contactId) : contactId;

			if (event.target.checked) {
				if(!selected.includes(id)) selected.push(id);
			} else {
				selected = selected.filter(x => x !== id);
			}
			this.setData('selectedContactIds', selected);
		},

		updateDeal: function() {
			// Direct DOM Reading
			const title = document.getElementById('inp_title').value.trim();
			const amount = document.getElementById('inp_amount').value;
			const compId = document.getElementById('sel_company').value;
			const userId = document.getElementById('sel_user').value;
			const type = document.getElementById('sel_type').value;

			if (!title) { alert("Deal Title is required"); return; }
			if (!compId) { alert("Company is required"); return; }

			this.setData('isSaving', true);

			const payload = {
				id: parseInt(this.getData('dealId')),
				title: title,
				amount: parseFloat(amount),
				orderType: type,
				companyId: parseInt(compId),
				assignedUserId: parseInt(userId),
				contactIds: this.getData('selectedContactIds')
			};

			this.crmSaveDeal(payload)
				.then((res) => {
					if (res.success) {
						alert("Deal updated successfully!");
						window.location.hash = "#/deals/view/" + this.getData('dealId');
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Update failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/deals/" + this.getData('dealId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
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
		editDeal: function () {
				window.location.hash = "/deals/edit/:id".replace(":id", this.getData('dealId'));
			},
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
_template:"<template tag-name=\"login-comp\"> <div class=\"login-wrapper\" style=\"display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f7f6;\"> <div class=\"card form-container\" style=\"width: 100%; max-width: 400px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\"> <div class=\"card-body\"> <h2 class=\"form-title\" style=\"text-align: center; margin-bottom: 2rem; color: #333;\">Login</h2> <template is=\"if\" value=\"{{error}}\"> <div class=\"alert alert-error\" style=\"background-color: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 1rem;\">{{error}}</div> </template> <div class=\"form-group\" style=\"margin-bottom: 1rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Username</label> <input type=\"text\" lyte-model=\"username\" class=\"form-input\" placeholder=\"Username\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-group\" style=\"margin-bottom: 1.5rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Password</label> <input type=\"password\" lyte-model=\"password\" class=\"form-input\" placeholder=\"Password\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-actions\"> <button class=\"btn btn-primary\" onclick=\"{{action('login')}}\" disabled=\"{{isLoading}}\" style=\"width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;\"> <template is=\"if\" value=\"{{isLoading}}\">Loading...</template> <template is=\"else\">Login</template> </button> </div> </div> </div> </div> </template>\n<style>/* Wrapper to hold the gradient background only for this page */\n.login-wrapper {\n    min-height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    padding: 20px;\n    width: 100%;\n}\n\n.login-container { width: 100%; max-width: 420px; }\n\n.login-card {\n    background: #ffffff; border-radius: 16px;\n    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); overflow: hidden;\n}\n\n.login-header { padding: 40px 40px 24px; text-align: center; }\n.logo {\n    width: 64px; height: 64px;\n    background: linear-gradient(135deg, #2563eb 0%, #4285f4 100%);\n    border-radius: 16px; display: flex; align-items: center; justify-content: center;\n    margin: 0 auto 20px; color: white; font-weight: bold; font-size: 24px;\n}\n.login-title { font-size: 24px; font-weight: 700; color: #202124; margin-bottom: 8px; margin-top: 0; }\n.login-subtitle { font-size: 14px; color: #5f6368; margin: 0; }\n\n.login-body { padding: 0 40px 40px; }\n.form-group { margin-bottom: 20px; }\n.form-label { display: block; font-size: 13px; font-weight: 500; color: #202124; margin-bottom: 8px; }\n\n.form-input-wrapper { position: relative; }\n.form-input {\n    width: 100%; height: 48px; padding: 0 16px;\n    border: 1px solid #dadce0; border-radius: 8px; font-size: 15px;\n    color: #202124; background-color: #ffffff;\n    box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s;\n}\n.form-input:focus { outline: none; border-color: #1a73e8; box-shadow: 0 0 0 3px #e8f0fe; }\n\n.password-toggle {\n    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);\n    background: none; border: none; cursor: pointer; color: #80868b; padding: 4px;\n}\n.password-toggle:hover { color: #202124; }\n\n.remember-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }\n.remember-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #5f6368; }\n\n.btn-login {\n    width: 100%; height: 48px; background: #1a73e8; color: white;\n    border: none; border-radius: 8px; font-size: 15px; font-weight: 600;\n    cursor: pointer; transition: background-color 0.2s;\n    display: flex; align-items: center; justify-content: center; gap: 8px;\n}\n.btn-login:hover { background: #1557b0; }\n.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }\n\n.spinner {\n    width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3);\n    border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;\n}\n@keyframes spin { to { transform: rotate(360deg); } }\n\n.login-alert {\n    padding: 12px 16px; margin-bottom: 20px; border-radius: 8px; font-size: 13px;\n}\n.login-alert.error { background-color: #fce8e6; color: #d93025; border: 1px solid #f5c6cb; }\n\n.login-footer {\n    padding: 20px 40px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #dadce0;\n}\n.login-footer p { font-size: 12px; color: #80868b; margin: 0; }\n\n@keyframes shake {\n    0%, 100% { transform: translateX(0); }\n    25% { transform: translateX(-8px); }\n    75% { transform: translateX(8px); }\n}\n.shake { animation: shake 0.3s ease-in-out; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,3]},{"type":"if","position":[1,1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,1,1,9,1]},{"type":"attr","position":[1,1,1,9,1,1]},{"type":"if","position":[1,1,1,9,1,1],"cases":{},"default":{}}],
_observedAttributes :["username","password","error","isLoading"],

        data : function(){
            return {
                username : Lyte.attr("string", { default: "ceo" }),
                password : Lyte.attr("string", { default: "password" }),
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
Lyte.Component.register("profile-create", {
_template:"<template tag-name=\"profile-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Create Profile</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading permissions...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Profile Information</h3> <div class=\"form-group\"> <label>Profile Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" lyte-model=\"profileName\" class=\"form-input\" placeholder=\"e.g. Sales Manager\"> </div> <div class=\"form-group\"> <label>Description</label> <textarea id=\"inp_desc\" lyte-model=\"description\" class=\"form-textarea\" rows=\"3\" placeholder=\"Describe the role...\"></textarea> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Permissions</h3> <p class=\"section-subtitle\">Select the access levels for this profile.</p> <div class=\"permissions-list\"> <template is=\"for\" items=\"{{permissionGroups}}\" item=\"group\"> <div class=\"permission-group\" data-group-key=\"{{group.key}}\"> <div class=\"group-header\"> <div class=\"group-title\"> <div class=\"group-icon {{group.class}}\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg> </div> {{group.title}} </div> <button type=\"button\" class=\"btn-text-sm\" onclick=\"{{action('toggleGroup',group.key)}}\">Select All</button> </div> <div class=\"group-items\"> <template is=\"for\" items=\"{{group.list}}\" item=\"p\"> <label class=\"perm-checkbox\"> <input type=\"checkbox\" onchange=\"{{action('togglePermission',p.id,event)}}\"> <span>{{p.label}}</span> </label> </template> </div> </div> </template> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createProfile')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create Profile</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 800px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n.section-subtitle { font-size: 13px; color: #64748b; margin: -5px 0 15px 0; }\n\n.form-group { margin-bottom: 20px; }\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-textarea {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n/* PERMISSION GROUPS */\n.permission-group {\n    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;\n    padding: 16px; margin-bottom: 16px;\n}\n.group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }\n.group-title { font-size: 14px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 8px; }\n\n.group-icon { width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }\n/* Colors matching view page */\n.group-icon.company { background: #dbeafe; color: #1e40af; }\n.group-icon.contact { background: #f3e8ff; color: #7c3aed; }\n.group-icon.deal { background: #dcfce7; color: #166534; }\n.group-icon.activity { background: #fef3c7; color: #854d0e; }\n.group-icon.user { background: #fce7f3; color: #db2777; }\n.group-icon.other { background: #f1f5f9; color: #475569; }\n\n.btn-text-sm { background: none; border: none; color: #2563eb; font-size: 12px; cursor: pointer; font-weight: 500; }\n.btn-text-sm:hover { text-decoration: underline; }\n\n.group-items {\n    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n    gap: 10px;\n}\n.perm-checkbox {\n    display: flex; align-items: center; gap: 8px; padding: 8px;\n    background: white; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer; transition: all 0.2s;\n}\n.perm-checkbox:hover { border-color: #cbd5e1; }\n.perm-checkbox span { font-size: 13px; color: #334155; }\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3,5,1]},{"type":"for","position":[1,1,1,3,5,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1,1,1]},{"type":"text","position":[1,1,1,3]},{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,3,1]},{"type":"for","position":[1,3,1],"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"text","position":[1,3,0]}]}]},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["allPermissions","permissionGroups","selectedPermissionIds","profileName","description","isLoading","isSaving"],

	data: function() {
		return {
			// Data
			allPermissions: Lyte.attr("array", { default: [] }),
			permissionGroups: Lyte.attr("array", { default: [] }),
			selectedPermissionIds: Lyte.attr("array", { default: [] }), // IDs of selected perms

			// Form Data (Bound)
			profileName: Lyte.attr("string", { default: "" }),
			description: Lyte.attr("string", { default: "" }),

			// State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/profiles";
			return;
		}
		this.loadPermissions();
	},

	loadPermissions: function() {
		this.setData('isLoading', true);

		// Assume apiRequest to permission.action returns list of { id, permissionCode, ... }
		this.crmGetPermissions()
			.then((res) => {
				const list = res.data || [];
				this.setData('allPermissions', list);
				this.groupPermissions(list);
			})
			.catch(err => {
				console.error("Perms Load Error", err);
				alert("Failed to load permissions");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	groupPermissions: function(perms) {
		const defs = {
			'COMPANY': { title: 'Company', icon: 'company', class: 'company' },
			'CONTACT': { title: 'Contact', icon: 'contact', class: 'contact' },
			'DEAL': { title: 'Deal', icon: 'deal', class: 'deal' },
			'ACTIVITY': { title: 'Activity', icon: 'activity', class: 'activity' },
			'USER': { title: 'Administration', icon: 'user', class: 'user' }
		};

		let groups = {};
		let other = [];

		perms.forEach(p => {
			const code = p.permissionCode;
			const prefix = code.split('_')[0];

			// Normalize Object
			const item = {
				id: p.id,
				code: code,
				label: this.formatPerm(code),
				checked: false
			};

			if (defs[prefix]) {
				if (!groups[prefix]) {
					groups[prefix] = { ...defs[prefix], key: prefix, list: [] };
				}
				groups[prefix].list.push(item);
			} else {
				other.push(item);
			}
		});

		let result = Object.values(groups);
		if (other.length > 0) {
			result.push({
				title: 'Other',
				icon: 'other',
				class: 'other',
				key: 'OTHER',
				list: other
			});
		}

		this.setData('permissionGroups', result);
	},

	formatPerm: function(code) {
		if (!code) return "";
		return code.split('_').slice(1).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
	},

	actions: {
		togglePermission: function(permId, event) {
			let selected = this.getData('selectedPermissionIds') || [];
			// Ensure ID is number
			const id = parseInt(permId);

			if (event.target.checked) {
				if (!selected.includes(id)) selected.push(id);
			} else {
				selected = selected.filter(x => x !== id);
			}
			this.setData('selectedPermissionIds', selected);
		},

		toggleGroup: function(groupKey) {
			// Find the group in data
			const groups = this.getData('permissionGroups');
			const targetGroup = groups.find(g => g.key === groupKey);

			if (!targetGroup) return;

			let selected = this.getData('selectedPermissionIds') || [];

			// Check if all are currently selected to decide toggle direction
			const allIds = targetGroup.list.map(p => p.id);
			const allSelected = allIds.every(id => selected.includes(id));

			if (allSelected) {
				// Deselect All
				selected = selected.filter(id => !allIds.includes(id));
				// Update UI state manually (since checkboxes are not strictly two-way bound here)
				this.uncheckGroupDOM(groupKey);
			} else {
				// Select All
				allIds.forEach(id => {
					if (!selected.includes(id)) selected.push(id);
				});
				this.checkGroupDOM(groupKey);
			}

			this.setData('selectedPermissionIds', selected);
		},

		createProfile: function() {
			// 1. Direct DOM Reading for Safety
			const nameInput = document.getElementById('inp_name');
			const descInput = document.getElementById('inp_desc');

			const rawName = nameInput ? nameInput.value : "";
			const rawDesc = descInput ? descInput.value : "";
			const permIds = this.getData('selectedPermissionIds');

			// 2. Validation
			if (!rawName || rawName.trim() === "") {
				alert("Profile Name is required");
				return;
			}

			this.setData('isSaving', true);

			// 3. Payload
			const payload = {
				name: rawName.trim(),
				description: rawDesc.trim(),
				permissionIds: permIds
			};

			this.crmCreateProfile(payload)
				.then((res) => {
					if (res.success) {
						alert("Profile created successfully!");
						window.location.hash = "#/profiles";
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Submission failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/profiles";
		}
	},

	// Helpers to update checkbox DOM visually during "Select All"
	checkGroupDOM: function(key) {
		const groupDiv = this.$node.querySelector(`[data-group-key="${key}"]`);
		if(groupDiv) {
			groupDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
		}
	},
	uncheckGroupDOM: function(key) {
		const groupDiv = this.$node.querySelector(`[data-group-key="${key}"]`);
		if(groupDiv) {
			groupDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
		}
	}

}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("profile-edit", {
_template:"<template tag-name=\"profile-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit Profile</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading profile...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Profile Information</h3> <div class=\"form-group\"> <label>Profile Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_name\" class=\"form-input\"> </div> <div class=\"form-group\"> <label>Description</label> <textarea id=\"inp_desc\" class=\"form-textarea\" rows=\"3\"></textarea> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Permissions</h3> <p class=\"section-subtitle\">Select the access levels for this profile.</p> <div class=\"permissions-list\"> <template is=\"for\" items=\"{{permissionGroups}}\" item=\"group\"> <div class=\"permission-group\" data-group-key=\"{{group.key}}\"> <div class=\"group-header\"> <div class=\"group-title\"> <div class=\"group-icon {{group.class}}\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg> </div> {{group.title}} </div> <button type=\"button\" class=\"btn-text-sm\" onclick=\"{{action('toggleGroup',group.key)}}\">Select All</button> </div> <div class=\"group-items\"> <template is=\"for\" items=\"{{group.list}}\" item=\"p\"> <label class=\"perm-checkbox\"> <input type=\"checkbox\" checked=\"{{p.isChecked}}\" onchange=\"{{action('togglePermission',p.id,event)}}\"> <span>{{p.label}}</span> </label> </template> </div> </div> </template> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateProfile')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,3,5,1]},{"type":"for","position":[1,1,1,3,5,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"attr","position":[1,1,1,1]},{"type":"text","position":[1,1,1,3]},{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,3,1]},{"type":"for","position":[1,3,1],"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"text","position":[1,3,0]}]}]},{"type":"attr","position":[1,1,1,5,1]},{"type":"attr","position":[1,1,1,5,3]},{"type":"attr","position":[1,1,1,5,3,1]},{"type":"if","position":[1,1,1,5,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["profileId","profile","permissionGroups","selectedPermissionIds","isLoading","isSaving"],

	data: function() {
		return {
			profileId: Lyte.attr("string", { default: "" }),

			// Data
			profile: Lyte.attr("object", { default: {} }),
			permissionGroups: Lyte.attr("array", { default: [] }),
			selectedPermissionIds: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/profiles";
			return;
		}

		// Robust ID Parsing
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/profiles";
			return;
		}

		this.setData('profileId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('profileId');

		// Parallel Fetch: Profile + All Permissions
		Promise.all([
			this.crmGetProfile(id),
			this.crmGetPermissions()
		]).then((responses) => {
			const [profRes, permRes] = responses;

			if (!profRes.success) throw new Error(profRes.message);

			// 1. Process Profile
			const profile = profRes.data || {};
			this.setData('profile', profile);

			// 2. Process Permissions & Pre-selection
			const allPerms = permRes.data || [];

			// Profile has list of codes ["DEAL_READ", ...]. Need to find matching IDs.
			const currentCodes = profile.permissions || [];
			const preSelected = [];

			allPerms.forEach(p => {
				if (currentCodes.includes(p.permissionCode)) {
					preSelected.push(p.id);
				}
			});
			this.setData('selectedPermissionIds', preSelected);

			// Group them for UI (Reusing logic from Create)
			this.groupPermissions(allPerms);

			// 3. Force Populate Text Inputs
			setTimeout(() => {
				this.populateForm(profile);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load profile data.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	populateForm: function(data) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};
		setVal('inp_name', data.name);
		setVal('inp_desc', data.description);
	},

	groupPermissions: function(perms) {
		const defs = {
			'COMPANY': { title: 'Company', icon: 'company', class: 'company' },
			'CONTACT': { title: 'Contact', icon: 'contact', class: 'contact' },
			'DEAL': { title: 'Deal', icon: 'deal', class: 'deal' },
			'ACTIVITY': { title: 'Activity', icon: 'activity', class: 'activity' },
			'USER': { title: 'Administration', icon: 'user', class: 'user' }
		};

		let groups = {};
		let other = [];
		const selected = this.getData('selectedPermissionIds');

		perms.forEach(p => {
			const code = p.permissionCode;
			const prefix = code.split('_')[0];

			const item = {
				id: p.id,
				code: code,
				label: this.formatPerm(code),
				// Add checked state for template
				isChecked: selected.includes(p.id)
			};

			if (defs[prefix]) {
				if (!groups[prefix]) {
					groups[prefix] = { ...defs[prefix], key: prefix, list: [] };
				}
				groups[prefix].list.push(item);
			} else {
				other.push(item);
			}
		});

		let result = Object.values(groups);
		if (other.length > 0) {
			result.push({
				title: 'Other',
				icon: 'other',
				class: 'other',
				key: 'OTHER',
				list: other
			});
		}

		this.setData('permissionGroups', result);
	},

	formatPerm: function(code) {
		if (!code) return "";
		return code.split('_').slice(1).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
	},

	actions: {
		togglePermission: function(permId, event) {
			let selected = this.getData('selectedPermissionIds') || [];
			const id = parseInt(permId);

			if (event.target.checked) {
				if (!selected.includes(id)) selected.push(id);
			} else {
				selected = selected.filter(x => x !== id);
			}
			this.setData('selectedPermissionIds', selected);
		},

		toggleGroup: function(groupKey) {
			const groups = this.getData('permissionGroups');
			const targetGroup = groups.find(g => g.key === groupKey);
			if (!targetGroup) return;

			let selected = this.getData('selectedPermissionIds') || [];
			const allIds = targetGroup.list.map(p => p.id);
			const allSelected = allIds.every(id => selected.includes(id));

			if (allSelected) {
				// Deselect All
				selected = selected.filter(id => !allIds.includes(id));
				this.uncheckGroupDOM(groupKey);
			} else {
				// Select All
				allIds.forEach(id => {
					if (!selected.includes(id)) selected.push(id);
				});
				this.checkGroupDOM(groupKey);
			}
			this.setData('selectedPermissionIds', selected);
		},

		updateProfile: function() {
			const name = document.getElementById('inp_name').value.trim();
			const desc = document.getElementById('inp_desc').value.trim();

			// 1. Get raw array from Lyte data
			const rawPerms = this.getData('selectedPermissionIds');

			if (!name) { alert("Profile Name is required"); return; }

			this.setData('isSaving', true);

			// 2. Ensure permissions are clean numbers (or strings that are valid numbers)
			// Struts2 needs: permissionIds=1, permissionIds=2
			// Our api-mixin handles arrays correctly, so we just need to ensure 'rawPerms' is a simple array

			// Convert to array if it's a Set (though Lyte uses arrays usually)
			const permissionIdsArray = Array.isArray(rawPerms) ? rawPerms : Array.from(rawPerms);

			const payload = {
				id: parseInt(this.getData('profileId')),
				name: name,
				description: desc,
				// Pass the CLEAN array. The updated api-mixin will loop this
				// and append 'permissionIds=1&permissionIds=2...' which is correct.
				permissionIds: permissionIdsArray
			};

			this.crmUpdateProfile(payload)
				.then((res) => {
					if (res.success) {
						alert("Profile updated successfully!");
						window.location.hash = "#/profiles/view/" + this.getData('profileId');
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Update failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/profiles/" + this.getData('profileId');
		}
	},

	// UI Helpers
	checkGroupDOM: function(key) {
		const groupDiv = this.$node.querySelector(`[data-group-key="${key}"]`);
		if(groupDiv) groupDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
	},
	uncheckGroupDOM: function(key) {
		const groupDiv = this.$node.querySelector(`[data-group-key="${key}"]`);
		if(groupDiv) groupDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
	}

}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("profile-list", {
_template:"<template tag-name=\"profile-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Profiles</h1> <template is=\"if\" value=\"{{canManage}}\"><template case=\"true\"> <button onclick=\"{{action('createProfile')}}\" class=\"add-btn\"> <span>+ Create Profile</span> </button> </template></template> </header> <div class=\"info-banner\"> <div class=\"banner-icon\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg> </div> <div class=\"banner-content\"> <p class=\"banner-title\">What are Profiles?</p> <p class=\"banner-text\">Profiles define what features users can access. Assign a profile to a user to grant them permissions.</p> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading profiles...</p> </div> </template><template case=\"false\"> <template is=\"if\" value=\"{{expHandlers(profiles.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No profiles found.</div> </template><template case=\"false\"> <div class=\"profiles-grid\"> <template is=\"for\" items=\"{{profiles}}\" item=\"profile\"> <div class=\"profile-card\"> <div class=\"card-header\"> <div class=\"profile-icon\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><line x1=\"19\" y1=\"8\" x2=\"19\" y2=\"14\"></line><line x1=\"22\" y1=\"11\" x2=\"16\" y2=\"11\"></line></svg> </div> <div class=\"dropdown-wrapper\"> <button class=\"btn-icon-dots\" onclick=\"{{action('toggleDropdown',profile.id,event)}}\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"12\" cy=\"5\" r=\"1\"></circle><circle cx=\"12\" cy=\"19\" r=\"1\"></circle></svg> </button> <template is=\"if\" value=\"{{expHandlers(openDropdownId,'==',profile.id)}}\"><template case=\"true\"> <div class=\"dropdown-menu\"> <a onclick=\"{{action('viewProfile',profile.id)}}\" class=\"menu-item\">View Details</a> <a onclick=\"{{action('editProfile',profile.id)}}\" class=\"menu-item\">Edit Profile</a> <div class=\"divider\"></div> <a onclick=\"{{action('deleteProfile',profile.id,profile.name)}}\" class=\"menu-item text-danger\">Delete</a> </div> </template></template> </div> </div> <h3 class=\"profile-name\">{{profile.name}}</h3> <p class=\"profile-desc\">{{profile.description}}</p> <div class=\"perm-count\">{{profile.totalCount}} permission(s)</div> <template is=\"if\" value=\"{{expHandlers(profile.totalCount,'>',0)}}\"><template case=\"true\"> <div class=\"perm-section\"> <div class=\"perm-label\">Permissions</div> <div class=\"tags-container\"> <template is=\"for\" items=\"{{profile.visiblePermissions}}\" item=\"perm\"> <span class=\"tag\">{{perm}}</span> </template> <template is=\"if\" value=\"{{expHandlers(profile.remainingCount,'>',0)}}\"><template case=\"true\"> <span class=\"tag more\">+{{profile.remainingCount}} more</span> </template></template> </div> </div> </template></template> <div class=\"card-footer\"> <button onclick=\"{{action('viewProfile',profile.id)}}\" class=\"btn-sm\">View</button> <button onclick=\"{{action('editProfile',profile.id)}}\" class=\"btn-sm ghost\">Edit</button> </div> </div> </template> </div> </template></template> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n/* INFO BANNER */\n.info-banner {\n    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);\n    border: 1px solid #bae6fd; border-radius: 8px;\n    padding: 15px; display: flex; gap: 15px; margin-bottom: 25px; flex-shrink: 0;\n}\n.banner-icon { color: #0284c7; }\n.banner-title { font-weight: bold; color: #0369a1; font-size: 14px; margin: 0 0 4px 0; }\n.banner-text { color: #475569; font-size: 13px; margin: 0; }\n\n/* GRID */\n.profiles-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));\n    gap: 20px;\n\n    /* Scroll Logic */\n    flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 20px;\n}\n\n/* CARD */\n.profile-card {\n    background: white; border-radius: 8px; padding: 20px;\n    border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\n    display: flex; flex-direction: column;\n}\n.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }\n\n.profile-icon {\n    width: 48px; height: 48px; border-radius: 8px;\n    background: #dbeafe; color: #2563eb;\n    display: flex; align-items: center; justify-content: center;\n}\n\n.profile-name { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 5px 0; }\n.profile-desc { font-size: 13px; color: #64748b; margin: 0 0 15px 0; line-height: 1.4; flex-grow: 1; }\n.perm-count { font-size: 12px; color: #94a3b8; margin-bottom: 15px; }\n\n/* PERMISSIONS TAGS */\n.perm-section { margin-top: auto; border-top: 1px solid #f1f5f9; padding-top: 15px; }\n.perm-label { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #94a3b8; margin-bottom: 8px; }\n.tags-container { display: flex; flex-wrap: wrap; gap: 6px; }\n\n.tag {\n    font-size: 11px; padding: 4px 8px; border-radius: 4px;\n    background: #f1f5f9; color: #475569;\n}\n.tag.more { background: #dbeafe; color: #1e40af; font-weight: 600; }\n\n/* FOOTER & BUTTONS */\n.card-footer { margin-top: 20px; display: flex; gap: 10px; }\n.btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 4px; cursor: pointer; border: none; background: #2563eb; color: white; }\n.btn-sm.ghost { background: white; border: 1px solid #cbd5e1; color: #475569; }\n\n/* DROPDOWN */\n.dropdown-wrapper { position: relative; }\n.btn-icon-dots { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 5px; }\n.btn-icon-dots:hover { color: #1e293b; background: #f1f5f9; border-radius: 50%; }\n\n.dropdown-menu {\n    position: absolute; right: 0; top: 30px;\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\n    min-width: 140px; z-index: 10;\n}\n.menu-item {\n    display: block; padding: 8px 12px; font-size: 13px; color: #334155;\n    cursor: pointer; text-decoration: none;\n}\n.menu-item:hover { background: #f8fafc; }\n.menu-item.text-danger { color: #ef4444; }\n.menu-item.text-danger:hover { background: #fef2f2; }\n.divider { height: 1px; background: #e2e8f0; margin: 4px 0; }\n\n.loading-state, .empty-state { text-align: center; color: #94a3b8; padding: 40px; margin: auto; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
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
Lyte.Component.register("profile-view", {
_template:"<template tag-name=\"profile-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Profile Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading permissions...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"profile-header-card\"> <div class=\"profile-icon\"> <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle><line x1=\"19\" y1=\"8\" x2=\"19\" y2=\"14\"></line><line x1=\"22\" y1=\"11\" x2=\"16\" y2=\"11\"></line></svg> </div> <div class=\"profile-info\"> <h2>{{profile.name}}</h2> <div class=\"desc\">{{profile.description}}</div> <div class=\"meta\">{{totalCount}} permissions assigned</div> </div> <div class=\"profile-actions\"> <button onclick=\"{{action('editProfile')}}\" class=\"btn-primary\">Edit Profile</button> <button onclick=\"{{action('deleteProfile')}}\" class=\"btn-danger-ghost\">Delete</button> </div> </div> <div class=\"profile-body\"> <h3 class=\"section-title\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"mr-2\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> Permissions </h3> <template is=\"if\" value=\"{{expHandlers(totalCount,'===',0)}}\"><template case=\"true\"> <div class=\"empty-perms\"> <p>No permissions assigned.</p> <button onclick=\"{{action('editProfile')}}\" class=\"btn-sm\">Add Permissions</button> </div> </template><template case=\"false\"> <div class=\"permissions-grid\"> <template is=\"for\" items=\"{{permissionGroups}}\" item=\"group\"> <div class=\"permission-group\"> <div class=\"group-title\"> <div class=\"group-icon {{group.class}}\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle></svg> </div> {{group.title}} </div> <div class=\"group-list\"> <template is=\"for\" items=\"{{group.list}}\" item=\"p\"> <div class=\"perm-item\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"check\"><polyline points=\"20 6 9 17 4 12\"></polyline></svg> {{p}} </div> </template> </div> </div> </template> </div> </template></template> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.profile-header-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 24px; display: flex; align-items: center; gap: 24px;\n    margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n}\n.profile-icon {\n    width: 72px; height: 72px; border-radius: 12px;\n    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);\n    display: flex; align-items: center; justify-content: center;\n    color: white; flex-shrink: 0;\n}\n.profile-info h2 { margin: 0 0 4px 0; font-size: 24px; color: #1e293b; }\n.desc { font-size: 14px; color: #64748b; margin-bottom: 8px; }\n.meta { font-size: 13px; color: #94a3b8; }\n.profile-actions { margin-left: auto; display: flex; gap: 10px; }\n\n.btn-primary { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; font-weight: 500; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* BODY */\n.profile-body { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }\n.section-title {\n    font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 20px;\n    display: flex; align-items: center;\n}\n.mr-2 { margin-right: 8px; }\n\n/* PERMISSION GRID */\n.permissions-grid {\n    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n    gap: 20px;\n}\n.permission-group {\n    background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;\n}\n.group-title {\n    font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 12px;\n    display: flex; align-items: center; gap: 8px;\n}\n.group-icon {\n    width: 24px; height: 24px; border-radius: 4px;\n    display: flex; align-items: center; justify-content: center;\n}\n/* Icon Colors */\n.group-icon.company { background: #dbeafe; color: #1e40af; }\n.group-icon.contact { background: #f3e8ff; color: #7c3aed; }\n.group-icon.deal { background: #dcfce7; color: #166534; }\n.group-icon.activity { background: #fef3c7; color: #854d0e; }\n.group-icon.user { background: #fce7f3; color: #db2777; }\n.group-icon.other { background: #f1f5f9; color: #475569; }\n\n.group-list { display: flex; flex-direction: column; gap: 8px; }\n.perm-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }\n.check { color: #10b981; flex-shrink: 0; }\n\n.empty-perms { text-align: center; color: #94a3b8; padding: 40px; }\n.btn-sm { margin-top: 10px; padding: 6px 12px; border: 1px solid #2563eb; color: #2563eb; background: white; border-radius: 4px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"text","position":[1,1,3,1,0]},{"type":"text","position":[1,1,3,3,0]},{"type":"text","position":[1,1,3,5,0]},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,1,5,3]},{"type":"attr","position":[1,3,3]},{"type":"if","position":[1,3,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,3]}]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1,1,1]},{"type":"text","position":[1,1,3]},{"type":"attr","position":[1,3,1]},{"type":"for","position":[1,3,1],"dynamicNodes":[{"type":"text","position":[1,3]}]}]}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["profileId","profile","permissionGroups","totalCount","isLoading","canManage"],

	data: function() {
		return {
			profileId: Lyte.attr("string", { default: "" }),

			// Data Models
			profile: Lyte.attr("object", { default: {} }),

			// Grouped Permissions for Template Loop
			// Structure: [{ title: "Deals", icon: "deal", perms: ["Create", "Edit"] }, ...]
			permissionGroups: Lyte.attr("array", { default: [] }),
			totalCount: Lyte.attr("number", { default: 0 }),

			isLoading: Lyte.attr("boolean", { default: true }),
			canManage: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		// 1. Permission Check
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/dashboard";
			return;
		}
		this.setData('canManage', true);

		// 2. Get ID
		const params = this.getData('params');
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];

		if (!id) {
			window.location.hash = "#/profiles";
			return;
		}

		this.setData('profileId', id);
		this.loadProfile();
	},

	loadProfile: function() {
		this.setData('isLoading', true);
		const id = this.getData('profileId');

		this.crmGetProfile(id)
			.then((res) => {
				const data = res.data || {};

				this.setData('profile', {
					id: data.id,
					name: data.name,
					description: data.description || "",
				});

				const rawPerms = data.permissions || [];
				this.setData('totalCount', rawPerms.length);

				// Group permissions
				this.groupPermissions(rawPerms);
			})
			.catch(err => {
				console.error("Profile Load Error", err);
				alert("Failed to load profile");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- GROUPING LOGIC ---
	groupPermissions: function(perms) {
		// Definitions
		const defs = {
			'COMPANY': { title: 'Company', icon: 'company', class: 'company' },
			'CONTACT': { title: 'Contact', icon: 'contact', class: 'contact' },
			'DEAL': { title: 'Deal', icon: 'deal', class: 'deal' },
			'ACTIVITY': { title: 'Activity', icon: 'activity', class: 'activity' },
			'USER': { title: 'Administration', icon: 'user', class: 'user' }
		};

		let groups = {};
		let other = [];

		perms.forEach(code => {
			const prefix = code.split('_')[0]; // e.g., "DEAL" from "DEAL_CREATE"

			if (defs[prefix]) {
				if (!groups[prefix]) {
					groups[prefix] = { ...defs[prefix], list: [] };
				}
				groups[prefix].list.push(this.formatPerm(code));
			} else {
				other.push(this.formatPerm(code));
			}
		});

		// Convert Map to Array
		let result = Object.values(groups);

		// Add "Other" if any
		if (other.length > 0) {
			result.push({
				title: 'Other',
				icon: 'other',
				class: 'other',
				list: other
			});
		}

		this.setData('permissionGroups', result);
	},

	formatPerm: function(code) {
		if (!code) return "";
		// DEAL_VIEW_SELF -> Deal View Self
		return code.split('_').slice(1).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
	},

	actions: {
		goBack: function() {
			window.location.hash = "#/profiles";
		},

		editProfile: function() {
			const id = this.getData('profileId');
			window.location.hash = "#/profiles/edit/" + id;
		},

		deleteProfile: function() {
			if (confirm("Delete this profile? Users with this profile will lose permissions.")) {
				this.crmDeleteProfile(this.getData('profileId')).then((res) => {
					if (res.success) {
						alert("Profile deleted");
						window.location.hash = "#/profiles";
					} else {
						alert("Failed: " + res.message);
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
Lyte.Component.register("role-view", {
_template:"<template tag-name=\"role-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Role Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading role...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"role-header-card\"> <div class=\"role-icon\"> <svg width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> </div> <div class=\"role-info\"> <h2>{{role.roleName}}</h2> <div class=\"role-meta\">ID: {{role.id}}</div> </div> <div class=\"role-actions\"> <button onclick=\"{{action('deleteRole')}}\" class=\"btn-danger-ghost\">Delete Role</button> </div> </div> <div class=\"role-body\"> <h3 class=\"section-title\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" class=\"mr-2\"><polyline points=\"17 11 12 6 7 11\"></polyline><polyline points=\"17 18 12 13 7 18\"></polyline></svg> Hierarchy </h3> <div class=\"hierarchy-card\"> <div class=\"hierarchy-item\"> <div class=\"label\">Reports To:</div> <div class=\"value\"> <template is=\"if\" value=\"{{role.reportsTo}}\"><template case=\"true\"> <a onclick=\"{{action('navigateToRole',role.reportsTo.id)}}\" class=\"role-link parent\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"17 11 12 6 7 11\"></polyline></svg> {{role.reportsTo.name}} </a> </template><template case=\"false\"> <span class=\"text-secondary\">None (Top-level role)</span> </template></template> </div> </div> <div class=\"h-divider\"></div> <div class=\"hierarchy-item\"> <div class=\"label\">Subordinates:</div> <div class=\"value\"> <template is=\"if\" value=\"{{expHandlers(role.subordinates.length,'>',0)}}\"><template case=\"true\"> <div class=\"sub-list\"> <template is=\"for\" items=\"{{role.subordinates}}\" item=\"sub\"> <a onclick=\"{{action('navigateToRole',sub.id)}}\" class=\"role-link child\"> {{sub.name}} </a> </template> </div> </template><template case=\"false\"> <span class=\"text-secondary\">None</span> </template></template> </div> </div> </div> <div class=\"info-note\"> <div class=\"note-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"16\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"8\" x2=\"12.01\" y2=\"8\"></line></svg> </div> <div class=\"note-text\"> <strong>Note:</strong> Roles define organizational hierarchy and data visibility scope. Permissions are managed through Profiles. </div> </div> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.role-header-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 24px; display: flex; align-items: center; gap: 20px;\n    margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n}\n.role-icon {\n    width: 64px; height: 64px; border-radius: 12px;\n    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);\n    display: flex; align-items: center; justify-content: center;\n    color: white; flex-shrink: 0;\n}\n.role-info h2 { margin: 0 0 4px 0; font-size: 22px; color: #1e293b; }\n.role-meta { color: #64748b; font-size: 14px; }\n.role-actions { margin-left: auto; }\n\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; font-weight: 500; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* BODY */\n.role-body { padding: 0 10px; }\n.section-title {\n    font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px;\n    display: flex; align-items: center;\n}\n.mr-2 { margin-right: 8px; }\n\n/* HIERARCHY CARD */\n.hierarchy-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 20px; margin-bottom: 24px;\n}\n.hierarchy-item { display: flex; align-items: flex-start; padding: 12px 0; }\n.label { width: 120px; font-size: 13px; color: #64748b; font-weight: 500; padding-top: 2px; }\n.value { flex: 1; font-size: 14px; color: #1e293b; }\n\n.text-secondary { color: #94a3b8; font-style: italic; }\n\n.role-link {\n    color: #2563eb; cursor: pointer; text-decoration: none; font-weight: 500;\n    display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px;\n    border-radius: 6px; transition: background 0.2s;\n}\n.role-link:hover { background: #eff6ff; }\n.role-link.parent { color: #7c3aed; } /* Purple for parent */\n.role-link.parent:hover { background: #f5f3ff; }\n\n.sub-list { display: flex; flex-wrap: wrap; gap: 8px; }\n.role-link.child { background: #f8fafc; border: 1px solid #e2e8f0; color: #334155; }\n.role-link.child:hover { border-color: #cbd5e1; background: #fff; }\n\n.h-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }\n\n/* NOTE */\n.info-note {\n    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);\n    border: 1px solid #bae6fd; border-radius: 8px;\n    padding: 15px; display: flex; gap: 15px; align-items: flex-start;\n}\n.note-icon { color: #0284c7; flex-shrink: 0; }\n.note-text { color: #334155; font-size: 13px; line-height: 1.5; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"text","position":[1,1,3,1,0]},{"type":"text","position":[1,1,3,3,1]},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,3,3,1,3,1]},{"type":"if","position":[1,3,3,1,3,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,3]}]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"attr","position":[1,3,3,5,3,1]},{"type":"if","position":[1,3,3,5,3,1],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"for","position":[1,1],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,1]}]}]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["roleId","role","isLoading","canManage"],

	data: function() {
		return {
			roleId: Lyte.attr("string", { default: "" }),
			role: Lyte.attr("object", { default: {} }),

			isLoading: Lyte.attr("boolean", { default: true }),
			canManage: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		// 1. Permission Check
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/dashboard";
			return;
		}
		this.setData('canManage', true);

		// 2. Get ID
		const params = this.getData('params'); // Router params
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];

		if (!id) {
			window.location.hash = "#/roles";
			return;
		}

		this.setData('roleId', id);
		this.loadRole();
	},

	// Observer: Reload data if the user clicks a link to another role
	// This handles navigation within the same component
	roleIdObserver: function() {
		this.loadRole();
	}.observes('roleId'),

	loadRole: function() {
		this.setData('isLoading', true);
		const id = this.getData('roleId');

		this.crmGetRole(id)
			.then((res) => {
				// API returns { data: { id: 1, roleName: "...", ... } }
				const data = res.data || {};

				this.setData('role', {
					id: data.id,
					roleName: data.roleName,
					// Handle null 'reportsTo' safely
					reportsTo: data.reportsTo || null,
					// Handle empty 'subordinates' safely
					subordinates: data.subordinates || []
				});
			})
			.catch(err => {
				console.error("Role Load Error", err);
				alert("Failed to load role details");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	actions: {
		goBack: function() {
			window.location.hash = "#/roles";
		},

		deleteRole: function() {
			const role = this.getData('role');
			if (confirm(`Delete role "${role.roleName}"? Users must be reassigned.`)) {
				this.crmDeleteRole(role.id).then((res) => {
					if (res.success) {
						alert("Role deleted");
						window.location.hash = "#/roles";
					} else {
						alert("Failed: " + res.message);
					}
				});
			}
		},

		// Action to navigate to another role (Child/Parent)
		navigateToRole: function(id) {
			window.location.hash = "#/roles/" + id;
			// Manually update data if hash change doesn't trigger component reload
			this.setData('roleId', id);
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("user-create", {
_template:"<template tag-name=\"user-create\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Add User</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading form data...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Account Information</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Username <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_username\" class=\"form-input\" placeholder=\"e.g. jdoe\" autocomplete=\"off\"> </div> <div class=\"form-group half\"> <label>Email <span class=\"required\">*</span></label> <input type=\"email\" id=\"inp_email\" class=\"form-input\" placeholder=\"user@example.com\" autocomplete=\"off\"> </div> </div> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Password <span class=\"required\">*</span></label> <input type=\"password\" id=\"inp_password\" class=\"form-input\" placeholder=\"Min 6 chars\" onkeyup=\"{{action('checkPassword',event)}}\"> <div class=\"strength-bar\"> <div class=\"bar-fill {{passwordStrength}}\"></div> </div> </div> <div class=\"form-group half\"> <label>Confirm Password <span class=\"required\">*</span></label> <input type=\"password\" id=\"inp_confirm\" class=\"form-input\" placeholder=\"Re-enter password\"> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Personal Information</h3> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_fullname\" class=\"form-input\" placeholder=\"e.g. John Doe\"> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Role &amp; Access</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Role <span class=\"required\">*</span></label> <select id=\"sel_role\" class=\"form-select\"> <option value=\"\">Select Role...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{roles}}\" item=\"role\"></option> </select> <div class=\"hint\">Defines hierarchy and visibility</div> </div> <div class=\"form-group half\"> <label>Profile <span class=\"required\">*</span></label> <select id=\"sel_profile\" class=\"form-select\"> <option value=\"\">Select Profile...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{profiles}}\" item=\"prof\"></option> </select> <div class=\"hint\">Defines specific permissions</div> </div> </div> <div class=\"form-group\"> <label>Reports To (Manager)</label> <select id=\"sel_manager\" class=\"form-select\"> <option value=\"\">No Manager (Top Level)</option> <option is=\"for\" lyte-for=\"true\" items=\"{{users}}\" item=\"user\"></option> </select> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('createUser')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Creating...</template><template case=\"false\">Create User</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.form-container { flex-grow: 1; overflow-y: auto; padding-bottom: 40px; }\n.form-card { max-width: 720px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 0 auto; }\n\n/* SECTIONS */\n.form-section { margin-bottom: 30px; }\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n\n.form-row { display: flex; gap: 20px; margin-bottom: 20px; }\n.form-group { margin-bottom: 20px; }\n.form-group.half { flex: 1; margin-bottom: 0; }\n\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n.hint { font-size: 12px; color: #64748b; margin-top: 4px; }\n\n/* PASSWORD STRENGTH */\n.strength-bar { height: 4px; background: #e2e8f0; margin-top: 6px; border-radius: 2px; overflow: hidden; }\n.bar-fill { height: 100%; width: 0; transition: width 0.3s, background 0.3s; }\n.bar-fill.weak { width: 33%; background: #ef4444; }\n.bar-fill.medium { width: 66%; background: #f59e0b; }\n.bar-fill.strong { width: 100%; background: #10b981; }\n\n/* ACTIONS */\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,1,5,1,3]},{"type":"attr","position":[1,1,1,1,5,1,5,1]},{"type":"attr","position":[1,1,1,5,3,1,3,3]},{"type":"for","position":[1,1,1,5,3,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{roles}}\" item=\"role\"> <option value=\"{{role.id}}\">{{role.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,3,3,3,3]},{"type":"for","position":[1,1,1,5,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{profiles}}\" item=\"prof\"> <option value=\"{{prof.id}}\">{{prof.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,5,3,3]},{"type":"for","position":[1,1,1,5,5,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]},{"type":"text","position":[1,2]}],"actualTemplate":"<template is=\"for\" items=\"{{users}}\" item=\"user\"> <option value=\"{{user.id}}\">{{user.fullName}} ({{user.roleName}})</option> </template>"},{"type":"attr","position":[1,1,1,7,1]},{"type":"attr","position":[1,1,1,7,3]},{"type":"attr","position":[1,1,1,7,3,1]},{"type":"if","position":[1,1,1,7,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["roles","profiles","users","passwordStrength","isLoading","isSaving"],

	data: function() {
		return {
			// Dropdown Options
			roles: Lyte.attr("array", { default: [] }),
			profiles: Lyte.attr("array", { default: [] }),
			users: Lyte.attr("array", { default: [] }), // Potential managers

			// Form Data (Bound for UI feedback, but read manually on submit)
			passwordStrength: Lyte.attr("string", { default: "none" }), // weak, medium, strong

			// State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/users";
			return;
		}
		this.loadFormData();
	},

	loadFormData: function() {
		this.setData('isLoading', true);

		// Fetch Metadata (Roles/Profiles) AND Existing Users (for Manager dropdown)
		Promise.all([
			this.crmAddUser(),
			this.crmGetUsers()
		]).then((responses) => {
			const [metaRes, usersRes] = responses;

			// 1. Roles & Profiles
			if (metaRes.success && metaRes.data) {
				// Convert Map/Object to Array for Lyte Loop
				const roleObj = metaRes.data.roles || {};
				const profObj = metaRes.data.profiles || {};

				this.setData('roles', this.mapToArray(roleObj));
				this.setData('profiles', this.mapToArray(profObj));
			}

			// 2. Managers (Existing Users)
			let userList = [];
			if (usersRes.success) {
				// Handle various response structures
				const d = usersRes.data;
				if (Array.isArray(d)) userList = d;
				else if (d && Array.isArray(d.data)) userList = d.data;
			}
			this.setData('users', userList);

		}).catch(err => {
			console.error("Form Load Error", err);
			alert("Failed to load form data");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	// Helper: Convert { "1": "Admin" } -> [ { id: "1", name: "Admin" } ]
	mapToArray: function(obj) {
		return Object.keys(obj).map(key => ({
			id: key,
			name: obj[key]
		}));
	},

	actions: {
		checkPassword: function(event) {
			const val = event.target.value;
			let strength = "none";
			let score = 0;

			if (val.length >= 6) score++;
			if (val.length >= 8 && /[A-Z]/.test(val)) score++;
			if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;

			if (score === 1) strength = "weak";
			else if (score === 2) strength = "medium";
			else if (score >= 3) strength = "strong";

			this.setData('passwordStrength', strength);
		},

		createUser: function() {
			// 1. Direct DOM Reading
			const username = document.getElementById('inp_username').value.trim();
			const email = document.getElementById('inp_email').value.trim();
			const password = document.getElementById('inp_password').value;
			const confirm = document.getElementById('inp_confirm').value;
			const fullName = document.getElementById('inp_fullname').value.trim();

			// For selects, getting value is standard
			const roleId = document.getElementById('sel_role').value;
			const profileId = document.getElementById('sel_profile').value;
			const managerId = document.getElementById('sel_manager').value;

			// 2. Validation
			if (!username || !email || !password || !fullName || !roleId || !profileId) {
				alert("Please fill in all required fields.");
				return;
			}

			if (password !== confirm) {
				alert("Passwords do not match.");
				return;
			}

			if (password.length < 6) {
				alert("Password must be at least 6 characters.");
				return;
			}

			this.setData('isSaving', true);

			// 3. Payload
			const payload = {
				username: username,
				email: email,
				password: password,
				fullName: fullName,
				roleId: parseInt(roleId),
				profileId: parseInt(profileId),
				managerId: managerId ? parseInt(managerId) : null,
				active: true
			};

			this.crmSaveUser(payload)
				.then((res) => {
					if (res.success) {
						alert("User created successfully!");
						window.location.hash = "#/users";
					} else {
						alert("Error: " + (res.message || "Creation failed"));
					}
				})
				.catch(err => {
					alert("Submission error: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/users";
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("user-edit", {
_template:"<template tag-name=\"user-edit\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('cancel')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">Edit User</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading user data...</p> </div> </template><template case=\"false\"> <div class=\"form-container\"> <div class=\"form-card\"> <form onsubmit=\"return false;\"> <div class=\"form-section\"> <h3 class=\"section-title\">Account Information</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Username <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_username\" class=\"form-input\"> </div> <div class=\"form-group half\"> <label>Email <span class=\"required\">*</span></label> <input type=\"email\" id=\"inp_email\" class=\"form-input\"> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Personal Information</h3> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" id=\"inp_fullname\" class=\"form-input\"> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Role &amp; Permissions</h3> <div class=\"form-row\"> <div class=\"form-group half\"> <label>Role <span class=\"required\">*</span></label> <select id=\"sel_role\" class=\"form-select\"> <option value=\"\">Select Role...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{roles}}\" item=\"role\"></option> </select> </div> <div class=\"form-group half\"> <label>Profile <span class=\"required\">*</span></label> <select id=\"sel_profile\" class=\"form-select\"> <option value=\"\">Select Profile...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{profiles}}\" item=\"prof\"></option> </select> </div> </div> </div> <div class=\"form-section\"> <h3 class=\"section-title\">Security</h3> <div class=\"form-group\"> <label>New Password</label> <input type=\"password\" id=\"inp_password\" class=\"form-input\" placeholder=\"Leave blank to keep current password\"> <div class=\"hint\">Only fill this if you want to reset the user's password.</div> </div> <div class=\"form-group checkbox-row\"> <label class=\"checkbox-label\"> <input type=\"checkbox\" id=\"chk_active\"> <span class=\"lbl-text\">Account is Active</span> </label> <div class=\"hint\">Inactive users cannot sign in.</div> </div> </div> <div class=\"form-actions\"> <button type=\"button\" onclick=\"{{action('cancel')}}\" class=\"btn-secondary\">Cancel</button> <button type=\"button\" onclick=\"{{action('updateUser')}}\" class=\"btn-primary\" disabled=\"{{isSaving}}\"> <template is=\"if\" value=\"{{isSaving}}\"><template case=\"true\">Saving...</template><template case=\"false\">Save Changes</template></template> </button> </div> </form> </div> </div> </template></template> </div> </template>\n<style>/* Inherit standard form styles from previous Create/Edit pages */\n/* ... (Container, header, form-group, inputs, actions) ... */\n\n.form-container { max-width: 720px; margin: 0 auto; }\n.form-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }\n\n.section-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n.form-section { margin-bottom: 30px; }\n.form-row { display: flex; gap: 20px; margin-bottom: 20px; }\n.form-group { margin-bottom: 20px; }\n.form-group.half { flex: 1; margin-bottom: 0; }\n\n.form-group label { display: block; font-size: 13px; font-weight: 500; color: #334155; margin-bottom: 6px; }\n.required { color: #ef4444; }\n\n.form-input, .form-select {\n    width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box;\n}\n.form-input:focus, .form-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }\n\n.hint { font-size: 12px; color: #64748b; margin-top: 4px; }\n\n/* CHECKBOX STYLES */\n.checkbox-row { display: flex; flex-direction: column; gap: 4px; }\n.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }\n.checkbox-label input { margin: 0; width: 16px; height: 16px; }\n.lbl-text { font-size: 14px; font-weight: 500; color: #1e293b; }\n\n.form-actions { display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 10px; }\n.btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #334155; padding: 10px 20px; border-radius: 6px; cursor: pointer; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1,5,3,1,3,3]},{"type":"for","position":[1,1,1,5,3,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{roles}}\" item=\"role\"> <option value=\"{{role.id}}\">{{role.name}}</option> </template>"},{"type":"attr","position":[1,1,1,5,3,3,3,3]},{"type":"for","position":[1,1,1,5,3,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{profiles}}\" item=\"prof\"> <option value=\"{{prof.id}}\">{{prof.name}}</option> </template>"},{"type":"attr","position":[1,1,1,9,1]},{"type":"attr","position":[1,1,1,9,3]},{"type":"attr","position":[1,1,1,9,3,1]},{"type":"if","position":[1,1,1,9,3,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}}]}},"default":{}}],
_observedAttributes :["userId","user","roles","profiles","isLoading","isSaving"],

	data: function() {
		return {
			userId: Lyte.attr("string", { default: "" }),

			// Data Models
			user: Lyte.attr("object", { default: {} }),
			roles: Lyte.attr("array", { default: [] }),
			profiles: Lyte.attr("array", { default: [] }),

			// UI State
			isLoading: Lyte.attr("boolean", { default: true }),
			isSaving: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/users";
			return;
		}

		// Robust ID Extraction from URL (e.g., #/users/edit/1)
		let id = this.getData('params') && this.getData('params').id;
		if (!id) {
			const match = window.location.hash.match(/\/(\d+)/);
			if (match) id = match[1];
		}

		if (!id) {
			window.location.hash = "#/users";
			return;
		}

		this.setData('userId', id);
		this.loadData();
	},

	loadData: function() {
		this.setData('isLoading', true);
		const id = this.getData('userId');

		// Parallel Fetch:
		// 1. User Details (crmGetUser)
		// 2. Form Options like Roles/Profiles (crmAddUser)
		Promise.all([
			this.crmGetUser(id),
			this.crmAddUser()
		]).then((responses) => {
			const [userRes, optionsRes] = responses;

			if (!userRes.success) throw new Error(userRes.message);

			// 1. Process Form Options (Roles & Profiles)
			if (optionsRes.success && optionsRes.data) {
				this.setData('roles', this.mapToArray(optionsRes.data.roles || {}));
				this.setData('profiles', this.mapToArray(optionsRes.data.profiles || {}));
			}

			// 2. Process User Data
			const userData = userRes.data || {};
			this.setData('user', userData);

			// 3. Force Populate Form (Wait for DOM render)
			setTimeout(() => {
				this.populateForm(userData);
			}, 100);

		}).catch(err => {
			console.error("Load Error", err);
			alert("Failed to load user data.");
		}).finally(() => {
			this.setData('isLoading', false);
		});
	},

	// Helper to convert API Maps { "1": "Admin" } to Arrays [{id: 1, name: "Admin"}]
	mapToArray: function(obj) {
		return Object.keys(obj).map(key => ({
			id: key,
			name: obj[key]
		}));
	},

	// Manually set input values to ensure accuracy
	populateForm: function(data) {
		const setVal = (id, val) => {
			const el = document.getElementById(id);
			if (el) el.value = val || "";
		};

		setVal('inp_username', data.username);
		setVal('inp_email', data.email);
		setVal('inp_fullname', data.fullName);

		// Selects
		const roleEl = document.getElementById('sel_role');
		if (roleEl) roleEl.value = data.roleId;

		const profEl = document.getElementById('sel_profile');
		if (profEl) profEl.value = data.profileId;

		// Checkbox
		const activeEl = document.getElementById('chk_active');
		if (activeEl) activeEl.checked = (data.active === true || data.isActive === true);
	},

	actions: {
		updateUser: function() {
			// 1. Direct DOM Reading
			const username = document.getElementById('inp_username').value.trim();
			const email = document.getElementById('inp_email').value.trim();
			const fullName = document.getElementById('inp_fullname').value.trim();
			const roleId = document.getElementById('sel_role').value;
			const profileId = document.getElementById('sel_profile').value;
			const isActive = document.getElementById('chk_active').checked;
			const password = document.getElementById('inp_password').value;

			// 2. Validation
			if (!username || !email || !fullName || !roleId || !profileId) {
				alert("Please fill in all required fields.");
				return;
			}

			this.setData('isSaving', true);

			// 3. Construct Payload
			const payload = {
				id: parseInt(this.getData('userId')),
				username: username,
				email: email,
				fullName: fullName,
				roleId: parseInt(roleId),
				profileId: parseInt(profileId),
				active: isActive
			};

			// Only send password if user entered a new one
			if (password) {
				payload.password = password;
			}

			// 4. Submit
			this.crmUpdateUser(payload)
				.then((res) => {
					if (res.success) {
						alert("User updated successfully!");
						window.location.hash = "#/users/view/" + this.getData('userId');
					} else {
						alert("Error: " + res.message);
					}
				})
				.catch(err => {
					alert("Update failed: " + err.message);
				})
				.finally(() => {
					this.setData('isSaving', false);
				});
		},

		cancel: function() {
			window.location.hash = "#/users/view/" + this.getData('userId');
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
Lyte.Component.register("user-list", {
_template:"<template tag-name=\"user-list\"> <div class=\"page-container\"> <header class=\"page-header\"> <h1 class=\"title\">Users</h1> <template is=\"if\" value=\"{{canManage}}\"><template case=\"true\"> <button onclick=\"{{action('createUser')}}\" class=\"add-btn\"> <span>+ Add User</span> </button> </template></template> </header> <div class=\"controls-bar\"> <div class=\"search-wrapper full-width\"> <span class=\"search-icon\">🔍</span> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearchInput')}}\" placeholder=\"Search users...\" class=\"search-input\"> </div> </div> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading users...</p> </div> </template><template case=\"false\"> <div class=\"users-list-container\"> <template is=\"if\" value=\"{{expHandlers(groupedUsers.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-state\">No users found.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{groupedUsers}}\" item=\"group\" index=\"i\"> <div class=\"role-section\"> <div class=\"role-header\"> <div class=\"role-title\"> <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"></path></svg> {{group.roleName}} </div> <span class=\"role-count\">{{group.count}} user(s)</span> </div> <div class=\"role-users\"> <template is=\"for\" items=\"{{group.users}}\" item=\"u\" index=\"j\"> <div class=\"user-card {{expHandlers(u.active,'?:','','user-inactive')}}\"> <div class=\"user-avatar\" style=\"background-color: {{u.avatarColor}}\"> {{u.initials}} </div> <div class=\"user-info\"> <div class=\"user-name-row\"> <span class=\"u-name\">{{u.fullName}}</span> <template is=\"if\" value=\"{{u.active}}\"><template case=\"true\"> <span class=\"badge badge-success\">Active</span> </template><template case=\"false\"> <span class=\"badge badge-danger\">Inactive</span> </template></template> </div> <div class=\"user-meta\"> <span class=\"meta-item\"> <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94\"></path></svg> {{u.username}} </span> <span class=\"meta-item\"> <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"></path><polyline points=\"22,6 12,13 2,6\"></polyline></svg> {{u.email}} </span> </div> </div> <template is=\"if\" value=\"{{u.profileName}}\"><template case=\"true\"> <div class=\"user-badges\"> <span class=\"badge badge-profile\">{{u.profileName}}</span> </div> </template></template> <div class=\"user-actions\"> <button onclick=\"{{action('viewUser',u.id)}}\" class=\"btn-icon-sm\" title=\"View\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg> </button> <button onclick=\"{{action('deleteUser',u.id,u.fullName)}}\" class=\"btn-icon-sm text-danger\" title=\"Delete\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg> </button> </div> </div> </template> </div> </div> </template> </template></template> </div> </template></template> </div> </template>\n<style>/* 1. LAYOUT & SCROLLING */\n.page-container {\n    padding: 20px;\n    background-color: #f4f7f6;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    overflow: hidden;\n}\n\n.page-header, .controls-bar {\n    flex-shrink: 0;\n}\n.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }\n.title { font-size: 24px; color: #1e293b; margin: 0; }\n.add-btn { background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }\n\n.controls-bar { margin-bottom: 25px; }\n.search-wrapper {\n    background: white; border: 1px solid #e2e8f0; border-radius: 6px;\n    padding: 10px 12px; display: flex; align-items: center;\n}\n.search-input { border: none; outline: none; width: 100%; font-size: 14px; margin-left: 8px; }\n\n/* 2. MAIN LIST SCROLL */\n.users-list-container {\n    flex-grow: 1;\n    overflow-y: auto;\n    min-height: 0;\n    padding-bottom: 20px;\n}\n\n/* 3. ROLES & CARDS */\n.role-section { margin-bottom: 20px; }\n\n.role-header {\n    display: flex; align-items: center; justify-content: space-between;\n    padding: 10px 15px; background-color: #f1f5f9;\n    border-radius: 8px 8px 0 0; border: 1px solid #e2e8f0; border-bottom: none;\n}\n.role-title { font-size: 13px; font-weight: 600; color: #334155; display: flex; gap: 8px; align-items: center; }\n.role-count { font-size: 11px; background: white; padding: 2px 8px; border-radius: 10px; color: #64748b; }\n\n.role-users {\n    border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;\n    background: white;\n}\n\n.user-card {\n    display: flex; align-items: center; gap: 15px;\n    padding: 15px; border-bottom: 1px solid #f1f5f9;\n}\n.user-card:last-child { border-bottom: none; }\n.user-card:hover { background-color: #f8fafc; }\n.user-inactive { background-color: #f9fafb; opacity: 0.8; }\n\n/* 4. USER DETAILS */\n.user-avatar {\n    width: 42px; height: 42px; border-radius: 50%;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-weight: 600; font-size: 14px; flex-shrink: 0;\n}\n.user-info { flex: 1; min-width: 0; }\n.user-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }\n.u-name { font-weight: 600; color: #1e293b; font-size: 14px; }\n\n.user-meta { display: flex; gap: 15px; font-size: 12px; color: #64748b; }\n.meta-item { display: flex; align-items: center; gap: 4px; }\n\n/* 5. BADGES & ACTIONS */\n.badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }\n.badge-success { background: #dcfce7; color: #166534; }\n.badge-danger { background: #fee2e2; color: #991b1b; }\n.badge-profile { background: #e0e7ff; color: #4338ca; }\n\n.user-actions { display: flex; gap: 5px; }\n.btn-icon-sm {\n    background: transparent; border: 1px solid transparent;\n    width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;\n    border-radius: 4px; cursor: pointer; color: #64748b;\n}\n.btn-icon-sm:hover { background: #f1f5f9; color: #1e293b; }\n.btn-icon-sm.text-danger:hover { background: #fee2e2; color: #ef4444; }\n\n.loading-state, .empty-state { text-align: center; color: #94a3b8; padding: 40px; }\n.spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 10px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
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
Lyte.Component.register("user-view", {
_template:"<template tag-name=\"user-view\"> <div class=\"page-container\"> <header class=\"page-header\"> <div class=\"header-left\"> <button onclick=\"{{action('goBack')}}\" class=\"btn-icon\"> <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg> </button> <h1 class=\"header-title\">User Details</h1> </div> </header> <template is=\"if\" value=\"{{isLoading}}\"><template case=\"true\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> <p>Loading user...</p> </div> </template><template case=\"false\"> <div class=\"view-content\"> <div class=\"user-header-card\"> <div class=\"user-avatar-lg\" style=\"background-color: {{avatarColor}}\"> {{initials}} </div> <div class=\"user-main-info\"> <div class=\"name-row\"> <h2>{{user.fullName}}</h2> <template is=\"if\" value=\"{{user.active}}\"><template case=\"true\"> <span class=\"badge badge-success\">Active</span> </template><template case=\"false\"> <span class=\"badge badge-danger\">Inactive</span> </template></template> </div> <div class=\"user-email\">{{user.email}}</div> <div class=\"badges-row\"> <span class=\"badge-pill role\">{{user.roleName}}</span> <span class=\"badge-pill profile\">{{user.profileName}}</span> </div> </div> <div class=\"user-actions\"> <button onclick=\"{{action('editUser')}}\" class=\"btn-primary-ghost\"> <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"></path><path d=\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"></path></svg> Edit </button> <button onclick=\"{{action('deleteUser')}}\" class=\"btn-danger-ghost\">Delete</button> </div> </div> <div class=\"user-body\"> <h3 class=\"section-title\">Account Information</h3> <div class=\"info-grid\"> <div class=\"info-item\"> <div class=\"label\">Username</div> <div class=\"value\">{{user.username}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Email</div> <div class=\"value\">{{user.email}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Role</div> <div class=\"value\">{{user.roleName}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Profile</div> <div class=\"value\">{{user.profileName}}</div> </div> </div> <h3 class=\"section-title mt-4\">Reporting Structure</h3> <div class=\"info-grid two-col\"> <div class=\"info-item\"> <div class=\"label\">Reports To</div> <div class=\"value\">{{user.reportsTo}}</div> </div> <div class=\"info-item\"> <div class=\"label\">Team Size</div> <div class=\"value\">{{user.teamSize}} direct reports</div> </div> </div> <div class=\"tabs-container\"> <div class=\"tabs-header\"> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','deals'),'?:','active','')}}\" onclick=\"{{action('switchTab','deals')}}\"> Assigned Deals ({{deals.length}}) </div> <div class=\"tab {{expHandlers(expHandlers(currentTab,'==','team'),'?:','active','')}}\" onclick=\"{{action('switchTab','team')}}\"> Team Members ({{teamMembers.length}}) </div> </div> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','deals')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(deals.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No deals assigned.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{deals}}\" item=\"d\"> <div class=\"list-item\"> <div class=\"item-main\"> <div class=\"item-title\">{{d.title}}</div> <div class=\"item-sub\">{{d.formattedAmount}}</div> </div> <span class=\"badge {{d.statusClass}}\">{{d.status}}</span> <button onclick=\"{{action('viewDeal',d.id)}}\" class=\"btn-sm ml-2\">View</button> </div> </template> </template></template> </div> </template></template> <template is=\"if\" value=\"{{expHandlers(currentTab,'==','team')}}\"><template case=\"true\"> <div class=\"tab-pane\"> <template is=\"if\" value=\"{{expHandlers(teamMembers.length,'===',0)}}\"><template case=\"true\"> <div class=\"empty-tab\">No direct reports.</div> </template><template case=\"false\"> <template is=\"for\" items=\"{{teamMembers}}\" item=\"m\"> <div class=\"list-item\"> <div class=\"mini-avatar\" style=\"background-color: {{m.avatarColor}}\"> {{m.initials}} </div> <div class=\"item-main\"> <div class=\"item-title\">{{m.fullName}}</div> <div class=\"item-sub\">{{m.email}}</div> </div> <button onclick=\"{{action('viewUser',m.id)}}\" class=\"btn-sm\">View</button> </div> </template> </template></template> </div> </template></template> </div> </div> </div> </template></template> </div> </template>\n<style>/* CONTAINER */\n.page-container {\n    padding: 24px 32px;\n    background-color: #f8fafc;\n    height: 100vh;\n    display: flex; flex-direction: column; overflow: hidden;\n}\n.page-header { display: flex; align-items: center; margin-bottom: 20px; flex-shrink: 0; }\n.header-left { display: flex; align-items: center; gap: 10px; }\n.header-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }\n.btn-icon { background: none; border: none; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; display: flex; }\n.btn-icon:hover { background: #e2e8f0; color: #1e293b; }\n\n.view-content { flex-grow: 1; overflow-y: auto; min-height: 0; padding-bottom: 40px; }\n\n/* HEADER CARD */\n.user-header-card {\n    background: white; border: 1px solid #e2e8f0; border-radius: 12px;\n    padding: 24px; display: flex; align-items: center; gap: 24px;\n    margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n}\n.user-avatar-lg {\n    width: 80px; height: 80px; border-radius: 50%;\n    display: flex; align-items: center; justify-content: center;\n    color: white; font-size: 28px; font-weight: 700; flex-shrink: 0;\n}\n\n.user-main-info { flex: 1; }\n.name-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }\n.name-row h2 { margin: 0; font-size: 22px; color: #1e293b; }\n\n.user-email { color: #64748b; font-size: 14px; margin-bottom: 12px; }\n\n.badges-row { display: flex; gap: 8px; }\n.badge-pill { font-size: 11px; padding: 2px 10px; border-radius: 12px; font-weight: 600; text-transform: uppercase; }\n.badge-pill.role { background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }\n.badge-pill.profile { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }\n\n.user-actions { display: flex; gap: 10px; align-self: flex-start; }\n.btn-primary-ghost {\n    background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px;\n    cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500;\n}\n.btn-primary-ghost:hover { background: #f8fafc; }\n.btn-danger-ghost { background: none; border: none; color: #ef4444; cursor: pointer; padding: 8px 16px; font-size: 13px; }\n.btn-danger-ghost:hover { background: #fef2f2; border-radius: 6px; }\n\n/* STATUS BADGES */\n.badge-success { background: #dcfce7; color: #166534; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }\n.badge-danger { background: #fee2e2; color: #991b1b; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }\n\n/* BODY */\n.user-body { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }\n.section-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }\n.mt-4 { margin-top: 24px; }\n\n.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }\n.info-item .label { font-size: 12px; color: #64748b; margin-bottom: 4px; }\n.info-item .value { font-size: 14px; color: #1e293b; font-weight: 500; }\n\n/* TABS */\n.tabs-header { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 20px; margin-top: 30px; }\n.tab {\n    padding: 10px 20px; cursor: pointer; font-size: 14px; color: #64748b; border-bottom: 2px solid transparent; margin-bottom: -1px;\n}\n.tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }\n.tab:hover:not(.active) { color: #1e293b; }\n\n.empty-tab { text-align: center; color: #94a3b8; padding: 20px; font-style: italic; }\n\n/* LIST ITEMS */\n.list-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }\n.list-item:last-child { border-bottom: none; }\n\n.mini-avatar {\n    width: 32px; height: 32px; border-radius: 50%; color: white;\n    display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;\n}\n\n.item-main { flex: 1; }\n.item-title { font-size: 14px; font-weight: 500; color: #1e293b; }\n.item-sub { font-size: 12px; color: #64748b; }\n\n.badge-blue { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-size: 11px; }\n.badge-green { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px; }\n.badge-yellow { background: #fef9c3; color: #854d0e; padding: 2px 8px; border-radius: 4px; font-size: 11px; }\n.badge-gray { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 11px; }\n\n.btn-sm { padding: 4px 10px; border: 1px solid #e2e8f0; background: white; border-radius: 4px; font-size: 12px; cursor: pointer; }\n.ml-2 { margin-left: 8px; }\n\n.loading-state { text-align: center; padding: 60px; color: #94a3b8; }\n.spinner { width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s infinite linear; }\n@keyframes spin { to { transform: rotate(360deg); } }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,1]},{"type":"attr","position":[1,3]},{"type":"if","position":[1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1,1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","avatarColor"]}}}},{"type":"text","position":[1,1,1,1]},{"type":"text","position":[1,1,3,1,1,0]},{"type":"attr","position":[1,1,3,1,3]},{"type":"if","position":[1,1,3,1,3],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[]}},"default":{}},{"type":"text","position":[1,1,3,3,0]},{"type":"text","position":[1,1,3,5,1,0]},{"type":"text","position":[1,1,3,5,3,0]},{"type":"attr","position":[1,1,5,1]},{"type":"attr","position":[1,1,5,3]},{"type":"text","position":[1,3,3,1,3,0]},{"type":"text","position":[1,3,3,3,3,0]},{"type":"text","position":[1,3,3,5,3,0]},{"type":"text","position":[1,3,3,7,3,0]},{"type":"text","position":[1,3,7,1,3,0]},{"type":"text","position":[1,3,7,3,3,0]},{"type":"attr","position":[1,3,9,1,1]},{"type":"text","position":[1,3,9,1,1,1]},{"type":"attr","position":[1,3,9,1,3]},{"type":"text","position":[1,3,9,1,3,1]},{"type":"attr","position":[1,3,9,3]},{"type":"if","position":[1,3,9,3],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"text","position":[1,1,1,0]},{"type":"text","position":[1,1,3,0]},{"type":"attr","position":[1,3]},{"type":"text","position":[1,3,0]},{"type":"attr","position":[1,5]}]}]}},"default":{}}]}},"default":{}},{"type":"attr","position":[1,3,9,5]},{"type":"if","position":[1,3,9,5],"cases":{"true":{"dynamicNodes":[{"type":"attr","position":[1,1]},{"type":"if","position":[1,1],"cases":{"true":{"dynamicNodes":[]},"false":{"dynamicNodes":[{"type":"attr","position":[1]},{"type":"for","position":[1],"dynamicNodes":[{"type":"attr","position":[1,1],"attr":{"style":{"name":"style","helperInfo":{"name":"concat","args":["'background-color: '","m.avatarColor"]}}}},{"type":"text","position":[1,1,1]},{"type":"text","position":[1,3,1,0]},{"type":"text","position":[1,3,3,0]},{"type":"attr","position":[1,5]}]}]}},"default":{}}]}},"default":{}}]}},"default":{}}],
_observedAttributes :["userId","user","deals","teamMembers","avatarColor","initials","currentTab","isLoading","canManage"],

	data: function() {
		return {
			userId: Lyte.attr("string", { default: "" }),

			// Data Model
			user: Lyte.attr("object", { default: {} }),
			deals: Lyte.attr("array", { default: [] }),
			teamMembers: Lyte.attr("array", { default: [] }),

			// Visuals
			avatarColor: Lyte.attr("string", { default: "#cbd5e1" }),
			initials: Lyte.attr("string", { default: "" }),

			// State
			currentTab: Lyte.attr("string", { default: "deals" }), // 'deals', 'team'
			isLoading: Lyte.attr("boolean", { default: true }),

			// Permissions
			canManage: Lyte.attr("boolean", { default: false })
		}
	},

	didConnect: function() {
		// 1. Permission Check
		if (!this.hasPermission('USER_MANAGE')) {
			alert("Permission denied");
			window.location.hash = "#/dashboard";
			return;
		}
		this.setData('canManage', true);

		// 2. Get ID
		const params = this.getData('params');
		const hashParts = window.location.hash.split('/');
		const id = hashParts[hashParts.length - 1];

		if (!id) {
			window.location.hash = "#/users";
			return;
		}

		this.setData('userId', id);
		this.loadUser();
	},

	loadUser: function() {
		this.setData('isLoading', true);
		const id = this.getData('userId');

		// Note: Mixin likely needs crmGetUser(id) mapping to user-view-detail.action
		// If not in mixin, we can use generic apiRequest
		this.apiRequest('user-view-detail.action?id=' + id, { method: 'GET' })
			.then((res) => {
				const data = res.data || {};

				// 1. Core User Data
				this.setData('user', {
					id: data.id,
					fullName: data.fullName,
					email: data.email,
					username: data.username,
					roleName: data.roleName || "No Role",
					profileName: data.profileName || "No Profile",
					active: !!data.active,
					reportsTo: data.reportsTo || "-",
					teamSize: data.teamSize || 0
				});

				// 2. Visuals
				this.setData('initials', this.getInitials(data.fullName));
				this.setData('avatarColor', this.getAvatarColor(data.fullName));

				// 3. Lists
				this.setData('deals', this.normalizeDeals(data.deals || []));
				this.setData('teamMembers', this.normalizeTeam(data.teamMembers || []));

			})
			.catch(err => {
				console.error("User Load Error", err);
				alert("Failed to load user details");
			})
			.finally(() => {
				this.setData('isLoading', false);
			});
	},

	// --- NORMALIZERS ---
	normalizeDeals: function(list) {
		return list.map(d => ({
			...d,
			formattedAmount: this.formatMoney(d.amount),
			statusClass: this.getStatusClass(d.status)
		}));
	},

	normalizeTeam: function(list) {
		return list.map(m => ({
			...m,
			initials: this.getInitials(m.fullName),
			avatarColor: this.getAvatarColor(m.fullName)
		}));
	},

	// --- UTILS ---
	getInitials: function(name) {
		if (!name) return "";
		return String(name).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
	},

	getAvatarColor: function(name) {
		if (!name) return '#cbd5e1';
		const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
		let hash = 0;
		for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
		return colors[Math.abs(hash) % colors.length];
	},

	formatMoney: function(amount) {
		if (amount == null) return "$0.00";
		return "$" + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
	},

	getStatusClass: function(status) {
		if(!status) return "badge-gray";
		const map = { NEW: 'badge-blue', WON: 'badge-green', LOST: 'badge-red', IN_PROGRESS: 'badge-yellow' };
		return map[status] || "badge-gray";
	},

	actions: {
		switchTab: function(tabName) {
			this.setData('currentTab', tabName);
		},

		goBack: function() {
			window.location.hash = "#/users";
		},

		editUser: function() {
			// Placeholder for Edit Route
			const id = this.getData('userId');
			window.location.hash = "#/users/edit/" + id;
		},

		deleteUser: function() {
			if (confirm("Delete this user? This cannot be undone.")) {
				this.crmDeleteUser(this.getData('userId')).then((res) => {
					if (res.success) {
						alert("User deleted");
						window.location.hash = "#/users";
					} else {
						alert("Failed to delete: " + res.message);
					}
				});
			}
		},

		viewDeal: function(id) {
			window.location.hash = "#/deals/" + id;
		},

		viewUser: function(id) {
			window.location.hash = "#/users/" + id;
			// Force reload if same component
			this.setData('userId', id);
			this.loadUser();
		}
	}
}, { mixins: ["auth-mixin", "crm-api-mixin", "utils-mixin", "api-mixin"] });
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

Lyte.Router.registerRoute("crm-app.user-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "user-edit"};
    }
});