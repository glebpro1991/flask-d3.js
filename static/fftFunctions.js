/* complex fast fourier transform and inverse from                */
/* https://rosettacode.org/wiki/Fast_Fourier_transform#JavaScript */
function cfft(amplitudes) {
    let N = amplitudes.length;
    if( N <= 1 )
        return amplitudes;

    let hN = N / 2;
    let even = [];
    let odd = [];
    even.length = hN;
    odd.length = hN;
    for(let i = 0; i < hN; ++i) {
        even[i] = amplitudes[i*2];
        odd[i] = amplitudes[i*2+1];
    }
    even = cfft(even);
    odd = cfft(odd);

    let a = -2 * Math.PI;
    for(let k = 0; k < hN; ++k) {
        if(!(even[k] instanceof Complex))
            even[k] = new Complex(even[k], 0);
        if(!(odd[k] instanceof Complex))
            odd[k] = new Complex(odd[k], 0);
        let p = k / N;
        let t = new Complex(0, a * p);
        t.cexp(t).mul(odd[k], t);
        amplitudes[k] = even[k].add(t, odd[k]);
        amplitudes[k + hN] = even[k].sub(t, even[k]);
    }
    return amplitudes;
}

/*
basic complex number arithmetic from
http://rosettacode.org/wiki/Fast_Fourier_transform#Scala
*/
function Complex(re, im) {
    this.re = re;
    this.im = im || 0.0;
}

Complex.prototype.add = function(other, dst) {
    dst.re = this.re + other.re;
    dst.im = this.im + other.im;
    return dst;
};
Complex.prototype.sub = function(other, dst) {
    dst.re = this.re - other.re;
    dst.im = this.im - other.im;
    return dst;
};
Complex.prototype.mul = function(other, dst) {
    //cache re in case dst === this
    let r = this.re * other.re - this.im * other.im;
    dst.im = this.re * other.im + this.im * other.re;
    dst.re = r;
    return dst;
};
Complex.prototype.cexp = function(dst) {
    let er = Math.exp(this.re);
    dst.re = er * Math.cos(this.im);
    dst.im = er * Math.sin(this.im);
    return dst;
};
Complex.prototype.log = function() {
    /*
    although 'It's just a matter of separating out the real and imaginary parts of jw.' is not a helpful quote
    the actual formula I found here and the rest was just fiddling / testing and comparing with correct results.
    http://cboard.cprogramming.com/c-programming/89116-how-implement-complex-exponential-functions-c.html#post637921
    */
    if( !this.re )
        console.log(this.im.toString()+'j');
    else if( this.im < 0 )
        console.log(this.re.toString()+this.im.toString()+'j');
    else
        console.log(this.re.toString()+'+'+this.im.toString()+'j');
}