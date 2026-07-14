const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

async function flushFirebaseAuthUsers(nextPageToken) {
  const result = await admin.auth().listUsers(1000, nextPageToken);
  console.log("RESULT :",result);

  const uids = result.users.map(user => user.uid);

  if (uids.length > 0) {
    await admin.auth().deleteUsers(uids);
    console.log(`Deleted ${uids.length} users`);
  }

  if (result.pageToken) {
    await flushFirebaseAuthUsers(result.pageToken);
  }
}

flushFirebaseAuthUsers()
  .then(() => {
    console.log("🔥 ALL Firebase Authentication users deleted");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
