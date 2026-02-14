import db from './db.js';

/**
 * Registers a new user with automated permission calculation based on their role.
 * 
 * @param {Object} userData - Data for the user to be registered.
 * @param {string} userData.full_name - User's full name.
 * @param {string} userData.role - User's role.
 * @param {string} userData.mail - User's email (unique).
 * @param {string} userData.password - User's password.
 * @param {string} userData.ville - User's city.
 */
export const registerUser = (userData) => {
    const { full_name, role, mail, password, ville } = userData;

    // Initialize permissions
    let signalisation_psy = 0;
    let signalisation_other = 0;
    let see_all = 0;

    // Automated permission calculation based on role
    if (role === 'psychologues' || role === 'responsable sociale') {
        signalisation_psy = 1;
        signalisation_other = 0;
    } else if (['mere', 'tante', 'educatrice'].includes(role)) {
        signalisation_psy = 0;
        signalisation_other = 1;
    } else if (['directeur', 'bureau national'].includes(role)) {
        see_all = 1;
        // According to requirements, psy and other remain false for these roles
        signalisation_psy = 0;
        signalisation_other = 0;
    }

    return new Promise((resolve, reject) => {
        const sql = `
      INSERT INTO users (
        full_name, role, mail, password, ville, 
        signalisation_psy, signalisation_other, see_all
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [
            full_name, role, mail, password, ville,
            signalisation_psy, signalisation_other, see_all
        ];

        db.run(sql, params, function (err) {
            if (err) {
                console.error('Error registering user:', err.message);
                reject(err);
            } else {
                console.log(`User registered successfully with ID: ${this.lastID}`);
                resolve({ id: this.lastID, ...userData, signalisation_psy, signalisation_other, see_all });
            }
        });
    });
};
