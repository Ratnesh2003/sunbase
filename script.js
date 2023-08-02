

// Helper function to call API
async function fetchAPI(url, method, headers, payload = null) {
    try {
        const response = await fetch(url, {
            method,
            headers,
            body: payload ? JSON.stringify(payload) : null
        });

        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response.json();
    } catch (error) {
        console.log(error);
    }
}
async function fetchAPINoJson(url, method, headers, payload = null) {
    try {
        const response = await fetch(url, {
            method,
            headers,
            body: payload ? JSON.stringify(payload) : null
        });

        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    } catch (error) {
        console.log(error);
    }
}
// Login function
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginPayload = {
        login_id: email,
        password: password
    };

    fetchAPI("https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp", "POST", {}, loginPayload)
        .then(data => {
            if (data.access_token === null)
                alert("Authentication error!!");
            else {
                localStorage.setItem("authToken", data.access_token);
                authToken = data.access_token;
                window.location.href = "customer-list.html";
            }
        });
}

async function getCustomerList() {
    fetchAPI("https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=get_customer_list", "GET", {
        "Authorization": "Bearer " + localStorage.getItem("authToken")
    })
        .then(data => {
            displayCustomerList(data);
        });

}

async function displayCustomerList(customers) {
    const customerTable = document.getElementById("customerTable");
    customers.forEach(customer => {
        const customerString = JSON.stringify(customer);
        const row =
            `<tr>
            <td>${customer.first_name}</td>
            <td>${customer.last_name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>
            <button onclick='storeCustomerDetails(${customerString})'>Edit</button>
            <button onclick="deleteCustomer('${customer.uuid}')">Delete</button>
            </td>
        </tr>`;
        customerTable.innerHTML += row;
    });
}

async function createCustomer() {
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const street = document.getElementById('street').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    const payload = {
        first_name: firstName,
        last_name: lastName,
        street,
        address,
        city,
        state,
        email,
        phone,
    };

    fetchAPINoJson("https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=create", "POST", 
    { "Authorization": "Bearer " + localStorage.getItem("authToken") }, payload)
    .then(data => {
        if (data.status === 201) {
            alert("Customer created successfully");
            window.location.href = "customer-list.html";
        }
        else
            alert("Error creating customer");
    });

}

async function deleteCustomer(uuid) {
    if (confirm("Are you sure you want to delete this customer?")) {
        fetchAPINoJson("https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=delete&uuid=" + uuid, "POST", {
            'Authorization': 'Bearer ' + localStorage.getItem("authToken")
        })
        .then(data => {
            if (data.status === 200) {
                alert("Customer deleted successfully");
                window.location.href = "customer-list.html";
            }
            else if (data.status === 400) {
                alert("UUID Not found");
            }
            else {
                alert("Error deleting customer");
            }
        });
    }
}


async function storeCustomerDetails(customer) {
    sessionStorage.setItem("customer", JSON.stringify(customer));
    window.location.href = "edit-customer.html";
}

async function editCustomerForm() {
    const customer = JSON.parse(sessionStorage.getItem("customer"));
    document.getElementById('first_name').value = customer.first_name;
    document.getElementById('last_name').value = customer.last_name;
    document.getElementById('street').value = customer.street;
    document.getElementById('address').value = customer.address;
    document.getElementById('city').value = customer.city;
    document.getElementById('state').value = customer.state;
    document.getElementById('email').value = customer.email;
    document.getElementById('phone').value = customer.phone;
}

async function updateCustomer() {
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const street = document.getElementById('street').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    const payload = {
        first_name: firstName,
        last_name: lastName,
        street,
        address,
        city,
        state,
        email,
        phone,
    };

    fetchAPINoJson("https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp?cmd=update&uuid=" + JSON.parse(sessionStorage.getItem("customer")).uuid, "POST", 
    {'Authorization': 'Bearer ' + localStorage.getItem("authToken")}, payload)
    .then(data => {
        if (data.status === 200) {
            alert("Customer updated successfully");
            window.location.href = "customer-list.html";
        }
        else if (data.status === 500) {
            alert("UUID Not found");
        }
        else if (data.status === 400) {
            alert("Body is empty");
        }
        else {
            alert("Error updating customer");
        }
    });
}

async function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "index.html";
}