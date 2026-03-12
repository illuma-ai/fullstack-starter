var h = React.createElement;

var STATUS_STYLES = {
  todo: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'To Do' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
  done: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Done' },
};

var PRIORITY_STYLES = {
  low: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Low' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium' },
  high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
};

/**
 * ItemCard — Displays a single item with status/priority badges and actions.
 */
window.ItemCard = function ItemCard(props) {
  var item = props.item;
  var onEdit = props.onEdit;
  var onDelete = props.onDelete;

  var s = STATUS_STYLES[item.status] || STATUS_STYLES.todo;
  var p = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.medium;

  return h('div', { className: 'bg-white rounded-lg p-4 border border-gray-200 card-hover fade-in' },
    // Header row
    h('div', { className: 'flex items-start justify-between mb-2' },
      h('h3', { className: 'font-medium text-gray-800 flex-1 mr-2' }, item.title),
      h('div', { className: 'flex gap-1.5 flex-shrink-0' },
        h('span', { className: 'text-xs px-2 py-0.5 rounded-full font-medium ' + s.bg + ' ' + s.text }, s.label),
        h('span', { className: 'text-xs px-2 py-0.5 rounded-full font-medium ' + p.bg + ' ' + p.text }, p.label)
      )
    ),

    // Description
    item.description
      ? h('p', { className: 'text-sm text-gray-500 mb-3 line-clamp-2' }, item.description)
      : null,

    // Footer
    h('div', { className: 'flex items-center justify-between' },
      h('span', { className: 'text-xs text-gray-400' },
        (item.user_name || 'Unknown') + ' · ' + (item.created_at || '').split('T')[0]
      ),
      h('div', { className: 'flex gap-2' },
        h('button', {
          onClick: function() { onEdit(item); },
          className: 'text-xs text-primary-600 hover:text-primary-700 font-medium',
        }, 'Edit'),
        h('button', {
          onClick: function() { onDelete(item.id); },
          className: 'text-xs text-red-500 hover:text-red-600 font-medium',
        }, 'Delete')
      )
    )
  );
};
