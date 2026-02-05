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