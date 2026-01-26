Lyte.Router.configureRoutes(function() {
    this.route('login', { path: '/login', component: 'login-comp' });

	this.route('crm-app', { path: '/', component: 'crm-app' }, function() {

		this.route('dashboard', { path: '/dashboard', component: 'crm-dashboard' });

		this.route('companies', { path: '/companies' });

		this.route('contact-list', { path: '/contacts', component: 'contact-list' });

		this.route('contact-create', { path: '/contacts/create', component: 'contact-create' });
	});
});
Lyte.Router.registerRoute("crm-app", {

    beforeModel: function() {
        let user = localStorage.getItem('user');

        if (!user) {
            this.replaceWith('login');
        }
    },
    renderTemplate : function()	{
        return {outlet : "#outlet",component : "crm-app"};
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
	model : function()	{
		return {
			features : [
				{module : 'Router',url : 'http://lyte/2.0/doc/route/introduction'},
				{module : 'Components',url : 'http://lyte/2.0/doc/components/introduction'},
				{module : 'Data',url : 'http://lyte/2.0/doc/data/introduction'},
				{module : 'CLI',url : 'http://lyte/2.0/doc/cli/introduction'}
			]
		}
				
	},
    beforeModel: function() {
        this.replaceWith('dashboard');
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
        var user = localStorage.getItem('user');

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
//     renderTemplate : function()	{
//         return {component : "contact-create"};
//     }
});

Lyte.Router.registerRoute("crm-app.contact-list", {
    model: function() {
        return {};
    }
});
Lyte.Router.registerRoute("crm-app.dashboard", {
    model: function() {
        return {};
    }
});
Lyte.Component.register("contact-create", {
_template:"<template tag-name=\"contact-create\"> <div class=\"page-content\"> <div class=\"card form-container\"> <div class=\"card-body\"> <h2 class=\"form-title\">Create New Contact</h2> <template is=\"if\" value=\"{{errorMessage}}\"> <div class=\"alert alert-error\">{{errorMessage}}</div> </template> <div class=\"form-section\"> <div class=\"form-group\"> <label>Full Name <span class=\"required\">*</span></label> <input type=\"text\" lyte-model=\"contactName\" class=\"form-input\" placeholder=\"Contact Name\"> </div> <div class=\"form-row\"> <div class=\"form-group\"> <label>Email</label> <input type=\"email\" lyte-model=\"contactEmail\" class=\"form-input\" placeholder=\"email@example.com\"> </div> <div class=\"form-group\"> <label>Phone</label> <input type=\"tel\" lyte-model=\"contactPhone\" class=\"form-input\" placeholder=\"+91 9999999999\"> </div> </div> </div> <div class=\"form-section\"> <div class=\"form-group\"> <label>Company <span class=\"required\">*</span></label> <select lyte-model=\"selectedCompany\" class=\"form-select\"> <option value=\"\">Select Company...</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companyList}}\" item=\"company\" index=\"i\"></option> </select> </div> <div class=\"form-group\"> <label>Designation</label> <input type=\"text\" lyte-model=\"contactDesignation\" class=\"form-input\" placeholder=\"e.g. CEO\"> </div> </div> <div class=\"form-actions\"> <button class=\"btn btn-primary\" onclick=\"{{action('createContact')}}\" disabled=\"{{isLoading}}\"> <template is=\"if\" value=\"{{isLoading}}\"> Creating... </template> <template is=\"else\"> Create Contact </template> </button> <a href=\"#/contacts\" class=\"btn btn-secondary\">Cancel</a> </div> </div> </div> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,3]},{"type":"if","position":[1,1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,1,1,7,1,3,3]},{"type":"for","position":[1,1,1,7,1,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companyList}}\" item=\"company\" index=\"i\"> <option value=\"{{company.id}}\">{{company.name}}</option> </template>"},{"type":"attr","position":[1,1,1,9,1]},{"type":"attr","position":[1,1,1,9,1,1]},{"type":"if","position":[1,1,1,9,1,1],"cases":{},"default":{}}],
_observedAttributes :["contactName","contactEmail","contactPhone","contactDesignation","selectedCompany","companyList","isLoading","errorMessage"],

	services: ["auth", "crm-api"],

	data: function() {
		return {
			contactName: Lyte.attr("string"),
			contactEmail: Lyte.attr("string"),
			contactPhone: Lyte.attr("string"),
			contactDesignation: Lyte.attr("string"),
			selectedCompany: Lyte.attr("string", { default: "" }),

			// List Data
			companyList: Lyte.attr("array", { default: [] }),

			// UI States
			isLoading: Lyte.attr("boolean", { default: false }),
			errorMessage: Lyte.attr("string", { default: "" })
		}
	},

	didConnect: async function() {
		// if (!this.auth.canAccess('contacts')) {
		// 	alert("Permission Denied");
		// 	Lyte.Router.transport("#/contacts"); // Redirect
		// 	return;
		// }

		try {
			let response = await this.crmApi.companies.list();
			if (response.success) {
				this.setData('companyList', response.data);
			}

			const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
			const preSelected = urlParams.get('companyId');
			if(preSelected) {
				this.setData('selectedCompany', preSelected);
			}

		} catch (error) {
			console.error("Failed to load companies", error);
		}
	},

	actions: {
		createContact: async function() {
			// 1. Validate
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

			try {
				let response = await this.crmApi.contacts.save(payload);
				if (response.success) {
					alert("Contact Created Successfully!");
					window.location.href = "#/contacts";
				} else {
					this.setData('errorMessage', response.message || "Unknown error");
				}
			} catch (error) {
				this.setData('errorMessage', error.message || "Network Error");
			} finally {
				this.setData('isLoading', false);
			}
		}
	}
});
Lyte.Component.register("contact-list", {
_template:"<template tag-name=\"contact-list\"> <div class=\"page-content\"> <header class=\"header-row\"> <h1 class=\"header-title\">Contacts</h1> <template is=\"if\" value=\"{{canCreate}}\"> <a href=\"#/contacts/create\" class=\"btn btn-primary\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" style=\"margin-right:8px\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg> Add Contact </a> </template> </header> <div class=\"filter-bar\"> <input type=\"text\" lyte-model=\"searchTerm\" oninput=\"{{action('onSearch')}}\" class=\"form-input search-input\" placeholder=\"Search contacts...\"> <select lyte-model=\"selectedCompany\" onchange=\"{{action('onCompanyFilter')}}\" class=\"form-select company-select\"> <option value=\"\">All Companies</option> <option is=\"for\" lyte-for=\"true\" items=\"{{companyList}}\" item=\"comp\" index=\"i\"></option> </select> </div> <div class=\"card\"> <template is=\"if\" value=\"{{isLoading}}\"> <div class=\"loading-state\"> <div class=\"spinner\"></div> </div> </template> <template is=\"else\"> <template is=\"if\" value=\"{{displayedContacts.length === 0}}\"> <div class=\"empty-state\"> <div class=\"empty-icon\">Inbox</div> <h3>No contacts found</h3> <p>Try changing your filters or add a new contact.</p> </div> </template> <template is=\"else\"> <div class=\"contacts-list\"> <template is=\"for\" items=\"{{displayedContacts}}\" item=\"contact\" index=\"i\"> <div class=\"contact-card\" onclick=\"{{action('viewContact', contact.id)}}\"> <div class=\"contact-avatar\" style=\"background-color: {{method('getAvatarColor', contact.name)}}\"> {{method('getInitials', contact.name)}} </div> <div class=\"contact-info\"> <div class=\"contact-name\">{{contact.name}}</div> <div class=\"contact-meta\"> <template is=\"if\" value=\"{{contact.email}}\"> <span>{{contact.email}}</span> </template> <template is=\"if\" value=\"{{contact.email &amp;&amp; contact.phone}}\"> • </template> <template is=\"if\" value=\"{{contact.phone}}\"> <span>{{contact.phone}}</span> </template> </div> <div class=\"contact-company\">{{contact.companyName}}</div> </div> </div> </template> </div> </template> </template> </div> </div> </template>\n<style>.header-row {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 24px;\n}\n.header-title { font-size: 1.5rem; font-weight: 600; color: #1e293b; }\n\n.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }\n.search-input { flex: 1; max-width: 400px; }\n.company-select { max-width: 200px; }\n\n/* Contact Card Styles */\n.contact-card {\n    display: flex;\n    align-items: center;\n    gap: 16px;\n    padding: 16px;\n    border-bottom: 1px solid #e2e8f0;\n    transition: background-color 0.2s;\n    cursor: pointer;\n}\n.contact-card:hover { background-color: #f8fafc; }\n.contact-card:last-child { border-bottom: none; }\n\n.contact-avatar {\n    width: 48px;\n    height: 48px;\n    border-radius: 50%;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 1rem;\n    font-weight: 600;\n    color: white;\n    flex-shrink: 0;\n}\n\n.contact-info { flex: 1; min-width: 0; }\n.contact-name { font-size: 1rem; font-weight: 600; color: #1e293b; }\n.contact-meta { font-size: 0.875rem; color: #64748b; margin-top: 2px; }\n.contact-company { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; }\n\n/* States */\n.loading-state { padding: 40px; display: flex; justify-content: center; }\n.empty-state { padding: 40px; text-align: center; color: #64748b; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,3]},{"type":"if","position":[1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,3,1]},{"type":"attr","position":[1,3,3]},{"type":"attr","position":[1,3,3,3]},{"type":"for","position":[1,3,3,3],"dynamicNodes":[{"type":"attr","position":[1]},{"type":"text","position":[1,0]}],"actualTemplate":"<template is=\"for\" items=\"{{companyList}}\" item=\"comp\" index=\"i\"> <option value=\"{{comp.id}}\">{{comp.name}}</option> </template>"},{"type":"attr","position":[1,5,1]},{"type":"if","position":[1,5,1],"cases":{},"default":{}}],
_observedAttributes :["allContacts","displayedContacts","companyList","searchTerm","selectedCompany","isLoading","canCreate"],

	services: ["auth", "crm-api"],

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

	didConnect: async function() {
		this.setData('canCreate', this.auth.hasPermission('CONTACT_CREATE'));

		this.loadCompanies();
		this.loadContacts();
	},

	methods: {
		loadCompanies: async function() {
			try {
				let res = await this.crmApi.companies.list();
				if (res.success) this.setData('companyList', res.data);
			} catch (e) { console.error(e); }
		},

		loadContacts: async function() {
			this.setData('isLoading', true);
			try {
				let params = {};
				let compId = this.getData('selectedCompany');
				if (compId) params.companyId = compId;

				let res = await this.crmApi.contacts.list(params);

				if (res.success) {
					let contacts = res.data || [];
					this.setData('allContacts', contacts);
					// Apply current search term immediately
					this.applyClientFilter();
				}
			} catch (e) {
				console.error("Failed to load contacts", e);
			} finally {
				this.setData('isLoading', false);
			}
		},

		applyClientFilter: function() {
			let term = this.getData('searchTerm').toLowerCase().trim();
			let all = this.getData('allContacts');

			if (!term) {
				this.setData('displayedContacts', all);
				return;
			}

			let filtered = all.filter(function(c) {
				return (c.name && c.name.toLowerCase().includes(term)) ||
					(c.email && c.email.toLowerCase().includes(term)) ||
					(c.phone && c.phone.includes(term));
			});

			this.setData('displayedContacts', filtered);
		},

		getAvatarColor: function(name) {
			if(!window.Utils) return '#1a73e8';
			return Utils.getAvatarColor(name);
		},

		getInitials: function(name) {
			if(!window.Utils) return 'U';
			return Utils.getInitials(name);
		}
	},

	actions: {
		onSearch: function() {
			this.applyClientFilter();
		},

		onCompanyFilter: function() {
			this.loadContacts();
		},

		viewContact: function(id) {
			Lyte.Router.transport("#/contacts/" + id);
		}
	}
});
Lyte.Component.register("crm-app", {
_template:"<template tag-name=\"crm-app\"> <div class=\"app-container\"> <crm-sidebar class=\"sidebar\"></crm-sidebar> <main class=\"main-content\"> <lyte-outlet yield=\"true\"></lyte-outlet> </main> </div> </template>\n<style>/* ========================================\n   APP CONTAINER\n   ======================================== */\n.app-container {\n    display: flex;\n    min-height: 100vh;\n    width: 100%;\n    overflow: hidden; /* Prevent double scrollbars */\n}\n\n/* ========================================\n   SIDEBAR (The Component Wrapper)\n   ======================================== */\n/* This targets the <crm-sidebar> tag directly */\ncrm-sidebar.sidebar {\n    width: 260px;\n    height: 100vh;\n    background-color: #ffffff;\n    border-right: 1px solid #e2e8f0;\n    flex-shrink: 0;\n    transition: width 0.3s ease;\n    display: flex;\n    flex-direction: column;\n}\n\n/* Inner wrapper styles */\n.sidebar-inner {\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    width: 100%;\n}\n\n/* Collapse Logic */\ncrm-sidebar.sidebar.collapsed {\n    width: 80px;\n}\n\n/* ========================================\n   MAIN CONTENT\n   ======================================== */\n.main-content {\n    flex: 1;\n    /* Removed margin-left because Flexbox handles the positioning automatically now */\n    height: 100vh;\n    overflow-y: auto;\n    background-color: #f8fafc;\n    padding: 0; /* Let children handle padding */\n}</style>",
_dynamicNodes : [{"type":"componentDynamic","position":[1,1]},{"type":"componentDynamic","position":[1,3,1]}],

	data : function(){
		return {

		}		
	},
	actions : {
		// Functions for event handling
	},
	methods : {
		// Functions which can be used as callback in the component.
	},
	style: ["components/styles/components.css"]
});

Lyte.Component.register("crm-sidebar", {
_template:"<template tag-name=\"crm-sidebar\"> <div class=\"sidebar-inner {{expHandlers(isCollapsed,'?:','collapsed','')}}\"> <div class=\"sidebar-header\"> <div class=\"logo\"> <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"></path><path d=\"M2 17l10 5 10-5\"></path><path d=\"M2 12l10 5 10-5\"></path></svg> </div> <span class=\"logo-text\" onclick=\"{{action('toggleSidebar')}}\">Mini CRM</span> </div> <nav class=\"sidebar-nav\"> <a href=\"#/dashboard\" class=\"nav-item\"> <span class=\"icon\"></span> <span class=\"text\">Dashboard</span> </a> <br> <template is=\"if\" value=\"{{canViewCompanies}}\"> <a href=\"#/companies\" class=\"nav-item\"> <span class=\"icon\"></span> <span class=\"text\">Companies</span> </a> </template> <br> <a href=\"#/contacts\" class=\"nav-item\"> <span class=\"icon\"></span> <span class=\"text\">Contacts</span> </a> </nav> <div class=\"sidebar-footer\"> <div class=\"user-info\"> <div class=\"avatar\">{{userInitials}}</div> <div class=\"details\"> <span class=\"name\">{{userName}}</span> <span class=\"role\">{{userRole}}</span> </div> </div> <button onclick=\"{{action('logout')}}\" class=\"logout-btn\"> <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path><polyline points=\"16 17 21 12 16 7\"></polyline><line x1=\"21\" y1=\"12\" x2=\"9\" y2=\"12\"></line></svg> </button> </div> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1]},{"type":"attr","position":[1,1,3]},{"type":"attr","position":[1,3,5]},{"type":"if","position":[1,3,5],"cases":{},"default":{}},{"type":"text","position":[1,5,1,1,0]},{"type":"text","position":[1,5,1,3,1,0]},{"type":"text","position":[1,5,1,3,3,0]},{"type":"attr","position":[1,5,3]}],
_observedAttributes :["isCollapsed","userName","userRole","userInitials"],

	services: ["auth"],

	data: function() {
		return {
			isCollapsed: Lyte.attr("boolean", { default: false }),
			userName: Lyte.attr("string", { default: "User" }),
			userRole: Lyte.attr("string", { default: "Guest" }),
			userInitials: Lyte.attr("string", { default: "U" })
		}
	},

	didConnect: function() {
		let auth = this.auth;

		if (auth) {
			auth.init();
			let user = auth.getUser();

			if (user) {
				this.setData('userName', user.fullName);
				this.setData('userRole', user.roleName);
				this.setData('userInitials', user.fullName ? user.fullName.charAt(0) : "U");

				this.setData('canViewCompanies', auth.canAccess('companies'));
				this.setData('canViewContacts', auth.canAccess('contacts'));
				this.setData('canCreateContacts', auth.canAccess('contacts'));
			}
		}
	},

	actions: {
		toggleSidebar: function() {
			this.setData('isCollapsed', !this.getData('isCollapsed'));
		},

		logout: function() {
			localStorage.removeItem('user');
			window.location.href = "/login.html";
		}
	},

	methods: {
		canAccess: function(module) {
			return this.auth.canAccess(module);
		}
	}
});
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

Lyte.Component.register("crm-dashboard", {
_template:"<template tag-name=\"crm-dashboard\"> <div class=\"dashboard-container\" style=\"padding: 2rem;\"> <h1>CRM Dashboard</h1> <p>Welcome to your CRM Dashboard.</p> <div style=\"margin-top: 2rem;\"> <p>Select a module from the sidebar to get started.</p> </div> </div> </template>",
_dynamicNodes : [],

	data : function(){
		return {}
	}
});

Lyte.Component.register("login-comp", {
_template:"<template tag-name=\"login-comp\"> <div class=\"login-wrapper\" style=\"display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f7f6;\"> <div class=\"card form-container\" style=\"width: 100%; max-width: 400px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\"> <div class=\"card-body\"> <h2 class=\"form-title\" style=\"text-align: center; margin-bottom: 2rem; color: #333;\">Login</h2> <template is=\"if\" value=\"{{error}}\"> <div class=\"alert alert-error\" style=\"background-color: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 1rem;\">{{error}}</div> </template> <div class=\"form-group\" style=\"margin-bottom: 1rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Username</label> <input type=\"text\" lyte-model=\"username\" class=\"form-input\" placeholder=\"Username\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-group\" style=\"margin-bottom: 1.5rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Password</label> <input type=\"password\" lyte-model=\"password\" class=\"form-input\" placeholder=\"Password\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-actions\"> <button class=\"btn btn-primary\" onclick=\"{{action('login')}}\" disabled=\"{{isLoading}}\" style=\"width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;\"> <template is=\"if\" value=\"{{isLoading}}\">Loading...</template> <template is=\"else\">Login</template> </button> </div> </div> </div> </div> </template>",
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

            if (!username) {
                let uInput = this.$node.querySelector("input[lyte-model='username']");
                if (uInput && uInput.value) {
                    username = uInput.value;
                    this.setData('username', username);
                }
            }
            if (!password) {
                 let pInput = this.$node.querySelector("input[lyte-model='password']");
                 if (pInput && pInput.value) {
                     password = pInput.value;
                     this.setData('password', password);
                 }
            }

            console.log("Login attempt:", username, "Password length:", password ? password.length : 0);

            if(!username || !password) {
                this.setData('error', 'Please enter username and password');
                return;
            }

            this.setData('isLoading', true);
            this.setData('error', '');

            let auth = this.auth;
            // let auth = this.services('auth');

            if(!auth) {
                console.log("Component Services:", this.services);
                console.log("Component Context:", this);
            }

            if (!auth) {
                console.warn("Auth service not injected via 'this.auth'. Intentional fallback search.");
                if (typeof $L !== 'undefined' && $L.getService) {
                    auth = $L.getService("auth");
                }
                else if (Lyte.Service && Lyte.Service.getService) {
                    // auth = Lyte.Service.getService("auth");
                }
            }

            if (!auth) {
                 console.error("CRITICAL: Auth service could not be found.");
                 this.setData('error', "System Error: Authentication Service Unavailable");
                 this.setData('isLoading', false);
                 return;
            }

            try {
                auth.login(username, password)
                .then(function(res) {
                    console.log("Login successful", res);
                    self.setData('isLoading', false);
                    Lyte.Router.transitionTo('dashboard');
                })
                .catch(function(err) {
                    console.error("Login rejected", err);
                    self.setData('isLoading', false);
                    let msg = "Invalid Credentials";
                    if(err && err.data && err.data.message) {
                        msg = err.data.message;
                    } else if (err && err.message) {
                         msg = err.message;
                    }
                    self.setData('error', msg);
                });
            } catch (e) {
                console.error("Login action crashed synchronously:", e);
                self.setData('isLoading', false);
                self.setData('error', "System Error: " + e.message);
            }
        }
    }
    },
    {
        services : ["auth"]
    });
