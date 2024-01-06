export function dual_filter<T>(a : T[] , f : (a : T ) => boolean)  : [T[], T[]]{
    var x : T[] = [];
    var y : T[] = [];
    for (var item of a){
        if(f(item)){
            x.push(item);
        } else {
            y.push(item);
        }
    }
    return [x,y];
}