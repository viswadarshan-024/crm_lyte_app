Lyte.Component.register("crm-app", {
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