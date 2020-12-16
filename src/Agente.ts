import Casilla from "./Casilla";
import CasillaFrontera from "./CasillaFrontera";
import Tablero from "./Tablero";

class Agente{
    // Posicion actual del agente
    posicioX: number;
    posicioY: number;

    ambiente: Tablero; // Ambiante que va sensando
    casillasConocidas: Casilla[] = []; // Casillas que ya visita
    frontera: CasillaFrontera[] = [];

    htmlCono: string = "";


    constructor(posicioX: number,posicioY: number, ambiente: Tablero){
        this.posicioX  = posicioX;
        this.posicioY = posicioY;
        this.ambiente = ambiente;
    }

   

    // Explora recursivamente el ambiente hasta quedar encerrado por brisas
    explorar(){
        this.frontera = []; // Borrar la fronte
        let casillasTablero = this.ambiente.casillas;
        
        // Obtiene la casilla del ambiente de su posiion actual
        let casilla = casillasTablero.find((cas) => cas.x == this.posicioX && cas.y == this.posicioY);

        this.casillasConocidas.push(casilla); // Anadir a las conocidas

        // Si no tiene briza explorar los vecinos
        if(!casilla.tieneBriza){
            // Obtien las cordenadas de los vecinos
            let coorVecinos = Tablero.cordenadasVecinos(casilla.x, casilla.y);
            // Explora los vecinos
            coorVecinos.forEach((cv) =>{
                // Obtiene casilla vecina
                let casillaVecina = this.ambiente.obtenetCasilla(cv[0], cv[1]);
                // Explora solo si no la conoce ya
                if(!this.casillasConocidas.some((c) => c.igual(casillaVecina))){
                    
                    this.imprimirConoimiento(); // Impresion
                    this.htmlCono += this.htmlConoimiento(); // Impresion
                    // Mueve a esa posicion
                    this.posicioX = casillaVecina.x;
                    this.posicioY = casillaVecina.y;
                    this.explorar();
                }
            })
            
        }

    }


    obtenerFrontera(){
        this.frontera = [];
        let brizas = this.casillasConocidas.filter((c) =>c.tieneBriza); // Saco las brizas conoidas
        brizas.forEach((casillaConocidda) =>{
            // Obtener coordenas vecinas de las brizas
            let coorVecinos = Tablero.cordenadasVecinos(casillaConocidda.x,casillaConocidda.y);
            coorVecinos.forEach((coor) =>{
                // Obtento el vecino
                let vecino = this.ambiente.obtenetCasilla(coor[0], coor[1]);
                // Crear casilla de frontera sin probabilidades
                let casillaFrontera = new CasillaFrontera(vecino.x, vecino.y);
                let esConocido = this.casillasConocidas.some((c) => c.igual(vecino));
                let estaEnFrontera = this.frontera.some((cf) => cf.igual(casillaFrontera));

                // Es frontera si es vecino de briza pero NO es conocido y no se repite
                if(!esConocido && !estaEnFrontera){
                    this.frontera.push(casillaFrontera);
                }
            });
        });
        
    }

    moverseFrontera(){
        this.frontera = this.frontera.sort(()  => .5 - Math.random()); // Desordenar frontera aletoiamente
        // Ordenar en base a la probabilidad de no hueco de menor a mayor
        this.frontera = this.frontera.sort((a, b) => b.pNHueco -a.pNHueco); 
        // Mueve al de menor probabilidad
        this.posicioX = this.frontera[0].x;
        this.posicioY = this.frontera[0].y;
    }

    calcularProbabilidadFrontera(): void{
        var nFrontera = this.frontera.length;
        var numberOfSets = 1 << nFrontera;

        var modelos = [];
        // Genramos toddos los posibles modelos
        for (var i = 0; i < numberOfSets; i++) {
          modelos.push({});
          for (var j = 0; j < nFrontera; j++) {
            if (((1 << j) & i) > 0) {
                modelos[i][j] = true;
            } else {
                modelos[i][j] = false;
            }
          }
        }

        // Se eliminan los modelos  que no producen las brisas que ya se conocen
        modelos = modelos.filter((m) => this.modeloValido(m)); 


        // Recorre la frontera para calcaular la probabilidad de cada uno
        this.frontera.forEach((cf, i) => {
            let modelosHueco = modelos.filter((m) =>m[i]); // Modelos que tienen hueco en el a calcular
            let modelosSinHueco = modelos.filter((m) =>!m[i]); // Modelos que NO tienen hueco en el a calcular
            let ph = 0; // Probabilidad de hueco
            let psh= 0; // Probabildad de sin hueco

            if(modelosHueco.length >0){
                // Calcular la probabilidad si exite la posibilidad de hueco
                ph = modelosHueco.reduce((v, modelo) => v + this.propabilidadModelo(modelo), 0);
            }
            if(modelosSinHueco.length){
                // Calcular la probabilidad NO exite la posibilidad de hueco
                psh = modelosSinHueco.reduce((v, modelo) => v + this.propabilidadModelo(modelo), 0);
            }
            
            // Probabilida conjuna
            let pc = ph  + psh;

            let pph = ph/pc; // Probabilidad del hueco en la casilla
            let ppnh = psh /pc; // Probabilidad de NO hueco en la casilla


            // Poner probabilida a la casilla de frontera
            cf.pHueco = pph;
            cf.pNHueco = ppnh;
        }); 
        this.imprimirConoimiento();
        this.htmlCono += this.htmlConoimiento();       
    }

    propabilidadModelo(modelo): number {
        let prov = 1;
        Object.keys(modelo).forEach((k) =>{
            let mul;
            if(modelo[k]) mul = 0.2; // Si tienen hueco es 0.2
            else mul = 0.8; // Si NO tienen hueco es 0.8
            prov *= mul;
        });
        return prov; // Devuelve probabilida del modelo
    }


    // Devuelve verdadero si el modelo genera las brizas conocidas
    modeloValido(modelo): boolean {
        let posicionesConBrisa = []; // Brizas que generaria el modelo

        // Reorrer la frontera
        this.frontera.forEach((cf,i) =>{
            let tieneHueco = modelo[i]; // Ver si en el modelo tiene hueco
            if(tieneHueco){
                // Anade sus brizas a las brizas del modelo
                posicionesConBrisa = [
                    ...posicionesConBrisa,
                    ...Tablero.cordenadasVecinos(cf.x, cf.y)
                ]
            }
        });


        // Compara lo que generaria con lo que conoce
        for (let i = 0; i < this.casillasConocidas.length; i++) {
            const cc = this.casillasConocidas[i];
            if(cc.tieneBriza){
                // Si tiene briza debe estar en las del modelo
                let estaEnModelo = posicionesConBrisa.some((pos) => cc.x == pos[0] && cc.y == pos[1]);
                if(!estaEnModelo){
                    // Retorna falso si el modelo no genero esta briza
                    return false;
                }
            }
        }

        // Si tubo todo retorna que si es valio
        return true;
    }

    imprimirConoimiento(){

        for (let y = 0; y < 4; y++) {
            let fila = "";
            for (let x = 0; x < 4; x++) {
                let casilla = this.casillasConocidas.find((cas) => cas.x == x && cas.y == y);
                if(!casilla)fila += '?  ';
                else if(casilla.tieneHueco) fila += 'O  ';
                else if(casilla.tieneBriza)fila += '~  ';
                else fila += 'x  ';
            }
            console.log(fila);
        }
    }

    htmlConoimiento(): string{

        let html =   `<div class="tablero">`;
        for (let y = 0; y < 4; y++) {
            html += `<div class="fila">`;

            for (let x = 0; x < 4; x++) {
                let contenedor = "";
                let contenido = "";
                let casilla = this.casillasConocidas.find((cas) => cas.x == x && cas.y == y);
                let frontera = this.frontera.find((cf) => cf.x == x && cf.y == y);
                if(frontera) contenedor = 'frontera'
                else if(!casilla) contenedor = 'desconocido';
                else if(casilla.tieneBriza) contenedor = 'briza_conociento';
                else contenedor = 'nada_conocimiento';

                if(!casilla) contenido = '';
                else{
                    if(this.posicioX == x && this.posicioY == y) contenido ='agente';
                    if(casilla.tieneHueco) contenido += 'hueco';
                    if(casilla.tieneBriza) contenido += 'briza';
                }
                html +=`<div class="casilla ${contenedor}"><div class="${contenido}"><span class="num">${frontera ? frontera.pHueco.toFixed(2) : ''}</span></div></div>`;
            }
            html += "</div>"
        }
        html += "</div>";
        return html;
    }


    resolver(){
        while(true){
            
            this.explorar(); // Moverse hasta quedar encerrado por brisas
            // Verifiaar si ya llego a un hueco
            let llegoHueco = this.casillasConocidas.some((c) =>  c.tieneHueco);
            if(llegoHueco) {
                // Impresion
                this.htmlCono += this.htmlConoimiento();
                this.htmlCono += '<h1>PERDIO</h1>'
                break; // Detener
            };
            
            this.obtenerFrontera(); // Obtener las casillas que son frontera
            this.calcularProbabilidadFrontera(); // Poner las probabilidades a las casillas de frontera

            // Gana cuado tiene la certeza que todos los de la frontera son huecos
            let gano = this.frontera.filter((c) =>c.pHueco ==1).length == this.frontera.length;
            if(gano) {
                this.moverseFrontera();
                this.htmlCono += '<h1>GANO</h1>'
                break; // detener el programa pq gano
            }
            // Moverse a la casilla mas segura
            this.moverseFrontera();
        }
    }
}

export default Agente;