const express = require('express');
const cors = require('cors');
//const multer = require("multer");
const app = express();
const path = require("path"); //vercel
const multer = require('multer');

app.use(cors())
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*"
    }
});

var users = [];
/*
const cloudinary = require('cloudinary').v2;


// Configuration 
cloudinary.config({
  cloud_name: "dj3zwdn0r",
  api_key: "897858757985486",
  api_secret: "nEQPNDoiygXtaJju-PDDT59XpbQ"
});

// Configura Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });*/

io.on('connection', socket => {
    console.log('Usuario conectado: ' + socket.id);
    
    socket.on('joinRoom', roomId => {
      console.log('Usuario ' + socket.id + ' se ha unido a la sala ' + roomId);
      socket.join(roomId);
    });
  
    socket.on('message', message => {
      console.log('Mensaje recibido: ' + message.mensaje);
      console.log(message)
      
      conexion.query("INSERT INTO mensajes SET ?", {conversacion_id: message.conversacion_id, envia: message.envia, recibe: message.recibe, mensaje: message.mensaje, fecha: message.fecha}, (error, results) => {
        if(error){
            console.log("incorrecto")
        }else{
            if(results.length > 0){
                //res.status(200).send("Mensaje insertado");
            } else {
                //res.status(400).send("Usuario no existe")
            }
        }
   })
      io.to(message.conversacion_id).emit('message', message);
    });
  
    socket.on('disconnect', () => {
      console.log('Usuario desconectado');
    });
  });

//app.set('view engine', 'ejs'); //Motor de plantillas
app.set("views", path.join(__dirname, "views")); //vercel
app.use("/images", express.static(path.resolve(__dirname, "views/images")));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const conexion = require("./database/db");
const { Console } = require('console');

app.post("/buscarProducto", (req, res) => {
    const nombre = req.body.nombre;
    const categoria = req.body.categoria;
    var estado = req.body.estado;
    var precio = req.body.precio;

    if(estado == undefined){
        estado = null;
    }

    if(precio == null || precio == "porDefectoPrecio"){
        precio = 99999;
    }
    
    console.log(nombre)
    console.log(categoria)
    console.log(estado);
    console.log(precio)

    var sql = "";

    if(nombre == null && categoria == null && estado == null){
        sql = `SELECT * FROM productos WHERE reservado <> 2 AND precio <= '${precio}'`;
    } else if(nombre != null && categoria == null && estado == null){
        sql = `SELECT * FROM productos WHERE nombre LIKE '%${nombre}%' AND reservado <> 2 AND precio <= '${precio}'`;
    } else if(nombre != null && categoria != null && estado == null){
        sql = `SELECT * FROM productos WHERE nombre LIKE '%${nombre}%' AND categoria = '${categoria}' AND reservado <> 2 AND precio <= '${precio}'`;
    } else if(nombre != null && categoria != null && estado != null){
        sql = `SELECT * FROM productos WHERE nombre LIKE '%${nombre}%' AND categoria = '${categoria}' AND estado = '${estado}' AND reservado <> 2 AND precio <= '${precio}'`;
    } else if(nombre == null && categoria != null && estado == null){
         sql = `SELECT * FROM productos WHERE categoria = '${categoria}' AND reservado <> 2 AND precio <= '${precio}'`;
    } else if(nombre == null && categoria != null && estado != null){
        sql = `SELECT * FROM productos WHERE categoria = '${categoria}' AND estado = '${estado}' AND reservado <> 2 AND precio <= '${precio}'`;
    } else if(nombre != null && categoria != null && estado != null){
        sql = `SELECT * FROM productos WHERE nombre LIKE '%${nombre}%' AND categoria = '${categoria}' AND estado = '${estado}' AND reservado <> 2 AND precio <= '${precio}'`;
    } else if(nombre != null && categoria == null && estado != null){
        sql = `SELECT * FROM productos WHERE nombre LIKE '%${nombre}%' AND estado = '${estado}' AND reservado <> 2 AND precio <= '${precio}'`;
    }else if(nombre == null && categoria == null && estado != null){
        sql = `SELECT * FROM productos WHERE estado = '${estado}' AND reservado <> 2 AND precio <= '${precio}'`;
    }
    console.log(sql)
    conexion.query(sql, (error, results) => {
        if(error){
            console.log(error)
        }else{
            console.log(results)
            res.status(200).send(results)
        }
    })
    
})

http.listen(5000);
