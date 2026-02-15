async function test() {
    console.log('--- Testing Status Update and Global View ---');

    // 1. Update status as psychologue
    const updateRes = await fetch('http://localhost:5000/api/signalisations/12/status', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'psychologues',
            'x-user-id': '7'
        },
        body: JSON.stringify({ status: 'en cours de traitement' })
    });

    const updateJson = await updateRes.json();
    console.log('Update Result:', updateJson);

    // 2. Fetch Global View as Directeur
    const globalRes = await fetch('http://localhost:5000/api/global/signalisations', {
        headers: {
            'x-user-role': 'directeur',
            'x-user-id': '4'
        }
    });

    const reports = await globalRes.json();
    const report12 = reports.find(r => r.id === 12);

    if (report12) {
        console.log('Report 12 Details:');
        console.log('- Status:', report12.status);
        console.log('- Psychologue ID:', report12.psychologue_id);
        console.log('- Psychologue Name:', report12.psychologue_nom);

        if (report12.psychologue_id == 7) {
            console.log('✅ SUCCESS: Psychologue correctly assigned.');
        } else {
            console.log('❌ FAILURE: Psychologue assignment failed.');
        }
    } else {
        console.log('❌ FAILURE: Report 12 not found in global view.');
    }
}

test();
