import {ModelMeta} from "../meta/model";
/**
 * Created by Thomas-P on 07.08.2016.
 */


interface IModelConfiguration {
    collection?: string;
    discriminator?: string;
}


export function Model(configuration: IModelConfiguration) {

    return function (target) {
        if (!configuration) {
            return;
        }

        let meta = ModelMeta.getMetaInformation(target, true);
        if (configuration.collection) {
            meta.collection = configuration.collection;
        }
        meta.discriminator = configuration.discriminator;
    }
}