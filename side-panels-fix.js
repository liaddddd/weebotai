/**
 * side-panels.js
 * טיפול בפאנלים הצדדיים (הודעות וקישורים מהירים)
 */

(function() {
    console.log('מתחיל אתחול פאנלים צדדיים...');
    
    // משתנים גלובלים
    let initialized = false;
    let notificationsPanel = null;
    
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
        
        console.log('מאתחל פאנלים צדדיים...');
        
        // איתור הפאנלים
        findPanels();
        
        // אתחול מיקום הפאנלים
        setupPanelsPosition();
        
        // הוספת מאזיני אירועים
        setupEventListeners();
        
        // הוספת אפקטים ויזואליים
        setupVisualEffects();
        
        // אתחול פונקציונליות חיפוש
        setupSearchFunctionality();
        
        // סימון שהאתחול בוצע
        initialized = true;
        console.log('אתחול פאנלים צדדיים הושלם');
    }
    
    /**
     * איתור הפאנלים בדף
     */
    function findPanels() {
        console.log('מאתר פאנלים צדדיים...');
        notificationsPanel = document.querySelector('.notifications-panel');
        
        console.log('סטטוס איתור פאנלים:', {
            'פאנל הודעות': !!notificationsPanel
        });
    }
    
    /**
     * אתחול מיקום הפאנלים
     */
    function setupPanelsPosition() {
        console.log('מגדיר מיקום פאנלים...');
        
        // וידוא שהפאנלים ממוקמים נכון
        if (notificationsPanel) {
            notificationsPanel.style.left = '20px';
            notificationsPanel.style.right = 'auto';
            notificationsPanel.classList.remove('closed');
        }
        
        // קביעת כיוון האייקונים
        if (notificationsPanel) {
            const toggleIcon = notificationsPanel.querySelector('.panel-toggle i');
            if (toggleIcon) {
                toggleIcon.classList.remove('bx-chevron-left');
                toggleIcon.classList.add('bx-chevron-right');
            }
        }
    }
    
    /**
     * הוספת מאזיני אירועים לפאנלים
     */
    function setupEventListeners() {
        console.log('מוסיף מאזיני אירועים לפאנלים...');
        
        // פאנל הודעות
        if (notificationsPanel) {
            const toggleBtn = notificationsPanel.querySelector('.panel-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', function() {
                    notificationsPanel.classList.toggle('closed');
                    
                    // עדכון האייקון בהתאם למצב הפאנל
                    const icon = this.querySelector('i');
                    if (notificationsPanel.classList.contains('closed')) {
                        icon.classList.remove('bx-chevron-right');
                        icon.classList.add('bx-chevron-left');
                    } else {
                        icon.classList.remove('bx-chevron-left');
                        icon.classList.add('bx-chevron-right');
                    }
                });
            }
            
            // מאזין לחיצות "צפה בכל ההודעות"
            const viewAllLink = notificationsPanel.querySelector('.view-all-link');
            if (viewAllLink) {
                viewAllLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    alert('צפייה בכל ההודעות - פונקציונליות זו תתווסף בהמשך');
                });
            }
        }
    }
    
    /**
     * הוספת אפקטים ויזואליים לפאנלים
     */
    function setupVisualEffects() {
        console.log('מוסיף אפקטים ויזואליים לפאנלים...');
        
        // אפקט Tilt אם הספרייה זמינה
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
                max: 5,
                speed: 400,
                glare: true,
                "max-glare": 0.1,
                scale: 1.02
            });
        }
        
        // אנימציות GSAP אם הספרייה זמינה
        if (typeof gsap !== 'undefined') {
            // אנימציה לפאנל ההודעות
            if (notificationsPanel) {
                gsap.fromTo(notificationsPanel,
                    { x: -30, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
                );
                
                // אנימציה להודעות
                const notificationItems = notificationsPanel.querySelectorAll('.notification-item');
                gsap.fromTo(notificationItems,
                    { x: -20, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)", delay: 0.5 }
                );
            }
        }
    }
    
    /**
     * הגדרת פונקציונליות חיפוש בפאנלים
     */
    function setupSearchFunctionality() {
        console.log('מגדיר פונקציונליות חיפוש בפאנלים...');
        
        // פונקציונליות חיפוש רק בפאנל ההתראות
        // מסיר את כל החיפוש בפאנל הקישורים המהירים
        
        // פאנל התראות (אם הוחלט להוסיף חיפוש גם שם)
        if (notificationsPanel) {
            // קוד לחיפוש בפאנל התראות יוכל להתווסף כאן
        }
        
        // מחקנו את כל הקוד המתייחס לחיפוש בפאנל קישורים מהירים
    }
    
    /**
     * התאמת הפאנלים למסכים קטנים
     */
    function adjustForMobileScreens() {
        console.log('מתאים פאנלים למסכים קטנים...');
        
        const isMobile = window.innerWidth <= 992;
        
        if (isMobile) {
            // סגור את הפאנלים במצב מובייל כברירת מחדל
            if (notificationsPanel && !notificationsPanel.classList.contains('closed')) {
                notificationsPanel.classList.add('closed');
                const toggleIcon = notificationsPanel.querySelector('.panel-toggle i');
                if (toggleIcon) {
                    toggleIcon.classList.remove('bx-chevron-right');
                    toggleIcon.classList.add('bx-chevron-left');
                }
            }
        } else {
            // פתח את הפאנלים במסך גדול
            if (notificationsPanel && notificationsPanel.classList.contains('closed')) {
                notificationsPanel.classList.remove('closed');
                const toggleIcon = notificationsPanel.querySelector('.panel-toggle i');
                if (toggleIcon) {
                    toggleIcon.classList.remove('bx-chevron-left');
                    toggleIcon.classList.add('bx-chevron-right');
                }
            }
        }
    }
    
    // האזן לשינויי גודל המסך
    window.addEventListener('resize', adjustForMobileScreens);
    
    // התאם למסך בטעינה ראשונית
    setTimeout(adjustForMobileScreens, 800);
    
    // חשיפת פונקציות לחלון הגלובלי
    window.sidePanels = {
        toggleNotificationsPanel: function() {
            if (notificationsPanel) {
                notificationsPanel.classList.toggle('closed');
                const toggleIcon = notificationsPanel.querySelector('.panel-toggle i');
                if (toggleIcon) {
                    toggleIcon.classList.toggle('bx-chevron-left');
                    toggleIcon.classList.toggle('bx-chevron-right');
                }
                return true;
            }
            return false;
        },
        reInit: init
    };
})();