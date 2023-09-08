import { Router } from "express"
import { validateSchema } from "../middlewares/validateSchema.middlewares.js"
import { pollsSchema, choicesSchema } from "../schemas/pollsSchemas.js"
import { createChoice, createPoll, getPolls, getChoicesById, registerVote, showPollResult } from "../controllers/pollsControllers.js"

const pollsRouter = Router()

pollsRouter.post("/poll", validateSchema(pollsSchema), createPoll)
pollsRouter.get("/poll", getPolls)
pollsRouter.post("/choice", validateSchema(choicesSchema), createChoice)
pollsRouter.get("/poll/:id/choice", getChoicesById)
pollsRouter.post("/choice/:id/vote", registerVote)
pollsRouter.get("/poll/:id/result", showPollResult)

export default pollsRouter