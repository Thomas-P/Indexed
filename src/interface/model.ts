import {IIndex} from "./index";
/**
 * Created by Thomas-P on 10.08.2016.
 */
export interface IModel {
    addModel<T>(target: T);
    /**
     * return the indices for the collection
     * @param collection
     */
    getIndexes(collection): Array<IIndex>;
}
