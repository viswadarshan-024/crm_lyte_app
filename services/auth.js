Lyte.Service.register("auth", class AuthService {
    static services = ["api"];

    constructor() {
        this.user = null;
        this.permissions = [];

        // Constants
        this.PERMISSIONS = {
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
            ACTIVITY_CREATE: 'ACTIVITY_CREATE',
            ACTIVITY_UPDATE: 'ACTIVITY_UPDATE',
            ACTIVITY_DELETE: 'ACTIVITY_DELETE',
            ACTIVITY_VIEW_ALL: 'ACTIVITY_VIEW_ALL',
            ACTIVITY_VIEW_TEAM: 'ACTIVITY_VIEW_TEAM',
            ACTIVITY_VIEW_SELF: 'ACTIVITY_VIEW_SELF',
            USER_MANAGE: 'USER_MANAGE'
        };

        this.init();
    }

    init() {
        let stored = localStorage.getItem('user');
        if (stored) {
            try {
                this.setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Invalid user data in storage");
                this.logout();
            }
        }
    }

    setUser(userData) {
        this.user = userData;
        this.permissions = userData.permissions || [];
        localStorage.setItem('user', JSON.stringify(userData));
    }

    /**
     * LOGS IN THE USER
     */
    login(username, password) {
        // Access the injected service
        let apiService = this.api;

        if (!apiService) {
            return Promise.reject({ message: "System Error: API Service Unreachable" });
        }
        
        return apiService.request('login.action', {
            method: 'POST',
            body: {
                username: username,
                password: password
            }
        }).then((response) => {
            let userData = response.data;

            if(userData && userData.userContext) {
                userData = userData.userContext;
            }

            if (userData) {
                this.setUser(userData);
                return response;
            } else {
                throw new Error("Invalid response from server");
            }
        });
    }

    getUser() {
        return this.user;
    }

    getRoleName() {
        return (this.user && this.user.roleName) ? this.user.roleName : '';
    }

    getProfileName() {
        return (this.user && this.user.profileName) ? this.user.profileName : '';
    }

    getPermissions() {
        return this.permissions;
    }

    isAuthenticated() {
        return !!this.user;
    }

    logout() {
        this.user = null;
        this.permissions = [];
        localStorage.removeItem('user');

        // Use Lyte Router if available, otherwise window.location
        if(Lyte.Router) {
            Lyte.Router.transitionTo('login');
        } else {
            window.location.href = "/";
        }
    }
    
    hasPermission(permissionCode) {
        if (!permissionCode) return false;
        return this.permissions.includes(permissionCode);
    }

    hasAnyPermission(...codes) {
        let codeList = Array.isArray(codes[0]) ? codes[0] : codes;
        let self = this;
        return codeList.some(function(code) {
            return self.permissions.includes(code);
        });
    }

    hasAllPermissions(...codes) {
        let codeList = Array.isArray(codes[0]) ? codes[0] : codes;
        let self = this;
        return codeList.every(function(code) {
            return self.permissions.includes(code);
        });
    }

    canAccess(module) {
        if (!this.user) return false;

        switch (module) {
            case 'dashboard': return true;
            case 'companies': return this.hasAnyPermission('COMPANY_CREATE', 'COMPANY_UPDATE', 'COMPANY_DELETE');
            case 'contacts': return this.hasAnyPermission('CONTACT_CREATE', 'CONTACT_UPDATE', 'CONTACT_DELETE', 'CONTACT_VIEW_SELF');
            case 'deals': return this.hasAnyPermission('DEAL_VIEW_ALL', 'DEAL_VIEW_TEAM', 'DEAL_VIEW_SELF', 'DEAL_CREATE');
            case 'activities': return this.hasAnyPermission('ACTIVITY_VIEW_ALL', 'ACTIVITY_VIEW_TEAM', 'ACTIVITY_VIEW_SELF', 'ACTIVITY_CREATE');
            case 'users':
            case 'roles':
            case 'profiles': return this.hasPermission('USER_MANAGE');
            case 'settings': return true;
            default: return false;
        }
    }
});