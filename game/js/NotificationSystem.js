/**
 * NOTIFICATION SYSTEM
 * Handles in-game notifications
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this._events = {};
    }
    
    initialize() {
        this.log('NotificationSystem initialized');
    }
    
    show(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: Date.now()
        };
        
        this.notifications.push(notification);
        this.displayNotification(notification);
        
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, GameConfig.ui.notificationDuration);
    }
    
    displayNotification(notification) {
        // Create notification element
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.textContent = notification.message;
        
        // Add to page
        document.body.appendChild(element);
        
        // Animate in
        setTimeout(() => {
            element.classList.add('show');
        }, 10);
    }
    
    removeNotification(id) {
        const element = document.querySelector(`[data-notification-id="${id}"]`);
        if (element) {
            element.classList.add('hide');
            setTimeout(() => {
                element.remove();
            }, 300);
        }
    }
    
    on(event, callback) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    }
    
    emit(event, ...args) {
        if (!this._events[event]) return;
        this._events[event].forEach(callback => callback(...args));
    }
    
    log(...args) {
        console.log('[NotificationSystem]', ...args);
    }
}