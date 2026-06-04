export const REPORT_STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  reopened: 'Reopened',
  rejected: 'Rejected',
};

export const REPORT_STATUS_COLORS = {
  pending: '#ef4444',
  in_progress: '#f59e0b',
  resolved: '#10b981',
  reopened: '#8b5cf6',
  closed: '#6b7280',
  assigned: '#3b82f6',
  rejected: '#6b7280',
};

export const SEVERITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 };

export const getStatusLabel = (status = '') => REPORT_STATUS_LABELS[status] || status;

export const getStatusVariant = (status = '') => {
  switch (status.toLowerCase()) {
    case 'resolved':
    case 'closed':
      return 'success';
    case 'in_progress':
    case 'assigned':
      return 'warning';
    case 'pending':
    case 'reopened':
      return 'danger';
    default:
      return 'neutral';
  }
};

export const getPriorityVariant = (priority = '') => {
  switch (priority.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'neutral';
  }
};

export const formatCategory = (category = '') => (
  category === 'road_issues'
    ? 'Road Issue'
    : category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
);
