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