/**
 * Created by Thomas-P on 13.08.2016.
 */


interface IOutput<T> {
    _id: string;
    value: T;
}


export function MapReduce<T, U, V>(map: (value: T, emit:(id: string, values:any) => any)=>any, reduce: (key: string, values: Array<U>) => IOutput<V>) {
    // @todo

    return (target) => {

    }
}