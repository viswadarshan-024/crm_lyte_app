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

        // --- Body / Query handling (unchanged) ---
        if (options.body) {
            if (method === 'GET' || method === 'HEAD') {
                let params = options.body;
                let queryString = Object.keys(params).map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');

                if (queryString) {
                    url += (url.includes('?') ? '&' : '?') + queryString;
                }
            } else {
                if (headers['Content-Type'] && headers['Content-Type'].includes('json')) {
                    fetchConfig.body = JSON.stringify(options.body);
                } else {
                    fetchConfig.body = options.body;
                }
            }
        }

        return fetch(url, fetchConfig)
            .then(async function(response) {

                if (response.status === 401) {
                    localStorage.removeItem('user');
                    window.location.href = "/";
                    throw new Error("Unauthorized");
                }

                if (!response.ok) {
                    const text = await response.text();
                    let errData;
                    try { errData = text ? JSON.parse(text) : {}; }
                    catch (e) { errData = { message: text }; }
                    let error = new Error(errData.message || "API Error");
                    error.data = errData;
                    throw error;
                }

                // --------- ONLY FIX: SAFE JSON PARSING ---------
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    return response.json();
                } else {
                    const text = await response.text();
                    throw new Error("Expected JSON but received HTML:\n" + text.substring(0, 300));
                }
            })
            .then(function(data) {
                if (data && data.responseData !== undefined && data.data === undefined) {
                    data.data = data.responseData;
                }
                return data;
            });
    }
});
