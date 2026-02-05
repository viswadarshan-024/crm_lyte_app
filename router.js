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