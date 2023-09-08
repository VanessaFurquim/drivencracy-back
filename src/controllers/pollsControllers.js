import { ObjectId } from "mongodb"
import { db, mongoClient, mongoDBConnection } from "../database/databaseConfig.js"
import dayjs from "dayjs"

export async function createPoll (request, response) {
    const { title, expireAt } = request.body
    let standardExpirationPeriod
    standardExpirationPeriod = dayjs().add(30, "day").format("YYYY-MM-DD HH:mm")
    let insertedPoll
    let pollId

    try {
        // mongoDBConnection()

        if (!expireAt) {
            insertedPoll = await db.collection("polls").insertOne( { title, expireAt: standardExpirationPeriod } )
            pollId = insertedPoll.insertedId
            return response.status(201).send( { title, expireAt: standardExpirationPeriod, _id: pollId } )
        }
        
        const newPoll = { title, expireAt }
        await db.collection("polls").insertOne( newPoll )

        // mongoClient.close()

        response.status(201).send( newPoll )

    } catch (error) { response.status(500).send(error.message) }
}

export async function getPolls (request, response) {
    try {
        const listOfPolls = await db.collection("polls").find().toArray()

        response.status(200).send(listOfPolls)

    } catch (error) { response.status(500).send(error.message) }
}

export async function createChoice (request, response) {
    const { title, pollId } = request.body
     
    try {
        const pollObjectId = new ObjectId(pollId)
        const poll = await db.collection("polls").findOne( { _id: pollObjectId } )

        if (!poll) return response.sendStatus(404)
        
        const isPollExpired = dayjs().isAfter( dayjs( poll.expireAt ) )
        if(isPollExpired === true) return response.status(403).send("This poll is expired.")

        const isTitleRepeated = await db.collection("choices").findOne( { pollObjectId, title } )
        if (isTitleRepeated) return response.status(409).send("This choice already exists.")

        const newChoice = { title, pollId: pollObjectId }
        await db.collection("choices").insertOne( newChoice )

        response.status(201).send( newChoice )

    } catch (error) { response.status(500).send(error.message) }
}

export async function getChoicesById (request, response) {
    const { id } = request.params

    try {
        const isPollExistent = await db.collection("polls").findOne( { _id: new ObjectId(id) } )
        if (!isPollExistent) return response.status(404).send("Poll does not exist.")

        const choicesForSelectedPoll = await db.collection("choices").find( { pollId: new ObjectId(id) } ).toArray()

        response.send(choicesForSelectedPoll)

    } catch (error) { response.status(500).send(error.message) }
}

export async function registerVote (request, response) {
    const { id } = request.params
    let isChoiceExistent

    try {
        const choiceObjectId = new ObjectId(id)
        isChoiceExistent = await db.collection("choices").findOne( { _id: choiceObjectId } )
        if (!isChoiceExistent) return response.status(404).send("Choice does not exist.")

        const selectedChoice = isChoiceExistent
        const pollId = selectedChoice.pollId

        const poll = await db.collection("polls").findOne( { _id: new ObjectId(pollId) } )

        const isPollExpired = dayjs().isAfter( dayjs( poll.expireAt ) )
        if(isPollExpired === true) return response.status(403).send("This poll is expired.")

        const registeredVote = {
            createdAt: dayjs().format("YYYY-MM-DD HH:mm"),
            choiceId: choiceObjectId
        }
        await db.collection("votes").insertOne( registeredVote )

        response.status(201).send( registeredVote )

    } catch (error) { response.status(500).send(error.message) }
}

export async function showPollResult (request, response) {
    const { id } = request.params
    let isPollExistent
    let choicesVotesArray = []
    let voteCount
    let choiceTitle

    try {
        // mongoDBConnection()

        isPollExistent = await db.collection("polls").findOne( { _id: new ObjectId(id) } )
        if (!isPollExistent) return response.status(404).send("Poll does not exist.")
        
        const poll = isPollExistent
        
        const isPollExpired = dayjs().isAfter( dayjs( poll.expireAt ) )
        if(isPollExpired === true) return response.status(403).send("This poll is expired.")

        const choicesOfSelectedPoll = await db.collection("choices").find( { pollId: new ObjectId(id) } ).toArray()

        for (let i = 0; i < choicesOfSelectedPoll.length; i++) {
          
          choiceTitle = choicesOfSelectedPoll[i].title;
          voteCount = await db.collection("votes").find( { choiceId: choicesOfSelectedPoll[i]._id } ).toArray()

          choicesVotesArray.push({
              choiceTitle: choiceTitle,
              voteCount: voteCount.length
            })
        }

        choicesVotesArray.sort((choiceOne, choiceTwo) => {return choiceTwo.voteCount - choiceOne.voteCount})

        const resultObject = {
            _id: poll._id,
            title: poll.title,
            expireAt: poll.expireAt,
            result: {
                title: choicesVotesArray[0].choiceTitle,
                votes: choicesVotesArray[0].voteCount
            }
        }
        
        // const aggregationResult = await db.collection("votes").aggregate([
        //     {
        //       $group: {
        //         _id: "$choiceId",
        //         count: { $sum: 1 }
        //       }
        //     },
        //     {
        //       $sort: { count: -1 }
        //     },
        //     {
        //       $limit: 1
        //     },
        //     {
        //       $lookup: {
        //         from: "choices",
        //         localField: "_id", // id do vote
        //         foreignField: "_id", // id da choice
        //         as: "choiceDetails"
        //       }
        //     },
        //     {
        //       $unwind: "$choiceDetails"
        //     },
        //     {
        //       $match: {
        //         "choiceDetails.pollId": new ObjectId(id)
        //       }
        //     },
        //     {
        //       $project: {
        //         _id: 0,
        //         pollId: "$choiceDetails.pollId",
        //         choiceId: "$choiceDetails._id",
        //         choiceTitle: "$choiceDetails.title",
        //         voteCount: "$count"
        //       }
        //     }
        //   ]).toArray()

        // const resultObject = {
        //     _id: poll._id,
        //     title: poll.title,
        //     expireAt: poll.expireAt,
        //     result: {
        //         title: aggregationResult[0].choiceTitle,
        //         votes: aggregationResult[0].voteCount
        //     }
        // }
        // mongoClient.close()

        response.status(201).send(resultObject)

    } catch (error) { response.status(500).send(error.message) }

}

        // _id (poll)
        // title (poll)
        // expireAt (poll)
        // result (novo)
        // title (choice)
        // votes (votes)