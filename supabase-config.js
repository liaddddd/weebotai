// Supabase configuration
const supabaseUrl = 'https://qjjpskyzqenhuybanxxr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqanBza3l6cWVuaHV5YmFueHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNDU5NTAsImV4cCI6MjA1NjkyMTk1MH0.FH7ljvIsmB3kuNU0YeYuUdlSiaF1tTE8sHBdON1WuUE'

// Initialize Supabase client
try {
    // Check if the Supabase library is loaded
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded!');
    } else {
        // Initialize client using the proper method 
        // When loaded via CDN, createClient is available in the global supabase object
        const { createClient } = supabase;
        
        // Create the client
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        
        // Make it globally accessible
        window.supabase = supabaseClient;
        
        console.log('Supabase client initialized successfully!');
    }
} catch (error) {
    console.error('Error initializing Supabase client:', error);
}

// Global Supabase auth namespace
window.supabaseAuth = {
    // Login user with email and password
    loginUser: async function(email, password) {
        console.log('מנסה להתחבר עם המייל:', email);
        try {
            // Validate inputs
            if (!email || !password) {
                console.error('שגיאת התחברות: נא להזין אימייל וסיסמה');
                return { success: false, error: 'חסרים פרטי התחברות' };
            }

            // Attempt to sign in with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            // Handle authentication errors
            if (error) {
                console.error('Supabase login error:', error);
                return { 
                    success: false, 
                    error: error.message || 'שגיאה בהתחברות. פרטי המשתמש שגויים או המשתמש אינו קיים.' 
                };
            }

            // Ensure we have user data
            if (!data || !data.user) {
                return { 
                    success: false, 
                    error: 'לא התקבלו נתוני משתמש מהשרת' 
                };
            }

            console.log('Login successful, user data:', data.user);

            // Get profile information if needed
            let profile = null;
            try {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                    
                if (profileData) {
                    profile = profileData;
                    console.log('User profile loaded:', profile);
                }
            } catch (profileError) {
                console.warn('Could not load profile:', profileError);
            }

            // Return successful login data
            return {
                success: true,
                user: {
                    ...data.user,
                    profile: profile
                }
            };
        } catch (unexpectedError) {
            console.error('Unexpected error during login:', unexpectedError);
            return { 
                success: false, 
                error: 'שגיאה לא צפויה בתהליך ההתחברות' 
            };
        }
    },

    // Register a new user
    registerUser: async function(fullname, email, password) {
        try {
            console.log('הרשמה:', { fullname, email });
            
            // Register the user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        fullname,
                        role: 'user' // Default role for new users
                    }
                }
            });
            
            if (authError) {
                console.error('Error in user registration:', authError);
                throw authError;
            }
            
            console.log('User registration successful:', authData);
            
            // If we have a user, try to create a profile for them
            if (authData && authData.user) {
                try {
                    console.log('Attempting to create profile for user:', authData.user.id);
                    
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: authData.user.id,
                            fullname,
                            email,
                            role: 'user',
                            created_at: new Date().toISOString(),
                            is_online: true,
                            last_seen: new Date().toISOString()
                        });
                    
                    if (profileError) {
                        console.warn('Non-critical error creating profile:', profileError.message);
                    } else {
                        console.log('Profile created successfully for user:', authData.user.id);
                    }
                } catch (profileError) {
                    console.warn('Failed to create profile but continuing with registration:', profileError);
                }
                
                return { success: true, user: authData.user };
            }
            
            console.error('No user data returned from signUp, but no error either');
            return { success: false, error: 'לא התקבלו נתוני משתמש מהשרת' };
        } catch (error) {
            console.error('Error registering:', error.message);
            return { success: false, error: error.message };
        }
    },

    // Logout user
    logoutUser: async function() {
        console.log('מנסה לבצע התנתקות משתמש...');
        
        try {
            // נקה תחילה את המידע הקיים
            const currentUser = await supabase.auth.getUser();
            
            // ניקוי פאנל הניהול אם קיים
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel) {
                adminPanel.remove();
                console.log('פאנל הניהול הוסר');
            }
            
            // ניקוי פרטי משתמש מהממשק אם ישנם
            const userInfoElements = document.querySelectorAll('.user-info, .user-avatar, .user-name, .user-email');
            userInfoElements.forEach(el => {
                if (el.classList.contains('user-name') || el.classList.contains('user-email')) {
                    el.textContent = '';
                } else if (el.classList.contains('user-avatar')) {
                    el.src = 'https://via.placeholder.com/40';
                }
            });
            
            // ביטול הרשאות מנהל אם יש צורך
            window.isAdmin = false;
            
            // התנתקות מהשרת
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('שגיאה בהתנתקות:', error);
                return { 
                    success: false, 
                    error: error.message || 'שגיאה בביצוע ההתנתקות' 
                };
            }
            
            // עדכון מצב התחברות בשולחן profiles
            if (currentUser?.data?.user?.id) {
                await updateUserOnlineStatus(currentUser.data.user.id, false);
            }
            
            // שליחת אירוע התנתקות
            window.dispatchEvent(new CustomEvent('supabase:auth:signedOut'));
            
            console.log('התנתקות בוצעה בהצלחה');
            return { success: true };
        } catch (error) {
            console.error('שגיאה לא צפויה בהתנתקות:', error);
            return { 
                success: false, 
                error: 'שגיאה לא צפויה בתהליך ההתנתקות' 
            };
        }
    },

    // Get current user
    getCurrentUser: async function() {
        try {
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('שגיאה בקבלת הסשן:', error.message);
                throw error;
            }
            
            if (!data || !data.session || !data.session.user) {
                console.log('אין סשן פעיל כרגע');
                return { success: false, user: null };
            }
            
            const user = data.session.user;
            console.log('נמצא משתמש מחובר:', user.id);
            
            // נסה לקבל מידע נוסף מטבלת הפרופילים
            try {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (!profileError && profile) {
                    user.profile = profile;
                    console.log('נטען פרופיל המשתמש:', profile);
                }
            } catch (profileError) {
                console.log('לא ניתן לקבל את פרופיל המשתמש:', profileError);
            }
            
            return { success: true, user: user };
        } catch (error) {
            console.error('שגיאה בקבלת המשתמש הנוכחי:', error.message || error);
            return { success: false, user: null, error: error.message };
        }
    }
};

// Function to get all online users (for admin dashboard)
window.getOnlineUsers = async function() {
    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_online', true)
            .order('last_seen', { ascending: false });
        
        if (error) throw error;
        
        return { users };
    } catch (error) {
        console.error('Error getting online users:', error.message);
        return { users: [], error: error.message };
    }
};

// Function to check if user is admin
window.isUserAdmin = async function(userId) {
    if (!userId) return false;
    
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        return profile && profile.role === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error.message);
        return false;
    }
};

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.id);
        
        // Try to update online status
        updateUserOnlineStatus(session.user.id, true);
        
        // Dispatch auth event for other scripts to handle
        window.dispatchEvent(new CustomEvent('supabase:auth:signedIn', { 
            detail: { user: session.user } 
        }));
    } 
    else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        
        // Dispatch auth event for other scripts to handle
        window.dispatchEvent(new CustomEvent('supabase:auth:signedOut'));
    }
});

// Helper function to update user online status
async function updateUserOnlineStatus(userId, isOnline) {
    if (!userId) return;
    
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ 
                is_online: isOnline,
                last_seen: new Date().toISOString() 
            })
            .eq('id', userId);
        
        if (error) {
            console.warn('Failed to update online status:', error);
        }
    } catch (error) {
        console.warn('Error updating online status:', error);
    }
}

// Initialize auth state
window.addEventListener('DOMContentLoaded', async () => {
    const { user } = await window.supabaseAuth.getCurrentUser();
    if (user) {
        window.dispatchEvent(new CustomEvent('supabase:auth:signedIn', { 
            detail: { user } 
        }));
        
        // Start activity tracking for the user
        startUserActivityTracking(user.id);
    }
});

// User activity tracking
let activityInterval = null;
let inactivityTimeout = null;
const ACTIVITY_INTERVAL = 30000; // 30 seconds
const INACTIVITY_TIMEOUT = 5 * 60000; // 5 minutes
let lastActivity = Date.now();

// Function to start tracking user activity
function startUserActivityTracking(userId) {
    if (!userId) return;
    
    console.log('Starting user activity tracking');
    
    // Update initially
    updateUserOnlineStatus(userId, true);
    
    // Listen for user activity events
    document.addEventListener('mousemove', recordUserActivity);
    document.addEventListener('keydown', recordUserActivity);
    document.addEventListener('click', recordUserActivity);
    document.addEventListener('scroll', recordUserActivity);
    document.addEventListener('touchstart', recordUserActivity);
    
    // Set up heartbeat to update user status
    activityInterval = setInterval(() => {
        const now = Date.now();
        // If user was active in the last 5 minutes
        if (now - lastActivity < INACTIVITY_TIMEOUT) {
            updateUserOnlineStatus(userId, true);
        } else {
            updateUserOnlineStatus(userId, false);
        }
    }, ACTIVITY_INTERVAL);
    
    // Cleanup when user leaves the page
    window.addEventListener('beforeunload', () => {
        updateUserOnlineStatus(userId, false);
        clearInterval(activityInterval);
    });
}

// Record user activity
function recordUserActivity() {
    lastActivity = Date.now();
    clearTimeout(inactivityTimeout);
    
    // Reset inactivity timer
    inactivityTimeout = setTimeout(() => {
        // If the user has the current user ID, set them as inactive
        const { user } = window.supabaseAuth.getCurrentUser();
        if (user) {
            updateUserOnlineStatus(user.id, false);
        }
    }, INACTIVITY_TIMEOUT);
}