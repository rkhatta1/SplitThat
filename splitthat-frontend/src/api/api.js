const api = {
  async fetch(url, options = {}) {
    let jwt = localStorage.getItem("jwt");

    const headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };

    if (jwt) {
      headers["Authorization"] = `Bearer ${jwt}`;
    }

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        const refreshResponse = await fetch("http://localhost:8000/api/v1/auth/refresh-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const { access_token } = await refreshResponse.json();
          localStorage.setItem("jwt", access_token);
          headers["Authorization"] = `Bearer ${access_token}`;
          response = await fetch(url, { ...options, headers });
        }
      }
    }

    return response;
  },
};

export default api;
