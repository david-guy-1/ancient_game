
var seenSeeds = new Set()

export function to_base_n(number, base) {
    if (number < 0) {
        throw "error";
    }
    if (number < base) {
        return [number];
    }
    else {
        var x = to_base_n(Math.floor(number / base), base);
        x.push(number % base);
        return x;
    }
}
export function convert(m) {
    if (m < 0) {
        m = (2 ** 32) + m;
    }
    return m;
}
export function or(a, b) {
    return convert(a | b);
}
export function and(a, b) {
    return convert(a & b);
}
export function xor(a, b) {
    return convert(a ^ b);
}
export function not(a) {
    return convert(~a);
}
export function rotate(number, amount) {
    var m = or(convert(number >>> amount), convert(number << (32 - amount)));
    return m;
}
export function to_32_bit(a, b, c, d) {
    return a * 256 * 256 * 256 + b * 256 * 256 + c * 256 + d;
}
export function add(x, y) {
    return (x + y) % (2 ** 32);
}
export function add_zeroes(x) {
    if (x.length >= 8) {
        return x;
    }
    var m = [0];
    while (m.length + x.length != 8) {
        m.push(0);
    }
    return m.concat(x);
}
var rounds = 64;
export function sha256_core(m) {
    var len = to_base_n(m.length * 8, 256);
    m.push(128);
    //length is 448 (mod 512), but divide by 8, so it's 56 (mod 64)
    while (m.length % 64 != 56) {
        m.push(0);
    }
    while (m.length % 64 + len.length != 64) {
        m.push(0);
    }
    // convert length to base 256
    m = m.concat(len);
    // round constants
    var k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var current_chunk = 0;
    var total_chunks = m.length / 64;
    // hash values
    var h0 = 0x6a09e667;
    var h1 = 0xbb67ae85;
    var h2 = 0x3c6ef372;
    var h3 = 0xa54ff53a;
    var h4 = 0x510e527f;
    var h5 = 0x9b05688c;
    var h6 = 0x1f83d9ab;
    var h7 = 0x5be0cd19;
    while (current_chunk < total_chunks) {
        var w = [];
        // copy first 16 words
        for (var i = 0; i < 16; i++) {
            w.push(to_32_bit(m[64 * current_chunk + 4 * i + 0], m[64 * current_chunk + 4 * i + 1], m[64 * current_chunk + 4 * i + 2], m[64 * current_chunk + 4 * i + 3]));
        }
        // expand to rest of them
        for (var i = 16; i <= rounds - 1; i++) {
            var s0 = xor(rotate(w[i - 15], 7), xor(rotate(w[i - 15], 18), w[i - 15] >>> 3));
            var s1 = xor(rotate(w[i - 2], 17), xor(rotate(w[i - 2], 19), w[i - 2] >>> 10));
            w.push((w[i - 16] + s0 + w[i - 7] + s1) % (2 ** 32));
        }
        var a = h0;
        var b = h1;
        var c = h2;
        var d = h3;
        var e = h4;
        var f = h5;
        var g = h6;
        var h = h7;
        //mainloop
        for (var i = 0; i <= rounds - 1; i++) {
            var s1 = xor(rotate(e, 6), xor(rotate(e, 11), rotate(e, 25)));
            var ch = xor(and(e, f), and(not(e), g));
            var temp1 = (h + s1 + ch + k[i] + w[i]) % 2 ** 32;
            var s0 = xor(rotate(a, 2), xor(rotate(a, 13), rotate(a, 22)));
            var maj = xor(xor(and(a, b), and(a, c)), and(b, c));
            var temp2 = (s0 + maj) % (2 ** 32);
            h = g;
            g = f;
            f = e;
            e = (d + temp1) % (2 ** 32);
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) % (2 ** 32);
        }
        h0 = (h0 + a) % (2 ** 32);
        h1 = (h1 + b) % (2 ** 32);
        h2 = (h2 + c) % (2 ** 32);
        h3 = (h3 + d) % (2 ** 32);
        h4 = (h4 + e) % (2 ** 32);
        h5 = (h5 + f) % (2 ** 32);
        h6 = (h6 + g) % (2 ** 32);
        h7 = (h7 + h) % (2 ** 32);
        current_chunk += 1;
    }
    var x = add_zeroes(to_base_n(h0, 16));
    x = x.concat(add_zeroes(to_base_n(h1, 16)));
    x = x.concat(add_zeroes(to_base_n(h2, 16)));
    x = x.concat(add_zeroes(to_base_n(h3, 16)));
    x = x.concat(add_zeroes(to_base_n(h4, 16)));
    x = x.concat(add_zeroes(to_base_n(h5, 16)));
    x = x.concat(add_zeroes(to_base_n(h6, 16)));
    x = x.concat(add_zeroes(to_base_n(h7, 16)));
    return x;
}
export function string_to_bytes(m) {
    m = m.toString();
    var s = [];
    for (var i = 0; i < m.length; i++) {
        s.push(m.charCodeAt(i));
    }
    return s;
}
export function sha256(m) {
    var x = sha256_core(string_to_bytes(m));
    var s = "";
    for (var i = 0; i < x.length; i++) {
        s += "0123456789abcdef"[x[i]];
    }
    return s;
}
var seenSeeds = new Set()
export function get_number(seed) {
	//console.log(seed);
	if(seenSeeds.has(seed) && seed.indexOf("determiner") == -1){ 
	// determiners (deciding if we can put items there without being in the same place as a block) 
	// is supposed to be called multiple times.
		throw new Error("seen this seed" + " " + seed);
	}
	seenSeeds.add(seed);
    //extract first 12 digits and use it as a number
    var lst = sha256_core(string_to_bytes(seed));
    var s = lst[0];
    for (var i = 1; i < 12; i++) {
        s = 16 * s;
        s += lst[i];
    }
    return s;
}
export function randint(low, high, seed) {
    //returns a number from [low, high)
    if (high < low) {
        throw "high smaller than low";
    }
    return get_number(seed) % (high - low) + low;
}

export function random(seed) {
    //returns a number from [0, 1)
    return get_number(seed) / 2 ** 48;
}
export function choice(list, seed) {
    if (list instanceof Set) {
        list = [...list];
    }
    if (list.length == 0) {
        throw "choice with empty list";
    }
    return list[randint(0, list.length, seed)];
}
// list utilities
export function point_on_circle(distance, seed) {
    var angle = random(seed) * 2 * Math.PI;
    return ([Math.floor(distance * Math.cos(angle)), Math.floor(distance * Math.sin(angle))]);
}

export function reset_(){
	seenSeeds.clear();
}

const factorials = [1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800]
function factorial(n){
		if(n < 0){
			throw new Error("factorial of negative");
		}
		else if(n < 11){
			return factorials[n];
		}else{
			return n * factorial(n-1);
		}
}

export function shuffle(lst, seed){
	var lst2 = Array.from(lst);
	var output = [];
	var counter = randint(0, factorial(lst2.length), seed);
	while(lst2.length >0){
		var count = 0;
		var nM1fact= factorial(lst2.length-1)
		while(counter >= nM1fact){
			count += 1;
			counter -= nM1fact;
		}
		output.push(lst2.splice(count, 1)[0])
	
	}
	return output;
}