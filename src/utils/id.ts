/**
 * Created by Thomas-P on 16.08.2016.
 */
let counter = 0;


export function createId(): string {
    let id = Date.now().toString(16);
    let cid = (counter++)%256;
    counter%=256;
    let firstPart = id+cid;
    while (firstPart.length<24) {
        firstPart = ((~~(Math.random()*16))%16).toString(16)+firstPart;
    }
    return firstPart;
}
