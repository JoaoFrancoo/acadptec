const express = require('express');
const mysql = require('mysql')
const cors = require('cors')

const app = express()
app.use(cors())

app.get('/', (req, res)=> {
    return res.json("From Backend side")
});
const db=mysql.createConnection({
    host:"localhost",
    user:'root',
    password:'',
    database: 'pi3bd'

})

app.get('/users', (req,res)=>{
    const sql = "SELECT * FROM organizadores";
    db.query(sql, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/inscricoes', (req,res)=>{
    const sql = "SELECT * FROM inscricoes";
    db.query(sql, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    })
})
app.listen(8083, ()=>{
    console.log("listening")
}); 