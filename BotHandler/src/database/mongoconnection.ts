import * as mongoDB from 'mongodb'

let db: mongoDB.Db | null
let btcHistory: mongoDB.Collection | null = null

export async function connectToDatabase(connectionString: string) {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(connectionString);
            
    await client.connect()
    
    db = client.db('MarketHistory')
   
    btcHistory = db.collection('BitcoinHistory')
 
    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${btcHistory.collectionName}`)

    // btcHistory.find().toArray().then(res => {
    //     console.log(res.filter((v, i) => i < 5))
    // })
}

export async function saveCurrentPrice(price: number) {
    if (!db || !btcHistory) return

    console.log(`saving current price of: ${price}$ to the database`)
    btcHistory.insertOne({
        price: price,
        timeStamp: + new Date()
    })
}