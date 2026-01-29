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
