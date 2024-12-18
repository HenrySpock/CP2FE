import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({
  user: null,
  setUser: () => {},
  isAdmin: false,
  isAuthenticated: false, 
  login: () => {}, 
  logout: () => {}, 



  //TALLYING 01
  unreadUserNotifications: 0, 
  setUnreadUserNotifications: () => {},
  unreadUserMessages: 0,
  setUnreadUserMessages: () => {},
  unreadAdminUserMessages: 0,
  setUnreadAdminUserMessages: () => {}, 
  unreadAdminReports: 0,
  setUnreadAdminReports: () => {}, 
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
 
  //TALLYING 02
  const [unreadUserNotifications, setUnreadUserNotifications] = useState(0);
  const [unreadUserMessages, setUnreadUserMessages] = useState(0);
  const [unreadAdminUserMessages, setUnreadAdminUserMessages] = useState(0);
  const [unreadAdminReports, setUnreadAdminReports] = useState(0);
  
  let fetchUser;
  let logout;

  const login = async (userData) => {
    setUser(userData.user);   
    setIsAuthenticated(true);
    setIsAdmin(userData.user.isAdmin);  // Update isAdmin based on user data
    localStorage.setItem('token', userData.token); // Store the token in localStorage

    // console.log("Logging in, user data:", userData);
    if (userData.user && userData.user.user_id) {
      try {
        // Attempt to create an indicator if it doesn't exist 
        await fetch('http://localhost:5000/user/api/indicator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userData.user.user_id })
        });
  
        // Then update the login status
        await fetch('http://localhost:5000/user/api/indicator/login', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userData.user.user_id })
        });
      } catch (error) {
        console.error('Error updating login status:', error);
      }
    }
  };

  logout = async () => {
    // console.log('LOGGING OUT - USER_ID: ', user.user_id)
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);  // Reset isAdmin to false on logout
    localStorage.removeItem('token'); // Remove the token from localStorage

    // console.log("Logging out, user data:", user);
    if (user && user.user_id) {
      try {
        await fetch('http://localhost:5000/user/api/indicator/logout', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.user_id })
        });
      } catch (error) {
        console.error('Error updating logout status:', error);
      }
    }
  }; 

  useEffect(() => { 
    const fetchData = async () => {
      await fetchUser();
      setIsLoading(false);
    };
    fetchData();
  }, [fetchUser]);

  fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      // console.log('Token:', token);
      if (token) {
        const response = await fetch('http://localhost:5000/user/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          // console.log('User data:', userData);  
          setUser(userData);
          setIsAuthenticated(true);  
          setIsAdmin(userData.isAdmin);  

          // Check for suspension
          const suspensionResponse = await fetch(`http://localhost:5000/feedback/api/check-suspension?userEmail=${encodeURIComponent(userData.email)}`);
          // console.log('suspensionResponse: ', suspensionResponse)
          if (suspensionResponse.ok) {
            const suspensionData = await suspensionResponse.json();
            // console.log('suspensionData: ', suspensionData)
            if (suspensionData.isSuspended) {
              logout(); // Logout the user if they are suspended
            }
          }

        } else {
          console.error('Failed to fetch user:', await response.text());  // Log error message if request fails
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }; 

  return (
    <UserContext.Provider value={{ user, setUser, isAdmin, isAuthenticated, login, logout, isLoading,

      //TALLYING 03
      unreadUserNotifications, setUnreadUserNotifications,
      unreadUserMessages, setUnreadUserMessages,
      unreadAdminUserMessages, setUnreadAdminUserMessages,
      unreadAdminReports, setUnreadAdminReports,

    }}>
      {children}
    </UserContext.Provider>
  );
}; 