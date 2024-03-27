import express from "express";
import pg from "pg";
import env from "dotenv";
import cors from "cors";
import { DateTime } from 'luxon';

const app = express();
const port = 3001;
env.config();


const db = new pg.Client({
    user : process.env.PG_USER,
    host : process.env.PG_HOST,
    database : process.env.PG_DATABASE,
    password : process.env.PG_PASSWORD,
    port : process.env.PG_PORT,
});

db.connect();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

function getCurrentDateTime() {
    // Get current date and time
    const today = DateTime.local();

    // Format date and time
    const formattedDateTime = today.toFormat('MMMM dd, yyyy    HH:mm');

    return formattedDateTime;
}



// for user table 
// to get user details like picture, name and email
app.get("/user", (req, res) => {
    const { email } = req.query;
    db.query("SELECT * FROM users WHERE email = $1", [email], (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        } else {
            if (result.rows.length !== 0) {
                console.log(result.rows[0]);
                res.status(200).json(result.rows[0]);
            } else {
                console.log("User not found");
                res.status(404).send("User not found");
            }
        }
    });
});

// to post user details, when user logged in for the first time
app.post("/user", async (req, res) => {
    const { email, picture, name } = req.body;
    const array = [];
    db.query("SELECT * FROM users WHERE email = $1", [email], (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        } else {
            if (result.rows.length !== 0) {
                console.log("User already exists");
                res.status(200).send("User already exists");
            } else {
                db.query("INSERT INTO users (email, picture, person_name, trips_id) VALUES ($1, $2, $3,$4)", [email, picture, name, array], (err, result) => {
                    if (err) {
                        console.error("Error adding new user", err.stack);
                        res.status(500).send("Internal Server Error");
                    } else {
                        console.log("User added successfully");
                        res.status(200).send("User added successfully");
                    }
                });
            }
        }
    });
});

// for trips table

//get all tris
app.get("/trip/all",(req,res)=>{
    const { email } = req.query;
    db.query("SELECT * FROM trips where user_email = $1",[email],(err,result)=>{
        if(err){
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        }else{
            res.status(200).json(result.rows);
        }
    });
});

// get imformation about the trip
app.get("/trip",(req,res)=>{
    const { id } = req.query;
    db.query("SELECT * FROM trips WHERE id = $1",[id],(err,result)=>{
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        } else {
            if (result.rows.length !== 0) {
                console.log(result.rows[0]);
                res.status(200).json(result.rows[0]);
            } else {
                console.log("trip not found");
                res.status(404).send("trip not found");
            }
        }
    });
}); 

// post a new trip 
app.post("/trip", async (req, res) => {
    const { Place, moneyArray, startingDate, membersEmails, totalSpending, userEmail } = req.body;

    try {
        const insertResult = await db.query("INSERT INTO trips (place, money_array, starting_date, members_emails, total_spendings, user_email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [Place, moneyArray, startingDate, membersEmails, totalSpending, userEmail]);

        const newTripId = insertResult.rows[0].id;

        for (let i = 0; i < membersEmails.length; i++) {
            const email = membersEmails[i];
            await updateUserTrips(email, newTripId);
        }

        console.log("Trip successfully added");
        res.status(200).json(newTripId); 
    } catch (err) {
        console.error("Error executing query", err.stack);
        res.status(500).send("Internal Server Error");
    }
});


async function updateUserTrips(email, newTripId) {
    try {
        const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rows.length !== 0) {
            const tripsId = userResult.rows[0].trips_id;
            tripsId.push(newTripId);
            await db.query("UPDATE users SET trips_id = $1 WHERE email = $2", [tripsId, email]);
            console.log("User's trips_id updated successfully for email:", email);
        } else {
            console.log("User not found for email:", email);
        }
    } catch (err) {
        console.error("Error updating user's trips_id", err.stack);
        throw err; // Rethrow the error to handle it in the calling function
    }
}

app.patch("/trip/:id", (req, res) => {
    const { money, payedBy } = req.body;
    const trip_id = req.params.id;

    if(money !== undefined){
    const moneyInt = parseInt(money);

    db.query("SELECT * FROM trips WHERE id = $1", [trip_id], (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        } else {
            if (result.rows.length !== 0) {
                const moneyArr = result.rows[0].money_array;
                const members = result.rows[0].members_emails;
                const newSpendings = result.rows[0].total_spendings + moneyInt;
                const split = moneyInt / members.length;

                for (var i = 0; i < members.length; i++) {
                    if (members[i] == payedBy) {
                        moneyArr[i] += moneyInt; 
                    }
                    moneyArr[i] -= split;
                }

                db.query("UPDATE trips SET money_array = $1, total_spendings = $2 WHERE id = $3", [moneyArr, newSpendings, trip_id], (err, result) => {
                    if (err) {
                        console.error("Error executing query", err.stack);
                        res.status(500).send("Internal Server Error");
                    } else {
                        console.log("trip updated successfully");
                        res.status(200);
                    }
                });
            } else {
                console.log("trip not found");
                res.status(404).send("trip not found");
            }
        }
    });
    }else{
        const {array} = req.body;
        db.query("UPDATE trips SET money_array = $1 WHERE id = $2",[array,trip_id],(err,result)=>{
            if(err){
                console.error("Error executing query", err.stack);
                res.status(500).send("Internal Server Error");
            }else{
                console.log("trip money array updated successfully");
                res.status(200).send("Trip money array updated successfully");
            }
        });
    }
});


// history 

app.get("/history",(req,res)=>{
    const {tripId} = req.query;
    db.query("SELECT * from transaction_history where trip_id = $1",[tripId],(err,result)=>{
        if(err){
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        }else{
            res.status(200).send(result.rows);
        }
    });
});

app.post("/history",(req,res)=>{
    const { amount, payedTo, payedBy ,tripId} = req.body;
    const transactionDateTime = getCurrentDateTime();
    db.query("INSERT INTO transaction_history (amount, payed_by, payed_to, date, trip_id ) VALUES ($1, $2, $3, $4, $5)",[parseInt(amount), payedBy, payedTo, transactionDateTime,tripId],(err,result)=>{
        if(err){
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        }else{
            console.log("Transaction added successfully");
            res.status(200).send("Transaction added successfully");
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});