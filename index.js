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

const cloudinary = require('cloudinary').v2;


// Configuration 
cloudinary.config({
  cloud_name: "dj3zwdn0r",
  api_key: "897858757985486",
  api_secret: "nEQPNDoiygXtaJju-PDDT59XpbQ"
});

// Configura Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

io.on('connection', socket => {
    console.log('Usuario conectado: ' + socket.id);
    
    socket.on('joinRoom', roomId => {
      console.log('Usuario ' + socket.id + ' se ha unido a la sala ' + roomId);
      socket.join(roomId);
    });
  
    socket.on('message', message => {
      console.log('Mensaje recibido: ' + message.text);
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

app.post("/api/login", (req, res) => {
    const correo = req.body.correoLogin;
    const contrasena = req.body.contrasenaLogin;
    console.log(correo)
    conexion.query("SELECT * FROM usuarios WHERE correo = ? && contrasena = ?",[correo, contrasena], (error, results) => {
        if(error){
            console.log("incorrecto")
        }else{
            if(results.length > 0){
                res.status(200).send(results[0])
            } else {
                res.status(400).send("Usuario no existe")
            }
        }
   })
})

app.post("/api/registrarse", (req, res) => {
    const nombre = req.body.nombreRegistro;
    const correo = req.body.correoRegistro;
    const contrasena = req.body.contrasenaRegistro;
    conexion.query("INSERT INTO usuarios SET ?", {nombre: nombre, apellido: "", direccion: "", correo: correo, contrasena: contrasena, sesion: 0, imagen: ""}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            if(results.protocol41){
                res.status(200).send(results[0])
            } else {
                res.status(400).send("No se ha podido crear la cuenta")
            }
        }
    })
})

/*
const diskstorage = multer.diskStorage({
    destination: path.join(__dirname, "./images"),
    filename: (req, file, cb) => {
        cb(null,Date.now() + "-monkeywit-" + file.originalname)
    }
})

const fileUpload = multer({
    storage: diskstorage
}).single("image")
*/

app.post("/perfil/guardarDatos", upload.single('file'), (req, res) => {
   
    const usuario_id = req.body.usuario_id;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const direccion = req.body.direccion;
    const imagen = req.file;
    var urlImagen;
    console.log(imagen);
    
    const subirImagen = () => {
        return new Promise((resolve, reject) => {
            /*
            if(imagen == undefined){
                reject(error);
            }*/
            cloudinary.uploader.upload_stream({ resource_type: 'auto' }, function(error, result) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log(result);
                    console.log("Mi imagen: " + result.url);
                    urlImagen = result.url;
                    resolve(urlImagen);
                    //res.status(200).send(result);
                }
            }).end(imagen.buffer)
        });
    }
    
    subirImagen()
    .then((urlImagen) => {
        conexion.query("UPDATE usuarios SET nombre = ?, apellido = ?, direccion = ? , imagen = ? WHERE usuario_id = ?", [nombre, apellido, direccion, urlImagen, usuario_id], (error, results)=>{
            //console.log("Mi super ultra imagen: " + urlImagen);
            if(error){
                console.log(error);
            }else{
                if(results.protocol41){
                    res.status(200).send("Actualizado")
                } else {
                    res.status(400).send("No se ha podido crear la cuenta")
                }
            }
        });
    })
    .catch((error) => {
      console.error(error);
      res.send('Ocurrió un error al procesar la imagen');
    });   
})

app.post("/perfil/obtenerDatos", (req, res) => {
    const id = req.body.id;
   
    conexion.query("SELECT * FROM usuarios WHERE usuario_id = ?",[id], (error, results) => {
        if(error){
            console.log("incorrecto")
        }else{
            console.log(results[0])
            if(results.length > 0){
                res.status(200).send(results[0])
            } else {
                res.status(400).send("Usuario no existe")
            }
        }
   })
})

app.post("/subirProducto", upload.single('file'),  (req, res) => {
    
    const nombre = req.body.nombre;
    const categoria = req.body.categoria;
    const precio = req.body.precio;
    const estado = req.body.estado;
    const descripcion = req.body.descripcion;
    const usuario = req.body.usuario;
    const imagenSubir = req.file;
    var urlImagen;
    console.log(req.body)
    const subirImagen = () => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'auto' }, function(error, result) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    //console.log(result);
                    console.log("Mi imagen: " + result.url);
                    urlImagen = result.url;
                    resolve(urlImagen);
                    //res.status(200).send(result);
                }
            }).end(imagenSubir.buffer)
        });
    }

    subirImagen()
    .then((urlImagen) => {
        conexion.query("INSERT INTO productos SET ?", {nombre: nombre, categoria: categoria, precio: precio, estado: estado, descripcion: descripcion, usuario_id: usuario, imagen: urlImagen}, (error, results)=>{
            if(error){
                console.log(error);
            }else{
                if(results.protocol41){
                    res.status(200).send("Subido correctamente");
                } else {
                    res.status(400).send("No se ha podido crear el producto")
                }
            }
        })
    })
    .catch((error) => {
      console.error(error);
      res.send('Ocurrió un error al procesar la imagen');
    });
})

app.post("/mostrarProductos", (req, res) => {
   
    const usuario = req.body.usuario;
    conexion.query("SELECT * FROM productos WHERE usuario_id = ?",[usuario], (error, results) => {
        if(error){
            console.log("incorrecto")
        }else{
            res.status(200).send(results)
        }
   })
})

app.post("/editarProducto", upload.single('file'), (req, res) => {
   
    const id = req.body.id;
    const nombre = req.body.nombre;
    const categoria = req.body.categoria;
    const precio = req.body.precio;
    const estado = req.body.estado;
    const descripcion = req.body.descripcion;
    const imagen = req.body.imagen;
    const imagenEditar = req.file;
    var urlImagen;
    var sql;
    
    const subirImagen = () => {
        return new Promise((resolve, reject) => {
            if(imagenEditar == undefined) {
                reject("No hay imagen");
            }
            cloudinary.uploader.upload_stream({ resource_type: 'auto' }, function(error, result) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log(result);
                    console.log("Mi imagen: " + result.url);
                    urlImagen = result.url;
                    resolve(urlImagen);
                    //res.status(200).send(result);
                }
            }).end(imagenEditar.buffer)
        });
    }
    
    subirImagen()
    .then((urlImagen) => {
        sql = `UPDATE productos SET nombre = '${nombre}', categoria = '${categoria}', precio = ${precio} , estado = '${estado}', descripcion = '${descripcion}', imagen = '${urlImagen}' WHERE id = ${id}`;
        conexion.query(sql, (error, results)=>{
            //console.log("Mi super ultra imagen: " + urlImagen);
            if(error){
                console.log(error);
            }else{
                if(results.protocol41){
                    res.status(200).send("Editado correctamente")
                } else {
                    res.status(400).send("No se ha podido crear la cuenta")
                }
            }
        });
    })
    .catch(() => {
        sql = `UPDATE productos SET nombre = '${nombre}', categoria = '${categoria}', precio = '${precio}' , estado = '${estado}', descripcion = '${descripcion}', imagen = '${imagen}' WHERE id = ${id}`;
        conexion.query(sql, (error, results)=>{
            //console.log("Mi super ultra imagen: " + urlImagen);
            if(error){
                console.log(error);
            }else{
                if(results.protocol41){
                    res.status(200).send("Editado correctamente")
                } else {
                    res.status(400).send("No se ha podido crear la cuenta")
                }
            }
        });
    });   

   
})

app.post("/eliminarProducto", (req, res) => {
   
    const id = req.body.id;
    conexion.query("DELETE FROM productos WHERE id = ?",[id], (error, results) => {
        if(error){
            console.log("incorrecto")
        }else{
            if(results.protocol41){
                res.status(200).send("Eliminado")
            } else {
                res.status(400).send("No se ha eliminado")
            }
        }
   })
})

app.post("/mostrarListadoProductos", (req, res) => {
   
    const categoria = req.body.categoria;
    

    if(categoria != "todos") {
        conexion.query("SELECT * FROM productos WHERE categoria = ?",[categoria], (error, results) => {
            if(error){
                console.log("incorrecto")
            }else{
                res.status(200).send(results)
            }
       })
    }
    else {
        conexion.query("SELECT * FROM productos", (error, results) => {
            if(error){
                console.log("incorrecto")
            }else{
                res.status(200).send(results)
            }
       })
    }
    
})

app.get("/buscarProductoInicio", (req, res) => {
    
    conexion.query(`SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY id) AS rn FROM productos) sub WHERE rn <= 4;`, (error, results) => {
        if(error){
            console.log('Error al buscar productos')
        }else{
            
            var productos = {}, key;
            
            results.forEach(element => {
                key = element["categoria"];
                if(!productos[key]){
                    productos[key] = [];
                } 

                productos[key].push(element); 
            });
           
           
            res.json(productos)
          
        }
    })
})

app.post("/buscarProducto", (req, res) => {
    const nombre = req.body.nombre;
    const categoria = req.body.categoria;
    const estado = req.body.estado;
    
    var sql = "";

    if(nombre == null && categoria == null && estado == null){
        sql = "SELECT * FROM productos";
    } else if(nombre != null && categoria == null && estado == null){
        sql = `SELECT * FROM productos WHERE nombre LIKE '%${nombre}%'`;
    } else if(nombre != null && categoria != null && estado == null){
        sql = `SELECT * FROM productos WHERE nombre LIKE '%${nombre}%' AND categoria = '${categoria}'`;
    } else if(nombre != null && categoria != null && estado != null){
        sql = `SELECT * FROM productos WHERE nombre LIKE '%${nombre}%' AND categoria = '${categoria}' AND estado = '${estado}'`;
    } else if(nombre == null && categoria != null && estado == null){
         sql = `SELECT * FROM productos WHERE categoria = '${categoria}'`;
    } else if(nombre == null && categoria != null && estado != null){
        sql = `SELECT * FROM productos WHERE categoria = '${categoria}' AND estado = '${estado}'`;
    } else if(nombre != null && categoria != null && estado != null){
        sql = `SELECT * FROM productos WHERE nombre LIKE '%${nombre}%' AND categoria = '${categoria}' AND estado = '${estado}'`;
    }
   
    conexion.query(sql, (error, results) => {
        if(error){
            console.log('Error al buscar productos')
        }else{
            res.status(200).send(results)
        }
    })
    
})

app.post("/filtrarProducto", (req,res) => {
    const precio_min = req.body.precio_min;
    const precio_max = req.body.precio_max;
    const categoria = req.body.categoria;
    const estado = req.body.estado;

    // Realizar la consulta en la base de datos
    let sql = `SELECT * FROM productos WHERE precio >= ${precio_min} AND precio <= ${precio_max}`;

    if (categoria) {
        sql += ` AND categoria = '${categoria}'`;
    }

    if (estado) {
        sql += ` AND estado = '${estado}'`;
    }

    conexion.query(sql, (error, results) => {
        if(error){
            console.log('Error al filtrar productos')
        }else{
            console.log("Producto filtrado")
            console.log(results)
            res.status(200).send(results)
        }
    })
})

app.post("/mostrarFichaProducto", (req, res) => {
   
    const id = req.body.id;
    conexion.query("SELECT * FROM productos WHERE id = ?",[id], (error, results) => {
        if(error){
            console.log("incorrecto")
        }else{
            res.status(200).send(results[0])
        }
   })
})

app.post("/crearConversacion", (req, res) => {
   
    const usuario1_id = req.body.usuario1_id;
    const usuario2_id = req.body.usuario2_id;
    console.log(usuario1_id)
    console.log(usuario2_id)
   
    var sql = `INSERT INTO conversaciones (usuario1_id, usuario2_id)
    SELECT * FROM (SELECT ${usuario1_id}, ${usuario2_id}) AS tmp
    WHERE NOT EXISTS (
        SELECT usuario1_id, usuario2_id FROM conversaciones WHERE (usuario1_id = ${usuario1_id} AND usuario2_id = ${usuario2_id}) OR (usuario1_id = ${usuario2_id} AND usuario2_id = ${usuario1_id})
    ) LIMIT 1;`;

    conexion.query(sql, (error, results)=>{
        if(error){
            console.log("a")
        }else{
            console.log(results)
            if(results != 0){
                res.status(200).send("Todo ok")
            } else {
                res.status(200).send("No se ha podido crear la sala")
            }
        }
    })
   
})

app.post("/obtenerConversaciones", (req, res) => {
   
    const usuario = req.body.usuario_id;
   
    var sql = `SELECT conversaciones.*, u1.nombre AS nombre_usuario1, u2.nombre AS nombre_usuario2
    FROM conversaciones
    JOIN usuarios u1 ON conversaciones.usuario1_id = u1.usuario_id
    JOIN usuarios u2 ON conversaciones.usuario2_id = u2.usuario_id
    WHERE conversaciones.usuario1_id = ${usuario} OR conversaciones.usuario2_id = ${usuario};`;

    conexion.query(sql, (error, results)=>{
        if(error){
            res.status(400).send(error);
        }else{
            if(results != 0){
                res.status(200).send(results);
            } else {
                res.status(200).send("No hay conversaciones")
            }
        }
    })
   
})

app.post("/obtenerMensajes", (req, res) => {
   
    const conversacion = req.body.conversacion;
    console.log(conversacion)
    var sql = `SELECT * FROM mensajes WHERE conversacion_id = ${conversacion} ORDER BY fecha`;
    
    conexion.query(sql, (error, results)=>{
        if(error){
            res.status(400).send(error);
        }else{
            res.status(200).send(results);
        }
    })
   
})

app.post("/guardarFavorito", (req, res) => {
   
    const usuario_id = req.body.usuario_id;
    const producto_id = req.body.producto_id;

    var sql = `INSERT INTO favoritos VALUES (${producto_id}, ${usuario_id})`;
    
    conexion.query(sql, (error, results)=>{
        if(error){
            res.status(400).send(error);
        }else{
            res.status(200).send("Insertado");
        }
    })
   
})

app.post("/eliminarFavorito", (req, res) => {
   
    const producto_id = req.body.producto_id;

    var sql = `DELETE FROM favoritos WHERE producto_id = ${producto_id}`;
    
    conexion.query(sql, (error, results)=>{
        if(error){
            res.status(400).send(error);
        }else{
            res.status(200).send("Eliminado");
        }
    })
   
})

/*
app.post("/conversaciones", (req, res) => {
   
    const usuario_1 = req.body.usuario_1;
    const usuario_2 = req.body.usuario_2;
    var encontrado = false;
    conexion.query("SELECT * FROM conversaciones WHERE usuario_1 = ? && usuario_2 = ?",[usuario_1, usuario_2], (error, results) => {
        if(error){
            console.log("incorrecto")
        }else{
            //res.status(200).send(results[0])
            if(results.length != 0) {
                encontrado = true;
                res.status(200).send(results[0])
            }
            else {
                conexion.query("SELECT * FROM conversaciones WHERE usuario_1 = ? && usuario_2 = ?",[usuario_2, usuario_1], (error, results) => {
                    if(error){
                        console.log("incorrecto")
                    }else{
                        //res.status(200).send(results[0])
                        if(results.length != 0) {
                            encontrado = true;
                            res.status(200).send(results[0])
                        }
                    }
                })
            }
           
        }
   })
})

app.post("/crearSala", (req, res) => {
    
    const usuario_1 = req.body.usuario_1;
    const usuario_2 = req.body.usuario_2;
    const sala = Math.random() * (1000000 - 1) + 1;
    conexion.query("INSERT INTO conversaciones SET ?", {usuario_1: usuario_1, usuario_2: usuario_2, sala: sala}, (error, results)=>{
        if(error){
            console.log(error);
        }else{
            if(results.protocol41){
                res.status(200).send("Creada correctamente")
            } else {
                res.status(400).send("No se ha podido crear el producto")
            }
        }
    })
})*/

http.listen(5000)



