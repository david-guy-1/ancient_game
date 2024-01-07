function BgImg({img} : {img : string}){
    console.log(img);
    return <img src={img}  style={{position:"absolute",top:0,left:0,zIndex:-99}}/>
}
export default BgImg;