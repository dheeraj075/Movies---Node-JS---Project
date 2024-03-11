const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

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
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};
const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// API 1 :
app.get("/movies/", async (request, response) => {
  const getMoviesName = `
    SELECT movie_name 
    FROM movie ;
    `;
  const movieArray = await db.all(getMoviesName);
  response.send(
    movieArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API 2 :
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId} ;
    `;
  const movieArray = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieArray));
});
//API 3 :
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO 
    movie(director_id,movie_name,lead_actor) 
    VALUES 
    ('${directorId}','${movieName}','${leadActor}') ;
    `;
  const movie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API 4 :
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const putMovieQuery = `
    UPDATE 
    movie 
    SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}' 
    WHERE 
    movie_id = '${movieId}' ;
    `;
  await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});

//API 5 :
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
    movie 
    WHERE 
    movie_id = '${movieId}' ;
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6 :
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * 
    FROM director ;
    `;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API 7 :
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
