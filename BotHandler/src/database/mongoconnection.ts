import * as mongoDB from 'mongodb'


export async function connectToDatabase(connectionString: string) {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(connectionString);
            
    await client.connect();
    
    const db: mongoDB.Db = client.db('MarketHistory');
   
    const btcHistory: mongoDB.Collection = db.collection('BitcoinHistory');
 
    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${btcHistory.collectionName}`);
    // console.log(btcHistory)
}