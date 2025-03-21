import { createContext, useState } from "react";
import * as React from "react";

export const AuthContext = createContext({
  token: '',
  isAuthenticated: false,
  authenticate: (token) => {},
  logout: () => {},
});

function AuthContentProvider({children}){
  const [authToken, setAuthToken] = useState();

  function authenticate(token){
    setAuthToken(token);
  }

  function logout(){
    setAuthToken(null);
  }
  
  const value = {
    token: authToken,
    isAuthenticated: !!authToken,
    authenticate: authenticate,
    logout: logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContentProvider;