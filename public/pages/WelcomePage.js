var h = React.createElement;
var RR = ReactRouterDOM;

/**
 * WelcomePage — Landing page with hero, features, and architecture overview.
 */
window.WelcomePage = function WelcomePage() {
  var auth = window.useAuth();

  return h('div', { className: 'fade-in' },
    // Hero
    h('section', { className: 'py-16 px-4' },
      h('div', { className: 'max-w-3xl mx-auto text-center' },
        h('div', { className: 'inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6' },
          h('span', { className: 'w-2 h-2 bg-emerald-400 rounded-full' }),
          'Full-Stack Application'
        ),
        h('h1', { className: 'text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight' },
          'Production-Ready', h('br'),
          h('span', { className: 'text-primary-600' }, 'Starter Template')
        ),
        h('p', { className: 'text-lg text-gray-500 mb-8 max-w-xl mx-auto' },
          'Express + React + SQLite with proper separation of concerns. ' +
          'Same code structure deploys to production with Postgres.'
        ),
        h('div', { className: 'flex flex-col sm:flex-row gap-3 justify-center' },
          auth.isAuthenticated
            ? h(RR.Link, {
                to: '/dashboard',
                className: 'px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium',
              }, 'Go to Dashboard')
            : h(React.Fragment, null,
                h(RR.Link, {
                  to: '/register',
                  className: 'px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium',
                }, 'Get Started'),
                h(RR.Link, {
                  to: '/login',
                  className: 'px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium',
                }, 'Sign In')
              )
        )
      )
    ),

    // Features
    h('section', { className: 'py-12 px-4 bg-white border-t border-gray-100' },
      h('div', { className: 'max-w-4xl mx-auto' },
        h('h2', { className: 'text-2xl font-bold text-gray-800 text-center mb-8' }, 'Architecture'),
        h('div', { className: 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' },
          _featureCard('SQLite (sql.js)', 'True relational database with typed schemas, migrations, and indexes. Same SQL works on Postgres.', 'DB'),
          _featureCard('React Router v6', 'Client-side routing with nested routes, URL params, navigation guards, and SPA fallback.', 'RT'),
          _featureCard('React Context', 'Predictable state management with useReducer. Auth context + app state context.', 'ST'),
          _featureCard('JWT Auth', 'Token-based authentication with role-based access control. Login, register, protected routes.', 'AU'),
          _featureCard('REST API', 'Express routes with validation, error handling, and structured JSON responses.', 'AP'),
          _featureCard('Repository Pattern', 'Data access layer abstracts SQL queries. Swap database without changing routes.', 'RP')
        )
      )
    ),

    // Demo credentials
    h('section', { className: 'py-12 px-4' },
      h('div', { className: 'max-w-md mx-auto text-center' },
        h('h3', { className: 'text-lg font-semibold text-gray-700 mb-4' }, 'Demo Accounts'),
        h('div', { className: 'bg-white rounded-lg border border-gray-200 divide-y' },
          h('div', { className: 'p-4 flex items-center justify-between' },
            h('div', { className: 'text-left' },
              h('p', { className: 'text-sm font-medium text-gray-800' }, 'admin@example.com'),
              h('p', { className: 'text-xs text-gray-400' }, 'Password: admin123')
            ),
            h('span', { className: 'text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium' }, 'admin')
          ),
          h('div', { className: 'p-4 flex items-center justify-between' },
            h('div', { className: 'text-left' },
              h('p', { className: 'text-sm font-medium text-gray-800' }, 'user@example.com'),
              h('p', { className: 'text-xs text-gray-400' }, 'Password: user123')
            ),
            h('span', { className: 'text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium' }, 'user')
          )
        )
      )
    )
  );
};

function _featureCard(title, desc, icon) {
  return h('div', { className: 'p-4 rounded-lg border border-gray-100 hover:border-primary-200 transition-colors' },
    h('div', { className: 'w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 font-bold text-xs mb-3' }, icon),
    h('h3', { className: 'font-medium text-gray-800 mb-1' }, title),
    h('p', { className: 'text-sm text-gray-500' }, desc)
  );
}
