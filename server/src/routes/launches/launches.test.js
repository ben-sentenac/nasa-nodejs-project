const request = require('supertest');
const app = require('../../app');
const { loadingPlanetsData } = require('../../models/planets.model');

const { connectMongo, disconnectMongo } = require('../../utils/mongo');
require('dotenv').config();

describe('Launches api', () => {

    beforeAll(async () => {
        await connectMongo(process.env.MONGO_URL);
        await loadingPlanetsData();
      });
    
      afterAll(async () => {
        await disconnectMongo();
      });

    describe('test GET /launches endpoint', () => {
        test('it should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);

            //expect(response.status).toBe(200);
        });
    });

    describe('test POST /launch endpoint', () => {

        const launchData = {
            mission: 'USS enterprise',
            rocket: 'NCC 1078',
            destination: 'kepler 186 f',
            launchDate: 'January 4,2028'
        };

        const launchDataWitoutDate = {
            mission: 'USS enterprise',
            rocket: 'NCC 1078',
            destination: 'kepler 186 f',
        }
        test('should respond 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(
                    launchData
                )
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(launchData.launchDate).valueOf();
            const responseDate = new Date(response.body.created.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
            expect(response.body.created).toMatchObject(launchDataWitoutDate);
        });

        test('should respond 400 bad request', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(
                    launchDataWitoutDate
                )
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Bad Request, missing required launch property'
            })
        });
        test('should catch invalid date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(
                    {
                        mission: 'USS enterprise',
                        rocket: 'NCC 1078',
                        destination: 'kepler 186 f',
                        launchDate: 'anuary 4 2028'
                    }
                )
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Invalid launchDate property'
            })
        });
    });

})

