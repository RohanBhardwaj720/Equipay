import express from "express";
import pg from "pg";
import env from "dotenv";
import cors from "cors";
import { DateTime } from 'luxon';
import axios from 'axios';

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

async function imageUrlToBytea(imageUrl) {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
}


// for user table 
// to get user details like picture, name and email
app.get("/user", (req, res) => {
    const { email } = req.query;
    db.query("SELECT * FROM users WHERE user_email = $1", [email], (err, result) => {
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
    const picture_in_bytea =  imageUrlToBytea(picture);
    db.query("SELECT * FROM users WHERE user_email = $1", [email], (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        } else {
            if (result.rows.length !== 0) {
                console.log("User already exists");
                res.status(200).send("User already exists");
            } else {
                db.query("INSERT INTO users (user_email, user_picture, user_name) VALUES ($1, $2, $3)", [email, picture_in_bytea, name], (err, result) => {
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
    const { user_id } = req.query;
    db.query("SELECT * FROM trip_members INNER JOIN trips ON trip_members.trip_id = trips.trip_id where trip_members.user_id = $1",[user_id],(err,result)=>{
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
    const { trip_id } = req.query;
    db.query("SELECT * FROM trips WHERE trip_id = $1",[trip_id],(err,result)=>{
        if (err) {
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        } else {
            if (result.rows.length !== 0) {
                // console.log(result.rows[0]);
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
    const { place, members_id, tripOrganizer } = req.body;
    const totalSpending = 0;
    const userSpending = 0;
    const today = DateTime.local();
    let newTripId = 1; // Initialize newTripId
    console.log( req.body);

    // Insert new trip into 'trips' table
    db.query(
        "INSERT INTO trips (place, start_datetime, total_spendings, trip_organizer) VALUES ($1, $2, $3, $4) RETURNING trip_id",
        [place, today, totalSpending, tripOrganizer],
        (err, insertResult) => {
            if (err) {
                console.error("Error executing query", err.stack);
                return res.status(500).send("Internal Server Error");
            }

            newTripId = insertResult.rows[0].trip_id;

            // Insert trip members into 'trip_members' table
            for (let i = 0; i < members_id.length; i++) {
                db.query(
                    "INSERT INTO trip_members (trip_id, user_id, user_spending) VALUES ($1, $2, $3)",
                    [newTripId, members_id[i],userSpending],
                    (err) => {
                        if (err) {
                            console.error("Error executing query", err.stack);
                            return res.status(500).send("Internal Server Error");
                        }
                        console.log(`Member ${members_id[i]} added to trip ${newTripId}`);
                    }
                );
            }

            console.log("Trip added successfully");
            res.status(200).send("Trip added successfully");
        }
    );
});

// async function updateUserTrips(email, newTripId) {
//     try {
//         const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

//         if (userResult.rows.length !== 0) {
//             const tripsId = userResult.rows[0].trips_id;
//             tripsId.push(newTripId);
//             await db.query("UPDATE users SET trips_id = $1 WHERE email = $2", [tripsId, email]);
//             console.log("User's trips_id updated successfully for email:", email);
//         } else {
//             console.log("User not found for email:", email);
//         }
//     } catch (err) {
//         console.error("Error updating user's trips_id", err.stack);
//         throw err; // Rethrow the error to handle it in the calling function
//     }
// }

// app.patch("/trip/:id", (req, res) => {
//     const { money, payedBy } = req.body;
//     const trip_id = req.params.id;

//     if(money !== undefined){
//     const moneyInt = parseInt(money);

//     db.query("SELECT * FROM trips WHERE id = $1", [trip_id], (err, result) => {
//         if (err) {
//             console.error("Error executing query", err.stack);
//             res.status(500).send("Internal Server Error");
//         } else {
//             if (result.rows.length !== 0) {
//                 const moneyArr = result.rows[0].money_array;
//                 const members = result.rows[0].members_emails;
//                 const newSpendings = result.rows[0].total_spendings + moneyInt;
//                 const split = moneyInt / members.length;

//                 for (var i = 0; i < members.length; i++) {
//                     if (members[i] == payedBy) {
//                         moneyArr[i] += moneyInt; 
//                     }
//                     moneyArr[i] -= split;
//                 }

//                 db.query("UPDATE trips SET money_array = $1, total_spendings = $2 WHERE id = $3", [moneyArr, newSpendings, trip_id], (err, result) => {
//                     if (err) {
//                         console.error("Error executing query", err.stack);
//                         res.status(500).send("Internal Server Error");
//                     } else {
//                         console.log("trip updated successfully");
//                         res.status(200);
//                     }
//                 });
//             } else {
//                 console.log("trip not found");
//                 res.status(404).send("trip not found");
//             }
//         }
//     });
//     }else{
//         const {array} = req.body;
//         db.query("UPDATE trips SET money_array = $1 WHERE id = $2",[array,trip_id],(err,result)=>{
//             if(err){
//                 console.error("Error executing query", err.stack);
//                 res.status(500).send("Internal Server Error");
//             }else{
//                 console.log("trip money array updated successfully");
//                 res.status(200).send("Trip money array updated successfully");
//             }
//         });
//     }
// });


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
    const { amount, paidTo, paidBy ,tripId} = req.body;
    const transactionDateTime = DateTime.local();
    db.query("INSERT INTO transaction_history (amount, paid_by, paid_to, transaction_datetime, trip_id ) VALUES ($1::DOUBLE PRECISION, $2, $3, $4, $5)",[amount, paidBy, paidTo, transactionDateTime,tripId],(err,result)=>{
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