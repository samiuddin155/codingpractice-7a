const express = require("express");
const path = require("path");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express()
app.use(express.json())


const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name
  };
};


const convertMatchDetailsDbObjectToResponseObject = (dbObject)=> {
return {
matchId: dbObject.match_id,
match: dbObject.match,
year: dbObject.year,
};
};

//API 1 ------Returns a list of all the players in the player table


app.get("/players/",async(request,response)=>{
    const getplayersQuery = `
    SELECT
      *
    FROM
     player_details;`
  const playersArray = await db.all(getplayersQuery);
  response.send(
      playersArray.map((eachPlayer)=> convertDbObjectToResponseObject(eachPlayer)

      )
  );
});


//API 2 -------Returns a specific player based on the player ID

app.get("/players/:playerId/", async(request,response)=>{
    const{playerId} = request.params;
    const getplayerQuery = `
    SELECT
      *
    FROM
     player_details
    WHERE 
    player_id = ${playerId};
    `;
  const player = await db.get(getplayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});



//API 3 ---------

app.put("/players/:playerId/", async (request, response)=> {
const { playerId } = request.params;
const { playerName } = request.body;
const updatePlayerQuery =`
UPDATE
  player_details
SET
  player_name = '${playerName}'
WHERE
   player_id = ${playerId};`;

await db.run(updatePlayerQuery);
response.send("Player Details Updated");
});


//API 4 -------------
app.get("/matches/:matchId/", async (request, response)=> {
const { matchId } = request.params;
const matchDetailsQuery =`
SELECT
*
FROM
match_details
WHERE
match_id = ${matchId};`;
const matchDetails = await db.get(matchDetailsQuery);
response.send(convertMatchDetailsDbObjectToResponseObject(matchDetails));
});

//API 5 -------

app.get("/players/:playerId/matches/", async (request, response)=> {
const { playerId} = request.params;
const getPlayerMatchesQuery =`
SELECT
*
FROM player_match_score
NATURAL JOIN match_details
WHERE
player_id = ${playerId}; `;
const playerMatches = await db.all(getPlayerMatchesQuery);
response.send(
playerMatches.map((eachMatch)=>
convertMatchDetailsDbObjectToResponseObject(eachMatch)
)
);
});


app.get("/matches/:matchId/players", async (request, response)=> {
const { matchId} = request.params;
const getMatchPlayersQuery =`
SELECT
*
FROM player_match_score
NATURAL JOIN player_details
WHERE
match_id = ${matchId}; `;
const playersArray = await db.all(getMatchPlayersQuery);
response.send(
playersArray.map((eachPlayer) =>
convertDbObjectToResponseObject (eachPlayer)
)
);
});





app.get("/players/:playerId/playerScores/", async (request, response)=> {
const { playerId} = request.params;
const getmatchPlayersQuery =`
SELECT
player_id AS playerId,
player_name AS playerName,
SUM (score) AS totalScore,
SUM (fours) AS totalFours,
SUM (sixes) AS totalSixes
FROM player_match_score
NATURAL JOIN player_details
WHERE
player_id = ${playerId}; `;
const  playersMatchDetails = await db.get(getmatchPlayersQuery);
response.send(playersMatchDetails);
});

module.exports = app;





