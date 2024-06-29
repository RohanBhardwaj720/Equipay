import express from "express";
import pg from "pg";
import env from "dotenv";
import cors from "cors";
import { DateTime } from 'luxon';
import axios from 'axios';
import fetch from 'node-fetch';

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

const downloadImageAsBase64 = async (url) => {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString('base64');
        return base64String;
    } catch (error) {
        console.error('Error downloading image and converting to base64:', error);
        throw error;
    }
};
// for user table 
// to get user details like picture, name and email
// Handle query parameters
app.get("/user", handleUserRequest);

// Handle path parameters
app.get("/user/:id", handleUserRequest);

function handleUserRequest(req, res) {
    const email = req.query.email;
    const user_id = req.params.id || req.query.user_id;
    
    let query = "";
    let param = [];

    if (email) {
        query = "SELECT * FROM users WHERE user_email = $1";
        param = [email];
    } else if (user_id) {
        query = "SELECT * FROM users WHERE user_id = $1";
        param = [user_id];
    } else {
        return res.status(400).send("Bad Request: Missing parameter (email or user_id required)");
    }

    db.query(query, param, (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            return res.status(500).send("Internal Server Error");
        } else {
            if (result.rows.length !== 0) {
                console.log(result.rows[0]);
                return res.status(200).json(result.rows[0]);
            } else {
                console.log("User not found");
                return res.status(404).send("User not found");
            }
        }
    });
}

// to post user details, when user logged in for the first time
app.post("/user", async (req, res) => {
    const { email, picture, name } = req.body;
    
    try {
        // Download image and convert to base64
        const picture_in_base64 = await downloadImageAsBase64(picture);
        
        // Check if user already exists in the database
        db.query("SELECT * FROM users WHERE user_email = $1", [email], async (err, result) => {
            if (err) {
                console.error("Error executing query", err.stack);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            
            if (result.rows.length !== 0) {
                console.log("User already exists");
                const user_id = result.rows[0].user_id;
                return res.status(200).json({ user_id: user_id, message: "User already exists" });
            } else {
                // Insert new user with email, base64 image, and name
                db.query("INSERT INTO users (user_email, user_picture, user_name) VALUES ($1, $2, $3) RETURNING user_id", 
                    [email, picture_in_base64, name], 
                    (err, result) => {
                        if (err) {
                            console.error("Error adding new user", err.stack);
                            return res.status(500).json({ error: "Internal Server Error" });
                        } else {
                            const user_id = result.rows[0].user_id;
                            console.log("User added successfully");
                            return res.status(201).json({ user_id: user_id, message: "User added successfully" });
                        }
                    }
                );
            }
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// for trips table

//get all trips
app.get("/trip/all",(req,res)=>{
    const { user_id } = req.query;
    db.query("SELECT * FROM trip_members INNER JOIN trips ON trip_members.trip_id = trips.trip_id where trip_members.user_id = $1",[user_id],(err,result)=>{
        if(err){
            console.error("Error executing query", err.stack);
            res.status(500).send("Internal Server Error");
        }else{
            console.log(result.rows);
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

// Get trip members
app.get("/trip/members",(req,res)=>{
    const { trip_id } = req.query;
    db.query('SELECT * FROM trip_members INNER JOIN users ON trip_members.user_id = users.user_id WHERE trip_members.trip_id = $1',[trip_id],(err,response)=>{
        if (err) {
            console.error("Error executing query", err.stack);
            return res.status(500).send("Internal Server Error");
        }else{
            console.log(response.rows);
            res.status(200).json(response.rows);
        }
    })
});


// Pay your share 
app.patch("/payYourShare:id",(req,res)=>{
    const { money, paidBy } = req.body;
    const trip_id = req.params.id;
});
// pay to
app.patch("/addpayment/:id", (req, res) => {
    const money = parseFloat(req.body.money); // Convert to number
    const paidBy = req.body.paidBy;
    const trip_id = req.params.id;

    if (isNaN(money)) {
        return res.status(400).json({ error: "Invalid money value" });
    }

    let members = [];

    db.query("SELECT * FROM trip_members WHERE trip_id = $1", [trip_id], (err, result) => {
        if (err) {
            console.error("Error executing query", err.stack);
            return res.status(500).send("Internal Server Error");
        }

        members = result.rows;
        const eachOnesPart = money / members.length;

        let updatePromises = members.map(member => {
            let newSpending = parseFloat(member.user_spending) - eachOnesPart;
            if (member.user_id == paidBy) {
                newSpending += money;
            }

            return new Promise((resolve, reject) => {
                db.query("UPDATE trips SET total_spendings = total_spendings + $1 WHERE trip_id = $2",[money,trip_id],(err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
                db.query("UPDATE trip_members SET user_spending = $1 WHERE trip_id = $2 AND user_id = $3",
                    [newSpending, trip_id, member.user_id],
                    (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });
        });

        Promise.all(updatePromises)
            .then(() => {
                res.status(200).json({ message: "Payments updated successfully" });
            })
            .catch(error => {
                console.error("Error executing query", error.stack);
                res.status(500).send("Internal Server Error");
            });
    });
});
// history 
app.get("/history",(req,res)=>{
    const {tripId} = req.query;
    // console.log(tripId);
    db.query("SELECT * fROM transaction_history WHERE trip_id = $1",[tripId],(err,result)=>{
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