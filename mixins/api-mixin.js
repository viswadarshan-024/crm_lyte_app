Lyte.Mixin.register("api-mixin", {

    apiRequest: function(endpoint, options) {
        var API_BASE_URL = 'http://localhost:8181/mini_crm';
        options = options || {};

        if (endpoint.charAt(0) === '/') endpoint = endpoint.substring(1);

        let url = API_BASE_URL + '/' + endpoint;
        let method = (options.method || "GET").toUpperCase();
        let headers = options.headers || { 'Accept': 'application/json' };

        // Default Content-Type for write operations
        if (method !== 'GET' && method !== 'HEAD' && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        let fetchConfig = {
            method: method,
            headers: headers,
            credentials: 'include'
        };

        // --- CRITICAL FIX: Handle Body vs Query Params ---
        if (options.body) {
            if (method === 'GET' || method === 'HEAD') {
                // 1. For GET: Convert body object to URL Query String (?key=value)
                let params = options.body;
                let queryString = Object.keys(params).map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');

                if (queryString) {
                    url += (url.includes('?') ? '&' : '?') + queryString;
                }
            } else {
                // 2. For POST/PUT: Send as JSON Body
                if (headers['Content-Type'] && headers['Content-Type'].includes('json')) {
                    fetchConfig.body = JSON.stringify(options.body);
                } else {
                    fetchConfig.body = options.body;
                }
            }
        }

        return fetch(url, fetchConfig)
            .then(function(response) {
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('user');
                        window.location.href = "/";
                        throw new Error("Unauthorized");
                    }
                    return response.text().then(function(text) {
                        let errData;
                        try { errData = text ? JSON.parse(text) : {}; }
                        catch (e) { errData = { message: text }; }
                        let error = new Error(errData.message || "API Error");
                        error.data = errData;
                        throw error;
                    });
                }
                return response.json();
            })
            .then(function(data) {
                if (data.responseData !== undefined && data.data === undefined) {
                    data.data = data.responseData;
                }
                return data;
            });
    }
});