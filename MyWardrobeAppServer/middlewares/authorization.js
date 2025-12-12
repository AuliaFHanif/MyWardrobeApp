module.exports = function verifyRole(req, res, next) {
    try {


        if (req.user.role === "Admin") {
            next()

        } else if (req.user.role === "familyMember") {
            req.access = req.user.id
            next()
        } else {

            throw { name: "notAdmin", message: "Forbidden Error" };

        }
    } catch (error) {

        next(error)

    }

}