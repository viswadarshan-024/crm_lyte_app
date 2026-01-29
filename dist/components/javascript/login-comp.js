Lyte.Component.register("login-comp", {
_template:"<template tag-name=\"login-comp\"> <div class=\"login-wrapper\" style=\"display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f7f6;\"> <div class=\"card form-container\" style=\"width: 100%; max-width: 400px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\"> <div class=\"card-body\"> <h2 class=\"form-title\" style=\"text-align: center; margin-bottom: 2rem; color: #333;\">Login</h2> <template is=\"if\" value=\"{{error}}\"> <div class=\"alert alert-error\" style=\"background-color: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 1rem;\">{{error}}</div> </template> <div class=\"form-group\" style=\"margin-bottom: 1rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Username</label> <input type=\"text\" lyte-model=\"username\" class=\"form-input\" placeholder=\"Username\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-group\" style=\"margin-bottom: 1.5rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Password</label> <input type=\"password\" lyte-model=\"password\" class=\"form-input\" placeholder=\"Password\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-actions\"> <button class=\"btn btn-primary\" onclick=\"{{action('login')}}\" disabled=\"{{isLoading}}\" style=\"width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;\"> <template is=\"if\" value=\"{{isLoading}}\">Loading...</template> <template is=\"else\">Login</template> </button> </div> </div> </div> </div> </template>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,3]},{"type":"if","position":[1,1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,1,1,9,1]},{"type":"attr","position":[1,1,1,9,1,1]},{"type":"if","position":[1,1,1,9,1,1],"cases":{},"default":{}}],
_observedAttributes :["username","password","error","isLoading"],

    // 1. LOAD MIXIN instead of Service
    // Ensure 'auth-mixin' (and 'api-mixin') are loaded in index.html
    // mixins: ["auth-mixin"],

    data : function(){
        return {
            username : Lyte.attr("string", { default: "ceo" }),
            password : Lyte.attr("string", { default: "password" }),
            error : Lyte.attr("string", { default: "" }),
            isLoading : Lyte.attr("boolean", { default: false })
        }
    },

    actions : {
        login : function() {
            let self = this;
            let username = this.getData('username');
            let password = this.getData('password');

            console.log("Login attempt:", username);

            if(!username || !password) {
                this.setData('error', 'Please enter username and password');
                return;
            }

            this.setData('isLoading', true);
            this.setData('error', '');

            // 2. CALL MIXIN METHOD DIRECTLY
            // 'loginUser' is defined in auth-mixin.js and merged into 'this'
            this.loginUser(username, password)
                .then(function(res) {
                    console.log("Login successful", res);
                    self.setData('isLoading', false);
                    Lyte.Router.transitionTo('crm-app.crm-dashboard');
                })
                .catch(function(err) {
                    console.error("Login rejected", err);
                    self.setData('isLoading', false);

                    let msg = "Invalid Credentials";
                    if(err && err.data && err.data.message) {
                        msg = err.data.message;
                    } else if (err.message) {
                        msg = err.message;
                    }
                    self.setData('error', msg);
                });
        }
    }
},
    { mixins: ["api-mixin", "crm-api-mixin", "auth-mixin"]}
);