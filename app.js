let express = require("express");
let obj = express();
obj.use(express.json());
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
let dbpath = path.join(__dirname, "moviesData.db");
let db = null;

let converSankeToCamel = (object) => {
  return {
    movieName: object.movie_name,
  };
};
let converSankeToCamel2 = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};
let dconverSankeToCamel2 = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};

let initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    obj.listen(3000, () => {
      console.log("Server initialized at localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDbAndServer();

//get
obj.get("/movies/", async (request, Response) => {
  let getQueury = `
        SELECT 
            movie_name
        FROM 
            movie;
    `;
  let resultpromise = await db.all(getQueury);
  let result = [];
  for (let item of resultpromise) {
    let converted = converSankeToCamel(item);
    result.push(converted);
  }
  Response.send(result);
});

//post
obj.post("/movies/", async (request, Response) => {
  let { directorId, movieName, leadActor } = request.body;
  let postQuery = `
        INSERT INTO movie
            (director_id,movie_name,lead_actor)
            VALUES('${directorId}','${movieName}','${leadActor}');
    `;
  await db.run(postQuery);
  Response.send("Movie Successfully Added");
});

//getsingle

obj.get("/movies/:movieId/", async (request, Response) => {
  let { movieId } = request.params;
  let getQueury = `
        SELECT 
            *
        FROM 
            movie
        WHERE 
            movie_id = ${movieId};    
    `;
  let resultpromise = await db.get(getQueury);
  let converted = converSankeToCamel2(resultpromise);

  Response.send(converted);
});

//update
obj.put("/movies/:movieId/", async (request, Response) => {
  let { directorId, movieName, leadActor } = request.body;
  let { movieId } = request.params;
  let updateQuery = `
       UPDATE movie
       SET
            director_id = '${directorId}',
            movie_name = '${movieName}',
            lead_actor = '${leadActor}';
    `;
  await db.run(updateQuery);
  Response.send("Movie Details Updated");
});
//DELETE
obj.delete("/movies/:movieId/", async (request, Response) => {
  let { movieId } = request.params;
  let deleteQuery = `
        DELETE FROM movie WHERE movie_id = ${movieId};
    `;
  await db.run(deleteQuery);
  Response.send("Movie Removed");
});
//directorget
obj.get("/directors/", async (request, Response) => {
  let getQueury = `
        SELECT 
            *
        FROM 
            director;
    `;
  let resultpromise = await db.all(getQueury);
  let result = [];
  for (let item of resultpromise) {
    let converted = dconverSankeToCamel2(item);
    result.push(converted);
  }
  Response.send(result);
});
//dirmovie
obj.get("/directors/:directorId/movies/", async (request, Response) => {
  let { directorId } = request.params;
  let getQueury = `
        SELECT 
           movie_name
        FROM 
            movie
        WHERE
            director_id = ${directorId};    
    `;
  let resultpromise = await db.all(getQueury);
  let result = [];
  for (let item of resultpromise) {
    let converted = converSankeToCamel(item);
    result.push(converted);
  }
  Response.send(result);
});
module.exports = obj;
