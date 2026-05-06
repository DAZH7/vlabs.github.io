
//------------------------------------------------------------------
// ЛАБОРАТОРНАЯ РАБОТА.
// ИССЛЕДОВАНИЕ РАБОТЫ ТЕПЛООБМЕННОГО АППАРАТА ПРИ ИМИТАЦИОННОМ МОДЕЛИРОВАНИИ
//
// codecore.js     2024-05-02+
//
// copyright, www.sibsau.ru, d_zhuikov@sibsau.ru, 2024
//------------------------------------------------------------------


const Atm_KgsPerSqM = 10331.9058;
const KgsPerSqM = 9.807;
const TK = 273.15;
const TRUE = 1;
const FALSE = 1;
var res = [];
var resIndex = 0;
var txt_U = 0;
var idTypeFlow1 = 0;
var idTypeFlow2 = 0;
var fShowTimeer = null;
var Q_g = 0;
var Q_x = 0;
var FlowDirection = 0;
var dPg_Min = 50;
var dPg_Max = 7000;
var dPx_Min = 75;
var dPx_Max = 6500;
var eTg_Max = 34;
var eTg_Min = 1;
var eTx_Max = 7;
var eTx_Min = 1;
let m_D1 = 0.022;
let m_D2 = 0.024;
let m_D3 = 0.04;
let m_Dl = 1.0;
let m_D11 = 0.022;
let m_D21 = 0.024;
let m_T = 0.024;
let m_iType = 0;
let m_IsAnti = 0;
const m_D2rng = [ 8.0e-003, 2.4e-002];
const m_D1rng = [6.e-003, 2.2e-002];
const m_D3rng = [1.e-002, 4.e-002];
const m_Dlrng = [0.3, 5.0];
const m_D11rng = [5.3e-003, 2.2e-002];
const m_D21rng = [7.e-003, 2.4e-002];
// Замыкание
(function () {
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
        Math.round10 = function (value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Десятичное округление вниз
    if (!Math.floor10) {
        Math.floor10 = function (value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Десятичное округление вверх
    if (!Math.ceil10) {
        Math.ceil10 = function (value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();

function onInit()
{

}

function Resetresulttable() {
    res = [];
    resIndex = 0;
}

function New() {
    try {
        ClearReport();

        Resetresulttable();

        m_D1 = processNumber(editbox_D1) / 1000.0;
        m_D2 = processNumber(editbox_D2) / 1000.0;
        m_D3 = processNumber(editbox_D3) / 1000.0;
        m_Dl = processNumber(editbox_L) / 1000.0;

        if (m_D1 <= 0) { alert("Ошибка исходных данных: D1 <= 0 ."); return; }
        if (m_D2 <= m_D1) {alert("Ошибка исходных данных: D2 <= D1.");return;}
        if (m_D3 <= m_D2) { alert("Ошибка исходных данных: D3 <= D2."); return; }
        if (m_Dl <= 0) { alert("Ошибка исходных данных: L <= 0."); return; }

        idTypeFlow1 = 0;// selectorTypeFlow1.value;
        let nameTypeFlow1 = "В О З Д У Х";// selectorTypeFlow1.options[idTypeFlow1].innerHTML;
        idTypeFlow2 = 0;// selectorTypeFlow1.value;
        let nameTypeFlow2 = "В О З Д У Х";// selectorTypeFlow2.options[idTypeFlow2].innerHTML;

        FlowDirection = 0;// "П Р Я М О Т О К";// selectorFlowDirection.value;
        let nameFlowDirection = "П Р Я М О Т О К"; //selectorFlowDirection.options[FlowDirection].innerHTML;

        ClearReport("idInfo");
        AddParam0("idInfo", "Теплоноситель Горячий", nameTypeFlow1);
        AddParam0("idInfo", "Теплоноситель Холодный", nameTypeFlow2);
        AddParam0("idInfo", "СХЕМА ТЕЧЕНИЯ", nameFlowDirection);
        AddParam0("idInfo", "Диаметр внутрениий D1, м", m_D1);
        AddParam0("idInfo", "Диаметр внутрениий D2, м", m_D2);
        AddParam0("idInfo", "Диаметр наружный D3, м", m_D3);
        AddParam0("idInfo", "Длина теплообменника L, м", m_Dl);

        //i, _Pg, _dPg, _Px, _dPx,  _Tg1, _Tg2, _Tx1, _Tx2
        AddRow("№", "Pг", "dPг", "Px", "dPx", "Eг1", "Eг2", "Eх1", "Eх2");
        Build();

        let element = document.getElementById("bttnGetValues");
        element.removeAttribute("hidden");

        fShowTimeer = setInterval(Calculate, 1000);
    }
    catch (e) {

        alert(e.message);
        //AddRow(resIndex, e.message, "", "", "", "", "", "", "", "", "");
    }


}
function Calculate() {

    let vdP_x = slider_P_x.value;
    let vdP_g = slider_P_g.value;
    let vT_g = slider_Q_g.value;
    let vT_x = slider_Q_x.value;

    let dP_x = (dPx_Max - dPx_Min) * vdP_x / 100 + dPx_Min;
    let dP_g = (dPg_Max - dPg_Min) * vdP_g / 100 + dPg_Min;
    let Eg1 = (eTg_Max - eTg_Min) * vT_g / 100 + eTg_Min;
    let Ex1 = (eTx_Max - eTx_Min) * vT_x / 100 + eTx_Min;

    let Tg = TK + Eg1 / 0.0695;
    let Tx = TK + Ex1 / 0.0695;

    P_x = GetPX(dP_x);
    P_g = GetPG(dP_g);

    let d1 =  m_D1;
	let d2 =  m_D2;
	let d3 =  m_D3;
	let dl =  m_Dl;
    let d11 = m_D1;
    let d21 = m_D2;
	let t =  m_T;
    let IT = 0;// selectorFlowDirection.value;

    if (idTypeFlow1 == 0 && idTypeFlow2 == 0)
        m_iType = 0;
    else if (idTypeFlow1 == 1 && idTypeFlow2 == 0)
        m_iType = 1;
    else if (idTypeFlow1 == 0 && idTypeFlow2 == 1)
        m_iType = 2;
    else if (idTypeFlow1 == 1 && idTypeFlow2 == 1)
        m_iType = 3;

	let Nx = ( m_iType & 2) ? TRUE : FALSE;
	let Ng = ( m_iType & 1) ? TRUE : FALSE;

    let R = 29.3;

    let Gg = (Ng) ? 0.0723 * Math.sqrt(dP_g) : 0.000472 * Math.sqrt(dP_g * dP_g / (R * Tg));
    let Gx = (Nx) ? 0.0723 * Math.sqrt(dP_x) : 0.000472 * Math.sqrt(dP_x * dP_x / (R * Tx));

    let Tg1 = Tg;
    let Tx1 = Tx;
	let Tg2 = Tg1;
    let Tx2 = Tx1;
    let i = 0;

    while (i < 2)
    {
        let Tgs = (Tg1 + Tg2) / 2.0;
        let Txs = (Tx1 + Tx2) / 2.0;

        let CPg, CLg, CMg;
        if (Ng)//water
        {
            CPg = 4179.0 + 0.01 * Math.pow((Tgs - 313.15), 2);
			let Pr = Tgs / TK;
            CLg = (-922.47 + 2839.5 * Pr - 1800.7 * Math.pow(Pr, 2) + 525.77 * Math.pow(Pr, 3) - 73.44 * Math.pow(Pr, 4)) / 1000.0;
            CMg = 241.4 * Math.pow(10.0, (247.8 / (Tgs - 140.0) - 7.0));
        }
        else//air
        {
            CPg = 988.0 + 19.9 * Tgs / 273.0;
            CLg = (6.11 + 18.85 * (Tgs / 273.0)) / 1E3;
            CMg = (0.74 + 1.058 * (Tgs / 273.0)) / 1E5;
        }
		
		let CPx, CLx, CMx;
        if (Nx)//water
        {
            CPx = 4179.0 + 0.01 * Math.pow((Txs - 313.15), 2);
			let Pr = Txs / TK;
            CLx = (-922.47 + 2839.5 * Pr - 1800.7 * Math.pow(Pr, 2) + 525.77 * Math.pow(Pr, 3) - 73.44 * Math.pow(Pr, 4)) / 1000.0;
            CMx = 241.4 * Math.pow(10.0, (247.8 / (Txs - 140.0) - 7.0));
        }
        else//air
        {
            CPx = 988.0 + 19.9 * Txs / 273.0;
            CLx = (6.11 + 18.85 * (Txs / 273.0)) / 1E3;
            CMx = (0.74 + 1.058 * (Txs / 273.0)) / 1E6;
        }
	
		let CMgg = CMg;
		let CMxx = CMx;
		let CLgg = CLg;
		let CLxx = CLx;
		let Ggg = Gg;
		let Gxx = Gx;
		let CPgg = CPg;
		let CPxx = CPx;

        if (CMg < 0)
            CMgg = 1.0;
        if (CMx < 0)
            CMxx = 1.0;
        if (CLg < 0)
            CLgg = 1.0;
        if (CLx < 0)
            CLxx = 1.0;
        if (Gg < 0)
            Ggg = 1.0;
        if (Gx < 0)
            Gxx = 1.0;
        if (CPg < 0)
            CPgg = 1.0;
        if (CPx < 0)
            CPxx = 1.0;
			
		let ALg = 0.0282 * Math.pow(CLgg, 0.6) * Math.pow(Ggg, 0.8) * Math.pow(CPgg, 0.4) / (Math.pow(d1, 1.8) * Math.pow(CMgg, 0.4));
		let ALx = 0.0245 * Math.pow(CLxx, 0.6) * Math.pow(Gxx, 0.8) * Math.pow(CPxx, 0.4) / ((d3 - d2) * Math.pow(d3 - d2, 0.8) * Math.pow(CMxx, 0.4));
		
		let Rr = 4.0 * Gg / (3.14 * d1 * CMg);
		let Aaa1 = -18.2 * Math.pow((1.0 - d11 / d1), 1.13) / Math.pow(t / d1, 0.326);

        if (Aaa1 < 0 && Aaa1 > -5E-3)
            Aaa1 = 0;
		let Rr1;
        if (d1 != d11)
            Rr1 = (1.0 + (Math.log10(Rr) - 4.6) / 35.0) * (3.0 - 2.0 * Math.exp(Aaa1));
        else
            Rr1 = 1.0;
        ALg *= Rr1;

        Aaa1 = -17.9 * (d2 - d21) / (d3 - d2);
        if (Aaa1 < 0 && Aaa1 > -5E-3)
            Aaa1 = 0.0;
        if (d1 != d11)
            Rr1 = 1.0 + 0.64 * (1.0 - Math.exp(Aaa1)) * (1.0 - 274.0 * t / (d3 - d2));
        else
            Rr1 = 1.0;
        ALx *= Rr1;
			
        let Ck = 1.0 / (1.0 / ALg + d1 * Math.log(d2 / d1) / 40.0 + d1 / (ALx * d2));
		let f = 3.14 * d1 * dl;
		
		let Pr8, Pr;
        if (IT) {
            Pr8 = -Ck * f * (1.0 - Gg * CPg / (Gx * CPx)) / (Gg * CPg);
            if (Pr8 < 0 && Pr8 > -5E-3)
                Pr8 = 0;
            Pr = Math.exp(Pr8);
            Tg2 = Tg1 - (Tg1 - Tx1) * (1.0 - Pr) / (1.0 - Gg * CPg * Pr / (Gx * CPx));
            Tx2 = Tx1 + (Tg1 - Tx1) * (1.0 - Pr) / (Gx * CPx / (Gg * CPg) - Pr);
        }
        else {
            Pr8 = -Ck * f * (1.0 + Gg * CPg / (Gx * CPx)) / (Gg * CPg);
            if (Pr8 < 0 && Pr8 > -5E-3)
                Pr8 = 0;
            Pr = Math.exp(Pr8);
            Tg2 = Tg1 - (Tg1 - Tx1) * (1.0 - Pr) / (1.0 + Gg * CPg / (Gx * CPx));
            Tx2 = Tx1 + (Tg1 - Tx1) * (1.0 - Pr) / (1.0 + Gx * CPx / (Gg * CPg));
        }
        i++;
    }

    _Tg0 = Eg1;
    _Tg1 = Eg1;
    _Tg2 = 0.0695 * (Tg2 - TK);
    _Tx0 = Ex1;
    _Tx1 = Ex1;
    _Tx2 = 0.0695 * (Tx2 - TK);

    _Pg = P_g;
    _dPg = dP_g;
    _Px = P_x;
    _dPx = dP_x;

    //E_Tg0.value = getRandomT(_Tg0, 2);//_Tg0;// 
    E_Tg1.value = getRandomT(_Tg1, 2);//_Tg0;// 
    E_Tg2.value = getRandomT(_Tg2, 6);//_Tg2;// 
//    E_Tx0.value = getRandomT(_Tx0, 2);//_Tx0;// 
    E_Tx1.value = getRandomT(_Tx1, 2);//_Tx0;// E_Tx0.value;
    E_Tx2.value = getRandomT(_Tx2, 6);//_Tx2;// 
    V_Pg.value = getRandomT(_Pg, 3);//_Pg;// 
    V_dPg.value = getRandomT(_dPg, 3);//_dPg;// 
    V_Px.value = getRandomT(_Px, 3);//_Px;// 
    V_dPx.value = getRandomT(_dPx, 3);//_dPx;// 
}

function Register() {

    try {

        Calculate();

        //var _Tg0 = processNumber(E_Tg0);
        var _Tg1 = processNumber(E_Tg1);
        var _Tg2 = processNumber(E_Tg2);
        //var _Tx0 = processNumber(E_Tx0);
        var _Tx1 = processNumber(E_Tx1);
        var _Tx2 = processNumber(E_Tx2);
        var _Pg = processNumber(V_Pg);
        var _dPg = processNumber(V_dPg);
        var _Px = processNumber(V_Px);
        var _dPx = processNumber(V_dPx);

        //_Tg0 = new Intl.NumberFormat('ru-RU',).format(_Tg0);
        _Tg1 = new Intl.NumberFormat('ru-RU',).format(_Tg1);
        _Tg2 = new Intl.NumberFormat('ru-RU',).format(_Tg2);
        //_Tx0 = new Intl.NumberFormat('ru-RU',).format(_Tx0);
        _Tx1 = new Intl.NumberFormat('ru-RU',).format(_Tx1);
        _Tx2 = new Intl.NumberFormat('ru-RU',).format(_Tx2);
        _Pg = new Intl.NumberFormat('ru-RU',).format(_Pg);
        _dPg = new Intl.NumberFormat('ru-RU',).format(_dPg);
        _Px = new Intl.NumberFormat('ru-RU',).format(_Px);
        _dPx = new Intl.NumberFormat('ru-RU',).format(_dPx);

        AddRow(resIndex, _Pg, _dPg, _Px, _dPx, _Tg1, _Tg2, _Tx1, _Tx2);

    }
    catch (e) {
        //alert(e.message);
        AddRow(resIndex, e.message, "", "", "", "", "", "", "", "", "");
    }

    Build();
}

function GetPG(dPG)
{
    if (dPG <= 50) { index = 17; return 10000; }
    if (dPG <= 100) { index = 15; return 20000; }
    if (dPG <= 200) { index = 13; return 25000; }
    if (dPG <= 600) { index = 11; return 35000; }
    if (dPG <= 1000) { index = 10; return 40000; }
    if (dPG <= 2000) { index = 8; return 45000; }
    if (dPG <= 3000) { index = 6; return 60000; }
    if (dPG <= 4000) { index = 4; return 80000; }
    if (dPG <= 6000) { index = 2; return 90000; }
    if (dPG <= 7000) { index = 0; return 100000; }

    index = 18;
    return 0;
}
function GetPX(dPX)
{
    if (dPX <= 75) { index = 15; return 15000; }
    if (dPX <= 150) { index = 14; return 25000; }
    if (dPX <= 400) { index = 12; return 30000; }
    if (dPX <= 800) { index = 11; return 40000; }
    if (dPX <= 1500) { index = 10; return 45000; }
    if (dPX <= 2500) { index = 8; return 50000; }
    if (dPX <= 3500) { index = 6; return 55000; }
    if (dPX <= 5000) { index = 4; return 70000; }
    if (dPX <= 5500) { index = 2; return 80000; }
    if (dPX <= 6500) { index = 0; return 90000; }

    index = 16;
    return 0;
}
function getRandomT(normval, percent) {

    let v_min = 1000 * normval * (1.0 - percent/100.); 
    let v_max = 1000 * normval * (1.0 + percent / 100.);
    return getRandomInt(v_min, v_max) / 1000;
}

function AddRow(i, _Pg, _dPg, _Px, _dPx,  _Tg1, _Tg2, _Tx1, _Tx2) {
    cells = [];
    cells[0] = i;
    cells[1] = _Pg;
    cells[2] = _dPg;
    cells[3] = _Px;
    cells[4] = _dPx;
    cells[5] = _Tg1;
    cells[6] = _Tg2;
    cells[7] = _Tx1;
    cells[8] = _Tx2;

    res[resIndex] = MkRow(cells);
    resIndex++;
    return true;
}

    

function oninputslider_P_g() {
    //try
    //{
    //    let u = slider_P_g.value;
    //    V_Pg.value = u; 
    //}
    //catch (e) {  }
}
function oninputslider_P_x() {
    //try {
    //    let u = slider_P_x.value;
    //    V_Px.value = u;
    //}
    //catch (e) { }
}
function oninputslider_Q_g() {
    try {
        Q_g = slider_Q_g.value;
    }
    catch (e) { }
}
function oninputslider_Q_x() {
    //try {
    //    Q_x = slider_Q_x.value;       
    //}
    //catch (e) { }
}
  // использование Math.round() даст неравномерное распределение!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function Build() {
    var tbl = MkTbl(res);
    InsertH(tbl);

}
    //--------------------
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
    //--------------------------------
function InsertT(text) {
    InsertH(MkTag("p", text));
}
    //--------------------------------
function InsertH(text) {
    var x = document.getElementById("id0");
    x.innerHTML = text;
}
    //--------------------------------

function MkRow(cells) {
    var tbl = "";
    for (var i = 0; i < cells.length; i++) {
        tbl = tbl + MkTag("td", cells[i]);
    }

    return MkTag("tr", tbl);
}

    //--------------------------------

function MkTbl(trows) {
    var tbl = "";
    for (var i = 0; i < trows.length; i++) {
        tbl = tbl + trows[i];
    }
    return MkTag2("table", tbl, "border=1 BORDERCOLOR=BLACK ");
}

    //--------------------------------
function MkTag(tag, text) {
    return MkTag2(tag, text, "");
}
    //--------------------------------
function MkTag2(tag, text, atrbs) {
    var ret = "<" + tag + " " + atrbs + " >" + text + "</" + tag + ">";
    return ret;
}

function AddReport(html) {
    AddReport("id0", html);
}
function AddReport(id, html) {
    var x = document.getElementById(id);
    if (x == null) return;
    x.innerHTML = x.innerHTML + html;
}
function AddText(text) {
    AddText0("id0", text);
}

function AddParam(pName, pValue) {
    AddParam0("id0", pName, pValue);
}

function AddText0(id, text) {
    var x = document.getElementById(id);
    if (x == null) return;
    x.innerHTML = x.innerHTML + MkTag("p", text);
}

function AddParam0(id, pName, pValue) {
    var x = document.getElementById(id);
    if (x == null) return;
    x.innerHTML = x.innerHTML + MkTag("p", pName + ": " + pValue);
    return x.innerHTML;
}

function ClearReport() {
    ClearReport("id0");
}
function ClearReport(id) {
    var x = document.getElementById(id);
    if (x == null) return;
    x.innerHTML = "";
}
