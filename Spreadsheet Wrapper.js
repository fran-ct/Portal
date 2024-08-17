//Para SheetWrapper VARIABLES
var ssSheetId = "1g6IyvvVPxunJiA123C0vwKdyxxJZcDhJGlKlVgjaoh8"
var ssSheetName = "SPRINT"


var db = null

/**Para inicializar la "DB" hay que ejecutar la siguiente linea
 * db = startDB()
 */

function startDB (){
  if (db==null){
    startExcecution = new Date()
    console.log("# Preparando la db")
    const ss = SpreadsheetApp.openById(ssSheetId)
    let toReturn = {
      "sprint" : new SheetWrapper(ss.getSheetByName("SPRINT")),
      //"worklog" : new SheetWrapper(ss.getSheetByName("WORKLOG")),
      //"squad" : new SheetWrapper(ss.getSheetByName("SQUAD")),
      //"person" : new SheetWrapper(ss.getSheetByName("PERSON")),
      //"project" : new SheetWrapper(ss.getSheetByName("PROJECT")),
      "report" : new SheetWrapper(ss.getSheetByName("REPORT"))
    }
    console.log("# - db cargada OK")
    return toReturn
  }else{
    console.log("# - La db ya estaba cargada")
    return db
  }
}

//######################

class SheetWrapper {
  constructor(sheet) {
    console.log("- Creando tabla de: " + sheet.getSheetName())

    //system
    this.firstDataRow = 4
    
    //sheet
    this.sheet = sheet;
    this.spreadsheetId = this.sheet.getParent().getId()
    this.sheetRange = this.sheet.getRange(this.firstDataRow,1,sheet.getLastRow()-this.firstDataRow+1,sheet.getLastColumn());
    this.sheetData = this.sheetRange.getValues()

    //tools
    this.vars = this.loadVars()
    this.opc = this.loadOpc()
    this.titles = this.loadTitles()

    //tables
    this.dataTable = this.sheetRange.getValues()  

    //object
    this.data = this.arr2obj()
    this.dataRange = this.getDataRange(this.data)
    this.dataAux = null
    this.dataInyected = null
 
  }

//DEVUELVE UN NUEVO ARRAY SIN ELEMENTOS DUPLICADOS, NO AFECTA THIS.DATA
  removeDuplicates(data = this.data, key = 'id') {
    const seen = new Map();
    return data.filter(item => {
      const val = item[key];
      if (seen.has(val)) {
        return false;
      } else {
        seen.set(val, true);
        return true;
      }
    });
  }



  updateData(newData) {
    console.log("Comparando y actualizando objetos")
    var counter = 0

    let currentData = this.data;
    for (let i = 0; i < newData.length; i++) {
      let newRow = newData[i];
      let found = false;
      for (let j = 0; j < currentData.length; j++) {
        let currentRow = currentData[j]
        if (currentRow.id === newRow.id) { //aca esta la magia cuando compara ambos
          Object.keys(newRow).forEach((item)=>{
            if ( currentRow[item] != newRow[item] ){
              counter++
            }
          })
          currentRow = newRow;
          found = true;
          break;
        }
      }
      if (!found) {
        currentData.push(newRow);
        console.log("Se agrego una nueva linea con el id: "+newRow.id)
      }
    }
    
    this.data = currentData;
    console.log("Se actualizo this.data. Total de "+(counter)+" updates")

  }


  static opcBaseFormat() { 
    return `{
   "style":[
       [ "setHorizontalAlignment", "left" ], 
       [ "setNumberFormat", "0" ], 
       [ "setFontWeight", "normal" ]
   ], 
   "hideColumn": "false",
   "readOnly": "false", 
   "reference": "false",
   "foreignKeyOf": null
   }`;
  }

  static formatSheet(sheet) {
    // Set values for first row
    sheet.getRange("A1").setValue("id");
    sheet.getRange("B1").setValue("name");
    
    // Set background color for first and second row
    var blueBackground = "lightgrey";
    sheet.getRange("A1:Z1").setBackground(blueBackground);
    sheet.getRange("A2:Z2").setBackground(blueBackground);
    
    // Set JSON string for second row
    var jsonString = this.opcBaseFormat()
    sheet.getRange("A2:C2").setValue(jsonString);
    
    // Set formula and background color for third column
    //'=arrayformula(if(row(A3:A)=3;"ROW";if(B3:B="";"";row(A3:A))))'
    sheet.getRange("A3").setValue("ID");
    sheet.getRange("B3").setValue("NAME");
    sheet.getRange("A3:Z3").setBackground("#0298f7");
    sheet.getRange("A3:Z3").setFontWeight("bold");

    //Hide unusefull column and rows
    sheet.hideRows(1, 2)
  }

  //probar que pasa con la idea de meter aca los botones de la ui
  static onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('FUNCTIONS')
    .addItem('Actualizar todo', 'updateSprintsFromUI')
    .addToUi();
  }

  //ORDER= asc or desc.    //.   !!!!!!!!!!!!!!!!!!!!#################### REVISAAAAAARRRR #####################!!!!!!!!!!!!!!!!!!!!!!!!!
  sort(column, order = "desc") {
    if (this.vars.indexOf(column) === -1) {
        throw new Error("> The column " + column + " doesn't exist in this sheet");
    }
    if (order !== "asc" && order !== "desc") {
        throw new Error("> Invalid sort order. Must be 'asc' or 'desc'");
    }
    this.data.sort((a, b) => {
        let x = a[column];
        let y = b[column];
        if (order === "asc") {
            return x > y ? 1 : -1;
        } else {
            return x < y ? 1 : -1;
        }
    });
  }


  //criteria = [{ column: "age", value: 25, include: true } , { column: "name", value: /^J/, include: false, isRegex: true }]
  filter(criteria) {
      if (!Array.isArray(criteria)) {
          throw new Error("> Criteria must be an array");
      }
      // Iterate through the criteria array
      for (let i = 0; i < criteria.length; i++) {
          let column = criteria[i].column;
          let value = criteria[i].value;
          let include = criteria[i].include;
          let isRegex = criteria[i].isRegex || false;
          // Check if the column specified in the criteria exists in this.data
          if (this.vars.indexOf(column) === -1) {
              throw new Error("> The column " + column + " doesn't exist in this sheet");
          }
          // Iterate through this.data and filter based on the criteria
          this.data = this.data.filter(row => {
              let rowValue = row[column];
              if (isRegex) {
                  return include ? value.test(rowValue) : !value.test(rowValue);
              } else {
                  return include ? rowValue === value : rowValue !== value;
              }
          });
      }
  }


  //dado un id devuelve EL PRIMER resultado que encuentra
  getItemById(id) {
    for (var i = 0; i < this.data.length; i++) {
        if (this.data[i].id == id) {
            return this.data[i];
        }
    }
    throw new Error("> No data found with id " + id);
  }

  //dado el nombre de la columna (vars) se devuelve el array de la columna completa
  //RARA ESTA FUNCION POR LO DE HASOWNPROPERTY
  getColumnData(columnName) {
    if (!this.data[0].hasOwnProperty(columnName)) {
        throw new Error("> The column " + columnName + " doesn't exist in this sheet");
    }
    var columnData = [];
    for (var i = 0; i < this.data.length; i++) {
        columnData.push(this.data[i][columnName]);
    }
    return columnData;
  }

  //toma el obj pasado (default this.data) y devuelve el range de la hoja de calculo para ese obj
  getDataRange( dataArray = this.data , append = false ) {
    var row = this.firstDataRow
    if (append){ row = this.sheet.getLastRow()+1 }
    if (dataArray.length == null){
      var arrayLength = 1
    }else{
      var arrayLength = dataArray.length
    }
    let lastCol = this.vars.length;
    return this.sheet.getRange(row, 1, arrayLength, lastCol);
  }

  // Toma el valor de originalDataTable y lo carga en data
  regenData (){
    this.data = this.arr2obj()
  }

  // Se devuelve el objeto que tiene como clave cada valor distinto de la columna 
  // especificada y su valor es un arreglo con todos los objetos que tienen ese valor en la columna
  // ADVERTENCIA: no acepta que dataObject tenga un solo elemento en el array
  getObjGroupBy(key) {
    let result = {};
    for (let i = 0; i < this.data.length; i++) {
        let value = this.data[i][key];
        if (!result[value]) {
            result[value] = [];
        }
        result[value].push(this.data[i]);
    }
    return result;
  }

  getArrGroupBy(key) {
    //HACER ESTE METODO PARA QUE DEVUELVA [[KEY1,[LISTOFROWS]],[KEY2,[LISTOFROWS]]]
  }

  // toma el objeto y usa las keys para mathear con var y crear una tabla con la estructura compatible. Por default usa el objeto de data
  obj2arr(data = this.data) {
    if(!Array.isArray(data)){
      throw new Error("> The data provided is not an array");
    }
    var dataTable = [];
    for (var i = 0; i < data.length; i++) {
      var row = [];
      for (var j = 0; j < this.vars.length; j++) {
        row.push(data[i][this.vars[j]]);
      }
      dataTable.push(row);
    }
    this.dataTable = dataTable;
    return dataTable
  }

  // toma la tabla y la convierte en un objeto usando las vars como keys. Por default usa la tabla de dataTable (devuelve tn this.data o this.dataInyected)
  arr2obj(dataTable = this.sheetData) {
    if(!Array.isArray(dataTable)){
      throw new Error("> The dataTable provided is not an array");
    }
    var data = [];
    for (var i = 0; i < dataTable.length; i++) {
      var obj = {};
      for (var j = 0; j < this.vars.length; j++) {
        obj[this.vars[j]] = dataTable[i][j];
      }
      data.push(obj);
    }
    if(dataTable != this.sheetData){
      this.dataInyected = data
    }else{
      this.data = data;
    }
    return data
  }

  
  //Carga los datos de la hoja de calculos en la clase completa this.sheetData y this.data
  loadData() {
    console.log("# Cargando datos de hoja: " + this.sheet.getSheetName())
    this.sheetRange = this.sheet.getRange(this.firstDataRow,1,this.sheet.getLastRow()-this.firstDataRow+1,this.sheet.getLastColumn());
    this.sheetData = this.sheetRange.getValues()
    this.regenData()
  }


  //Recibe un item del tipo de la tabla, si le pasa un ID entonces asigna ese objeto a ese ID sino, busca el ID en el obj en la propiedad obj.id
  updateObject(obj, id = null) {
    const searchId = id || obj.id;
    console.log(searchId)
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].id === searchId) {
        Object.assign(this.data[i],obj)
      }
    }
  }

  
  // dado un objeto compatible reemplaza todos los datos de la hoja de calculos por los nuevos
  save(dataObject = this.data , append = false) {
    if(dataObject.length==0){
      console.warn("METODO SAVE LLAMADO CON ARRAY VACIO")
      return
    }
    //console.log("# Guardando datos en hoja: " + this.sheet.getSheetName() + ". Actualmente hay " + this.sheetData.length + " items" )
    if (append){
      var range = this.getDataRange(dataObject,append)
    }else{
      var range = this.getDataRange(dataObject)
      this.sheetRange.clearContent()
    }
    range.setValues(this.obj2arr(dataObject))
    //console.log("- Total de datos guardados: " + dataObject.length)
    this.loadData()
  }

  //recibe un id o un row para actualizar en la hoja de calculo
  saveRow(data) {
    let id, row;
    if (typeof data === "string" || typeof data === "number") {
        id = data;
        row = this.data.find(d => d.id === id);
        if (!row) {
            throw new Error(`> No data found with id ${id}`);
        }
    } else {
        row = data;
        if (!row.hasOwnProperty("id")) {
            throw new Error(`> The provided data doesn't have an id`);
        }
        id = row.id;
    }

    // Find the row number in the sheet that matches the id
    let rowNum = this.sheetData.findIndex(sheetRow => sheetRow[1] === id) + this.firstDataRow;
    if (rowNum === -1) {
        throw new Error(`> No data found with id ${id} in sheet`);
    }

    // Update the sheet with the new data
    let range = this.sheet.getRange(rowNum, 1, 1, this.sheet.getLastColumn());
    range.setValues([Object.values(row)])
  }

  //#############################

  // arama los vars del sheet
  loadVars() {
    var variables = this.sheet.getDataRange().getValues()[0];
    this.vars = variables
    return variables;
  }
  
  //arma los datos persistentes del sheet segun hoja de calculo
  loadOpc() {
    var row = this.sheet.getDataRange().getValues()[1]
    this.opc = row.map((item,index)=>{
      try {
        if (item==""){
          this.sheet.getRange(2,index+1).setValue(SheetWrapper.opcBaseFormat())
          return JSON.parse(SheetWrapper.opcBaseFormat())
        }
        return JSON.parse(item)
      } catch (e) {
        return console.log(e);
      }
    })
    return this.opc;
  }

  getPersistentData(key) {
    return this.opc[this.vars.indexOf(key)]
  }

  setPersistentData(key, value = {}) {
    this.opc[this.vars.indexOf(key)] = value
  }

  //guarda los datos persistentes del sheet
  savePersistentData() {
    var toSave = this.opc.map((item)=>{
      try {
        return JSON.stringify(item)
      } catch (e) {
        return console.log(e);
      }
    })
    this.sheet.getRange(2,1,1,this.opc.length).setValue(toSave);
  }
  
  loadTitles() {
    var titles = this.sheet.getDataRange().getValues()[2];
    this.titles = titles
    return titles;
  }


}
