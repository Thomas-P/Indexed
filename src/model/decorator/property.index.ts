import {ModelMeta} from "../meta/model";
/**
 * Created by Thomas-P on 07.08.2016.
 */

const reduce = (p: Array<string>, c: string) => {
    if (p.indexOf(c) === -1) {
        p.push(c);
    }
    return p;
};

/**
 * Allows to set a list of indexes for a property
 * @param indexNames
 * @returns {(target:any, propertyKey:string)=>undefined}
 * @constructor
 */
export function Index(...indexNames: Array<string>) {


    return function (target, propertyKey: string) {
        if (!propertyKey || typeof propertyKey !== 'string') {
            throw new Error('Require a property name');
        }
        let meta =  ModelMeta.getMetaInformation(target, true);
        let info = meta.keys.getKey(propertyKey, true);
        if (!Array.isArray(info.inIndex)) {
            info.inIndex = indexNames.reduce(reduce, []);
        } else {
            info.inIndex = indexNames.concat(info.inIndex).reduce(reduce, []);
        }
    }
}

