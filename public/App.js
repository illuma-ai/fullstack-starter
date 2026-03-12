var h = React.createElement;
var RR = ReactRouterDOM;

/**
 * Detect the basename for React Router.
 *
 * When running inside a Nodepod preview iframe, the URL path is
 * something like "/__preview__/3000/" — React Router needs to
 * know this prefix so it can match routes correctly. In production
 * (real server), the pathname is just "/" and basename is empty.
 */
var BASENAME = (function() {
  var m = window.location.pathname.match(/^(\/__.+?__\/\d+)/);
  return m ? m[1] : '';
})();

/**
 * ProtectedRoute — Redirects to /login if not authenticated.
 */
function ProtectedRoute(props) {
  var auth = window.useAuth();

  if (auth.loading) {
    return h('div', { className: 'flex items-center justify-center min-h-[calc(100vh-56px)]' },
      h('div', { className: 'w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin' })
    );
  }

  if (!auth.isAuthenticated) {
    return h(RR.Navigate, { to: '/login', replace: true });
  }

  return props.children || h(RR.Outlet);
}

/**
 * Layout — App shell with navbar.
 */
function Layout() {
  var app = window.useApp();

  return h(React.Fragment, null,
    h(window.Navbar),
    h(window.Toast, { toasts: app.toasts }),
    h('main', null, h(RR.Outlet))
  );
}

/**
 * App — Root component. Sets up providers and router.
 */
function App() {
  return h(window.AuthProvider, null,
    h(window.AppProvider, null,
      h(RR.BrowserRouter, { basename: BASENAME },
        h(RR.Routes, null,
          h(RR.Route, { element: h(Layout) },
            // Public routes
            h(RR.Route, { index: true, element: h(window.WelcomePage) }),
            h(RR.Route, { path: 'login', element: h(window.LoginPage) }),
            h(RR.Route, { path: 'register', element: h(window.RegisterPage) }),
            // Protected routes
            h(RR.Route, { element: h(ProtectedRoute) },
              h(RR.Route, { path: 'dashboard', element: h(window.DashboardPage) })
            ),
            // 404
            h(RR.Route, { path: '*', element: h('div', { className: 'text-center py-20' },
              h('h1', { className: 'text-4xl font-bold text-gray-300 mb-2' }, '404'),
              h('p', { className: 'text-gray-400 mb-4' }, 'Page not found'),
              h(RR.Link, { to: '/', className: 'text-primary-600 hover:text-primary-700 text-sm font-medium' }, 'Go home')
            )})
          )
        )
      )
    )
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(h(App));
