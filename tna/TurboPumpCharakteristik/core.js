///----------------------------------------------------------------------------------------------------
/// CORE TNA 2023-03-22
///----------------------------------------------------------------------------------------------------

var res = [];
var resIndex = 0;
var Atx = 98065;
var k_p_нвх = 0;
var k_p_нвых = 0;
var Wspeed1 = 1000;
var Wspeed2 = 2000;
var V2 = 10*1e-6;
var V1 = 459*1e-6;
var p_бар = 101325;

var ro = 1000;
var p1 = 37000;
var t1 = 13;

var Hnom = 354;
var w_i = 0;
var V_i = 0;
var f_n;
var f_v;
var kpd = 0.1;
var Cp = 4190;
var pg2 = 12740;
var k_p_твых;
var k_p_твх;
var d_кр_nozzle = 0.015;
var D_ср = 0.1;
var Rg = 287;
var k = 1.41;
var tg1 = 20;
var mgy1 = 0.57;
var mgy2 = 0.776;
var Fkr, betta_kr, Tg1;
///----------------------------------------------------------------------------------------------------

class Item {
    constructor(name, val) {
        this.name = name;
        this.v = val;
    }
}
///----------------------------------------------------------------------------------------------------

// Замыкание
(function() {
  /**
   * Корректировка округления десятичных дробей.
   *
   * @param {String}  type  Тип корректировки.
   * @param {Number}  value Число.
   * @param {Integer} exp   Показатель степени (десятичный логарифм основания корректировки).
   * @returns {Number} Скорректированное значение.
   */
  function decimalAdjust(type, value, exp) {
    // Если степень не определена, либо равна нулю...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Если значение не является числом, либо степень не является целым числом...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Сдвиг разрядов
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Обратный сдвиг
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Десятичное округление к ближайшему
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Десятичное округление вниз
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Десятичное округление вверх
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();
///----------------------------------------------------------------------------------------------------

function onInit()
{
    k_p_нвх = Atx;
    k_p_нвых = 16 * Atx / 100;
    k_p_твых = Atx;
    k_p_твх = 0.064 * Atx;

    slider_w.value = 1;
    document.getElementById("bttnRegister").disabled = true;
    Update_REGIM();
}
///----------------------------------------------------------------------------------------------------

function Resetresulttable() {
    res = [];
    resIndex = 0;
}
///----------------------------------------------------------------------------------------------------

function New() {
    ClearReport();

    Resetresulttable();

    ro = processNumber(txt_ro);
    p1 = processNumber(txtP1);
    t1 = processNumber(txt_t1);

    p_нвх = p1 / k_p_нвх;
    pg2_вых = pg2 / k_p_твых;
    
    Fkr = Math.PI * d_кр_nozzle * d_кр_nozzle / 4;
    betta_kr = Math.sqrt(Math.pow(2 / (k + 1), (k + 1) / (k - 1)));

    Tg1 = tg1 + 273;


    Update_REGIM();

    ClearReport("idInfo");
    AddParam0("idInfo", "ro - плотность воды, кг/кб.м", ro);
    AddParam0("idInfo", "p.вх - давление воды на входе, ат", Math.round10(p_нвх, -2));
    AddParam0("idInfo", "t1 - температура воды на входе, С", t1);
    AddParam0("idInfo", "pg2 - давление воздуха на выходе из турбины, at", Math.round10(pg2_вых, -3));
    AddParam0("idInfo", "tg1 - температура воздуха на входе, С", tg1);
    AddParam0("idInfo", "p_бар - давление воздуха барометрическое, бар", Math.round10(p_бар/1e5, -4));
    
    AddRow("№", "f.n, Гц", "f.v, Гц", "p.вх, ат", "p.вых, дел", "t_вх, С", "t.вых, С", "pg1, дел");
    Build();

    document.getElementById("bttnRegister").disabled = false;
}
///----------------------------------------------------------------------------------------------------

function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}
///----------------------------------------------------------------------------------------------------

function AddRow(i, fn, fv, p01, p02, t01, t02, pg1) {
    cells = [];
    cells[0] = i;
    cells[1] = fn;
    cells[2] = fv;
    cells[3] = p01;
    cells[4] = p02;
    cells[5] = t01;
    cells[6] = t02;
    cells[7] = pg1;

    res[resIndex] = MkRow(cells);
    resIndex++;
    return true;
}
///----------------------------------------------------------------------------------------------------

function oninputslider_P1() {
    try { txtP1.value = slider_P_1.value; }
    catch (e) { alert(e.message); }
}
function oninputslider_txtP1() {
    try { slider_P_1.value = txtP1.value; }
    catch (e) { alert(e.message); }
}
///----------------------------------------------------------------------------------------------------

function Update_REGIM() {
    try {
        var khi = slider_w.value / 100.0;

        w_i = khi * (Wspeed2 - Wspeed1) + Wspeed1;
        V_i = khi * (V2 - V1) + V1;

        f_n = w_i / Math.PI;
        f_v = V_i * 1e6;

        txtW.value = Math.round10(f_n, -1);
        txt_V1.value = Math.round10(f_v, -1);
    }
    catch (e) {
        alert(e.message);
    }
}
///----------------------------------------------------------------------------------------------------

function oninputslider_w() {
    Update_REGIM();
}

///----------------------------------------------------------------------------------------------------

  // использование Math.round() даст неравномерное распределение!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
///----------------------------------------------------------------------------------------------------

    function Register() {

		try
        {
            //ro = processNumber(txt_ro);
            //p1 = processNumber(txtP1);
            //t1 = processNumber(txt_t1);

            var H = Hnom * Math.pow(w_i / Wspeed1, 2) - V_i * 1e5;
            var p2 = H * ro + p1;
            var p_нвых = p2 / k_p_нвых;
            var p_нвх = p1 / k_p_нвх;
            var Np = ro * V_i * H;
            var Nn = Np / kpd;
            var Npot = Nn - Np;
            var dt = Npot / (ro * V_i * Cp);
            var t2 = t1 + dt;

            var mg = line_get_y(w_i, Wspeed1, Wspeed2, mgy1, mgy2);
            var pg1 = mg * Math.sqrt(Rg * Tg1) / (0.95 * Fkr * betta_kr) - p_бар;
            var pg1_твх = pg1 / k_p_твх;

            //i, fn, fv, p1, p2, t1, t2,pg1_твх
			AddRow(resIndex, 
                Math.round10(f_n, -1),
                Math.round10(f_v, -1),
                Math.round10(p_нвх, -2),
                Math.round10(p_нвых, -2),
                Math.round10(t1, -2),
                Math.round10(t2, -2),
                Math.round10(pg1_твх, -2),
            );

        }
		catch (e)
		{
            AddRow(resIndex, f_n, f_v, p_нвых, "Авария", e.message,"","");
		}

		Build();
    }


///----------------------------------------------------------------------------------------------------

    function Build() {
      var tbl = MkTbl(res);
      InsertH(tbl);

}
///----------------------------------------------------------------------------------------------------

function processNumber(inputField) {
    //return inputField.value;

    try {
        var inpVal = parseFloat(inputField.value, 10);
        if (isNaN(inpVal)) {
            var msg = "Please enter a number only.";
            var err = new Error(msg);
            if (!err.message) {
                err.message = msg;
            }
            throw err;
        }
        return inpVal;
    } catch (e) {
        alert(e.message);
        inputField.focus();
        inputField.select();
    }
    /**/
}
 ///----------------------------------------------------------------------------------------------------
   function InsertT(text) {
      InsertH(MkTag("p", text));
    }
///----------------------------------------------------------------------------------------------------
    function InsertH(text) {
      var x = document.getElementById("id0");
      x.innerHTML = text;
    }
///----------------------------------------------------------------------------------------------------

    function MkRow(cells) {
      var tbl = "";
      for (var i = 0; i < cells.length; i++) {
        tbl = tbl + MkTag("td", cells[i]);
      }

      return MkTag("tr", tbl);
    }

///----------------------------------------------------------------------------------------------------

    function MkTbl(trows) {
      var tbl = "";
      for (var i = 0; i < trows.length; i++) {
        tbl = tbl + trows[i];
      }
      return MkTag2("table", tbl, "border=1 BORDERCOLOR=BLACK ");
    }

///----------------------------------------------------------------------------------------------------
    function MkTag(tag, text) {
      return MkTag2(tag, text, "");
    }
///----------------------------------------------------------------------------------------------------
    function MkTag2(tag, text, atrbs) {
      var ret = "<" + tag + " " + atrbs + " >" + text + "</" + tag + ">";
      return ret;
    }
///----------------------------------------------------------------------------------------------------

    function AddReport(html) {
      AddReport("id0", html);
    }
///----------------------------------------------------------------------------------------------------
    function AddReport(id, html) {
      var x = document.getElementById(id);
	  if(x==null) return;
      x.innerHTML = x.innerHTML + html;
    }
///----------------------------------------------------------------------------------------------------
    function AddText(text) {
      AddText0("id0", text);
    }
///----------------------------------------------------------------------------------------------------
    function AddParam(pName, pValue) {
      AddParam0("id0", pName, pValue) ;
    }
///----------------------------------------------------------------------------------------------------
    function AddText0(id, text) {
      var x = document.getElementById(id);
	  if(x==null) return;
      x.innerHTML = x.innerHTML + MkTag("p", text);
    }
///----------------------------------------------------------------------------------------------------
    function AddParam0(id, pName, pValue) {
      var x = document.getElementById(id);
	  if(x==null) return;
      x.innerHTML = x.innerHTML + MkTag("p", pName + ": " + pValue);
	  return x.innerHTML;
    }
///----------------------------------------------------------------------------------------------------
	function ClearReport() {
      ClearReport("id0");
    }
///----------------------------------------------------------------------------------------------------
	function ClearReport(id) {
	    var x = document.getElementById(id);
	    if (x == null) return;
	    x.innerHTML = "";
	}
///----------------------------------------------------------------------------------------------------
///-- линейная интерполяция
function line_get_y(x, x1, x2, y1, y2) {

    return (y2 - y1)*(x - x1) / (x2 - x1)  + y1;
}
///----------------------------------------------------------------------------------------------------
///----------------------------------------------------------------------------------------------------
///----------------------------------------------------------------------------------------------------
