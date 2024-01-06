import { levelData } from "./typedefs";

// 
function LevelSelector({levels,symbols, callback}: {levels : levelData[][], symbols : string[][], callback : Function}){
    return <table><tbody>
    {function() { 
        var lst = []
        for(var i=0 ; i < 5; i++){
            lst.push(<tr key ={"table row " + i}>
                {
                    function(){
                        var lst2 = [];
                        for(var j=0; j<5; j++){
                            lst2.push(<td key ={"table row col " + i + " " + j} id={i + " " + j} onClick={(e) => callback((e.target as HTMLElement).getAttribute("id")?.split(" "))}>{i} {j}</td>)
                        }
                        return lst2; 
                    }()
                }
            </tr>)
        }
        return lst;
    }()}
    </tbody></table>
    
}

export default LevelSelector;