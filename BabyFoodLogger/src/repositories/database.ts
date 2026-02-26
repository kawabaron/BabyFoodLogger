import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('babyfoodlogger.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS food_masters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      kana TEXT,
      category TEXT NOT NULL,
      iconKey TEXT NOT NULL,
      isDefault INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS baby_food_type_masters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      iconKey TEXT NOT NULL,
      sortOrder INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meal_records (
      id TEXT PRIMARY KEY,
      childId TEXT NOT NULL,
      date TEXT NOT NULL,
      mealTiming TEXT,
      time TEXT,
      babyFoodTypeId TEXT,
      note TEXT,
      allergyReactionMemo TEXT,
      appetiteLevel TEXT,
      photoIds TEXT NOT NULL DEFAULT '[]',
      createdBy TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      deletedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS meal_record_foods (
      id TEXT PRIMARY KEY,
      mealRecordId TEXT NOT NULL,
      foodId TEXT NOT NULL,
      amountLevel TEXT,
      isFirstTime INTEGER DEFAULT 0,
      preferenceAtMeal TEXT,
      note TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (mealRecordId) REFERENCES meal_records(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS photo_assets (
      id TEXT PRIMARY KEY,
      localUri TEXT NOT NULL,
      thumbnailUri TEXT,
      width INTEGER,
      height INTEGER,
      fileSize INTEGER,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS food_preference_profiles (
      id TEXT PRIMARY KEY,
      childId TEXT NOT NULL,
      foodId TEXT NOT NULL,
      latestPreference TEXT NOT NULL,
      latestMemo TEXT,
      isAllergyFlag INTEGER NOT NULL DEFAULT 0,
      firstTriedDate TEXT,
      lastTriedDate TEXT,
      totalTriedCount INTEGER NOT NULL DEFAULT 0,
      updatedAt TEXT NOT NULL,
      UNIQUE(childId, foodId)
    );

    CREATE INDEX IF NOT EXISTS idx_meal_records_date ON meal_records(date);
    CREATE INDEX IF NOT EXISTS idx_meal_records_childId ON meal_records(childId);
    CREATE INDEX IF NOT EXISTS idx_meal_record_foods_mealRecordId ON meal_record_foods(mealRecordId);
    CREATE INDEX IF NOT EXISTS idx_meal_record_foods_foodId ON meal_record_foods(foodId);
    CREATE INDEX IF NOT EXISTS idx_food_preference_profiles_childId ON food_preference_profiles(childId);
  `);

  // 既存テーブルのスキーマ移行（NOT NULL → nullable）
  // SQLiteはALTER COLUMN未対応なので、テーブル再作成で対応
  try {
    // meal_recordsテーブルが古いスキーマ（NOT NULL制約あり）かチェック
    const tableInfo = await database.getAllAsync<{ name: string; notnull: number }>(
      "PRAGMA table_info(meal_records)"
    );
    const mealTimingCol = tableInfo.find(c => c.name === 'mealTiming');
    const babyFoodTypeCol = tableInfo.find(c => c.name === 'babyFoodTypeId');

    if ((mealTimingCol && mealTimingCol.notnull === 1) || (babyFoodTypeCol && babyFoodTypeCol.notnull === 1)) {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS meal_records_new (
          id TEXT PRIMARY KEY,
          childId TEXT NOT NULL,
          date TEXT NOT NULL,
          mealTiming TEXT,
          time TEXT,
          babyFoodTypeId TEXT,
          note TEXT,
          allergyReactionMemo TEXT,
          appetiteLevel TEXT,
          photoIds TEXT NOT NULL DEFAULT '[]',
          createdBy TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          deletedAt TEXT
        );
        INSERT INTO meal_records_new SELECT * FROM meal_records;
        DROP TABLE meal_records;
        ALTER TABLE meal_records_new RENAME TO meal_records;
        CREATE INDEX IF NOT EXISTS idx_meal_records_date ON meal_records(date);
        CREATE INDEX IF NOT EXISTS idx_meal_records_childId ON meal_records(childId);
      `);
    }
  } catch (e) {
    // テーブルが空 or 未作成の場合は無視
    console.log('Migration check:', e);
  }
}
