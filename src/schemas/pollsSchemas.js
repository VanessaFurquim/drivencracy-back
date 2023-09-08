import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const joi = BaseJoi.extend(JoiDate);

export const pollsSchema = joi.object( {
    title: joi.string().required(),
    // expireAt: joi.string().pattern(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-2]{1}[0-9]{1}:[0-9]{1}[0-9]{1}/) // regex
    expireAt: joi.date().format('YYYY-MM-DD HH:mm')
} )

export const choicesSchema = joi.object( {
    title: joi.string().required(),
    pollId: joi.string() // tirei o required() para cair no erro 404, ao invés do 422. Há solução melhor ?
} )