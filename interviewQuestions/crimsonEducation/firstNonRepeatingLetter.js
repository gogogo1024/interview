//找出第一个不重复的字符，大小写不区分，但是需要返回原始字符
function firstNonRepeatingLetter(str) {
    {
        if (!str) {
            return '';
        }
        if (str.length === 0) {
            return str;
        }
        const len = str.length;
        // 存储256的字符的计数
        const initArray = Array(256).fill(-1);
        let originalArray = Array.from(str.split(''));
        const strArray = str.toLowerCase().split('');
      
        for (let i = 0; i < len; i++) {
            if (initArray[strArray[i].charCodeAt()] === -1) {
                initArray[strArray[i].charCodeAt()] = i;
            } else {
                initArray[strArray[i].charCodeAt()] = -2;
            }
        }
        let res = Number.MAX_VALUE;
        for (let index = 0; index < 256; index++) {
            if (initArray[index] >= 0) {
                res = Math.min(res, initArray[index]);
            }
        }
        if (res === Number.MAX_VALUE) {
            return '';
        }
        return  originalArray[res];

    }
}
const rest = firstNonRepeatingLetter('sTreSS');
console.log(rest);