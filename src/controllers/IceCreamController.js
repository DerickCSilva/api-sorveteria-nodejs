// Modules
const status = require('http-status-codes');

// Models
const IceCream = require('../models/IceCream');

// Functions
const { existsOrError } = require('../functions/Validation');

// ENUM's
const statusKey = require('../utils/statusCode.enum');

//  class IceCreamController
class IceCreamController {
    // Função que cria um sorvete
    async create(req, res) {
        const { flavor, type, description, quantity, value, url } = req.body;

        try {
            await existsOrError(flavor, 'Sabor do sorvete não informado.');
            await existsOrError(type, 'Tipo de sorvete não informado.');
            await existsOrError(description, 'Descrição do sorvete não informada.');
            await existsOrError(quantity, 'Quantidade do sorvete não informada.');
            await existsOrError(value, 'Valor do sorvete não informado.');
            await existsOrError(url, 'URL da imagem não informada.');

            const iceCream = await IceCream.findOne({ where: { flavor } });

            if (iceCream) {
                return res.status(status.BAD_REQUEST).json({
                    status: res.statusCode,
                    statusKey: statusKey.DATA_EXISTS,
                    message: 'Sorvete já existente na base de dados.'
                });
            }
        } catch (err) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.DATA_NOT_INFORMED,
                message: err
            });
        }

        try {
            await IceCream.create({ ...req.body });

            return res.status(status.CREATED).json({
                status: res.statusCode,
                statusKey: statusKey.RECORD_SUCCESS,
                message: 'Sorvete registrado.'
            });
        } catch (err) {
            return res.json(status.INTERNAL_SERVER_ERROR).json({
                status: res.statusCode,
                statusKey: statusKey.INTERNAL_SERVER_ERROR,
                message: err.message
            });
        }
    }

    async edit(req, res) {
        const { id, flavor, type, description, quantity, value, url } = req.body;

        try {
            await existsOrError(id, 'ID do Sorvete não informado.');
            await existsOrError(flavor, 'Sabor do sorvete não informado.');
            await existsOrError(type, 'Tipo de sorvete não informado.');
            await existsOrError(description, 'Descrição do sorvete não informada.');
            await existsOrError(quantity, 'Quantidade do sorvete não informada.');
            await existsOrError(value, 'Valor do sorvete não informado.');
            await existsOrError(url, 'URL da imagem não informada.');

            const iceCream = await IceCream.findOne({ where: { id } });

            if (!iceCream) {
                return res.status(status.NOT_FOUND).json({
                    status: res.statusCode,
                    statusKey: statusKey.DATA_NOT_FOUND,
                    message: 'Sorvete não encontrado na base de dados.'
                });
            }
        } catch (err) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.DATA_NOT_INFORMED,
                message: err
            });
        }

        try {
            const iceCreamSearch = await IceCream.findOne({ where: { flavor } });

            if (!iceCreamSearch) {
                delete req.body.id;

                await IceCream.update({ ...req.body }, { where: { id } });

                return res.status(status.OK).json({
                    status: res.statusCode,
                    statusKey: statusKey.UPDATE_SUCCESS,
                    message: 'Sorvete atualizado com sucesso.'
                });
            } else {
                return res.status(status.BAD_REQUEST).json({
                    status: res.statusCode,
                    statusKey: statusKey.DATA_EXISTS,
                    message: 'Já existe um sorvete com esse nome.'
                });
            }
        } catch (err) {
            console.log(err)
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                status: res.statusCode,
                statusKey: statusKey.INTERNAL_SERVER_ERROR,
                message: err.message
            });
        }
    }

    async delete(req, res) {
        const { id } = req.params;

        try {
            await existsOrError(id, 'ID do Sorvete não informado.');
        } catch (err) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.DATA_NOT_INFORMED,
                message: err
            });
        }

        try {
            const iceCream = await IceCream.findOne({ where: { id } });

            if (iceCream) {
                await IceCream.destroy({ where: { id } });

                return res.status(status.OK).json({
                    status: res.statusCode,
                    statusKey: statusKey.DATA_DELETED,
                    message: 'Sorvete deletado com sucesso.'
                });
            } else {
                return res.status(status.NOT_FOUND).json({
                    status: res.statusCode,
                    statusKey: statusKey.DATA_NOT_FOUND,
                    message: 'Sorvete inexistente'
                });
            }
        } catch (err) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                status: res.statusCode,
                statusKey: statusKey.INTERNAL_SERVER_ERROR,
                message: err.message
            });
        }
    }

    async getAll(req, res) {
        try {
            const iceCreams = await IceCream.findAll({
                attributes: ['id', 'flavor', 'type', 'description', 'quantity', 'value', 'url']
            });

            let creamies = [];
            let fruits = [];

            iceCreams.map(iceCream => {
                if(iceCream.type === 'creamy') {
                    creamies.push(iceCream);
                } else {
                    fruits.push(iceCream);

                }
            });

            return res.status(status.OK).json({
                status: res.statusCode,
                statusKey: statusKey.RECORD_SUCCESS,
                result: {
                    creamies,
                    fruits
                },
                message: 'Busca realizada com sucesso.'
            });
        } catch (err) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                status: res.statusCode,
                statusKey: statusKey.INTERNAL_SERVER_ERROR,
                message: err.message
            });
        }
    }

    async getById(req, res) {
        const { id } = req.params;

        try {
            await existsOrError(id, 'ID do Sorvete não informado.');
        } catch (err) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.DATA_NOT_INFORMED,
                message: err
            });
        }

        if (!(id >= 1)) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.DATA_INVALID,
                message: 'ID do Sorvete inválido.'
            });
        }

        try {
            const iceCream = IceCream.findOne({
                attributes: ['id', 'flavor', 'type', 'description', 'quantity', 'value', 'url'],
                where: { id }
            });

            if (iceCream) {
                return res.status(status.OK).json({
                    status: res.statusCode,
                    statusKey: statusKey.REQUEST_SUCCESS,
                    iceCream,
                    message: 'Busca realizada com sucesso.'
                });
            } else {
                return res.status(status.NOT_FOUND).json({
                    status: res.statusCode,
                    statusKey: statusKey.DATA_NOT_FOUND,
                    message: 'Sorvete inexistente.'
                });
            }
        } catch (err) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                status: res.statusCode,
                statusKey: statusKey.INTERNAL_SERVER_ERROR,
                message: err.message
            });
        }
    }
}

module.exports = new IceCreamController();