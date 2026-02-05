Lyte.Router.registerRoute("crm-app.activity-create", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "activity-create"};
    }
});