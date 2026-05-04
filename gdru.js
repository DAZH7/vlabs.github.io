 var res = [];
    var resIndex = 0;
	var Wspeed = 550;
	var Rimp = 0.07;
	var Rvt = 0.005;
	var ro = 1000;
  var p_g = 0;

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

    function onInit() {}

    function Resetresulttable() {
      res = [];
      resIndex = 0;
    }

	function New() {
		ClearReport();


		Resetresulttable();

		Wspeed = processNumber(txtW);
		Rimp = processNumber(txt_Rimp);
		Rvt = processNumber(txt_Rvt);
		ro = processNumber(txt_ro);
        p_g= processNumber(txtP_g);

		ClearReport("idInfo");
		AddParam0("idInfo", "ro", ro);
		AddParam0("idInfo", "Rimp", Rimp);
		AddParam0("idInfo", "Rvt", Rvt);
		AddParam0("idInfo", "Wspeed", Wspeed);
        AddParam0("idInfo", "p_g", p_g);

		AddRow(("№№"), "w", "p1", "p_g", "p_imp", "R_g","fi_l","fi_gl");
		Build();
	}
	function encode_utf8(s) {
		return unescape(encodeURIComponent(s));
	}
    function AddRow(i,w, p1, p_g, p_imp, r_g, fi_l, fi_gl ) {
      cells = [];
      cells[0] = i;
      cells[1] = w;
      cells[2] = p1;
      cells[3] = p_g;
      cells[4] = p_imp;
	  cells[5] = r_g;
      //cells[6] = fi_l;
      //cells[7] = fi_gl;

      res[resIndex] = MkRow(cells);
      resIndex++;
      return true;
    }

    

	function oninputslider_P_g()
	{
		try {txtP_g.value = slider_P_g.value;    }
		catch (e) { alert(e.message);  }
	}
	function oninputslider_P_1()
	{
		try {txtP1.value = slider_P_1.value;    }
		catch (e) { alert(e.message);  }
	}
	function oninputslider_w()
	{
		try {txtW.value = slider_w.value;    }
		catch (e) { alert(e.message);  }
	}
    function oninputslider_txtW() {
        try { slider_w.value = txtW.value; }
        catch (e) { alert(e.message); }
    }
  // использование Math.round() даст неравномерное распределение!
  function getRandomInt(min, max)
  {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

    function Register() {

		try
		{
			var p1 = processNumber(txtP1);

            var obj = new CalcObject();
			obj.p1 = p1;
			obj.p_g = p_g;
			obj.fi_l = 0.8+getRandomInt(5, 10)/100.0;
			obj.fi_gl = 0.4+getRandomInt(6, 11)/100.0;


			var Rg = 0;

			Rg = HalfSegmentCalc(obj, 0, Rimp, 1e-7);

			var p_imp1 = Calc_p_imp(Rg, obj.fi_l) + obj.p_g;
			var p_imp2 = Calc_p_imp(Rvt, obj.fi_gl) + obj.p1;

			let p_imp_mid =  (p_imp1 + p_imp2) *0.5;
			
			AddRow(resIndex, 
					Math.round10(Wspeed, -1), 
					Math.round10(p1, -1), 
					Math.round10(p_g, -1), 
					Math.round10(p_imp_mid, -1), 
					Math.round10(Rg, -4), 
					obj.fi_l,
					obj.fi_gl);

        }
		catch (e)
		{
			//alert(e.message);
            AddRow(resIndex, Wspeed, p1, p_g, "Авария", e.message,"","");
		}

		Build();
    }

	function CalcObject()
	{
		this.p1 = 0;
		this.p_g = 0;
		this.fi_l = 0;
		this.fi_gl = 0;

		this.MainFunc = function(r)
		{
			var p_imp1 = Calc_p_imp(r, this.fi_l);
			var p_imp2 = Calc_p_imp(Rvt, this.fi_gl);

			var dp1 = this.p1 - this.p_g;
			var dp2 = p_imp1 - p_imp2;

			return  dp1 - dp2;
		};
    }

	function Calc_p_imp(r_g, fi)
	{
		return 0.5*ro*Wspeed*Wspeed*fi*fi*(Rimp*Rimp - r_g*r_g);
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
	  if(x==null) return;
      x.innerHTML = x.innerHTML + html;
    }
    function AddText(text) {
      AddText0("id0", text);
    }

    function AddParam(pName, pValue) {
      AddParam0("id0", pName, pValue) ;
    }

    function AddText0(id, text) {
      var x = document.getElementById(id);
	  if(x==null) return;
      x.innerHTML = x.innerHTML + MkTag("p", text);
    }

    function AddParam0(id, pName, pValue) {
      var x = document.getElementById(id);
	  if(x==null) return;
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
