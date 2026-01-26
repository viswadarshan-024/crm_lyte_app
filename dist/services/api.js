Lyte.Service.register("api", class ApiService {

    constructor() {
        this.BASE_URL = 'http://localhost:8181/mini_crm';
    }


    request(endpoint, options) {
        options = options || {};
        let url = this.BASE_URL + '/' + endpoint;
        let method = options.method || "GET";
        let headers = options.headers || { 'Accept': 'application/json' };

        if (method === "POST" && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        return Lyte.ajax({
            url: url,
            method: method,
            headers: headers,
            data: options.body,
            xhrFields: {
                withCredentials: true
            }
        }).then(function(data) {
            if (data.responseData !== undefined && data.data === undefined) {
                data.data = data.responseData;
            }
            return data;
        }).catch(function(err) {
            console.error("API Error:", err);
            if (err.statusCode === 401) {
                localStorage.removeItem('user');
                window.location.href = "/";
            }
            throw err;
        });
    }
});