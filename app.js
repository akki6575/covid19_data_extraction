const path = require("path");
const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
let initiateSeverAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initiateSeverAndDb();
//API 1
app.get("/states/", async (request, response) => {
  const dbQuery = "Select * from state;";
  let statesList = await db.all(dbQuery);
  let as = (statesList) => {
    return {
      stateId: statesList.state_id,
      stateName: statesList.state_name,
      population: statesList.population,
    };
  };
  response.send(statesList.map((each) => as(each)));
});
//API 2
app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const dbQuery = `Select * from state where state_id=${stateId};`;
  let stateList = await db.get(dbQuery);
  let as = (statesList) => {
    return {
      stateId: statesList.state_id,
      stateName: statesList.state_name,
      population: statesList.population,
    };
  };
  response.send(as(stateList));
});
//Api 3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  let dbQuery = `Insert into district (district_name,state_id,cases,cured,active,deaths) values ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  await db.run(dbQuery);

  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const dbQuery = `Select * from district where district_id=${districtId};`;
  let districtDetail = await db.get(dbQuery);
  let as = (statesList) => {
    return {
      districtId: statesList.district_id,
      districtName: statesList.district_name,
      stateId: statesList.state_id,
      cases: statesList.cases,
      cured: statesList.cured,
      active: statesList.active,
      deaths: statesList.deaths,
    };
  };
  response.send(as(districtDetail));
});

//API 5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const dbQuery = `Delete from district where district_id=${districtId};`;
  await db.run(dbQuery);
  response.send("District Removed");
});

//API6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const dbQuery = `update district set district_name='${districtName}',state_id=${stateId},cases=${cases},cured=${cured},active=${active},deaths=${deaths} where district_id=${districtId};`;
  await db.run(dbQuery);
  response.send("District Details Updated");
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const dbQuery = `Select sum(cases),sum(cured),sum(active),sum(deaths) from district where state_id=${stateId};`;
  const details = await db.get(dbQuery);
  const ans = (details) => {
    return {
      totalCases: details["sum(cases)"],
      totalCured: details["sum(cured)"],
      totalActive: details["sum(active)"],
      totalDeaths: details["sum(deaths)"],
    };
  };
  response.send(ans(details));
});

//API 8
// app.get("/district/:districtId/details/", async (request, response) => {
//   const { districtId } = request.params;
//   const dbQuery = `select state_id from district where district_id=${districtId};`;
//   const dbResponse = await db.get(dbQuery);
//   console.log(dbResponse);
//   response.send(dbResponse);
// });

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `select state_id from district where district_id = ${districtId};`;
  const getDistrictIdQueryResponse = await db.get(getDistrictIdQuery);
  //   console.log(getDistrictIdQueryResponse);
  const getStateNameQuery = `select state_name as stateName from state where state_id = ${getDistrictIdQueryResponse.state_id};`;
  const getStateNameQueryResponse = await db.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});
module.exports = app;
