const { openDb } = require('../db');

async function migrate() {
  const db = await openDb();

  // 1. Création de base (Team 1)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Users table base check');

  // 2. Ajout des colonnes pour le Profil (Team 6)
  // On utilise une structure try/catch pour chaque colonne car SQLite ne supporte pas ADD COLUMN IF NOT EXISTS
  const columns = [
    "ALTER TABLE users ADD COLUMN bio TEXT",
    "ALTER TABLE users ADD COLUMN avatar_url TEXT",
    "ALTER TABLE users ADD COLUMN display_name TEXT",
    "ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'dark'",
    "ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC'" // AJOUTE CETTE LIGNE
];

  for (const sql of columns) {
    try {
      await db.exec(sql);
    } catch (e) {
      // Ignore l'erreur si la colonne existe déjà
    }
  }
  console.log('✅ User profile columns updated');

  // 3. Table Chat (Team 3)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ Chat_messages table check');

  await db.close();
  console.log("🚀 Migration terminée avec succès");
}

migrate().catch(err => {
  console.error('❌ Erreur de migration:', err);
});


