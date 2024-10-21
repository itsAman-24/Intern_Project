import React, { useState, useEffect } from "react";

const CLIENT_ID =
  "185857993825-hfq3ktgd1agepcsq1ftgk31grhn39nec.apps.googleusercontent.com";
const CUSTOMER_ID = "C03wxnceb";
const SCOPES = "https://www.googleapis.com/auth/admin.directory.user.readonly";

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/admin/directory_v1/rest",
  // 'https://www.googleapis.com/discovery/v1/apis/admin/groups_v1/rest'
];

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [users, setUsers] = useState([]);
  // const [groups, setGroups] = useState([]);

  const styles = {
    padding: "4px 8px",
    border: "2px solid black",
    cursor: "pointer",
    backgroundColor: "red",
    borderRadius: "2px",
  };

  useEffect(() => {
    const loadGapi = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        const API = `https://apis.google.com/js/api.js`;
        script.src = API;
        script.onload = () => {
          resolve(window.gapi);
        };
        document.body.appendChild(script);
      });
    };

    const handleGoogleSignIn = async () => {
      await loadGapi();

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("signInButton"),
        {
          theme: "outline",
          size: "large",
        }
      );
    };

    handleGoogleSignIn();
  }, [isSignedIn]);

  // Handles the authentication response
  const handleCredentialResponse = (response) => {
    const token = response.credential;
    console.log("Access Token:", token);

    // Initializing Google API client
    window.gapi.load("client", () => {
      initClient(token);
    });
  };

  // Initializing Google API client with the access token
  const initClient = (token) => {
    window.gapi.client
      .init({
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(() => {
        // Set the access token for authorized requests
        window.gapi.client.setToken({
          access_token: token, // Ensure this token is valid and not undefined
        });
        setIsSignedIn(true);

        // Fetch users and groups only after successful sign-in
        // fetchUsers();
        // fetchGroups();

        // Fetch users using fetch
        fetch(
          "https://www.googleapis.com/admin/directory/v1/users?customer=C03wxnceb&maxResults=10&orderBy=email",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, 
              "Content-Type": "application/json",
            },
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            console.log(data);
            setUsers(data.users || []); // Update your users state with the fetched data
          })
          .catch((error) => console.error("Error fetching users:", error));
      })
      .catch((error) => {
        console.error("Error initializing GAPI client: ", error);
      });
  };

  // Fetches users from Google Workspace Directory API
  const fetchUsers = () => {
    window.gapi.client.directory.users
      .list({
        customer: CUSTOMER_ID,
        maxResults: 10,
        orderBy: "email",
      })
      .then((response) => {
        console.log("Fetched Users:", response); // Log the response to check
        setUsers(response.result.users || []);
      })
      .catch((error) => {
        console.error("Error fetching users: ", error);
      });
  };

  // Fetches groups from Google Workspace Directory API
  // const fetchGroups = () => {
  //   window.gapi.client.directory.groups.list({
  //     customer: CUSTOMER_ID,
  //     maxResults: 10,
  //   }).then(response => {
  //     console.log('Fetched Groups:', response); // Log the response to check
  //     setGroups(response.result.groups || []);
  //   }).catch((error) => {
  //     console.error('Error fetching groups: ', error);
  //   });
  // };

  console.log(isSignedIn);

  const handleSignOut = () => {
    setIsSignedIn(false);
  };

  return (
    <div className="app">
      <h1>Google Workspace API Demo</h1>

      {!isSignedIn ? (
        <div id="signInButton"></div>
      ) : (
        <div style={styles} onClick={handleSignOut}>
          Sign out
        </div>
      )}

      {isSignedIn && (
        <div className="data">
          <div className="userData">
            <h2>Users</h2>
            {users.length > 0 ? (
              <ul>
                {users.map((user) => (
                  <li key={user.id}>
                    {user.primaryEmail} ({user.name.fullName})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No users found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
