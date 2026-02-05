Lyte.Router.registerRoute("crm-app.activity-edit", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "activity-edit"};
    }
});