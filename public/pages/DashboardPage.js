var h = React.createElement;
var RR = ReactRouterDOM;

/**
 * DashboardPage — Main application view with stats, filters, and item CRUD.
 */
window.DashboardPage = function DashboardPage() {
  var auth = window.useAuth();
  var app = window.useApp();
  var navigate = RR.useNavigate();

  var showFormState = React.useState(false);
  var showForm = showFormState[0]; var setShowForm = showFormState[1];

  var editingState = React.useState(null);
  var editing = editingState[0]; var setEditing = editingState[1];

  // Redirect if not authenticated
  React.useEffect(function() {
    if (!auth.loading && !auth.isAuthenticated) navigate('/login');
  }, [auth.loading, auth.isAuthenticated]);

  // Fetch data on mount
  React.useEffect(function() {
    if (auth.isAuthenticated) {
      app.fetchItems();
      app.fetchStats();
    }
  }, [auth.isAuthenticated]);

  // Re-fetch when filters change
  React.useEffect(function() {
    if (auth.isAuthenticated) {
      app.fetchItems(app.filters);
    }
  }, [app.filters.status, app.filters.priority]);

  function handleSave(data) {
    if (editing) {
      return app.updateItem(editing.id, data).then(function() {
        setEditing(null);
        setShowForm(false);
      });
    }
    return app.createItem(data).then(function() {
      setShowForm(false);
    });
  }

  function handleEdit(item) {
    setEditing(item);
    setShowForm(true);
  }

  function handleDelete(id) {
    app.deleteItem(id);
  }

  function handleCancel() {
    setEditing(null);
    setShowForm(false);
  }

  if (auth.loading) {
    return h('div', { className: 'flex items-center justify-center py-20' },
      h('div', { className: 'w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin' })
    );
  }

  var stats = app.stats || { total: 0, byStatus: {}, byPriority: {} };

  return h('div', { className: 'max-w-5xl mx-auto px-4 sm:px-6 py-6 fade-in' },
    // Header
    h('div', { className: 'flex items-center justify-between mb-6' },
      h('div', null,
        h('h1', { className: 'text-2xl font-bold text-gray-800' }, 'Dashboard'),
        h('p', { className: 'text-sm text-gray-500' }, 'Manage your items')
      ),
      h('button', {
        onClick: function() { setEditing(null); setShowForm(true); },
        className: 'px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 font-medium',
      }, '+ New Item')
    ),

    // Stats cards
    h('div', { className: 'grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6' },
      _statCard('Total', stats.total, 'bg-gray-50'),
      _statCard('To Do', stats.byStatus.todo || 0, 'bg-gray-50'),
      _statCard('In Progress', stats.byStatus.in_progress || 0, 'bg-blue-50'),
      _statCard('Done', stats.byStatus.done || 0, 'bg-emerald-50')
    ),

    // Filters
    h('div', { className: 'flex gap-2 mb-4' },
      _filterSelect('Status', app.filters.status, ['todo', 'in_progress', 'done'],
        function(v) { app.setFilter({ status: v }); }),
      _filterSelect('Priority', app.filters.priority, ['low', 'medium', 'high'],
        function(v) { app.setFilter({ priority: v }); })
    ),

    // Form (show/hide)
    showForm
      ? h(window.ItemForm, { item: editing, onSave: handleSave, onCancel: handleCancel })
      : null,

    // Items list
    app.loading
      ? h('div', { className: 'text-center py-12' },
          h('div', { className: 'w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2' }),
          h('p', { className: 'text-sm text-gray-400' }, 'Loading...')
        )
      : app.items.length === 0
        ? h('div', { className: 'text-center py-12 bg-white rounded-lg border border-gray-200' },
            h('p', { className: 'text-gray-400 mb-2' }, 'No items yet'),
            h('button', {
              onClick: function() { setShowForm(true); },
              className: 'text-sm text-primary-600 hover:text-primary-700 font-medium',
            }, 'Create your first item')
          )
        : h('div', { className: 'grid gap-3 ' + (showForm ? 'mt-4' : '') },
            app.items.map(function(item) {
              return h(window.ItemCard, {
                key: item.id,
                item: item,
                onEdit: handleEdit,
                onDelete: handleDelete,
              });
            })
          )
  );
};

function _statCard(label, value, bg) {
  return h('div', { className: 'rounded-lg p-3 ' + bg },
    h('p', { className: 'text-xs text-gray-500 font-medium' }, label),
    h('p', { className: 'text-xl font-bold text-gray-800' }, value)
  );
}

function _filterSelect(label, value, options, onChange) {
  return h('select', {
    value: value,
    onChange: function(e) { onChange(e.target.value); },
    className: 'px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500',
  },
    h('option', { value: '' }, 'All ' + label),
    options.map(function(opt) {
      var label = opt.replace('_', ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      return h('option', { key: opt, value: opt }, label);
    })
  );
}
