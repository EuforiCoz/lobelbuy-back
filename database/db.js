const mysql = require('mysql')

const conexion = mysql.createConnection({
    host: "www.db4free.net",
    user: "dwes_peco",
    password: "5c41f207",
    database: "despliegue_mysql"
})

conexion.connect((error) =>{
    if(error){
        console.error("Error de conexion: " + error);
        return
    }
    console.log("Conectado a MySQL");
})

module.exports = conexion;