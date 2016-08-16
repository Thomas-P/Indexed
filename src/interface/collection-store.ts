/**
 * Created by Thomas-P on 10.08.2016.
 */

export interface ICollectionStore {
    collection: string;
    collectionTarget: any;
    discriminator: Map<string, any>;
}
