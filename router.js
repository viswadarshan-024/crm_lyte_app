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