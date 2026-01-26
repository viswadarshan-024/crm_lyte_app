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
