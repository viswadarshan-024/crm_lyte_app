Lyte.Service.register("api", {
    // 1. Define properties directly (No constructor needed)
    BASE_URL: 'http://localhost:8181/mini_crm',

    // 2. Define methods as properties of the object
    request: function(endpoint, options) {
        options = options || {};
        // Access properties using 'this'
        let url = this.BASE_URL + '/' + endpoint;
        let method = options.method || "GET";
        let headers = options.headers || { 'Accept': 'application/json' };

        // Handle Content-Type for POST
        if (method === "POST" && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        // 3. Use Lyte.Ajax (Standard Lyte HTTP client)
        return Lyte.Ajax({
            url: url,
            method: method,
            headers: headers,
            data: options.body,
            xhrFields: {
                withCredentials: true
            }
        }).then(function(data) {
            // Handle response data normalization
            if (data.responseData !== undefined && data.data === undefined) {
                data.data = data.responseData;
            }
            return data;
        }).catch(function(err) {
            console.error("API Error:", err);
            // Handle Unauthorized access
            if (err.statusCode === 401) {
                localStorage.removeItem('user');
                window.location.href = "/";
            }
            throw err;
        });
    }
});