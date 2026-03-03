// Debug helper - paste this in browser console to check user data structure
// Usage: Open browser console (F12) and paste this code

const userData = localStorage.getItem('TUTORA_user_data');
if (userData) {
    const user = JSON.parse(userData);
    console.log('=== USER DATA STRUCTURE ===');
    console.log('Full user object:', user);
    console.log('\nAvailable fields:');
    Object.keys(user).forEach(key => {
        console.log(`  - ${key}: ${typeof user[key]} = ${user[key]}`);
    });
    console.log('\nPossible User ID fields:');
    console.log('  user.id:', user.id);
    console.log('  user.userId:', user.userId);
    console.log('  user.ID:', user.ID);
    console.log('  user.UserId:', user.UserId);
} else {
    console.error('No user data found in localStorage!');
    console.log('Please login first.');
}
