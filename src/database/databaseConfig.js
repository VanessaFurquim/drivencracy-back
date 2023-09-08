import { MongoClient } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

export const mongoClient = new MongoClient(process.env.DATABASE_URL)

export async function mongoDBConnection() {

    try {
        await mongoClient.connect()
        console.log("MongoDB connected!")
        
    } catch (error) { console.log(error.message) }
}

mongoDBConnection()

export const db = mongoClient.db()