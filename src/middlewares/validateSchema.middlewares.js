export function validateSchema(schema) {
    return (request, response, next) => {
        const validation = schema.validate(request.body, { abortEarly: false } )

        if (validation.error) {
            const errors = validation.error.details.map(detail => detail.message)
            return response.status(422).send(errors)
        }

        next()
    }
}