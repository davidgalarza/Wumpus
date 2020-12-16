class Casilla {

    x: number;
    y: number;

    tieneBriza: boolean;
    tieneHueco: boolean;

    constructor(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    igual(casilla: Casilla): boolean{
        return this.x.toString() + this.y.toString() == casilla.x.toString() + casilla.y.toString();
    }
}

export default Casilla;