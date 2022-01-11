import * as mongoDB from 'mongodb'

let db: mongoDB.Db | null
let btcHistory: mongoDB.Collection | null = null

export async function connectToDatabase(connectionString: string) {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(connectionString);
            
    await client.connect();
    
    db = client.db('MarketHistory');
   
    btcHistory = db.collection('BitcoinHistory');
 
    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${btcHistory.collectionName}`);
    // console.log(btcHistory.find())
}

export async function saveCurrentPrice(price: number) {
    if (!db || !btcHistory) return

}