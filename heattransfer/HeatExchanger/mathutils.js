//mathutils.js
//2019-12-25


/// <summary>
/// Поиск значения x функции у = f(x) = 0, методом деления отрезка пополам
/// </summary>
/// <param name="_imf">функция y=f(x)</param>
/// <param name="xa">мин значени x </param>
/// <param name="xb">мfrc значени x</param>
/// <param name="Epsilon">абсолютная точность, Epsilon < (xb-xa)</param>
/// <returns>x(y=0)</returns>
function sprintf() {
    var args = arguments,
    string = args[0],
    i = 1;
    return string.replace(/%((%)|s|d)/g, function (m) {
        // m is the matched format, e.g. %s, %d
        var val = null;
        if (m[2]) {
            val = m[2];
        } else {
            val = args[i];
            // A switch statement so that the formatter can be extended. Default is %s
            switch (m) {
                case '%d':
                    val = parseFloat(val);
                    if (isNaN(val)) {
                        val = 0;
                    }
                    break;
            }
            i++;
        }
        return val;
    });
}
        function HalfSegmentCalc(_imf,  xa,  xb,  Epsilon)
        {

            var ya;
            var yb;
            var yc, xc;
			var i_stop = 1000000;
			if (_imf == null || _imf == 0)
            {
				throw new Error("Нет функции.");
				return 0;
			}

            do
            {
				i_stop = i_stop - 1;
				if(i_stop <= 0)
				{
					throw new Error("Превышено количество шагов поиска решения.");
					return 0;
				}
				let xn = (xa + xb) / 2;
                ya = _imf.MainFunc(xa);
                yb = _imf.MainFunc(xb);
                //Trace.WriteLine(
                //    "A ("+xa.ToString("E3")+")="+ya.ToString("E3")
                //    +", B ("+xb.ToString("E3")+") = "+yb.ToString("E3")
                //    );

                if (Math.abs(xb - xa) < Epsilon)
                    return xn;

                if (ya * yb > 0)
                {
                    ya = _imf.MainFunc(xa);
                    yb = _imf.MainFunc(xb);
                    throw new Error(sprintf("Нет решения >> xa: %s, ya: %s, xb: %s, yb: %s", xa, ya, xb,  yb));
                }
                xc = xn;
                yc = _imf.MainFunc(xc);

                if (ya * yc < 0)
                {
                    xb = xc;
                }
                else
                {
                    xa = xc;
                }
            } while (true);
        }
