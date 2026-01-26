/**
 * Mini CRM - Utility Functions
 * Date formatting, currency, URL params, etc.
 */

const Utils = {
    /**
     * Format date from Java LocalDateTime JSON format
     * @param {Object|string} d - Date object or ISO string
     * @param {string} format - 'short', 'long', 'relative'
     * @returns {string}
     */
    formatDate(d, format = 'short') {
        if (!d) return '-';

        let date;

        // Handle Java LocalDateTime JSON format
        if (typeof d === 'object' && d.year) {
            date = new Date(
                d.year,
                (d.monthValue || d.month) - 1,
                d.dayOfMonth || d.day,
                d.hour || 0,
                d.minute || 0,
                d.second || 0
            );
        } else if (typeof d === 'string') {
            date = new Date(d);
        } else if (d instanceof Date) {
            date = d;
        } else {
            return '-';
        }

        if (isNaN(date.getTime())) return '-';

        switch (format) {
            case 'short':
                return date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            case 'long':
                return date.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
            case 'datetime':
                return date.toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'relative':
                return this.getRelativeTime(date);
            case 'iso':
                return date.toISOString().split('T')[0];
            default:
                return date.toLocaleDateString('en-IN');
        }
    },

    /**
     * Format LocalDate from Java (for activity due dates)
     */
    formatLocalDate(d) {
        if (!d) return '-';

        if (typeof d === 'object' && d.year) {
            const day = String(d.dayOfMonth || d.day).padStart(2, '0');
            const month = String(d.monthValue || d.month).padStart(2, '0');
            const year = d.year;
            return `${day}/${month}/${year}`;
        }

        return this.formatDate(d);
    },

    /**
     * Get relative time string
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return this.formatDate(date, 'short');
    },

    /**
     * Format currency (Indian Rupees)
     * @param {number} amount
     * @param {boolean} compact - Use compact notation for large numbers
     * @returns {string}
     */
    formatCurrency(amount, compact = false) {
        if (amount == null || isNaN(amount)) return '-';

        const options = {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        };

        if (compact && Math.abs(amount) >= 100000) {
            // Indian numbering: Lakh (L) and Crore (Cr)
            if (Math.abs(amount) >= 10000000) {
                return '₹' + (amount / 10000000).toFixed(1) + ' Cr';
            }
            return '₹' + (amount / 100000).toFixed(1) + ' L';
        }

        return new Intl.NumberFormat('en-IN', options).format(amount);
    },

    /**
     * Format number with Indian notation
     */
    formatNumber(num) {
        if (num == null || isNaN(num)) return '-';
        return new Intl.NumberFormat('en-IN').format(num);
    },

    /**
     * Get URL query parameter
     */
    getUrlParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    /**
     * Set URL query parameters
     */
    setUrlParams(params) {
        const url = new URL(window.location);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });
        window.history.replaceState({}, '', url);
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },

    /**
     * Generate a random color for avatars (consistent for same name)
     */
    getAvatarColor(name) {
        const colors = [
            '#1a73e8', '#7c3aed', '#ea580c', '#16a34a',
            '#0891b2', '#dc2626', '#ca8a04', '#4f46e5'
        ];
        if (!name) return colors[0];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    },

    /**
     * Truncate text with ellipsis
     */
    truncate(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    /**
     * Debounce function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    },

    /**
     * Parse status to badge class
     */
    getStatusBadgeClass(status) {
        switch (status) {
            case 'WON':
            case 'CLOSED':
            case 'COMPLETED':
            case 'DONE':
            case 'HELD':
            case 'POSTED':
            case 'SENT':
                return 'badge-success';
            case 'IN_PROGRESS':
            case 'QUALIFIED':
            case 'DELIVERED':
                return 'badge-warning';
            case 'LOST':
            case 'MISSED':
            case 'CANCELLED':
            case 'FAILED':
                return 'badge-danger';
            case 'NEW':
            case 'PROPOSAL':
            case 'OPEN':
            default:
                return 'badge-primary';
        }
    },

    /**
     * Format status for display (Also used for Enums like OrderType)
     */
    formatStatus(status) {
        if (!status) return '-';
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    // --- FIX: Added formatEnum (alias to formatStatus) ---
    formatEnum(value) {
        return this.formatStatus(value);
    },

    /**
     * Get activity type icon SVG
     * @param {string} type - Activity type (TASK, CALL, MEETING, EMAIL, LETTER, SOCIAL_MEDIA)
     * @returns {string} SVG icon HTML
     */
    getActivityTypeIcon(type) {
        const icons = {
            TASK: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
            CALL: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
            MEETING: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            EMAIL: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
            LETTER: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
            SOCIAL_MEDIA: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>'
        };
        return icons[type] || icons.TASK;
    },

    /**
     * Get activity type color
     * @param {string} type - Activity type
     * @returns {object} { color, bgColor }
     */
    getActivityTypeColor(type) {
        const colors = {
            TASK: { color: 'var(--activity-task)', bgColor: 'var(--activity-task-bg)' },
            CALL: { color: 'var(--activity-call)', bgColor: 'var(--activity-call-bg)' },
            MEETING: { color: 'var(--activity-meeting)', bgColor: 'var(--activity-meeting-bg)' },
            EMAIL: { color: 'var(--activity-email)', bgColor: 'var(--activity-email-bg)' },
            LETTER: { color: 'var(--activity-letter)', bgColor: 'var(--activity-letter-bg)' },
            SOCIAL_MEDIA: { color: 'var(--activity-social)', bgColor: 'var(--activity-social-bg)' }
        };
        return colors[type] || colors.TASK;
    },

    /**
     * Get activity status color based on type and status code
     * @param {string} type - Activity type
     * @param {string} statusCode - Status code
     * @returns {object} { color, bgColor }
     */
    getActivityStatusColor(type, statusCode) {
        if (!type || !statusCode) {
            return { color: 'var(--text-secondary)', bgColor: 'var(--bg-surface-secondary)' };
        }

        const typeKey = type.toLowerCase().replace('_', '-');
        const statusKey = statusCode.toLowerCase().replace('_', '-');

        return {
            color: `var(--status-${typeKey}-${statusKey}, var(--text-secondary))`,
            bgColor: `var(--status-${typeKey}-${statusKey}-bg, var(--bg-surface-secondary))`
        };
    },

    /**
     * Get activity status display info
     * @param {string} type - Activity type
     * @param {string} statusCode - Status code
     * @param {string} displayName - Optional display name from API
     * @returns {object} { label, color, bgColor, isTerminal }
     */
    getActivityStatusInfo(type, statusCode, displayName = null) {
        const statusColors = this.getActivityStatusColor(type, statusCode);

        // Default display names if not provided
        const defaultLabels = {
            // TASK
            'TASK_PENDING': 'Pending',
            'TASK_IN_PROGRESS': 'In Progress',
            'TASK_DONE': 'Done',
            // CALL
            'CALL_SCHEDULED': 'Scheduled',
            'CALL_COMPLETED': 'Completed',
            'CALL_MISSED': 'Missed',
            // MEETING
            'MEETING_SCHEDULED': 'Scheduled',
            'MEETING_HELD': 'Held',
            'MEETING_CANCELLED': 'Cancelled',
            // EMAIL
            'EMAIL_DRAFT': 'Draft',
            'EMAIL_SENT': 'Sent',
            'EMAIL_FAILED': 'Failed',
            // LETTER
            'LETTER_DRAFT': 'Draft',
            'LETTER_SENT': 'Sent',
            'LETTER_CANCELLED': 'Cancelled',
            // SOCIAL_MEDIA
            'SOCIAL_MEDIA_DRAFT': 'Draft',
            'SOCIAL_MEDIA_SCHEDULED': 'Scheduled',
            'SOCIAL_MEDIA_POSTED': 'Posted'
        };

        // Terminal statuses per type
        const terminalStatuses = {
            TASK: ['DONE'],
            CALL: ['COMPLETED', 'MISSED'],
            MEETING: ['HELD', 'CANCELLED'],
            EMAIL: ['SENT', 'FAILED'],
            LETTER: ['SENT', 'CANCELLED'],
            SOCIAL_MEDIA: ['POSTED']
        };

        const key = `${type}_${statusCode}`;
        const label = displayName || defaultLabels[key] || this.formatStatus(statusCode);
        const isTerminal = (terminalStatuses[type] || []).includes(statusCode);

        return {
            label,
            color: statusColors.color,
            bgColor: statusColors.bgColor,
            isTerminal
        };
    },

    /**
     * Get deal status info
     * @param {string} status - Deal status
     * @returns {object} { label, color, bgColor }
     */
    getDealStatusInfo(status) {
        const statusMap = {
            OPEN: { label: 'Open', color: 'var(--status-new)', bgColor: 'var(--status-new-bg)' },
            IN_PROGRESS: { label: 'In Progress', color: 'var(--status-in-progress)', bgColor: 'var(--status-in-progress-bg)' },
            WON: { label: 'Won', color: 'var(--status-won)', bgColor: 'var(--status-won-bg)' },
            LOST: { label: 'Lost', color: 'var(--status-lost)', bgColor: 'var(--status-lost-bg)' }
        };
        return statusMap[status] || { label: status, color: 'var(--text-secondary)', bgColor: 'var(--bg-surface-secondary)' };
    },

    /**
     * Check if a date is overdue
     * @param {Object|string} dueDate - Due date
     * @returns {boolean}
     */
    isOverdue(dueDate) {
        if (!dueDate) return false;

        let date;
        if (typeof dueDate === 'object' && dueDate.year) {
            date = new Date(dueDate.year, (dueDate.monthValue || dueDate.month) - 1, dueDate.dayOfMonth || dueDate.day);
        } else {
            date = new Date(dueDate);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    },

    /**
     * Check if a date is today
     * @param {Object|string} date - Date to check
     * @returns {boolean}
     */
    isToday(date) {
        if (!date) return false;

        let d;
        if (typeof date === 'object' && date.year) {
            d = new Date(date.year, (date.monthValue || date.month) - 1, date.dayOfMonth || date.day);
        } else {
            d = new Date(date);
        }

        const today = new Date();
        return d.toDateString() === today.toDateString();
    },

    /**
     * Get relative day label (Today, Tomorrow, etc.)
     * @param {Object|string} date - Date
     * @returns {string}
     */
    getRelativeDayLabel(date) {
        if (!date) return '';

        let d;
        if (typeof date === 'object' && date.year) {
            d = new Date(date.year, (date.monthValue || date.month) - 1, date.dayOfMonth || date.day);
        } else {
            d = new Date(date);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dayDiff = Math.floor((d - today) / (1000 * 60 * 60 * 24));

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        if (dayDiff < 0) return 'Overdue';
        if (dayDiff <= 7) return 'This Week';
        return 'Later';
    }
};

// Make available globally
window.Utils = Utils;