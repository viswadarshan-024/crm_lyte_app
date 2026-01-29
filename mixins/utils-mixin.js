Lyte.Mixin.register("utils-mixin", {

    // --- Date Formatting ---

    actions: {
        // Generates 2 initials (e.g., "John Doe" -> "JD")
        utilGetInitials: function(name) {
            if (!name || typeof name !== 'string') return "??";
            let parts = name.trim().split(" ");
            if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        },

        // Returns a consistent color based on the name string
        utilGetAvatarColor: function(name) {
            if (!name) return "#64748b"; // Default Grey

            let colors = [
                "#ef4444", "#f97316", "#f59e0b", "#84cc16",
                "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
                "#8b5cf6", "#d946ef", "#f43f5e"
            ];

            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }

            let index = Math.abs(hash % colors.length);
            return colors[index];
        }
    },
    /**
     * Format date from Java LocalDateTime JSON format
     */
    utilFormatDate: function(d, format) {
        format = format || 'short';
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
                return this.utilGetRelativeTime(date);
            case 'iso':
                return date.toISOString().split('T')[0];
            default:
                return date.toLocaleDateString('en-IN');
        }
    },

    utilFormatLocalDate: function(d) {
        if (!d) return '-';

        if (typeof d === 'object' && d.year) {
            const day = String(d.dayOfMonth || d.day).padStart(2, '0');
            const month = String(d.monthValue || d.month).padStart(2, '0');
            const year = d.year;
            return day + '/' + month + '/' + year;
        }

        return this.utilFormatDate(d);
    },

    utilGetRelativeTime: function(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return diffMins + 'm ago';
        if (diffHours < 24) return diffHours + 'h ago';
        if (diffDays < 7) return diffDays + 'd ago';

        return this.utilFormatDate(date, 'short');
    },

    // --- Currency & Numbers ---

    utilFormatCurrency: function(amount, compact) {
        compact = compact || false;
        if (amount == null || isNaN(amount)) return '-';

        const options = {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        };

        if (compact && Math.abs(amount) >= 100000) {
            if (Math.abs(amount) >= 10000000) {
                return '₹' + (amount / 10000000).toFixed(1) + ' Cr';
            }
            return '₹' + (amount / 100000).toFixed(1) + ' L';
        }

        return new Intl.NumberFormat('en-IN', options).format(amount);
    },

    utilFormatNumber: function(num) {
        if (num == null || isNaN(num)) return '-';
        return new Intl.NumberFormat('en-IN').format(num);
    },

    // --- UI Helpers ---

    utilGetInitials: function(name) {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },

    utilGetAvatarColor: function(name) {
        const colors = [
            '#1a73e8', '#7c3aed', '#ea580c', '#16a34a',
            '#0891b2', '#dc2626', '#ca8a04', '#4f46e5'
        ];
        if (!name) return colors[0];
        const hash = name.split('').reduce(function(acc, char) {
            return acc + char.charCodeAt(0);
        }, 0);
        return colors[hash % colors.length];
    },

    utilTruncate: function(text, maxLength) {
        maxLength = maxLength || 50;
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    utilEscapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // --- Status & Enums ---

    utilGetStatusBadgeClass: function(status) {
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

    utilFormatStatus: function(status) {
        if (!status) return '-';
        return status.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    },

    utilGetActivityTypeIcon: function(type) {
        // SVG strings...
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

    utilIsOverdue: function(dueDate) {
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
    }
});