import Casilla from './Casilla';

class Tablero {
    
    static dimension: number = 4;
    static numeroHuecos = 3;

    casillas: Casilla[];

    constructor(casillas: Casilla[]){
        this.casillas = casillas;
    }

    // Generar tablero aleatorio
    public static tableroAleatorio(): Tablero{
        let tableroGenerado: Casilla[] = [];
        let huecosGenerados = 0; // Contador de huecos generados

        for (let y = 0; y < this.dimension; y++) {
            for (let x = 0; x < this.dimension; x++) {
                let casilla = new Casilla(x, y); // Crea una casill

                // Posiciones en las que no puede haber huecos
                let segura1: boolean = x == 0 && y == 0;
                let segura2: boolean = x == 1 && y == 0;
                let segura3: boolean = x == 0 && y == 1;
                
                // Si no esta en una casilla segura intentar anadir una hueco
                if(!segura1 && !segura2 && !segura3){
                    let rnd = Math.random(); // Aleatorio
                    if(rnd <= 0.2 && huecosGenerados < this.numeroHuecos){
                        casilla.tieneHueco = true;
                        huecosGenerados ++;
                    }
                }

                tableroGenerado.push(casilla); // Anade al tablero la casilla
            }
        }

        // Colocar las brizas
        tableroGenerado.forEach((casilla) =>{
            if(casilla.tieneHueco){
                // Obtener vecinos del hueco
                let coordenadasVecinos = this.cordenadasVecinos(casilla.x, casilla.y);
                coordenadasVecinos.forEach((cor) =>{
                    // Poner la briza en los vecinos
                    let vecino = tableroGenerado.find((cas) => cas.x == cor[0] && cas.y == cor[1]);
                    vecino.tieneBriza = true;
                });
            }
        });

        return new Tablero(tableroGenerado);
    }

    obtenetCasilla(x, y){
        return this.casillas.find((cas) => cas.x == x && cas.y == y);
    }

    public static cordenadasVecinos(x: number, y: number): number[][]{
        let vecinos = [
            [x+1, y],
            [x-1, y],
            [x, y + 1],
            [x, y -1]
        ];

        return vecinos
        .filter((cordenadas) => 
                    cordenadas[0] > -1 && cordenadas[0] < 4 
                    && cordenadas[1] > -1 && cordenadas[1] < 4);
    }

    imprimir(): void{
        for (let y = 0; y < 4; y++) {
            let fila = "";
            for (let x = 0; x < 4; x++) {
                let casilla = this.casillas.find((cas) => cas.x == x && cas.y == y);
                
                if(casilla.tieneHueco) fila += 'O  ';
                else if(casilla.tieneBriza)fila += '~  ';
                else fila += 'x  ';
                
            }
            console.log(fila);
        }
    }
    

    html(): string{
        let html = `<div class="tablero">`;
        for (let y = 0; y < 4; y++) {   
            html += `<div class="fila">`;
            for (let x = 0; x < 4; x++) {
                let casilla = this.casillas.find((cas) => cas.x == x && cas.y == y);
                let contenido = "";
                if(x == 0 && y == 0) contenido = "agente";
                else if(casilla.tieneHueco) contenido = 'hueco';
                else if(casilla.tieneBriza)contenido = 'briza';
                else contenido += '';
                html +=`<div class="casilla"><div class="${contenido}"></div></div>`
            }
            html += "</div>"
        }
        html += "</div>";
        return html;
    }
}

export default Tablero;