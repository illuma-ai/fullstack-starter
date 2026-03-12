var h = React.createElement;
var RR = ReactRouterDOM;

/**
 * RegisterPage — Registration form.
 */
window.RegisterPage = function RegisterPage() {
  var auth = window.useAuth();
  var navigate = RR.useNavigate();

  var nameState = React.useState('');
  var name = nameState[0]; var setName = nameState[1];

  var emailState = React.useState('');
  var email = emailState[0]; var setEmail = emailState[1];

  var passState = React.useState('');
  var pass = passState[0]; var setPass = passState[1];

  var errorState = React.useState('');
  var error = errorState[0]; var setError = errorState[1];

  var loadingState = React.useState(false);
  var loading = loadingState[0]; var setLoading = loadingState[1];

  React.useEffect(function() {
    if (auth.isAuthenticated) navigate('/dashboard');
  }, [auth.isAuthenticated]);

  function handleSubmit(e) {
    e.preventDefault();
    if (pass.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    auth.register(email, pass, name)
      .then(function() {
        navigate('/dashboard');
      })
      .catch(function(err) {
        setError(err.message || 'Registration failed');
        setLoading(false);
      });
  }

  return h('div', { className: 'min-h-[calc(100vh-56px)] flex items-center justify-center px-4 fade-in' },
    h('div', { className: 'w-full max-w-sm' },
      h('div', { className: 'text-center mb-6' },
        h('h1', { className: 'text-2xl font-bold text-gray-800' }, 'Create account'),
        h('p', { className: 'text-sm text-gray-500 mt-1' }, 'Start building with the starter template')
      ),

      h('form', { onSubmit: handleSubmit, className: 'bg-white rounded-lg border border-gray-200 p-6 space-y-4' },
        error ? h('div', { className: 'text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg' }, error) : null,

        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Name'),
          h('input', {
            type: 'text', value: name, onChange: function(e) { setName(e.target.value); },
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            placeholder: 'Your name', required: true,
          })
        ),

        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Email'),
          h('input', {
            type: 'email', value: email, onChange: function(e) { setEmail(e.target.value); },
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            placeholder: 'you@example.com', required: true,
          })
        ),

        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Password'),
          h('input', {
            type: 'password', value: pass, onChange: function(e) { setPass(e.target.value); },
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            placeholder: 'Min 6 characters', required: true,
          })
        ),

        h('button', {
          type: 'submit', disabled: loading,
          className: 'w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50',
        }, loading ? 'Creating account...' : 'Create account')
      ),

      h('p', { className: 'text-center text-sm text-gray-500 mt-4' },
        'Already have an account? ',
        h(RR.Link, { to: '/login', className: 'text-primary-600 hover:text-primary-700 font-medium' }, 'Sign in')
      )
    )
  );
};
