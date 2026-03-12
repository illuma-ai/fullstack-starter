/**
 * store/AppContext.js — Application state management.
 *
 * Manages items, loading states, filters, and toasts.
 * Uses React Context + useReducer.
 *
 * Provides:
 * - AppProvider: Wraps app with state
 * - useApp(): Hook to access state and CRUD actions
 */

var h = React.createElement;

var APP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ITEMS: 'SET_ITEMS',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  SET_STATS: 'SET_STATS',
  SET_FILTER: 'SET_FILTER',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
};

function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return Object.assign({}, state, { loading: action.payload });
    case APP_ACTIONS.SET_ITEMS:
      return Object.assign({}, state, { items: action.payload, loading: false });
    case APP_ACTIONS.ADD_ITEM:
      return Object.assign({}, state, { items: [action.payload].concat(state.items) });
    case APP_ACTIONS.UPDATE_ITEM:
      return Object.assign({}, state, {
        items: state.items.map(function(i) { return i.id === action.payload.id ? action.payload : i; }),
      });
    case APP_ACTIONS.REMOVE_ITEM:
      return Object.assign({}, state, {
        items: state.items.filter(function(i) { return i.id !== action.payload; }),
      });
    case APP_ACTIONS.SET_STATS:
      return Object.assign({}, state, { stats: action.payload });
    case APP_ACTIONS.SET_FILTER:
      return Object.assign({}, state, {
        filters: Object.assign({}, state.filters, action.payload),
      });
    case APP_ACTIONS.ADD_TOAST:
      return Object.assign({}, state, {
        toasts: state.toasts.concat([action.payload]),
      });
    case APP_ACTIONS.REMOVE_TOAST:
      return Object.assign({}, state, {
        toasts: state.toasts.filter(function(t) { return t.id !== action.payload; }),
      });
    default:
      return state;
  }
}

var AppContext = React.createContext(null);

window.AppProvider = function AppProvider(props) {
  var initialState = {
    items: [],
    stats: null,
    loading: false,
    filters: { status: '', priority: '' },
    toasts: [],
  };
  var stateAndDispatch = React.useReducer(appReducer, initialState);
  var state = stateAndDispatch[0];
  var dispatch = stateAndDispatch[1];

  var toastId = React.useRef(0);

  // Toast helper
  function addToast(message, type) {
    var id = ++toastId.current;
    dispatch({ type: APP_ACTIONS.ADD_TOAST, payload: { id: id, message: message, type: type || 'info' } });
    setTimeout(function() {
      dispatch({ type: APP_ACTIONS.REMOVE_TOAST, payload: id });
    }, 3000);
  }

  // CRUD actions
  function fetchItems(filters) {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: true });
    var query = '';
    if (filters) {
      var parts = [];
      if (filters.status) parts.push('status=' + filters.status);
      if (filters.priority) parts.push('priority=' + filters.priority);
      if (parts.length > 0) query = '?' + parts.join('&');
    }
    return ApiClient.get('/api/items' + query)
      .then(function(data) {
        dispatch({ type: APP_ACTIONS.SET_ITEMS, payload: data.items });
        return data.items;
      })
      .catch(function(err) {
        dispatch({ type: APP_ACTIONS.SET_LOADING, payload: false });
        addToast(err.message, 'error');
      });
  }

  function fetchStats() {
    return ApiClient.get('/api/items/stats')
      .then(function(data) {
        dispatch({ type: APP_ACTIONS.SET_STATS, payload: data });
        return data;
      })
      .catch(function(err) {
        addToast(err.message, 'error');
      });
  }

  function createItem(data) {
    return ApiClient.post('/api/items', data)
      .then(function(result) {
        dispatch({ type: APP_ACTIONS.ADD_ITEM, payload: result.item });
        addToast('Item created', 'success');
        fetchStats();
        return result.item;
      })
      .catch(function(err) {
        addToast(err.message, 'error');
        throw err;
      });
  }

  function updateItem(id, data) {
    return ApiClient.put('/api/items/' + id, data)
      .then(function(result) {
        dispatch({ type: APP_ACTIONS.UPDATE_ITEM, payload: result.item });
        addToast('Item updated', 'success');
        fetchStats();
        return result.item;
      })
      .catch(function(err) {
        addToast(err.message, 'error');
        throw err;
      });
  }

  function deleteItem(id) {
    return ApiClient.del('/api/items/' + id)
      .then(function() {
        dispatch({ type: APP_ACTIONS.REMOVE_ITEM, payload: id });
        addToast('Item deleted', 'success');
        fetchStats();
      })
      .catch(function(err) {
        addToast(err.message, 'error');
        throw err;
      });
  }

  function setFilter(filter) {
    dispatch({ type: APP_ACTIONS.SET_FILTER, payload: filter });
  }

  var value = {
    items: state.items,
    stats: state.stats,
    loading: state.loading,
    filters: state.filters,
    toasts: state.toasts,
    fetchItems: fetchItems,
    fetchStats: fetchStats,
    createItem: createItem,
    updateItem: updateItem,
    deleteItem: deleteItem,
    setFilter: setFilter,
    addToast: addToast,
  };

  return h(AppContext.Provider, { value: value }, props.children);
};

window.useApp = function useApp() {
  var context = React.useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
