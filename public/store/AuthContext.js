/**
 * store/AuthContext.js — Authentication state management.
 *
 * Provides:
 * - AuthProvider: Wraps app with auth state
 * - useAuth(): Hook to access { user, token, loading, login, register, logout }
 *
 * Uses React Context + useReducer for predictable state updates.
 */

var h = React.createElement;

// Action types
var AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return Object.assign({}, state, { loading: action.payload });
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return Object.assign({}, state, {
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      });
    case AUTH_ACTIONS.SET_USER:
      return Object.assign({}, state, { user: action.payload, loading: false });
    case AUTH_ACTIONS.LOGOUT:
      return { user: null, token: null, loading: false };
    default:
      return state;
  }
}

// Context
var AuthContext = React.createContext(null);

/**
 * AuthProvider — Wraps children with auth state.
 * On mount, checks for stored token and fetches user profile.
 */
window.AuthProvider = function AuthProvider(props) {
  var initialState = { user: null, token: null, loading: true };
  var stateAndDispatch = React.useReducer(authReducer, initialState);
  var state = stateAndDispatch[0];
  var dispatch = stateAndDispatch[1];

  // Check stored token on mount
  React.useEffect(function() {
    var token = ApiClient.getToken();
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return;
    }

    ApiClient.get('/api/auth/me')
      .then(function(data) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: data.user, token: token } });
      })
      .catch(function() {
        ApiClient.clearToken();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      });
  }, []);

  /**
   * Login with email and password.
   * @returns {Promise<Object>} User data
   */
  var login = React.useCallback(function(email, password) {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    return ApiClient.post('/api/auth/login', { email: email, password: password })
      .then(function(data) {
        ApiClient.setToken(data.token);
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data });
        return data;
      })
      .catch(function(err) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        throw err;
      });
  }, []);

  /**
   * Register a new account.
   * @returns {Promise<Object>} User data
   */
  var register = React.useCallback(function(email, password, name) {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    return ApiClient.post('/api/auth/register', { email: email, password: password, name: name })
      .then(function(data) {
        ApiClient.setToken(data.token);
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data });
        return data;
      })
      .catch(function(err) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        throw err;
      });
  }, []);

  /**
   * Logout — clear token and state.
   */
  var logout = React.useCallback(function() {
    ApiClient.clearToken();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  var value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    login: login,
    register: register,
    logout: logout,
    isAuthenticated: !!state.user,
  };

  return h(AuthContext.Provider, { value: value }, props.children);
};

/**
 * useAuth — Hook to access auth state and actions.
 * @returns {{ user, token, loading, login, register, logout, isAuthenticated }}
 */
window.useAuth = function useAuth() {
  var context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
