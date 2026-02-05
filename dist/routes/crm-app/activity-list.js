Lyte.Router.registerRoute("crm-app.activity-list", {
    model: function() {
        return {};
    },
    renderTemplate : function()	{
        return {
            outlet: "#crm_inner_outlet",
            component : "activity-list"};
    }
});