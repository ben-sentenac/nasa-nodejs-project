const { getAllLaunches, scheduleNewLaunch, existsLaunch, abortLaunchById } = require('../../models/launches.model');
const { paginate } = require('../../utils/functions.util');

async function httpGetAllLaunches(req, res) {
    const { query } = req;
    const {skip,limit} = paginate(query);
    const launches = await getAllLaunches({limit,skip});
    return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;
    if (!launch.mission || !launch.rocket || !launch.target || !launch.launchDate) {
        return res.status(400).json({
            error: 'Bad Request, missing required launch property'
        })
    }
    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid launchDate property'
        })
    }
    await scheduleNewLaunch(launch);
    return res.status(201).json({
        success: 'resource succefully created',
        created: launch,
        status: 201
    });
}

async function httpAbortLaunch(req, res) {
    const launchId = +req.params.id;
    const existLaunch = await existsLaunch(launchId);
    if (!existLaunch) {
        res.status(404).json({
            error: 'Launch not found'
        });
    } else {
        const aborted = await abortLaunchById(launchId);
        if(!aborted) return res.status(400).json({
            error:'Launch not aborted'
        })
        return  res.status(200).json({ok:true});
    }
}


module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}