import db from './database.js';

async function setupTestData() {
    console.log('Setting up isolation test data...');

    // 1. Create/Update a Director for Akouda
    // User ID 4 is already there, let's update ID 4 to be Akouda
    const updateDirector = 'UPDATE users SET village = "Akouda" WHERE id_user = 4';

    // 2. Create a report in Akouda (Visible to ID 4)
    const reportAkouda = `INSERT INTO signalisation (type, description, village, status) VALUES ("Test Akouda", "Détail Akouda", "Akouda", "en attente")`;

    // 3. Create a report in Siliana (Hidden from ID 4)
    const reportSiliana = `INSERT INTO signalisation (type, description, village, status) VALUES ("Test Siliana", "Détail Siliana", "Siliana", "en attente")`;

    db.serialize(() => {
        db.run(updateDirector);
        db.run(reportAkouda, function (err) {
            if (err) console.error(err);
            const akoudaId = this.lastID;
            console.log(`Akouda Report created with ID: ${akoudaId}`);

            db.run(reportSiliana, function (err) {
                if (err) console.error(err);
                const silianaId = this.lastID;
                console.log(`Siliana Report created with ID: ${silianaId}`);

                console.log('Test data setup complete.');
                process.exit(0);
            });
        });
    });
}

setupTestData();
