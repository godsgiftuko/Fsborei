const mysql = require("mysql");
const dotenv = require("dotenv");
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: "localhost",
    user: "myseard2_fsboreiUser",
    password: "matrix1",
    database: "myseard2_fsborei"
});

connection.connect((err) => {
    if (err) console.log(err);
    console.log("db " + connection.state);
});

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getUserAll() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM tblusers;";

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            //console.log(response);
            return response;


        } catch (error) {
            console.log(error);
        }
    }

    async getUser(email) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM tblusers WHERE email = ?;";

                connection.query(query, [email], (err, result) => {
                    if (err) {
                        reject(new Error(err.message));
                    }
                    else
                        resolve(result);
                })
            });

            //console.log(response);
            return response;

        } catch (error) {
            console.log(error);
        }
    }

    async createUser(name, email, password){
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query = "INSERT INTO tblusers (name, email, password, role) VALUES(?, ?, ?, 0);"

                connection.query(query, [name, email, password], (err, res) => {
                    if(err){
                        reject(new Error(err.message));
                    }
                    else
                    resolve(res.insertId);
                });
            });
            console.log(insertId);
            return insertId;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;