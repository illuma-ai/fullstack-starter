var h = React.createElement;

/**
 * Toast — Notification toast displayed at top-right.
 */
window.Toast = function Toast(props) {
  var toasts = props.toasts || [];
  if (toasts.length === 0) return null;

  var colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  };

  return h('div', { className: 'fixed top-4 right-4 z-50 space-y-2' },
    toasts.map(function(toast) {
      return h('div', {
        key: toast.id,
        className: 'toast-enter px-4 py-3 rounded-lg text-white text-sm font-medium shadow-lg ' + (colors[toast.type] || colors.info),
      }, toast.message);
    })
  );
};
