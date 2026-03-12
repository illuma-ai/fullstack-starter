var h = React.createElement;
var RR = ReactRouterDOM;

/**
 * Navbar — Top navigation bar with logo, links, and auth status.
 */
window.Navbar = function Navbar() {
  var auth = window.useAuth();

  return h('header', { className: 'bg-white border-b border-gray-200 sticky top-0 z-40' },
    h('div', { className: 'max-w-6xl mx-auto px-4 sm:px-6' },
      h('div', { className: 'flex items-center justify-between h-14' },
        // Logo + nav
        h('div', { className: 'flex items-center gap-6' },
          h(RR.Link, { to: '/', className: 'flex items-center gap-2' },
            h('div', { className: 'w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center' },
              h('span', { className: 'text-white font-bold text-sm' }, 'S')
            ),
            h('span', { className: 'font-semibold text-gray-800' }, 'Starter')
          ),
          auth.isAuthenticated ? h('nav', { className: 'hidden sm:flex items-center gap-4' },
            h(RR.NavLink, {
              to: '/dashboard',
              className: function(a) { return 'text-sm font-medium ' + (a.isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'); },
            }, 'Dashboard')
          ) : null
        ),

        // Auth section
        h('div', { className: 'flex items-center gap-3' },
          auth.isAuthenticated
            ? h('div', { className: 'flex items-center gap-3' },
                h('span', { className: 'text-sm text-gray-500 hidden sm:block' }, auth.user.name),
                h('span', { className: 'text-xs px-2 py-0.5 rounded-full font-medium ' +
                  (auth.user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600')
                }, auth.user.role),
                h('button', {
                  onClick: function() { auth.logout(); },
                  className: 'text-sm text-gray-500 hover:text-gray-700',
                }, 'Sign out')
              )
            : h('div', { className: 'flex items-center gap-2' },
                h(RR.Link, {
                  to: '/login',
                  className: 'text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5',
                }, 'Sign in'),
                h(RR.Link, {
                  to: '/register',
                  className: 'text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700',
                }, 'Get started')
              )
        )
      )
    )
  );
};
