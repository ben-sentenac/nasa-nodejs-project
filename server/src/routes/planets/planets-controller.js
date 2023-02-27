const { getAllPlanet} = require('../../models/planets.model');

async function httpGetAllPlanets(req,res) {
    return res.status(200).json(await getAllPlanet());
}



module.exports = {
    httpGetAllPlanets,
};