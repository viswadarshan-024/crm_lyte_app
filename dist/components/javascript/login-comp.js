Lyte.Component.register("login-comp", {
_template:"<template tag-name=\"login-comp\"> <div class=\"login-wrapper\" style=\"display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f7f6;\"> <div class=\"card form-container\" style=\"width: 100%; max-width: 400px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\"> <div class=\"card-body\"> <h2 class=\"form-title\" style=\"text-align: center; margin-bottom: 2rem; color: #333;\">Login</h2> <template is=\"if\" value=\"{{error}}\"> <div class=\"alert alert-error\" style=\"background-color: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; margin-bottom: 1rem;\">{{error}}</div> </template> <div class=\"form-group\" style=\"margin-bottom: 1rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Username</label> <input type=\"text\" lyte-model=\"username\" class=\"form-input\" placeholder=\"Username\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-group\" style=\"margin-bottom: 1.5rem;\"> <label style=\"display: block; margin-bottom: 0.5rem; color: #666;\">Password</label> <input type=\"password\" lyte-model=\"password\" class=\"form-input\" placeholder=\"Password\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;\"> </div> <div class=\"form-actions\"> <button class=\"btn btn-primary\" onclick=\"{{action('login')}}\" disabled=\"{{isLoading}}\" style=\"width: 100%; padding: 0.75rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;\"> <template is=\"if\" value=\"{{isLoading}}\">Loading...</template> <template is=\"else\">Login</template> </button> </div> </div> </div> </div> </template>\n<style>/* Wrapper to hold the gradient background only for this page */\n.login-wrapper {\n    min-height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    padding: 20px;\n    width: 100%;\n}\n\n.login-container { width: 100%; max-width: 420px; }\n\n.login-card {\n    background: #ffffff; border-radius: 16px;\n    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); overflow: hidden;\n}\n\n.login-header { padding: 40px 40px 24px; text-align: center; }\n.logo {\n    width: 64px; height: 64px;\n    background: linear-gradient(135deg, #2563eb 0%, #4285f4 100%);\n    border-radius: 16px; display: flex; align-items: center; justify-content: center;\n    margin: 0 auto 20px; color: white; font-weight: bold; font-size: 24px;\n}\n.login-title { font-size: 24px; font-weight: 700; color: #202124; margin-bottom: 8px; margin-top: 0; }\n.login-subtitle { font-size: 14px; color: #5f6368; margin: 0; }\n\n.login-body { padding: 0 40px 40px; }\n.form-group { margin-bottom: 20px; }\n.form-label { display: block; font-size: 13px; font-weight: 500; color: #202124; margin-bottom: 8px; }\n\n.form-input-wrapper { position: relative; }\n.form-input {\n    width: 100%; height: 48px; padding: 0 16px;\n    border: 1px solid #dadce0; border-radius: 8px; font-size: 15px;\n    color: #202124; background-color: #ffffff;\n    box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s;\n}\n.form-input:focus { outline: none; border-color: #1a73e8; box-shadow: 0 0 0 3px #e8f0fe; }\n\n.password-toggle {\n    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);\n    background: none; border: none; cursor: pointer; color: #80868b; padding: 4px;\n}\n.password-toggle:hover { color: #202124; }\n\n.remember-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }\n.remember-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #5f6368; }\n\n.btn-login {\n    width: 100%; height: 48px; background: #1a73e8; color: white;\n    border: none; border-radius: 8px; font-size: 15px; font-weight: 600;\n    cursor: pointer; transition: background-color 0.2s;\n    display: flex; align-items: center; justify-content: center; gap: 8px;\n}\n.btn-login:hover { background: #1557b0; }\n.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }\n\n.spinner {\n    width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3);\n    border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;\n}\n@keyframes spin { to { transform: rotate(360deg); } }\n\n.login-alert {\n    padding: 12px 16px; margin-bottom: 20px; border-radius: 8px; font-size: 13px;\n}\n.login-alert.error { background-color: #fce8e6; color: #d93025; border: 1px solid #f5c6cb; }\n\n.login-footer {\n    padding: 20px 40px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #dadce0;\n}\n.login-footer p { font-size: 12px; color: #80868b; margin: 0; }\n\n@keyframes shake {\n    0%, 100% { transform: translateX(0); }\n    25% { transform: translateX(-8px); }\n    75% { transform: translateX(8px); }\n}\n.shake { animation: shake 0.3s ease-in-out; }</style>",
_dynamicNodes : [{"type":"attr","position":[1,1,1,3]},{"type":"if","position":[1,1,1,3],"cases":{},"default":{}},{"type":"attr","position":[1,1,1,9,1]},{"type":"attr","position":[1,1,1,9,1,1]},{"type":"if","position":[1,1,1,9,1,1],"cases":{},"default":{}}],
_observedAttributes :["username","password","error","isLoading"],

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