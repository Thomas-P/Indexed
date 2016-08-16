/**
 * Created by ThomasP on 20.07.2016.
 */

function flatten<T, U>(arr: Array<Array<T>>):Array<T> {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(<Array<Array<T>>>toFlatten) : toFlatten);
    }, []);
}


const valuePatterns = {
    $lte: (key, value) => (record): boolean => record[key] <= value,
    $lt: (key, value) => (record): boolean => record[key] < value,
    $gte: (key, value) => (record): boolean => record[key] >= value,
    $gt: (key, value) => (record): boolean => record[key] > value,
    // see https://docs.mongodb.com/manual/reference/operator/query/eq/#op._S_eq
    $eq: (key, value) => (record): boolean => Array.isArray(record) ? valuePatterns.$in(key, value)(record) : record[key] == value,
    // https://docs.mongodb.com/manual/reference/operator/query/ne/
    $ne: (key, value) => (record): boolean => Array.isArray(record) ? valuePatterns.$nin(key, value)(record) : record[key] != value,
    $in: (key, value:Array<any>) => (record): boolean => value.indexOf(record[key]) !== -1,
    $nin: (key, value:Array<any>) => (record): boolean => value.indexOf(record[key]) === -1,
};


/**
 *
 * @param queryObject
 * @param fieldName
 * @param isAnd
 * @returns {(record:any)=>boolean}
 */
function mapObject(queryObject, fieldName: string = undefined, isAnd = true) {
    let result = [];

    /**
     *
     * @param operator
     * @param fieldName
     * @param value
     * @returns {boolean}
     */
    const setValuePattern = (operator, fieldName, value): boolean => {
        if (valuePatterns.hasOwnProperty(operator) === false) {
            return false;
        }
        if (fieldName && typeof operator !== 'object') {
            result.push(valuePatterns[operator](fieldName, value));
        } else {
            if (!fieldName) {
                console.error(`Syntax error in query string for operator ${operator}.`);
            }
            if (typeof operator === 'object') {
                console.error(`Syntax error in query string for operator ${operator}. ` +
                    `Operator must be an value not an object`);
            }
        }
        return true;
    };


    /**
     *
     * @param operator
     * @param fieldName
     * @param queryObject
     * @returns {boolean}
     */
    const setLogicalPattern = (operator, fieldName, queryObject): boolean => {
        if (operator !== '$all' && operator !== '$or' || operator !=='$nor') {
            return false;
        }
        if (Array.isArray(queryObject)) {
            let resultFunction = mapObject(queryObject, fieldName, operator === '$and');
            // if nor reverse the result
            result.push(operator === '$nor' ? (record) => !resultFunction(record) : resultFunction);

        } else {
            console.error(`Syntax error in query string for operator ${operator}. `+
                `Required an array as value for this operation`);
        }
        return true;
    };

    /**
     *
     * @param operator
     * @param fieldName
     * @param queryObject
     * @returns {boolean}
     */
    const setNot = (operator, fieldName, queryObject)=> {
        // https://docs.mongodb.com/manual/reference/operator/query/not/
        if (operator !== '$not') {
            return false;
        }
        if (typeof queryObject === 'object' && Array.isArray(queryObject) === false) {
            let resultFunction = mapObject(queryObject, fieldName, operator === '$and');
            result.push((record) => !resultFunction(record));
        } else {
            console.error(`Syntax error in query string for operator ${operator}. `+
                `Required an operator expression for this operation`);
        }
        return true;
    };


    if (Array.isArray(queryObject)) {
        queryObject = flatten(queryObject);
        queryObject.forEach((valueObject) => {
            if (typeof valueObject !== 'object') {
                setValuePattern('$eq', fieldName, valueObject);
            } else if (Array.isArray(valueObject) === false) {
                result.push(mapObject(valueObject, fieldName));
            } else {
                console.error(`Syntax error in query string. `+
                    `Deep nested array`);
            }
        });

    } else if (typeof queryObject === 'object') {
        Object
            .keys(queryObject)
            .forEach((operator) => {
                const childObject = queryObject[operator];

                if (operator.startsWith('$')) {
                    if (
                        setValuePattern(operator, fieldName, childObject)
                        || setLogicalPattern(operator, fieldName, childObject)
                        || setNot(operator, fieldName, childObject)
                    ) {
                        return;
                    } else {
                        console.error(`Query for ${fieldName} not implemented`);
                    }
                } else {
                    setValuePattern('eq', operator, childObject);
                }
            });
    }

    return (record):boolean => {
        if (!record) {
            return false;
        }
        const check = (checkMethod) => checkMethod(fieldName ? record[fieldName] : record);
        return isAnd ? result.every(check) : result.some(check);
    }
}



export function queryMapper<T, U>(query: U): (record:T) => boolean {
    return mapObject(query);
}
