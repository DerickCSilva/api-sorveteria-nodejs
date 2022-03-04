class Validation {
    async existsOrError(value, msg) {
        if(!value) throw msg;
    }
}

module.exports = new Validation();