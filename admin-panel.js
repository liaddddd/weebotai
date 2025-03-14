/**
 * פאנל ניהול בזמן אמת
 * מציג משתמשים מחוברים ונתונים נוספים
 * נגיש רק למנהל המערכת
 */

(function() {
    // אימייל מנהל מערכת
    const ADMIN_EMAIL = 'liad@gmail.com';
    
    // מצב הפאנל
    let panelCreated = false;
    let isSubscribed = false;
    let currentUser = null;
    let adminDashboard = null;
    
    // הפעל את המודול כאשר הדף נטען
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    /**
     * אתחול ראשוני של הפאנל
     */
    function init() {
        console.log('אתחול מודול פאנל ניהול...');
        
        // בדוק אם Supabase זמין
        if (typeof window.supabaseAuth === 'undefined') {
            console.error('מערכת האימות לא נטענה!');
            return;
        }
        
        // בדוק אם המשתמש הוא מנהל
        checkIfAdmin();
        
        // הפעל האזנה לשינויי התחברות
        setupAuthListener();
    }
    
    /**
     * בדיקה האם המשתמש הנוכחי הוא המנהל
     */
    function checkIfAdmin() {
        window.supabaseAuth.getCurrentUser().then(({ success, user, error }) => {
            if (error || !success) {
                console.error('Error checking user:', error);
                return;
            }
            
            currentUser = user;
            
            // אם משתמש מחובר
            if (currentUser) {
                console.log('User logged in:', currentUser.email);
                
                // בדוק אם זה המייל של המנהל או האם לו תפקיד מנהל
                if (currentUser.email === ADMIN_EMAIL || currentUser.user_metadata?.role === 'admin') {
                    console.log('Admin user detected!');
                    
                    // צור את הפאנל אם עוד לא קיים
                    if (!panelCreated) {
                        createAdminPanel();
                        
                        // טען נתונים ראשוניים
                        fetchAndDisplayOnlineUsers();
                        
                        // הפעל האזנה לשינויים בזמן אמת
                        subscribeToRealtimeUpdates();
                    }
                } else {
                    // בדוק בטבלת הפרופיל אם המשתמש הוא מנהל
                    checkAdminInProfilesTable(currentUser.id);
                }
            }
        });
    }
    
    /**
     * בדיקה בטבלת הפרופילים האם המשתמש הוא מנהל
     */
    async function checkAdminInProfilesTable(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
                
            if (error) {
                console.error('Error checking admin status:', error);
                return;
            }
            
            if (data && data.role === 'admin') {
                console.log('Admin user detected from profiles table!');
                
                // צור את הפאנל אם עוד לא קיים
                if (!panelCreated) {
                    createAdminPanel();
                    
                    // טען נתונים ראשוניים
                    fetchAndDisplayOnlineUsers();
                    
                    // הפעל האזנה לשינויים בזמן אמת
                    subscribeToRealtimeUpdates();
                }
            }
        } catch (err) {
            console.error('Error checking admin in profiles:', err);
        }
    }
    
    /**
     * מאזין לשינויי מצב התחברות
     */
    function setupAuthListener() {
        window.addEventListener('supabase:auth:signedIn', async (event) => {
            console.log('Auth state changed: Signed in');
            checkIfAdmin();
        });
        
        window.addEventListener('supabase:auth:signedOut', () => {
            console.log('Auth state changed: Signed out');
            // הסר את הפאנל אם הוא קיים
            if (panelCreated && adminDashboard) {
                adminDashboard.remove();
                panelCreated = false;
            }
        });
    }
    
    /**
     * יצירת הפאנל
     */
    function createAdminPanel() {
        // If the panel already exists, just show it
        const existingPanel = document.querySelector('.admin-panel');
        if (existingPanel) {
            existingPanel.classList.add('active');
            // Make sure we're refreshing data
            startDataRefresh();
            return;
        }
        
        // Mark as created
        panelCreated = true;
        
        // Create panel element
        const panel = document.createElement('div');
        panel.className = 'side-panel admin-panel';
        
        // Panel HTML content
        panel.innerHTML = `
            <div class="side-panel-header">
                <h3><i class='bx bx-shield-quarter'></i> פאנל ניהול</h3>
                <div class="side-panel-close"><i class='bx bx-x'></i></div>
            </div>
            <div class="side-panel-body custom-scrollbar">
                <section>
                    <h4><i class='bx bx-user-check'></i> משתמשים מחוברים <span id="online-users-count" class="badge">0</span></h4>
                    <div id="online-users-list" class="users-list">
                        <div class="loading-indicator">
                            <i class='bx bx-loader-alt bx-spin'></i>
                            <span>טוען נתונים...</span>
                        </div>
                    </div>
                    <div class="admin-actions">
                        <button id="view-all-users-btn" class="btn btn-small">
                            <i class='bx bx-group'></i> כל המשתמשים
                            <span id="total-users-count" class="badge">0</span>
                        </button>
                    </div>
                </section>
            </div>
            <div class="side-panel-footer">
                <button class="admin-logout-btn">
                    <i class='bx bx-log-out'></i> התנתק
                </button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(panel);
        
        // Add CSS
        addAdminPanelStyles();
        
        // Setup event listeners
        setupPanelEventListeners(panel);
        
        // Show the panel
        setTimeout(() => {
            panel.classList.add('active');
        }, 100);
        
        // Start refresh timer
        startDataRefresh();
    }
    
    /**
     * הוספת מאזינים לפאנל
     */
    function setupPanelEventListeners(panel) {
        // טיפול באירועי סגירה של הפאנל
        const closeBtn = panel.querySelector('.side-panel-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.classList.remove('active');
                stopDataRefresh();
            });
        }
        
        // טיפול בלחיצה על כפתור כל המשתמשים
        const viewAllUsersBtn = document.getElementById('view-all-users-btn');
        if (viewAllUsersBtn) {
            viewAllUsersBtn.addEventListener('click', showAllUsersModal);
        }
        
        // טיפול בלחיצה על כפתור התנתקות
        const logoutBtn = panel.querySelector('.admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.supabaseAuth.signOut();
                panel.classList.remove('active');
                stopDataRefresh();
            });
        }
    }
    
    /**
     * הצג חלון עם כל המשתמשים
     */
    function showAllUsersModal() {
        // בדיקה אם המודל כבר קיים
        let modal = document.getElementById('all-users-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'all-users-modal';
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <div class="modal-body">
                        <div class="modal-header">
                            <h2 class="modal-title">כל המשתמשים במערכת</h2>
                            <p class="modal-subtitle">רשימת כל המשתמשים הרשומים</p>
                        </div>
                        
                        <div class="users-table-container">
                            <div class="users-table-loading">
                                <i class='bx bx-loader-alt bx-spin'></i>
                                <span>טוען נתונים...</span>
                            </div>
                            <table class="users-table" id="all-users-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>שם מלא</th>
                                        <th>דוא"ל</th>
                                        <th>סטטוס</th>
                                        <th>התחברות אחרונה</th>
                                        <th>פעולות</th>
                                    </tr>
                                </thead>
                                <tbody id="all-users-table-body">
                                    <!-- הנתונים יוצגו כאן -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // הוסף מאזין לכפתור סגירה
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            }
            
            // סגור מודל בלחיצה מחוץ לתוכן
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
        
        // הצג את המודל
        modal.classList.add('active');
        
        // טען את הנתונים
        fetchAllUsers();
    }
    
    /**
     * טעינת כל המשתמשים עבור המודל
     */
    async function fetchAllUsers() {
        try {
            const { data: users, error } = await supabase
                .from('profiles')
                .select('*')
                .order('last_seen', { ascending: false });
                
            if (error) throw error;
            
            renderAllUsersTable(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            document.getElementById('all-users-table-body').innerHTML = 
                `<tr><td colspan="6" class="error-message">שגיאה בטעינת נתונים: ${error.message}</td></tr>`;
        }
    }
    
    /**
     * הצגת כל המשתמשים בטבלה
     */
    function renderAllUsersTable(users) {
        const tableBody = document.getElementById('all-users-table-body');
        if (!tableBody) return;
        
        if (!users || users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="empty-message">לא נמצאו משתמשים</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.className = user.is_online ? 'user-online' : '';
            
            const lastSeen = user.last_seen 
                ? new Date(user.last_seen).toLocaleString('he-IL') 
                : 'לא ידוע';
                
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.fullname || user.full_name || 'ללא שם'}</td>
                <td>${user.email || ''}</td>
                <td>
                    <span class="user-status ${user.is_online ? 'online' : 'offline'}">
                        ${user.is_online ? 'מחובר' : 'לא מחובר'}
                    </span>
                </td>
                <td>${lastSeen}</td>
                <td>
                    <button class="user-action-btn view-btn" data-id="${user.id}">
                        <i class='bx bx-user'></i>
                    </button>
                    <button class="user-action-btn message-btn" data-id="${user.id}">
                        <i class='bx bx-message-rounded'></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // הוסף מאזינים לכפתורי פעולה
        document.querySelectorAll('.user-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = btn.getAttribute('data-id');
                
                if (btn.classList.contains('view-btn')) {
                    alert(`צפייה בפרופיל משתמש ID: ${userId}`);
                } else if (btn.classList.contains('message-btn')) {
                    alert(`שליחת הודעה למשתמש ID: ${userId}`);
                }
            });
        });
        
        // הסר סימון טעינה
        const loadingEl = document.querySelector('.users-table-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }
    
    /**
     * פונקציה לטעינת והצגת משתמשים מחוברים
     */
    async function fetchAndDisplayOnlineUsers() {
        try {
            // אינדיקטור טעינה
            const usersList = document.getElementById('online-users-list');
            if (usersList) {
                usersList.innerHTML = `
                    <div class="loading-indicator">
                        <i class='bx bx-loader-alt bx-spin'></i>
                        <span>טוען נתונים...</span>
                    </div>
                `;
            }
            
            // קבלת המשתמשים המחוברים
            const { users, error } = await window.getOnlineUsers();
            
            if (error) throw error;
            
            // עדכון ספירת המשתמשים המחוברים
            const countEl = document.getElementById('online-users-count');
            if (countEl) {
                countEl.textContent = users.length;
            }
            
            // הצגת המשתמשים ברשימה
            if (usersList) {
                if (users.length === 0) {
                    usersList.innerHTML = `
                        <div class="empty-state">
                            <i class='bx bx-user-x'></i>
                            <span>אין משתמשים מחוברים כרגע</span>
                        </div>
                    `;
                } else {
                    usersList.innerHTML = '';
                    
                    users.forEach(user => {
                        const userCard = document.createElement('div');
                        userCard.className = 'online-user-card';
                        
                        // אם יש לנו תמונת פרופיל
                        const avatarSrc = user.avatar_url || 'assets/img/default-avatar.jpg';
                        
                        userCard.innerHTML = `
                            <div class="user-avatar">
                                <img src="${avatarSrc}" alt="${user.fullname || user.full_name || 'משתמש'}">
                                <span class="online-indicator"></span>
                            </div>
                            <div class="user-info">
                                <div class="user-name">${user.fullname || user.full_name || 'משתמש'}</div>
                                <div class="user-email">${user.email || ''}</div>
                                <div class="user-last-active">פעיל לאחרונה: ${formatLastActive(user.last_seen)}</div>
                            </div>
                            <div class="user-actions">
                                <button class="user-action-btn" data-id="${user.id}" title="צפה בפרופיל">
                                    <i class='bx bx-user'></i>
                                </button>
                                <button class="user-action-btn" data-id="${user.id}" title="שלח הודעה">
                                    <i class='bx bx-message-rounded'></i>
                                </button>
                            </div>
                        `;
                        
                        usersList.appendChild(userCard);
                    });
                }
            }
            
            // קבלת מספר המשתמשים הכולל
            const { count, error: countError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
                
            if (countError) throw countError;
                
            // עדכון ספירת סה"כ משתמשים
            const totalUsersCount = document.getElementById('total-users-count');
            if (totalUsersCount) {
                totalUsersCount.textContent = count || 0;
            }
            
        } catch (error) {
            console.error('שגיאה בטעינת משתמשים מחוברים:', error);
            
            const usersList = document.getElementById('online-users-list');
            if (usersList) {
                usersList.innerHTML = `
                    <div class="error-state">
                        <i class='bx bx-error-circle'></i>
                        <span>שגיאה בטעינת נתונים</span>
                    </div>
                `;
            }
        }
    }
    
    /**
     * פורמט זמן פעילות אחרונה
     */
    function formatLastActive(timestamp) {
        if (!timestamp) return 'לא ידוע';
        
        const lastActive = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - lastActive) / 1000);
        
        if (diffInSeconds < 60) {
            return 'לפני פחות מדקה';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `לפני ${minutes} דקות`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `לפני ${hours} שעות`;
        } else {
            return lastActive.toLocaleString('he-IL');
        }
    }
    
    /**
     * הרשמה לעדכונים בזמן אמת על שינויים בטבלת המשתמשים
     */
    function subscribeToRealtimeUpdates() {
        if (isSubscribed) return;
        
        try {
            console.log('מתחבר להאזנה בזמן אמת לשינויים בטבלת המשתמשים...');
            
            const subscription = supabase
                .channel('public:profiles')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'profiles' 
                }, payload => {
                    console.log('קיבלתי עדכון בזמן אמת:', payload);
                    
                    // עדכון הנתונים המוצגים רק אם השינוי נוגע למצב מקוון/לא מקוון
                    if (payload.new && payload.old) {
                        if (payload.new.is_online !== payload.old.is_online || 
                            payload.new.last_seen !== payload.old.last_seen) {
                            console.log('שינוי במצב מקוון נתגלה - מעדכן תצוגה');
                            fetchAndDisplayOnlineUsers();
                        }
                    } else {
                        // במקרה של הוספה או מחיקה של משתמש, עדכן בכל מקרה
                        fetchAndDisplayOnlineUsers();
                    }
                })
                .subscribe(status => {
                    console.log('סטטוס הרשמה להאזנה בזמן אמת:', status);
                    
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ מחובר בהצלחה להאזנה בזמן אמת');
                        const statusEl = document.querySelector('.panel-status .status-text');
                        if (statusEl) {
                            statusEl.textContent = 'מחובר לנתונים בזמן אמת';
                        }
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ שגיאה בהתחברות להאזנה בזמן אמת');
                        isSubscribed = false;
                    }
                });
                
            isSubscribed = true;
            
        } catch (error) {
            console.error('שגיאה בהרשמה להאזנה בזמן אמת:', error);
            isSubscribed = false;
        }
    }
    
    /**
     * הוספת סגנונות CSS לפאנל הניהול
     */
    function addAdminPanelStyles() {
        // בדיקה אם ה-CSS כבר הוסף
        if (document.getElementById('admin-panel-styles')) return;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'admin-panel-styles';
        styleEl.textContent = `
            /* Admin Panel Styles */
            .admin-panel {
                color: var(--light);
                z-index: 95;
                border-right: 3px solid var(--primary-dark);
                background: rgba(20, 20, 30, 0.95);
                backdrop-filter: blur(10px);
                box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .admin-panel .side-panel-header {
                background: rgba(var(--primary-rgb), 0.1);
                border-bottom: 1px solid rgba(var(--primary-rgb), 0.2);
                padding: 15px 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .admin-panel .side-panel-header h3 {
                font-size: 1.2rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--primary-light);
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            }
            
            .admin-panel .side-panel-header h3 i {
                color: var(--primary);
                background: rgba(var(--primary-rgb), 0.15);
                padding: 8px;
                border-radius: 8px;
                font-size: 1.1rem;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            
            .admin-panel .side-panel-body {
                padding: 20px;
            }
            
            .admin-stats {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 25px;
            }
            
            .admin-stat-item {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 15px;
                transition: all 0.3s ease;
                border-right: 3px solid transparent;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
            }
            
            .admin-stat-item:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.08));
                z-index: 0;
            }
            
            .admin-stat-item:hover {
                transform: translateY(-3px);
                background: rgba(255, 255, 255, 0.12);
                border-right-color: var(--primary);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
            }
            
            .stat-icon {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 15px;
                font-size: 22px;
                flex-shrink: 0;
                position: relative;
                z-index: 1;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
            }
            
            .online-users-icon {
                background: linear-gradient(135deg, rgba(98, 0, 234, 0.15), rgba(98, 0, 234, 0.3));
                color: #8C54FF;
                animation: pulse 2s infinite;
            }
            
            .total-users-icon {
                background: linear-gradient(135deg, rgba(3, 218, 198, 0.15), rgba(3, 218, 198, 0.3));
                color: #03DAC6;
            }
            
            .stat-content {
                flex-grow: 1;
                position: relative;
                z-index: 1;
            }
            
            .stat-value {
                font-size: 28px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                color: #fff;
                margin-bottom: 5px;
                transition: all 0.3s ease;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.7);
                font-weight: 500;
            }
            
            .admin-panel .action-buttons {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .admin-panel .admin-button {
                background: rgba(var(--primary-rgb), 0.2);
                color: var(--primary-light);
                border: none;
                border-radius: 8px;
                padding: 10px 15px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                flex: 1;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            
            .admin-panel .admin-button:hover {
                background: rgba(var(--primary-rgb), 0.3);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
            
            .admin-panel .admin-button i {
                font-size: 1.1rem;
            }
            
            .admin-panel section {
                margin-bottom: 25px;
            }
            
            .admin-panel section h4 {
                font-size: 1.1rem;
                margin-bottom: 15px;
                color: var(--primary-light);
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 10px;
            }
            
            .admin-panel section h4 i {
                color: var(--primary);
            }
            
            .admin-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            
            .admin-action-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                padding: 10px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.08);
                border: none;
                color: var(--light);
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .admin-action-btn i {
                margin-left: 8px;
                font-size: 18px;
            }
            
            .admin-action-btn:hover {
                background: rgba(255, 255, 255, 0.15);
            }
            
            .admin-action-btn.refreshing i {
                animation: spin 1s linear infinite;
            }
            
            .refresh-btn {
                background: rgba(var(--primary-rgb), 0.2);
            }
            
            .view-all-btn {
                background: rgba(var(--secondary-rgb), 0.2);
            }
            
            .panel-status {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
            }
            
            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #9e9e9e;
                margin-left: 8px;
            }
            
            .status-indicator.active {
                background: #4CAF50;
                box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
                animation: pulse 2s infinite;
            }
            
            /* טבלת כל המשתמשים */
            .users-table-container {
                max-height: 60vh;
                overflow-y: auto;
                position: relative;
            }
            
            .users-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                font-size: 14px;
                color: var(--light);
            }
            
            .users-table thead {
                position: sticky;
                top: 0;
                background: var(--background-secondary);
                z-index: 1;
            }
            
            .users-table th,
            .users-table td {
                padding: 12px 15px;
                text-align: right;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .users-table th {
                font-weight: 600;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .users-table tr {
                transition: background 0.2s ease;
            }
            
            .users-table tbody tr:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .users-table tr.user-online {
                background: rgba(76, 175, 80, 0.05);
            }
            
            .users-table tr.user-online:hover {
                background: rgba(76, 175, 80, 0.1);
            }
            
            .user-status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .user-status.online {
                background: rgba(76, 175, 80, 0.15);
                color: #4CAF50;
            }
            
            .user-status.offline {
                background: rgba(158, 158, 158, 0.15);
                color: #9e9e9e;
            }
            
            .users-table-loading {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(10, 10, 26, 0.8);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: var(--light);
                z-index: 2;
            }
            
            .users-table-loading i {
                font-size: 36px;
                margin-bottom: 15px;
                color: var(--primary);
            }
            
            .empty-message,
            .error-message {
                text-align: center;
                padding: 20px;
                color: rgba(255, 255, 255, 0.6);
            }
            
            .error-message {
                color: #F44336;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
                }
            }
        `;
        
        document.head.appendChild(styleEl);
    }

    /**
     * פונקציה לתחילת רענון נתונים באופן תקופתי
     */
    let refreshInterval = null;
    const REFRESH_INTERVAL = 30000; // 30 seconds
    
    function startDataRefresh() {
        // Cancel existing timer if it exists
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        
        // Immediately fetch the data
        fetchAndDisplayOnlineUsers();
        
        // Set up interval for periodic refresh
        refreshInterval = setInterval(() => {
            fetchAndDisplayOnlineUsers();
        }, REFRESH_INTERVAL);
        
        console.log('🔄 רענון נתונים הוגדר לכל 30 שניות');
    }
    
    /**
     * פונקציה להפסקת רענון נתונים
     */
    function stopDataRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
            console.log('⏹️ רענון נתונים הופסק');
        }
    }
})();