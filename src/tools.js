
/**
 * 把 obje2对象 的属性 赋值给obj1对象中
 */
export function extend(obj1, obj2) {
    for(const property in obj2) {
        obj1[property] = obj2[property]
    }
}
/**
 * 循环 把list中的item 传入 callback调用
 * @param {likeArray | Array} list 列表
 */
export function each(list, callback) {
    if (typeof list.length === "number") {
        list = Array.apply(null, list)
    }
    list.forEach((item, index) => {
        callback.call(item, index, item)
    })
}
/**
 * 驼峰命名 转换成 “串串” 命名
 * 例如 WebkitTransform 转 -webkit-transform
 */
export function beHyphenize(str) {
    return str.replace(/([A-Z])g/, "-$1").toLowerCase()
}
/**
 * 首字母大写
 */
export function beFirstToUpper() {
    //  匹配到首字符后 转换成大写
    return str.replace(/\b(\w)|\s(\w)/g, s => {
        return s.toUpperCase()        
    })
}