/**
 * Created by Thomas-P on 07.08.2016.
 */

interface ITarget<T> {
    constructor?: () => T;
    prototype?: Object|ITarget<T>;
    __proto__?: Object|ITarget<T>;
}

/**
 * Return the constructor chain of a class or function prototype chain
 * @param target
 * @returns {any}
 */
export function getConstructorChain<T>(target: ITarget<T>|Function|Object): Array<Function> {
    let shiftFirst = false;

    const result = [];
    /**
     *
     * @param target
     * @returns {any|Object|ITarget}
     */
    const getPrototype = (target) => {
        return target.prototype || target.__proto__;
    };


    if (target && typeof target === 'function') {
        target = getPrototype(target);
    } else {
        shiftFirst = true;
    }


    if (!target) {
        return result;
    }

    do {
        result.push(target);
        target = getPrototype(target);
    } while(target);

    if (shiftFirst) {
        result.shift();
    }

    result.pop();
    return result.map((item) => item.constructor);
}
