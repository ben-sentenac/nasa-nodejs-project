const launchesDatabase = require('./launches.mongodb');
const planets = require('./planets.mongodb');
/*
const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,//exists in flight_number in spaceX api
    mission: 'Kepler_exploration_x',//= name
    rocket: 'Explorer IS1', //exist as rocket.name in spacex api
    launchDate: new Date('December 27, 2030'),//date_local
    target: 'Kepler-442 b',
    customers: ['NASA', 'BEN09PROD'],//payloads.customers for each payload
    upcoming: true,//upcoming
    success: true//success
};

//launches.set(launch.flightNumber,launch);
//launches.get(100)//   launch;

saveLaunch(launch);
*/
async function getAllLaunches({limit,skip}) {
    //return Array.from(launches.values());
    return await launchesDatabase.find({}, {
        '_id': 0, '__v': 0
    })
    .sort({flightNumber:1})
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, { upsert: true });
}
/*
function addNewLaunch(launch) {
    latestFlightNumber++;
    launches.set(latestFlightNumber, Object.assign(launch, {
        upcoming: true,
        success: true,
        customers: ['NASA', 'BEN09PROD'],
        flightNumber: latestFlightNumber
    }));
}
*/
async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({ kepler_name: launch.target });
    if (!planet) {
        throw new Error('No matching planet found in database!');
    }
    const newFlightNumber = await getLastestFlightNumber() + 1;
    console.log(newFlightNumber);
    const newLaunch = Object.assign(launch, {
        upcoming: true,
        success: true,
        customers: ['NASA', 'BEN09PROD'],
        flightNumber: newFlightNumber
    });

    console.log(newLaunch);
    await saveLaunch(newLaunch);

}
async function getLastestFlightNumber() {
    //sort by property in descendig order (add -)
    const latestLaunch = await launchesDatabase.find({}).sort('-flightNumber')[0];
    if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER;
    return latestLaunch.flightNumber;
}
async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter);
}
async function existsLaunch(launchId) {
    //return launches.has(launchId);
    return await findLaunch({ flightNumber: launchId });
}

async function abortLaunchById(launchId) {
    //const aborted = launches.get(launchId);
    const aborted = await launchesDatabase.updateOne({ flightNumber: launchId }, {
        upcoming: false,
        success: false
    });
    console.log(aborted);
    return aborted.acknowledged && aborted.matchedCount === 1;
}


async function populateLaunches(apiUrl) {
    console.log(`Downloading launch data from ${apiUrl} please wait...`);
    const query = {
        query:{},
       options:{
            pagination:false,//cancel pagination in response we want all data
            populate:[
                {
                   path:'rocket',
                   select:{
                        name:1
                   }
                },
                {
                    path:'payloads',
                    select:{
                        'customers':1
                    }
                }
            ]
       }
    };
    const requestOptions = {
        method:'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
       body:JSON.stringify(query)
    };
    const response = await fetch(apiUrl,requestOptions);
    if(!response.ok) {
        console.log('Problem downloading launches....');
        throw new Error('Populating launch failed!!');
    }
    const data =  await response.json();
    const launchDocs = data.docs;
   for(const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap(payload => payload['customers']);
        //mapping data 
        const launch = {
            flightNumber:launchDoc['flight_number'],
            mission:launchDoc['name'],
            rocket:launchDoc['rocket']['name'],
            launchDate:launchDoc['date_local'],
            customers,
            upcoming:launchDoc['upcoming'],
            success:launchDoc['success']
        }
        console.log(`${launch.flightNumber} ${launch.mission}`);
        // save and populate launches collection in database
       await saveLaunch(launch);
   } 
}


async function loadLaunchDataFromSpaceXApi(apiUrl) {
    const firstLaunch = await findLaunch({
        flightNumber:1,
        rocket:'Falcon 1',
        mission:'FalconSat'
    });
    if(firstLaunch) {
        console.log('Data are already loaded in database!');
    } else {
        await populateLaunches(apiUrl);
    }
   
    
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunch,
    abortLaunchById,
    loadLaunchDataFromSpaceXApi,
    //launches,
};