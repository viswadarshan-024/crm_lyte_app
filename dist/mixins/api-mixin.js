Lyte.Mixin.register("api-mixin", {

    apiRequest: function(endpoint, options) {
        var API_BASE_URL = 'http://localhost:8181/mini_crm';
        options = options || {};

        if (endpoint.charAt(0) === '/') endpoint = endpoint.substring(1);

        let url = API_BASE_URL + '/' + endpoint;
        let method = (options.method || "GET").toUpperCase();

        // Default Headers
        let headers = options.headers || {};
        if (!headers['Accept']) {
            headers['Accept'] = 'application/json';
        }

        let fetchConfig = {
            method: method,
            headers: headers,
            credentials: 'include'
        };

        // --- Body Handling ---
        if (options.body) {
            if (method === 'GET' || method === 'HEAD') {
                // GET: Convert body to Query String
                let params = options.body;
                let queryString = Object.keys(params).map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');

                if (queryString) {
                    url += (url.includes('?') ? '&' : '?') + queryString;
                }
            } else {
                // POST/PUT/DELETE: Handle Payload

                // 1. If sending raw FormData (e.g. file uploads)
                if (options.body instanceof FormData) {
                    fetchConfig.body = options.body;
                    // Note: Content-Type header is NOT set here; browser sets it automatically with boundary
                }
                    // 2. Default: Convert Object -> URLSearchParams (x-www-form-urlencoded)
                // This matches your working Vanilla JS logic
                else {
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';

                    const params = new URLSearchParams();
                    const data = options.body;

                    // Loop keys to handle Arrays (e.g., permissionIds) correctly for Struts2
                    Object.keys(data).forEach(function(key) {
                        const value = data[key];
                        if (value !== null && value !== undefined) {
                            if (Array.isArray(value)) {
                                // Append same key multiple times: ids=1&ids=2
                                value.forEach(function(v) {
                                    params.append(key, v);
                                });
                            } else {
                                params.append(key, value);
                            }
                        }
                    });

                    fetchConfig.body = params; // Fetch API handles stringifying this
                }
            }
        }

        // --- Execute Request ---
        return fetch(url, fetchConfig)
            .then(async function(response) {

                // 1. Handle 401 Unauthorized
                if (response.status === 401) {
                    localStorage.removeItem('user');
                    // Optional: Redirect to login
                    // window.location.href = "/";
                    throw new Error("Unauthorized");
                }

                // 2. Handle Non-200 Errors
                if (!response.ok) {
                    const text = await response.text();
                    let errData;
                    try { errData = text ? JSON.parse(text) : {}; }
                    catch (e) { errData = { message: text }; }

                    let error = new Error(errData.message || "API Error (" + response.status + ")");
                    error.data = errData;
                    throw error;
                }

                // 3. Verify JSON Content-Type
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    return response.json();
                } else {
                    // Server returned HTML (e.g., standard error page or login page)
                    const text = await response.text();
                    console.error("API Error: Received HTML instead of JSON", text.substring(0, 200));
                    throw new Error("Server returned HTML format. Check authentication or server logs.");
                }
            })
            .then(function(data) {
                // Normalize Struts2 JSON Plugin wrapper
                if (data && data.responseData !== undefined && data.data === undefined) {
                    data.data = data.responseData;
                }
                return data;
            });
    }
});