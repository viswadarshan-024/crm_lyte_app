Lyte.Router.registerRoute("crm-app.profile-view", {
    model: function() {
        return {};
    },
    renderTemplate: function () {
        return {
            // UNCOMMENT THIS and match the ID from Step 1
            outlet: "#crm_inner_outlet",
            component: "profile-view"
        };
    }
});