class bullet {
    name:string;
    x:number;
    y:number;
    speed:[number, number];
    radius:number;
    img:string;
    img_offset:[number, number] = [0,0];
    constructor(name : string,x : number,y : number,speed : [number, number],radius : number,img : string, img_offset:[number, number]=[0,0]){
        this.name=name;
        this.x=x;
        this.y=y;
        this.speed=speed;
        this.radius=radius;
        this.img=img;
        this.img_offset = img_offset;

    }
}
export default bullet;