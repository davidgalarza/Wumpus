import Tablero from "./Tablero";
import Agente from "./Agente";
import fs from "fs";
const open = require('open');


// Generar un tablero aleatorio
let ambiente: Tablero = Tablero.tableroAleatorio();

let agente: Agente = new Agente(0, 0, ambiente);

agente.resolver(); // Intrentar resolver el ambiente

let html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <h1>Wumpus</h1>

    

    ${agente.htmlCono}
    <h3>Hambiente inicial</h3>
    ${ambiente.html()}
    
  </body>
</html>
`;


fs.writeFileSync('src/index.html', html);
open('src/index.html', {"wait": true });







