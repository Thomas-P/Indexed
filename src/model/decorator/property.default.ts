import {ModelMeta} from "../meta/model";
/**
 * Created by Thomas-P on 07.08.2016.
 */

export function Default<K>(information: K) {

    return function (target, propertyKey: string) {
        let meta =  ModelMeta.getMetaInformation(target, true);
        let info = meta.keys.getKey(propertyKey, true);
        info.defaultValue = information;
    }
}
