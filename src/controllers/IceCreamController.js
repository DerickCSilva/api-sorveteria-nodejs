// Modules
const status = require('http-status-codes');

// Models
const IceCream = require('../models/IceCream');
const Budget = require('../models/Budget');

// Functions
const { existsOrError } = require('../functions/Validation');

// ENUM's
const statusKey = require('../utils/statusCode.enum');

//  class IceCreamController
class IceCreamController {
    async getAll(req, res) {
        try {
            const iceCreams = await IceCream.findAll({
                attributes: ['id', 'flavor', 'type', 'description', 'quantity', 'value', 'url']
            });

            let creamies = [];
            let fruits = [];

            iceCreams.map(iceCream => {
                if (iceCream.type === 'creamy') {
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
            const iceCreamSearch = IceCream.findOne({
                attributes: ['id', 'flavor', 'type', 'description', 'quantity', 'value', 'url'],
                where: { id }
            });

            if (iceCreamSearch) {
                return res.status(status.OK).json({
                    status: res.statusCode,
                    statusKey: statusKey.REQUEST_SUCCESS,
                    iceCreamSearch,
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

    async getMetrics(req, res) {
        try {
            const priceCostPopsicle = 0.75;
            const priceSellPopsicle = 1.5;
            let budgets = await Budget.findAll({
                attributes: ['id', 'type', 'quantity']
            });

            let totalInvested = [0];
            let totalSold = [0];
            let totalPromo = [0];

            budgets.map(budget => {
                let quantity = parseInt(budget.quantity);

                if (budget.type === 'buy') {
                    totalInvested.push(quantity);
                } else if (budget.type === 'sell') {
                    totalSold.push(quantity);
                } else {
                    totalPromo.push(quantity);
                }
            });

            
            let quantityPromo = totalPromo.reduce((total, num) => total + num);

            let quantityBought = totalInvested.reduce((total, num) => total + num);
            totalInvested = (quantityBought - quantityPromo) * priceCostPopsicle;

            let quantitySold = totalSold.reduce((total, num) => total + num);
            totalSold = (quantitySold - quantityPromo) * priceSellPopsicle;

            let totalProfit = totalSold - totalInvested;

            return res.status(status.OK).json({
                status: res.statusCode,
                statueKey: statusKey.REQUEST_SUCCESS,
                quantityPromo,
                quantityBought,
                quantitySold,
                priceCostPopsicle,
                priceSellPopsicle,
                metrics: [totalInvested, totalSold, totalProfit],
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

            const iceCreamSearch = await IceCream.findOne({ where: { flavor } });

            if (iceCreamSearch) {
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
            req.body.quantity = 0;
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

    async buy(req, res) {
        let { id, quantity } = req.body;

        try {
            await existsOrError(id, 'Sabor do Sorvete não informado.');
            await existsOrError(quantity, 'Quantidade de Sorvete não informado.');
        } catch (err) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.DATA_NOT_INFORMED,
                message: err
            });
        }
        
        if (quantity <= 0 || isNaN(quantity)) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.BAD_REQUEST,
                message: 'Quantidade inválida.'
            });
        }

        if (!(id >= 1)) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.DATA_INVALID,
                message: 'ID do Sorvete inválido.'
            });
        }

        quantity = parseInt(quantity);

        try {
            const iceCreamSearch = await IceCream.findOne({ where: { id } });

            if (iceCreamSearch) {
                await IceCream.update({
                    quantity: parseInt(iceCreamSearch.quantity) + quantity
                }, { where: { id } });

                await Budget.create({ type: 'buy', quantity });

                return res.status(status.OK).json({
                    status: res.statusCode,
                    statusKey: statusKey.RECORD_SUCCESS,
                    message: 'Compra realizada com sucesso.'
                });
            } else {
                return res.status(status.BAD_REQUEST).json({
                    status: res.statusCode,
                    statusKey: statusKey.DATA_EXISTS,
                    message: 'Sorvete inexistente.'
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                status: res.statusCode,
                statusKey: statusKey.INTERNAL_SERVER_ERROR,
                message: err.message
            });

        }
    }

    async sell(req, res) {
        let { id, quantity } = req.body;

        try {
            await existsOrError(id, 'Sabor do Sorvete não informado.');
            await existsOrError(quantity, 'Quantidade de Sorvete não informado.');
        } catch (err) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.DATA_NOT_INFORMED,
                message: err
            });
        }

        if (quantity <= 0 || isNaN(quantity)) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.BAD_REQUEST,
                message: 'Quantidade inválida.'
            });
        }

        quantity = parseInt(quantity);

        try {
            const iceCreamSearch = await IceCream.findOne({ where: { id } });

            if (iceCreamSearch) {
                if ((iceCreamSearch.quantity - quantity) < 0) {
                    return res.status(status.BAD_REQUEST).json({
                        status: res.statusCode,
                        statusKey: statusKey.BAD_REQUEST,
                        message: 'Quantidade à vender não compatível com estoque atual.'
                    });
                }

                await IceCream.update({
                    quantity: parseInt(iceCreamSearch.quantity) - quantity
                }, { where: { id } });

                await Budget.create({ type: 'sell', quantity });

                return res.status(status.OK).json({
                    status: res.statusCode,
                    statusKey: statusKey.RECORD_SUCCESS,
                    message: 'Venda realizada com sucesso.'
                });
            } else {
                return res.status(status.BAD_REQUEST).json({
                    status: res.statusCode,
                    statusKey: statusKey.DATA_EXISTS,
                    message: 'Sorvete inexistente.'
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(status.INTERNAL_SERVER_ERROR).json({
                status: res.statusCode,
                statusKey: statusKey.INTERNAL_SERVER_ERROR,
                message: err.message
            });
        }
    }

    async subtract(req, res) {
        let { id, quantity } = req.body;

        try {
            await existsOrError(id, 'Sabor do Sorvete não informado.');
            await existsOrError(quantity, 'Quantidade de Sorvete não informado.');
        } catch (err) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.DATA_NOT_INFORMED,
                message: err
            });
        }

        if (quantity <= 0 || isNaN(quantity)) {
            return res.status(status.BAD_REQUEST).json({
                status: res.statusCode,
                statusKey: statusKey.BAD_REQUEST,
                message: 'Quantidade inválida.'
            });
        }
        
        quantity = parseInt(quantity);

        try {
            const iceCreamSearch = await IceCream.findOne({ where: { id } });

            if (iceCreamSearch) {
                if ((iceCreamSearch.quantity - quantity) < 0) {
                    return res.status(status.BAD_REQUEST).json({
                        status: res.statusCode,
                        statusKey: statusKey.BAD_REQUEST,
                        message: 'Quantidade à subtrair não compatível com estoque atual.'
                    });
                }

                await IceCream.update({
                    quantity: parseInt(iceCreamSearch.quantity) - quantity
                }, { where: { id } });

                await Budget.create({ type: 'sub', quantity });

                return res.status(status.OK).json({
                    status: res.statusCode,
                    statusKey: statusKey.RECORD_SUCCESS,
                    message: 'Subtração realizada com sucesso.'
                });
            } else {
                return res.status(status.BAD_REQUEST).json({
                    status: res.statusCode,
                    statusKey: statusKey.DATA_EXISTS,
                    message: 'Sorvete inexistente.'
                });
            }
        } catch (err) {
            console.log(err);
            return res.status(status.INTERNAL_SERVER_ERROR).json({
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

            const iceCreamSearch = await IceCream.findOne({ where: { id } });

            if (!iceCreamSearch) {
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
            console.log(err);
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
            const iceCreamSearch = await IceCream.findOne({ where: { id } });

            if (iceCreamSearch) {
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
}

module.exports = new IceCreamController();