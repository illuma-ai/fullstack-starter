var h = React.createElement;

/**
 * ItemForm — Create or edit an item.
 * @param {{ item?: Object, onSave: Function, onCancel: Function }} props
 */
window.ItemForm = function ItemForm(props) {
  var item = props.item;
  var onSave = props.onSave;
  var onCancel = props.onCancel;

  var titleState = React.useState(item ? item.title : '');
  var title = titleState[0]; var setTitle = titleState[1];

  var descState = React.useState(item ? (item.description || '') : '');
  var desc = descState[0]; var setDesc = descState[1];

  var statusState = React.useState(item ? item.status : 'todo');
  var status = statusState[0]; var setStatus = statusState[1];

  var priorityState = React.useState(item ? item.priority : 'medium');
  var priority = priorityState[0]; var setPriority = priorityState[1];

  var savingState = React.useState(false);
  var saving = savingState[0]; var setSaving = savingState[1];

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    onSave({
      title: title.trim(),
      description: desc.trim(),
      status: status,
      priority: priority,
    }).then(function() {
      setSaving(false);
    }).catch(function() {
      setSaving(false);
    });
  }

  return h('div', { className: 'bg-white rounded-lg border border-gray-200 p-5 fade-in' },
    h('h3', { className: 'text-lg font-semibold text-gray-800 mb-4' },
      item ? 'Edit Item' : 'New Item'
    ),
    h('form', { onSubmit: handleSubmit, className: 'space-y-4' },
      // Title
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Title'),
        h('input', {
          type: 'text',
          value: title,
          onChange: function(e) { setTitle(e.target.value); },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          placeholder: 'Enter item title...',
          required: true,
        })
      ),
      // Description
      h('div', null,
        h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Description'),
        h('textarea', {
          value: desc,
          onChange: function(e) { setDesc(e.target.value); },
          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none',
          rows: 3,
          placeholder: 'Optional description...',
        })
      ),
      // Status + Priority row
      h('div', { className: 'grid grid-cols-2 gap-4' },
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Status'),
          h('select', {
            value: status,
            onChange: function(e) { setStatus(e.target.value); },
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
          },
            h('option', { value: 'todo' }, 'To Do'),
            h('option', { value: 'in_progress' }, 'In Progress'),
            h('option', { value: 'done' }, 'Done')
          )
        ),
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Priority'),
          h('select', {
            value: priority,
            onChange: function(e) { setPriority(e.target.value); },
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
          },
            h('option', { value: 'low' }, 'Low'),
            h('option', { value: 'medium' }, 'Medium'),
            h('option', { value: 'high' }, 'High')
          )
        )
      ),
      // Buttons
      h('div', { className: 'flex justify-end gap-2 pt-2' },
        h('button', {
          type: 'button',
          onClick: onCancel,
          className: 'px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg',
        }, 'Cancel'),
        h('button', {
          type: 'submit',
          disabled: saving || !title.trim(),
          className: 'px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50',
        }, saving ? 'Saving...' : (item ? 'Update' : 'Create'))
      )
    )
  );
};
