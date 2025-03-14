/**
 * auth.js
 * מערכת אימות מאוחדת לאתר
 */

(function() {
    console.log('מתחיל טעינת מערכת האימות המאוחדת...');
    
    // משתנים גלובליים
    let initialized = false;
    let loginModalElement = null;
    let registerModalElement = null;
    let userInfoElement = null;
    let logoutModalElement = null;
    
    // מבטיח שהקוד רץ מיד בטעינת הדף
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    /**
     * פונקציית אתחול ראשית
     */
    function init() {
        if (initialized) return;
        
        console.log('מאתחל מערכת אימות מאוחדת...');
        
        // 1. אתחול אלמנטים חיוניים
        findAndInitElements();
        
        // 2. תיקון כפתורי התחברות והתנתקות
        setupAuthButtons();
        
        // 3. תיקון מודלים
        setupAuthModals();
        
        // 4. תיקון מאזיני טפסים
        setupAuthForms();
        
        // 5. האזנה לשינויי מצב התחברות
        setupAuthStateListener();
        
        // סימון שהאתחול בוצע
        initialized = true;
        console.log('מערכת אימות אותחלה בהצלחה');
    }
    
    /**
     * איתור ואתחול אלמנטים חיוניים
     */
    function findAndInitElements() {
        console.log('מאתר אלמנטים חיוניים למערכת האימות...');
        
        // איתור מודלים
        loginModalElement = document.getElementById('loginModal');
        registerModalElement = document.getElementById('registerModal');
        userInfoElement = document.getElementById('user-info');
        logoutModalElement = document.getElementById('logoutModal');  // מודל אישור התנתקות
        
        console.log('סטטוס איתור אלמנטים:', {
            'מודל התחברות': !!loginModalElement,
            'מודל הרשמה': !!registerModalElement,
            'אזור פרטי משתמש': !!userInfoElement,
            'מודל אישור התנתקות': !!logoutModalElement
        });
        
        // אם לא נמצא מודל אישור התנתקות, יוצרים אחד חדש
        if (!logoutModalElement) {
            console.log('לא נמצא מודל אישור התנתקות - יוצר חדש');
            logoutModalElement = createLogoutModal();
        }
    }
    
    /**
     * יצירת מודל אישור התנתקות אם לא קיים
     */
    function createLogoutModal() {
        const modal = document.createElement('div');
        modal.id = 'logoutModal';
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>אישור התנתקות</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>האם אתה בטוח שברצונך להתנתק מהמערכת?</p>
                </div>
                <div class="modal-footer">
                    <button id="confirm-logout" class="modal-button confirm-button">אישור</button>
                    <button id="cancel-logout" class="modal-button cancel-button">ביטול</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // הוספת מאזיני אירועים למודל החדש
        const confirmBtn = modal.querySelector('#confirm-logout');
        const cancelBtn = modal.querySelector('#cancel-logout');
        const closeBtn = modal.querySelector('.modal-close');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', performLogout);
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                modal.classList.remove('active');
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('active');
            });
        }
        
        return modal;
    }
    
    /**
     * תיקון כפתורי התחברות והתנתקות
     */
    function setupAuthButtons() {
        console.log('מתקן כפתורי התחברות והתנתקות...');
        
        // תיקון כפתורי התחברות
        const loginButtons = document.querySelectorAll('#login-btn, .login-button, .login-btn, [data-action="login"]');
        loginButtons.forEach(button => {
            // ניקוי מאזינים קיימים
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // הסרת מאפיין onclick שעלול לגרום לרענון דף
            if (newButton.hasAttribute('onclick')) {
                newButton.removeAttribute('onclick');
            }
            
            // תיקון href אם זה אלמנט a
            if (newButton.tagName.toLowerCase() === 'a') {
                newButton.setAttribute('href', 'javascript:void(0)');
            }
            
            // הוספת מאזין חדש שמונע רענון דף
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('כפתור התחברות נלחץ - פותח מודל התחברות');
                
                if (loginModalElement) {
                    loginModalElement.classList.add('active');
                    
                    // מיקוד בשדה האימייל
                    const emailInput = loginModalElement.querySelector('input[type="email"], input[name="email"]');
                    if (emailInput) {
                        setTimeout(() => emailInput.focus(), 100);
                    }
                } else {
                    console.error('לא נמצא מודל התחברות!');
                }
                
                return false;
            });
            
            // וידוא שהכפתור מוצג
            newButton.style.display = '';
            newButton.style.visibility = 'visible';
        });
        
        // תיקון כפתורי התנתקות
        const logoutButtons = document.querySelectorAll('#logout-btn, .logout-button, .logout-btn, [data-action="logout"]');
        logoutButtons.forEach(button => {
            // ניקוי מאזינים קיימים
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // הסרת מאפיין onclick שעלול לגרום לרענון דף
            if (newButton.hasAttribute('onclick')) {
                newButton.removeAttribute('onclick');
            }
            
            // תיקון href אם זה אלמנט a
            if (newButton.tagName.toLowerCase() === 'a') {
                newButton.setAttribute('href', 'javascript:void(0)');
            }
            
            // הוספת מאזין חדש לפעולת התנתקות
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('כפתור התנתקות נלחץ - מבצע התנתקות');
                
                if (logoutModalElement) {
                    // פתיחת מודל אישור התנתקות
                    logoutModalElement.classList.add('active');
                } else {
                    // התנתקות ישירה ללא אישור
                    performLogout();
                }
                
                return false;
            });
        });
        
        // התאמת מודל אישור התנתקות אם קיים
        if (logoutModalElement) {
            const confirmBtn = logoutModalElement.querySelector('#confirm-logout, .logout-confirm');
            const cancelBtn = logoutModalElement.querySelector('#cancel-logout, .cancel-button');
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function() {
                    performLogout();
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    logoutModalElement.classList.remove('active');
                });
            }
        }
    }
    
    /**
     * פונקציית התנתקות
     */
    async function performLogout() {
        console.log('מבצע התנתקות מהמערכת...');
        
        try {
            if (typeof window.supabaseAuth !== 'undefined') {
                const { success, error } = await window.supabaseAuth.logoutUser();
                
                if (!success) {
                    console.error('שגיאה בהתנתקות:', error);
                    alert('אירעה שגיאה בהתנתקות. נא לנסות שוב.');
                    return;
                }
            } else {
                console.error('מערכת האימות לא מוגדרת בחלון הראשי');
            }
            
            // ניקוי UI
            updateUIToLoggedOutState();
            
            // סגירת מודל אם פתוח
            if (logoutModalElement && logoutModalElement.classList.contains('active')) {
                logoutModalElement.classList.remove('active');
            }
            
            // הודעה למשתמש
            alert('התנתקת בהצלחה!');
            
            // רענון הדף
            setTimeout(() => window.location.reload(), 500);
        } catch (err) {
            console.error('שגיאה לא צפויה בהתנתקות:', err);
            alert('אירעה שגיאה לא צפויה בהתנתקות. נא לנסות שוב.');
        }
    }
    
    /**
     * תיקון מודלים של התחברות והרשמה
     */
    function setupAuthModals() {
        console.log('מתקן מודלים של התחברות והרשמה...');
        
        // תיקון כפתורי סגירת מודלים
        document.querySelectorAll('.modal-close, .close-modal').forEach(button => {
            // ניקוי מאזינים קיימים
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // הוספת מאזין חדש לסגירת מודל
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                // סגירת כל המודלים
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            });
        });
        
        // מאזין לסגירת מודלים בלחיצה על הרקע
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
        
        // מאזין לסגירת מודלים בלחיצה על Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
        
        // קישורים למעבר בין מודלים
        document.querySelectorAll('#register-link, .register-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // סגירת מודל התחברות
                if (loginModalElement) {
                    loginModalElement.classList.remove('active');
                }
                
                // פתיחת מודל הרשמה
                if (registerModalElement) {
                    registerModalElement.classList.add('active');
                }
            });
        });
        
        document.querySelectorAll('#login-link, .login-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // סגירת מודל הרשמה
                if (registerModalElement) {
                    registerModalElement.classList.remove('active');
                }
                
                // פתיחת מודל התחברות
                if (loginModalElement) {
                    loginModalElement.classList.add('active');
                }
            });
        });
    }
    
    /**
     * תיקון טפסי התחברות והרשמה
     */
    function setupAuthForms() {
        console.log('מתקן טפסי התחברות והרשמה...');
        
        // תיקון טופס התחברות
        const loginForm = loginModalElement ? 
            (loginModalElement.querySelector('form') || 
             loginModalElement.querySelector('#loginForm') || 
             loginModalElement.querySelector('#login-form')) : null;
        
        if (loginForm) {
            // מניעת שליחת טופס רגילה
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // ביצוע התחברות
                handleLogin(loginForm);
                
                return false;
            });
            
            // תיקון כפתור התחברות בטופס
            const loginSubmitBtn = loginForm.querySelector('button[type="submit"], #login-submit-btn, .login-submit-btn, button:not(.modal-close):not(.toggle-password)');
            
            if (loginSubmitBtn) {
                // ניקוי מאזינים קיימים
                const newLoginSubmitBtn = loginSubmitBtn.cloneNode(true);
                loginSubmitBtn.parentNode.replaceChild(newLoginSubmitBtn, loginSubmitBtn);
                
                // הוספת מאזין חדש
                newLoginSubmitBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // ביצוע התחברות
                    handleLogin(loginForm);
                    
                    return false;
                });
            }
        }
        
        // תיקון טופס הרשמה
        const registerForm = registerModalElement ? 
            (registerModalElement.querySelector('form') || 
             registerModalElement.querySelector('#registerForm') || 
             registerModalElement.querySelector('#register-form')) : null;
        
        if (registerForm) {
            // מניעת שליחת טופס רגילה
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // ביצוע הרשמה
                handleRegistration(registerForm);
                
                return false;
            });
            
            // תיקון כפתור הרשמה בטופס
            const registerSubmitBtn = registerForm.querySelector('button[type="submit"], input[type="submit"], #register-submit-btn, .register-submit-btn');
            
            if (registerSubmitBtn) {
                // ניקוי מאזינים קיימים
                const newRegisterSubmitBtn = registerSubmitBtn.cloneNode(true);
                registerSubmitBtn.parentNode.replaceChild(newRegisterSubmitBtn, registerSubmitBtn);
                
                // הוספת מאזין חדש
                newRegisterSubmitBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // ביצוע הרשמה
                    handleRegistration(registerForm);
                    
                    return false;
                });
            }
        }
    }
    
    /**
     * פונקציית התחברות
     * @param {HTMLFormElement} form - טופס ההתחברות
     */
    async function handleLogin(form) {
        if (!form) {
            console.error('חסר טופס התחברות!');
            return;
        }
        
        console.log('מבצע התחברות...');
        
        // איסוף נתונים מהטופס
        const emailInput = form.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = form.querySelector('input[type="password"], input[name="password"]');
        
        if (!emailInput || !passwordInput) {
            console.error('חסרים שדות חובה בטופס!');
            alert('חסרים שדות חובה בטופס התחברות!');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // בדיקת תקינות
        if (!email || !password) {
            alert('נא למלא את כל השדות!');
            return;
        }
        
        // עדכון כפתור שליחה
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], #login-submit-btn, .login-submit-btn');
        let originalBtnText = '';
        
        if (submitBtn) {
            originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מתחבר...';
            submitBtn.disabled = true;
        }
        
        try {
            // התחברות באמצעות סופאבייס
            if (typeof window.supabaseAuth === 'undefined') {
                throw new Error('סופאבייס לא מוגדר!');
            }
            
            const { success, user, error } = await window.supabaseAuth.loginUser(email, password);
            
            if (!success || error) {
                throw new Error(error || 'שגיאה בהתחברות');
            }
            
            console.log('התחברות הצליחה:', user.id);
            
            // סגירת מודל התחברות
            if (loginModalElement) {
                loginModalElement.classList.remove('active');
            }
            
            // עדכון ממשק המשתמש
            await updateUIToLoggedInState(user);
            
            // איפוס טופס
            form.reset();
            
            // הודעת הצלחה
            alert('התחברת בהצלחה!');
        } catch (error) {
            console.error('שגיאת התחברות:', error.message);
            
            // הודעת שגיאה מותאמת
            let errorMessage = 'שגיאה בהתחברות. אנא בדוק את פרטי הכניסה ונסה שוב.';
            
            if (error.message.includes('Invalid login')) {
                errorMessage = 'פרטי כניסה שגויים. אנא בדוק את האימייל והסיסמה.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'כתובת האימייל טרם אומתה. אנא בדוק את תיבת הדואר שלך.';
            }
            
            alert(errorMessage);
            
            // ניקוי שדה הסיסמה
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        } finally {
            // שחזור כפתור שליחה
            if (submitBtn) {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    }
    
    /**
     * פונקציית הרשמה
     * @param {HTMLFormElement} form - טופס ההרשמה
     */
    async function handleRegistration(form) {
        if (!form) {
            console.error('חסר טופס הרשמה!');
            return;
        }
        
        console.log('מבצע הרשמה...');
        
        // איסוף נתונים מהטופס
        const fullnameInput = form.querySelector('input[name="fullname"], #reg-fullname');
        const emailInput = form.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = form.querySelector('input[type="password"], input[name="password"]');
        
        if (!emailInput || !passwordInput) {
            console.error('חסרים שדות חובה בטופס!');
            alert('חסרים שדות חובה בטופס הרשמה!');
            return;
        }
        
        const fullname = fullnameInput ? fullnameInput.value.trim() : '';
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // בדיקת תקינות
        if (!email || !password) {
            alert('נא למלא את שדות האימייל והסיסמה!');
            return;
        }
        
        if (password.length < 6) {
            alert('הסיסמה חייבת להכיל לפחות 6 תווים!');
            return;
        }
        
        // עדכון כפתור שליחה
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], #register-submit-btn, .register-submit-btn');
        let originalBtnText = '';
        
        if (submitBtn) {
            originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> נרשם...';
            submitBtn.disabled = true;
        }
        
        try {
            // הרשמה באמצעות סופאבייס
            if (typeof window.supabaseAuth === 'undefined') {
                throw new Error('סופאבייס לא מוגדר!');
            }
            
            const { success, user, error } = await window.supabaseAuth.registerUser(fullname, email, password);
            
            if (!success || error) {
                throw new Error(error || 'שגיאה בהרשמה');
            }
            
            console.log('הרשמה הצליחה:', user.id);
            
            // סגירת מודל הרשמה
            if (registerModalElement) {
                registerModalElement.classList.remove('active');
            }
            
            // איפוס טופס
            form.reset();
            
            // פתיחת מודל התחברות
            if (loginModalElement) {
                setTimeout(() => {
                    // הזנת האימייל בטופס התחברות
                    const loginEmailInput = loginModalElement.querySelector('input[type="email"], input[name="email"]');
                    if (loginEmailInput) {
                        loginEmailInput.value = email;
                    }
                    
                    loginModalElement.classList.add('active');
                }, 500);
            }
            
            alert('הרשמה הצליחה! אנא התחבר עם הפרטים שיצרת.');
        } catch (error) {
            console.error('שגיאת הרשמה:', error);
            
            // הודעת שגיאה מותאמת
            let errorMessage = 'שגיאה בהרשמה. אנא נסה שוב.';
            
            if (error.message.includes('already registered')) {
                errorMessage = 'כתובת האימייל כבר רשומה במערכת. אנא התחבר או השתמש בכתובת אחרת.';
            } else if (error.message.includes('weak password')) {
                errorMessage = 'הסיסמה חלשה מדי. אנא בחר סיסמה מורכבת יותר.';
            }
            
            alert(errorMessage);
            
            // ניקוי שדה הסיסמה
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        } finally {
            // שחזור כפתור שליחה
            if (submitBtn) {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    }
    
    /**
     * האזנה לשינויי מצב התחברות
     */
    function setupAuthStateListener() {
        console.log('מגדיר האזנה לשינויי מצב התחברות...');
        
        // האזנה לאירוע התחברות
        window.addEventListener('supabase:auth:signedIn', async (event) => {
            const user = event.detail.user;
            console.log('התקבל אירוע התחברות:', user);
            updateUIToLoggedInState(user);
        });
        
        // האזנה לאירוע התנתקות
        window.addEventListener('supabase:auth:signedOut', () => {
            console.log('התקבל אירוע התנתקות');
            updateUIToLoggedOutState();
        });
        
        // בדיקת מצב התחברות נוכחי
        checkCurrentAuthState();
    }
    
    /**
     * בדיקת מצב התחברות נוכחי
     */
    async function checkCurrentAuthState() {
        try {
            if (typeof window.supabaseAuth === 'undefined') {
                console.error('מערכת האימות לא מוגדרת בחלון הראשי');
                return;
            }
            
            const { success, user } = await window.supabaseAuth.getCurrentUser();
            
            if (success && user) {
                console.log('נמצא משתמש מחובר:', user.id);
                updateUIToLoggedInState(user);
            } else {
                console.log('אין משתמש מחובר');
                updateUIToLoggedOutState();
            }
        } catch (error) {
            console.error('שגיאה בבדיקת מצב התחברות:', error);
            updateUIToLoggedOutState();
        }
    }
    
    /**
     * עדכון ה-UI למצב מחובר
     */
    async function updateUIToLoggedInState(user) {
        if (!user || !user.id) {
            console.warn('חסרים נתוני משתמש לעדכון UI!');
            return;
        }
        
        try {
            console.log('מעדכן UI למצב מחובר...');
            
            // הסתרת כפתור ההתחברות
            const loginBtns = document.querySelectorAll('#login-btn, .login-button, .login-btn');
            loginBtns.forEach(btn => {
                btn.classList.add('hidden');
                btn.style.display = 'none';
            });
            
            // הצגת מידע המשתמש
            if (userInfoElement) {
                userInfoElement.classList.remove('hidden');
                userInfoElement.style.display = '';
            }
            
            // עדכון שם משתמש מהפרופיל
            const userNameEl = document.getElementById('user-name');
            if (userNameEl) {
                const displayName = user.profile?.fullname || 
                                   user.user_metadata?.fullname || 
                                   user.email?.split('@')[0] || 
                                   'משתמש';
                userNameEl.textContent = displayName;
            }
            
            // עדכון אווטאר המשתמש אם קיים
            const userAvatarEl = document.getElementById('user-avatar');
            if (userAvatarEl && user.profile?.avatar_url) {
                userAvatarEl.src = user.profile.avatar_url;
            }
            
            // בדוק אם המשתמש הוא מנהל
            const isAdmin = user.profile?.role === 'admin' || await window.isUserAdmin(user.id);
            
            if (isAdmin) {
                console.log('משתמש מנהל מזוהה - טוען פאנל ניהול');
                
                // טען את קובץ admin-dashboard.js אם לא נטען עדיין
                if (!document.querySelector('script[src*="admin-dashboard.js"]')) {
                    const script = document.createElement('script');
                    script.src = 'admin-dashboard.js';
                    document.body.appendChild(script);
                }
            }
        } catch (error) {
            console.error('שגיאה בעדכון ממשק משתמש:', error);
        }
    }

    /**
     * עדכון ה-UI למצב מנותק
     */
    function updateUIToLoggedOutState() {
        console.log('מעדכן UI למצב מנותק...');
        
        // הצגת כפתור התחברות
        const loginBtns = document.querySelectorAll('#login-btn, .login-button, .login-btn');
        loginBtns.forEach(btn => {
            btn.classList.remove('hidden');
            btn.style.display = '';
        });
        
        // הסתרת מידע המשתמש
        if (userInfoElement) {
            userInfoElement.classList.add('hidden');
            userInfoElement.style.display = 'none';
        }
    }
    
    // חשיפת פונקציות לחלון הגלובלי
    window.authSystem = {
        openLoginModal: function() {
            if (loginModalElement) {
                loginModalElement.classList.add('active');
                return true;
            }
            return false;
        },
        openRegisterModal: function() {
            if (registerModalElement) {
                registerModalElement.classList.add('active');
                return true;
            }
            return false;
        },
        logout: performLogout,
        handleLogin: handleLogin,
        updateUIToLoggedInState: updateUIToLoggedInState,
        updateUIToLoggedOutState: updateUIToLoggedOutState
    };
})();