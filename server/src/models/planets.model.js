const fs = require('node:fs');
const path = require('node:path');

const { parse } = require('csv-parse');

const planets = require('./planets.mongodb');

const fileToParse = path.join(__dirname, '..', 'data', 'kepler_data.csv');

//const habitablePlanets = [];
//filter planet that are potentially habitable

const isHabitablePlanet = (planet) => planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36
    && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;


function loadingPlanetsData() {
    return new Promise((resolve, reject) => {
        //readablestream.pipe(writablestream)
        fs.createReadStream(fileToParse)
            .pipe(parse({
                comment: '#',
                columns: true
            }))
            .on('open', () => console.log(`Opening ${fileToParse}`))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    //habitablePlanets.push(data);
                    //TO DO :replace below create with insert + update = upsert
                    // in order to avoid repeating saving data mutiple time if we restart 
                    //server or create many cluster
                    //
                    savePlanet(data);
                }
            })
            .on('error', (err) => reject(err))
            .on('end', async () => {
                /*
                const planets = habitablePlanets.map(planet => planet['kepler_name']);
                console.log(planets);
                */
                //console.log(`Found ${habitablePlanets.length} potentials habitable planet!`);
                const planetFounds = (await getAllPlanet()).length;
                console.log(`Found ${ planetFounds  } potential habitable planet`)
                resolve();
            });
    });

}

async function  getAllPlanet() {
    //return habitablePlanets;
    return await planets.find({},{
        '__v':0,'_id':0
    });
}

async function savePlanet(planet) {
    try {
        await planets.updateOne(
        {kepler_name:planet.kepler_name},
        {kepler_name:planet.kepler_name},
        {upsert:true}
    );
    } catch (error) {
        console.error(`Can't save the planet ${ error }`);
    }
    
}

module.exports = {
    loadingPlanetsData,
    getAllPlanet,
};