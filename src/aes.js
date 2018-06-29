'use strict';
//TODO: tratar el mensaje recibido propiamente
//TODO: KEYEXPANSION
//TODO: MIXCOLUMNS

//default key size: 128bits [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
//mesaage size: 128bits 
//default rounds 10
document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("result").innerHTML = "";
    document.getElementById("cipher").addEventListener("click", cifrar);
    document.getElementById("decipher").addEventListener("click", ()=>{
        document.getElementById("result").innerHTML = "decipher machine broke lol"
    });
});

    //default values: 
    //s-box:
const sBox =  [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67,
        0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59,
        0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7,
        0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1,
        0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05,
        0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83,
        0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29,
        0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b,
        0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa,
        0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c,
        0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc,
        0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
        0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19,
        0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee,
        0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49,
        0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
        0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4,
        0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6,
        0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70,
        0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9,
        0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e,
        0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1,
        0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0,
        0x54, 0xbb, 0x16]

const rCon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];
const conversiones = function(text){
    return{
        textToBytes: function() {
            let result = [];
            let i = 0;
            text = encodeURI(text);
            while(i < text.length){
                let c = text.charCodeAt(i++);
                //si es un signo %, los proximos 2 bytes seran un hex
                if(c === 37){
                    result.push(parseInt(text.substr(i,2), 16))
                    i+=2;
                } //de otra manera, cuenta como un byte
                else{
                    result.push(c);
                }
            }
            return result; //coercearray ???
        },
        textFromBytes: function(){
            const result = [];
            let i = 0;
            let bytes = text;
            
            while(i<bytes.length){
                let c = bytes[i];
    
                if(c < 128){
                    result.push(String.fromCharCode(c));
                    i++;
                }else if(c > 191 && c < 224){
                    result.push(String.fromCharCode(((c & 0x1f) << 6) | (bytes[i + 1] & 0x3f)));
                    i+=2;
                }else{
                    result.push(String.fromCharCode(((c & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f)));
                    i += 3;
                }
            }
    
            return result.join('');
        },

        hexToBytes: function(){
            let result = [];
            for(let i=0;i<text.length;i+=2){
                result.push(parseInt(text.substr(i,2),16));
            }
    
            return result;
        },

        hexFromBytes: function(){
            let bytes = text;
            const Hex = '0123456789abcdef';
            let result = [];
            for(let i=0;i<bytes.length;i++){
                let v = bytes[i];
                result.push(Hex[(v & 0xf0) >> 4] + Hex[v & 0x0f]);
            }
            return result.join('');
        }
    }
};

function cifrar(plainText, key){
    //hacemos el arreglo de estado
    state = makeArray(plainText);
    //pasar inputs a bytes 
    //KeyExpansion
    //addRoundKey
    for(i in 9){
        subBytes();
        shiftRows();
        mixColumns();
        addRoundKey();
    }
    let text = conversiones(document.getElementById("text").value).textToBytes();
    console.log("bytes: "+text);
    let textInHex = conversiones(text).hexFromBytes();
    console.log("hex: "+textInHex);
    //let textIn16 = makeArray(text);
    let state = makeState(text);
    console.log(state);
    let n = 0;
    // console.log(textIn16[n]);
    // console.log(sBox[textIn16[n]]);
    // console.log(textIn16);
}

//hacer arreglo: 
function makeArray(textInBytes){
    //hacer el texto de 16 bytes
    if(textInBytes.length > 16){
        textInBytes = textInBytes.substr(0,16);
    }else if(textInBytes.length < 16){
        while(textInBytes.length < 16){
            textInBytes.push(32);
        }
    }
    return textInBytes;
};

//funcion para acceder a los valores de sBox
function getSBoxValue(n){
    return sBox[n];
};


//funciones para acceder al valor de RCON
function getRconValue(n){
    return rCon[n];
};

//Esto sirve para el momento de rotar en shiftColumns
function rotate(word){
    //todo menos el primer char + el ultimo char
    //ej > david > avidd
    return word.substr(1, word.length) + word.substr(0,1);
}

//make matrizEstado
// function makeState(textInBytes){
//     let mState = [];
//     if(textInBytes.length > 16){
//         textInBytes = textInBytes.substr(0,16);
//     }else if(textInBytes < 16){
//         textInBytes.push(32);
//     }
//     console.log("state: "+textInBytes);
//     for(let i = 0; i<textInBytes.length;i++){
//         let word = [];
//         for(let j=0;j<3;j++){
//             word.push(textInBytes[j]);
//         }
//         mState.push(word);
//     }
//     return mState;
// }


//metodo de generacion de llaves 
//operaciones que se hacen: 
//se toma la ultima palabra, se rota el byte, primero a ultimo
//se hace subbytes
//se hace XOR con la primera palabra
//despues se hace XOR con RCON > la primera palabra
//despues se hace xor con las otras palabras, 
//primera con segunda, segunda con tercera, tercera con cuarta
//esto para tener 10+1 claves (inicial + 10 subclaves)
//metodos basicos para la generacion de llaves:

function keyOperations(word, iteration){
    //se rota la llave
    word = rotate(word)
    //se aplica subBytes con S-BOX
    for(n in 4){
        word[n] = getSBoxValue(word[n]);

    };
    //se hace XOR con la primera palabra 
}

//funcion de expansion key
function keyExpansion(key0){
return true;
};

function addRoundKey(state, roundKey){
    //se hace XOR
    for(i in 16){
        state[i] ^= roundKey[i]
    }
}

function subBytes(state){
    for(i in 16){
        state[i] = sBox[state[i]];
    }
}

function shiftRows(state){
    //tmp 
    //ejemplo: 
    // [0 4 8  12          [ 0  4 8 12]
    //  1 5 9  13            5 9 13 1
    //  2 6 10 14           10 14 2 6         
    //  3 7 11 15] =>       15 3 7 11
    temp = (16);
    temp[0] = state[0];
    temp[1] = state[5];
    temp[2] = state[10];
    temp[3] = state[15];

    temp[4] = state[4];
    temp[5] = state[9];
    temp[6] = state[14];
    temp[7] = state[3];

    temp[8] = state[8];
    temp[9] = state[13];
    temp[10] = state[2];
    temp[11] = state[7];
    
    temp[12] = state[12];
    temp[13] = state[1];
    temp[14] = state[6];
    temp[15] = state[11];

    //copiamos el array nuevo al state
    state = [...temp];
}

function mixColumns(state){

}

    



