class CasillaFrontera {
    x: number;
    y: number;
    pHueco: number; // Probabilidad de tener heucco
    pNHueco: number;// Probabilidad de NO tener heucco
    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    igual(casilla: CasillaFrontera): boolean{
        return this.x.toString() + this.y.toString() == casilla.x.toString() + casilla.y.toString();
    }

}   

export default CasillaFrontera;