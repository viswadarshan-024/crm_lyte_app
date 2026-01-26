Lyte.Router.configureRoutes(function() {
    this.route('login', { path: '/login', component: 'login-comp' });

	this.route('crm-app', { path: '/', component: 'crm-app' }, function() {

		this.route('dashboard', { path: '/dashboard', component: 'crm-dashboard' });

		this.route('companies', { path: '/companies' });

		this.route('contact-list', { path: '/contacts', component: 'contact-list' });

		this.route('contact-create', { path: '/contacts/create', component: 'contact-create' });
	});
});